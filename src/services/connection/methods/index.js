const Connection = require('../lib/Connection')

module.exports = {
  async getConnection ({ id, app }) {
    return (
      await Connection.getAll({
        required: true,
        query: [
          {
            key: 'board',
            value: id
          },
          {
            key: 'app',
            value: app
          }
        ]
      })
    )[0]
  },
  async setConnection (data) {
    return await Connection.add(data)
  },
  async updateConnection ({ id, data, field }) {
    const $Connection = new Connection(id)
    for (const key in data) {
      await $Connection.updateField({
        field: `${field}.${key}`,
        value: data[key]
      })
    }
    return await $Connection.get()
  },
  async disconnect ({ id }) {
    return await new Connection(id).delete()
  }
}
