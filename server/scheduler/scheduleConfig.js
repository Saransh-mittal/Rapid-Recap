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

const currentDate = moment().format('YYYY-MM-DD')

const createSchedule = (name, time, task) => ({
  name,
  time: moment.tz(`${currentDate} ${time}`, 'Asia/Kolkata'),
  task,
})

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
  createSchedule('extractNews4', '23:00', () => extractNews('in')),
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
  createSchedule('startTournamentRegistration', '02:00', startRegistration),
  createSchedule('endTournamentRegistration', '23:00', endRegistration),
  createSchedule('startTournament', '00:00', startTournament),
  createSchedule('endTournament', '23:59', endTournament),
  {
    name: 'inRegistrationPeriod',
    cronPattern: '0 11 * * 2,3,4,5', // At 11:00 AM on Tuesday, Wednesday, Thursday, and Friday
    task: inRegisterationPeriod,
  },
  {
    name: 'lastDayOfRegistrationPeriod',
    cronPattern: '0 20 * * 5', // At 8:00 PM on Friday
    task: lastDayOfRegisterationPeriod,
  },
  {
    name: 'day1EndOfTournament',
    cronPattern: '0 22 * * 6', // At 10:00 PM on Saturday
    task: day1EndOfTournament,
  },
  {
    name: 'day2OfTournament',
    cronPattern: '0 11 * * 0', // At 11:00 AM on Sunday
    task: day2OfTournament,
  },
]

// Sort schedules by time
// schedules.sort((a, b) => a.time.valueOf() - b.time.valueOf())

// Convert times to cron patterns and add them to each schedule
schedules.forEach(schedule => {
  if (!schedule.time) {
    return
  }
  const timeUTC = schedule.time.clone().tz('UTC')
  const timeLocal = timeUTC.clone().local()
  const dayOfWeek = schedule.name.includes('Tournament')
    ? schedule.name.includes('Registration')
      ? 1 // Monday for registration
      : schedule.name.includes('end')
      ? 0
      : 6 // Sunday for end, Saturday for start
    : '*'
  schedule.cronPattern = `${timeLocal.minute()} ${timeLocal.hour()} * * ${dayOfWeek}`
})

module.exports = schedules
