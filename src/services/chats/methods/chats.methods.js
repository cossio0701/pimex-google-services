const Chat = require('../lib/Chat')
const Utils = require('../lib/Utils')

module.exports = {
  async 'chat.create' ({ boardId, location }) {
    const [icon, color] = [Utils.getRandomIcon(), Utils.getRandomColor()]

    const chat = await Chat.add({
      boardId,
      alias: `${icon.name} ${color.name}`,
      contactInfo: {
        id: Utils.getRandomId(),
        location
      },
      icon: {
        color: color.code,
        value: icon.icon
      },
      lastMessages: {
        preview: '¡Novum chat!'
      }
    })

    this.broker.emit('chat.created', {
      chatId: chat.id,
      boardId: chat.boardId
    })

    return chat
  },
  async 'chat.update' ({ id, ...chatData }) {
    const chat = await new Chat({ id }).update(chatData)

    this.broker.emit('chat.updated', {
      chatId: chat.id
    })

    return chat
  }
}
