/**
 * Quick Clash Socket - Socket Handlers
 *
 * Main socket handler setup for Quick Clash feature.
 * Sets up per-connection event listeners for room management and device registration.
 */

const {
  shouldDebounceRoomOperation,
  setRoomMembership,
  isUserInRoom,
} = require('./shared')
const { createRateLimitedHandler } = require('./rateLimiter')
const { handle1v1MatchmakingEvents } = require('./legacy1v1Events')

/**
 * Setup socket event handlers for Quick Clash feature with enhanced room management
 * Uses the main socket.js device tracking system instead of maintaining separate tracking
 *
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Client socket connection
 * @param {Object} user - Authenticated user object
 */
const setupQuickClashSocketHandlers = (io, socket, user) => {
  // Ensure user object is valid before proceeding
  if (!user || !user._id) {
    console.error('Invalid user object in setupQuickClashSocketHandlers')
    return
  }

  const userId = user._id.toString()
  const socketId = socket.id
  const quickClashRoom = `quickClash:${userId}`

  console.log(
    `[QC_SETUP] Setting up QuickClash handlers for user ${userId} socket ${socketId}`
  )

  // ==========================================
  // DEVICE REGISTRATION
  // ==========================================

  // Listen for device fingerprint from client (but don't track separately)
  socket.on('quickClash:registerDevice', ({ deviceFingerprint }) => {
    if (!deviceFingerprint) {
      console.error(
        'No device fingerprint provided for QuickClash socket registration'
      )
      return
    }

    console.log(
      `[QC_DEVICE] QuickClash device registered for user ${userId} device ${deviceFingerprint.substring(
        0,
        8
      )}...`
    )

    // Emit confirmation (device tracking is handled by main socket.js)
    socket.emit('quickClash:deviceRegistered', {
      deviceFingerprint: deviceFingerprint.substring(0, 8) + '...',
      socketId,
      isUnique: true,
    })
  })

  // ==========================================
  // DISCONNECT HANDLING
  // ==========================================

  // Handle socket disconnection with enhanced cleanup
  socket.on('disconnect', () => {
    // Clean up room memberships
    setRoomMembership(userId, 'team', false)
    setRoomMembership(userId, 'matchmaking', false)

    console.log(
      `[QC_DISCONNECT] Socket ${socketId} disconnected from QuickClash for user ${userId}`
    )
  })

  // ==========================================
  // ROOM JOIN HANDLERS
  // ==========================================

  // Listen for explicit join requests
  socket.on('quickClash:join', (data = {}) => {
    const { deviceFingerprint } = data
    console.log(
      `[QC_JOIN] User ${userId} explicitly joined QuickClash socket channel${
        deviceFingerprint
          ? ` with device ${deviceFingerprint.substring(0, 8)}...`
          : ''
      }`
    )
  })

  // Generic room join handler
  socket.on('join', room => {
    socket.join(room)
    console.log(`[QC_ROOM] User ${userId} joined room: ${room}`)
  })

  // RATE LIMITED: Listen for explicit request to join the teams room
  socket.on(
    'quickClash:joinTeamsRoom',
    createRateLimitedHandler(socket, 'quickClash:joinTeamsRoom', (data = {}) => {
      const { deviceFingerprint } = data

      // OPTIMIZATION: Debounce room operations
      if (shouldDebounceRoomOperation(userId, 'joinTeamsRoom')) {
        console.log(`[QC_TEAMS] Debounced join teams room for user ${userId}`)
        return
      }

      if (!isUserInRoom(userId, 'team')) {
        socket.join('quickClash:teams')
        setRoomMembership(userId, 'team', true)
        console.log(
          `[QC_TEAMS] User ${userId} joined QuickClash teams room${
            deviceFingerprint
              ? ` with device ${deviceFingerprint.substring(0, 8)}...`
              : ''
          }`
        )

        // DEBUG: Verify teams room joining
        setTimeout(() => {
          const teamsRoom = io.sockets.adapter.rooms.get('quickClash:teams')
          console.log(
            `DEBUG: quickClash:teams room now has ${
              teamsRoom ? teamsRoom.size : 0
            } sockets`
          )
        }, 100)
      } else {
        console.log(`[QC_TEAMS] User ${userId} already in QuickClash teams room`)
      }
    })
  )

  // ==========================================
  // MATCHMAKING HANDLERS
  // ==========================================

  // Set up 1v1 matchmaking event handlers (LEGACY)
  handle1v1MatchmakingEvents(io, socket)

  // Add listeners for team matchmaking
  socket.on('quickClash:joinGlobalMatchmaking', data => {
    console.log(
      `[QC_MM] Socket event: User ${userId} requested to join global matchmaking`
    )
  })

  socket.on('quickClash:leaveGlobalMatchmaking', () => {
    console.log(
      `[QC_MM] Socket event: User ${userId} requested to leave global matchmaking`
    )
  })

  // RATE LIMITED: Handle team matchmaking join
  socket.on(
    'quickClash:joinTeamMatchmaking',
    createRateLimitedHandler(socket, 'quickClash:joinTeamMatchmaking', (data = {}) => {
      const { teamId, deviceFingerprint } = data

      // OPTIMIZATION: Debounce room operations
      if (shouldDebounceRoomOperation(userId, 'joinTeamMatchmaking')) {
        console.log(`[QC_MM] Debounced join team matchmaking for user ${userId}`)
        return
      }

      console.log(
        `[QC_MM] Socket event: User ${userId} requested to join team matchmaking with team ${teamId}${
          deviceFingerprint
            ? ` with device ${deviceFingerprint.substring(0, 8)}...`
            : ''
        }`
      )

      // OPTIMIZED: Only join the teams room when needed and not already joined
      if (!isUserInRoom(userId, 'team')) {
        socket.join('quickClash:teams')
        setRoomMembership(userId, 'team', true)
        console.log(
          `[QC_TEAMS] User ${userId} joined QuickClash teams room (via team matchmaking)`
        )
      } else {
        console.log(
          `[QC_TEAMS] User ${userId} already in QuickClash teams room (team matchmaking)`
        )
      }
    })
  )

  // RATE LIMITED: Handle viewing team battles
  socket.on(
    'quickClash:viewTeamBattles',
    createRateLimitedHandler(socket, 'quickClash:viewTeamBattles', (data = {}) => {
      const { deviceFingerprint } = data

      // OPTIMIZATION: Debounce room operations
      if (shouldDebounceRoomOperation(userId, 'viewTeamBattles')) {
        console.log(`[QC_TEAMS] Debounced view team battles for user ${userId}`)
        return
      }

      if (!isUserInRoom(userId, 'team')) {
        socket.join('quickClash:teams')
        setRoomMembership(userId, 'team', true)
        console.log(
          `[QC_TEAMS] User ${userId} joined QuickClash teams room (via team battles view)${
            deviceFingerprint
              ? ` with device ${deviceFingerprint.substring(0, 8)}...`
              : ''
          }`
        )
      } else {
        console.log(
          `[QC_TEAMS] User ${userId} already in QuickClash teams room (team battles)`
        )
      }
    })
  )
}

module.exports = {
  setupQuickClashSocketHandlers,
}
