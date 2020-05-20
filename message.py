class Message:
    def __init__(self, msg, author, recipient):
        self.msg = msg
        self.author = author
        self.recipient = recipient

    def __str__(self):
        return f'{self.author} -> {self.recipient}: {self.msg}'


class MessageHistory:
    history = []

    def add_message(self, message: Message):
        self.history.append(message)
