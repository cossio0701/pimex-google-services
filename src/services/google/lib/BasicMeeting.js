const Basic = require('../../../lib/basic')
const model = require('../models/calendar.meeting.model')

const collection = 'meetings'

module.exports = class Meeting extends Basic {
  static collection = collection
  static model = model

  constructor ({ id }) {
    super({
      id,
      collection
    })
  }
}
