// scheduler/quickClashScheduleConfig.js
const { convertISTtoUTCCron } = require('../utils/miscellaneous.utils')
const processExpiredChallenges = require('./tasks/processExpiredChallenges')

/**
 * Schedule configuration for Quick Clash related tasks
 */
const quickClashSchedules = [
  // Run 6 times a day to process expired challenges
  {
    name: 'process-expired-challenges-morning',
    cronPattern: convertISTtoUTCCron(6, 0, '*'), // 6 AM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-noon',
    cronPattern: convertISTtoUTCCron(12, 0, '*'), // 12 PM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-afternoon',
    cronPattern: convertISTtoUTCCron(15, 0, '*'), // 3 PM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-evening',
    cronPattern: convertISTtoUTCCron(18, 0, '*'), // 6 PM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-night',
    cronPattern: convertISTtoUTCCron(21, 0, '*'), // 9 PM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-midnight',
    cronPattern: convertISTtoUTCCron(0, 0, '*'), // 12 AM IST daily
    task: processExpiredChallenges,
  },
]

module.exports = quickClashSchedules
