// router/friendsChatRoutes.js - Chat-specific routes for WiseWeb
const express = require('express')
const { Authenticate } = require('../middleware/authenticate')
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  addReaction,
  removeReaction,
} = require('../controllers/friendsChatController')

const router = express.Router()

// Get all conversations for user
router.get('/conversations', Authenticate, getConversations)

// Get or create conversation with a friend
router.post('/conversation', Authenticate, getOrCreateConversation)

// Get messages in a conversation
router.get('/conversation/:conversationId/messages', Authenticate, getMessages)

// Send a message
router.post('/conversation/:conversationId/message', Authenticate, sendMessage)

// Mark messages as read
router.post(
  '/conversation/:conversationId/read',
  Authenticate,
  markMessagesAsRead,
)

// Delete a message
router.delete('/message/:messageId', Authenticate, deleteMessage)

// Add reaction to message (future feature)
router.post('/message/:messageId/reaction', Authenticate, addReaction)

// Remove reaction from message (future feature)
router.delete('/message/:messageId/reaction', Authenticate, removeReaction)

module.exports = router

// ============================================================================
