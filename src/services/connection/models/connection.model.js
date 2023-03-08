const Ajv = require('ajv')
const ajv = new Ajv()

const schema = {
  type: 'object',
  properties: {
    _created: {
      type: 'number'
    },
    app: {
      type: 'string'
    },
    board: {
      type: 'number'
    },
    options: {
      type: 'object'
    }
  },
  required: ['_created', 'app', 'board']
}

const validate = ajv.compile(schema)

module.exports = validate
