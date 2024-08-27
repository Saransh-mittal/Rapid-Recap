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
  isMilestone: {
    type: Boolean,
    default: false,
  },
  actions: [
    {
      actionType: { type: String },
      text: { type: String },
    },
  ],
  messageType: {
    type: String,
    enum: ['default', 'xpAward', 'inbox'],
    default: 'default',
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
    expires: 24 * 60 * 60, // set expiry time to 1 day
  },
})

const NoteMessage = mongoose.model('NoteMessage', noteMessageSchema)

module.exports = NoteMessage
