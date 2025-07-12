// utils/socketUtils.js
/**
 * Socket utilities module to safely access socket functionality
 * This avoids circular dependency issues and provides a clean interface
 */

let socketInstance = null

/**
 * Initialize the socket utilities with the socket instance
 * This should be called after the socket is initialized
 * @param {Object} io - Socket.io instance
 */
const initializeSocketUtils = io => {
  socketInstance = io
  console.log('[SOCKET_UTILS] Socket utilities initialized')
}

/**
 * Check if a user is online by checking socket connections
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is online (has active socket connections)
 */
const isUserOnline = userId => {
  try {
    if (!socketInstance || !socketInstance.getUserActiveDevices) {
      console.warn(
        '[SOCKET_UTILS] Socket not initialized, assuming user offline',
      )
      return false
    }

    const activeDevices = socketInstance.getUserActiveDevices(userId)
    return activeDevices && activeDevices.length > 0
  } catch (error) {
    console.error('[SOCKET_UTILS] Error checking user online status:', error)
    // If we can't check, assume offline to ensure notifications are sent
    return false
  }
}

/**
 * Notify user across all devices
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 * @returns {boolean} True if notification was sent successfully
 */
const notifyUserAllDevices = (userId, event, data) => {
  try {
    if (!socketInstance || !socketInstance.notifyUserAllDevices) {
      console.warn(
        '[SOCKET_UTILS] Socket not initialized, cannot send notification',
      )
      return false
    }

    return socketInstance.notifyUserAllDevices(userId, event, data)
  } catch (error) {
    console.error('[SOCKET_UTILS] Error sending notification:', error)
    return false
  }
}

/**
 * Get user's active devices
 * @param {string} userId - User ID
 * @returns {Array} Array of active devices
 */
const getUserActiveDevices = userId => {
  try {
    if (!socketInstance || !socketInstance.getUserActiveDevices) {
      console.warn(
        '[SOCKET_UTILS] Socket not initialized, returning empty devices',
      )
      return []
    }

    return socketInstance.getUserActiveDevices(userId)
  } catch (error) {
    console.error('[SOCKET_UTILS] Error getting active devices:', error)
    return []
  }
}

/**
 * Get connection statistics
 * @returns {Object} Connection statistics
 */
const getConnectionStats = () => {
  try {
    if (!socketInstance || !socketInstance.getConnectionStats) {
      console.warn(
        '[SOCKET_UTILS] Socket not initialized, returning empty stats',
      )
      return {}
    }

    return socketInstance.getConnectionStats()
  } catch (error) {
    console.error('[SOCKET_UTILS] Error getting connection stats:', error)
    return {}
  }
}

/**
 * Check if socket utilities are available
 * @returns {boolean} True if socket is initialized and ready
 */
const isSocketReady = () => {
  return (
    socketInstance !== null &&
    typeof socketInstance.getUserActiveDevices === 'function'
  )
}

/**
 * Debug function to inspect socket utilities state (development only)
 * @param {string} [userId] - Optional user ID to check specific user
 */
const debugSocketState = userId => {
  if (process.env.NODE_ENV === 'production') {
    console.log('[SOCKET_UTILS] Debug function disabled in production')
    return
  }

  console.log('[SOCKET_UTILS] ===== DEBUG SOCKET STATE =====')
  console.log('[SOCKET_UTILS] socketInstance:', !!socketInstance)

  if (socketInstance && socketInstance.getConnectionStats) {
    try {
      const stats = socketInstance.getConnectionStats()
      console.log('[SOCKET_UTILS] Connection stats:', stats)
    } catch (error) {
      console.error('[SOCKET_UTILS] Error getting connection stats:', error)
    }
  }

  if (userId && socketInstance && socketInstance.getUserActiveDevices) {
    try {
      const devices = socketInstance.getUserActiveDevices(userId)
      console.log(
        `[SOCKET_UTILS] Active devices for ${userId}:`,
        devices?.length || 0,
      )

      const isOnlineResult = isUserOnline(userId)
      console.log(`[SOCKET_UTILS] isUserOnline(${userId}): ${isOnlineResult}`)
    } catch (error) {
      console.error(`[SOCKET_UTILS] Error in debug for ${userId}:`, error)
    }
  }

  console.log('[SOCKET_UTILS] ===== END DEBUG =====')
}

module.exports = {
  initializeSocketUtils,
  isUserOnline,
  notifyUserAllDevices,
  getUserActiveDevices,
  getConnectionStats,
  isSocketReady,
  debugSocketState,
}
