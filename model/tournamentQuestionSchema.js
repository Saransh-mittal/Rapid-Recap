const mongoose = require('mongoose')

const tournamentQuestionSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ARTICLE',
    required: function () {
      return this.category !== 'current affairs'
    },
  },
  question: {
    type: String,
    required: true,
  },
  hindiQuestion: {
    type: String,
    required: true,
  },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
  },
  hindiOptions: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['a', 'b', 'c', 'd'],
  },
  category: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isManuallyAdded: {
    type: Boolean,
    default: false,
  },
})

const TournamentQuestion = mongoose.model(
  'TOURNAMENT_QUESTION',
  tournamentQuestionSchema,
)

module.exports = TournamentQuestion
