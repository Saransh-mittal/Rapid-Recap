const globalEmitter = require('../../eventEmitter')
const cache = require('memory-cache')
const forceReloadAll = async () => {
  try {
    console.log(
      'Initiating force reload for all clients at:',
      new Date().toISOString(),
    )
    // delete the cache key starting with privilege_
    cache.keys().forEach(key => {
      if (key.startsWith('privilege_')) {
        cache.del(key)
      }
    })
    globalEmitter.emit('force-reload')
    console.log('Force reload signal sent successfully')
  } catch (error) {
    console.error('Error in force reload task:', error)
  }
}

module.exports = forceReloadAll
