const mongoose = require('mongoose')

const noteMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: {
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
    enum: ['default', 'xpAward', 'inbox'],
    default: 'default',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
})

const NoteMessage = mongoose.model('NoteMessage', noteMessageSchema)

module.exports = NoteMessage
