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

  describe('Test chats.addChat action', () => {
    let chatId = null

    it('Should create a new chat object', async () => {
      const chat = await broker.call('chats.addChat', {
        boardId
      })

      expect(chat.id).toBeTruthy()

      chatId = chat.id
    })

    it('Should verify if the chat was created', async () => {
      const chat = await broker.call('chats.getChatById', {
        id: chatId
      })

      expect(chat.id).toEqual(chatId)
    })
  })

  describe('Test chats.getChatById action', () => {
    let chatId = null

    it('Should create a chat to be returned', async () => {
      const chat = await broker.call('chats.addChat', {
        boardId
      })

      expect(chat.id).toBeTruthy()

      chatId = chat.id
    })

    it('Should return the created chat object', async () => {
      const chat = await broker.call('chats.getChatById', {
        id: chatId
      })

      expect(chat.id).toBeTruthy()
      expect(chat.id).toEqual(chatId)
    })
  })

  describe('Test chats.getChatsByBoardId action', () => {
    it('Should create 5 dummy chats', async () => {
      for (let i = 0; i < 5; i++) {
        const chat = await broker.call('chats.addChat', {
          boardId
        })

        expect(chat.id).toBeTruthy()
      }
    })

    it('Should return an array with a list of chat objects', async () => {
      const chats = await broker.call('chats.getChatsByBoardId', {
        id: boardId
      })

      expect(Array.isArray(chats)).toBeTruthy()
    })
  })

  describe('Test chats.updateChat action', () => {
    let chatId = null
    const chatDataToUpdate = {
      boardId: uuid(),
      alias: 'May Kap',
      userInfo: {
        name: 'Joe Doe',
        profileImage: 'https://example.com/static.png'
      },
      contactInfo: {
        id: uuid(),
        leadId: uuid(),
        profileImage: 'https://example.com/static.png',
        location: 'Atlantida'
      },
      icon: {
        color: '#000000',
        value: 'kitty'
      },
      lastMessages: {
        preview: 'message-preview',
        count: 5
      },
      archived: true,
      submitedForm: true
    }

    it('Should create a chat to be updated', async () => {
      const chat = await broker.call('chats.addChat', {
        boardId
      })

      expect(chat.id).toBeTruthy()

      chatId = chat.id
    })

    it('Should update the created chat object', async () => {
      const chat = await broker.call('chats.updateChat', {
        id: chatId,
        ...chatDataToUpdate
      })

      expect(chat.id).toBeTruthy()
    })

    it('Should return the updated chat object ', async () => {
      const updatedChat = await broker.call('chats.getChatById', {
        id: chatId
      })

      expect(updatedChat).toEqual({
        _id: updatedChat._id,
        id: updatedChat.id,
        created: updatedChat.created,
        updated: updatedChat.updated,
        origin: updatedChat.origin,
        ...chatDataToUpdate
      })
    })
  })
})
