// src/utils/memoryCacheMonitor.js
const cache = require('memory-cache')
const util = require('util')

const analyzeMemoryCache = () => {
  const keys = cache.keys()
  const memoryUsage = []

  keys.forEach(key => {
    const value = cache.get(key)
    const size = getApproximateSize(value)

    memoryUsage.push({
      key,
      size: formatBytes(size),
      rawSize: size,
      type: getKeyType(key),
      expiryTime: cache.get(key + ':ttl'),
      value: util.inspect(value, { depth: 0, maxStringLength: 50 }),
    })
  })

  // Sort by size descending
  memoryUsage.sort((a, b) => b.rawSize - a.rawSize)

  return {
    totalKeys: keys.length,
    totalSize: formatBytes(
      memoryUsage.reduce((acc, curr) => acc + curr.rawSize, 0),
    ),
    keysBySize: memoryUsage,
  }
}

const getKeyType = key => {
  if (key.includes('article')) return 'Article Cache'
  if (key.includes('user')) return 'User Cache'
  if (key.includes('tournament')) return 'Tournament Cache'
  if (key.includes('recommendation')) return 'Recommendation Cache'
  return 'Other'
}

const getApproximateSize = obj => {
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj)
  // Add overhead for object structure
  return Buffer.byteLength(str, 'utf8') + 8
}

const formatBytes = bytes => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

module.exports = { analyzeMemoryCache }
