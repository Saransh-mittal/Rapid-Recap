// src/utils/memoryCacheMonitor.js
const cache = require('memory-cache')
const util = require('util')
const sizeof = require('object-sizeof') // Install via `npm install object-sizeof`

/**
 * Analyze the memory usage of the cache.
 * @returns {Object} Memory usage report.
 */
const analyzeMemoryCache = () => {
  const keys = cache.keys()
  const memoryUsage = []

  keys.forEach(key => {
    const value = cache.get(key)
    const size = calculateSize(value)

    memoryUsage.push({
      key,
      size: formatBytes(size),
      rawSize: size,
      type: getKeyType(key),
      expiryTime: getExpiryTime(key),
      value: util.inspect(value, { depth: 1, maxStringLength: 100 }), // Handle deeper structures
    })
  })

  // Sort entries by size in descending order
  memoryUsage.sort((a, b) => b.rawSize - a.rawSize)

  const totalSize = memoryUsage.reduce((acc, curr) => acc + curr.rawSize, 0)

  return {
    totalKeys: keys.length,
    totalSize: formatBytes(totalSize),
    rawTotalSize: totalSize,
    keysBySize: memoryUsage,
  }
}

/**
 * Determine the type of cache key based on its name.
 * @param {string} key - The cache key.
 * @returns {string} Key type.
 */
const getKeyType = key => {
  if (key.includes('article')) return 'Article Cache'
  if (key.includes('user')) return 'User Cache'
  if (key.includes('tournament')) return 'Tournament Cache'
  if (key.includes('recommendation')) return 'Recommendation Cache'
  return 'Other'
}

/**
 * Calculate the approximate memory size of a value.
 * @param {any} obj - The value to calculate size for.
 * @returns {number} Memory size in bytes.
 */
const calculateSize = obj => {
  try {
    return sizeof(obj)
  } catch (err) {
    console.error(`Error calculating size for object: ${err.message}`)
    return 0
  }
}

/**
 * Retrieve the expiry time of a cache key.
 * @param {string} key - The cache key.
 * @returns {string} Expiry time or "None".
 */
const getExpiryTime = key => {
  const ttlKey = `${key}:ttl`
  const expiryTime = cache.get(ttlKey)
  return expiryTime ? new Date(expiryTime).toISOString() : 'None'
}

/**
 * Format a byte value into a human-readable string.
 * @param {number} bytes - Number of bytes.
 * @returns {string} Formatted byte value.
 */
const formatBytes = bytes => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

module.exports = { analyzeMemoryCache }
