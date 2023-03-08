module.exports = {
  ...require('./message.methods'),
  ...require('./settings.methods'),
  ...require('./chats.methods'),
  async invoke (name, ...params) {
    return await this[name](...params)
  }
}
