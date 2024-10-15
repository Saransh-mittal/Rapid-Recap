const mongoose = require('mongoose')

const tournamentQuizFeedbackSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TOURNAMENT',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  message: {
    type: String,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const TournamentQuizFeedback = mongoose.model(
  'TournamentQuizFeedback',
  tournamentQuizFeedbackSchema,
)

module.exports = TournamentQuizFeedback
