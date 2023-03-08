const fs = require('fs')
const path = require('path')
const pimex = require('../../../lib/pimex')
const GoogleCalendar = require('../lib/GoogleCalendar')

const { PIMEX_CALENDAR_WIDGET_URL } = process.env

module.exports = {
  async 'calendar.getRefreshToken' ({ code }) {
    return (await GoogleCalendar.getTokens(code)).refresh_token
  },
  async 'calendar.revokeRefreshToken' ({ app, board }) {
    const { options } = await this.broker.call(
      'connection.getPrivateBoardConnection',
      {
        id: board,
        app
      }
    )
    return await GoogleCalendar.revokeToken(options.refreshToken)
  },
  async createLead ({ calendar, formFields }) {
    return await pimex.lead.create({
      body: {
        _state: 'lead',
        name: formFields.mandatory.value.split('@')[0],
        phone: '',
        email: formFields.mandatory.value,
        project: calendar.board.id,
        referrer: 'Calendar',
        origin: 'Calendar'
      }
    })
  },
  async createLeadTask ({ leadId, calendar, googleMeet, selectedDate }) {
    return await pimex.lead.createTask({
      leadId,
      body: {
        title: `Reunión ${calendar.title}`,
        category: 'meeting',
        description: `<strong style="font-weight: bold;">Descripción: </strong> ${
          calendar.description
        } <br/> 
      <strong style="font-weight: bold;">Enlace: </strong> <a href="${
        googleMeet.hangoutLink
      }">${googleMeet.hangoutLink}</a> <br/> 
      <strong style="font-weight: bold;">Inicio de reunión: </strong> ${new Date(
        selectedDate.start
      ).toLocaleString()} <br/> 
      <strong style="font-weight: bold;">Fin de reunión: </strong> ${new Date(
        selectedDate.end
      ).toLocaleString()}`,
        start_date: new Date(selectedDate.start).getTime() / 1000,
        reminder: {
          exect_date: new Date(selectedDate.start).getTime() / 1000
        }
      }
    })
  },
  async sendEmail ({ calendar, meeting, action }) {
    const template = fs.readFileSync(
      path.resolve(__dirname, `../templates/calendar.meeting.${action}.html`),
      'utf-8'
    )

    const vars = {
      IMAGE_URL: calendar.image.url,
      BOARD_NAME: calendar.board.name,
      NAME: meeting.formFields.mandatory.value.split('@')[0],
      MEETING_DATE: new Date(meeting.selectedDate.start).toLocaleDateString(),
      URL_CONFIRM: `${PIMEX_CALENDAR_WIDGET_URL}/confirm/${meeting.id}`,
      URL_CANCEL: `${PIMEX_CALENDAR_WIDGET_URL}/cancel/${meeting.id}`,
      URL_RESCHEDULE: `${PIMEX_CALENDAR_WIDGET_URL}/reschedule/${meeting.id}`
    }

    const actions = {
      scheduled: 'Agendamiento',
      confirmed: 'Confirmación',
      rescheduled: 'Reagendamiento',
      cancelled: 'Cancelación'
    }

    return await pimex.email.send({
      body: {
        to: meeting.formFields.mandatory.value,
        from: `${calendar.board.name} <${calendar.board.id}@board.pimex.email>`,
        message: template,
        contentType: 'html',
        subject: `${actions[action]} de reunión en '${calendar.title}'`,
        sendOn: true,
        vars
      }
    })
  }
}
