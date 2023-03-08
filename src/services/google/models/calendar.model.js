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
    color: {
      type: 'string'
    },
    days: {
      type: 'object',
      properties: {
        friday: {
          type: 'boolean'
        },
        monday: {
          type: 'boolean'
        },
        saturday: {
          type: 'boolean'
        },
        sunday: {
          type: 'boolean'
        },
        thursday: {
          type: 'boolean'
        },
        tuesday: {
          type: 'boolean'
        },
        wednesday: {
          type: 'boolean'
        }
      }
    },
    description: {
      type: 'string'
    },
    duration: {
      type: 'object',
      properties: {
        time: {
          type: 'string'
        },
        type: {
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
    hours: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from: {
            type: 'string'
          },
          to: {
            type: 'string'
          }
        }
      }
    },
    image: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        url: {
          type: 'string'
        }
      }
    },
    months: {
      type: 'object',
      properties: {
        from: {
          type: 'string'
        },
        to: {
          type: 'string'
        }
      }
    },
    owner: {
      type: 'object',
      properties: {
        email: {
          type: 'string'
        },
        image: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      }
    },
    responseTemplates: {
      type: 'object',
      properties: {
        cancelled: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            }
          }
        },
        rescheduled: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            }
          }
        },
        scheduled: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            }
          }
        },
        confirmed: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            }
          }
        }
      }
    },
    subtitle: {
      type: 'string'
    },
    title: {
      type: 'string'
    }
  }
}

const validate = ajv.compile(schema)

module.exports = validate
