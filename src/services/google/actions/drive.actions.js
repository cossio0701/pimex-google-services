const Boom = require('@hapi/boom')
const GoogleDrive = require('../lib/GoogleDrive')
const Base64 = require('../../../lib/base64')
const app = 'google.drive'

module.exports = {
  'drive.connect': {
    async handler ({
      params: {
        board,
        app,
        options: { code, folderId = null }
      }
    }) {
      if (!code) {
        throw Boom.badRequest('Auth code is required')
      }
      const refreshToken = await this.invoke('drive.getRefreshToken', { code })
      return await this.broker.call('connection.setPrivateBoardConnection', {
        board,
        app,
        options: {
          refreshToken,
          folderId
        }
      })
    }
  },
  'drive.disconnect': {
    async handler ({ params: { connectionId, board, app } }) {
      try {
        await this.invoke('drive.revokeRefreshToken', { board, app })
      } catch (_) {}
      return await this.broker.call('connection.deletePrivateBoardConnection', {
        id: connectionId
      })
    }
  },
  'drive.list': {
    rest: 'GET /drive',
    async handler ({
      params: { boardId, leadId, pageSize, pageToken, parentId, type }
    }) {
      if (!boardId) {
        throw Boom.badRequest('Board id is required')
      }

      const { options } = this.broker.call(
        'connection.getPrivateBoardConnection',
        {
          id: boardId,
          app
        }
      )

      const Drive = new GoogleDrive({ refresh_token: options.refreshToken })

      if (leadId) {
        return await Drive.listByName({
          name: leadId,
          pageSize,
          pageToken,
          type
        })
      }

      return await Drive.listByParentId({
        parentId,
        pageSize,
        pageToken,
        type
      })
    }
  },
  'drive.folder.create': {
    rest: 'POST /drive/folder',
    async handler ({ params: { body } = {} }) {
      const { boardId, parentId, folder } = body

      if (!boardId) {
        throw Boom.badRequest('Board id is required')
      }

      if (!parentId) {
        throw Boom.badRequest('Parent id is required')
      }

      if (!folder || !folder.name) {
        throw Boom.badRequest('Folder data is required')
      }

      const { options } = this.broker.call(
        'connection.getPrivateBoardConnection',
        {
          id: boardId,
          app
        }
      )

      return await new GoogleDrive({
        refresh_token: options.refreshToken
      }).createFolder({ parentId, name: folder.name })
    }
  },
  'drive.file.create': {
    async handler (ctx) {
      const { leadId, boardId, fileData } = ctx.meta.$params
      const { fileName, fileType } = JSON.parse(Base64.decode(fileData))

      if (!leadId || !boardId || !fileData) {
        throw Boom.badRequest(
          'Not leadId, boardId or fileData param found in request.'
        )
      }

      if (!fileName) {
        throw Boom.badRequest("File name is required in 'fileData' param.")
      }

      if (!fileType) {
        throw Boom.badRequest("File type is required in 'fileData' param.")
      }

      const { options } = this.broker.call(
        'connection.getPrivateBoardConnection',
        {
          id: boardId,
          app
        }
      )

      return await new GoogleDrive({
        refresh_token: options.refreshToken
      }).uploadFile({
        parentId: options.folderId,
        leadId,
        file: {
          name: fileName,
          mimeType: fileType,
          stream: ctx.params
        }
      })
    }
  },
  'drive.file.delete': {
    rest: 'DELETE /drive/file/:id',
    async handler ({ params }) {
      const { id, boardId } = params

      if (!boardId) {
        throw Boom.badRequest('Board id is required')
      }

      if (!id) {
        throw Boom.badRequest('File id is required')
      }

      const { options } = this.broker.call(
        'connection.getPrivateBoardConnection',
        {
          id: boardId,
          app
        }
      )

      return await new GoogleDrive({
        refresh_token: options.refreshToken
      }).deleteFile({ fileId: id })
    }
  }
}
