const asyncHandler = require('express-async-handler')
const Chat = require('../model/chatSchema')
const User = require('../model/userSchema')
const Message = require('../model/messageSchema')
const Article = require('../model/articleSchema')
const { formatDate, isEncrypted } = require('../utils/miscellaneous.utils')
const { userOpenChats } = require('../sharedState')
const { sendNotification } = require('../services/notificationService')

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    console.log('UserId param not sent with request')
    return res.sendStatus(400)
  }

  const isFriend =
    (await User.findOne({
      _id: userId,
      friends: { $elemMatch: { $eq: req.user._id } },
    })) &&
    (await User.findOne({
      _id: req.user._id,
      friends: { $elemMatch: { $eq: userId } },
    }))

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
      { status: { $in: ['accepted', 'pending'] } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage')

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic email',
  })

  if (isChat.length > 0) {
    if (
      isChat[0].latestMessage &&
      isEncrypted(isChat[0].latestMessage.content)
    ) {
      isChat[0].latestMessage.content = isChat[0].latestMessage.decryptContent()
    }
    res.send(isChat[0])
  } else {
    var chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
      chatCreatedBy: req.user._id,
      status: isFriend ? 'accepted' : 'pending',
    }

    try {
      const createdChat = await Chat.create(chatData)
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password',
      )
      res.status(200).json(FullChat)
    } catch (error) {
      res.status(400)
      throw new Error(error.message)
    }
  }
})

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
      status: { $in: ['accepted', 'pending'] },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async results => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name pic email',
        })
        results = results.filter(
          chat =>
            chat.latestMessage ||
            (chat.chatCreatedBy
              ? chat.chatCreatedBy.toString() === req.user._id.toString()
              : true),
        )
        for (let i = 0; i < results.length; i++) {
          let chat = results[i]
          const messagesCount = await Message.countDocuments({
            chat: chat._id,
          })
          const today = new Date()
          if (
            messagesCount <= 1 &&
            today.getTime() - chat.createdAt.getTime() < 86400000
          ) {
            // Instead of using toObject(), we'll create a new object and copy properties
            let chatObj = Object.assign({}, chat.toObject())
            chatObj.new = true

            // Preserve the decryptContent method if it exists
            if (
              chat.latestMessage &&
              typeof chat.latestMessage.decryptContent === 'function'
            ) {
              chatObj.latestMessage = Object.assign(
                {},
                chat.latestMessage.toObject(),
              )
              chatObj.latestMessage.decryptContent =
                chat.latestMessage.decryptContent.bind(chatObj.latestMessage)
            }

            results[i] = chatObj
          }

          // Decrypt the latest message if it exists
          if (
            results[i].latestMessage &&
            results[i].latestMessage.content &&
            isEncrypted(results[i].latestMessage.content)
          ) {
            results[i].latestMessage.content =
              results[i].latestMessage.decryptContent()
          }
        }
        res.status(200).send(results)
      })
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please Fill all the feilds' })
  }

  var users = JSON.parse(req.body.users)

  if (users.length < 2) {
    return res
      .status(400)
      .send('More than 2 users are required to form a group chat')
  }

  users.push(req.user)

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    })

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')

    res.status(200).json(fullGroupChat)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    },
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

  if (!updatedChat) {
    res.status(404)
    throw new Error('Chat Not Found')
  } else {
    res.json(updatedChat)
  }
})

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    },
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

  if (!removed) {
    res.status(404)
    throw new Error('Chat Not Found')
  } else {
    res.json(removed)
  }
})

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    },
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

  if (!added) {
    res.status(404)
    throw new Error('Chat Not Found')
  } else {
    res.json(added)
  }
})

// @desc    Share a message to a particular chat
// @route   POST /api/chat/share
// @access  Protected
const shareMessage = asyncHandler(async (req, res) => {
  const { chatIds, type, articleId } = req.body

  const article = await Article.findById(articleId).select(
    '_id title category dateTime imgURL',
  )
  if (!article) {
    res.status(404)
    throw new Error('Article not found')
  }
  const sender = await User.findById(req.user._id).select('pic name')
  const newMessages = []
  for (let chatId of chatIds) {
    const chat = await Chat.findById(chatId)
    if (!chat) {
      res.status(404)
      throw new Error('Chat not found')
    }
    if (
      chat.status !== 'accepted' &&
      chat.latestMessage &&
      chat.requestedBy.toString() !== req.user._id.toString()
    ) {
      continue // Skip this chat if it's not accepted and the sender isn't the requester
    }
    let newMessage = new Message({
      sender: req.user._id,
      chat: chatId,
      type: type,
      article: {
        _id: article._id,
        title: article.title,
        category: article.category,
        date: formatDate(article.dateTime),
        image: article.imgURL[0],
      },
      status: 'sent',
    })
    await newMessage.save()
    chat.latestMessage = newMessage
    await chat.save()

    const chatUsers = chat.users
    for (let user of chatUsers) {
      if (user.toString() !== req.user._id.toString()) {
        const userChats = userOpenChats.get(user._id.toString())
        // Only send notification if the user doesn't have this chat open
        if (!userChats || !userChats.has(chatId)) {
          await sendNotification({
            title: `New message from ${sender.name}`,
            body: 'Shared an Article',
            icon: sender.pic,
            url: `/chats?chatId=${chatId}`,
            userId: user._id,
            messageId: newMessage._id.toString(),
          })
        }
      }
    }
    newMessage = await newMessage.populate('sender', 'name pic')
    newMessage = await newMessage.populate('chat')
    newMessage = await User.populate(newMessage, {
      path: 'chat.users',
      select: 'name pic email',
    })
    newMessages.push(newMessage)
  }

  res.status(200).json(newMessages)
})

// @desc    Handle Chat Request
// @route   POST /api/chat//request/handle
// @access  Protected
const handleChatRequest = asyncHandler(async (req, res) => {
  const { chatId, action } = req.body

  if (action !== 'accept' && action !== 'reject') {
    res.status(400)
    throw new Error('Invalid action')
  }

  try {
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, status: 'pending' },
      { status: action === 'accept' ? 'accepted' : 'rejected' },
      { new: true },
    ).populate('users', '-password')

    if (!updatedChat) {
      res.status(404)
      throw new Error('Chat request not found or already handled')
    }
    const { name } = await User.findById(req.user._id).select('name')
    // Create a system message for the chat
    const systemMessage = await Message.create({
      sender: req.user._id,
      content: `Chat request ${action}ed by ${name}`,
      chat: chatId,
      type: 'system',
    })

    await sendNotification({
      title: 'Chat Request Update',
      body: `${req.user.name} has ${action}ed your chat request`,
      icon: req.user.pic,
      url: `/chats?chatId=${chatId}`,
      userId: updatedChat.requestedBy,
    })

    res.json({ chat: updatedChat, systemMessage })
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  shareMessage,
  handleChatRequest,
}
