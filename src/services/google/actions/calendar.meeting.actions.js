const Boom = require('@hapi/boom')
const GoogleCalendar = require('../lib/GoogleCalendar')
const BasicMeeting = require('../lib/BasicMeeting')
const BasicCalendar = require('../lib/BasicCalendar')
const utils = require('../lib/utils')
const { calendar } = require('googleapis/build/src/apis/calendar')

const app = 'google.calendar'

module.exports = {
  'calendar.meeting.get': {
    rest: 'GET /calendar/meeting/:id',
    async handler ({ params: { id, requiresGoogleData } }) {
      const meeting = await new BasicMeeting({ id }).get()

      if (requiresGoogleData) {
        const { options } = await this.broker.call(
          'connection.getPrivateBoardConnection',
          {
            id: meeting.board.id,
            app
          }
        )

        const googleMeet = await new GoogleCalendar({
          refresh_token: options.refreshToken
        }).getMeeting({
          meetingId: meeting.googleMeet.id
        })

        return {
          ...meeting,
          googleMeet
        }
      }

      return meeting
    }
  },
  'calendar.meeting.list': {
    rest: 'GET /calendar/:id/meeting',
    async handler ({ params: { id = 'general', boardId } }) {
      if (!boardId) {
        throw Boom.badRequest('Board id is required')
      }

      if (id !== 'general') {
        return await BasicMeeting.getAll({
          query: [
            { key: 'board.id', value: boardId },
            { key: 'calendarId', value: id }
          ]
        })
      }

      return await BasicMeeting.getAll({
        query: [{ key: 'board.id', value: boardId }]
      })
    }
  },
  'calendar.meeting.create': {
    rest: 'POST /calendar/meeting',
    async handler ({ params: { body } }) {
      const { selectedDate, formFields, calendarId } = body

      const calendar = await new BasicCalendar({ id: calendarId }).get()

      const { options } = await this.broker.call(
        'connection.getPrivateBoardConnection',
        { id: calendar.board.id, app }
      )

      const googleMeet = await new GoogleCalendar({
        refresh_token: options.refreshToken
      }).insertMeeting({
        meeting: {
          summary: calendar.title,
          location: '',
          start: {
            dateTime: new Date(selectedDate.start).toISOString()
          },
          end: {
            dateTime: new Date(selectedDate.end).toISOString()
          },
          conferenceData: {
            createRequest: {
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              },
              requestId: 'some-random-string'
            }
          },
          status: 'tentative',
          visibility: 'public',
          attendees: [
            {
              email: formFields.mandatory.value,
              displayName: formFields.mandatory.value.split('@')[0],
              comment: `Desde el tablero ${calendar.board.name}`
            }
          ]
        }
      })

      const { ID: leadId } = await this.createLead({ calendar, formFields })

      const meeting = await BasicMeeting.add({
        calendarId,
        board: calendar.board,
        formFields,
        googleMeet: {
          id: googleMeet.id,
          url: googleMeet.hangoutLink
        },
        leadId: leadId || null,
        selectedDate,
        status: 'scheduled'
      })

      if (leadId) {
        this.createLeadTask({
          leadId,
          calendar,
          googleMeet,
          selectedDate
        })
      }

      // await this.sendEmail({ calendar, meeting, action: 'scheduled' })

      return { ...meeting, googleMeet }
    }
  },
  'calendar.meeting.update': {
    rest: 'PUT /calendar/meeting/:id',
    async handler ({ params: { id, body } }) {
      console.log(id, body)
      return await new BasicMeeting({ id }).update(body)
    }
  },
  'calendar.meeting.status.update': {
    rest: 'PATCH /calendar/meeting/:id/status',
    async handler ({ params: { id, body } }) {
      const meeting = new BasicMeeting({ id })
      const { board, status, googleMeet } = await meeting.get()

      const calendar = await new BasicCalendar({ id: meeting.calendarId }).get()

      if (status === 'cancelled' || status === 'confirmed') {
        throw Boom.methodNotAllowed('Not allowed')
      }

      const updatedMeeting = await meeting.updateField(body)

      const { options } = await this.broker.call(
        'connection.getPrivateBoardConnection',
        { id: board.id, app }
      )

      if (body.status === 'confirmed') {
        await new GoogleCalendar({
          refresh_token: options.refreshToken
        }).patchMeeting({ id: googleMeet.id, data: { status: 'confirmed' } })

        await this.sendEmail({
          calendar,
          meeting: updatedMeeting,
          action: 'confirmed'
        })
      } else if (body.status === 'cancelled') {
        await new GoogleCalendar({
          refresh_token: options.refreshToken
        }).deleteMeeting({ meetingId: googleMeet.id })

        await this.sendEmail({
          calendar,
          meeting: updatedMeeting,
          action: 'cancelled'
        })
      } else if (body.status === 'rescheduled') {
        await new GoogleCalendar({
          refresh_token: options.refreshToken
        }).patchMeeting({
          id: googleMeet.id,
          data: {
            status: 'confirmed',
            start: {
              dateTime: new Date(body.selectedDate.start).toISOString()
            },
            end: {
              dateTime: new Date(body.selectedDate.end).toISOString()
            }
          }
        })

        await this.sendEmail({
          calendar,
          meeting: updatedMeeting,
          action: 'rescheduled'
        })
      }

      return updatedMeeting
    }
  },
  'calendar.meeting.available.get': {
    rest: 'POST /calendar/:id/meeting/available', //no seria get?
    async handler ({ params: { id, body } }) {
      const { selectedDay } = body

      const {
        board: { id: boardId },
        duration,
        hours: rangeHours
      } = await new BasicCalendar({ id }).get()

      const { options } = await this.broker.call(
        'connection.getPrivateBoardConnection',
        { id: boardId, app }
      )

      const $GoogleCalendar = new GoogleCalendar({
        refresh_token: options.refreshToken
      })

      const availableHours = []

      for (const hours of rangeHours) {
        let { timeMin: auxHour, timeMax: maxHour } = utils.getRangeHours(
          hours,
          selectedDay
        )

        const calendarHours = await $GoogleCalendar.freebusy({
          data: {
            items: [{ id: 'primary', busy: 'Active' }],
            timeMin: auxHour.toISOString(),
            timeMax: maxHour.toISOString()
          }
        })
        auxHour = auxHour.getTime()
        maxHour = maxHour.getTime()

        const durationInMilliseconds =
          duration.type === 'minutes'
            ? 1000 * 60 * duration.time
            : 1000 * 60 * 60 * duration.time

        while (auxHour < maxHour) {
          const nextHour = new Date(auxHour + durationInMilliseconds).getTime()
          let isAvailable = true
          calendarHours.forEach(cHour => {
            const start = new Date(cHour.start).getTime() // Agended event start
            const end = new Date(cHour.end).getTime() // Agended event end
            if (
              (auxHour <= start && start < nextHour) ||
              (auxHour < end && end <= nextHour) ||
              (start <= auxHour && auxHour < end) ||
              (start < nextHour && nextHour <= end)
            ) {
              isAvailable = false
            }
          })
          if (isAvailable) {
            availableHours.push({
              start: new Date(auxHour),
              end: new Date(nextHour)
            })
          }
          auxHour = nextHour
        }
      }

      return availableHours
    }
  }
}
