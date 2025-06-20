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

      // Verify room joining
      setTimeout(() => {
        const room = io.sockets.adapter.rooms.get(userId)
        console.log(
          `DEBUG: Room ${userId} now has ${room ? room.size : 0} sockets`,
        )
        if (!room || !room.has(socket.id)) {
          console.error(
            `[SETUP] ERROR: Socket ${socket.id} failed to join room ${userId}`,
          )
          // Force join again
          socket.join(userId)
        }
      }, 100)

      // Join QuickClash room
      const userRoom = `quickClash:${userId}`
      socket.join(userRoom)
      console.log(
        `[SETUP] Socket ${socket.id} joined QuickClash room: ${userRoom}`,
      )

      // Verify QuickClash room joining
      setTimeout(() => {
        const room = io.sockets.adapter.rooms.get(userRoom)
        console.log(
          `DEBUG: Room ${userRoom} now has ${room ? room.size : 0} sockets`,
        )
        if (!room || !room.has(socket.id)) {
          console.error(
            `[SETUP] ERROR: Socket ${socket.id} failed to join QuickClash room ${userRoom}`,
          )
          // Force join again
          socket.join(userRoom)
        }
      }, 150)

      socket.emit('connected')
      userOpenChats.set(userId, new Set())

      // Update user online status
      await redis.setex(`user:${userId}:lastHeartbeat`, 90, Date.now())
      await User.findByIdAndUpdate(userId, { isOnline: true })
      socket.broadcast.emit('user online', userId)

      // Setup Quick Clash handlers AFTER room joining and user data is stored
      // This includes both team and 1v1 matchmaking handlers
      setupQuickClashSocketHandlers(io, socket, userData)

      console.log(
        `[SETUP] Setup completed for user ${userId} (socket: ${socket.id}) from ${socket.handshake.address}`,
      )

      // DEBUGGING: Log device tracking state after setup
      logDeviceTrackingState(userId)
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

      // Store device fingerprint with socket (don't mark as setup completed)
      if (existingMetadata) {
        existingMetadata.deviceFingerprint = deviceFingerprint
      } else {
        socketMetadata.set(socket.id, {
          userId: null,
          deviceFingerprint,
          connectedAt: new Date(),
          setupCompleted: false, // Important: setup not completed yet
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

    console.log(
      `[DEVICE_SETUP] Starting device-aware setup for user ${userId} socket ${socketId}`,
    )

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
        clientAddress: socket.handshake.address,
      }
      socketMetadata.set(socketId, metadata)
    }

    // Initialize user's device map if not exists
    if (!userDeviceConnections.has(userId)) {
      userDeviceConnections.set(userId, new Map())
      console.log(`[DEVICE_SETUP] Initialized device map for user ${userId}`)
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
      console.log(
        `[DEVICE_SETUP] Created new socket set for device ${deviceFingerprint.substring(
          0,
          8,
        )}...`,
      )
    }

    // Add new socket to device set
    userDevices.get(deviceFingerprint).add(socketId)

    console.log(
      `[DEVICE_SETUP] User ${userId} connected with device ${deviceFingerprint.substring(
        0,
        8,
      )}... (socket: ${socketId}) from ${
        socket.handshake.address
      } - Total devices: ${userDevices.size}, Sockets for this device: ${
        userDevices.get(deviceFingerprint).size
      }`,
    )

    // DEBUGGING: Verify the socket was added properly
    logDeviceTrackingState(userId)
  }

  /**
   * Handle legacy setup for sockets without device fingerprinting
   */
  async function handleLegacySetup(socket, userData) {
    const userId = userData._id
    const socketId = socket.id

    console.log(
      `User ${userId} connected without device fingerprinting (legacy mode) from ${socket.handshake.address}`,
    )

    // Store basic metadata
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

    const { userId, deviceFingerprint, clientAddress } = metadata

    console.log(
      `Socket ${socketId} disconnected for user ${userId}${
        deviceFingerprint
          ? ` device ${deviceFingerprint.substring(0, 8)}...`
          : ' (legacy)'
      } from ${clientAddress}`,
    )

    // Clean up device-aware tracking
    if (deviceFingerprint && userDeviceConnections.has(userId)) {
      const userDevices = userDeviceConnections.get(userId)

      if (userDevices.has(deviceFingerprint)) {
        const deviceSockets = userDevices.get(deviceFingerprint)
        deviceSockets.delete(socketId)

        console.log(
          `[CLEANUP] Removed socket ${socketId} from device ${deviceFingerprint.substring(
            0,
            8,
          )}... - Remaining sockets: ${deviceSockets.size}`,
        )

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
              } else {
                console.log(
                  `User ${userId} still has ${userDevices.size} active device(s)`,
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
   * Enhanced function to get user's active devices for notifications
   */
  function getUserActiveDevices(userId) {
    const userDevices = userDeviceConnections.get(userId)
    if (!userDevices || userDevices.size === 0) {
      // console.log(`[DEVICE_LOOKUP] No devices found for user ${userId}`)
      return []
    }

    const activeDevices = []
    for (const [deviceFingerprint, socketSet] of userDevices.entries()) {
      if (socketSet.size > 0) {
        // Verify sockets are actually connected
        const connectedSockets = Array.from(socketSet).filter(socketId => {
          const socket = io.sockets.sockets.get(socketId)
          const isConnected = socket && socket.connected
          if (!isConnected) {
            // console.log(
            //   `[DEVICE_LOOKUP] Socket ${socketId} not connected, removing from device ${deviceFingerprint.substring(
            //     0,
            //     8,
            //   )}...`,
            // )
            socketSet.delete(socketId) // Clean up disconnected sockets
            socketMetadata.delete(socketId)
          }
          return isConnected
        })

        if (connectedSockets.length > 0) {
          activeDevices.push({
            deviceFingerprint,
            socketIds: connectedSockets,
            socketCount: connectedSockets.length,
          })
          // console.log(
          //   `[DEVICE_LOOKUP] Found ${
          //     connectedSockets.length
          //   } active socket(s) for device ${deviceFingerprint.substring(
          //     0,
          //     8,
          //   )}...`,
          // )
        }
      }
    }

    // console.log(
    //   `[DEVICE_LOOKUP] User ${userId} has ${
    //     activeDevices.length
    //   } active device(s) with total ${activeDevices.reduce(
    //     (sum, dev) => sum + dev.socketCount,
    //     0,
    //   )} socket(s)`,
    // )
    return activeDevices
  }

  /**
   * Enhanced function to notify user across all devices
   */
  function notifyUserAllDevices(userId, event, data) {
    // console.log(
    //   `[NOTIFY] Attempting to notify user ${userId} with event ${event}`,
    // )

    const activeDevices = getUserActiveDevices(userId)

    if (activeDevices.length === 0) {
      // console.log(`[NOTIFY] No active devices found for user ${userId}`)

      // FALLBACK: Try room-based notification
      const userRoom = `quickClash:${userId}`
      const room = io.sockets.adapter.rooms.get(userRoom)
      if (room && room.size > 0) {
        // console.log(
        //   `[NOTIFY] Fallback: Using room ${userRoom} with ${room.size} socket(s)`,
        // )
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
          // console.log(
          //   `[NOTIFY] Sending ${event} to socket ${socketId} for device ${device.deviceFingerprint.substring(
          //     0,
          //     8,
          //   )}...`,
          // )
          socket.emit(event, {
            ...data,
            deviceFingerprint: device.deviceFingerprint.substring(0, 8) + '...',
          })
          notifiedSockets++
        } else {
          // console.log(
          //   `[NOTIFY] Socket ${socketId} not available for notification`,
          // )
        }
      })
    })

    console.log(
      `notifyUserAllDevices: Sent ${event} to ${notifiedSockets} socket(s) across ${activeDevices.length} device(s) for user ${userId}`,
    )

    return notifiedSockets > 0
  }

  /**
   * Debug function to log device tracking state
   */
  function logDeviceTrackingState(userId) {
    console.log(`[DEBUG_TRACKING] Device tracking state for user ${userId}:`)
    const userDevices = userDeviceConnections.get(userId)
    if (!userDevices) {
      console.log(`[DEBUG_TRACKING] No device map found for user ${userId}`)
      return
    }

    console.log(`[DEBUG_TRACKING] Total devices: ${userDevices.size}`)
    for (const [deviceFingerprint, socketSet] of userDevices.entries()) {
      console.log(
        `[DEBUG_TRACKING] Device ${deviceFingerprint.substring(0, 8)}... has ${
          socketSet.size
        } socket(s):`,
        Array.from(socketSet),
      )

      // Verify each socket
      socketSet.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId)
        const metadata = socketMetadata.get(socketId)
        console.log(
          `[DEBUG_TRACKING]   Socket ${socketId}: connected=${
            socket?.connected
          }, metadata=${!!metadata}, address=${metadata?.clientAddress}`,
        )
      })
    }
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

  // Setup Quick Clash global events with enhanced notification system
  setupQuickClashGlobalEvents(io, {
    notifyUserAllDevices,
    getUserActiveDevices,
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

  // Expose connection stats and utility functions for monitoring
  io.getConnectionStats = getConnectionStats
  io.getUserActiveDevices = getUserActiveDevices
  io.notifyUserAllDevices = notifyUserAllDevices

  exports.io = io
}

module.exports = { initializeSocket }
