const { Schema, model } = require('mongoose')

const schema = new Schema(
  {
    boardId: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#134251'
    },
    margin: {
      type: {
        bottom: {
          type: Number
        },
        right: {
          type: Number
        },
        _id: false
      },
      default: {
        bottom: 20,
        right: 20
      }
    },
    enabled: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    officeHours: {
      type: {
        ranges: {
          type: [
            {
              days: { type: String },
              from: { type: String },
              to: { type: String },
              _id: false
            }
          ]
        },
        offlineMessage: {
          type: String
        },
        _id: false
      },
      default: {
        ranges: [],
        offlineMessage:
          'Estamos fuera de horario de oficina, déjanos tus datos para ponernos en contacto contigo.'
      }
    }
  },
  {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v
        ret._id = ret._id.toString()
        ret.id = ret._id.toString()
      }
    }
  }
)

module.exports = model('ChatsSettings', schema, 'chats.settings')
