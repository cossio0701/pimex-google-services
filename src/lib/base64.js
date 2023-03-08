const { Buffer } = require('buffer')

module.exports = {
  encode: (string) => Buffer.from(string, 'utf8').toString('base64'),
  decode: (string) => Buffer.from(string, 'base64').toString('utf8')
}
