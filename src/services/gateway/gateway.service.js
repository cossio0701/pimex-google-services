require('dotenv').config()
const os = require('os')
const { unauthorized } = require('@hapi/boom')
const ApiService = require('moleculer-web')
const pkg = require(`${process.cwd()}/package.json`)
const { onAfterCall, onError, onBeforeCall } = require('./lib/utils')

const { PORT = 3000 } = process.env

ApiService.started = undefined

const service = {
  name: 'api',
  mixins: [ApiService],
  dependencies: ['google'],
  settings: {
    onError,
    port: PORT,
    cors: {
      origin: '*'
    },
    routes: [
      {
        path: 'v3/',
        bodyParsers: {
          json: true,
          urlencoded: false
        },
        onBeforeCall,
        mappingPolicy: 'restrict',
        autoAliases: true,
        aliases: {},
        whitelist: ['**'],
        onAfterCall,
        authorization: false
      },
      {
        path: '/',
        aliases: {
          'GET /': 'api.getInfo'
        },
        onAfterCall
      },
      {
        path: '/v3/google/drive',
        aliases: {
          'POST /file': 'stream:google.drive.create.file'
        },
        busboyConfig: {
          limits: { files: 1 }
        },
        mappingPolicy: 'restrict'
      }
    ]
  },
  actions: {
    getInfo () {
      return {
        version: pkg.version,
        service: pkg.name,
        description: pkg.description,
        status: 'ok'
      }
    }
  },
  methods: {
    async authorize (ctx, route, req) {
      const { headers, $action, $params } = req
      const { auth } = $action
      const bearerToken = headers.authorization

      if (!bearerToken || !bearerToken.startsWith('Bearer')) {
        throw unauthorized('Access Token is required')
      }

      const token = bearerToken.split(' ')[1]

      const tokenData = await this.broker.call('auth.getTokenData', { token })

      if (!tokenData.isValid) throw unauthorized('Invalid Access token')

      ctx.meta.auth = tokenData

      if (!auth) return ctx

      if (!this.validateScopes(auth, tokenData)) {
        if (!Array.isArray(auth.self) || !tokenData.sub) {
          throw unauthorized('Invalid Scopes')
        }

        auth.self.forEach(key => {
          $params[key] = tokenData.sub
        })
      }

      ctx.meta.user = tokenData.sub

      return ctx
    },
    validateScopes (auth, tokenData) {
      if (!auth || !tokenData.roles) return false

      for (const role of auth.roles) {
        if (tokenData.roles.includes(role)) {
          return true
        }
      }

      for (const scope of auth.scopes) {
        if (tokenData.scopes.includes(scope)) {
          return true
        }
      }

      return false
    }
  },
  started () {},
  events: {
    'db.connected' () {
      if (this.settings.server === false) {
        return this.Promise.resolve()
      }

      /* istanbul ignore next */
      return new this.Promise((resolve, reject) => {
        this.server.listen(this.settings.port, this.settings.ip, err => {
          if (err) {
            return reject(err)
          }

          const addr = this.server.address()
          const listenAddr =
            addr.address === '0.0.0.0' && os.platform() === 'win32'
              ? 'localhost'
              : addr.address
          this.logger.info(
            `API Gateway listening on ${
              this.isHTTPS ? 'https' : 'http'
            }://${listenAddr}:${addr.port}`
          )
          resolve()
        })
      })
    }
  }
}
module.exports = service
