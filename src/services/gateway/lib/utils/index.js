'use strict'

const { boomify, isBoom, forbidden } = require('@hapi/boom')
const _ = require('lodash')

function onBeforeCall (ctx, route, req, res, data = {}) {
  sanitize(req.$params)
}

function onAfterCall (ctx, route, req, res, data = {}) {
  const statusCode = data.statusCode ? data.statusCode : data.statusCode || req.method === 'POST' ? 201 : 200

  ctx.meta.$statusCode = statusCode

  if (req.parsedUrl === '/v2/mirakl/syncs/orders/download/document' ||
      req.parsedUrl === '/v2/orders/download/documents' ||
      (req.parsedUrl.includes('/v2/mirakl/syncs/messages/inbox/threads/') && req.parsedUrl.includes('/download')) ||
      (req.parsedUrl.includes('/v2/messages/inbox/threads/') && req.parsedUrl.includes('/download'))) {
    for (const property in data.headers) {
      res.setHeader(property, data.headers[property])
      if (property === 'content-type') ctx.meta.$responseType = data.headers[property]
    }

    return res.end(data.data)
  }
  return {
    data,
    length: Array.isArray(data) ? data.length : undefined,
    statusCode
  }
}

function sanitize (params) {
  if (params instanceof Object) {
    for (const key in params) {
      if (/^\$/.test(key)) {
        throw forbidden('Unexpected input')
      }
      sanitize(params[key])
    }
  }
  return params
}

function onError (req, res, error) {
  const { originalUrl, $ctx } = req

  if (error.code && !isBoom(error)) {
    error = boomify(error, {
      statusCode: error.code
    })
  }

  this.broker.emit('api.error', { error, originalUrl })

  const { output } = boomify(error)

  let responseType = $ctx.meta.$responseType ? $ctx.meta.$responseType : 'application/json; charset=utf-8'

  if ($ctx.meta.$responseHeaders) {
    Object.keys($ctx.meta.$responseHeaders).forEach(key => {
      if (key === 'Content-Type' && !responseType) {
        responseType = $ctx.meta.$responseHeaders[key]
      } else {
        res.setHeader(key, $ctx.meta.$responseHeaders[key])
      }
    })
  }

  // Return with the error as JSON object
  res.setHeader('Content-type', responseType)

  const code = _.isNumber(output.statusCode) && _.inRange(output.statusCode, 400, 599) ? output.statusCode : 500
  res.writeHead(code)
  res.end(output.payload !== undefined ? this.encodeResponse(req, res, output.payload) : undefined)

  this.logResponse(req, res)
}

module.exports = {
  onAfterCall,
  onError,
  onBeforeCall
}
