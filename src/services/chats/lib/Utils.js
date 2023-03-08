const { v4: uuidv4 } = require('uuid')
const colors = require('./files/colors.json')
const icons = require('./files/icons.json')

const days = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
]

module.exports = {
  getRandomColor () {
    return colors[Math.floor(Math.random() * (colors.length - 1))]
  },
  getRandomIcon () {
    return icons[Math.floor(Math.random() * (icons.length - 1))]
  },
  checkDateInRange (day, currentSeconds) {
    const from = day.from.split(':')
    const fromSeconds =
      parseInt(from[0]) * 3600 + parseInt(from[1]) * 60 + parseInt(from[0])
    const to = day.to.split(':')
    const toSeconds =
      parseInt(to[0]) * 3600 + parseInt(to[1]) * 60 + parseInt(to[0])
    return fromSeconds <= currentSeconds && currentSeconds <= toSeconds
  },
  checkDateInOfficeHours (officeHours) {
    const currentDate = new Date()
    const currentDay = days[currentDate.getDay()]
    const currentSeconds =
      currentDate.getHours() * 3600 +
      currentDate.getMinutes() * 60 +
      currentDate.getSeconds()

    let sendBotMessage = true

    officeHours.forEach(day => {
      if (day.days === 'weekdays') {
        if (currentDay !== 'saturday' && currentDay !== 'sunday') {
          if (this.checkDateInRange(day, currentSeconds)) {
            sendBotMessage = false
          }
        }
      } else if (day.days === 'weekends') {
        if (currentDay === 'saturday' || currentDay === 'sunday') {
          if (this.checkDateInRange(day, currentSeconds)) {
            sendBotMessage = false
          }
        }
      } else if (day.days === currentDay) {
        if (this.checkDateInRange(day, currentSeconds)) {
          sendBotMessage = false
        }
      } else if (day.days === 'all') {
        if (this.checkDateInRange(day, currentSeconds)) {
          sendBotMessage = false
        }
      }
    })

    return sendBotMessage
  },
  getRandomId () {
    return uuidv4()
  }
}
