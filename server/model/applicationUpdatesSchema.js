const mongoose = require('mongoose')

// Application Updates Schema
const applicationUpdatesSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
  },
  mainText: {
    type: String,
  },
  img: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
  },
  read: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['weeklyReport', 'applicationUpdate'],
    default: 'applicationUpdate',
  },
})

const ApplicationUpdates = mongoose.model(
  'APPLICATION_UPDATES',
  applicationUpdatesSchema,
) // Application Updates model

module.exports = ApplicationUpdates
