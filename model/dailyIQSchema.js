const mongoose = require("mongoose");

// Daily IQ Score Schema
const dailyIQSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  IQ_score: {
    type: Number,
    required: true,
  },
  dailyRank: {
    type: String,
    required: true,
  },
});

const DailyIQ = mongoose.model("DailyIQ", dailyIQSchema); // Daily IQ model

module.exports = DailyIQ;
