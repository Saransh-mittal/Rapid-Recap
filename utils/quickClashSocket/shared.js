/**
 * Quick Clash Socket - Shared Utilities
 *
 * Common utilities for room management, debouncing, and notification helpers.
 * Used by all Quick Clash socket event modules.
 */

const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const { getMemberPlayerId } = require('../sessionPlayerUtils')

// ==========================================
// ROOM MEMBERSHIP TRACKING
// ==========================================

/**
 * Team room membership tracking (separate from device tracking)
 * Maps userId to team room membership status with timestamp
 */
const teamRoomMembers = new Map() // userId -> { joined: boolean, timestamp: number }

/**
 * 1v1 Matchmaking room membership tracking (LEGACY)
 * Maps userId to matchmaking room membership status with timestamp
 */
const matchmakingRoomMembers = new Map() // userId -> { joined: boolean, timestamp: number }

/**
 * Room operation debouncing to prevent rapid duplicate operations
 */
const roomOperationDebounce = new Map() // userId -> { operation: string, timestamp: number }

// ==========================================
// RATE LIMITING
// ==========================================

/**
 * Rate limit tracking for socket events
 * Key: `${userId}:${event}` -> { count, windowStart }
 */
const rateLimits = new Map()

/**
 * Default rate limit configurations per event
 */
const RATE_LIMIT_CONFIG = {
  'quickClash:joinTeamsRoom': { max: 3, windowMs: 5000 },
  'quickClash:joinMatchmaking': { max: 2, windowMs: 10000 },
  'quickClash:joinTeamMatchmaking': { max: 2, windowMs: 10000 },
  'quickClash:viewTeamBattles': { max: 5, windowMs: 5000 },
  'quickClash:joinMatchmakingRoom': { max: 3, windowMs: 5000 },
  default: { max: 10, windowMs: 1000 },
}

/**
 * Check if a socket event should be rate limited
 * @param {string} userId - User ID
 * @param {string} event - Socket event name
 * @returns {{ limited: boolean, remaining: number }} Rate limit result
 */
const checkRateLimit = (userId, event) => {
  if (!userId) return { limited: false, remaining: Infinity }

  const config = RATE_LIMIT_CONFIG[event] || RATE_LIMIT_CONFIG.default
  const { max, windowMs } = config

  const key = `${userId}:${event}`
  const now = Date.now()
  const record = rateLimits.get(key)

  // No existing record or window expired
  if (!record || now - record.windowStart > windowMs) {
    rateLimits.set(key, { count: 1, windowStart: now })
    return { limited: false, remaining: max - 1 }
  }

  // Check if limit exceeded
  if (record.count >= max) {
    return { limited: true, remaining: 0 }
  }

  // Increment count
  record.count++
  return { limited: false, remaining: max - record.count }
}

/**
 * Wrapper for rate-limited socket handlers
 * @param {Object} socket - Socket instance
 * @param {string} event - Event name
 * @param {Function} handler - Original handler function
 * @returns {Function} Wrapped handler with rate limiting
 */
const withRateLimit = (socket, event, handler) => {
  return async (...args) => {
    const userId = socket.user?._id?.toString()
    const { limited, remaining } = checkRateLimit(userId, event)

    if (limited) {
      console.warn(
        `[RATE_LIMIT] User ${userId} rate limited on ${event}`
      )
      socket.emit('quickClash:rateLimited', {
        event,
        message: 'Too many requests. Please wait.',
        retryAfterMs: RATE_LIMIT_CONFIG[event]?.windowMs || 1000,
      })
      return
    }

    // Add rate limit info to handler context
    if (args[0] && typeof args[0] === 'object') {
      args[0]._rateLimitRemaining = remaining
    }

    return handler(...args)
  }
}

// ==========================================
// DEBOUNCING HELPERS
// ==========================================

/**
 * Helper function to check if a room operation should be debounced
 * @param {string} userId - User ID
 * @param {string} operation - Operation name
 * @returns {boolean} True if operation should be debounced
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

// ==========================================
// ROOM MEMBERSHIP MANAGEMENT
// ==========================================

/**
 * Enhanced room membership management with debouncing
 * @param {string} userId - User ID
 * @param {string} roomType - Room type ('team' or 'matchmaking')
 * @param {boolean} joined - Whether user joined or left
 */
const setRoomMembership = (userId, roomType, joined) => {
  const now = Date.now()
  const membershipMap =
    roomType === 'team' ? teamRoomMembers : matchmakingRoomMembers

  if (joined) {
    membershipMap.set(userId, { joined: true, timestamp: now })
    console.log(`[QC_ROOM] User ${userId} joined ${roomType} room at ${now}`)
  } else {
    membershipMap.delete(userId)
    console.log(`[QC_ROOM] User ${userId} left ${roomType} room`)
  }
}

/**
 * Check if user is in a specific room
 * @param {string} userId - User ID
 * @param {string} roomType - Room type ('team' or 'matchmaking')
 * @returns {boolean} True if user is in the room
 */
const isUserInRoom = (userId, roomType) => {
  const membershipMap =
    roomType === 'team' ? teamRoomMembers : matchmakingRoomMembers
  const membership = membershipMap.get(userId)
  return membership?.joined === true
}

// ==========================================
// NOTIFICATION HELPERS
// ==========================================

/**
 * Create a notification helper function bound to io and device utilities
 * @param {Object} io - Socket.io instance
 * @param {Function} notifyUserAllDevices - Device-aware notification function
 * @returns {Function} notifyUser function
 */
const createNotifyUser = (io, notifyUserAllDevices) => {
  /**
   * Notify user via socket - handles both authenticated users and session players
   * @param {string|ObjectId} userId - User ID or Session Player ID to notify
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @returns {boolean} True if notification was sent successfully
   */
  return (userId, event, data) => {
    if (!userId) return false

    // Ensure userId is a string (it might be an ObjectId)
    const userIdStr = userId.toString()

    // Try device-aware notification first (for authenticated users)
    if (notifyUserAllDevices && typeof notifyUserAllDevices === 'function') {
      try {
        if (notifyUserAllDevices(userId, event, data)) return true
      } catch (error) {
        // Fall through to room-based notification
      }
    }

    // Fallback to room-based notification
    if (!io?.sockets?.adapter) return false

    // Try QuickClash room (main room for both authenticated and session players)
    const userRoom = `quickClash:${userIdStr}`
    const room = io.sockets.adapter.rooms.get(userRoom)
    if (room?.size > 0) {
      io.to(userRoom).emit(event, data)
      return true
    }

    // Try basic user room
    const basicRoom = io.sockets.adapter.rooms.get(userIdStr)
    if (basicRoom?.size > 0) {
      io.to(userIdStr).emit(event, data)
      return true
    }

    // Try spark session room
    const sparkRoom = `spark:session:${userIdStr}`
    const sparkRoomObj = io.sockets.adapter.rooms.get(sparkRoom)
    if (sparkRoomObj?.size > 0) {
      io.to(sparkRoom).emit(event, data)
      return true
    }

    // Try player room
    const playerRoom = `player:${userIdStr}`
    const playerRoomObj = io.sockets.adapter.rooms.get(playerRoom)
    if (playerRoomObj?.size > 0) {
      io.to(playerRoom).emit(event, data)
      return true
    }

    return false
  }
}

/**
 * Notify all members of a specific team
 * Also sends push notifications to offline members
 * @param {Object} io - Socket.io instance
 * @param {Function} notifyUser - User notification function
 * @param {string} teamId - Team ID
 * @param {string} event - Socket event name
 * @param {Object} data - Event data
 * @param {Array} excludeUserIds - User IDs to exclude from notification
 */
const notifyTeamMembers = async (
  io,
  notifyUser,
  teamId,
  event,
  data,
  excludeUserIds = []
) => {
  try {
    if (!teamId) {
      console.error('notifyTeamMembers: teamId is required')
      return
    }

    // Fetch team members from the database
    const team = await QuickClashTeam.findById(teamId)
      .select('members name')
      .lean()

    if (!team || !team.members || !Array.isArray(team.members)) {
      console.error(
        `Cannot notify team members: Team ${teamId} not found or has no members`
      )
      return
    }

    let notifiedCount = 0
    let offlineCount = 0
    const excludeSet = new Set(excludeUserIds.map(id => id.toString()))

    // Send event to each team member (excluding any specified exclusions)
    for (const member of team.members) {
      const userId = getMemberPlayerId(member)
      if (!userId) continue // Skip members without valid user/sessionPlayer

      // Skip if user is in exclude list
      if (excludeSet.has(userId)) {
        continue
      }

      // Use enhanced notification system
      const success = notifyUser(userId, event, {
        ...data,
        teamName: team.name, // Include team name for context
      })

      if (success) {
        notifiedCount++
      } else {
        offlineCount++
      }
    }
  } catch (error) {
    console.error(`Error notifying team members for team ${teamId}:`, error)
  }
}

// ==========================================
// CLEANUP HELPERS
// ==========================================

/**
 * Periodic cleanup of stale rate limit entries
 * Should be called every few minutes to prevent memory leaks
 */
const cleanupRateLimits = () => {
  const now = Date.now()
  const maxAge = 60000 // 1 minute

  for (const [key, record] of rateLimits.entries()) {
    if (now - record.windowStart > maxAge) {
      rateLimits.delete(key)
    }
  }
}

// Set up periodic cleanup
setInterval(cleanupRateLimits, 60000) // Every minute

// ==========================================
// CONNECTION STATS
// ==========================================

/**
 * Get connection statistics for debugging
 * @returns {Object} Connection statistics
 */
const getConnectionStats = () => {
  return {
    teamRoomMembers: teamRoomMembers.size,
    teamRoomMemberList: Array.from(teamRoomMembers.keys()),
    matchmakingRoomMembers: matchmakingRoomMembers.size,
    matchmakingRoomMemberList: Array.from(matchmakingRoomMembers.keys()),
    roomOperationDebounceSize: roomOperationDebounce.size,
    rateLimitsSize: rateLimits.size,
  }
}

/**
 * Check if user is in teams room
 * @param {string} userId - User ID
 * @returns {boolean} True if user is in teams room
 */
const isUserInTeamsRoom = userId => {
  return isUserInRoom(userId, 'team')
}

/**
 * Check if user is in 1v1 matchmaking room
 * @param {string} userId - User ID
 * @returns {boolean} True if user is in 1v1 matchmaking room
 */
const isUserInMatchmakingRoom = userId => {
  return isUserInRoom(userId, 'matchmaking')
}

module.exports = {
  // Room membership
  teamRoomMembers,
  matchmakingRoomMembers,
  setRoomMembership,
  isUserInRoom,
  isUserInTeamsRoom,
  isUserInMatchmakingRoom,

  // Debouncing
  shouldDebounceRoomOperation,

  // Rate limiting
  checkRateLimit,
  withRateLimit,
  RATE_LIMIT_CONFIG,

  // Notifications
  createNotifyUser,
  notifyTeamMembers,

  // Stats
  getConnectionStats,
}
