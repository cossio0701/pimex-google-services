module.exports = {
  ...require('./drive.methods'),
  ...require('./calendar.methods'),
  async invoke (name, ...params) {
    return await this[name](...params)
  }
}
