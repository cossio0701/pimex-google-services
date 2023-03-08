const Ajv = require('ajv')
const ajv = new Ajv()

const schema = {
  type: 'object',
  properties: {
    _created: {
      type: 'number'
    },
    _updated: {
      type: 'number'
    },
    id: {
      type: 'string'
    },
    calendarId: {
      type: 'string'
    },
    board: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      }
    },
    formFields: {
      type: 'object',
      properties: {
        custom: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: {
                type: 'string'
              },
              required: {
                type: 'boolean'
              },
              type: {
                type: 'string'
              },
              value: {
                type: 'string'
              }
            }
          }
        },
        mandatory: {
          type: 'object',
          properties: {
            label: {
              type: 'string'
            },
            required: {
              type: 'boolean'
            },
            type: {
              type: 'string'
            },
            value: {
              type: 'string'
            }
          }
        }
      }
    },
    googleMeet: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        url: {
          type: 'string'
        }
      }
    },
    leadId: {
      type: 'string'
    },
    selectedDate: {
      type: 'object',
      properties: {
        end: {
          type: 'string'
        },
        start: {
          type: 'string'
        }
      }
    },
    status: {
      type: 'string',
      enum: ['scheduled', 'confirmed', 'cancelled', 'rescheduled']
    }
  }
}

const validate = ajv.compile(schema)

module.exports = validate
