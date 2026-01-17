// utils/asyncMutex.js
// Async mutex with timeout support to prevent deadlocks

/**
 * Creates an async mutex with timeout support
 * Usage:
 *   const lock = createMutex()
 *   await lock.acquire()
 *   try { ... } finally { lock.release() }
 *
 * Or use the helper with timeout:
 *   await lock.withLock(async () => { ... }, 30000) // 30 second timeout
 */
const createMutex = () => {
  let locked = false
  let lockAcquiredAt = null
  const queue = []

  const acquire = (timeoutMs = 30000) => {
    return new Promise((resolve, reject) => {
      const attemptAcquire = () => {
        if (!locked) {
          locked = true
          lockAcquiredAt = Date.now()
          resolve()
          return true
        }
        return false
      }

      // Try immediate acquisition
      if (attemptAcquire()) return

      // Set up timeout
      const timeoutId = setTimeout(() => {
        // Remove from queue
        const idx = queue.findIndex(item => item.resolve === wrappedResolve)
        if (idx !== -1) {
          queue.splice(idx, 1)
        }
        reject(new Error(`Mutex acquisition timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      // Wrapped resolve that clears timeout
      const wrappedResolve = () => {
        clearTimeout(timeoutId)
        locked = true
        lockAcquiredAt = Date.now()
        resolve()
      }

      queue.push({ resolve: wrappedResolve, timeoutId })
    })
  }

  const release = () => {
    if (queue.length > 0) {
      const next = queue.shift()
      clearTimeout(next.timeoutId)
      next.resolve()
    } else {
      locked = false
      lockAcquiredAt = null
    }
  }

  // Force release - clears the lock and rejects all waiting
  const forceRelease = () => {
    console.warn('[MUTEX] Force releasing lock and clearing queue')
    locked = false
    lockAcquiredAt = null
    // Clear the queue - reject all waiters
    while (queue.length > 0) {
      const item = queue.shift()
      clearTimeout(item.timeoutId)
      // We just discard them - they'll timeout anyway
    }
  }

  const withLock = async (fn, timeoutMs = 30000) => {
    try {
      await acquire(timeoutMs)
    } catch (error) {
      // If timeout, force release and try again once
      if (error.message.includes('timed out')) {
        console.warn('[MUTEX] Lock acquisition timed out, checking if force release needed')
        if (locked && lockAcquiredAt && Date.now() - lockAcquiredAt > 60000) {
          console.warn('[MUTEX] Lock held for >60s, force releasing')
          forceRelease()
          // Try one more time with a short timeout
          await acquire(5000)
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    try {
      return await fn()
    } finally {
      release()
    }
  }

  const isLocked = () => locked

  const queueLength = () => queue.length

  const getLockAge = () => lockAcquiredAt ? Date.now() - lockAcquiredAt : null

  return {
    acquire,
    release,
    forceRelease,
    withLock,
    isLocked,
    queueLength,
    getLockAge,
  }
}

// Create a singleton mutex for matchmaking operations
const matchmakingMutex = createMutex()

module.exports = {
  createMutex,
  matchmakingMutex,
}

