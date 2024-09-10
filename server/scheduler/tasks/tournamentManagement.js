const moment = require('moment-timezone')
const Tournament = require('../../model/tournamentSchema')

const startRegistration = async () => {
  const startDate = moment().tz('Asia/Kolkata').startOf('day')
  const endDate = moment(startDate).add(6, 'days').endOf('day')
  const registrationEndDate = moment(startDate)
    .add(4, 'days')
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
  console.log(
    `New tournament #${nextTournamentNumber
      .toString()
      .padStart(3, '0')} registration started`,
  )
}

const endRegistration = async () => {
  const currentTournament = await Tournament.findOne({ status: 'registration' })
  if (currentTournament) {
    currentTournament.status = 'upcoming'
    await currentTournament.save()
    console.log('Tournament registration ended')
  }
}

const startTournament = async () => {
  const currentTournament = await Tournament.findOne({ status: 'upcoming' })
  if (currentTournament) {
    currentTournament.status = 'ongoing'
    await currentTournament.save()
    console.log('Tournament started')
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
}

module.exports = {
  startRegistration,
  endRegistration,
  startTournament,
  endTournament,
}
