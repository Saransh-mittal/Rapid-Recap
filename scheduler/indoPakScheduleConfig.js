// scheduler/indoPakScheduleConfig.js
const fetchIndoPakNews = require('./tasks/fetchIndoPakNews')
const { convertISTtoUTCCron } = require('../utils/miscellaneous.utils')

// Define Indo-Pak news fetch schedule
const indoPakSchedules = [
  {
    name: 'fetchIndoPakNews',
    // Run every 2 hours
    cronPattern: '0 */6 * * *',
    task: fetchIndoPakNews,
  },
]

module.exports = indoPakSchedules
