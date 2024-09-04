const Chat = require('../model/chatSchema')
const Message = require('../model/messageSchema')
const NoteMessage = require('../model/noteMessageSchema')
const { sendNotification } = require('../services/notificationService')
const asyncHandler = require('express-async-handler')

const notificationNews = async (req, res) => {
  try {
    await sendNotification({
      title:
        "World's biggest nuclear fusion project in trouble, launch pushed back to 2039",
      image:
        'https://www.techspot.com/images2/news/bigimage/2024/07/2024-07-05-image-10.jpg',
      url: 'https://www.rapidrecap.co.in/',
      userId: '6613f495ce72abb1ce9abde3',
    })
    res.status(200).json({ message: 'Notif sent successfully' })
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
    // Step 1: Find chats the user is part of
    const chats = await Chat.find({ users: userId }).populate({
      path: 'latestMessage',
      select: 'readBy isDeleted content sender', // Select fields to check unread status
    })

    // Step 2: Filter chats with unread latest messages
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

    // Step 3: Return the count of unique chats with unread messages
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
  const noteMessages = await NoteMessage.find({ userId, read: false }).sort({
    createdAt: -1,
  })
  await NoteMessage.updateMany({ userId, read: false }, { read: true })
  res.json(noteMessages)
})

module.exports = {
  notificationNews,
  notificationNewMessageChats,
  getNoteMessages,
}
