// server/utils/sessionWriteQueue.js
// Manages sequential write operations for Quick Clash sessions
// to prevent race conditions between Forge optimistic updates and Quiz transactions

/**
 * In-memory write queue per session
 * Structure: Map<sessionId, { queue: [], processing: Promise, failed: boolean, error: string }>
 */
const sessionQueues = new Map()

// Queue cleanup timeout (10 minutes)
const QUEUE_CLEANUP_MS = 10 * 60 * 1000

/**
 * Enqueue a write operation for a session
 * Returns immediately (fire-and-forget for caller)
 * @param {string} sessionId - Session ID
 * @param {Function} writeOperation - Async function to execute
 */
function enqueueWrite(sessionId, writeOperation) {
  let sessionQueue = sessionQueues.get(sessionId)

  if (!sessionQueue) {
    sessionQueue = {
      queue: [],
      processing: null,
      failed: false,
      error: null,
      lastActivity: Date.now()
    }
    sessionQueues.set(sessionId, sessionQueue)
  }

  sessionQueue.lastActivity = Date.now()
  sessionQueue.queue.push(writeOperation)

  // Trigger processing if not already running
  if (!sessionQueue.processing) {
    sessionQueue.processing = processQueue(sessionId)
  }
}

/**
 * Wait for all pending writes in a session's queue to complete
 * @param {string} sessionId - Session ID
 * @param {number} timeoutMs - Maximum time to wait (default 2000ms)
 * @returns {Promise<{drained: boolean, failed: boolean, error: string|null}>}
 */
async function waitForQueueDrain(sessionId, timeoutMs = 2000) {
  const sessionQueue = sessionQueues.get(sessionId)

  // No queue = no pending writes
  if (!sessionQueue) {
    return { drained: true, failed: false, error: null }
  }

  // Already failed
  if (sessionQueue.failed) {
    return { drained: true, failed: true, error: sessionQueue.error }
  }

  // No pending processing and empty queue
  if (!sessionQueue.processing && sessionQueue.queue.length === 0) {
    return { drained: true, failed: false, error: null }
  }

  // Wait for processing with timeout
  try {
    await Promise.race([
      sessionQueue.processing,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue drain timeout')), timeoutMs)
      )
    ])

    return {
      drained: true,
      failed: sessionQueue.failed,
      error: sessionQueue.error
    }
  } catch (error) {
    if (error.message === 'Queue drain timeout') {
      console.warn(`[SessionWriteQueue] Queue drain timeout for session ${sessionId}`)
      return { drained: false, failed: true, error: 'Queue drain timeout' }
    }
    throw error
  }
}

/**
 * Process writes in the queue sequentially
 * @param {string} sessionId - Session ID
 */
async function processQueue(sessionId) {
  const sessionQueue = sessionQueues.get(sessionId)

  if (!sessionQueue) {
    return
  }

  while (sessionQueue.queue.length > 0) {
    const writeOperation = sessionQueue.queue.shift()

    try {
      await writeOperation()
    } catch (error) {
      console.error(`[SessionWriteQueue] Write failed for session ${sessionId}:`, error.message)

      // Mark queue as failed
      sessionQueue.failed = true
      sessionQueue.error = error.message

      // Clear remaining queue (won't process after failure)
      sessionQueue.queue = []
      break
    }
  }

  // Processing complete
  sessionQueue.processing = null
}

/**
 * Check if a session's queue has failed
 * @param {string} sessionId - Session ID
 * @returns {{failed: boolean, error: string|null}}
 */
function getQueueStatus(sessionId) {
  const sessionQueue = sessionQueues.get(sessionId)

  if (!sessionQueue) {
    return { failed: false, error: null, pending: 0 }
  }

  return {
    failed: sessionQueue.failed,
    error: sessionQueue.error,
    pending: sessionQueue.queue.length
  }
}

/**
 * Clear queue for a session (e.g., on session completion or retry)
 * @param {string} sessionId - Session ID
 */
function clearQueue(sessionId) {
  sessionQueues.delete(sessionId)
}

/**
 * Mark session queue as failed (called when backend error detected)
 * @param {string} sessionId - Session ID
 * @param {string} errorType - Error type for tracking
 */
function markQueueFailed(sessionId, errorType) {
  let sessionQueue = sessionQueues.get(sessionId)

  if (!sessionQueue) {
    sessionQueue = {
      queue: [],
      processing: null,
      failed: true,
      error: errorType,
      lastActivity: Date.now()
    }
    sessionQueues.set(sessionId, sessionQueue)
  } else {
    sessionQueue.failed = true
    sessionQueue.error = errorType
    sessionQueue.queue = []
  }
}

// Cleanup stale queues periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, queue] of sessionQueues.entries()) {
    if (now - queue.lastActivity > QUEUE_CLEANUP_MS) {
      sessionQueues.delete(sessionId)
    }
  }
}, 5 * 60 * 1000)

module.exports = {
  enqueueWrite,
  waitForQueueDrain,
  getQueueStatus,
  clearQueue,
  markQueueFailed
}
