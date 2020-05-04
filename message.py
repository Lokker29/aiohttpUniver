class MessageHistory:
    history = []

    async def add_msg(self, msg, name_from, name_to, date):
        await self.history.append({
            'message': msg,
            'name_from': name_from,
            'name_to': name_to,
            'date': date
        })
