// utils/scopedMutex.utils.js
const { Mutex } = require('async-mutex')

/**
 * Map to store mutexes for different scopes
 * Key format: "battleId:teamId" for team-level locking
 */
const lockMap = new Map()

/**
 * Get or create a mutex for a specific scope
 * @param {string} battleId - Battle ID
 * @param {string} teamId - Team ID (teamA or teamB)
 * @returns {Mutex} Mutex instance for the scope
 */
const getMutex = (battleId, teamId) => {
  const key = `${battleId}:${teamId}`

  if (!lockMap.has(key)) {
    lockMap.set(key, new Mutex())
    console.log(`[SCOPED_MUTEX] Created new mutex for scope: ${key}`)
  }

  return lockMap.get(key)
}

/**
 * Execute a function with scoped mutex locking
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Battle ID
 * @param {string} params.teamId - Team ID (teamA or teamB)
 * @param {string} params.userId - User ID (for logging)
 * @param {string} params.operation - Operation name (for logging)
 * @param {Function} params.fn - Function to execute under lock
 * @returns {Promise<any>} Result of the function execution
 */
const withScopedLock = async ({ battleId, teamId, userId, operation, fn }) => {
  const key = `${battleId}:${teamId}`
  const mutex = getMutex(battleId, teamId)

  console.log(
    `[SCOPED_MUTEX] User ${userId} waiting for lock on ${key} for operation: ${operation}`,
  )

  const release = await mutex.acquire()

  try {
    console.log(
      `[SCOPED_MUTEX] User ${userId} acquired lock on ${key} for operation: ${operation}`,
    )

    const result = await fn()

    console.log(
      `[SCOPED_MUTEX] User ${userId} completed operation: ${operation} on ${key}`,
    )

    return result
  } finally {
    release()

    console.log(
      `[SCOPED_MUTEX] User ${userId} released lock on ${key} for operation: ${operation}`,
    )

    // Optional cleanup: remove mutex if no longer in use
    // This helps prevent memory leaks for old battles
    setTimeout(() => {
      if (!mutex.isLocked()) {
        lockMap.delete(key)
        console.log(`[SCOPED_MUTEX] Cleaned up unused mutex for scope: ${key}`)
      }
    }, 5000) // Wait 5 seconds before cleanup
  }
}

/**
 * Force cleanup of a specific mutex (useful for completed battles)
 * @param {string} battleId - Battle ID
 * @param {string} teamId - Team ID
 */
const cleanupMutex = (battleId, teamId) => {
  const key = `${battleId}:${teamId}`

  if (lockMap.has(key)) {
    const mutex = lockMap.get(key)

    if (!mutex.isLocked()) {
      lockMap.delete(key)
      console.log(`[SCOPED_MUTEX] Force cleaned up mutex for scope: ${key}`)
      return true
    } else {
      console.log(`[SCOPED_MUTEX] Cannot cleanup mutex ${key} - still locked`)
      return false
    }
  }

  return true
}

/**
 * Force cleanup all mutexes for a specific battle
 * @param {string} battleId - Battle ID
 */
const cleanupBattleMutexes = battleId => {
  const keysToDelete = []

  for (const [key, mutex] of lockMap.entries()) {
    if (key.startsWith(`${battleId}:`)) {
      if (!mutex.isLocked()) {
        keysToDelete.push(key)
      }
    }
  }

  keysToDelete.forEach(key => {
    lockMap.delete(key)
    console.log(`[SCOPED_MUTEX] Cleaned up battle mutex: ${key}`)
  })

  return keysToDelete.length
}

/**
 * Get current mutex statistics (for debugging)
 * @returns {Object} Statistics about active mutexes
 */
const getMutexStats = () => {
  const stats = {
    totalMutexes: lockMap.size,
    lockedMutexes: 0,
    availableMutexes: 0,
    mutexes: [],
  }

  for (const [key, mutex] of lockMap.entries()) {
    const isLocked = mutex.isLocked()

    if (isLocked) {
      stats.lockedMutexes++
    } else {
      stats.availableMutexes++
    }

    stats.mutexes.push({
      key,
      isLocked,
      queueLength: mutex.waitingCount || 0,
    })
  }

  return stats
}

module.exports = {
  getMutex,
  withScopedLock,
  cleanupMutex,
  cleanupBattleMutexes,
  getMutexStats,
}
