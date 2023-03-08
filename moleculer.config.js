require('dotenv').config()
const { v4: uuid } = require('uuid')
const db = require('./src/lib/Db')

const { ENV = 'dev', FIREBASE_SERVICE_ACCOUNT } = process.env

// if (DATADOG_API_KEY && DATADOG_LOGGER_URL) {
//   logger.push({
//     type: 'Datadog',
//     options: {
//       url: DATADOG_LOGGER_URL,
//       env: ENV
//     }
//   })
// }

// if (CACHER === 'redis' && REDIS_HOST) {
//   cacher = {
//     type: 'Redis',
//     options: {
//       ttl: 60 * 60,
//       redis: {
//         host: REDIS_HOST,
//         port: REDIS_PORT,
//         password: REDIS_PASSWORD
//       }
//     }
//   }
// }

module.exports = {
  // Namespace of nodes to segment your nodes on the same network.
  namespace: ENV,
  // Unique node identifier. Must be unique in a namespace.
  nodeID: `integrations.${uuid().split('-')[0]}`,
  // Custom metadata store. Store here what you want. Accessing: `this.broker.metadata`
  metadata: {},
  logger: [
    {
      type: 'Console',
      options: {
        level: 'info'
      }
    }
  ],

  // Define transporter.
  // More info: https://moleculer.services/docs/0.14/networking.html
  // Note: During the development, you don't need to define it because all services will be loaded locally.
  // In production you can set it via `TRANSPORTER=nats://localhost:4222` environment variable.
  transporter: null, // "NATS"

  // Define a cacher.
  // More info: https://moleculer.services/docs/0.14/caching.html
  cacher: true,

  // Define a serializer.
  // Available values: "JSON", "Avro", "ProtoBuf", "MsgPack", "Notepack", "Thrift".
  // More info: https://moleculer.services/docs/0.14/networking.html#Serialization
  serializer: 'JSON',

  // Limit of calling level. If it reaches the limit, broker will throw an MaxCallLevelError error. (Infinite loop protection)
  maxCallLevel: 100,

  // Number of seconds to send heartbeat packet to other nodes.
  heartbeatInterval: 10,
  // Number of seconds to wait before setting node to unavailable status.
  heartbeatTimeout: 30,

  // Cloning the params of context if enabled. High performance impact, use it with caution!
  contextParamsCloning: false,

  // Enable action & event parameter validation. More info: https://moleculer.services/docs/0.14/validating.html
  validator: true,

  errorHandler: null,

  // Register custom middlewares
  middlewares: [],

  // Register custom REPL commands.
  replCommands: null,

  // Called after broker created.
  async created (broker) {},

  // Called after broker started.
  async started (broker) {
    try {
      // Firebase Db start
      db.connect({
        serviceAccount: JSON.parse(
          Buffer.from(FIREBASE_SERVICE_ACCOUNT, 'base64').toString()
        )
      })
      broker.logger.info('Firebase db connected')
      broker.emit('db.connected')
    } catch (error) {
      broker.logger.error(error)
      await broker.stop()
    }
  },

  // Called after broker stopped.
  async stopped (broker) {
    'Firebase Db connection close'
    await db.disconnect()
  }
}
