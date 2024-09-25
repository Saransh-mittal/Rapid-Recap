const mongoose = require('mongoose')

const quizFeedbackSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QUIZ',
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
  category: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const QuizFeedback = mongoose.model('QuizFeedback', quizFeedbackSchema)

module.exports = QuizFeedback
