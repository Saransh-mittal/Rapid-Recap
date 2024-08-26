const express = require('express')
const {
  notificationNews,
  notificationNewMessageChats,
  getNoteMessages,
} = require('../controllers/notification')
const { Authenticate } = require('../middleware/authenticate')
const router = express.Router()

router.route('/news').get(notificationNews)
router
  .route('/new-message-chats')
  .get(Authenticate, notificationNewMessageChats)

router.route('/noteMessages').get(Authenticate, getNoteMessages)

module.exports = router
