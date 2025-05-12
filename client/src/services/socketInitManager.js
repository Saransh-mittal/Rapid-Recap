// services/socketInitManager.js
import io from 'socket.io-client'

/**
 * Singleton manager to handle socket initialization
 * This ensures only one socket connection is created application-wide
 */
class SocketInitManager {
  constructor() {
    // Private instance variables
    this._socket = null
    this._connecting = false
    this._connectionAttempted = false
    this._lastInitTime = 0
    this._connectionListeners = new Set()
    this._disconnectionListeners = new Set()
    this._endpoint =
      process.env.NODE_ENV === 'production'
        ? 'https://rapidrecap.ai'
        : 'http://localhost:3000'
  }

  /**
   * Initialize socket with user data
   * @param {Object} user - User data for authentication
   * @returns {Object} Socket instance
   */
  initializeSocket(user) {
    // Return existing socket if already connected
    if (this._socket && this._socket.connected) {
      console.log('SocketManager: Using existing connected socket')
      return this._socket
    }

    // If connection is in progress, return the socket being connected
    if (this._connecting && this._socket) {
      console.log('SocketManager: Connection already in progress')
      return this._socket
    }

    // Prevent rapid successive initialization attempts
    const now = Date.now()
    if (now - this._lastInitTime < 1000) {
      console.log('SocketManager: Initialization throttled')
      return this._socket
    }

    // Update state for new connection
    this._lastInitTime = now
    this._connecting = true
    this._connectionAttempted = true

    // Clean up existing socket if disconnected
    if (this._socket && this._socket.disconnected) {
      console.log('SocketManager: Cleaning up disconnected socket')
      this._socket.removeAllListeners()
      this._socket = null
    }

    // Create new socket
    console.log('SocketManager: Creating new socket connection')
    this._socket = io(this._endpoint, {
      transports: ['websocket'],
      reconnection: false,
    })

    // Set up socket event listeners
    this._setupSocketListeners(user)

    return this._socket
  }

  /**
   * Set up socket event listeners
   * @private
   * @param {Object} user - User data
   */
  _setupSocketListeners(user) {
    if (!this._socket) return

    this._socket.on('connect', () => {
      console.log(`SocketManager: Socket connected, ID: ${this._socket.id}`)
      this._connecting = false
      this._notifyConnectionListeners(true)
    })

    this._socket.on('connect_error', error => {
      console.error('SocketManager: Connection error:', error)
      this._connecting = false
    })

    this._socket.on('disconnect', reason => {
      console.log(`SocketManager: Socket disconnected, reason: ${reason}`)
      this._notifyConnectionListeners(false)
    })

    // Set up with user data
    if (user) {
      this._socket.emit('setup', user)
    }

    // Listen for connection confirmation
    this._socket.on('connected', () => {
      console.log('SocketManager: Server confirmed connection')
      this._connecting = false
      this._notifyConnectionListeners(true)
    })

    // Handle force reload
    this._socket.on('force-reload', () => {
      console.log('SocketManager: Force reload received')
      window.location.reload()
    })
  }

  /**
   * Disconnect the socket
   * @param {string} userId - User ID to send in disconnect event
   */
  disconnect(userId) {
    if (!this._socket) return

    console.log('SocketManager: Disconnecting socket')

    // Emit disconnect event if userId provided
    if (userId) {
      this._socket.emit('user-disconnected', userId)
    }

    // Clean up listeners and disconnect
    this._socket.removeAllListeners()
    this._socket.disconnect()

    // Reset state
    this._socket = null
    this._connecting = false
    this._connectionAttempted = false
    this._notifyConnectionListeners(false)
  }

  /**
   * Add a connection state change listener
   * @param {Function} listener - Callback function(isConnected)
   * @returns {Function} Function to remove the listener
   */
  addConnectionListener(listener) {
    if (typeof listener !== 'function') return () => {}

    this._connectionListeners.add(listener)

    // Call immediately with current state if socket exists
    if (this._socket) {
      listener(this._socket.connected)
    } else {
      listener(false)
    }

    // Return function to remove listener
    return () => {
      this._connectionListeners.delete(listener)
    }
  }

  /**
   * Notify all connection listeners
   * @private
   * @param {boolean} isConnected - Connection state
   */
  _notifyConnectionListeners(isConnected) {
    this._connectionListeners.forEach(listener => {
      try {
        listener(isConnected)
      } catch (error) {
        console.error('SocketManager: Error in connection listener:', error)
      }
    })
  }

  /**
   * Get the current socket instance
   * @returns {Object|null} Socket instance or null
   */
  getSocket() {
    return this._socket
  }

  /**
   * Check if connection has been attempted
   * @returns {boolean} True if connection attempted
   */
  isConnectionAttempted() {
    return this._connectionAttempted
  }

  /**
   * Check if socket is currently connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this._socket && this._socket.connected
  }
}

// Create and export singleton instance
const socketManager = new SocketInitManager()
export default socketManager
