const EventEmitter = require('events')

const globalEmitter = new EventEmitter()
globalEmitter.setMaxListeners(50)

module.exports = globalEmitter
