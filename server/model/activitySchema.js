const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
  },
  xpAwarded: {
    type: Number,
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
})

const Activity = mongoose.model('Activity', activitySchema)

module.exports = Activity
