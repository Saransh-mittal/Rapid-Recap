const mongoose = require('mongoose')

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    hindiText: {
      type: String,
      required: true,
    },
  },
  { _id: true },
)

const tournamentQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  hindiQuestion: {
    type: String,
    required: true,
  },
  options: {
    a: { type: optionSchema, required: true },
    b: { type: optionSchema, required: true },
    c: { type: optionSchema, required: true },
    d: { type: optionSchema, required: true },
  },
  correctAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: function (v) {
        return ['a', 'b', 'c', 'd'].some(key => this.options[key]._id.equals(v))
      },
      message: props => `${props.value} is not a valid option ID`,
    },
  },
  category: {
    type: String,
    required: true,
  },
  difficulty: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
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
