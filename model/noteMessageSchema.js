const mongoose = require('mongoose')

const noteMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: {
    type: String,
  },
  title: {
    type: String,
  },
  duration: {
    type: Number,
    default: null,
  },
  isMilestone: {
    type: Boolean,
    default: false,
  },
  milestoneContent: {
    type: String,
  },
  milestoneName: {
    type: String,
  },
  xpSource: {
    type: String,
  },
  actions: [
    {
      actionType: { type: String },
      text: { type: String },
    },
  ],
  messageType: {
    type: String,
    enum: ['default', 'xpAward', 'inbox', 'streak'],
    default: 'default',
  },
  streakStatus: {
    type: String,
    enum: ['broken', 'revival', 'revived', 'default'],
    default: 'default',
  },
  streakCount: {
    type: Number,
    default: 0,
  },
  xpAwarded: {
    type: Number,
    default: 0,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60, // set expiry time to 7 days
  },
})

const NoteMessage = mongoose.model('NoteMessage', noteMessageSchema)

module.exports = NoteMessage
