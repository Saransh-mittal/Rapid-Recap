/**
 * Custom Drill Rate Limiter — in-memory, per-user HTTP middleware
 *
 * Layers of protection:
 *  1. Per-user generation limit: max 3 /start calls per 5 min window
 *  2. Concurrent guard: only 1 active generation at a time per user
 *  3. General endpoint limit: max 30 requests/min across all custom-drill routes
 *
 * These sit ON TOP of the business-logic daily limit (3 free/day + purchased).
 */

const activeGenerations = new Set()   // userId strings currently generating
const requestWindows = new Map()      // key -> { count, windowStart }

// ── Configs ──
const LIMITS = {
  // /start — expensive LLM call
  generation: { max: 3, windowMs: 5 * 60 * 1000, message: 'Too many drill generations. Please wait a few minutes.' },
  // all custom-drill endpoints
  general: { max: 30, windowMs: 60 * 1000, message: 'Too many requests. Please slow down.' },
}

// ── Core check ──
const isLimited = (key, config) => {
  const now = Date.now()
  const record = requestWindows.get(key)

  if (!record || now - record.windowStart > config.windowMs) {
    requestWindows.set(key, { count: 1, windowStart: now })
    return null
  }

  if (record.count >= config.max) {
    const retryAfter = Math.ceil((config.windowMs - (now - record.windowStart)) / 1000)
    return { retryAfter }
  }

  record.count++
  return null
}

// ── Middleware: general rate limit (all custom-drill routes) ──
const customDrillRateLimit = (req, res, next) => {
  const userId = req.user?._id?.toString()
  if (!userId) return next() // flexAuth handles auth

  const result = isLimited(`general:${userId}`, LIMITS.general)
  if (result) {
    return res.status(429).json({
      message: LIMITS.general.message,
      retryAfter: result.retryAfter,
    })
  }
  next()
}

// ── Middleware: generation rate limit + concurrent guard (/start only) ──
const customDrillGenerationGuard = (req, res, next) => {
  const userId = req.user?._id?.toString()
  if (!userId) return next()

  // Concurrent guard — only 1 generation at a time
  if (activeGenerations.has(userId)) {
    return res.status(429).json({
      message: 'A drill is already being generated. Please wait for it to finish.',
    })
  }

  // Per-user generation rate limit
  const result = isLimited(`generation:${userId}`, LIMITS.generation)
  if (result) {
    return res.status(429).json({
      message: LIMITS.generation.message,
      retryAfter: result.retryAfter,
    })
  }

  // Mark as active (released after response finishes)
  activeGenerations.add(userId)
  res.on('finish', () => activeGenerations.delete(userId))
  res.on('close', () => activeGenerations.delete(userId))

  next()
}

// ── Periodic cleanup (every 5 min) ──
setInterval(() => {
  const now = Date.now()
  const maxAge = 10 * 60 * 1000
  for (const [key, record] of requestWindows.entries()) {
    if (now - record.windowStart > maxAge) requestWindows.delete(key)
  }
}, 5 * 60 * 1000)

module.exports = {
  customDrillRateLimit,
  customDrillGenerationGuard,
}
