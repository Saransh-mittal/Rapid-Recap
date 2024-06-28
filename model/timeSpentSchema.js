const mongoose = require("mongoose");

const timeSpentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  articleId: mongoose.Schema.Types.ObjectId,
  timeSpent: Number,
  date: { type: Date, default: Date.now },
});
// Add indexes on userId and date
timeSpentSchema.index({ userId: 1 });
timeSpentSchema.index({ date: 1 });
const TimeSpent = mongoose.model("TimeSpent", timeSpentSchema);

module.exports = TimeSpent;
