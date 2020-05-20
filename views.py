import aiohttp
import aiohttp_jinja2
from aiohttp import web
from faker import Faker

from message import MessageHistory, Message

message_history = MessageHistory()


def get_random_name():
    name = Faker().name()
    return name


def create_message(msg, author, recipient):
    message = Message(msg, author, recipient)
    return message


def append_message(history: MessageHistory, message: Message):
    history.add_message(message)


async def index(request):
    ws_current = web.WebSocketResponse()
    ws_ready = ws_current.can_prepare(request)

    if not ws_ready.ok:
        return aiohttp_jinja2.render_template('index.html', request, {})

    # start
    name = get_random_name()
    await start(request, ws_current, name)

    # chat
    await chat(request, ws_current)

    # end
    await end(request, name)

    return ws_current


async def start(request, ws_current, name):
    await ws_current.prepare(request)

    await ws_current.send_json({'action': 'connect', 'name': name,
                                'other_names': ','.join(request.app['websockets'].keys())})

    for ws in request.app['websockets'].values():
        await ws.send_json({'action': 'join', 'name': name})

    request.app['websockets'][name] = ws_current


async def chat(request, ws_current):
    while True:
        msg = await ws_current.receive()

        if msg.type == aiohttp.WSMsgType.text:

            text, other = msg.data.split("&")
            from_name, to_name = other.split("@")
            append_message(message_history, create_message(text, from_name, to_name))
            for username, ws in request.app['websockets'].items():
                if username == to_name:
                    await ws.send_json(
                        {'action': 'sent', 'name': from_name, 'text': text, 'to_name': to_name})
        else:
            break


async def end(request, name):
    del request.app['websockets'][name]

    for ws in request.app['websockets'].values():
        await ws.send_json({'action': 'disconnect', 'name': name})
