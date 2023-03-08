const Hocket = require('hooket-cli')
const Chat = require('../lib/Chat')

const hooket = new Hocket({ url: 'https://socket.pimex.services' })

module.exports = {
  'chats.created': {
    async handler (ctx) {
      const { params } = ctx
      hooket.emit('chats.created', params)
    }
  },
  'chats.updated': {
    async handler (ctx) {
      const { params } = ctx
      const chat = await new Chat({ id: params.chatId }).get({ required: true })
      hooket.emit('chats.updated', { id: params.chatId, boardId: chat.boardId })
    }
  }
}
