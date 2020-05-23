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

    await ws_current.send_json({'type': 'open', 'all_clients': ';'.join(list(request.app['websockets'].keys()))})

    request.app['websockets'][data['name']] = ws_current


async def send_message(data, request, message_history):
    append_message(message_history, create_message(data['text'], data['author'], data['recipient']))

    for username, ws in request.app['websockets'].items():
        send = {}
        if data['recipient'] == 'All':
            send = {'type': 'send_message', 'text': data['text'], 'all_recipients': True,
                    'author': data['author']}

        elif username == data['recipient'] or username == data['author']:
            send = {'type': 'send_message', 'text': data['text'], 'recipient': data['recipient'],
                    'author': data['author'], 'all_recipients': False}

        if send:
            await ws.send_json(send)


async def disconnect(request, ws_current):
    current_name = None
    for name, socket in request.app['websockets'].items():
        if socket == ws_current:
            current_name = name
            del request.app['websockets'][name]
            break

    for ws in request.app['websockets'].values():
        await ws.send_json({'type': 'disconnect', 'name': current_name})
