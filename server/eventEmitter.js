const EventEmitter = require('events')

const globalEmitter = new EventEmitter()
globalEmitter.setMaxListeners(25)

module.exports = globalEmitter
