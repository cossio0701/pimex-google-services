const Message = require('../lib/Message')

module.exports = {
  async addMessage (data) {
    const message = await Message.add(data)

    if (message.sender.category !== 'bot') {
      await this.broker.call('chats.updateChat', {
        id: message.chatId,
        $set: { 'lastMessages.preview': message.content },
        $inc: { 'lastMessages.count': 1 }
      })
    }

    return message
  }
}
