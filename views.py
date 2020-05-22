import json

import aiohttp
import aiohttp_jinja2
from aiohttp import web, WSMsgType

from handlers import connect, send_message, disconnect
from message import MessageHistory

message_history = MessageHistory()


async def index(request):
    ws_current = web.WebSocketResponse()
    ws_ready = ws_current.can_prepare(request)

    if not ws_ready.ok:
        return aiohttp_jinja2.render_template('index.html', request, {})

    # start
    await start(request, ws_current)

    # chat
    await chat(request, ws_current)

    # end
    # await end(request, ws_current)

    return ws_current


async def start(request, ws_current):
    await ws_current.prepare(request)

    request.app['websockets'][ws_current] = ws_current


async def chat(request, ws_current):
    while True:
        msg = await ws_current.receive()

        if msg.type == WSMsgType.CLOSE:
            await disconnect(request, ws_current)
        elif msg.type == WSMsgType.TEXT:
            msg = msg.json()

            if msg['type'] == 'connect':
                await connect(msg, request, ws_current)
            elif msg['type'] == 'send_message':
                await send_message(msg, request, message_history)
            else:
                break
        else:
            break


async def end(request, ws_current):
    await disconnect(request, ws_current)
