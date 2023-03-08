const Boom = require('@hapi/boom')
const Calendar = require('../lib/BasicCalendar')

module.exports = {
  'calendar.connect': {
    async handler ({
      params: {
        board,
        app,
        options: { code, ...options }
      }
    }) {
      if (!code) {
        throw Boom.badRequest('Auth code is required')
      }

      const refreshToken = await this.invoke('calendar.getRefreshToken', {
        code
      })

      return await this.broker.call('connection.setPrivateBoardConnection', {
        board,
        app,
        options: {
          ...options,
          refreshToken
        }
      })
    }
  },
  'calendar.disconnect': {
    async handler ({ params: { connectionId, board, app } }) {
      try {
        await this.invoke('calendar.revokeRefreshToken', { board, app })
      } catch (_) {}
      return await this.broker.call('connection.deletePrivateBoardConnection', {
        id: connectionId
      })
    }
  },
  'calendar.get': {
    rest: 'GET /calendar/:id',
    async handler ({ params: { id } }) {
      return await new Calendar({ id }).get()
    }
  },
  'calendar.list': {
    rest: 'GET /calendar',
    async handler ({ params: { boardId } }) {
      if (!boardId) {
        throw Boom.badRequest('Board id is required')
      }

      return await Calendar.getAll({
        query: [{ key: 'board.id', value: boardId }]
      })
    }
  },
  'calendar.create': {
    rest: 'POST /calendar',
    async handler ({ params: { body } }) {
      return await Calendar.add(body)
    }
  },
  'calendar.update': {
    rest: 'PUT /calendar/:id',
    async handler ({ params: { id, body } }) {
      return await new Calendar({ id }).update(body)
    }
  },
  'calendar.field.update': {
    rest: 'PATCH /calendar/:id',
    async handler ({ params: { id, body } }) {
      const { field, value } = body
      return await new Calendar({ id }).updateField({ field, value })
    }
  },
  'calendar.delete': {
    rest: 'DELETE /calendar/:id',
    async handler ({ params: { id } }) {
      return await new Calendar({ id }).delete()
    }
  },
  ...require('./calendar.meeting.actions')
}
