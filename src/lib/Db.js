const admin = require('firebase-admin')

/**
 * Class representing a FirebaseConnection
 * @extends Connection
 */

module.exports = class FirebaseConnection {
  static connection = admin
  static isConnected = false
  static db = null

  /**
   * Connect to firebase
   * @param {object} serviceAccount - serviceAccount
   * @param {boolean} debug - debug
   * @param {object} settings - settings
   */
  static connect ({ serviceAccount, settings = {} }) {
    if (FirebaseConnection.isConnected) return FirebaseConnection.connection

    const connectSettings = {
      timestampsInSnapshots: true,
      ...settings
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })

    admin.firestore().settings(connectSettings)

    FirebaseConnection.isConnected = true
    FirebaseConnection.db = admin.firestore()

    return admin
  }

  /** Disconnect from firebase */
  static async disconnect () {
    await admin.app().delete()
    FirebaseConnection.connection = null
    FirebaseConnection.isConnected = false
    FirebaseConnection.db = null
    return true
  }

  static loadCollection (collection) {
    return FirebaseConnection.db.collection(collection)
  }
}
