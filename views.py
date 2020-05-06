import logging

import aiohttp
import aiohttp_jinja2
from aiohttp import web
from faker import Faker

log = logging.getLogger(__name__)


def get_random_name():
    fake = Faker()
    return fake.name()


async def index(request):
    ws_current = web.WebSocketResponse()
    ws_ready = ws_current.can_prepare(request)

    if not ws_ready.ok:
        return aiohttp_jinja2.render_template('index.html', request, {})

    # start
    await ws_current.prepare(request)

    name = get_random_name()
    log.info(f'{name} joined.')

    await ws_current.send_json({'action': 'connect', 'name': name,
                                'other_names': ','.join(request.app['websockets'].keys())})

    for ws in request.app['websockets'].values():
        await ws.send_json({'action': 'join', 'name': name})

    request.app['websockets'][name] = ws_current

    # chat
    while True:
        msg = await ws_current.receive()

        if msg.type == aiohttp.WSMsgType.text:

            text, other = msg.data.split("&")
            from_name, to_name = other.split("@")

            for username, ws in request.app['websockets'].items():
                if username == to_name:
                    await ws.send_json(
                        {'action': 'sent', 'name': from_name, 'text': text, 'to_name': to_name})
        else:
            break

    # end
    del request.app['websockets'][name]
    log.info(f'{name} disconnected.')

    for ws in request.app['websockets'].values():
        await ws.send_json({'action': 'disconnect', 'name': name})

    return ws_current
