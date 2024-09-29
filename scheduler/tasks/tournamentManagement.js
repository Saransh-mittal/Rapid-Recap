const moment = require('moment-timezone')
const Tournament = require('../../model/tournamentSchema')
const User = require('../../model/userSchema')
const { sendNotification } = require('../../services/notificationService')
const {
  TournamentRegistration,
  QuizSession,
} = require('../../model/tournamentRegistrationSchema')
const i18n = require('i18next')
const {
  updateTournamentPerformanceAndBadges,
} = require('../../utils/tournament.utils')
const MailTemplates = require('../../data/MailTemplates')
const {
  mailTransporter,
  getSociety,
  getCircle,
  calculateWeeklyIQChange,
  calculateWeeklyRQMChange,
  calculateWeeklyQuizCount,
  calculateWeeklyQuizDifficultyDistribution,
} = require('../../utils/mail.utils')

const startRegistration = async () => {
  const startDate = moment().tz('Asia/Kolkata').startOf('day')
  const endDate = moment(startDate).add(6, 'days').endOf('day')
  const registrationEndDate = moment(startDate)
    .add(4, 'days')
    .set({ hour: 23, minute: 0, second: 0 })

  const registrationStartDate = moment(startDate).add(2, 'hours')
  const latestTournament = await Tournament.findOne().sort({
    tournamentNumber: -1,
  })
  const nextTournamentNumber = latestTournament
    ? latestTournament.tournamentNumber + 1
    : 1

  const tournamentStartDate = moment(startDate)
    .add(5, 'days')
    .set({ hour: 0, minute: 0, second: 0 })

  await Tournament.create({
    tournamentNumber: nextTournamentNumber,
    startDate: tournamentStartDate.toDate(),
    endDate: endDate.toDate(),
    registrationStartDate: registrationStartDate.toDate(),
    registrationEndDate: registrationEndDate.toDate(),
    status: 'registration',
  })

  const realUsers = await User.find({})

  for (const user of realUsers) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(
      user?.userLanguage ? user?.userLanguage : 'en',
    )

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title = t('tournament_registration_open.title')
    const body =
      user?.role === 'guest'
        ? t('tournament_registration_open.body_guest')
        : t('tournament_registration_open.body_user')

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: user._id,
    })
  }
  console.log(
    `New tournament #${nextTournamentNumber
      .toString()
      .padStart(3, '0')} registration started`,
  )
}

const inRegisterationPeriod = async () => {
  const tournament = await Tournament.findOne({
    isActive: true,
  }).sort({ startDate: -1 })
  console.log('In registration period')
  const participantsCount = tournament.participants.length
  const nonRegisteredUsers = await User.find({
    _id: { $nin: tournament.participants },
  })

  for (const user of nonRegisteredUsers) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(
      user?.userLanguage ? user?.userLanguage : 'en',
    )

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title = t('reminder_to_register.title')
    const body =
      user?.role === 'guest'
        ? t('reminder_to_register.body_guest', { participantsCount })
        : t('reminder_to_register.body_user', { participantsCount })

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: user._id,
    })
  }
}

const lastDayOfRegisterationPeriod = async () => {
  const tournament = await Tournament.findOne({
    isActive: true,
  }).sort({ startDate: -1 })

  const participantsCount = tournament.participants.length
  const nonRegisteredUsers = await User.find({
    _id: { $nin: tournament.participants },
  })

  for (const user of nonRegisteredUsers) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(
      user?.userLanguage ? user?.userLanguage : 'en',
    )

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title = t('last_day_to_register.title')
    const body =
      user?.role === 'guest'
        ? t('last_day_to_register.body_guest', { participantsCount })
        : t('last_day_to_register.body_user', { participantsCount })

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: user._id,
    })
  }
}

const endRegistration = async () => {
  const currentTournament = await Tournament.findOne({
    status: 'registration',
    isActive: true,
  })
  if (currentTournament) {
    currentTournament.status = 'upcoming'
    await currentTournament.save()
    console.log('Tournament registration ended')
  }

  const tournament = currentTournament

  const participantsCount = tournament.participants.length
  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  }).populate('user')

  for (const registration of registeredUsers) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(registration.user.userLanguage)

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title = t('all_the_best.title')
    const body = t('all_the_best.body', { participantsCount })

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: registration.user._id,
    })
  }

  const nonRegisteredUsers = await User.find({
    _id: { $nin: tournament.participants },
  })

  for (const user of nonRegisteredUsers) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(
      user?.userLanguage ? user?.userLanguage : 'en',
    )

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title =
      user?.role === 'guest'
        ? t('see_you_next_time_guest.title')
        : t('see_you_next_time_user.title')

    const body =
      user?.role === 'guest'
        ? t('see_you_next_time_guest.body', { participantsCount })
        : t('see_you_next_time_user.body', { participantsCount })

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: user._id,
    })
  }
  console.log('Tournament registration ended')
}

const startTournament = async () => {
  const currentTournament = await Tournament.findOne({
    status: 'upcoming',
    isActive: true,
  })
  if (currentTournament) {
    currentTournament.status = 'ongoing'
    await currentTournament.save()
    console.log('Tournament started')
  }

  const tournament = currentTournament

  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  }).populate('user')

  for (const registration of registeredUsers) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(registration.user.userLanguage)

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title = t('tournament_started.title')
    const body = t('tournament_started.body')

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: registration.user._id,
    })
  }
}

const day1EndOfTournament = async () => {
  const tournament = await Tournament.findOne({
    isActive: true,
  }).sort({ startDate: -1 })

  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  })
    .populate('user')
    .lean()

  const usersToNotify = registeredUsers.filter(
    registration => registration.completedCategories.length !== 6,
  )

  for (const registration of usersToNotify) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(registration.user.userLanguage)

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title = t('day_1_completed.title')
    const body = t('day_1_completed.body')

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: registration.user._id,
    })
  }
}

const day2OfTournament = async () => {
  const tournament = await Tournament.findOne({
    isActive: true,
  }).sort({ startDate: -1 })

  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  })
    .populate('user')
    .lean()

  const usersToNotify = registeredUsers.filter(
    registration => registration.completedCategories.length !== 6,
  )

  for (const registration of usersToNotify) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(registration.user.userLanguage)

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title = t('day_2.title')
    const body = t('day_2.body')

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: registration.user._id,
    })
  }
}

const endTournament = async () => {
  const currentTournament = await Tournament.findOne({
    status: 'ongoing',
    isActive: true,
  })
  if (currentTournament) {
    currentTournament.status = 'completed'
    currentTournament.isActive = false
    await currentTournament.save()
    console.log('Tournament ended')
  }

  const tournament = currentTournament
  updateTournamentPerformanceAndBadges(tournament)
  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  }).populate('user')

  for (const registration of registeredUsers) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(registration.user.userLanguage)

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title = t('tournament_completed.title')
    const body = t('tournament_completed.body')

    await sendNotification({
      title,
      body,
      url: '/tournament',
      userId: registration.user._id,
    })
  }

  const nonRegisteredUsers = await User.find({
    _id: { $nin: tournament.participants },
  })

  for (const user of nonRegisteredUsers) {
    const localizedI18n = i18n.cloneInstance()
    await localizedI18n.changeLanguage(
      user?.userLanguage ? user?.userLanguage : 'en',
    )

    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'tournamentManagement', ...options })

    const title =
      user?.role === 'guest'
        ? t('next_time_guest.title')
        : t('next_time_user.title')

    const body =
      user?.role === 'guest'
        ? t('next_time_guest.body')
        : t('next_time_user.body')

    await sendNotification({
      title,
      body,
      url: user?.role === 'guest' ? '/signup' : '/tournament',
      userId: user._id,
    })
  }
  // Sending weekly report to all users
  const users = await User.find({})

  let topPlayers = []
  let leaderboardData = []
  const latestTournament = currentTournament

  if (latestTournament) {
    // Fetch top 5 players for the tournament
    leaderboardData = await TournamentRegistration.aggregate([
      { $match: { tournament: latestTournament._id } },
      {
        $lookup: {
          from: 'Users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: '$userDetails._id',
          inGameName: '$userDetails.inGameName',
          name: '$userDetails.name',
          totalScore: 1,
        },
      },
      { $sort: { totalScore: -1 } },
    ])

    topPlayers = leaderboardData.filter((player, index) => index < 5)
    topPlayers = topPlayers?.map((player, index) => {
      return {
        inGameName: player.inGameName,
        name: player.name,
        score: player.totalScore,
        rank: index + 1,
      }
    })
  }

  for (const user of users) {
    const society = getSociety(user.IQ_score)
    const circle = getCircle(user.IQ_score)
    const iqChangeNum = await calculateWeeklyIQChange(user._id)
    const rqmChangeNum = await calculateWeeklyRQMChange(user._id, user.avgRQM)
    const weeklyQuizCount = await calculateWeeklyQuizCount(user._id)
    const quizDistribution = await calculateWeeklyQuizDifficultyDistribution(
      user._id,
    )

    let tournamentScore = null
    let categoryPerformance = []
    let participatedInTournament = false
    let userRank = 0
    const findIndex = leaderboardData.findIndex(
      player => player._id.toString() === user._id.toString(),
    )
    userRank = findIndex + 1
    if (latestTournament) {
      const userTournamentRegistration = await TournamentRegistration.findOne({
        user: user._id,
        tournament: latestTournament._id,
      })

      if (userTournamentRegistration) {
        participatedInTournament = true
        tournamentScore = userTournamentRegistration.totalScore

        // Fetch quiz sessions for this user in the current tournament
        const quizSessions = await QuizSession.find({
          user: user._id,
          tournament: latestTournament._id,
          completed: true,
        })

        // Calculate category performance
        const categoryScores = {}
        quizSessions.forEach(session => {
          if (!categoryScores[session.category]) {
            categoryScores[session.category] = {
              totalScore: 0,
              count: 0,
            }
          }
          categoryScores[session.category].totalScore += session.RQM_score
          categoryScores[session.category].count++
        })

        // Calculate average scores and prepare categoryPerformance array
        const maxScore = Math.max(
          ...Object.values(categoryScores).map(c => c.totalScore / c.count),
        )
        categoryPerformance = Object.entries(categoryScores).map(
          ([name, data]) => {
            const value = Math.round((data.totalScore / data.count) * 100) / 100 // Round to 2 decimal places
            const height = Math.round((value / maxScore) * 200) // Scale height to max 200
            return { name, value, height }
          },
        )
      }
    }
    const userData = {
      name: user.name,
      inGameName: user.inGameName,
      society,
      circle,
      iqScore: user.IQ_score,
      rank: user.rank,
      iqChange:
        iqChangeNum > 0
          ? `+${iqChangeNum} this week`
          : `${iqChangeNum} this week`,
      averageRQM: user.avgRQM.toFixed(1),
      rqmChange:
        rqmChangeNum > 0
          ? `+${rqmChangeNum} this week`
          : `${rqmChangeNum} this week`,
      experienceLevel: user.level,
      ongoingSeason: user.currentSeason,
      totalQuizzesThisWeek: weeklyQuizCount,
      quizDistribution,
      tournamentRank: userRank,
      tournamentScore,
      topPlayers,
      categoryPerformance,
      participatedInTournament,
    }
    const transporter = await mailTransporter()
    await transporter.sendMail({
      from: MailTemplates.userWeeklyReportTemplate.from,
      to: user.email,
      subject: MailTemplates.userWeeklyReportTemplate.subject,
      html: MailTemplates.userWeeklyReportTemplate.html({
        ...userData,
      }),
    })
  }

  // make EligibleForTournament of users false
  await User.updateMany(
    { eligibleForTournament: true },
    { $set: { eligibleForTournament: false } },
  )
}

module.exports = {
  startRegistration,
  inRegisterationPeriod,
  lastDayOfRegisterationPeriod,
  endRegistration,
  startTournament,
  day1EndOfTournament,
  day2OfTournament,
  endTournament,
}
