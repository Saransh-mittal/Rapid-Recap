// socket.js
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
const {
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,
} = require('./utils/quickClashSocket.utils')

// Enhanced tracking maps for device-aware connections
const userDeviceConnections = new Map() // userId -> Map(deviceFingerprint -> Set(socketIds))
const socketMetadata = new Map() // socketId -> { userId, deviceFingerprint, connectedAt }

function initializeSocket(server) {
  const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
      origin: 'http://localhost:5173', // change at the time of production
      // credentials: true,
    },
  })

  io.on('connection', socket => {
    console.log(`New socket connection: ${socket.id}`)

    // Enhanced setup with device fingerprinting
    socket.on('setup', async userData => {
      const userId = userData._id
      const deviceFingerprint = userData.deviceFingerprint

      if (!userId) {
        console.error('Setup called without user ID')
        return
      }

      console.log(
        `[SETUP] User ${userId} attempting setup${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ' without device fingerprint'
        } (socket: ${socket.id})`,
      )

      // Check if this socket already completed setup (to prevent duplicate room joins)
      const existingMetadata = socketMetadata.get(socket.id)
      if (existingMetadata && existingMetadata.setupCompleted) {
        console.log(
          `[SETUP] Socket ${socket.id} setup already completed, skipping`,
        )
        socket.emit('connected')
        return
      }

      // Handle device fingerprinting (this will update or create metadata)
      if (deviceFingerprint) {
        await handleDeviceAwareSetup(socket, userData, deviceFingerprint)
      } else {
        // Fallback for legacy connections without device fingerprinting
        await handleLegacySetup(socket, userData)
      }

      // Mark setup as completed
      const metadata = socketMetadata.get(socket.id)
      if (metadata) {
        metadata.setupCompleted = true
      }

      // Join user's room and initialize other features
      socket.join(userId)

      // DEBUG: Verify room joining
      console.log(`DEBUG: Socket ${socket.id} joined room quickClash:${userId}`)
      const userRoom = `quickClash:${userId}`
      setTimeout(() => {
        const socketsInRoom = io.sockets.adapter.rooms.get(userRoom)
        console.log(
          `DEBUG: Room ${userRoom} now has ${
            socketsInRoom ? socketsInRoom.size : 0
          } sockets`,
        )
      }, 100)

      socket.emit('connected')
      userOpenChats.set(userId, new Set())

      // Update user online status
      await redis.setex(`user:${userId}:lastHeartbeat`, 90, Date.now())
      await User.findByIdAndUpdate(userId, { isOnline: true })
      socket.broadcast.emit('user online', userId)

      // Setup Quick Clash handlers
      setupQuickClashSocketHandlers(io, socket, userData)

      console.log(
        `[SETUP] Setup completed for user ${userId} (socket: ${socket.id})`,
      )
    })

    // Handle device registration (called before or after setup)
    socket.on('quickClash:registerDevice', async ({ deviceFingerprint }) => {
      if (!deviceFingerprint) {
        console.error('Device registration called without fingerprint')
        return
      }

      console.log(
        `[DEVICE_REG] Socket ${
          socket.id
        } registering device: ${deviceFingerprint.substring(0, 8)}...`,
      )

      // Check if socket already has device fingerprint registered
      const existingMetadata = socketMetadata.get(socket.id)
      if (
        existingMetadata &&
        existingMetadata.deviceFingerprint === deviceFingerprint
      ) {
        console.log(
          `[DEVICE_REG] Socket ${socket.id} already registered with this device, skipping`,
        )
        socket.emit('quickClash:deviceRegistered', {
          deviceFingerprint: deviceFingerprint.substring(0, 8) + '...',
          socketId: socket.id,
          isUnique: true,
        })
        return
      }

      // Store device fingerprint with socket (don't mark as setup completed)
      if (existingMetadata) {
        existingMetadata.deviceFingerprint = deviceFingerprint
      } else {
        socketMetadata.set(socket.id, {
          userId: null,
          deviceFingerprint,
          connectedAt: new Date(),
          setupCompleted: false, // Important: setup not completed yet
        })
      }

      // Confirm registration
      socket.emit('quickClash:deviceRegistered', {
        deviceFingerprint: deviceFingerprint.substring(0, 8) + '...',
        socketId: socket.id,
        isUnique: true,
      })

      console.log(
        `[DEVICE_REG] Device registration completed for socket ${socket.id}`,
      )
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

    // Enhanced user disconnection handling
    socket.on('user-disconnected', async userId => {
      await handleUserDisconnection(socket.id, userId)
    })

    // Enhanced disconnect handling
    socket.on('disconnect', () => {
      handleSocketDisconnection(socket.id)
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
      socket.emit('quiz_generation_progress', { progress: 5 })
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

  /**
   * Handle device-aware setup for sockets with fingerprinting
   */
  async function handleDeviceAwareSetup(socket, userData, deviceFingerprint) {
    const userId = userData._id
    const socketId = socket.id

    // Update existing metadata or create new one
    let metadata = socketMetadata.get(socketId)
    if (metadata) {
      // Update existing metadata with user info
      metadata.userId = userId
      metadata.deviceFingerprint = deviceFingerprint
    } else {
      // Create new metadata
      metadata = {
        userId,
        deviceFingerprint,
        connectedAt: new Date(),
        setupCompleted: false,
      }
      socketMetadata.set(socketId, metadata)
    }

    // Initialize user's device map if not exists
    if (!userDeviceConnections.has(userId)) {
      userDeviceConnections.set(userId, new Map())
    }

    const userDevices = userDeviceConnections.get(userId)

    // Check if this device already has active connections
    if (userDevices.has(deviceFingerprint)) {
      const existingSockets = userDevices.get(deviceFingerprint)

      if (existingSockets.size > 0) {
        // Check if any existing socket is still actually connected
        const stillConnectedSockets = Array.from(existingSockets).filter(
          socketId => {
            const existingSocket = io.sockets.sockets.get(socketId)
            return existingSocket && existingSocket.connected
          },
        )

        if (stillConnectedSockets.length > 0) {
          console.log(
            `Found ${
              stillConnectedSockets.length
            } still connected socket(s) for user ${userId} device ${deviceFingerprint.substring(
              0,
              8,
            )}...`,
          )

          // Only disconnect if we have truly active connections
          stillConnectedSockets.forEach(existingSocketId => {
            const existingSocket = io.sockets.sockets.get(existingSocketId)
            if (existingSocket && existingSocket.connected) {
              console.log(
                `Disconnecting existing socket ${existingSocketId} for device conflict`,
              )
              existingSocket.emit('quickClash:deviceConflict', {
                message:
                  'Another connection from this device has been established',
                newSocketId: socketId,
              })
              existingSocket.disconnect(true)
            }
          })
        }

        // Clean up any disconnected socket references
        const socketsToRemove = Array.from(existingSockets).filter(socketId => {
          const existingSocket = io.sockets.sockets.get(socketId)
          return !existingSocket || !existingSocket.connected
        })

        socketsToRemove.forEach(socketId => {
          existingSockets.delete(socketId)
          socketMetadata.delete(socketId)
        })
      }
    }

    // Ensure socket set exists for this device (create if not exists or if cleared)
    if (!userDevices.has(deviceFingerprint)) {
      userDevices.set(deviceFingerprint, new Set())
    }

    // Add new socket to device set
    userDevices.get(deviceFingerprint).add(socketId)

    console.log(
      `User ${userId} connected with device ${deviceFingerprint.substring(
        0,
        8,
      )}... (socket: ${socketId})`,
    )
  }

  /**
   * Handle legacy setup for sockets without device fingerprinting
   */
  async function handleLegacySetup(socket, userData) {
    const userId = userData._id
    const socketId = socket.id

    console.log(
      `User ${userId} connected without device fingerprinting (legacy mode)`,
    )

    // Store basic metadata
    socketMetadata.set(socketId, {
      userId,
      deviceFingerprint: null,
      connectedAt: new Date(),
    })
  }

  /**
   * Handle socket disconnection with device awareness
   */
  function handleSocketDisconnection(socketId) {
    const metadata = socketMetadata.get(socketId)

    if (!metadata) {
      console.log(`Socket ${socketId} disconnected (no metadata found)`)
      return
    }

    const { userId, deviceFingerprint } = metadata

    console.log(
      `Socket ${socketId} disconnected for user ${userId}${
        deviceFingerprint
          ? ` device ${deviceFingerprint.substring(0, 8)}...`
          : ' (legacy)'
      }`,
    )

    // Clean up device-aware tracking
    if (deviceFingerprint && userDeviceConnections.has(userId)) {
      const userDevices = userDeviceConnections.get(userId)

      if (userDevices.has(deviceFingerprint)) {
        const deviceSockets = userDevices.get(deviceFingerprint)
        deviceSockets.delete(socketId)

        // Only clean up device entry if no more sockets AND not in a setup process
        // We check if the Set is empty and wait a brief moment to avoid race conditions
        if (deviceSockets.size === 0) {
          // Use a small delay to avoid race condition with new connections
          setTimeout(() => {
            // Double-check that the Set is still empty after the delay
            if (deviceSockets.size === 0) {
              userDevices.delete(deviceFingerprint)
              console.log(
                `Device ${deviceFingerprint.substring(
                  0,
                  8,
                )}... for user ${userId} completely disconnected`,
              )

              // If user has no more devices connected, clean up user entry
              if (userDevices.size === 0) {
                userDeviceConnections.delete(userId)
                console.log(
                  `User ${userId} completely disconnected (no active devices)`,
                )
              }
            }
          }, 100) // 100ms delay to allow for immediate reconnections
        }
      }
    }

    // Clean up metadata immediately
    socketMetadata.delete(socketId)
  }

  /**
   * Handle user disconnection event
   */
  async function handleUserDisconnection(socketId, userId) {
    console.log(`User ${userId} explicitly disconnecting`)

    userOpenChats.delete(userId)

    // Get socket instance and leave user room
    const socket = io.sockets.sockets.get(socketId)
    if (socket) {
      socket.leave(userId)
    }

    // Clean up Redis and database
    await redis.del(`user:${userId}:lastHeartbeat`)
    await User.findByIdAndUpdate(userId, { isOnline: false })

    // Broadcast offline status
    io.emit('user offline', userId)

    // Handle socket disconnection cleanup
    handleSocketDisconnection(socketId)
  }

  /**
   * Get connection statistics for monitoring
   */
  function getConnectionStats() {
    const stats = {
      totalSockets: socketMetadata.size,
      totalUsers: userDeviceConnections.size,
      totalDevices: 0,
      userBreakdown: {},
      legacyConnections: 0,
    }

    // Count legacy connections (without device fingerprinting)
    for (const [socketId, metadata] of socketMetadata.entries()) {
      if (!metadata.deviceFingerprint) {
        stats.legacyConnections++
      }
    }

    // Count device-aware connections
    for (const [userId, userDevices] of userDeviceConnections.entries()) {
      stats.totalDevices += userDevices.size

      const userStats = {
        devices: userDevices.size,
        sockets: 0,
      }

      for (const [deviceFingerprint, socketSet] of userDevices.entries()) {
        userStats.sockets += socketSet.size
      }

      stats.userBreakdown[userId] = userStats
    }

    return stats
  }

  // Setup Quick Clash global events
  setupQuickClashGlobalEvents(io)

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

  globalEmitter.on('force-reload', () => {
    io.emit('force-reload')
    console.log('Force reload emitted to all clients')
  })

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

  // Expose connection stats for monitoring
  io.getConnectionStats = getConnectionStats

  exports.io = io
}

module.exports = { initializeSocket }
