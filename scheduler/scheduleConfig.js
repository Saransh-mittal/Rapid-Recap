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
  startRegistration: 2, // Saturday
  endRegistration: 2, // Monday
  startTournament: 3, // Tuesday
  endTournament: 1, // Wednesday
}
let schedules = [
  createSchedule('newSeasonReset', '00:00', resetNewSeasonModal),
  createSchedule('userIQScore', '00:01', calculateUserIQScores),
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
  // {
  //   name: 'inRegistrationPeriod',
  //   cronPattern: '0 11 * * 2,3,4,5', // At 11:00 AM on Tuesday, Wednesday, Thursday, and Friday
  //   task: inRegisterationPeriod,
  // },
  // {
  //   name: 'lastDayOfRegistrationPeriod',
  //   cronPattern: '0 20 * * 5', // At 8:00 PM on Friday
  //   task: lastDayOfRegisterationPeriod,
  // },
  // {
  //   name: 'day1EndOfTournament',
  //   cronPattern: '0 22 * * 6', // At 10:00 PM on Saturday
  //   task: day1EndOfTournament,
  // },
  // {
  //   name: 'day2OfTournament',
  //   cronPattern: '0 11 * * 0', // At 11:00 AM on Sunday
  //   task: day2OfTournament,
  // },
]

// Sort schedules by time
// schedules.sort((a, b) => a.time.valueOf() - b.time.valueOf())

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
  } else {
    // For non-tournament schedules, use the day from the UTC time
    dayOfWeek = timeUTC.day()
  }

  // Generate cron pattern using UTC time
  schedule.cronPattern = `${timeUTC.minute()} ${timeUTC.hour()} * * ${dayOfWeek}`

  // Add UTC day and time to the schedule for reference
  schedule.utcDay = timeUTC.day()
  schedule.utcTime = timeUTC.format('HH:mm')
})

module.exports = schedules
