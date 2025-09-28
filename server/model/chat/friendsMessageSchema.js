// model/chat/friendsMessageSchema.js - Individual messages in conversations
const mongoose = require('mongoose')

const friendsMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FriendsConversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // Keep messages concise
    },
    messageType: {
      type: String,
      enum: ['text'], // Future: 'image', 'emoji_reaction'
      default: 'text',
    },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read'],
      default: 'sending',
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // For message reactions (future feature)
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'USER',
        },
        emoji: {
          type: String,
          maxlength: 10,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Soft delete for message management
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'USER',
      default: null,
    },
  },
  {
    collection: 'FriendsMessages',
    timestamps: true,
  },
)

// Indexes for efficient queries
friendsMessageSchema.index({ conversation: 1, createdAt: -1 })
friendsMessageSchema.index({ sender: 1, createdAt: -1 })
friendsMessageSchema.index({ conversation: 1, isDeleted: 1, createdAt: -1 })

// Static method to get recent messages for conversation
friendsMessageSchema.statics.getRecentMessages = function (
  conversationId,
  limit = 30,
  before = null,
) {
  const query = {
    conversation: conversationId,
    isDeleted: false,
  }

  if (before) {
    query.createdAt = { $lt: before }
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name inGameName pic isOnline')
    .populate('readBy.user', 'name inGameName')
}

// Static method to count unread messages
friendsMessageSchema.statics.countUnread = function (
  conversationId,
  userId,
  since = null,
) {
  const query = {
    conversation: conversationId,
    sender: { $ne: userId },
    isDeleted: false,
    'readBy.user': { $ne: userId },
  }

  if (since) {
    query.createdAt = { $gte: since }
  }

  return this.countDocuments(query)
}

// Instance method to mark as read by user
friendsMessageSchema.methods.markAsReadBy = function (userId) {
  // Check if already read by this user
  const alreadyRead = this.readBy.some(
    read => read.user.toString() === userId.toString(),
  )

  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date(),
    })
    this.status = 'read'
    return this.save()
  }

  return Promise.resolve(this)
}

// Instance method to add reaction
friendsMessageSchema.methods.addReaction = function (userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString(),
  )

  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    createdAt: new Date(),
  })

  return this.save()
}

// Instance method to remove reaction
friendsMessageSchema.methods.removeReaction = function (userId) {
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString(),
  )
  return this.save()
}

// Pre-save middleware for message limits
friendsMessageSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Count existing messages in this conversation
      const messageCount = await this.constructor.countDocuments({
        conversation: this.conversation,
        isDeleted: false,
      })

      // If we're approaching the limit, mark oldest messages as deleted
      const MESSAGE_LIMIT = 30
      if (messageCount >= MESSAGE_LIMIT) {
        const oldMessages = await this.constructor
          .find({
            conversation: this.conversation,
            isDeleted: false,
          })
          .sort({ createdAt: 1 })
          .limit(messageCount - MESSAGE_LIMIT + 1)

        const oldMessageIds = oldMessages.map(msg => msg._id)
        await this.constructor.updateMany(
          { _id: { $in: oldMessageIds } },
          {
            isDeleted: true,
            deletedAt: new Date(),
          },
        )
      }
    } catch (error) {
      console.error('Error managing message limit:', error)
    }
  }
  next()
})

const FriendsMessage = mongoose.model('FriendsMessage', friendsMessageSchema)

module.exports = FriendsMessage
