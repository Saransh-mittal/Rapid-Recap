const {
  TournamentRegistration,
  QuizSession,
} = require('../../model/tournamentRegistrationSchema')
const Tournament = require('../../model/tournamentSchema')
const User = require('../../model/userSchema')

const deleteAllTournamentAndRelated = async () => {
  try {
    console.log('Deleting all tournaments and related data')
    // const tournaments = await Tournament.find({})
    // for (const tournament of tournaments) {
    //   await Tournament.deleteOne({ _id: tournament._id })
    //   await User.updateMany(
    //     { 'tournamentPerformance.tournament': tournament._id },
    //     {
    //       $pull: {
    //         tournamentPerformance: { tournament: tournament._id },
    //       },
    //     },
    //   )
    //   await TournamentRegistration.deleteMany({ tournament: tournament._id })
    //   await QuizSession.deleteMany({ tournament: tournament._id })
    // }
    // const users = await User.find({})
    // for (const user of users) {
    //   user.displayedBadge = null
    //   user.tournamentPerformance = []
    //   await user.save()
    // }
    console.log('All tournaments and related data deleted')
  } catch (err) {
    console.log(err)
  }
}

// deleteAllTournamentAndRelated()
