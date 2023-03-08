const Settings = require('../lib/Settings')

module.exports = {
  getChatSettings: {
    rest: 'GET /settings/:boardId',
    async handler ({ params }) {
      return await this.getChatSettings(params.boardId)
    }
  },
  addChatSettings: {
    rest: 'POST /settings/:boardId',
    async handler ({ params }) {
      return await Settings.add({ boardId: params.boardId })
    }
  },
  updateChatSettings: {
    rest: 'PUT /settings/:boardId',
    async handler ({ params }) {
      const { boardId, ...settingsData } = params
      const chatSettings = await this.getChatSettings(boardId)
      return await new Settings({ id: chatSettings.id }).update(settingsData)
    }
  }
}
