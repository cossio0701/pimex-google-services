const { google } = require('googleapis')

module.exports = class Google {
  constructor (appCredentials, userCredentials) {
    const { clientId, clientSecret, redirectUri } = appCredentials

    this.oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    )

    this.oAuth2Client.setCredentials(userCredentials)
  }
}
