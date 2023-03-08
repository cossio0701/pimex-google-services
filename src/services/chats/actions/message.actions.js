const Message = require('../lib/Message')
const Chat = require('../lib/Chat')

module.exports = {
  getMessagesByChatId: {
    rest: 'GET /messages/chats/:chatId',
    async handler ({ params }) {
      const { chatId } = params
      return await Message.getAll({
        query: {
          chatId
        },
        params: {
          order: 'asc'
        }
      })
    }
  },
  getMessageById: {
    rest: 'GET /messages/:id',
    async handler ({ params }) {
      const { id } = params
      return await new Message({ id }).get({ required: true })
    }
  },
  addMessage: {
    rest: 'POST /messages',
    async handler ({ params }) {
      const { chatId, content, sender } = params
      const message = await this.addMessage({ chatId, content, sender })

      const chat = await new Chat({ id: chatId }).get({ required: true })

      this.broker.emit('chats.messages.created', {
        id: message.id,
        boardId: chat.boardId
      })

      return message
    }
  }
}
