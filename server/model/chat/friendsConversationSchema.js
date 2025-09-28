// model/chat/friendsConversationSchema.js - Conversation between two friends
const mongoose = require('mongoose')

const friendsConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FriendsMessage',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      // Map of userId to unread count
      type: Map,
      of: Number,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Performance optimization for queries
    participantsHash: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    collection: 'FriendsConversations',
    timestamps: true,
  },
)

// Indexes for performance
friendsConversationSchema.index({ participants: 1 })
friendsConversationSchema.index({ participantsHash: 1 })
friendsConversationSchema.index({ lastMessageAt: -1 })
friendsConversationSchema.index({ participants: 1, lastMessageAt: -1 })

// Create unique hash for participant pair
friendsConversationSchema.pre('save', function (next) {
  if (this.participants && this.participants.length === 2) {
    // Sort participant IDs to ensure consistent hash regardless of order
    const sortedIds = [...this.participants].sort()
    this.participantsHash = sortedIds.join('_')
  }
  next()
})

// Static method to find conversation between two users
friendsConversationSchema.statics.findBetweenUsers = function (
  userId1,
  userId2,
) {
  return this.findOne({
    participants: { $all: [userId1, userId2] },
    isActive: true,
  })
}

// Static method to create conversation with proper hash
friendsConversationSchema.statics.createBetweenUsers = function (
  userId1,
  userId2,
) {
  const sortedIds = [userId1, userId2].sort()
  return this.create({
    participants: sortedIds,
    participantsHash: sortedIds.join('_'),
    unreadCount: new Map([
      [userId1.toString(), 0],
      [userId2.toString(), 0],
    ]),
  })
}

// Instance method to get other participant
friendsConversationSchema.methods.getOtherParticipant = function (
  currentUserId,
) {
  return this.participants.find(participant => {
    const participantId = participant?._id
      ? participant._id.toString() // case: subdocument
      : participant.toString() // case: ObjectId

    return participantId !== currentUserId.toString()
  })
}

// Instance method to increment unread count
friendsConversationSchema.methods.incrementUnreadCount = function (userId) {
  const userIdStr = userId.toString()
  const currentCount = this.unreadCount.get(userIdStr) || 0
  this.unreadCount.set(userIdStr, currentCount + 1)
  return this.save()
}

// Instance method to reset unread count
friendsConversationSchema.methods.resetUnreadCount = function (userId) {
  const userIdStr = userId.toString()
  this.unreadCount.set(userIdStr, 0)
  return this.save()
}

const FriendsConversation = mongoose.model(
  'FriendsConversation',
  friendsConversationSchema,
)

module.exports = FriendsConversation
