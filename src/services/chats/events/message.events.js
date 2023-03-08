const Hocket = require('hooket-cli')
const Utils = require('../lib/Utils')
const Message = require('../lib/Message')

const hooket = new Hocket({ url: 'https://socket.pimex.services' })

module.exports = {
  'chats.messages.created': {
    async handler (ctx) {
      const { params } = ctx
      const { id, boardId } = params

      const message = await new Message({ id }).get({ required: true })

      if (message.sender.category === 'contact') {
        const chatSettings = await this.broker.call('chats.getChatSettings', {
          boardId
        })

        const sendBotMessage = Utils.checkDateInOfficeHours(
          chatSettings.officeHours.ranges
        )

        if (sendBotMessage) {
          try {
            await this.broker.call('chats.addMessage', {
              chatId: message.chatId,
              content: chatSettings.officeHours.offlineMessage,
              sender: {
                id: boardId,
                category: 'bot'
              }
            })
          } catch (error) {
            this.broker.logger.error(
              `Error sending bot message with chat id: ${message.chatId}`,
              error
            )
          }
        }
      }
      try {
        await hooket.emit('chats.messages.created', {
          id,
          boardId,
          senderId: message.sender.id,
          chatId: message.chatId
        })
      } catch (error) {
        this.broker.logger.error(
          `Error sending message on hooket with chat id: ${message.chatId}`,
          error
        )
      }
    }
  }
}
