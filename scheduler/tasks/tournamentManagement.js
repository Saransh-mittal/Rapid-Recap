const moment = require('moment-timezone')
const Tournament = require('../../model/tournamentSchema')
const User = require('../../model/userSchema')
const { sendNotification } = require('../../services/notificationService')
const {
  TournamentRegistration,
} = require('../../model/tournamentRegistrationSchema')
const i18n = require('i18next')

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

async function updateTournamentPerformanceAndBadges(tournament) {
  try {
    const leaderboardData = await TournamentRegistration.aggregate([
      { $match: { tournament: tournament._id } },
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
          user: '$user',
          inGameName: '$userDetails.inGameName',
          totalScore: 1,
        },
      },
      { $sort: { totalScore: -1 } },
      {
        $group: {
          _id: null,
          entries: { $push: '$$ROOT' },
          participantCount: { $sum: 1 },
        },
      },
    ])

    if (leaderboardData.length === 0) return

    const { entries, participantCount } = leaderboardData[0]

    // Update each user's tournament performance
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const rank = i + 1

      await User.updateOne(
        { _id: entry.user },
        {
          $push: {
            tournamentPerformance: {
              tournament: tournament._id,
              score: entry.totalScore,
              rank: rank,
              endDate: tournament.endDate, // You might want to get the actual end date from the tournament
              tournamentNumber: tournament.tournamentNumber, // Assuming tournamentId is unique and can be used as tournamentNumber
              participantCnt: participantCount,
            },
          },
        },
      )

      // Update badge for top 3 ranks
      if (rank <= 3) {
        await User.updateOne(
          { _id: entry.user },
          {
            displayedBadge: {
              tournamentNumber: tournament.tournamentNumber,
              rank: rank,
              participantCnt: participantCount,
            },
          },
        )
      }
    }

    console.log('Tournament performance and badges updated successfully')
  } catch (error) {
    console.error('Error updating tournament performance and badges:', error)
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
