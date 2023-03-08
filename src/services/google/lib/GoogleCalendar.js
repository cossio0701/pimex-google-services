const { google } = require('googleapis')
const Google = require('../../../lib/google')

const {
  GOOGLE_CALENDAR_CLIENT_ID,
  GOOGLE_CALENDAR_CLIENT_SECRET,
  GOOGLE_CALENDAR_REDIRECT_URI
} = process.env

class GoogleCalendar extends Google {
  constructor (userCredentials) {
    super(
      {
        clientId: GOOGLE_CALENDAR_CLIENT_ID,
        clientSecret: GOOGLE_CALENDAR_CLIENT_SECRET,
        redirectUri: GOOGLE_CALENDAR_REDIRECT_URI
      },
      userCredentials
    )
    this.calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client })
  }

  static async getTokens (code) {
    return (
      await new google.auth.OAuth2(
        GOOGLE_CALENDAR_CLIENT_ID,
        GOOGLE_CALENDAR_CLIENT_SECRET,
        GOOGLE_CALENDAR_REDIRECT_URI
      ).getToken(code)
    ).tokens
  }

  static async revokeToken (token) {
    return await new google.auth.OAuth2(
      GOOGLE_CALENDAR_CLIENT_ID,
      GOOGLE_CALENDAR_CLIENT_SECRET,
      GOOGLE_CALENDAR_REDIRECT_URI
    ).revokeToken(token)
  }

  async listMeetings ({ calendarId = 'primary' }) {
    return (
      await this.calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      })
    ).data.items
  }

  async getMeeting ({ calendarId = 'primary', meetingId }) {
    return (await this.calendar.events.get({ calendarId, eventId: meetingId }))
      .data
  }

  async insertMeeting ({ calendarId = 'primary', meeting }) {
    const metadata = {
      calendarId,
      resource: meeting,
      sendUpdates: 'all',
      conferenceDataVersion: 1
    }
    return (await this.calendar.events.insert(metadata)).data
  }

  async updateMeeting ({ calendarId = 'primary', meetingId, meeting }) {
    const metadata = {
      calendarId,
      eventId: meetingId,
      resource: meeting,
      sendUpdates: 'all',
      conferenceDataVersion: 1
    }
    return (await this.calendar.events.update(metadata)).data
  }

  async patchMeeting ({ calendarId = 'primary', id, data }) {
    const metadata = {
      calendarId,
      eventId: id,
      resource: data,
      sendUpdates: 'all',
      conferenceDataVersion: 1
    }
    return (await this.calendar.events.patch(metadata)).data
  }

  async deleteMeeting ({ calendarId = 'primary', meetingId }) {
    return (
      await this.calendar.events.delete({ calendarId, eventId: meetingId })
    ).data
  }

  async freebusy ({ data }) {
    return (
      (await this.calendar.freebusy.query({ requestBody: data })).data.calendars
        ?.primary?.busy || []
    )
  }
}

module.exports = GoogleCalendar
