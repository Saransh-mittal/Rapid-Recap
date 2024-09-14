const moment = require('moment-timezone')
const Tournament = require('../../model/tournamentSchema')
const User = require('../../model/userSchema')
const { sendNotification } = require('../../services/notificationService')
const {
  TournamentRegistration,
} = require('../../model/tournamentRegistrationSchema')

const startRegistration = async () => {
  const startDate = moment().tz('Asia/Kolkata').startOf('day')
  const endDate = moment(startDate).add(4, 'days').endOf('day')
  const registrationEndDate = moment(startDate)
    .add(2, 'days')
    .set({ hour: 23, minute: 0, second: 0 })

  // registration start date will be 2 hrs + of start date
  const registrationStartDate = moment(startDate).add(2, 'hours')

  // Find the latest tournament to determine the next tournament number
  const latestTournament = await Tournament.findOne().sort({
    tournamentNumber: -1,
  })
  const nextTournamentNumber = latestTournament
    ? latestTournament.tournamentNumber + 1
    : 1

  const tournamentStartDate = moment(startDate)
    .add(3, 'days')
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

  // // Send notification to all users
  // for (const user of realUsers) {
  //   if (user?.role === 'guest') {
  //     await sendNotification({
  //       title: 'Tournament Registration Open!',
  //       body: `Registration for the tournament has started. Secure your progress now by registering and enter in tournament!`,
  //       icon: '/path/to/icon.png', // Update this with the actual path
  //       url: `/tournament`,
  //       userId: user._id, // Send to each user
  //     })
  //   } else {
  //     await sendNotification({
  //       title: 'Tournament Registration Open!',
  //       body: `Registration for the tournament has started. Don't miss your chance to join!`,
  //       icon: '/path/to/icon.png', // Update this with the actual path
  //       url: `/tournament`,
  //       userId: user._id, // Send to each user
  //     })
  //   }
  // }
  console.log(
    `New tournament #${nextTournamentNumber
      .toString()
      .padStart(3, '0')} registration started`,
  )
}
const inRegisterationPeriod = async () => {
  const tournament = await Tournament.findOne({
    isActive: true, // Only consider active tournaments
  }).sort({ startDate: -1 })

  const participantsCount = tournament.participants.length

  // Fetch all users who are not registered for this tournament
  const nonRegisteredUsers = await User.find({
    _id: { $nin: tournament.participants },
  })

  // Send "See You Next Time" to non-registered users
  for (let user of nonRegisteredUsers) {
    if (user?.role === 'guest') {
      await sendNotification({
        title: 'Reminder to Register!',
        body: `You haven't registered for the tournament yet. Secure your progress now and enter in tournament! ${participantsCount} users have already registered.`,
        icon: '/path/to/icon.png',
        url: `/tournament`,
        userId: user._id,
      })
    } else {
      await sendNotification({
        title: 'Reminder to Register!',
        body: `You haven't registered for the tournament yet. Register now! ${participantsCount} users have already registered.`,
        icon: '/path/to/icon.png',
        url: `/tournament`,
        userId: user._id,
      })
    }
  }
}

const lastDayOfRegisterationPeriod = async () => {
  const tournament = await Tournament.findOne({
    isActive: true, // Only consider active tournaments
  }).sort({ startDate: -1 })

  const participantsCount = tournament.participants.length

  // Fetch all users who are not registered for this tournament
  const nonRegisteredUsers = await User.find({
    _id: { $nin: tournament.participants },
  })

  // Send "See You Next Time" to non-registered users
  for (let user of nonRegisteredUsers) {
    if (user?.role === 'guest') {
      await sendNotification({
        title: 'Last Day to Register!',
        body: `Today is the last day to register for the tournament. Secure your progress now and enter in tournament! ${participantsCount} users have already registered.`,
        icon: '/path/to/icon.png',
        url: `/tournament`,
        userId: user._id,
      })
    } else {
      await sendNotification({
        title: 'Last Day to Register!',
        body: `Today is the last day to register for the tournament. Register now! ${participantsCount} users have already registered.`,
        icon: '/path/to/icon.png',
        url: `/tournament`,
        userId: user._id,
      })
    }
  }
}

const endRegistration = async () => {
  const currentTournament = await Tournament.findOne({ status: 'registration' })
  if (currentTournament) {
    currentTournament.status = 'upcoming'
    await currentTournament.save()
    console.log('Tournament registration ended')
  }

  if (currentTournament.status === 'upcoming' && currentTournament.isActive) {
    const tournament = await Tournament.findOne({
      isActive: true, // Only consider active tournaments
    }).sort({ startDate: -1 })

    const participantsCount = tournament.participants.length

    // Fetch all users registered for this tournament
    const registeredUsers = await TournamentRegistration.find({
      tournament: tournament._id,
    }).populate('user')

    // Send "All the Best" to registered users
    // for (let registration of registeredUsers) {
    //   await sendNotification({
    //     title: 'All the Best for the Tournament!',
    //     body: `Get ready! The tournament is about to begin. Prepare your strategies now. There are ${participantsCount} participants competing.`,
    //     icon: '/path/to/icon.png',
    //     url: `/tournament`,
    //     userId: registration.user._id,
    //   })
    // }

    // Fetch all users who are not registered for this tournament
    const nonRegisteredUsers = await User.find({
      _id: { $nin: tournament.participants },
    })

    // Send "See You Next Time" to non-registered users
    // for (let user of nonRegisteredUsers) {
    //   if (user?.role === 'guest') {
    //     await sendNotification({
    //       title: '🔒 Don’t Miss Out Again!',
    //       body: `The tournament registration has ended, and ${participantsCount} users are already competing! You missed this one, but don’t worry—secure your progress by creating an account and be ready to join the next tournament!`,
    //       icon: '/path/to/icon.png',
    //       url: `/signup`,
    //       userId: user._id,
    //     })
    //   } else {
    //     await sendNotification({
    //       title: '⚡ You Missed the Tournament!',
    //       body: `The tournament registration has ended, and ${participantsCount} users are already competing. Don’t worry—you can catch the next one! Stay tuned for more exciting events!`,
    //       icon: '/path/to/icon.png',
    //       url: `/tournament`,
    //       userId: user._id,
    //     })
    //   }
    // }
  }
}

const startTournament = async () => {
  const currentTournament = await Tournament.findOne({ status: 'upcoming' })
  if (currentTournament) {
    currentTournament.status = 'ongoing'
    await currentTournament.save()
    console.log('Tournament started')
  }

  const tournament = await Tournament.findOne({
    isActive: true, // Only consider active tournaments
  }).sort({ startDate: -1 })

  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  }).populate('user')

  // for (let registration of registeredUsers) {
  //   await sendNotification({
  //     title: '🏆 The Tournament Has Begun!',
  //     body: `Get ready for an exciting challenge! Wishing you the best of luck! 💪`,
  //     icon: '/path/to/icon.png',
  //     url: `/tournament`,
  //     userId: registration.user._id,
  //   })
  // }
}

const day1EndOfTournament = async () => {
  // Fetch the most recent active tournament
  const tournament = await Tournament.findOne({
    isActive: true,
  }).sort({ startDate: -1 })

  // Get the list of registered users for the tournament
  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  })
    .populate('user')
    .lean()

  // Filter users whose completedCategories array length is not equal to 3
  const usersToNotify = registeredUsers.filter(
    registration => registration.completedCategories.length !== 6,
  )

  // Send notifications to the filtered users
  for (let registration of usersToNotify) {
    await sendNotification({
      title: '🏆 Day 1 of the Tournament Completed!',
      body: `Day 1 is over! Check your rank on the leaderboard and see how you performed. Keep pushing! 💪`,
      icon: '/path/to/icon.png',
      url: `/leaderboard`,
      userId: registration.user._id,
    })
  }
}

const day2OfTournament = async () => {
  // Fetch the most recent active tournament
  const tournament = await Tournament.findOne({
    isActive: true,
  }).sort({ startDate: -1 })

  // Get the list of registered users for the tournament
  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  })
    .populate('user')
    .lean()

  // Filter users whose completedCategories array length is not equal to 6
  const usersToNotify = registeredUsers.filter(
    registration => registration.completedCategories.length !== 6,
  )

  // Send notifications to the filtered users
  for (let registration of usersToNotify) {
    await sendNotification({
      title: '🔥 Day 2 of the Tournament!',
      body: `Tournament is halfway there! Keep the momentum going and show them what you’ve got! 💥`,
      icon: '/path/to/icon.png',
      url: `/tournament`,
      userId: registration.user._id,
    })
  }
}

const endTournament = async () => {
  const currentTournament = await Tournament.findOne({ status: 'ongoing' })
  if (currentTournament) {
    currentTournament.status = 'completed'
    currentTournament.isActive = false
    await currentTournament.save()
    console.log('Tournament ended')
  }

  const tournament = await Tournament.findOne({
    isActive: true, // Only consider active tournaments
  }).sort({ startDate: -1 })

  const registeredUsers = await TournamentRegistration.find({
    tournament: tournament._id,
  }).populate('user')

  // for (let registration of registeredUsers) {
  //   await sendNotification({
  //     title: '🎉 Tournament Completed!',
  //     body: `The tournament has come to an end. Thank you for your amazing participation! We hope you had a great time!`,
  //     icon: '/path/to/icon.png',
  //     url: `/tournament`,
  //     userId: registration.user._id,
  //   })
  // }

  const nonRegisteredUsers = await User.find({
    _id: { $nin: tournament.participants },
  })

  // for (let user of nonRegisteredUsers) {
  //   if (user?.role === 'guest') {
  //     await sendNotification({
  //       title: '🔒 Secure Your Spot for the Next Tournament!',
  //       body: `The tournament has ended, but you can still be part of the action next time! Create an account to save your progress and get ready for future challenges!`,
  //       icon: '/path/to/icon.png',
  //       url: `/signup`,
  //       userId: user._id,
  //     })
  //   } else {
  //     await sendNotification({
  //       title: 'Don’t Miss Out Next Time!',
  //       body: `The tournament has ended, but there's always another chance! Stay tuned and register early for the next event!`,
  //       icon: '/path/to/icon.png',
  //       url: `/tournament`,
  //       userId: user._id,
  //     })
  //   }
  // }
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
