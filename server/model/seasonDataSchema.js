const mongoose = require("mongoose");

const seasonDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
    required: true,
  },
  season: {
    type: String,
    required: true,
  },
  quizAttempts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QUIZ_ATTEMPT",
    },
  ],
  IQ_score: {
    type: Number,
    default: 0,
  },
  prevIQScore: {
    type: Number,
    default: 0,
  },
  userScore: {
    type: Number,
    default: 0,
  },
  dailyIQScores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyIQ",
    },
  ],
  easyQuizCount: {
    type: Number,
    default: 0,
  },
  mediumQuizCount: {
    type: Number,
    default: 0,
  },
  hardQuizCount: {
    type: Number,
    default: 0,
  },
  avgRQM: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SeasonData = mongoose.model("SEASON_DATA", seasonDataSchema);
module.exports = SeasonData;
