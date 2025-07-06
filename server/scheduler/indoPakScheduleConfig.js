// scheduler/indoPakScheduleConfig.js
const fetchIndoPakNews = require('./tasks/scraper/fetchIndoPakNews')
const { convertISTtoUTCCron } = require('../utils/miscellaneous.utils')

// Define Indo-Pak news fetch schedule
const indoPakSchedules = [
  {
    name: 'fetchIndoPakNews',
    // Run every 8 hours
    cronPattern: '0 */8 * * *',
    task: fetchIndoPakNews,
  },
]

module.exports = indoPakSchedules
