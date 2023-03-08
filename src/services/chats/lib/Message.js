const { Types } = require('mongoose')
const Basic = require('../../../lib/basic')
const Model = require('../models/message.model')
const { badRequest } = require('@hapi/boom')

class Message extends Basic {
  constructor ({ id, sub } = {}) {
    const _id = /^[0-9a-fA-F]{24}$/.test(id) ? Types.ObjectId(id) : null

    const $or = []

    if (_id) $or.push({ _id })
    if (sub) $or.push({ sub })

    if (!$or.length) throw badRequest('Invalid Message Id')

    super({
      name: 'Message',
      query: {
        $or
      },
      model: Model
    })

    this._id = _id
  }
}

Message.model = Model

module.exports = Message
