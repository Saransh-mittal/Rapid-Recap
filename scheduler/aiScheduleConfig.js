// scheduler/aiScheduleConfig.js
const fetchAINews = require('./tasks/scraper/fetchAINews')
const { convertISTtoUTCCron } = require('../utils/miscellaneous.utils')

// Define AI news fetch schedule
const aiNewsSchedules = [
  {
    name: 'fetchAINews',
    // Run every 4 hours - AI news moves fast but not as frequently as breaking news
    cronPattern: '0 */4 * * *',
    task: fetchAINews,
  },
]

module.exports = aiNewsSchedules
