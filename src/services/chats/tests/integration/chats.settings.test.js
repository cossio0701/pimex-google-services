const { MongoMemoryServer } = require('mongodb-memory-server')
const { ServiceBroker } = require('moleculer')
const { v4: uuid } = require('uuid')

const Db = require('../../../../lib/Db')
const ChatsService = require('../../chats.service')

describe('Integrations test to chats service', () => {
  let mongod = null
  const broker = new ServiceBroker({ logger: false })
  const boardId = uuid()

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await Db.connect({ uri: mongod.getUri() })
    broker.createService(ChatsService)
    await broker.start()
  })

  describe('Test chats.addChatSettings action', () => {
    it('Should create a new chat settings object', async () => {
      const chatSettings = await broker.call('chats.addChatSettings', {
        boardId
      })

      expect(chatSettings.id).toBeTruthy()
    })

    it('Should verify if the chat settings object was created', async () => {
      const chatSettings = await broker.call('chats.getChatSettings', {
        boardId
      })

      expect(chatSettings.id).toBeTruthy()
    })
  })

  describe('Test chats.getChatSettings action', () => {
    it('Should return the chat settings object previously created', async () => {
      const chatSettings = await broker.call('chats.getChatSettings', {
        boardId
      })

      expect(chatSettings.id).toBeTruthy()
    })
  })

  describe('Test chats.updateChatSettings action', () => {
    const chatSettingsData = {
      boardId,
      color: '#000000',
      margin: {
        bottom: 40,
        right: 20
      },
      enabled: true,
      notifications: false,
      officeHours: {
        ranges: [
          {
            days: 'weekends',
            from: '10:00:00',
            to: '14:00:00'
          },
          {
            days: 'weekdays',
            from: '08:00:00',
            to: '18:00:00'
          }
        ],
        offlineMessage: 'no-message'
      }
    }

    it('Should return the updated chat settings object', async () => {
      const chatSettings = await broker.call(
        'chats.updateChatSettings',
        chatSettingsData
      )

      expect(chatSettings.id).toBeTruthy()
    })

    it('Should return the updated chat object', async () => {
      const chatSettings = await broker.call('chats.getChatSettings', {
        boardId
      })

      expect(chatSettings.id).toBeTruthy()
      expect(chatSettings).toEqual({
        _id: chatSettings._id,
        id: chatSettings.id,
        created: chatSettings.created,
        updated: chatSettings.updated,
        boardId: chatSettingsData.boardId,
        ...chatSettingsData
      })
    })
  })
})
