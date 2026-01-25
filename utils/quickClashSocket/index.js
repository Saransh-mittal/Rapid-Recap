/**
 * Quick Clash Socket - Main Index
 *
 * This module exports all Quick Clash socket functionality.
 * It maintains backward compatibility with the original monolithic file.
 */

// Import all modules
const {
  teamRoomMembers,
  matchmakingRoomMembers,
  setRoomMembership,
  isUserInRoom,
  isUserInTeamsRoom,
  isUserInMatchmakingRoom,
  shouldDebounceRoomOperation,
  createNotifyUser,
  getConnectionStats,
} = require('./shared')

const {
  isRateLimited,
  createRateLimitedHandler,
  applyRateLimit,
  getRateLimitStats,
  EVENT_RATE_LIMITS,
} = require('./rateLimiter')

const { setupQuickClashSocketHandlers } = require('./handlers')
const { handle1v1MatchmakingEvents } = require('./legacy1v1Events')
const { setupLegacyChallengeEvents } = require('./legacyChallengeEvents')
const { setupTeamMatchmakingEvents } = require('./teamMatchmakingEvents')
const { setupTeamMembershipEvents } = require('./teamMembershipEvents')
const { setupTeamBattleEvents } = require('./teamBattleEvents')

/**
 * Setup global emitter event handlers for Quick Clash
 * Enhanced to use the unified device tracking system
 *
 * This function sets up ALL global emitter listeners for Quick Clash events.
 * It combines:
 * - Legacy challenge events (deprecated, kept for backward compatibility)
 * - Team matchmaking events (active)
 * - Team membership events (active)
 * - Team battle events (active)
 *
 * @param {Object} io - Socket.io instance
 * @param {Object} utils - Utility functions from main socket.js
 */
const setupQuickClashGlobalEvents = (io, utils = {}) => {
  const { notifyUserAllDevices, getUserActiveDevices } = utils

  // Create the notifyUser helper
  const notifyUser = createNotifyUser(io, notifyUserAllDevices)

  console.log('[QC_SOCKET] Setting up Quick Clash global events')

  // Setup all event modules
  setupLegacyChallengeEvents(io, notifyUser)
  setupTeamMatchmakingEvents(io, notifyUser, notifyUserAllDevices)
  setupTeamMembershipEvents(io, notifyUser)
  setupTeamBattleEvents(io, notifyUser)

  console.log('[QC_SOCKET] Quick Clash global events setup complete')
}

// Export everything for backward compatibility
module.exports = {
  // Main setup functions (used by socket.js)
  setupQuickClashSocketHandlers,
  setupQuickClashGlobalEvents,

  // Legacy 1v1 matchmaking (deprecated but still exported)
  handle1v1MatchmakingEvents,

  // Room tracking utilities
  setRoomMembership,
  isUserInRoom,
  isUserInTeamsRoom,
  isUserInMatchmakingRoom,
  shouldDebounceRoomOperation,

  // Rate limiting utilities
  isRateLimited,
  createRateLimitedHandler,
  applyRateLimit,
  getRateLimitStats,
  EVENT_RATE_LIMITS,

  // Connection stats
  getConnectionStats,

  // Notification helpers
  createNotifyUser,
}
