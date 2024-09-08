const mongoose = require('mongoose')

// Update the existing TournamentRegistration schema
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
  completedCategories: [
    {
      type: String,
      default: [],
    },
  ],
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
})

const TournamentRegistration = mongoose.model(
  'TOURNAMENT_REGISTRATION',
  tournamentRegistrationSchema,
)

// Create a new QuizSession schema
const quizSessionSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TOURNAMENT_QUESTION',
    },
  ],
  responses: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TOURNAMENT_QUESTION',
      },
      userAnswer: {
        type: String,
      },
      isCorrect: {
        type: Boolean,
      },
    },
  ],
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  RQM_score: {
    type: Number,
    default: 0,
  },
  timeTaken: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

const QuizSession = mongoose.model('QUIZ_SESSION', quizSessionSchema)

module.exports = {
  TournamentRegistration,
  QuizSession,
}
