const { Schema, model } = require('mongoose')

const schema = new Schema(
  {
    chatId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    sender: {
      type: {
        id: {
          type: String,
          required: true
        },
        category: {
          type: String,
          enum: ['user', 'bot', 'contact'],
          required: true
        }
      },
      _id: false
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

module.exports = model('Messages', schema, 'messages')
