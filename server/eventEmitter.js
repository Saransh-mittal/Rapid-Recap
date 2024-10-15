const EventEmitter = require('events')

const globalEmitter = new EventEmitter()
globalEmitter.setMaxListeners(15)

module.exports = globalEmitter
