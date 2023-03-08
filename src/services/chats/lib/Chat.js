const Basic = require('../../../lib/basic')
const model = require('../models/chat.model')

class Chat extends Basic {
  static model = model

  constructor ({ id }) {
    super({
      collection: 'chats',
      connId: id
    })
  }
}

module.exports = Chat
