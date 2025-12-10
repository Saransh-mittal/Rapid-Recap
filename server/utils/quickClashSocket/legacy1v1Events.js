/**
 * Quick Clash Socket - Legacy 1v1 Matchmaking Events
 *
 * @deprecated This module handles 1v1 matchmaking which is now legacy.
 * It is kept for backward compatibility but should not be used for new features.
 *
 * All handlers in this file are marked as LEGACY.
 */

const {
  joinMatchmaking,
  leaveMatchmaking,
  updateMatchmakingStatus,
} = require('../../services/quickClashServices/quickClashMatchmakingService')
const QuickClashMatchmaking = require('../../model/quickClashSchemas/quickClashMatchmakingSchema')
const {
  shouldDebounceRoomOperation,
  setRoomMembership,
  isUserInRoom,
} = require('./shared')
const { createRateLimitedHandler } = require('./rateLimiter')

/**
 * @deprecated Handle 1v1 matchmaking socket events with device awareness and debouncing
 * This is LEGACY code - 1v1 mode is deprecated in favor of Team Mode.
 *
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Client socket connection
 */
const handle1v1MatchmakingEvents = (io, socket) => {
  console.log('[QC_1V1] [LEGACY] Setting up 1v1 matchmaking handlers')

  // User joins 1v1 matchmaking - LEGACY
  socket.on(
    'quickClash:joinMatchmaking',
    createRateLimitedHandler(socket, 'quickClash:joinMatchmaking', async (data = {}) => {
      try {
        // Ensure socket is authenticated
        if (!socket.user || !socket.user._id) {
          socket.emit('quickClash:error', {
            message: 'Authentication required',
          })
          return
        }

        const userId = socket.user._id.toString()
        const { deviceFingerprint } = data

        // OPTIMIZATION: Debounce room operations
        if (shouldDebounceRoomOperation(userId, 'joinMatchmaking')) {
          console.log(`[QC_1V1] [LEGACY] Debounced join matchmaking for user ${userId}`)
          return
        }

        console.log(
          `[QC_1V1] [LEGACY] Socket event: User ${userId} joining 1v1 matchmaking${
            deviceFingerprint
              ? ` with device ${deviceFingerprint.substring(0, 8)}...`
              : ''
          }`
        )

        // Join 1v1 matchmaking
        await joinMatchmaking({
          userId,
        })

        // OPTIMIZED: Only join rooms if not already joined
        if (!isUserInRoom(userId, 'matchmaking')) {
          socket.join(`quickClash:matchmaking`)
          socket.join(`quickClash:matchmaking:${userId}`)
          setRoomMembership(userId, 'matchmaking', true)
          console.log(`[QC_1V1] [LEGACY] User ${userId} joined 1v1 matchmaking room`)
        } else {
          console.log(`[QC_1V1] [LEGACY] User ${userId} already in 1v1 matchmaking room`)
        }

        // Emit confirmation with device context
        socket.emit('quickClash:joinedMatchmaking', {
          userId,
          status: 'joined',
          deviceFingerprint: deviceFingerprint
            ? deviceFingerprint.substring(0, 8) + '...'
            : null,
        })

        console.log(
          `[QC_1V1] [LEGACY] 1v1 matchmaking join confirmation sent to user ${userId}`
        )
      } catch (error) {
        console.error(`[QC_1V1] [LEGACY] Error in joinMatchmaking socket event:`, error)
        socket.emit('quickClash:error', {
          message: error.message || 'Failed to join matchmaking',
        })
      }
    })
  )

  // User leaves 1v1 matchmaking - LEGACY
  socket.on(
    'quickClash:leaveMatchmaking',
    createRateLimitedHandler(socket, 'quickClash:leaveMatchmaking', async (data = {}) => {
      try {
        if (!socket.user || !socket.user._id) {
          socket.emit('quickClash:error', {
            message: 'Authentication required',
          })
          return
        }

        const userId = socket.user._id.toString()
        const { deviceFingerprint } = data

        // OPTIMIZATION: Debounce room operations
        if (shouldDebounceRoomOperation(userId, 'leaveMatchmaking')) {
          console.log(`[QC_1V1] [LEGACY] Debounced leave matchmaking for user ${userId}`)
          return
        }

        console.log(
          `[QC_1V1] [LEGACY] Socket event: User ${userId} leaving 1v1 matchmaking${
            deviceFingerprint
              ? ` with device ${deviceFingerprint.substring(0, 8)}...`
              : ''
          }`
        )

        // Leave 1v1 matchmaking
        await leaveMatchmaking({ userId })

        // Leave matchmaking room
        socket.leave(`quickClash:matchmaking`)
        socket.leave(`quickClash:matchmaking:${userId}`)
        setRoomMembership(userId, 'matchmaking', false)
        console.log(`[QC_1V1] [LEGACY] User ${userId} left 1v1 matchmaking room`)

        // Emit confirmation
        socket.emit('quickClash:leftMatchmaking', {
          userId,
          status: 'left',
          deviceFingerprint: deviceFingerprint
            ? deviceFingerprint.substring(0, 8) + '...'
            : null,
        })

        console.log(
          `[QC_1V1] [LEGACY] 1v1 matchmaking leave confirmation sent to user ${userId}`
        )
      } catch (error) {
        console.error(`[QC_1V1] [LEGACY] Error in leaveMatchmaking socket event:`, error)
        socket.emit('quickClash:error', {
          message: error.message || 'Failed to leave matchmaking',
        })
      }
    })
  )

  // Enhanced join matchmaking room - LEGACY
  socket.on(
    'quickClash:joinMatchmakingRoom',
    createRateLimitedHandler(socket, 'quickClash:joinMatchmakingRoom', async (data = {}) => {
      try {
        if (!socket.user || !socket.user._id) {
          socket.emit('quickClash:error', {
            message: 'Authentication required',
          })
          return
        }

        const userId = socket.user._id.toString()
        const { deviceFingerprint } = data

        // OPTIMIZATION: Debounce room operations
        if (shouldDebounceRoomOperation(userId, 'joinMatchmakingRoom')) {
          console.log(
            `[QC_1V1] [LEGACY] Debounced join matchmaking room for user ${userId}`
          )
          return
        }

        console.log(
          `[QC_1V1] [LEGACY] Socket event: User ${userId} joining 1v1 matchmaking room${
            deviceFingerprint
              ? ` with device ${deviceFingerprint.substring(0, 8)}...`
              : ''
          }`
        )

        // OPTIMIZED: Only join if not already in the room
        if (!isUserInRoom(userId, 'matchmaking')) {
          // Join the general quickClash matchmaking room
          socket.join('quickClash:matchmaking')

          // Also join user-specific matchmaking room
          socket.join(`quickClash:matchmaking:${userId}`)
          setRoomMembership(userId, 'matchmaking', true)

          console.log(`[QC_1V1] [LEGACY] User ${userId} joined 1v1 matchmaking rooms`)

          // Emit confirmation
          socket.emit('quickClash:matchmakingRoomJoined', {
            userId,
            rooms: ['quickClash:matchmaking', `quickClash:matchmaking:${userId}`],
            deviceFingerprint: deviceFingerprint
              ? deviceFingerprint.substring(0, 8) + '...'
              : null,
          })
        } else {
          console.log(`[QC_1V1] [LEGACY] User ${userId} already in 1v1 matchmaking rooms`)
          // Still emit confirmation for client state consistency
          socket.emit('quickClash:matchmakingRoomJoined', {
            userId,
            rooms: ['quickClash:matchmaking', `quickClash:matchmaking:${userId}`],
            deviceFingerprint: deviceFingerprint
              ? deviceFingerprint.substring(0, 8) + '...'
              : null,
            alreadyJoined: true,
          })
        }
      } catch (error) {
        console.error(
          `[QC_1V1] [LEGACY] Error in joinMatchmakingRoom socket event:`,
          error
        )
        socket.emit('quickClash:error', {
          message: error.message || 'Failed to join matchmaking room',
        })
      }
    })
  )

  // Enhanced disconnect handling for 1v1 matchmaking - LEGACY
  socket.on('disconnect', async () => {
    if (socket.user && socket.user._id) {
      try {
        const userId = socket.user._id.toString()
        console.log(`[QC_1V1] [LEGACY] Socket disconnected for user ${userId}`)

        // Update status to offline
        await updateMatchmakingStatus({
          userId,
          status: 'offline',
        })

        // Clean up room membership
        setRoomMembership(userId, 'matchmaking', false)

        console.log(
          `[QC_1V1] [LEGACY] Updated 1v1 matchmaking status to offline for user ${userId}`
        )
      } catch (error) {
        console.error(
          '[QC_1V1] [LEGACY] Error handling disconnect for 1v1 matchmaking:',
          error
        )
      }
    }
  })

  // Enhanced reconnect handling for 1v1 matchmaking - LEGACY
  socket.on('reconnect', async () => {
    if (socket.user && socket.user._id) {
      try {
        const userId = socket.user._id.toString()
        console.log(`[QC_1V1] [LEGACY] Socket reconnected for user ${userId}`)

        // Update status to online
        await updateMatchmakingStatus({
          userId,
          status: 'online',
        })

        // Re-join matchmaking room if user was in matchmaking
        const matchmakingEntry = await QuickClashMatchmaking.findOne({
          user: userId,
        })

        if (matchmakingEntry && !isUserInRoom(userId, 'matchmaking')) {
          socket.join('quickClash:matchmaking')
          socket.join(`quickClash:matchmaking:${userId}`)
          setRoomMembership(userId, 'matchmaking', true)
          console.log(
            `[QC_1V1] [LEGACY] Re-joined 1v1 matchmaking rooms for user ${userId}`
          )
        }
      } catch (error) {
        console.error(
          '[QC_1V1] [LEGACY] Error handling reconnect for 1v1 matchmaking:',
          error
        )
      }
    }
  })
}

module.exports = {
  handle1v1MatchmakingEvents,
}
