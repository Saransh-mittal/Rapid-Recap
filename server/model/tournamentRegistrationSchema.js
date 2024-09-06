const mongoose = require('mongoose')

const tournamentRegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TOURNAMENT',
    required: true,
  },
  selectedCategories: [
    {
      type: String,
      required: true,
    },
  ],
  registrationDate: {
    type: Date,
    default: Date.now,
  },
})

const TournamentRegistration = mongoose.model(
  'TOURNAMENT_REGISTRATION',
  tournamentRegistrationSchema,
)

module.exports = TournamentRegistration
