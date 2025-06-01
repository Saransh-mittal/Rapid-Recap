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
    enum: ['weeklyReport', 'applicationUpdate', 'demotion', 'teamInvitation'],
    default: 'applicationUpdate',
  },
  // Team invitation specific fields
  invitationData: {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUICK_CLASH_TEAM',
    },
    teamName: {
      type: String,
    },
    inviterName: {
      type: String,
    },
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
})

const ApplicationUpdates = mongoose.model(
  'APPLICATION_UPDATES',
  applicationUpdatesSchema,
) // Application Updates model

module.exports = ApplicationUpdates
