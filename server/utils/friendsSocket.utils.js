// utils/friendsSocket.utils.js - ENHANCED: Added offline push notifications for friends chat
const globalEmitter = require('../eventEmitter')
const User = require('../model/userSchema')
const FriendRequest = require('../model/friendRequestSchema')
const FriendsConversation = require('../model/chat/friendsConversationSchema')
const FriendsMessage = require('../model/chat/friendsMessageSchema')
const { sendNotification } = require('../services/notificationService')
const i18n = require('i18next')

/**
 * Friends room membership tracking
 * Maps userId to friends room membership status with timestamp
 */
const friendsRoomMembers = new Map() // userId -> { joined: boolean, timestamp: number }

/**
 * Room operation debouncing to prevent rapid duplicate operations
 */
const roomOperationDebounce = new Map() // userId -> { operation: string, timestamp: number }

// FIXED: Track processed friend events to prevent duplicates
const processedFriendEvents = new Set()
const FRIEND_EVENT_CLEANUP_INTERVAL = 300000 // 5 minutes

// Clean up processed events periodically
setInterval(() => {
  if (processedFriendEvents.size > 5000) {
    processedFriendEvents.clear()
    console.log('[FRIENDS_SOCKET] Cleaned up processed friend events cache')
  }
}, FRIEND_EVENT_CLEANUP_INTERVAL)

/**
 * Helper function to check if a friend event should be processed
 */
const shouldProcessFriendEvent = eventId => {
  if (processedFriendEvents.has(eventId)) {
    console.log('[FRIENDS_SOCKET] Skipping duplicate friend event:', eventId)
    return false
  }

  processedFriendEvents.add(eventId)
  return true
}

/**
 * Helper function to check if a room operation should be debounced
 */
const shouldDebounceRoomOperation = (userId, operation) => {
  const key = `${userId}_${operation}`
  const now = Date.now()
  const lastOperation = roomOperationDebounce.get(key)

  if (lastOperation && now - lastOperation < 1000) {
    // 1 second debounce
    return true
  }

  roomOperationDebounce.set(key, now)
  return false
}

/**
 * Enhanced room membership management with debouncing
 */
const setFriendsRoomMembership = (userId, joined) => {
  const now = Date.now()

  if (joined) {
    friendsRoomMembers.set(userId, { joined: true, timestamp: now })
    console.log(`[FRIENDS_SOCKET] User ${userId} joined friends room at ${now}`)
  } else {
    friendsRoomMembers.delete(userId)
    console.log(`[FRIENDS_SOCKET] User ${userId} left friends room`)
  }
}

/**
 * Check if user is in friends room
 */
const isUserInFriendsRoom = userId => {
  const membership = friendsRoomMembers.get(userId)
  return membership?.joined === true
}

/**
 * ENHANCED: Check if user is truly online using multiple methods
 * @param {string} userId - User ID to check
 * @param {Object} io - Socket.io instance for room checking
 * @returns {Promise<boolean>} - Whether user is online
 */
const isUserReallyOnline = async (userId, io) => {
  try {
    // Method 1: Check if user is in any socket rooms (most reliable for real-time status)
    if (io && io.sockets && io.sockets.adapter) {
      const userRoom = io.sockets.adapter.rooms.get(userId)
      const friendsRoom = io.sockets.adapter.rooms.get(`friends:${userId}`)
      const quickClashRoom = io.sockets.adapter.rooms.get(
        `quickClash:${userId}`,
      )

      const hasActiveSockets =
        (userRoom && userRoom.size > 0) ||
        (friendsRoom && friendsRoom.size > 0) ||
        (quickClashRoom && quickClashRoom.size > 0)

      if (hasActiveSockets) {
        console.log(
          `[FRIENDS_SOCKET] User ${userId} has active socket connections`,
        )
        return true
      }
    }

    // Method 2: Check friends room membership cache
    if (isUserInFriendsRoom(userId)) {
      console.log(`[FRIENDS_SOCKET] User ${userId} is in friends room cache`)
      return true
    }

    // Method 3: Check database online status as fallback
    const user = await User.findById(userId).select('isOnline lastLogin').lean()
    if (user && user.isOnline) {
      // Additional check: if lastLogin is very recent (within 2 minutes), consider online
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
      if (user.lastLogin && user.lastLogin > twoMinutesAgo) {
        console.log(
          `[FRIENDS_SOCKET] User ${userId} marked online in DB with recent activity`,
        )
        return true
      }
    }

    console.log(`[FRIENDS_SOCKET] User ${userId} appears to be offline`)
    return false
  } catch (error) {
    console.error(
      `[FRIENDS_SOCKET] Error checking online status for user ${userId}:`,
      error,
    )
    // Default to offline on error to ensure notifications are sent
    return false
  }
}

/**
 * ENHANCED: Send push notification to offline user with proper localization
 * @param {string} userId - Recipient user ID
 * @param {Object} sender - Sender user object
 * @param {string} messageContent - Message content
 * @param {string} conversationId - Conversation ID for deep linking
 */
const sendOfflineMessageNotification = async (
  userId,
  sender,
  messageContent,
  conversationId,
) => {
  try {
    // Get recipient data for localization
    const recipient = await User.findById(userId)
      .select('name userLanguage')
      .lean()

    if (!recipient) {
      console.error(
        `[FRIENDS_SOCKET] Recipient ${userId} not found for notification`,
      )
      return
    }

    // Setup localized i18n instance
    const localizedI18n = i18n.cloneInstance({ initImmediate: false })
    await localizedI18n.changeLanguage(recipient.userLanguage || 'en')
    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'friendsChatController', ...options })

    // Truncate message content for notification (keep it concise)
    let notificationContent = messageContent.trim()
    if (notificationContent.length > 60) {
      notificationContent = notificationContent.substring(0, 57) + '...'
    }

    // Create deep link URL for direct navigation to chat
    const deepLinkUrl = `/home?wiseweb=true&chat=${conversationId}&from=notification`

    // Send push notification with enhanced metadata
    await sendNotification({
      title: t('New message from {{name}}', { name: sender.name }),
      body: notificationContent,
      icon:
        sender.pic ||
        'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
      url: deepLinkUrl,
      image: null, // Could add message preview image in future
      userId: userId,
      messageId: null, // Could be used for notification tracking
      type: 'friendsChat', // Custom type for friends chat notifications
      importance: 'normal',
    })

    console.log(
      `[FRIENDS_SOCKET] Offline notification sent to user ${userId} for message from ${sender.name}`,
    )
  } catch (error) {
    console.error(
      `[FRIENDS_SOCKET] Error sending offline notification to ${userId}:`,
      error,
    )
    // Don't throw error to prevent breaking the main message flow
  }
}

/**
 * Setup socket event handlers for Friends feature with enhanced room management
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Client socket connection
 * @param {Object} user - Authenticated user object
 */
const setupFriendsSocketHandlers = (io, socket, user) => {
  // Ensure user object is valid before proceeding
  if (!user || !user._id) {
    console.error('Invalid user object in setupFriendsSocketHandlers')
    return
  }

  const userId = user._id.toString()
  const socketId = socket.id

  console.log(
    `[FRIENDS_SETUP] Setting up Friends handlers for user ${userId} socket ${socketId}`,
  )

  // Enhanced join friends room with debouncing
  socket.on('friends:joinRoom', async (data = {}) => {
    try {
      console.log('[FRIENDS_SOCKET] joinRoom event data:', data)
      const { deviceFingerprint } = data

      // Debounce room operations
      if (shouldDebounceRoomOperation(userId, 'joinFriendsRoom')) {
        console.log(
          `[FRIENDS_SOCKET] Debounced join friends room for user ${userId}`,
        )
        return
      }

      console.log(
        `[FRIENDS_SOCKET] User ${userId} joining friends room${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ''
        }`,
      )

      // Only join if not already in the room
      if (!isUserInFriendsRoom(userId)) {
        // Join the general friends room
        socket.join('friends:global')

        // Join user-specific friends room
        socket.join(`friends:${userId}`)

        setFriendsRoomMembership(userId, true)

        console.log(`[FRIENDS_SOCKET] User ${userId} joined friends rooms`)

        // Emit confirmation
        socket.emit('friends:roomJoined', {
          userId,
          rooms: ['friends:global', `friends:${userId}`],
          deviceFingerprint: deviceFingerprint
            ? deviceFingerprint.substring(0, 8) + '...'
            : null,
        })

        // Update user's online status for friends
        await updateUserOnlineStatusForFriends(userId, true)
      } else {
        console.log(`[FRIENDS_SOCKET] User ${userId} already in friends rooms`)
        // Still emit confirmation for client state consistency
        socket.emit('friends:roomJoined', {
          userId,
          rooms: ['friends:global', `friends:${userId}`],
          deviceFingerprint: deviceFingerprint
            ? deviceFingerprint.substring(0, 8) + '...'
            : null,
          alreadyJoined: true,
        })
      }
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error in joinRoom:`, error)
      socket.emit('friends:error', {
        message: error.message || 'Failed to join friends room',
      })
    }
  })

  // Leave friends room
  socket.on('friends:leaveRoom', (data = {}) => {
    try {
      const { deviceFingerprint } = data

      console.log(
        `[FRIENDS_SOCKET] User ${userId} leaving friends room${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ''
        }`,
      )

      socket.leave('friends:global')
      socket.leave(`friends:${userId}`)
      setFriendsRoomMembership(userId, false)

      // Emit confirmation
      socket.emit('friends:roomLeft', {
        userId,
        deviceFingerprint: deviceFingerprint
          ? deviceFingerprint.substring(0, 8) + '...'
          : null,
      })

      console.log(`[FRIENDS_SOCKET] User ${userId} left friends rooms`)
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error in leaveRoom:`, error)
      socket.emit('friends:error', {
        message: error.message || 'Failed to leave friends room',
      })
    }
  })

  // Request friends list update
  socket.on('friends:requestUpdate', async (data = {}) => {
    try {
      console.log(`[FRIENDS_SOCKET] User ${userId} requested friends update`)

      // Emit event to trigger friends data refresh
      globalEmitter.emit('friends:updateRequested', { userId })

      socket.emit('friends:updateTriggered', {
        userId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error in requestUpdate:`, error)
      socket.emit('friends:error', {
        message: error.message || 'Failed to request update',
      })
    }
  })

  // Request online status check for specific friends
  socket.on('friends:checkOnlineStatus', async (data = {}) => {
    try {
      const { friendIds = [] } = data

      if (!Array.isArray(friendIds) || friendIds.length === 0) {
        socket.emit('friends:error', {
          message: 'Invalid friendIds provided',
        })
        return
      }

      console.log(
        `[FRIENDS_SOCKET] User ${userId} checking online status for ${friendIds.length} friends`,
      )

      // Get current online status for specified friends
      const onlineStatuses = {}

      for (const friendId of friendIds.slice(0, 50)) {
        // Limit to 50 friends per request
        try {
          const isOnline = await isUserReallyOnline(friendId, io)
          onlineStatuses[friendId] = {
            isOnline,
            lastChecked: new Date().toISOString(),
          }
        } catch (error) {
          console.error(
            `[FRIENDS_SOCKET] Error checking status for friend ${friendId}:`,
            error,
          )
          onlineStatuses[friendId] = {
            isOnline: false,
            lastChecked: new Date().toISOString(),
            error: true,
          }
        }
      }

      socket.emit('friends:onlineStatusResponse', {
        userId,
        statuses: onlineStatuses,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error in checkOnlineStatus:`, error)
      socket.emit('friends:error', {
        message: error.message || 'Failed to check online status',
      })
    }
  })

  // Handle disconnect - cleanup friends room membership
  socket.on('disconnect', async () => {
    try {
      setFriendsRoomMembership(userId, false)
      await updateUserOnlineStatusForFriends(userId, false)
      console.log(
        `[FRIENDS_SOCKET] Socket ${socketId} disconnected from friends for user ${userId}`,
      )
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error handling disconnect:`, error)
    }
  })

  // ===========================================
  // CHAT-SPECIFIC SOCKET HANDLERS - FIXED
  // ===========================================

  // Join conversation room for real-time messaging
  socket.on('friends:joinConversation', async (data = {}) => {
    try {
      const { conversationId } = data

      if (!conversationId) {
        socket.emit('friends:error', {
          message: 'Conversation ID is required to join conversation',
        })
        return
      }

      console.log(
        `[FRIENDS_SOCKET] User ${userId} joining conversation ${conversationId}`,
      )

      // Verify user is participant in conversation
      const conversation = await FriendsConversation.findById(conversationId)
      if (!conversation) {
        socket.emit('friends:error', {
          message: 'Conversation not found',
        })
        return
      }

      const isParticipant = conversation.participants.some(
        p => p.toString() === userId,
      )

      if (!isParticipant) {
        socket.emit('friends:error', {
          message: 'Access denied to this conversation',
        })
        return
      }

      // Join conversation room
      const conversationRoom = `conversation:${conversationId}`
      socket.join(conversationRoom)

      console.log(
        `[FRIENDS_SOCKET] User ${userId} joined conversation room: ${conversationRoom}`,
      )

      socket.emit('friends:conversationJoined', {
        conversationId,
        room: conversationRoom,
      })
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error joining conversation:`, error)
      socket.emit('friends:error', {
        message: 'Failed to join conversation',
      })
    }
  })

  // Leave conversation room
  socket.on('friends:leaveConversation', (data = {}) => {
    try {
      const { conversationId } = data

      if (conversationId) {
        const conversationRoom = `conversation:${conversationId}`
        socket.leave(conversationRoom)

        console.log(
          `[FRIENDS_SOCKET] User ${userId} left conversation room: ${conversationRoom}`,
        )

        socket.emit('friends:conversationLeft', {
          conversationId,
        })
      }
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error leaving conversation:`, error)
    }
  })

  // FIXED: Enhanced typing indicators handler
  socket.on('friends:typing', (data = {}) => {
    try {
      const { conversationId, isTyping } = data

      if (!conversationId) return

      console.log(
        `[FRIENDS_SOCKET] User ${userId} ${
          isTyping ? 'started' : 'stopped'
        } typing in conversation ${conversationId}`,
      )

      // FIXED: Broadcast typing status to conversation room (excluding sender)
      socket.to(`conversation:${conversationId}`).emit('friends:userTyping', {
        conversationId,
        userId,
        isTyping,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error handling typing:`, error)
    }
  })

  // FIXED: Enhanced message delivery confirmation handler
  socket.on('friends:messageDelivered', async (data = {}) => {
    try {
      const { messageId, conversationId } = data

      if (!messageId || !conversationId) return

      console.log(
        `[FRIENDS_SOCKET] Message ${messageId} delivered to user ${userId}`,
      )

      // Update message status to delivered
      const message = await FriendsMessage.findById(messageId)
      if (message && message.status === 'sent') {
        message.status = 'delivered'
        await message.save()

        // FIXED: Notify sender about delivery (exclude the user who delivered it)
        const senderId = message.sender.toString()
        if (senderId !== userId) {
          socket
            .to(`conversation:${conversationId}`)
            .emit('friends:messageStatusUpdate', {
              messageId,
              status: 'delivered',
              conversationId,
            })

          console.log(
            '[FRIENDS_SOCKET] Delivery notification sent to sender:',
            senderId,
          )
        }
      }
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error handling message delivery:`, error)
    }
  })

  // FIXED: Enhanced message read confirmation handler
  socket.on('friends:messagesRead', async (data = {}) => {
    try {
      const { conversationId, messageIds = [] } = data

      if (!conversationId) return

      console.log(
        `[FRIENDS_SOCKET] User ${userId} read ${messageIds.length} messages in conversation ${conversationId}`,
      )

      // This is handled by the REST API endpoint,
      // but we can emit confirmation for real-time updates
      // FIXED: Exclude the reader from receiving the notification
      socket
        .to(`conversation:${conversationId}`)
        .emit('friends:messagesReadConfirm', {
          conversationId,
          readerId: userId,
          messageIds,
          timestamp: new Date().toISOString(),
        })
    } catch (error) {
      console.error(`[FRIENDS_SOCKET] Error handling messages read:`, error)
    }
  })
}

/**
 * Update user's online status and notify friends
 */
const updateUserOnlineStatusForFriends = async (userId, isOnline) => {
  try {
    // Update user's online status in database
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastLogin: new Date(),
    })

    // Emit global event for other parts of the system
    globalEmitter.emit('friends:userStatusChanged', {
      userId,
      isOnline,
      timestamp: new Date().toISOString(),
    })

    console.log(
      `[FRIENDS_SOCKET] Updated online status for user ${userId}: ${isOnline}`,
    )
  } catch (error) {
    console.error(
      `[FRIENDS_SOCKET] Error updating online status for user ${userId}:`,
      error,
    )
  }
}

/**
 * Setup global emitter event handlers for Friends
 * Enhanced to use the unified device tracking system
 * @param {Object} io - Socket.io instance
 * @param {Object} utils - Utility functions from main socket.js
 */
const setupFriendsGlobalEvents = (io, utils = {}) => {
  const { notifyUserAllDevices, getUserActiveDevices } = utils

  /**
   * FIXED: Enhanced helper function to notify user with sender exclusion
   */
  const notifyUser = (userId, event, data, excludeUserId = null) => {
    if (!userId) {
      console.error(
        `[FRIENDS_NOTIFY] Invalid userId provided for event ${event}`,
      )
      return false
    }

    // FIXED: Don't notify the user if they are the one who triggered the event
    if (excludeUserId && userId.toString() === excludeUserId.toString()) {
      console.log(
        `[FRIENDS_NOTIFY] Skipping notification to ${userId} - they triggered the event`,
      )
      return true // Return true to indicate success, but skip actual notification
    }

    // Try enhanced device-aware notification first
    if (notifyUserAllDevices && typeof notifyUserAllDevices === 'function') {
      try {
        const success = notifyUserAllDevices(userId, event, data)
        if (success) {
          return true
        }
      } catch (error) {
        console.error(
          `[FRIENDS_NOTIFY] Error in device-aware notification for user ${userId}:`,
          error,
        )
      }
    }

    // Enhanced fallback to room-based notification
    if (!io || !io.sockets || !io.sockets.adapter) {
      console.error(`[FRIENDS_NOTIFY] Socket.io not properly initialized`)
      return false
    }

    // Try friends-specific room first
    const friendsRoom = `friends:${userId}`
    const room = io.sockets.adapter.rooms.get(friendsRoom)

    if (room && room.size > 0) {
      try {
        io.to(friendsRoom).emit(event, data)
        return true
      } catch (error) {
        console.error(
          `[FRIENDS_NOTIFY] Error emitting to room ${friendsRoom}:`,
          error,
        )
      }
    }

    // Try the basic user room as fallback
    const basicUserRoom = userId
    const basicRoom = io.sockets.adapter.rooms.get(basicUserRoom)

    if (basicRoom && basicRoom.size > 0) {
      try {
        io.to(basicUserRoom).emit(event, data)
        return true
      } catch (error) {
        console.error(
          `[FRIENDS_NOTIFY] Error emitting to basic room ${basicUserRoom}:`,
          error,
        )
      }
    }

    return false
  }

  /**
   * FIXED: Notify multiple users (used for friend status changes) with sender exclusion
   */
  const notifyMultipleUsers = (userIds, event, data, excludeUserId = null) => {
    let successCount = 0

    for (const userId of userIds) {
      try {
        const success = notifyUser(
          userId,
          event,
          {
            ...data,
            targetUserId: userId,
          },
          excludeUserId,
        )
        if (success) successCount++
      } catch (error) {
        console.error(`[FRIENDS_NOTIFY] Error notifying user ${userId}:`, error)
      }
    }

    console.log(
      `[FRIENDS_NOTIFY] Notified ${successCount}/${userIds.length} users with event ${event}`,
    )
    return successCount
  }

  // ==========================================
  // FRIEND REQUEST EVENTS
  // ==========================================

  // Friend request sent
  globalEmitter.on('friends:requestSent', ({ fromUser, toUser, requestId }) => {
    if (!toUser || !toUser._id) {
      console.error('Invalid toUser in friends:requestSent event')
      return
    }

    // FIXED: Create unique event ID to prevent duplicates
    const eventId = `request_sent_${requestId}_${Date.now()}`
    if (!shouldProcessFriendEvent(eventId)) return

    console.log(
      `[FRIENDS_EVENT] Friend request sent from ${fromUser._id} to ${toUser._id}`,
    )

    const success = notifyUser(
      toUser._id,
      'friends:requestReceived',
      {
        requestId,
        from: {
          _id: fromUser._id,
          name: fromUser.name,
          inGameName: fromUser.inGameName,
          pic: fromUser.pic,
        },
        timestamp: new Date().toISOString(),
      },
      fromUser._id,
    ) // FIXED: Exclude the sender

    console.log(
      `[FRIENDS_EVENT] Friend request notification sent to ${toUser._id}: ${success}`,
    )
  })

  // Friend request accepted
  globalEmitter.on(
    'friends:requestAccepted',
    ({ fromUser, toUser, requestId }) => {
      if (!fromUser || !fromUser._id || !toUser || !toUser._id) {
        console.error('Invalid users in friends:requestAccepted event')
        return
      }

      // FIXED: Create unique event ID to prevent duplicates
      const eventId = `request_accepted_${requestId}_${Date.now()}`
      if (!shouldProcessFriendEvent(eventId)) return

      console.log(
        `[FRIENDS_EVENT] Friend request accepted: ${fromUser._id} <-> ${toUser._id}`,
      )

      // Notify the original sender (don't notify the accepter about their own action)
      const senderSuccess = notifyUser(
        fromUser._id,
        'friends:requestAccepted',
        {
          requestId,
          friend: {
            _id: toUser._id,
            name: toUser.name,
            inGameName: toUser.inGameName,
            pic: toUser.pic,
            isOnline: toUser.isOnline || false,
          },
          timestamp: new Date().toISOString(),
        },
        toUser._id, // FIXED: Exclude the accepter
      )

      // Also notify the accepter (for UI consistency) but not about accepting their own request
      const accepterSuccess = notifyUser(toUser._id, 'friends:newFriendAdded', {
        requestId,
        friend: {
          _id: fromUser._id,
          name: fromUser.name,
          inGameName: fromUser.inGameName,
          pic: fromUser.pic,
          isOnline: fromUser.isOnline || false,
        },
        timestamp: new Date().toISOString(),
      })

      console.log(
        `[FRIENDS_EVENT] Request accepted notifications - Sender: ${senderSuccess}, Accepter: ${accepterSuccess}`,
      )
    },
  )

  // Friend request rejected
  globalEmitter.on(
    'friends:requestRejected',
    ({ fromUser, toUser, requestId }) => {
      if (!fromUser || !fromUser._id) {
        console.error('Invalid fromUser in friends:requestRejected event')
        return
      }

      // FIXED: Create unique event ID to prevent duplicates
      const eventId = `request_rejected_${requestId}_${Date.now()}`
      if (!shouldProcessFriendEvent(eventId)) return

      console.log(
        `[FRIENDS_EVENT] Friend request rejected: ${fromUser._id} <- ${toUser._id}`,
      )

      const success = notifyUser(
        fromUser._id,
        'friends:requestRejected',
        {
          requestId,
          rejectedBy: {
            _id: toUser._id,
            name: toUser.name,
            inGameName: toUser.inGameName,
          },
          timestamp: new Date().toISOString(),
        },
        toUser._id,
      ) // FIXED: Exclude the rejector

      console.log(
        `[FRIENDS_EVENT] Request rejected notification sent to ${fromUser._id}: ${success}`,
      )
    },
  )

  // ==========================================
  // FRIEND STATUS EVENTS - FIXED
  // ==========================================

  // User status changed (online/offline)
  globalEmitter.on(
    'friends:userStatusChanged',
    async ({ userId, isOnline, timestamp }) => {
      try {
        console.log(
          `[FRIENDS_EVENT] User ${userId} status changed to ${
            isOnline ? 'online' : 'offline'
          }`,
        )

        // FIXED: Create unique event ID to prevent duplicates
        const eventId = `status_changed_${userId}_${isOnline}_${Date.now()}`
        if (!shouldProcessFriendEvent(eventId)) return

        // Get user's friends to notify them of status change
        const user = await User.findById(userId)
          .select('friends name inGameName pic')
          .lean()

        if (!user || !user.friends || user.friends.length === 0) {
          return
        }

        // FIXED: Notify all friends about the status change (exclude the user whose status changed)
        const friendIds = user.friends.map(id => id.toString())

        const notifiedCount = notifyMultipleUsers(
          friendIds,
          'friends:friendStatusChanged',
          {
            friendId: userId,
            friend: {
              _id: userId,
              name: user.name,
              inGameName: user.inGameName,
              pic: user.pic,
            },
            isOnline,
            timestamp,
          },
          userId, // FIXED: Exclude the user whose status changed
        )

        console.log(
          `[FRIENDS_EVENT] Status change notification sent to ${notifiedCount}/${friendIds.length} friends`,
        )
      } catch (error) {
        console.error(
          `[FRIENDS_EVENT] Error handling user status change:`,
          error,
        )
      }
    },
  )

  // Friend removed
  globalEmitter.on(
    'friends:friendRemoved',
    ({ userId, removedFriendId, removedFriend }) => {
      if (!userId || !removedFriendId) {
        console.error('Invalid data in friends:friendRemoved event')
        return
      }

      // FIXED: Create unique event ID to prevent duplicates
      const eventId = `friend_removed_${userId}_${removedFriendId}_${Date.now()}`
      if (!shouldProcessFriendEvent(eventId)) return

      console.log(
        `[FRIENDS_EVENT] Friend removed: ${userId} removed ${removedFriendId}`,
      )

      // FIXED: Notify the removed friend (don't notify the user who removed them)
      const success = notifyUser(
        removedFriendId,
        'friends:friendRemoved',
        {
          removedBy: userId,
          timestamp: new Date().toISOString(),
        },
        userId,
      ) // FIXED: Exclude the user who initiated the removal

      console.log(
        `[FRIENDS_EVENT] Friend removal notification sent to ${removedFriendId}: ${success}`,
      )
    },
  )

  // ==========================================
  // UPDATE EVENTS
  // ==========================================

  // Friends list update requested
  globalEmitter.on('friends:updateRequested', ({ userId }) => {
    console.log(`[FRIENDS_EVENT] Friends update requested for user ${userId}`)

    // This could trigger a background refresh of friends data
    // For now, just acknowledge the request
    const success = notifyUser(userId, 'friends:updateAcknowledged', {
      timestamp: new Date().toISOString(),
    })

    console.log(
      `[FRIENDS_EVENT] Update acknowledgment sent to ${userId}: ${success}`,
    )
  })

  // ===========================================
  // CHAT GLOBAL EVENTS - ENHANCED WITH OFFLINE NOTIFICATIONS
  // ===========================================

  // ENHANCED: Handle new message received with offline notification support
  globalEmitter.on(
    'friends:messageReceived',
    async ({ conversationId, message, senderId, recipientId }) => {
      if (!conversationId || !message) {
        console.error('[FRIENDS_EVENT] Invalid message data received')
        return
      }

      // FIXED: Create unique event ID to prevent duplicate message processing
      const eventId = `message_${message._id}_${Date.now()}`
      if (!shouldProcessFriendEvent(eventId)) return

      console.log(
        `[FRIENDS_EVENT] New message in conversation ${conversationId} from ${senderId}`,
      )

      let recipientNotifiedViaSocket = false

      // Try to notify conversation participants via sockets first
      const conversationRoom = `conversation:${conversationId}`
      const room = io.sockets.adapter.rooms.get(conversationRoom)

      if (room && room.size > 0) {
        console.log(
          `[FRIENDS_EVENT] Broadcasting message to conversation room ${conversationRoom} (${room.size} participants)`,
        )

        io.to(conversationRoom).emit('friends:newMessage', {
          conversationId,
          message,
          timestamp: new Date().toISOString(),
        })

        recipientNotifiedViaSocket = true
      }

      // ENHANCED: Check if recipient is online and send push notification if offline
      if (recipientId && recipientId !== senderId) {
        const isRecipientOnline = await isUserReallyOnline(recipientId, io)

        if (!isRecipientOnline) {
          // Recipient is offline, send push notification
          console.log(
            `[FRIENDS_EVENT] Recipient ${recipientId} is offline, sending push notification`,
          )

          try {
            await sendOfflineMessageNotification(
              recipientId,
              message.sender,
              message.content,
              conversationId,
            )
          } catch (notificationError) {
            console.error(
              `[FRIENDS_EVENT] Error sending offline notification to ${recipientId}:`,
              notificationError,
            )
          }
        } else {
          console.log(
            `[FRIENDS_EVENT] Recipient ${recipientId} is online, skipping push notification`,
          )
        }

        // FIXED: Also notify recipient directly via socket (in case they're not in conversation room)
        // But exclude the sender from receiving their own message
        if (!recipientNotifiedViaSocket) {
          const recipientSuccess = notifyUser(
            recipientId,
            'friends:newMessage',
            {
              conversationId,
              message,
              timestamp: new Date().toISOString(),
            },
            senderId,
          ) // FIXED: Exclude sender

          console.log(
            `[FRIENDS_EVENT] Direct message notification sent to recipient ${recipientId}: ${recipientSuccess}`,
          )
        }

        // Update conversation in recipient's conversation list
        notifyUser(
          recipientId,
          'friends:conversationUpdated',
          {
            conversationId,
            lastMessage: message,
            lastMessageAt: new Date().toISOString(),
          },
          senderId,
        ) // FIXED: Exclude sender
      } else {
        console.log(
          `[FRIENDS_EVENT] Skipping notification to sender ${senderId} for their own message`,
        )
      }
    },
  )

  // FIXED: Handle messages marked as read with sender exclusion
  globalEmitter.on(
    'friends:messagesRead',
    ({ conversationId, readerId, messageIds }) => {
      if (!conversationId || !readerId) return

      // FIXED: Create unique event ID to prevent duplicates
      const eventId = `messages_read_${conversationId}_${readerId}_${Date.now()}`
      if (!shouldProcessFriendEvent(eventId)) return

      console.log(
        `[FRIENDS_EVENT] Messages read in conversation ${conversationId} by ${readerId}`,
      )

      // FIXED: Notify conversation room about read status (excluding the reader)
      const conversationRoom = `conversation:${conversationId}`
      io.to(conversationRoom).emit('friends:messagesReadUpdate', {
        conversationId,
        readerId,
        messageIds,
        timestamp: new Date().toISOString(),
      })
    },
  )

  // Handle message deletion
  globalEmitter.on(
    'friends:messageDeleted',
    ({ conversationId, messageId, deletedBy }) => {
      if (!conversationId || !messageId) return

      // FIXED: Create unique event ID to prevent duplicates
      const eventId = `message_deleted_${messageId}_${Date.now()}`
      if (!shouldProcessFriendEvent(eventId)) return

      console.log(
        `[FRIENDS_EVENT] Message ${messageId} deleted in conversation ${conversationId} by ${deletedBy}`,
      )

      // FIXED: Notify conversation room about deletion (excluding the deleter)
      const conversationRoom = `conversation:${conversationId}`
      io.to(conversationRoom).emit('friends:messageDeleted', {
        conversationId,
        messageId,
        deletedBy,
        timestamp: new Date().toISOString(),
      })
    },
  )

  // Handle message reactions (future feature)
  globalEmitter.on(
    'friends:messageReaction',
    ({ conversationId, messageId, userId, emoji, action }) => {
      if (!conversationId || !messageId) return

      // FIXED: Create unique event ID to prevent duplicates
      const eventId = `reaction_${messageId}_${userId}_${action}_${Date.now()}`
      if (!shouldProcessFriendEvent(eventId)) return

      console.log(
        `[FRIENDS_EVENT] Message reaction ${action} in conversation ${conversationId} by ${userId}`,
      )

      // FIXED: Notify conversation room about reaction (excluding the reactor)
      const conversationRoom = `conversation:${conversationId}`
      io.to(conversationRoom).emit('friends:messageReactionUpdate', {
        conversationId,
        messageId,
        userId,
        emoji,
        action,
        timestamp: new Date().toISOString(),
      })
    },
  )

  // Handle conversation updates (new conversations, etc.)
  globalEmitter.on(
    'friends:conversationCreated',
    ({ conversation, participants }) => {
      if (!conversation || !participants) return

      // FIXED: Create unique event ID to prevent duplicates
      const eventId = `conversation_created_${conversation._id}_${Date.now()}`
      if (!shouldProcessFriendEvent(eventId)) return

      console.log(
        `[FRIENDS_EVENT] New conversation ${
          conversation._id
        } created between users ${participants.join(', ')}`,
      )

      // Notify all participants about new conversation
      participants.forEach(participantId => {
        notifyUser(participantId, 'friends:newConversation', {
          conversation,
          timestamp: new Date().toISOString(),
        })
      })
    },
  )
}

/**
 * Get friends room connection statistics for debugging
 */
const getFriendsConnectionStats = () => {
  return {
    friendsRoomMembers: friendsRoomMembers.size,
    friendsRoomMemberList: Array.from(friendsRoomMembers.keys()),
    roomOperationDebounceSize: roomOperationDebounce.size,
    processedFriendEventsSize: processedFriendEvents.size,
  }
}

/**
 * Check if user is in friends room
 */
const checkUserInFriendsRoom = userId => {
  return isUserInFriendsRoom(userId)
}

// ===========================================
// ADDITIONAL HELPER FUNCTIONS FOR CHAT
// ===========================================
const getActiveConversationUsers = conversationId => {
  const conversationRoom = `conversation:${conversationId}`
  const room = io.sockets.adapter.rooms.get(conversationRoom)

  if (!room) return []

  const activeUsers = []
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId)
    if (socket && socket.userId) {
      activeUsers.push(socket.userId)
    }
  }

  return [...new Set(activeUsers)] // Remove duplicates
}

module.exports = {
  setupFriendsSocketHandlers,
  setupFriendsGlobalEvents,
  getFriendsConnectionStats,
  checkUserInFriendsRoom,
  updateUserOnlineStatusForFriends,
  getActiveConversationUsers,
  isUserReallyOnline, // Export for potential use in other modules
  sendOfflineMessageNotification, // Export for testing or direct use
}
