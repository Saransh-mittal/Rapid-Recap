const Chat = require('../model/chatSchema')
const Message = require('../model/messageSchema')
const NoteMessage = require('../model/noteMessageSchema')
const { sendNotification } = require('../services/notificationService')
const asyncHandler = require('express-async-handler')
const i18n = require('i18next')
const User = require('../model/userSchema')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')

const notificationNews = async (req, res) => {
  try {
    // If you want to localize this message based on a specific user's language
    const user = await User.findById('6613f495ce72abb1ce9abde3')
    const localizedI18n = i18n.cloneInstance({ initImmediate: false })
    await localizedI18n.changeLanguage(user.userLanguage)
    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'activity.utils', ...options })

    // console.log(t('notifSentSuccess'))
    await sendNotification({
      title: `hello`,
      body: t('sharedArticle'), // Localized text
      url: `/`,
      userId: user._id,
    })
    res.status(200).json({ message: t('notifSentSuccess') })
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.error(error)
  }
}

//@description     Fetch all unique chats count with unread messages
//@route           GET /api/notify/new-message-chats
//@access          Protected
const notificationNewMessageChats = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId)
    i18n.changeLanguage(user.userLanguage)

    const chats = await Chat.find({ users: userId }).populate({
      path: 'latestMessage',
      select: 'readBy isDeleted content sender',
    })

    const unreadChats = chats
      .filter(chat => {
        const latestMessage = chat.latestMessage
        return (
          latestMessage &&
          !latestMessage.readBy.includes(userId) &&
          !latestMessage.isDeleted &&
          !latestMessage.sender.equals(userId) &&
          chat.status !== 'rejected'
        )
      })
      .map(chat => chat._id.toString())

    res.json({ unreadChats })
  } catch (error) {
    res.status(500).json({ message: error.message })
    throw new Error(error.message)
  }
})

// @desc  get all the noteMessages for the user
// @route GET /api/notify/noteMessages
// @access Private
const getNoteMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId)
    await i18n.changeLanguage(user.userLanguage)

    const noteMessages = await NoteMessage.find({ userId, read: false }).sort({
      createdAt: -1,
    })
    await NoteMessage.updateMany({ userId, read: false }, { read: true })

    res.json(noteMessages)
  } catch (error) {
    res.status(500).json({ message: error.message })
    throw new Error(error.message)
  }
})

// @desc  Create an announcement
// @route POST /api/admin/announcement
// @access Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, mainText, img, pushNotificationText } = req.body

  if (!title || !mainText) {
    res.status(400)
    throw new Error('Title and main text are required')
  }

  try {
    // Get all users
    const users = await User.find({})

    // Create application updates for all users
    const updates = users.map(user => ({
      title,
      mainText,
      img,
      userId: user._id,
      type: 'applicationUpdate',
    }))

    await ApplicationUpdates.insertMany(updates)

    // Send push notifications if text is provided
    const notificationText = pushNotificationText || mainText

    // Send notifications to all users
    for (const user of users) {
      await sendNotification({
        title,
        body: notificationText,
        icon: '/images/rrlogo.webp',
        image: img,
        userId: user._id,
      })
    }

    res.status(200).json({ message: 'Announcement sent successfully' })
  } catch (error) {
    console.error('Error creating announcement:', error)
    res.status(500)
    throw new Error('Failed to create announcement')
  }
})

module.exports = {
  notificationNews,
  notificationNewMessageChats,
  getNoteMessages,
  createAnnouncement,
}
