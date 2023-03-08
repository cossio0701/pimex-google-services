const Basic = require('../../../lib/basic')
const model = require('../models/connection.model')

const collection = 'connections'
module.exports = class Connection extends Basic {
  static collection = collection
  static model = model

  constructor (id) {
    super({
      id,
      collection
    })
  }
}
