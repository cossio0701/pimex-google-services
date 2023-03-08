const { v4: uuid } = require('uuid')

module.exports = {
  name: 'auth',
  actions: {
    addAccount: jest.fn(),
    getAccountById: jest.fn(({ params }) => {
      return {
        _id: uuid()
      }
    }),
    createAccountToken: jest.fn()
  },
  methods: {},
  events: {}
}
