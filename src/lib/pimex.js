const axios = require('axios')
const { PIMEX_API_URL, PIMEX_API_TOKEN, PIMEX_EMAIL_API_URL } = process.env

module.exports = {
  lead: {
    async get ({ id }) {
      return (await axios.get(`${PIMEX_API_URL}/conversions/${id}`)).data.data
    },
    async create ({ body }) {
      return (await axios.post(`${PIMEX_API_URL}/conversions/`, body)).data.data
    },
    async createTask ({ leadId, body }) {
      try {
        return (
          await axios.post(
            `${PIMEX_API_URL}/conversions/${leadId}/tasks`,
            body,
            { headers: { Authorization: `Bearer ${PIMEX_API_TOKEN}` } }
          )
        ).data.data
      } catch (e) {}
    }
  },
  email: {
    async send ({ body }) {
      try {
        return (await axios.post(`${PIMEX_EMAIL_API_URL}/messages`, body)).data
          .data
      } catch (e) {}
    }
  }
}
