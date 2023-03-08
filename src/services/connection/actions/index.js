const Boom = require('@hapi/boom')

module.exports = {
  getPrivateBoardConnection: {
    async handler ({ params: { id, app } }) {
      return await this.getConnection({ id, app })
    }
  },
  setPrivateBoardConnection: {
    async handler ({ params: { board, app, options } }) {
      return await this.setConnection({ board, app, options })
    }
  },
  deletePrivateBoardConnection: {
    async handler ({ params: { id } }) {
      return await this.disconnect({ id })
    }
  },
  getBoardConnection: {
    rest: 'GET /board/:id',
    async handler ({ params: { id, app } }) {
      const connection = await this.getConnection({ id, app })
      delete connection?.options?.refreshToken
      return connection
    }
  },
  connectBoard: {
    rest: 'POST /board/:id',
    async handler ({
      params: {
        id,
        body: { app, options }
      }
    }) {
      const connection = await this.broker.call(`${app}.connect`, {
        board: id,
        app,
        options
      })
      delete connection.options?.refreshToken
      return connection
    }
  },
  updateBoardConnection: {
    rest: 'PUT /:id',
    async handler ({ params: { id, body } }) {
      if (!body.options) {
        throw Boom.badRequest("Error: object 'options' was not found")
      }
      return await this.updateConnection({
        id,
        data: body.options,
        field: 'options'
      })
    }
  },
  disconnectBoard: {
    rest: 'DELETE /:id',
    async handler ({
      params: {
        id,
        body: { board, app }
      }
    }) {
      return await this.broker.call(`${app}.disconnect`, {
        connectionId: id,
        board,
        app
      })
    }
  }
}
