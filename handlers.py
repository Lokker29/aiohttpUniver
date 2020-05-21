from message import Message, MessageHistory


def create_message(msg, author, recipient):
    message = Message(msg, author, recipient)
    return message


def append_message(history: MessageHistory, message: Message):
    history.add_message(message)


async def connect(data, request, ws_current):
    for username, ws in request.app['websockets'].items():
        if username != ws_current:
            await ws.send_json(data)

    del request.app['websockets'][ws_current]

    await ws_current.send_json({'type': 'open', 'all_clients': list(request.app['websockets'].values())})

    request.app['websockets'][data['name']] = ws_current


async def send_message(data, request, message_history):
    append_message(message_history, create_message(data['text'], data['author'], data['recipient']))

    for username, ws in request.app['websockets'].items():
        if data['recipient'] == '__all__':
            if username != data['author']:
                await ws.send_json({'type': 'send_message', 'text': data['text'],
                                    'author': data['author'], '__all__': True})
        elif username == data['recipient']:
            await ws.send_json({'type': 'send_message', 'text': data['text'],
                                'author': data['author'], '__all__': True})


async def disconnect(request, ws_current):
    current_name = None
    for name, socket in request.app['websockets'].items():
        if socket == ws_current:
            current_name = name
            del request.app['websockets'][name]
            break

    for ws in request.app['websockets'].values():
        await ws.send_json({'type': 'disconnect', 'name': current_name})
