const { google } = require('googleapis')
const Google = require('../../../lib/google')

const {
  GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_CLIENT_SECRET,
  GOOGLE_DRIVE_REDIRECT_URI
} = process.env

class GoogleDrive extends Google {
  constructor (userCredentials) {
    super(
      {
        clientId: GOOGLE_DRIVE_CLIENT_ID,
        clientSecret: GOOGLE_DRIVE_CLIENT_SECRET,
        redirectUri: GOOGLE_DRIVE_REDIRECT_URI
      },
      userCredentials
    )
    this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client })
  }

  static async getTokens (code) {
    return (
      await new google.auth.OAuth2(
        GOOGLE_DRIVE_CLIENT_ID,
        GOOGLE_DRIVE_CLIENT_SECRET,
        GOOGLE_DRIVE_REDIRECT_URI
      ).getToken(code)
    ).tokens
  }

  static async revokeToken (token) {
    return await new google.auth.OAuth2(
      GOOGLE_DRIVE_CLIENT_ID,
      GOOGLE_DRIVE_CLIENT_SECRET,
      GOOGLE_DRIVE_REDIRECT_URI
    ).revokeToken(token)
  }

  async listByParentId ({
    parentId,
    pageSize = 10,
    pageToken = '',
    type = 'folder'
  }) {
    return (
      await this.drive.files.list({
        corpora: 'user',
        pageToken,
        pageSize,
        fields:
          'nextPageToken, files(id, name, webViewLink, iconLink, mimeType, parents, webContentLink)',
        q: [
          `'${parentId}' in parents`,
          'trashed=false',
          `mimeType${
            type === 'folder' ? '=' : '!='
          }'application/vnd.google-apps.folder'`
        ].join(' and ')
      })
    ).data
  }

  async listByName ({ name, pageSize = 10, pageToken = '', type = 'folder' }) {
    const {
      data: { files }
    } = await this.drive.files.list({
      corpora: 'user',
      pageToken,
      pageSize,
      fields:
        'nextPageToken, files(id, name, webViewLink, iconLink, mimeType, parents, webContentLink)',
      q: [
        `name='${name}'`,
        'trashed=false',
        "mimeType='application/vnd.google-apps.folder'"
      ].join(' and ')
    })

    if (!files.length) {
      return []
    }

    return await this.listByParentId({
      parentId: files[0].id,
      pageSize,
      pageToken,
      type
    })
  }

  async createFolder ({ parentId, name }) {
    const metadata = {
      resource: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      },
      fields:
        'id, name, webViewLink, iconLink, mimeType, parents, webContentLink'
    }

    return (await this.drive.files.create(metadata)).data
  }

  async createFile ({ parentId, file: { name, mimeType, stream } }) {
    const metadata = {
      resource: {
        name,
        parents: [parentId]
      },
      media: {
        mimeType,
        body: stream
      },
      fields: 'id, name'
    }

    return (await this.drive.files.create(metadata)).data
  }

  async uploadFile ({ parentId, leadId, file }) {
    const { files } = await this.listByParentId({ parentId })

    if (files.length) {
      return await this.createFile({ parentId: files[0].id, file })
    }

    const folder = await this.createFolder({ parentId, name: leadId })

    return await this.createFile({ parentId: folder.id, file })
  }

  async deleteFile ({ fileId }) {
    return (await this.drive.files.delete({ fileId })).data
  }
}

module.exports = GoogleDrive
