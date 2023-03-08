const timekeeper = require('timekeeper')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { ServiceBroker } = require('moleculer')
const { v4: uuid } = require('uuid')

const Db = require('../../../../lib/Db')
const ChatsService = require('../../chats.service')

describe('Integrations test to chats service', () => {
  let mongod = null
  const boardId = uuid()
  const contactId = uuid()
  const broker = new ServiceBroker({ logger: false })

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await Db.connect({ uri: mongod.getUri() })
    broker.createService(ChatsService)
    await broker.start()
  })

  describe('Test chats.addMessage action', () => {
    const messageData = {
      chatId: null,
      content: null,
      sender: {
        id: contactId,
        category: 'contact'
      }
    }

    it('Should create a settings chat configuration', async () => {
      const chatSettings = await broker.call('chats.addChatSettings', {
        boardId
      })

      expect(chatSettings.id).toBeTruthy()
    })

    it('Should update the chats settings with some office hours', async () => {
      const chatSettings = await broker.call('chats.updateChatSettings', {
        boardId,
        color: '#000000',
        margin: {
          bottom: 20,
          right: 20
        },
        enabled: false,
        notifications: false,
        officeHours: {
          ranges: [
            {
              days: 'all',
              from: '08:00:00',
              to: '12:00:00'
            },
            {
              days: 'weekdays',
              from: '14:00:00',
              to: '16:00:00'
            },
            {
              days: 'weekends',
              from: '14:00:00',
              to: '16:00:00'
            },
            {
              days: 'monday',
              from: '18:00:00',
              to: '22:00:00'
            }
          ],
          offlineMessage: 'no-message'
        }
      })

      expect(chatSettings.id).toBeTruthy()
    })

    it('Should create a new chat', async () => {
      const chat = await broker.call('chats.addChat', {
        boardId
      })

      expect(chat.id).toBeTruthy()

      messageData.chatId = chat.id
    })

    describe('Test message creation in office hours ranges', () => {
      it('Should create a new message in "all" office hour range', async () => {
        timekeeper.freeze(new Date('2022-08-01T10:00:00.000-05:00'))

        const message = await broker.call('chats.addMessage', {
          ...messageData,
          content: 'All range'
        })

        expect(message.id).toBeTruthy()
      })

      it('Should create a new message in "weekdays" office hour range', async () => {
        timekeeper.freeze(new Date('2022-08-02T15:00:00.000-05:00'))

        const message = await broker.call('chats.addMessage', {
          ...messageData,
          content: 'Weekdays range'
        })

        expect(message.id).toBeTruthy()
      })

      it('Should create a new message in "weekends" office hour range', async () => {
        timekeeper.freeze(new Date('2022-08-06T15:00:00.000-05:00'))

        const message = await broker.call('chats.addMessage', {
          ...messageData,
          content: 'Weekends range'
        })

        expect(message.id).toBeTruthy()
      })

      it('Should create a new message in "monday" office hour range', async () => {
        timekeeper.freeze(new Date('2022-08-01T20:00:00.000-05:00'))

        const message = await broker.call('chats.addMessage', {
          ...messageData,
          content: 'Monday range'
        })

        expect(message.id).toBeTruthy()
      })
    })

    describe('Test message creation out of office hours ranges', () => {
      it('Should create a new message out of any office hour range', async () => {
        timekeeper.freeze(new Date('2022-08-02T22:00:00.000-05:00'))

        const message = await broker.call('chats.addMessage', {
          ...messageData,
          content: 'Out of range'
        })

        expect(message.id).toBeTruthy()
      })
    })

    it('Should verify if all messages were created', async () => {
      const messages = await broker.call('chats.getMessagesByChatId', {
        chatId: messageData.chatId
      })

      expect(Array.isArray(messages)).toBeTruthy()
      const qtyMessages = messages.reduce(
        (c, message) => {
          if (message.sender.category === 'contact') {
            return { ...c, contact: c.contact + 1 }
          } else if (message.sender.category === 'bot') {
            return { ...c, bot: c.bot + 1 }
          }
          return c
        },
        { contact: 0, bot: 0 }
      )
      expect(qtyMessages.contact).toBe(5)
      expect(qtyMessages.bot).toBe(1)

      timekeeper.reset()
    })
  })

  describe('Test chats.getMessagesByChatId action', () => {
    const messageData = {
      chatId: null,
      content: null,
      sender: {
        id: contactId,
        category: 'contact'
      }
    }

    it('Should create a new chat', async () => {
      const chat = await broker.call('chats.addChat', {
        boardId
      })

      expect(chat.id).toBeTruthy()

      messageData.chatId = chat.id
    })

    it('Should create dummy messages to the created chat', async () => {
      for (let i = 0; i < 5; i++) {
        const message = await broker.call('chats.addMessage', {
          ...messageData,
          content: `Test ${i}`
        })

        expect(message.id).toBeTruthy()
      }
    })

    it('Should return the chat messages', async () => {
      const messages = await broker.call('chats.getMessagesByChatId', {
        chatId: messageData.chatId
      })

      expect(Array.isArray(messages)).toBeTruthy()
    })
  })

  describe('Test chats.getMessageById action', () => {
    const messageData = {
      chatId: null,
      content: 'Test message',
      sender: {
        id: contactId,
        category: 'contact'
      }
    }

    it('Should create a new chat', async () => {
      const chat = await broker.call('chats.addChat', {
        boardId
      })

      expect(chat.id).toBeTruthy()

      messageData.chatId = chat.id
    })

    it('Should create a new contact message', async () => {
      const message = await broker.call('chats.addMessage', messageData)

      expect(message.id).toBeTruthy()

      messageData.id = message.id
    })

    it('Should return the created contact message', async () => {
      const message = await broker.call('chats.getMessageById', {
        id: messageData.id
      })

      expect(message.id).toBeTruthy()
    })
  })
})
