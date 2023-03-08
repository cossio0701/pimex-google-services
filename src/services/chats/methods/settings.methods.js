const Settings = require('../lib/Settings')

module.exports = {
  async getChatSettings (boardId) {
    return (await Settings.getAll({ query: { boardId } }))[0]
  }
}
