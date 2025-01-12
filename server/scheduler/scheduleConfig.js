const moment = require('moment-timezone')
const extractNews = require('./tasks/extractNews')
const sendRecommendedNewsNotification = require('./tasks/notifForRecommendedNews')
const updateDailyRecommendations = require('./tasks/updateRecommendations')
const resetNewSeasonModal = require('./tasks/newSeasonSevenDays')
const sendStreakBrokenMails = require('./tasks/mailsForStreakBroken')
const sendStreakReminder = require('./tasks/mailsForStreakReminder')
const calculateUserIQScores = require('./tasks/userIQScoreScheduler')
const incFakeQuizAttempts = require('./tasks/incFakeQuizAttempts')
const deleteExpiredGuestAccountsTask = require('./tasks/deleteExpiredGuestAccounts')
const sendGuestAccountExpiryNotifs = require('./tasks/guestAccountExpiryNotifs')
const {
  startRegistration,
  inRegisterationPeriod,
  lastDayOfRegisterationPeriod,
  endRegistration,
  startTournament,
  day1EndOfTournament,
  day2OfTournament,
  endTournament,
} = require('./tasks/tournamentManagement')
const { runTournamentServiceTask } = require('./tasks/runTournamentService')
const {
  registerDummyUsers,
  simulateBotQuizParticipation,
} = require('./tasks/dummyUserTournamentTasks')
const { convertISTtoUTCCron } = require('../utils/miscellaneous.utils')
const forceReloadAll = require('./tasks/forceReload')

const currentDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD')

const createSchedule = (name, time, task) => {
  // Parse the time in Kolkata time zone, then convert to UTC
  const scheduledTime = moment
    .tz(`${currentDate} ${time}`, 'Asia/Kolkata')
    .utc()
  return {
    name,
    time: scheduledTime,
    task,
  }
}

const tournamentDays = {
  startRegistration: 1, // Monday
  endRegistration: 5, // Friday
  startTournament: 6, // Saturday
  endTournament: 0, // Sunday
}
const isCalculating = { value: false }
let schedules = [
  createSchedule('newSeasonReset', '00:00', resetNewSeasonModal),
  createSchedule('userIQScore', '00:01', () =>
    calculateUserIQScores(isCalculating),
  ),
  createSchedule('incFakeQuizAttempts', '20:00', incFakeQuizAttempts),
  createSchedule(
    'recommendedNewsNotification11',
    '20:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule('incFakeQuizAttempts', '21:00', incFakeQuizAttempts),
  createSchedule(
    'deleteExpiredGuestAccountsTask',
    '21:30',
    deleteExpiredGuestAccountsTask,
  ),
  createSchedule(
    'recommendedNewsNotification12',
    '22:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule('forceReload', '23:00', forceReloadAll),
  createSchedule(
    'recommendedNewsNotification1',
    '00:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule(
    'recommendedNewsNotification2',
    '02:00',
    sendRecommendedNewsNotification,
  ),
  createSchedule('incFakeQuizAttempts', '03:00', incFakeQuizAttempts),
  createSchedule('extractNews1', '02:25', () => extractNews(null)),
  createSchedule('extractNews2', '09:00', () => extractNews('in')),
  createSchedule('extractNews3', '15:00', () => extractNews('in')),
  createSchedule('extractNews4', '23:00', () => {
    extractNews('in')
    runTournamentServiceTask()
  }),
  createSchedule('updateRecommendations', '01:00', updateDailyRecommendations),
  createSchedule('streakBrokenMails', '03:30', sendStreakBrokenMails),
  createSchedule(
    'recommendedNewsNotification3',
    '04:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule('incFakeQuizAttempts', '05:00', incFakeQuizAttempts),
  createSchedule(
    'recommendedNewsNotification4',
    '06:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule('incFakeQuizAttempts', '07:00', incFakeQuizAttempts),
  createSchedule(
    'recommendedNewsNotification5',
    '08:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule('incFakeQuizAttempts', '08:45', incFakeQuizAttempts),
  createSchedule(
    'recommendedNewsNotification6',
    '10:00',
    sendRecommendedNewsNotification,
  ),
  createSchedule('incFakeQuizAttempts', '10:40', incFakeQuizAttempts),
  createSchedule('streakReminder1', '12:30', () => sendStreakReminder(0)),
  createSchedule(
    'recommendedNewsNotification7',
    '12:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule('incFakeQuizAttempts', '13:30', incFakeQuizAttempts),
  createSchedule(
    'recommendedNewsNotification8',
    '14:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule(
    'recommendedNewsNotification9',
    '16:25',
    sendRecommendedNewsNotification,
  ),
  createSchedule('incFakeQuizAttempts', '17:00', incFakeQuizAttempts),
  createSchedule(
    'recommendedNewsNotification10',
    '18:00',
    sendRecommendedNewsNotification,
  ),
  createSchedule('streakReminder2', '19:00', () => sendStreakReminder(1)),
  createSchedule('streakReminder3', '22:00', () => sendStreakReminder(2)),
  createSchedule(
    'guestAccountExpiryNotifs1',
    '08:00',
    sendGuestAccountExpiryNotifs,
  ),
  createSchedule(
    'guestAccountExpiryNotifs2',
    '09:00',
    sendGuestAccountExpiryNotifs,
  ),
  createSchedule(
    'guestAccountExpiryNotifs3',
    '11:00',
    sendGuestAccountExpiryNotifs,
  ),
  createSchedule(
    'guestAccountExpiryNotifs4',
    '12:00',
    sendGuestAccountExpiryNotifs,
  ),
  createSchedule(
    'guestAccountExpiryNotifs5',
    '14:00',
    sendGuestAccountExpiryNotifs,
  ),
  createSchedule(
    'guestAccountExpiryNotifs6',
    '15:00',
    sendGuestAccountExpiryNotifs,
  ),
  createSchedule(
    'guestAccountExpiryNotifs7',
    '17:00',
    sendGuestAccountExpiryNotifs,
  ),
  createSchedule(
    'guestAccountExpiryNotifs8',
    '19:00',
    sendGuestAccountExpiryNotifs,
  ),
  createSchedule(
    'guestAccountExpiryNotifs9',
    '20:00',
    sendGuestAccountExpiryNotifs,
  ),
  // New tournament management schedules
  createSchedule('startRegistrationTournament', '02:00', startRegistration),
  createSchedule('endRegistrationTournament', '23:00', endRegistration),
  createSchedule('startTournament', '00:00', startTournament),
  createSchedule('endTournament', '23:59', endTournament),
  {
    name: 'inRegistrationPeriod',
    cronPattern: convertISTtoUTCCron(11, 0, '2,3,4,5'), // At 11:00 AM on Tuesday, Wednesday, Thursday, and Friday
    task: inRegisterationPeriod,
  },
  {
    name: 'registerDummyUsers',
    cronPattern: convertISTtoUTCCron(12, 0, '1,2,3,4,5'), // At 12:00 PM on Monday, Tuesday, Wednesday, Thursday, and Friday
    task: registerDummyUsers,
  },
  {
    name: 'botQuizParticipationSaturday',
    cronPattern: convertISTtoUTCCron(10, 0, '6'), // At 10:00 AM on Saturday
    task: simulateBotQuizParticipation,
  },
  {
    name: 'botQuizParticipationSaturday',
    cronPattern: convertISTtoUTCCron(14, 0, '6'), // At 2:00 PM on Saturday
    task: simulateBotQuizParticipation,
  },
  {
    name: 'botQuizParticipationSaturday',
    cronPattern: convertISTtoUTCCron(18, 0, '6'), // At 6:00 PM on Saturday
    task: simulateBotQuizParticipation,
  },
  {
    name: 'botQuizParticipationSunday',
    cronPattern: convertISTtoUTCCron(11, 0, '0'), // At 11:00 AM on Sunday
    task: simulateBotQuizParticipation,
  },
  {
    name: 'botQuizParticipationSunday',
    cronPattern: convertISTtoUTCCron(15, 0, '0'), // At 3:00 PM on Sunday
    task: simulateBotQuizParticipation,
  },
  {
    name: 'botQuizParticipationSunday',
    cronPattern: convertISTtoUTCCron(19, 0, '0'), // At 7:00 PM on Sunday
    task: simulateBotQuizParticipation,
  },
  {
    name: 'lastDayOfRegistrationPeriod',
    cronPattern: convertISTtoUTCCron(20, 0, '5'), // At 8:00 PM on Friday
    task: lastDayOfRegisterationPeriod,
  },
  {
    name: 'day1EndOfTournament',
    cronPattern: convertISTtoUTCCron(22, 0, '6'), // At 10:00 PM on Saturday
    task: day1EndOfTournament,
  },
  {
    name: 'day2OfTournament',
    cronPattern: convertISTtoUTCCron(11, 0, '0'), // At 11:00 AM on Sunday
    task: day2OfTournament,
  },
]

// Convert times to cron patterns and add them to each schedule
schedules.forEach(schedule => {
  if (!schedule.time) {
    return
  }

  // Convert the schedule time from IST to UTC
  const timeIST = moment.tz(schedule.time, 'Asia/Kolkata')
  const timeUTC = timeIST.clone().tz('UTC')

  let dayOfWeek = '*'
  if (schedule.name.includes('Tournament')) {
    for (const [event, day] of Object.entries(tournamentDays)) {
      if (schedule.name.includes(event)) {
        // Set the day in IST
        timeIST.day(day)
        // Convert to UTC after setting the day
        const updatedTimeUTC = timeIST.clone().tz('UTC')
        dayOfWeek = updatedTimeUTC.day()
        break
      }
    }
  }

  // Generate cron pattern using UTC time
  schedule.cronPattern = `${timeUTC.minute()} ${timeUTC.hour()} * * ${dayOfWeek}`

  // Add UTC day and time to the schedule for reference
  schedule.utcDay = timeUTC.day()
  schedule.utcTime = timeUTC.format('HH:mm')
})

module.exports = schedules
