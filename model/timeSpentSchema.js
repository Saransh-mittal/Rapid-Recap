const mongoose = require("mongoose");

const timeSpentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  articleId: mongoose.Schema.Types.ObjectId,
  timeSpent: Number,
  date: { type: Date, default: Date.now },
});

const TimeSpent = mongoose.model("TimeSpent", timeSpentSchema);

module.exports = TimeSpent;
