const Message = require('./model/messageSchema')
const User = require('./model/userSchema')
const Chat = require('./model/chatSchema')
const { redis } = require('./redis')
const { userOpenChats } = require('./sharedState')
const {
  checkUserOnlineStatus,
  checkUserBatch,
} = require('./utils/miscellaneous.utils')
const globalEmitter = require('./eventEmitter')

function initializeSocket(server) {
  const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
      origin: 'http://localhost:5173', // change at the time of production
      // credentials: true,
    },
  })

  io.on('connection', socket => {
    socket.on('setup', async userData => {
      socket.join(userData._id)
      socket.emit('connected')
      userOpenChats.set(userData._id, new Set())
      // update user online status in db
      await redis.setex(`user:${userData._id}:lastHeartbeat`, 90, Date.now())
      await User.findByIdAndUpdate(userData._id, { isOnline: true })
      socket.broadcast.emit('user online', userData._id)
    })

    socket.on('heartbeat', async userId => {
      await redis.setex(`user:${userId}:lastHeartbeat`, 90, Date.now())
    })

    socket.on('join chat', room => {
      socket.join(room)
    })
    socket.on('typing', room => socket.in(room).emit('typing'))
    socket.on('stop typing', room => socket.in(room).emit('stop typing'))

    socket.on('new message', async newMessageRecieved => {
      var chat = newMessageRecieved.chat
      if (!chat.users) return console.log('chat.users not defined')

      // Decrypt the message content before broadcasting
      const decryptedMessage = { ...newMessageRecieved }
      try {
        const originalMessage = await Message.findById(newMessageRecieved._id)
        decryptedMessage.content = originalMessage.decryptContent()
      } catch (error) {
        console.error('Error decrypting message:', error)
      }

      chat.users.forEach(user => {
        if (user._id == newMessageRecieved.sender._id) return

        socket.in(user._id).emit('message recieved', decryptedMessage)
        // Send notification for unread message
        socket.in(user._id).emit('unread notification', {
          messageId: newMessageRecieved._id,
          chatId: chat._id,
          senderId: newMessageRecieved.sender._id,
        })
      })
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          newMessageRecieved._id,
          { status: 'sent' },
          { new: true },
        )
        socket.emit('message status updated', {
          messageId: updatedMessage._id,
          status: 'sent',
        })
      } catch (error) {
        console.error('Error updating message status:', error)
      }
    })
    // New event listener for message delivered
    socket.on('message delivered', async ({ messageId, userId }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { status: 'delivered' },
          { new: true },
        )
        const userChats = userOpenChats.get(userId)
        if (userChats && userChats.has(updatedMessage.chat.toString())) {
          const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { status: 'read', $addToSet: { readBy: userId } },
            { new: true },
          )

          io.to(updatedMessage.sender.toString()).emit(
            'message status updated',
            {
              messageId,
              status: 'read',
            },
          )
          return
        }
        io.to(updatedMessage.sender.toString()).emit('message status updated', {
          messageId,
          status: 'delivered',
        })
      } catch (error) {
        console.error('Error updating message delivery status:', error)
      }
    })

    socket.on('message read', async ({ messageId, userId }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { status: 'read', $addToSet: { readBy: userId } },
          { new: true },
        )

        io.to(updatedMessage.sender.toString()).emit('message status updated', {
          messageId,
          status: 'read',
        })
      } catch (error) {
        console.error('Error updating message read status:', error)
      }
    })

    socket.on('delete message', async deletedMessageInfo => {
      const { chatId, messageId, deleteType, senderId } = deletedMessageInfo
      // Emit the delete event to all users in the chat except the sender
      socket
        .to(chatId)
        .emit('message deleted', { messageId, deleteType, chatId })

      const chat = await Chat.findById(chatId)
      if (chat) {
        const allUsersId = chat.users.map(user => user._id.toString())
        for (let userId of allUsersId) {
          if (userId !== senderId) {
            io.to(userId).emit('message deleted', {
              messageId,
              deleteType,
              chatId,
            })
          }
        }
      }
    })

    // New event to handle when a user opens a chat
    socket.on('open chat', ({ userId, chatId }) => {
      if (userId && chatId) {
        const userChats = userOpenChats.get(userId) || new Set()
        userChats.add(chatId)
        userOpenChats.set(userId, userChats)
      }
    })

    // New event to handle when a user closes a chat
    socket.on('close chat', ({ userId, chatId }) => {
      if (userId && chatId) {
        const userChats = userOpenChats.get(userId)
        if (userChats) {
          userChats.delete(chatId)
        }
      }
    })
    socket.on('user-disconnected', async userId => {
      userOpenChats.delete(userId)
      socket.leave(userId)
      await redis.del(`user:${userId}:lastHeartbeat`)
      await User.findByIdAndUpdate(userId, { isOnline: false })
      socket.broadcast.emit('user offline', userId)
    })
    socket.on('check online status', async friendIds => {
      const onlineStatuses = {}
      for (const friendId of friendIds) {
        const isOnline = await checkUserOnlineStatus(friendId)
        if (!isOnline) {
          await User.findByIdAndUpdate(friendId, { isOnline: false })
          io.emit('user offline', friendId)
        }
        onlineStatuses[friendId] = isOnline
      }

      socket.emit('online status response', onlineStatuses)
    })
    // Add this new event listener for quiz progress
    socket.on('join quiz progress', userId => {
      socket.join(`quiz_progress_${userId}`)
    })

    // Add this new event handler for quiz submission progress
    socket.on('join quiz submission progress', userId => {
      socket.join(`quiz_submission_progress_${userId}`)
    })
    // Add this new event handler for tournament quiz submission progress
    socket.on('join tournament quiz submission progress', userId => {
      socket.join(`tournament_quiz_submission_progress_${userId}`)
    })
    socket.off('setup', userData => {
      userOpenChats.delete(userData._id)
      socket.leave(userData._id)
      socket.broadcast.emit('user offline', userData._id)
    })
  })
  // Bridge between custom emitter and Socket.IO
  globalEmitter.on('quiz_progress', ({ userId, progress }) => {
    io.to(`quiz_progress_${userId}`).emit('quiz_generation_progress', {
      progress,
    })
  })
  // Update this bridge for quiz submission progress
  globalEmitter.on(
    'quiz_submission_progress',
    ({ userId, stepId, progress }) => {
      io.to(`quiz_submission_progress_${userId}`).emit(
        'quiz_submission_progress',
        {
          stepId,
          progress,
        },
      )
    },
  )
  // Bridge between custom emitter and Socket.IO for tournament quiz submission progress
  globalEmitter.on(
    'tournament_quiz_submission_progress',
    ({ userId, stepId, progress }) => {
      io.to(`tournament_quiz_submission_progress_${userId}`).emit(
        'tournament_quiz_submission_progress',
        {
          stepId,
          progress,
        },
      )
    },
  )
  // Set up periodic heartbeat checking
  const HEARTBEAT_CHECK_INTERVAL = 60000 // 1 minute
  const BATCH_SIZE = 1000

  setInterval(async () => {
    const onlineUsers = await User.find({ isOnline: true }, '_id').lean()
    for (let i = 0; i < onlineUsers.length; i += BATCH_SIZE) {
      const batch = onlineUsers.slice(i, i + BATCH_SIZE).map(user => user._id)
      const offlineUsers = await checkUserBatch(batch)
      if (offlineUsers.length > 0) {
        await User.updateMany(
          { _id: { $in: offlineUsers } },
          { isOnline: false },
        )
        offlineUsers.forEach(userId => {
          redis.del(`user:${userId}:lastHeartbeat`)
          io.emit('user offline', userId)
        })
      }
    }
  }, HEARTBEAT_CHECK_INTERVAL)

  exports.io = io
}

module.exports = { initializeSocket }
