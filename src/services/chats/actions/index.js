const Chat = require('../lib/Chat')

module.exports = {
  'chat.connect': {
    async handler ({ params: { board, app, options } }) {
      return await this.broker.call('connection.setPrivateBoardConnection', {
        board,
        app,
        options
      })
    }
  },
  'chat.list': {
    rest: 'GET /:id',
    async handler ({ params: { id } }) {
      return await new Chat({ id }).get()
    }
  },
  'chat.board.list': {
    rest: 'GET /board/:id',
    async handler ({ params: { id } }) {
      return await Chat.getAll({
        query: [{ key: 'boardId', value: id }],
        params: {
          orderBy: 'updated'
        }
      })
    }
  },
  'chat.create': {
    rest: 'POST /',
    async handler ({ params: { body } }) {
      const { boardId, location = null } = body
      return await this.invoke('chat.create', { boardId, location })
    }
  },
  'chat.update': {
    rest: 'PUT /:id',
    async handler ({ params: { body } }) {
      return await this.invoke('chat.update', body)
    }
  },
  ...require('./message.actions'),
  ...require('./settings.actions')
}
