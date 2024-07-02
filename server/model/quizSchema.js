const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    a: {
      type: String,
    },
    b: {
      type: String,
    },
    c: {
      type: String,
    },
    d: {
      type: String,
    },
  },
  answer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
  },
  difficulty: {
    type: String,
    required: true,
  },
});

const paragraphSchema = new mongoose.Schema({
  questions: [questionSchema],
});

const quizSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ARTICLE",
  },
  para1: paragraphSchema,
  para2: paragraphSchema,
  para3: paragraphSchema,
  overAllDifficulty: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  language: {
    type: String,
    default: "en",
  },
});

const Quiz = mongoose.model("QUIZ", quizSchema);

module.exports = Quiz;
