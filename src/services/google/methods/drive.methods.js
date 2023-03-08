const GoogleDrive = require('../lib/GoogleDrive')

module.exports = {
  async 'drive.getRefreshToken' ({ code }) {
    return (await GoogleDrive.getTokens(code)).refresh_token
  },
  async 'drive.revokeRefreshToken' ({ app, board }) {
    const { options } = await this.invoke('drive.getConnection', { app, board })
    return await GoogleDrive.revokeToken(options.refreshToken)
  }
}
