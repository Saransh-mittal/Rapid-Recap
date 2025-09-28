// services/socketInitManager.js - FIXED: Uses Socket.IO's built-in reconnection
import io from 'socket.io-client'
import { getDeviceFingerprint } from '../utils/deviceFingerprint.utils'

/**
 * FIXED: Socket Manager with proper reconnection handling
 *
 * Key Changes:
 * 1. Enabled Socket.IO's built-in reconnection (reconnection: true)
 * 2. Added reconnection event listeners for state tracking
 * 3. Prevent cleanup on auto-reconnect scenarios
 * 4. Reuse existing socket instance instead of creating new ones
 *
 * This eliminates the infinite loop caused by device conflicts
 */
class SocketInitManager {
  constructor() {
    this._socket = null
    this._connecting = false
    this._connectionAttempted = false
    this._lastInitTime = 0
    this._connectionListeners = new Set()
    this._disconnectionListeners = new Set()
    this._deviceFingerprint = null
    this._fingerprintPromise = null
    this._endpoint = this._determineEndpoint()
    this._hasEverConnected = false
    this._connectionHistory = []
    this._initialConnectionAttempted = false

    // Track reconnection state from Socket.IO
    this._isReconnecting = false
  }

  _determineEndpoint() {
    if (process.env.NODE_ENV === 'production') {
      return 'https://rapidrecap.ai'
    }

    const hostname = window.location.hostname
    const protocol = window.location.protocol

    if (import.meta.env.VITE_SOCKET_ENDPOINT) {
      return import.meta.env.VITE_SOCKET_ENDPOINT
    }

    let endpoint
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      endpoint = 'http://localhost:3000'
    } else {
      endpoint = `${protocol}//${hostname}:3000`
    }

    console.log(`[SocketManager] Auto-detected endpoint: ${endpoint}`)
    return endpoint
  }

  _recordConnectionEvent(event, data = {}) {
    const eventRecord = { event, timestamp: Date.now(), data }
    this._connectionHistory.push(eventRecord)
    if (this._connectionHistory.length > 20) {
      this._connectionHistory = this._connectionHistory.slice(-20)
    }
    console.log(`[SocketManager] ${event}:`, data)
  }

  _performSocketCleanup(reason = 'unknown') {
    console.log(`[SocketManager] Performing socket cleanup, reason: ${reason}`)

    if (this._socket) {
      this._socket.removeAllListeners()
      this._socket = null
    }

    this._connecting = false
    this._connectionAttempted = false
    this._notifyConnectionListeners(false)
    this._recordConnectionEvent('cleanup_performed', {
      reason,
      endpoint: this._endpoint,
    })
  }

  async getDeviceFingerprint() {
    if (this._deviceFingerprint) {
      return this._deviceFingerprint
    }

    if (this._fingerprintPromise) {
      return this._fingerprintPromise
    }

    this._fingerprintPromise = getDeviceFingerprint()

    try {
      this._deviceFingerprint = await this._fingerprintPromise
      return this._deviceFingerprint
    } catch (error) {
      console.error('Failed to generate device fingerprint:', error)
      this._deviceFingerprint = `fallback_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`
      return this._deviceFingerprint
    } finally {
      this._fingerprintPromise = null
    }
  }

  async _testEndpointConnectivity(endpoint) {
    try {
      const testUrl = endpoint.replace(/:\d+$/, ':3000') + '/api/user/check'
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 5000,
      })
      return response.ok || response.status === 401
    } catch (error) {
      console.warn(
        `[SocketManager] Endpoint ${endpoint} not reachable:`,
        error.message,
      )
      return false
    }
  }

  async initializeSocket(user) {
    // Return existing socket if already connected
    if (this._socket && this._socket.connected) {
      console.log('[SocketManager] Using existing connected socket')
      const metadata = this._socket._userData
      if (metadata && metadata._id === user._id) {
        return this._socket
      }
    }

    // If connection is in progress, wait for it
    if (this._connecting && this._socket) {
      console.log('[SocketManager] Connection already in progress, waiting...')
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

    // Prevent rapid successive initialization attempts
    const now = Date.now()
    if (now - this._lastInitTime < 3000) {
      console.log('[SocketManager] Initialization throttled')
      if (this._socket && this._socket.connected) {
        return this._socket
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Get device fingerprint first
    const deviceFingerprint = await this.getDeviceFingerprint()
    console.log(
      `[SocketManager] Using device fingerprint: ${deviceFingerprint.substring(
        0,
        8,
      )}... connecting to ${this._endpoint}`,
    )

    // Update state for new connection
    this._lastInitTime = now
    this._connecting = true
    this._connectionAttempted = true
    this._initialConnectionAttempted = true

    // Clean up existing socket if disconnected
    if (this._socket && this._socket.disconnected) {
      console.log('[SocketManager] Cleaning up disconnected socket')
      this._socket.removeAllListeners()
      this._socket = null
    }

    // CRITICAL FIX: Enable Socket.IO's built-in reconnection
    console.log(
      `[SocketManager] Creating socket with built-in reconnection enabled`,
    )
    this._socket = io(this._endpoint, {
      transports: ['websocket', 'polling'],

      // CHANGED: Enable built-in reconnection to prevent infinite loops
      reconnection: true, // Enable automatic reconnection
      reconnectionAttempts: 5, // Limit reconnection attempts
      reconnectionDelay: 1000, // Start with 1 second delay
      reconnectionDelayMax: 5000, // Maximum 5 seconds between attempts

      timeout: 10000,
      withCredentials: true,
      extraHeaders: {
        'Access-Control-Allow-Credentials': 'true',
      },
    })

    // Set up socket event listeners
    this._setupSocketListeners(user, deviceFingerprint)

    return this._socket
  }

  _setupSocketListeners(user, deviceFingerprint) {
    if (!this._socket) return

    // ========================================
    // CONNECTION EVENTS
    // ========================================

    this._socket.on('connect', () => {
      console.log(
        `[SocketManager] ✅ Socket connected to ${this._endpoint}, ID: ${this._socket.id}`,
      )

      this._hasEverConnected = true
      this._recordConnectionEvent('connected', {
        socketId: this._socket.id,
        endpoint: this._endpoint,
        deviceFingerprint: deviceFingerprint?.substring(0, 8) + '...',
      })

      this._connecting = false
      this._isReconnecting = false
      this._notifyConnectionListeners(true)

      // Register device fingerprint with server
      this._socket.emit('quickClash:registerDevice', { deviceFingerprint })
    })

    this._socket.on('connect_error', error => {
      console.error(
        `[SocketManager] ❌ Connection error to ${this._endpoint}:`,
        error,
      )

      this._recordConnectionEvent('connect_error', {
        error: error.message,
        endpoint: this._endpoint,
        hasEverConnected: this._hasEverConnected,
      })

      this._connecting = false
    })

    // CRITICAL FIX: Improved disconnect handling
    this._socket.on('disconnect', reason => {
      console.log(
        `[SocketManager] 🔌 Socket disconnected from ${this._endpoint}, reason: ${reason}`,
      )

      this._recordConnectionEvent('disconnected', {
        reason,
        endpoint: this._endpoint,
        hadBeenConnected: this._hasEverConnected,
      })

      // Check if Socket.IO will auto-reconnect
      const autoReconnectReasons = [
        'io server disconnect', // Server closed (restart), Socket.IO will reconnect
        'transport close', // Connection lost, Socket.IO will reconnect
        'transport error', // Transport error, Socket.IO will reconnect
        'ping timeout', // Ping timeout, Socket.IO will reconnect
      ]

      if (autoReconnectReasons.includes(reason)) {
        console.log(
          '[SocketManager] ⏳ Socket.IO will handle automatic reconnection',
        )
        this._notifyConnectionListeners(false)
        return // Let Socket.IO handle it - DON'T clean up
      }

      // Only clean up for manual/intentional disconnects
      this._performSocketCleanup(`auto_disconnect: ${reason}`)
    })

    // ========================================
    // SOCKET.IO RECONNECTION EVENTS (NEW)
    // ========================================

    this._socket.on('reconnect_attempt', attemptNumber => {
      console.log(`[SocketManager] 🔄 Reconnection attempt ${attemptNumber}...`)
      this._isReconnecting = true
      this._notifyConnectionListeners(false)
    })

    this._socket.on('reconnect', attemptNumber => {
      console.log(
        `[SocketManager] ✅ Reconnected successfully after ${attemptNumber} attempts`,
      )
      this._isReconnecting = false

      // Re-register device and setup after successful reconnection
      this._socket.emit('quickClash:registerDevice', {
        deviceFingerprint: this._deviceFingerprint,
      })

      setTimeout(() => {
        if (user) {
          this._socket.emit('setup', {
            ...user,
            deviceFingerprint: this._deviceFingerprint,
          })
        }
      }, 100)

      this._notifyConnectionListeners(true)
    })

    this._socket.on('reconnect_error', error => {
      console.error(`[SocketManager] ❌ Reconnection error:`, error)
      this._recordConnectionEvent('reconnect_error', { error: error.message })
    })

    this._socket.on('reconnect_failed', () => {
      console.error(`[SocketManager] 💀 Reconnection failed after all attempts`)
      this._isReconnecting = false
      this._performSocketCleanup('reconnection_failed')
    })

    // ========================================
    // APPLICATION EVENTS
    // ========================================

    this._socket.on('quickClash:deviceConflict', data => {
      console.log('[SocketManager] ⚠️ Device conflict detected:', data.message)
      this._notifyDeviceConflict(data)
    })

    this._socket.on('quickClash:deviceRegistered', data => {
      console.log(
        `[SocketManager] ✅ Device registered: ${data.deviceFingerprint}`,
      )

      if (user) {
        this._socket.emit('setup', {
          ...user,
          deviceFingerprint: this._deviceFingerprint,
        })
      }
    })

    this._socket.on('connected', () => {
      console.log(`[SocketManager] ✅ Server confirmed connection`)
      this._connecting = false
      this._notifyConnectionListeners(true)
    })

    this._socket.on('force-reload', () => {
      console.log('[SocketManager] 🔄 Force reload received')
      window.location.reload()
    })
  }

  _notifyDeviceConflict(data) {
    const event = new CustomEvent('socketDeviceConflict', { detail: data })
    window.dispatchEvent(event)
  }

  disconnect(userId) {
    if (!this._socket) {
      console.log('[SocketManager] No socket to disconnect')
      return
    }

    console.log(
      `[SocketManager] Manually disconnecting socket from ${this._endpoint}`,
    )

    if (userId && this._socket.connected) {
      try {
        this._socket.emit('user-disconnected', userId)
        console.log(
          `[SocketManager] Emitted user-disconnected for user: ${userId}`,
        )
      } catch (error) {
        console.warn('[SocketManager] Failed to emit user-disconnected:', error)
      }
    }

    try {
      this._socket.disconnect()
    } catch (error) {
      console.warn('[SocketManager] Error during socket disconnect:', error)
    }

    this._performSocketCleanup(`manual_disconnect: ${userId || 'no_user_id'}`)
  }

  forceDisconnect() {
    console.log('[SocketManager] Force disconnecting and clearing all state')

    if (this._socket) {
      try {
        this._socket.disconnect()
      } catch (error) {
        console.warn('[SocketManager] Error during force disconnect:', error)
      }
    }

    this._performSocketCleanup('force_disconnect')
    this._deviceFingerprint = null
    this._fingerprintPromise = null
    this.resetConnectionTracking()

    if (window.sessionStorage) {
      sessionStorage.removeItem('lastDeviceFingerprint')
      sessionStorage.removeItem('lastConnectionTime')
      sessionStorage.removeItem('lastEndpoint')
    }

    console.log('[SocketManager] Force disconnect complete')
  }

  addConnectionListener(listener) {
    if (typeof listener !== 'function') return () => {}

    this._connectionListeners.add(listener)

    if (this._socket) {
      listener(this._socket.connected)
    } else {
      listener(false)
    }

    return () => {
      this._connectionListeners.delete(listener)
    }
  }

  addDeviceConflictListener(listener) {
    if (typeof listener !== 'function') return () => {}

    const eventListener = event => {
      listener(event.detail)
    }

    window.addEventListener('socketDeviceConflict', eventListener)

    return () => {
      window.removeEventListener('socketDeviceConflict', eventListener)
    }
  }

  _notifyConnectionListeners(isConnected) {
    this._connectionListeners.forEach(listener => {
      try {
        listener(isConnected)
      } catch (error) {
        console.error('[SocketManager] Error in connection listener:', error)
      }
    })
  }

  getSocket() {
    return this._socket
  }

  getCurrentDeviceFingerprint() {
    return this._deviceFingerprint
  }

  getCurrentEndpoint() {
    return this._endpoint
  }

  isConnectionAttempted() {
    return this._connectionAttempted
  }

  isConnected() {
    return this._socket && this._socket.connected
  }

  emitWithDeviceContext(event, data = {}) {
    if (!this._socket || !this._socket.connected) {
      console.warn(`Cannot emit ${event}: Socket not connected`)
      return false
    }

    this._socket.emit(event, {
      ...data,
      deviceFingerprint: this._deviceFingerprint,
    })

    return true
  }

  joinRoom(room) {
    if (!this._socket || !this._socket.connected) {
      console.warn(`Cannot join room ${room}: Socket not connected`)
      return false
    }

    this._socket.emit('join', room)
    return true
  }

  hasEverConnected() {
    return this._hasEverConnected
  }

  isInitialConnectionAttempted() {
    return this._initialConnectionAttempted
  }

  getConnectionHistory() {
    return [...this._connectionHistory]
  }

  resetConnectionTracking() {
    this._hasEverConnected = false
    this._initialConnectionAttempted = false
    this._connectionHistory = []
    this._isReconnecting = false
    this._recordConnectionEvent('tracking_reset')
  }

  getReconnectionState() {
    return {
      isReconnecting: this._isReconnecting,
      socketIOReconnecting: this._socket?.io?.reconnecting || false,
    }
  }

  getDebugInfo() {
    return {
      isConnected: this.isConnected(),
      connectionAttempted: this._connectionAttempted,
      connecting: this._connecting,
      deviceFingerprint: this._deviceFingerprint
        ? this._deviceFingerprint.substring(0, 8) + '...'
        : null,
      socketId: this._socket ? this._socket.id : null,
      endpoint: this._endpoint,
      hasEverConnected: this._hasEverConnected,
      reconnectionState: this.getReconnectionState(),
      connectionHistory: this._connectionHistory,
    }
  }
}

const socketManager = new SocketInitManager()

if (typeof window !== 'undefined') {
  window.addEventListener('socketDeviceConflict', event => {
    console.warn('Device conflict detected:', event.detail)
  })

  window.getSocketDebugInfo = () => {
    return socketManager.getDebugInfo()
  }
}

export default socketManager
