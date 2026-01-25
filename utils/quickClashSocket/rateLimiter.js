/**
 * Quick Clash Socket - Rate Limiter
 *
 * Dedicated rate limiting utility for socket events.
 * Provides middleware-style rate limiting for socket handlers.
 */

/**
 * Rate limit tracking for socket events
 * Key: `${userId}:${event}` -> { count, windowStart }
 */
const rateLimits = new Map()

/**
 * Rate limit configurations per event type
 */
const EVENT_RATE_LIMITS = {
  // Room join events - prevent spam
  'quickClash:joinTeamsRoom': { max: 3, windowMs: 5000, message: 'Too many room join attempts' },
  'quickClash:joinMatchmakingRoom': { max: 3, windowMs: 5000, message: 'Too many room join attempts' },

  // Matchmaking events - prevent queue manipulation
  'quickClash:joinMatchmaking': { max: 2, windowMs: 10000, message: 'Too many matchmaking attempts' },
  'quickClash:leaveMatchmaking': { max: 3, windowMs: 10000, message: 'Too many matchmaking actions' },
  'quickClash:joinTeamMatchmaking': { max: 2, windowMs: 10000, message: 'Too many matchmaking attempts' },

  // View events - prevent refresh spam
  'quickClash:viewTeamBattles': { max: 5, windowMs: 5000, message: 'Too many refresh attempts' },

  // Default for unlisted events
  default: { max: 20, windowMs: 1000, message: 'Too many requests' },
}

/**
 * Check if a request should be rate limited
 * @param {string} userId - User ID
 * @param {string} event - Socket event name
 * @returns {Object} { limited: boolean, remaining: number, retryAfterMs?: number }
 */
const isRateLimited = (userId, event) => {
  if (!userId) {
    return { limited: false, remaining: Infinity }
  }

  const config = EVENT_RATE_LIMITS[event] || EVENT_RATE_LIMITS.default
  const { max, windowMs } = config

  const key = `${userId}:${event}`
  const now = Date.now()
  const record = rateLimits.get(key)

  // No existing record or window expired - reset counter
  if (!record || now - record.windowStart > windowMs) {
    rateLimits.set(key, { count: 1, windowStart: now })
    return { limited: false, remaining: max - 1 }
  }

  // Check if limit exceeded
  if (record.count >= max) {
    const retryAfterMs = windowMs - (now - record.windowStart)
    return {
      limited: true,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs)
    }
  }

  // Increment count
  record.count++
  return { limited: false, remaining: max - record.count }
}

/**
 * Create a rate-limited socket handler
 * Wraps an existing handler with rate limiting logic
 *
 * @param {Object} socket - Socket instance
 * @param {string} event - Event name
 * @param {Function} handler - Original handler function
 * @returns {Function} Wrapped handler with rate limiting
 *
 * @example
 * socket.on('quickClash:joinTeamsRoom',
 *   createRateLimitedHandler(socket, 'quickClash:joinTeamsRoom', originalHandler)
 * )
 */
const createRateLimitedHandler = (socket, event, handler) => {
  return async (...args) => {
    const userId = socket.user?._id?.toString()
    const result = isRateLimited(userId, event)

    if (result.limited) {
      const config = EVENT_RATE_LIMITS[event] || EVENT_RATE_LIMITS.default

      console.warn(
        `[RATE_LIMIT] User ${userId} rate limited on ${event} (retry after ${result.retryAfterMs}ms)`
      )

      socket.emit('quickClash:rateLimited', {
        event,
        message: config.message,
        retryAfterMs: result.retryAfterMs,
      })

      return // Don't execute the handler
    }

    // Execute the original handler
    try {
      await handler(...args)
    } catch (error) {
      console.error(`[RATE_LIMIT] Error in handler for ${event}:`, error)
      throw error
    }
  }
}

/**
 * Apply rate limiting to a socket event registration
 * Helper function for cleaner syntax
 *
 * @param {Object} socket - Socket instance
 * @param {string} event - Event name
 * @param {Function} handler - Handler function
 *
 * @example
 * applyRateLimit(socket, 'quickClash:joinTeamsRoom', async (data) => { ... })
 */
const applyRateLimit = (socket, event, handler) => {
  socket.on(event, createRateLimitedHandler(socket, event, handler))
}

/**
 * Clean up stale rate limit entries
 * Should be called periodically to prevent memory leaks
 */
const cleanupRateLimits = () => {
  const now = Date.now()
  const maxAge = 120000 // 2 minutes - keep entries for a bit longer than max window

  let cleaned = 0
  for (const [key, record] of rateLimits.entries()) {
    if (now - record.windowStart > maxAge) {
      rateLimits.delete(key)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`[RATE_LIMIT] Cleaned up ${cleaned} stale rate limit entries`)
  }
}

/**
 * Get rate limit stats for debugging
 * @returns {Object} Rate limit statistics
 */
const getRateLimitStats = () => {
  return {
    totalEntries: rateLimits.size,
    entries: Array.from(rateLimits.entries()).map(([key, record]) => ({
      key,
      count: record.count,
      age: Date.now() - record.windowStart,
    })),
  }
}

/**
 * Reset rate limit for a specific user and event
 * Useful for testing or admin overrides
 * @param {string} userId - User ID
 * @param {string} event - Event name (optional, resets all if not provided)
 */
const resetRateLimit = (userId, event = null) => {
  if (event) {
    rateLimits.delete(`${userId}:${event}`)
  } else {
    // Reset all rate limits for user
    for (const key of rateLimits.keys()) {
      if (key.startsWith(`${userId}:`)) {
        rateLimits.delete(key)
      }
    }
  }
}

// Set up periodic cleanup every 2 minutes
const cleanupInterval = setInterval(cleanupRateLimits, 120000)

// Allow cleanup interval to be cleared for testing
const stopCleanup = () => {
  clearInterval(cleanupInterval)
}

module.exports = {
  isRateLimited,
  createRateLimitedHandler,
  applyRateLimit,
  cleanupRateLimits,
  getRateLimitStats,
  resetRateLimit,
  stopCleanup,
  EVENT_RATE_LIMITS,
}
