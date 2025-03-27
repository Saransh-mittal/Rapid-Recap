const express = require('express')
const {
  notificationNews,
  notificationNewMessageChats,
  getNoteMessages,
} = require('../controllers/notification')
const {
  getNotificationPreferences,
  updateNotificationPreferences,
} = require('../controllers/notificationPreferencesController')
const { Authenticate } = require('../middleware/authenticate')
const router = express.Router()

router.route('/news').get(notificationNews)
router
  .route('/new-message-chats')
  .get(Authenticate, notificationNewMessageChats)

router.route('/noteMessages').get(Authenticate, getNoteMessages)

// New notification preferences routes
router.route('/preferences').get(Authenticate, getNotificationPreferences)
router.route('/preferences').put(Authenticate, updateNotificationPreferences)

module.exports = router
