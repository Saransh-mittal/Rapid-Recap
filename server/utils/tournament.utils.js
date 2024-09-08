const {
  TournamentRegistration,
} = require('../model/tournamentRegistrationSchema')

const getUserRegistrationDetails = async (userId, tournamentId, session) => {
  try {
    const registration = await TournamentRegistration.findOne({
      user: userId,
      tournament: tournamentId,
    })
      .select('selectedCategories completedCategories totalScore')
      .session(session)

    if (registration) {
      return {
        isRegistered: true,
        selectedCategories: registration.selectedCategories,
        completedCategories: registration.completedCategories,
        totalScore: registration.totalScore,
      }
    }

    return { isRegistered: false }
  } catch (error) {
    console.log(error)
    return
  }
}

module.exports = {
  getUserRegistrationDetails,
}
