// services/socketInitManager.js
import io from 'socket.io-client'
import { getDeviceFingerprint } from '../utils/deviceFingerprint.utils'

/**
 * Enhanced singleton manager to handle socket initialization with device fingerprinting
 * This ensures only one socket connection per user per device/browser tab
 * Now supports multi-device development environments
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
    this._deviceFingerprint = null
    this._fingerprintPromise = null
    this._endpoint = this._determineEndpoint()
  }

  /**
   * Determine the appropriate endpoint for socket connection
   * Supports multi-device development environments
   * @private
   * @returns {string} Socket endpoint URL
   */
  _determineEndpoint() {
    if (process.env.NODE_ENV === 'production') {
      return 'https://rapidrecap.ai'
    }

    // Development environment endpoint detection
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    // Custom endpoint from environment variable (for testing specific IPs)
    if (import.meta.env.VITE_SOCKET_ENDPOINT) {
      const customEndpoint = import.meta.env.VITE_SOCKET_ENDPOINT
      console.log(`[SocketManager] Using custom endpoint: ${customEndpoint}`)
      return customEndpoint
    }

    // Auto-detect endpoint based on current location
    let endpoint

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Local development - use localhost
      endpoint = 'http://localhost:3000'
    } else {
      // Network access - use current hostname with server port
      endpoint = `${protocol}//${hostname}:3000`
    }

    console.log(
      `[SocketManager] Auto-detected endpoint: ${endpoint} (from hostname: ${hostname})`,
    )
    return endpoint
  }

  /**
   * Get or generate device fingerprint
   * @returns {Promise<string>} Device fingerprint
   */
  async getDeviceFingerprint() {
    // Return cached fingerprint if available
    if (this._deviceFingerprint) {
      return this._deviceFingerprint
    }

    // Return ongoing fingerprint generation promise if in progress
    if (this._fingerprintPromise) {
      return this._fingerprintPromise
    }

    // Generate new fingerprint
    this._fingerprintPromise = getDeviceFingerprint()

    try {
      this._deviceFingerprint = await this._fingerprintPromise
      return this._deviceFingerprint
    } catch (error) {
      console.error('Failed to generate device fingerprint:', error)
      // Fallback fingerprint
      this._deviceFingerprint = `fallback_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`
      return this._deviceFingerprint
    } finally {
      this._fingerprintPromise = null
    }
  }

  /**
   * Test endpoint connectivity
   * @private
   * @param {string} endpoint - Endpoint to test
   * @returns {Promise<boolean>} True if endpoint is reachable
   */
  async _testEndpointConnectivity(endpoint) {
    try {
      const testUrl = endpoint.replace(/:\d+$/, ':3000') + '/api/user/check'
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 5000,
      })
      return response.ok || response.status === 401 // 401 is expected for protected endpoint
    } catch (error) {
      console.warn(
        `[SocketManager] Endpoint ${endpoint} not reachable:`,
        error.message,
      )
      return false
    }
  }

  /**
   * Initialize socket with user data and device fingerprinting
   * @param {Object} user - User data for authentication
   * @returns {Promise<Object>} Socket instance
   */
  async initializeSocket(user) {
    // Return existing socket if already connected
    if (this._socket && this._socket.connected) {
      console.log('SocketManager: Using existing connected socket')
      // Verify the socket is properly authenticated with the same user
      const metadata = this._socket._userData
      if (metadata && metadata._id === user._id) {
        return this._socket
      }
    }

    // If connection is in progress, wait for it to complete
    if (this._connecting && this._socket) {
      console.log('SocketManager: Connection already in progress, waiting...')
      // Return a promise that resolves when connection completes
      return new Promise(resolve => {
        const checkConnection = () => {
          if (!this._connecting) {
            resolve(this._socket)
          } else {
            setTimeout(checkConnection, 100)
          }
        }
        checkConnection()
      })
    }

    // Prevent rapid successive initialization attempts (increased to 3 seconds)
    const now = Date.now()
    if (now - this._lastInitTime < 3000) {
      console.log(
        'SocketManager: Initialization throttled (too soon since last attempt)',
      )
      if (this._socket && this._socket.connected) {
        return this._socket
      } else {
        // Wait a bit before allowing retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Test endpoint connectivity first
    console.log(`[SocketManager] Testing connectivity to: ${this._endpoint}`)
    const isReachable = await this._testEndpointConnectivity(this._endpoint)

    if (!isReachable) {
      console.warn(
        `[SocketManager] Primary endpoint ${this._endpoint} not reachable`,
      )

      // Try fallback endpoints for development
      if (process.env.NODE_ENV !== 'production') {
        const fallbackEndpoints = [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
        ]

        for (const fallback of fallbackEndpoints) {
          if (fallback !== this._endpoint) {
            console.log(`[SocketManager] Trying fallback endpoint: ${fallback}`)
            const fallbackReachable = await this._testEndpointConnectivity(
              fallback,
            )
            if (fallbackReachable) {
              console.log(
                `[SocketManager] Using fallback endpoint: ${fallback}`,
              )
              this._endpoint = fallback
              break
            }
          }
        }
      }
    }

    // Get device fingerprint first
    const deviceFingerprint = await this.getDeviceFingerprint()
    console.log(
      `SocketManager: Using device fingerprint: ${deviceFingerprint.substring(
        0,
        8,
      )}... connecting to ${this._endpoint}`,
    )

    // Check if we're trying to reconnect with the same fingerprint too quickly
    const lastFingerprint = window.sessionStorage
      ? sessionStorage.getItem('lastDeviceFingerprint')
      : null
    const lastConnectionTime = window.sessionStorage
      ? sessionStorage.getItem('lastConnectionTime')
      : null

    if (lastFingerprint === deviceFingerprint && lastConnectionTime) {
      const timeSinceLastConnection = now - parseInt(lastConnectionTime)
      if (timeSinceLastConnection < 1000) {
        // Less than 1 second
        console.log(
          'SocketManager: Preventing duplicate connection attempt (same device, too soon)',
        )
        if (this._socket) {
          return this._socket
        }
      }
    }

    // Store connection attempt info
    if (window.sessionStorage) {
      sessionStorage.setItem('lastDeviceFingerprint', deviceFingerprint)
      sessionStorage.setItem('lastConnectionTime', now.toString())
      sessionStorage.setItem('lastEndpoint', this._endpoint)
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

    // Create new socket with enhanced options
    console.log(
      `SocketManager: Creating new socket connection to ${this._endpoint}`,
    )
    this._socket = io(this._endpoint, {
      transports: ['websocket', 'polling'], // Allow fallback to polling
      reconnection: false,
      forceNew: true, // Force new connection to avoid reusing
      timeout: 10000, // 10 second timeout
      withCredentials: true, // Include credentials for CORS
      extraHeaders: {
        'Access-Control-Allow-Credentials': 'true',
      },
    })

    // Set up socket event listeners
    this._setupSocketListeners(user, deviceFingerprint)

    return this._socket
  }

  /**
   * Set up socket event listeners with device fingerprinting
   * @private
   * @param {Object} user - User data
   * @param {string} deviceFingerprint - Device fingerprint
   */
  _setupSocketListeners(user, deviceFingerprint) {
    if (!this._socket) return

    this._socket.on('connect', () => {
      console.log(
        `SocketManager: Socket connected to ${this._endpoint}, ID: ${this._socket.id}`,
      )
      this._connecting = false
      this._notifyConnectionListeners(true)

      // Register device fingerprint with server immediately after connection
      this._socket.emit('quickClash:registerDevice', { deviceFingerprint })
    })

    this._socket.on('connect_error', error => {
      console.error(
        `SocketManager: Connection error to ${this._endpoint}:`,
        error,
      )
      this._connecting = false

      // Try alternative endpoint in development
      if (process.env.NODE_ENV !== 'production') {
        const currentHostname = window.location.hostname
        if (
          currentHostname !== 'localhost' &&
          this._endpoint.includes('localhost')
        ) {
          console.log(
            '[SocketManager] Will try network endpoint on next attempt',
          )
          this._endpoint = this._determineEndpoint()
        }
      }
    })

    this._socket.on('disconnect', reason => {
      console.log(
        `SocketManager: Socket disconnected from ${this._endpoint}, reason: ${reason}`,
      )
      this._notifyConnectionListeners(false)
    })

    // Handle device conflict (another connection from same device)
    this._socket.on('quickClash:deviceConflict', data => {
      console.log('SocketManager: Device conflict detected:', data.message)

      // Emit custom event for UI handling
      this._notifyDeviceConflict(data)

      // Don't auto-disconnect, let the server handle it
    })

    // Handle device registration confirmation
    this._socket.on('quickClash:deviceRegistered', data => {
      console.log(
        `SocketManager: Device registered successfully: ${data.deviceFingerprint} on ${this._endpoint}`,
      )

      // Set up with user data after device registration
      if (user) {
        this._socket.emit('setup', {
          ...user,
          deviceFingerprint: this._deviceFingerprint,
        })
      }
    })

    // Listen for connection confirmation
    this._socket.on('connected', () => {
      console.log(
        `SocketManager: Server confirmed connection to ${this._endpoint}`,
      )
      this._connecting = false
      this._notifyConnectionListeners(true)

      // DEBUG: Check socket rooms after connection (safely)
      setTimeout(() => {
        if (this._socket && this._socket.connected) {
          try {
            const rooms = this._socket.rooms
              ? Array.from(this._socket.rooms)
              : []
          } catch (error) {
            console.log(`DEBUG: Could not get socket rooms:`, error.message)
          }
        }
      }, 500)
    })

    // Handle force reload
    this._socket.on('force-reload', () => {
      console.log('SocketManager: Force reload received')
      window.location.reload()
    })

    // Enhanced reconnection handling with device fingerprinting
    this._socket.on('reconnect', () => {
      console.log(
        `SocketManager: Reconnected to ${this._endpoint}, re-registering device`,
      )

      // Re-register device fingerprint after reconnection
      this._socket.emit('quickClash:registerDevice', {
        deviceFingerprint: this._deviceFingerprint,
      })

      // Re-setup with user data
      if (user) {
        this._socket.emit('setup', {
          ...user,
          deviceFingerprint: this._deviceFingerprint,
        })
      }
    })
  }

  /**
   * Notify about device conflicts
   * @private
   * @param {Object} data - Conflict data
   */
  _notifyDeviceConflict(data) {
    // Create custom event for device conflict
    const event = new CustomEvent('socketDeviceConflict', {
      detail: data,
    })
    window.dispatchEvent(event)
  }

  /**
   * Disconnect the socket
   * @param {string} userId - User ID to send in disconnect event
   */
  disconnect(userId) {
    if (!this._socket) return

    console.log(`SocketManager: Disconnecting socket from ${this._endpoint}`)

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
   * Force disconnect and clear device fingerprint (for testing or logout)
   */
  forceDisconnect() {
    this.disconnect()

    // Clear device fingerprint to force regeneration
    this._deviceFingerprint = null
    this._fingerprintPromise = null

    // Clear session storage
    if (window.sessionStorage) {
      sessionStorage.removeItem('lastDeviceFingerprint')
      sessionStorage.removeItem('lastConnectionTime')
      sessionStorage.removeItem('lastEndpoint')
    }

    console.log(
      'SocketManager: Force disconnected and cleared device fingerprint',
    )
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
   * Add a device conflict listener
   * @param {Function} listener - Callback function(conflictData)
   * @returns {Function} Function to remove the listener
   */
  addDeviceConflictListener(listener) {
    if (typeof listener !== 'function') return () => {}

    const eventListener = event => {
      listener(event.detail)
    }

    window.addEventListener('socketDeviceConflict', eventListener)

    // Return function to remove listener
    return () => {
      window.removeEventListener('socketDeviceConflict', eventListener)
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
   * Get the current device fingerprint
   * @returns {string|null} Device fingerprint or null
   */
  getCurrentDeviceFingerprint() {
    return this._deviceFingerprint
  }

  /**
   * Get the current endpoint
   * @returns {string} Current endpoint URL
   */
  getCurrentEndpoint() {
    return this._endpoint
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

  /**
   * Emit event with device fingerprint context
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitWithDeviceContext(event, data = {}) {
    if (!this._socket || !this._socket.connected) {
      console.warn(
        `Cannot emit ${event}: Socket not connected to ${this._endpoint}`,
      )
      return false
    }

    this._socket.emit(event, {
      ...data,
      deviceFingerprint: this._deviceFingerprint,
    })

    return true
  }

  /**
   * Join a room with device context
   * @param {string} room - Room name
   */
  joinRoom(room) {
    if (!this._socket || !this._socket.connected) {
      console.warn(
        `Cannot join room ${room}: Socket not connected to ${this._endpoint}`,
      )
      return false
    }

    this._socket.emit('join', room)
    return true
  }

  /**
   * Get connection debug info
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      isConnected: this.isConnected(),
      connectionAttempted: this._connectionAttempted,
      connecting: this._connecting,
      deviceFingerprint: this._deviceFingerprint
        ? this._deviceFingerprint.substring(0, 8) + '...'
        : null,
      socketId: this._socket ? this._socket.id : null,
      lastInitTime: this._lastInitTime,
      endpoint: this._endpoint,
      hostname: window.location.hostname,
      sessionData: window.sessionStorage
        ? {
            lastDeviceFingerprint: sessionStorage.getItem(
              'lastDeviceFingerprint',
            ),
            lastConnectionTime: sessionStorage.getItem('lastConnectionTime'),
            lastEndpoint: sessionStorage.getItem('lastEndpoint'),
          }
        : null,
    }
  }
}

// Create and export singleton instance
const socketManager = new SocketInitManager()

// Add global event listener for device conflicts (for debugging)
if (typeof window !== 'undefined') {
  window.addEventListener('socketDeviceConflict', event => {
    console.warn('Device conflict detected:', event.detail)
  })

  // Add global debug function
  window.getSocketDebugInfo = () => {
    return socketManager.getDebugInfo()
  }
}

export default socketManager
