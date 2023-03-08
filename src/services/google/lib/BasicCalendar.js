const Basic = require('../../../lib/basic')
const model = require('../models/calendar.model')

const collection = 'calendars'

module.exports = class Calendar extends Basic {
  static collection = collection
  static model = model

  constructor ({ id }) {
    super({
      id,
      collection
    })
  }
}
