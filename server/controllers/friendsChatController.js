// controllers/friendsChatController.js - FIXED: Prevents sender from receiving their own message events
const asyncHandler = require('express-async-handler')
const FriendsConversation = require('../model/chat/friendsConversationSchema')
const FriendsMessage = require('../model/chat/friendsMessageSchema')
const User = require('../model/userSchema')
const globalEmitter = require('../eventEmitter')
const { sendNotification } = require('../services/notificationService')
const i18n = require('i18next')

// Helper function to validate friendship
const validateFriendship = async (user1Id, user2Id) => {
  try {
    const user1 = await User.findById(user1Id).select('friends').lean()
    if (!user1) {
      throw new Error('User not found')
    }

    const isFriend = user1.friends.some(
      friendId => friendId.toString() === user2Id.toString(),
    )

    return isFriend
  } catch (error) {
    console.error('[CHAT_CONTROLLER] Error validating friendship:', error)
    return false
  }
}

// Helper function to format conversation for client
const formatConversation = (conversation, currentUserId) => {
  const otherParticipant = conversation.participants.find(
    p => p._id.toString() !== currentUserId.toString(),
  )

  return {
    _id: conversation._id,
    participant: {
      _id: otherParticipant._id,
      name: otherParticipant.name,
      inGameName: otherParticipant.inGameName,
      pic: otherParticipant.pic,
      isOnline: otherParticipant.isOnline,
      quickClashTrophies: otherParticipant.quickClashTrophies || 1000,
    },
    lastMessage: conversation.lastMessage
      ? {
          _id: conversation.lastMessage._id,
          content: conversation.lastMessage.content,
          sender: conversation.lastMessage.sender._id,
          createdAt: conversation.lastMessage.createdAt,
          status: conversation.lastMessage.status,
        }
      : null,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount: conversation.unreadCount?.[currentUserId.toString()] || 0,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  }
}

// Helper function to format message for client
const formatMessage = message => {
  return {
    _id: message._id,
    content: message.content,
    sender: {
      _id: message.sender._id,
      name: message.sender.name,
      inGameName: message.sender.inGameName,
      pic: message.sender.pic,
      isOnline: message.sender.isOnline,
    },
    messageType: message.messageType,
    status: message.status,
    reactions: message.reactions || [],
    readBy: message.readBy || [],
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  }
}

//@description     Get all conversations for current user
//@route           GET /api/friends/chat/conversations
//@access          Protected
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const conversations = await FriendsConversation.find({
      participants: userId,
      isActive: true,
    })
      .populate(
        'participants',
        'name inGameName pic isOnline quickClashTrophies',
      )
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt status',
        populate: {
          path: 'sender',
          select: 'name inGameName',
        },
      })
      .sort({ lastMessageAt: -1 })
      .lean()

    const formattedConversations = conversations.map(conv =>
      formatConversation(conv, userId),
    )

    res.status(200).json({
      success: true,
      conversations: formattedConversations,
      total: formattedConversations.length,
    })
  } catch (error) {
    console.error('[CHAT_CONTROLLER] Error fetching conversations:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message,
    })
  }
})

//@description     Get or create conversation with a friend
//@route           POST /api/friends/chat/conversation
//@access          Protected
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { friendId } = req.body

  try {
    // Validate input
    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: 'Friend ID is required',
      })
    }

    // Check if they are friends
    const areFriends = await validateFriendship(userId, friendId)
    if (!areFriends) {
      return res.status(403).json({
        success: false,
        message: 'You can only chat with your friends',
      })
    }

    // Try to find existing conversation
    let conversation = await FriendsConversation.findBetweenUsers(
      userId,
      friendId,
    )
      .populate(
        'participants',
        'name inGameName pic isOnline quickClashTrophies',
      )
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt status',
        populate: {
          path: 'sender',
          select: 'name inGameName',
        },
      })

    // Create new conversation if none exists
    if (!conversation) {
      conversation = await FriendsConversation.createBetweenUsers(
        userId,
        friendId,
      )
      await conversation.populate(
        'participants',
        'name inGameName pic isOnline quickClashTrophies',
      )
    }

    const formattedConversation = formatConversation(conversation, userId)

    res.status(200).json({
      success: true,
      conversation: formattedConversation,
    })
  } catch (error) {
    console.error(
      '[CHAT_CONTROLLER] Error getting/creating conversation:',
      error,
    )
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message,
    })
  }
})

//@description     Get messages in a conversation
//@route           GET /api/friends/chat/conversation/:conversationId/messages
//@access          Protected
const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { conversationId } = req.params
  const { limit = 30, before } = req.query

  try {
    // Verify user is participant in conversation
    const conversation = await FriendsConversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      })
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString(),
    )

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation',
      })
    }

    // Get messages
    const beforeDate = before ? new Date(before) : null
    const messages = await FriendsMessage.getRecentMessages(
      conversationId,
      parseInt(limit),
      beforeDate,
    )

    // Reverse to get chronological order (oldest first)
    const formattedMessages = messages.reverse().map(formatMessage)

    res.status(200).json({
      success: true,
      messages: formattedMessages,
      hasMore: messages.length === parseInt(limit),
    })
  } catch (error) {
    console.error('[CHAT_CONTROLLER] Error fetching messages:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    })
  }
})

// Backend: Updated sendMessage controller with word limits
// @description     Send a message in conversation
// @route           POST /api/friends/chat/conversation/:conversationId/message
// @access          Protected

// Message validation configuration (should match frontend)
const MESSAGE_LIMITS = {
  MAX_WORDS: 200,
  MAX_CHARACTERS: 1000,
}

// Utility function to count words
const countWords = text => {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length
}

// Enhanced message validation
const validateMessageContent = content => {
  const trimmed = content.trim()
  const wordCount = countWords(trimmed)
  const charCount = trimmed.length

  const errors = []

  if (trimmed.length === 0) {
    errors.push('Message content is required')
  }

  if (wordCount > MESSAGE_LIMITS.MAX_WORDS) {
    errors.push(
      `Message exceeds maximum word limit (${MESSAGE_LIMITS.MAX_WORDS} words allowed, got ${wordCount})`,
    )
  }

  if (charCount > MESSAGE_LIMITS.MAX_CHARACTERS) {
    errors.push(
      `Message exceeds maximum character limit (${MESSAGE_LIMITS.MAX_CHARACTERS} characters allowed, got ${charCount})`,
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    wordCount,
    charCount,
    trimmed,
  }
}

const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { conversationId } = req.params
  const { content } = req.body

  try {
    // Enhanced validation with word and character limits
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required and must be a string',
      })
    }

    const validation = validateMessageContent(content)

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0], // Return first error
        errors: validation.errors, // Return all errors for debugging
        validation: {
          wordCount: validation.wordCount,
          charCount: validation.charCount,
          maxWords: MESSAGE_LIMITS.MAX_WORDS,
          maxCharacters: MESSAGE_LIMITS.MAX_CHARACTERS,
        },
      })
    }

    console.log(
      `[CHAT_CONTROLLER] Message validation passed: ${validation.wordCount} words, ${validation.charCount} characters`,
    )

    // Verify conversation and participation
    const conversation = await FriendsConversation.findById(
      conversationId,
    ).populate('participants', 'name inGameName pic isOnline userLanguage')

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      })
    }

    const isParticipant = conversation.participants.some(
      p => p._id.toString() === userId.toString(),
    )

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation',
      })
    }

    // Get other participant for notifications
    const otherParticipant = conversation.getOtherParticipant(userId)
    const sender = conversation.participants.find(
      p => p._id.toString() === userId.toString(),
    )

    console.log(
      '[CHAT_CONTROLLER] Message sender:',
      sender.name,
      'ID:',
      sender._id,
    )
    console.log('[CHAT_CONTROLLER] Message recipient:', otherParticipant._id)

    // Create message with validated content
    const message = new FriendsMessage({
      conversation: conversationId,
      sender: userId,
      content: validation.trimmed, // Use the trimmed content
      status: 'sent',
      metadata: {
        wordCount: validation.wordCount,
        charCount: validation.charCount,
        createdAt: new Date(),
      },
    })

    await message.save()
    await message.populate('sender', 'name inGameName pic isOnline')

    // Update conversation
    conversation.lastMessage = message._id
    conversation.lastMessageAt = new Date()
    await conversation.incrementUnreadCount(otherParticipant._id)

    const formattedMessage = formatMessage(message)

    console.log('[CHAT_CONTROLLER] Formatted message for socket event:', {
      messageId: formattedMessage._id,
      senderId: formattedMessage.sender._id,
      recipientId: otherParticipant._id,
      content: formattedMessage.content.substring(0, 50) + '...',
      wordCount: validation.wordCount,
      charCount: validation.charCount,
    })

    // Emit real-time event - ONLY to recipient, NOT to sender
    globalEmitter.emit('friends:messageReceived', {
      conversationId,
      message: formattedMessage,
      senderId: userId.toString(),
      recipientId: otherParticipant._id.toString(),
    })

    console.log(
      '[CHAT_CONTROLLER] Socket event emitted to recipient only:',
      otherParticipant._id,
    )

    // Optional: Send push notification (commented out as in original)
    // try {
    //   const recipient = conversation.participants.find(
    //     p => p._id.toString() === otherParticipant._id.toString(),
    //   )

    //   const localizedI18n = i18n.cloneInstance({ initImmediate: false })
    //   await localizedI18n.changeLanguage(recipient.userLanguage || 'en')
    //   const t = (key, options) =>
    //     localizedI18n.t(key, { ns: 'friendsChatController', ...options })

    //   // Truncate notification content if too long
    //   let notificationContent = validation.trimmed
    //   if (notificationContent.length > 50) {
    //     notificationContent = notificationContent.substring(0, 47) + '...'
    //   }

    //   await sendNotification({
    //     title: t('New message from {{name}}', { name: sender.name }),
    //     body: notificationContent,
    //     icon: sender.pic,
    //     url: `/home?wiseweb=true&chat=${conversationId}`,
    //     userId: otherParticipant._id.toString(),
    //   })

    //   console.log(
    //     '[CHAT_CONTROLLER] Push notification sent to:',
    //     otherParticipant._id,
    //   )
    // } catch (notifError) {
    //   console.error('[CHAT_CONTROLLER] Notification error:', notifError)
    //   // Don't fail the whole request if notification fails
    // }

    res.status(201).json({
      success: true,
      message: formattedMessage,
      validation: {
        wordCount: validation.wordCount,
        charCount: validation.charCount,
        maxWords: MESSAGE_LIMITS.MAX_WORDS,
        maxCharacters: MESSAGE_LIMITS.MAX_CHARACTERS,
      },
    })
  } catch (error) {
    console.error('[CHAT_CONTROLLER] Error sending message:', error)

    // Enhanced error response
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
})

//@description     Mark messages as read in conversation
//@route           POST /api/friends/chat/conversation/:conversationId/read
//@access          Protected
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { conversationId } = req.params

  try {
    // Verify conversation access
    const conversation = await FriendsConversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      })
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString(),
    )

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation',
      })
    }

    // Mark unread messages as read
    const unreadMessages = await FriendsMessage.find({
      conversation: conversationId,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId },
      isDeleted: false,
    })

    const markReadPromises = unreadMessages.map(message =>
      message.markAsReadBy(userId),
    )

    await Promise.all(markReadPromises)

    // Reset unread count in conversation
    await conversation.resetUnreadCount(userId)

    // Emit read event for real-time updates (to other participants, not self)
    if (unreadMessages.length > 0) {
      globalEmitter.emit('friends:messagesRead', {
        conversationId,
        readerId: userId.toString(), // FIXED: Ensure string type
        messageIds: unreadMessages.map(m => m._id),
      })

      console.log('[CHAT_CONTROLLER] Messages read event emitted:', {
        conversationId,
        readerId: userId.toString(),
        messageCount: unreadMessages.length,
      })
    }

    res.status(200).json({
      success: true,
      markedAsRead: unreadMessages.length,
    })
  } catch (error) {
    console.error('[CHAT_CONTROLLER] Error marking messages as read:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message,
    })
  }
})

//@description     Delete a message (soft delete)
//@route           DELETE /api/friends/chat/message/:messageId
//@access          Protected
const deleteMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { messageId } = req.params

  try {
    const message = await FriendsMessage.findById(messageId)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      })
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      })
    }

    // Soft delete
    message.isDeleted = true
    message.deletedAt = new Date()
    message.deletedBy = userId
    await message.save()

    // Emit delete event (to all conversation participants)
    globalEmitter.emit('friends:messageDeleted', {
      conversationId: message.conversation,
      messageId: message._id,
      deletedBy: userId.toString(), // FIXED: Ensure string type
    })

    console.log('[CHAT_CONTROLLER] Message deleted event emitted:', {
      conversationId: message.conversation,
      messageId: message._id,
      deletedBy: userId.toString(),
    })

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    })
  } catch (error) {
    console.error('[CHAT_CONTROLLER] Error deleting message:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message,
    })
  }
})

//@description     Add reaction to message (future feature)
//@route           POST /api/friends/chat/message/:messageId/reaction
//@access          Protected
const addReaction = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { messageId } = req.params
  const { emoji } = req.body

  try {
    if (!emoji || emoji.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid emoji is required',
      })
    }

    const message = await FriendsMessage.findById(messageId)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      })
    }

    await message.addReaction(userId, emoji)

    // Emit reaction event (to all conversation participants)
    globalEmitter.emit('friends:messageReaction', {
      conversationId: message.conversation,
      messageId: message._id,
      userId: userId.toString(), // FIXED: Ensure string type
      emoji,
      action: 'add',
    })

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
    })
  } catch (error) {
    console.error('[CHAT_CONTROLLER] Error adding reaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message,
    })
  }
})

//@description     Remove reaction from message (future feature)
//@route           DELETE /api/friends/chat/message/:messageId/reaction
//@access          Protected
const removeReaction = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { messageId } = req.params

  try {
    const message = await FriendsMessage.findById(messageId)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      })
    }

    await message.removeReaction(userId)

    // Emit reaction event (to all conversation participants)
    globalEmitter.emit('friends:messageReaction', {
      conversationId: message.conversation,
      messageId: message._id,
      userId: userId.toString(), // FIXED: Ensure string type
      action: 'remove',
    })

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
    })
  } catch (error) {
    console.error('[CHAT_CONTROLLER] Error removing reaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error.message,
    })
  }
})

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  addReaction,
  removeReaction,
  MESSAGE_LIMITS,
}
