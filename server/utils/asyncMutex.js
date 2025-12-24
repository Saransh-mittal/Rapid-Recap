// utils/asyncMutex.js
// Simple async mutex for serializing access to critical sections

/**
 * Creates a simple async mutex/lock
 * Usage:
 *   const lock = createMutex()
 *   await lock.acquire()
 *   try { ... } finally { lock.release() }
 *
 * Or use the helper:
 *   await lock.withLock(async () => { ... })
 */
const createMutex = () => {
  let locked = false
  const queue = []

  const acquire = () => {
    return new Promise(resolve => {
      if (!locked) {
        locked = true
        resolve()
      } else {
        queue.push(resolve)
      }
    })
  }

  const release = () => {
    if (queue.length > 0) {
      const next = queue.shift()
      next()
    } else {
      locked = false
    }
  }

  const withLock = async fn => {
    await acquire()
    try {
      return await fn()
    } finally {
      release()
    }
  }

  const isLocked = () => locked

  const queueLength = () => queue.length

  return {
    acquire,
    release,
    withLock,
    isLocked,
    queueLength,
  }
}

// Create a singleton mutex for matchmaking operations
const matchmakingMutex = createMutex()

module.exports = {
  createMutex,
  matchmakingMutex,
}
