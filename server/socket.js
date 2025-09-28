// socket.js - CLEANED: Removed duplicate handlers that are now in friendsSocket.utils.js
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
const {
  setupFriendsSocketHandlers,
  setupFriendsGlobalEvents,
} = require('./utils/friendsSocket.utils')

// Enhanced tracking maps for device-aware connections
const userDeviceConnections = new Map() // userId -> Map(deviceFingerprint -> Set(socketIds))
const socketMetadata = new Map() // socketId -> { userId, deviceFingerprint, connectedAt }

// FIXED: Track message IDs to prevent duplicate socket emissions (for legacy chat system)
const recentMessageIds = new Set()
const MESSAGE_ID_CLEANUP_INTERVAL = 300000 // 5 minutes

// Helper function to get allowed origins for CORS
function getAllowedOrigins() {
  const origins = []

  if (process.env.NODE_ENV === 'production') {
    origins.push('https://rapidrecap.ai')
  } else {
    // Development origins
    origins.push('http://localhost:5173')
    origins.push('http://localhost:3001')
    origins.push('http://127.0.0.1:5173')
    origins.push('http://127.0.0.1:3001')

    // Add local network access - get local IP
    const os = require('os')
    const networkInterfaces = os.networkInterfaces()

    Object.keys(networkInterfaces).forEach(interfaceName => {
      networkInterfaces[interfaceName].forEach(interface => {
        if (interface.family === 'IPv4' && !interface.internal) {
          origins.push(`http://${interface.address}:5173`)
          origins.push(`http://${interface.address}:3001`)
          console.log(
            `[SOCKET] Added network origin: http://${interface.address}:5173`,
          )
        }
      })
    })

    // Custom development origins from environment variable
    if (process.env.DEV_ALLOWED_ORIGINS) {
      const customOrigins = process.env.DEV_ALLOWED_ORIGINS.split(',')
      origins.push(...customOrigins)
      console.log(`[SOCKET] Added custom origins:`, customOrigins)
    }
  }

  console.log(`[SOCKET] Allowed CORS origins:`, origins)
  return origins
}

// Helper function to prevent duplicate message processing (for legacy chat system)
const shouldProcessMessage = messageId => {
  if (recentMessageIds.has(messageId)) {
    console.log('[SOCKET] Skipping duplicate message:', messageId)
    return false
  }

  recentMessageIds.add(messageId)

  // Clean up old message IDs periodically
  if (recentMessageIds.size > 10000) {
    // Prevent memory leaks
    const oldestIds = Array.from(recentMessageIds).slice(0, 1000)
    oldestIds.forEach(id => recentMessageIds.delete(id))
  }

  return true
}

// Clean up old message IDs periodically
setInterval(() => {
  if (recentMessageIds.size > 5000) {
    recentMessageIds.clear()
    console.log('[SOCKET] Cleaned up recent message IDs cache')
  }
}, MESSAGE_ID_CLEANUP_INTERVAL)

function initializeSocket(server) {
  const allowedOrigins = getAllowedOrigins()

  const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true)

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true)
        }

        // In development, be more permissive for local network
        if (process.env.NODE_ENV !== 'production') {
          // Allow any localhost or 127.0.0.1 with different ports
          if (
            origin.match(
              /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/,
            )
          ) {
            console.log(`[SOCKET] Allowing development origin: ${origin}`)
            return callback(null, true)
          }
        }

        console.warn(`[SOCKET] Blocked origin: ${origin}`)
        callback(new Error('Not allowed by CORS'))
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  })

  // Log server network information
  if (process.env.NODE_ENV !== 'production') {
    const os = require('os')
    const networkInterfaces = os.networkInterfaces()

    console.log('\n[SOCKET] Server accessible on:')
    console.log('- http://localhost:3000 (local only)')

    Object.keys(networkInterfaces).forEach(interfaceName => {
      networkInterfaces[interfaceName].forEach(interface => {
        if (interface.family === 'IPv4' && !interface.internal) {
          console.log(`- http://${interface.address}:3000 (network access)`)
        }
      })
    })
    console.log('')
  }

  io.on('connection', socket => {
    console.log(
      `New socket connection: ${socket.id} from ${socket.handshake.address}`,
    )

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
        } (socket: ${socket.id}) from ${socket.handshake.address}`,
      )

      // Store user data on socket for authentication
      socket.user = userData
      socket.userId = userId

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

      // Join user's room AFTER device setup is complete
      socket.join(userId)
      console.log(`[SETUP] Socket ${socket.id} joined room: ${userId}`)

      // Join QuickClash room
      const userRoom = `quickClash:${userId}`
      socket.join(userRoom)
      console.log(
        `[SETUP] Socket ${socket.id} joined QuickClash room: ${userRoom}`,
      )

      socket.emit('connected')
      userOpenChats.set(userId, new Set())

      // Update user online status
      await redis.setex(`user:${userId}:lastHeartbeat`, 90, Date.now())
      await User.findByIdAndUpdate(userId, { isOnline: true })
      socket.broadcast.emit('user online', userId)

      // Setup Quick Clash handlers AFTER room joining and user data is stored
      setupQuickClashSocketHandlers(io, socket, userData)

      // Setup Friends socket handlers for real-time friend interactions
      setupFriendsSocketHandlers(io, socket, userData)

      console.log(
        `[SETUP] Setup completed for user ${userId} (socket: ${socket.id}) from ${socket.handshake.address}`,
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
        } registering device: ${deviceFingerprint.substring(0, 8)}... from ${
          socket.handshake.address
        }`,
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

      // Store device fingerprint with socket
      if (existingMetadata) {
        existingMetadata.deviceFingerprint = deviceFingerprint
      } else {
        socketMetadata.set(socket.id, {
          userId: null,
          deviceFingerprint,
          connectedAt: new Date(),
          setupCompleted: false,
          clientAddress: socket.handshake.address,
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

    // Core socket handlers
    socket.on('heartbeat', async userId => {
      await redis.setex(`user:${userId}:lastHeartbeat`, 90, Date.now())
    })

    // Legacy chat system handlers (kept for backward compatibility)
    socket.on('join chat', room => {
      socket.join(room)
    })

    socket.on('typing', room => socket.in(room).emit('typing'))
    socket.on('stop typing', room => socket.in(room).emit('stop typing'))

    // Legacy message handler (for old chat system)
    socket.on('new message', async newMessageRecieved => {
      var chat = newMessageRecieved.chat
      if (!chat.users) return console.log('chat.users not defined')

      // Check for duplicate message processing
      if (!shouldProcessMessage(newMessageRecieved._id)) {
        console.log(
          '[SOCKET] Skipping duplicate message processing:',
          newMessageRecieved._id,
        )
        return
      }

      // Get sender information
      const senderId = newMessageRecieved.sender._id
      console.log('[SOCKET] Processing legacy message from sender:', senderId)

      // Decrypt the message content before broadcasting
      const decryptedMessage = { ...newMessageRecieved }
      try {
        const originalMessage = await Message.findById(newMessageRecieved._id)
        decryptedMessage.content = originalMessage.decryptContent()
      } catch (error) {
        console.error('Error decrypting legacy message:', error)
      }

      // Send message to all chat participants EXCEPT the sender
      chat.users.forEach(user => {
        const userId = user._id.toString()

        // Skip sending message back to the sender
        if (userId === senderId.toString()) {
          console.log(
            '[SOCKET] Skipping legacy message send to sender:',
            userId,
          )
          return
        }

        console.log('[SOCKET] Sending legacy message to user:', userId)
        socket.in(userId).emit('message recieved', decryptedMessage)

        // Send notification for unread message
        socket.in(userId).emit('unread notification', {
          messageId: newMessageRecieved._id,
          chatId: chat._id,
          senderId: senderId,
        })
      })

      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          newMessageRecieved._id,
          { status: 'sent' },
          { new: true },
        )

        // Only send status update to the sender
        socket.emit('message status updated', {
          messageId: updatedMessage._id,
          status: 'sent',
        })
      } catch (error) {
        console.error('Error updating legacy message status:', error)
      }
    })

    // Legacy message status handlers
    socket.on('message delivered', async ({ messageId, userId }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { status: 'delivered' },
          { new: true },
        )

        if (!updatedMessage) return

        const userChats = userOpenChats.get(userId)
        if (userChats && userChats.has(updatedMessage.chat.toString())) {
          const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { status: 'read', $addToSet: { readBy: userId } },
            { new: true },
          )

          const senderId = updatedMessage.sender.toString()
          if (senderId !== userId) {
            io.to(senderId).emit('message status updated', {
              messageId,
              status: 'read',
            })
          }
          return
        }

        const senderId = updatedMessage.sender.toString()
        if (senderId !== userId) {
          io.to(senderId).emit('message status updated', {
            messageId,
            status: 'delivered',
          })
        }
      } catch (error) {
        console.error('Error updating legacy message delivery status:', error)
      }
    })

    socket.on('message read', async ({ messageId, userId }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { status: 'read', $addToSet: { readBy: userId } },
          { new: true },
        )

        if (!updatedMessage) return

        const senderId = updatedMessage.sender.toString()
        if (senderId !== userId) {
          io.to(senderId).emit('message status updated', {
            messageId,
            status: 'read',
          })
        }
      } catch (error) {
        console.error('Error updating legacy message read status:', error)
      }
    })

    // Legacy delete message handler
    socket.on('delete message', async deletedMessageInfo => {
      const { chatId, messageId, deleteType, senderId } = deletedMessageInfo

      console.log('[SOCKET] Processing legacy message deletion:', {
        messageId,
        senderId,
        deleteType,
      })

      try {
        const chat = await Chat.findById(chatId)
        if (chat) {
          const allUsersId = chat.users.map(user => user._id.toString())

          // Send deletion event to all users EXCEPT the sender
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
      } catch (error) {
        console.error('[SOCKET] Error handling legacy message deletion:', error)
      }
    })

    // Chat room management (legacy)
    socket.on('open chat', ({ userId, chatId }) => {
      if (userId && chatId) {
        const userChats = userOpenChats.get(userId) || new Set()
        userChats.add(chatId)
        userOpenChats.set(userId, userChats)
        console.log('[SOCKET] User opened legacy chat:', userId, chatId)
      }
    })

    socket.on('close chat', ({ userId, chatId }) => {
      if (userId && chatId) {
        const userChats = userOpenChats.get(userId)
        if (userChats) {
          userChats.delete(chatId)
          console.log('[SOCKET] User closed legacy chat:', userId, chatId)
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

    // Online status checker
    socket.on('check online status', async friendIds => {
      const onlineStatuses = {}
      for (const friendId of friendIds) {
        const isOnline = await checkUserOnlineStatus(friendId)
        if (!isOnline) {
          await User.findByIdAndUpdate(friendId, { isOnline: false })
          socket.broadcast.emit('user offline', friendId)
        }
        onlineStatuses[friendId] = isOnline
      }

      socket.emit('online status response', onlineStatuses)
    })

    // Quiz progress handlers
    socket.on('join quiz progress', userId => {
      socket.join(`quiz_progress_${userId}`)
      socket.emit('quiz_generation_progress', { progress: 5 })
    })

    socket.on('join quiz submission progress', userId => {
      socket.join(`quiz_submission_progress_${userId}`)
    })

    socket.on('join tournament quiz submission progress', userId => {
      socket.join(`tournament_quiz_submission_progress_${userId}`)
    })

    socket.on('join game submission progress', userId => {
      socket.join(`game_submission_progress_${userId}`)
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

    console.log(
      `[DEVICE_SETUP] Starting device-aware setup for user ${userId} socket ${socketId}`,
    )

    // Update existing metadata or create new one
    let metadata = socketMetadata.get(socketId)
    if (metadata) {
      metadata.userId = userId
      metadata.deviceFingerprint = deviceFingerprint
    } else {
      metadata = {
        userId,
        deviceFingerprint,
        connectedAt: new Date(),
        setupCompleted: false,
        clientAddress: socket.handshake.address,
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
        const stillConnectedSockets = Array.from(existingSockets).filter(
          socketId => {
            const existingSocket = io.sockets.sockets.get(socketId)
            return existingSocket && existingSocket.connected
          },
        )

        if (stillConnectedSockets.length > 0) {
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

        // Clean up disconnected socket references
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

    // Ensure socket set exists for this device
    if (!userDevices.has(deviceFingerprint)) {
      userDevices.set(deviceFingerprint, new Set())
    }

    // Add new socket to device set
    userDevices.get(deviceFingerprint).add(socketId)

    console.log(
      `[DEVICE_SETUP] User ${userId} connected with device ${deviceFingerprint.substring(
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

    socketMetadata.set(socketId, {
      userId,
      deviceFingerprint: null,
      connectedAt: new Date(),
      clientAddress: socket.handshake.address,
    })
  }

  /**
   * Handle socket disconnection with device awareness
   */
  function handleSocketDisconnection(socketId) {
    const metadata = socketMetadata.get(socketId)

    if (!metadata) {
      console.log(`No tracking info found for disconnected socket ${socketId}`)
      return
    }

    const { userId, deviceFingerprint } = metadata

    console.log(`Socket ${socketId} disconnected for user ${userId}`)

    // Clean up device-aware tracking
    if (deviceFingerprint && userDeviceConnections.has(userId)) {
      const userDevices = userDeviceConnections.get(userId)

      if (userDevices.has(deviceFingerprint)) {
        const deviceSockets = userDevices.get(deviceFingerprint)
        deviceSockets.delete(socketId)

        if (deviceSockets.size === 0) {
          setTimeout(() => {
            if (deviceSockets.size === 0) {
              userDevices.delete(deviceFingerprint)

              if (userDevices.size === 0) {
                userDeviceConnections.delete(userId)
              }
            }
          }, 100)
        }
      }
    }

    socketMetadata.delete(socketId)
  }

  /**
   * Handle user disconnection event
   */
  async function handleUserDisconnection(socketId, userId) {
    console.log(`User ${userId} explicitly disconnecting`)

    userOpenChats.delete(userId)

    const socket = io.sockets.sockets.get(socketId)
    if (socket) {
      socket.leave(userId)
    }

    await redis.del(`user:${userId}:lastHeartbeat`)
    await User.findByIdAndUpdate(userId, { isOnline: false })

    io.emit('user offline', userId)

    handleSocketDisconnection(socketId)
  }

  /**
   * Get user's active devices for notifications
   */
  function getUserActiveDevices(userId) {
    const userDevices = userDeviceConnections.get(userId)

    if (!userDevices || userDevices.size === 0) {
      // Fallback to room-based check
      const userRoom = io.sockets.adapter.rooms.get(userId)
      const quickClashRoom = io.sockets.adapter.rooms.get(
        `quickClash:${userId}`,
      )

      if (
        (userRoom && userRoom.size > 0) ||
        (quickClashRoom && quickClashRoom.size > 0)
      ) {
        const socketIds = []
        if (userRoom && userRoom.size > 0) {
          socketIds.push(...Array.from(userRoom))
        }
        if (quickClashRoom && quickClashRoom.size > 0) {
          socketIds.push(...Array.from(quickClashRoom))
        }

        const uniqueSocketIds = [...new Set(socketIds)]
        const connectedSockets = uniqueSocketIds.filter(socketId => {
          const socket = io.sockets.sockets.get(socketId)
          return socket && socket.connected
        })

        if (connectedSockets.length > 0) {
          return [
            {
              deviceFingerprint: 'fallback_device_' + userId,
              socketIds: connectedSockets,
              socketCount: connectedSockets.length,
            },
          ]
        }
      }

      return []
    }

    const activeDevices = []

    for (const [deviceFingerprint, socketSet] of userDevices.entries()) {
      if (socketSet.size > 0) {
        const connectedSockets = []

        for (const socketId of socketSet) {
          const socket = io.sockets.sockets.get(socketId)
          if (socket && socket.connected) {
            connectedSockets.push(socketId)
          }
        }

        if (connectedSockets.length > 0) {
          activeDevices.push({
            deviceFingerprint,
            socketIds: connectedSockets,
            socketCount: connectedSockets.length,
          })
        }
      }
    }

    return activeDevices
  }

  /**
   * Enhanced function to notify user across all devices
   */
  function notifyUserAllDevices(userId, event, data) {
    const activeDevices = getUserActiveDevices(userId)

    if (activeDevices.length === 0) {
      const userRoom = `quickClash:${userId}`
      const room = io.sockets.adapter.rooms.get(userRoom)
      if (room && room.size > 0) {
        io.to(userRoom).emit(event, data)
        return true
      }

      return false
    }

    let notifiedSockets = 0

    activeDevices.forEach(device => {
      device.socketIds.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId)
        if (socket && socket.connected) {
          socket.emit(event, {
            ...data,
            deviceFingerprint: device.deviceFingerprint.substring(0, 8) + '...',
          })
          notifiedSockets++
        }
      })
    })

    return notifiedSockets > 0
  }

  // Setup Quick Clash global events
  setupQuickClashGlobalEvents(io, {
    notifyUserAllDevices,
    getUserActiveDevices,
  })

  // Setup Friends global events
  setupFriendsGlobalEvents(io, {
    notifyUserAllDevices,
    getUserActiveDevices,
  })

  // Bridge between custom emitter and Socket.IO
  globalEmitter.on('quiz_progress', ({ userId, progress }) => {
    io.to(`quiz_progress_${userId}`).emit('quiz_generation_progress', {
      progress,
    })
  })

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

  globalEmitter.on(
    'game_submission_progress',
    ({ userId, stepId, progress }) => {
      io.to(`game_submission_progress_${userId}`).emit(
        'game_submission_progress',
        {
          stepId,
          progress,
        },
      )
    },
  )

  // Set up periodic heartbeat checking
  const HEARTBEAT_CHECK_INTERVAL = 60000
  const BATCH_SIZE = 1000

  setInterval(async () => {
    const startTime = Date.now()
    console.log(
      '\n🔄 [HEARTBEAT_CHECK] Starting user online status check...',
      new Date().toISOString(),
    )

    try {
      // Test Redis connection first
      const redisStatus = await redis.ping()
      console.log('✅ [REDIS_STATUS] Redis ping response:', redisStatus)

      const onlineUsers = await User.find({ isOnline: true }, '_id').lean()
      console.log(
        `👥 [HEARTBEAT_CHECK] Found ${onlineUsers.length} users marked as online in database`,
      )

      if (onlineUsers.length === 0) {
        console.log(
          'ℹ️  [HEARTBEAT_CHECK] No online users to check, skipping...',
        )
        return
      }

      let totalOfflineUsers = 0
      let batchesProcessed = 0

      for (let i = 0; i < onlineUsers.length; i += BATCH_SIZE) {
        batchesProcessed++
        const batch = onlineUsers.slice(i, i + BATCH_SIZE).map(user => user._id)

        console.log(
          `📦 [BATCH_${batchesProcessed}] Processing batch ${batchesProcessed} with ${
            batch.length
          } users (${i + 1}-${Math.min(i + BATCH_SIZE, onlineUsers.length)})`,
        )

        const batchStartTime = Date.now()
        const offlineUsers = await checkUserBatch(batch)
        const batchDuration = Date.now() - batchStartTime

        console.log(
          `⏱️  [BATCH_${batchesProcessed}] Completed in ${batchDuration}ms - Found ${offlineUsers.length} offline users`,
        )

        if (offlineUsers.length > 0) {
          totalOfflineUsers += offlineUsers.length

          // Log which users are going offline (limit to first 10 for readability)
          const usersToLog = offlineUsers.slice(0, 10)
          console.log(
            `📴 [OFFLINE_USERS] Setting ${offlineUsers.length} users to offline:`,
            usersToLog
              .map(id => id.toString().substring(0, 8) + '...')
              .join(', '),
            offlineUsers.length > 10
              ? `... and ${offlineUsers.length - 10} more`
              : '',
          )

          try {
            // Update database
            const dbUpdateResult = await User.updateMany(
              { _id: { $in: offlineUsers } },
              { isOnline: false },
            )
            console.log(
              `💾 [DATABASE] Updated ${dbUpdateResult.modifiedCount} users in database`,
            )

            // Clean up Redis keys and emit socket events
            const redisDeletePromises = offlineUsers.map(async userId => {
              try {
                await redis.del(`user:${userId}:lastHeartbeat`)
                io.emit('user offline', userId)
                return userId
              } catch (redisError) {
                console.error(
                  `❌ [REDIS_DELETE] Failed to delete heartbeat for user ${userId}:`,
                  redisError.message,
                )
                return null
              }
            })

            const redisResults = await Promise.allSettled(redisDeletePromises)
            const successfulDeletes = redisResults.filter(
              result => result.status === 'fulfilled' && result.value,
            ).length
            console.log(
              `🗑️  [REDIS_CLEANUP] Cleaned up ${successfulDeletes}/${offlineUsers.length} Redis heartbeat keys`,
            )
          } catch (updateError) {
            console.error(
              '❌ [DATABASE_UPDATE] Failed to update offline users:',
              updateError.message,
            )
          }
        }
      }

      const totalDuration = Date.now() - startTime
      console.log(`✅ [HEARTBEAT_CHECK] Completed check in ${totalDuration}ms`)
      console.log(
        `📊 [SUMMARY] Processed ${onlineUsers.length} users in ${batchesProcessed} batches, found ${totalOfflineUsers} offline users\n`,
      )
    } catch (error) {
      console.error(
        '❌ [HEARTBEAT_CHECK] Critical error during heartbeat check:',
        {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        },
      )
    }
  }, HEARTBEAT_CHECK_INTERVAL)
  // Expose utility functions
  io.getUserActiveDevices = getUserActiveDevices
  io.notifyUserAllDevices = notifyUserAllDevices

  const { initializeSocketUtils } = require('./utils/socketUtils')
  initializeSocketUtils(io)

  exports.io = io
}

module.exports = { initializeSocket }
