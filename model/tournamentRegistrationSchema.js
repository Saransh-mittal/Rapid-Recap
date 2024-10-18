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
  categoryAttempts: {
    type: Map,
    of: Number,
    default: {},
  },
  askedQuestions: {
    type: Map,
    of: [mongoose.Schema.Types.ObjectId],
    default: {},
  },
  categoryScores: {
    type: Map,
    of: Number,
    default: {},
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  sendTourFeedback: {
    type: Boolean,
    default: true,
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
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 2,
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
  expectedTime: {
    type: Number,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

// Add a compound index that includes the attemptNumber
quizSessionSchema.index(
  { user: 1, tournament: 1, category: 1, attemptNumber: 1 },
  { unique: true },
)
const QuizSession = mongoose.model('QUIZ_SESSION', quizSessionSchema)

module.exports = {
  TournamentRegistration,
  QuizSession,
}
