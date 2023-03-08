const Boom = require('@hapi/boom')
const FirebaseConnection = require('./Db')

/**
 * [Basic Class]
 * @description The instans from this Class return all methods from Basic
 * Manage all Basic methos, this require Mongo Model pre defined and one Mongo connection success
 * @param {String} id - Basic firebase object id
 * @retun Basic Object intance
 */

class Basic {
  constructor ({ id = null, collection } = {}) {
    if (!id) throw Boom.badRequest('Document id is required')
    if (!collection) throw Boom.badRequest('Collection is required')

    this.id = id
    this.collection = collection
  }

  /**
   * @description [Add new Basic]
   * @param collection
   * @param {Object} data - Object data with new Basic data
   */

  static async add (data = null) {
    if (!data) {
      throw Boom.badRequest('Bad request')
    }

    const ref = FirebaseConnection.loadCollection(this.collection)

    const basicData = {
      ...data,
      _created: new Date().getTime(),
      _updated: new Date().getTime()
    }

    const basic = await ref.add(basicData)

    return { ...basicData, id: basic.id }
  }

  async get ({ required = true } = {}) {
    const ref = FirebaseConnection.loadCollection(this.collection).doc(this.id)

    const basicData = (await ref.get()).data()

    if (required && !basicData) {
      throw Boom.notFound('Data not found')
    }

    return basicData
  }

  static async getAll ({ query = [], params = {} } = {}) {
    const ref = FirebaseConnection.loadCollection(this.collection)

    const { orderBy, order = 'desc', limit, required = true } = params

    const request = query.reduce(
      (prev, actual) => prev.where(actual.key, '==', actual.value),
      ref
    )

    if (orderBy) {
      request.orderBy(orderBy, order)
    }

    if (limit) {
      request.limit(limit)
    }

    const data = []

    ;(await request.get()).forEach(ref =>
      data.push({
        id: ref.id,
        ...ref.data()
      })
    )

    if (required && data.length === 0) {
      throw Boom.notFound('Data not found')
    }

    return data
  }

  async delete () {
    const ref = FirebaseConnection.loadCollection(this.collection).doc(this.id)
    return await ref.delete()
  }

  /**
   * [Update an basic]
   * @param {Object} data - Object with new data for basic
   */
  async update ({ id, ...data }) {
    const ref = FirebaseConnection.loadCollection(this.collection).doc(this.id)
    await ref.update({ ...data, _updated: new Date().getTime() })
    return await this.get()
  }

  /**
   * [Update field]
   * @param {String} field - The field to update
   * @param {Object} data - Object with new data for basic
   */
  async updateField ({ field, value }) {
    const ref = FirebaseConnection.loadCollection(this.collection).doc(this.id)
    return await ref.update({ [field]: value, _updated: new Date().getTime() })
  }
}

module.exports = Basic
