const { Schema, model } = require('mongoose')

const schema = new Schema(
  {
    boardId: {
      type: String,
      required: true
    },
    alias: {
      type: String,
      required: true
    },
    userInfo: {
      type: {
        name: {
          type: String,
          default: null
        },
        profileImage: {
          type: String,
          default: null
        },
        _id: false
      }
    },
    contactInfo: {
      type: {
        id: {
          type: String,
          required: true
        },
        leadId: {
          type: String,
          default: null
        },
        profileImage: {
          type: String,
          default: null
        },
        location: {
          type: String,
          default: null
        },
        _id: false
      },
      required: true
    },
    icon: {
      type: {
        color: {
          type: String,
          required: true
        },
        value: {
          type: String,
          required: true
        },
        _id: false
      },
      required: true
    },
    lastMessages: {
      type: {
        preview: {
          type: String,
          default: 'Preview de prueba'
        },
        count: {
          type: Number,
          default: 0
        },
        _id: false
      }
    },
    archived: {
      type: Boolean,
      default: false
    },
    submitedForm: {
      type: Boolean,
      default: false
    },
    origin: {
      type: String,
      enum: ['Pimex', 'Facebook'],
      default: 'Pimex'
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

module.exports = model('Chats', schema, 'chats')
