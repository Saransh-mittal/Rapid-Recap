const Chat = require('../model/chatSchema')
const Message = require('../model/messageSchema')
const NoteMessage = require('../model/noteMessageSchema')
const { sendNotification } = require('../services/notificationService')
const asyncHandler = require('express-async-handler')
const i18n = require('../i18n')
const User = require('../model/userSchema')

const notificationNews = async (req, res) => {
  try {
    // If you want to localize this message based on a specific user's language
    // const user = await User.findById(req.body.userId);
    // i18n.changeLanguage(user.userLanguage);

    await sendNotification({
      title: i18n.t('nuclearFusionTrouble'),
      image:
        'https://www.techspot.com/images2/news/bigimage/2024/07/2024-07-05-image-10.jpg',
      url: 'https://www.rapidrecap.co.in/',
      userId: '6613f495ce72abb1ce9abde3',
    })
    res.status(200).json({ message: i18n.t('notifSentSuccess') })
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
    i18n.changeLanguage(user.userLanguage)

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

module.exports = {
  notificationNews,
  notificationNewMessageChats,
  getNoteMessages,
}
