// customHooks/useSocket.js
import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSocketContext } from '../contextAPI/SocketContext'
import socketManager from '../services/socketInitManager'
import { useRef } from 'react'

/**
 * Enhanced custom hook to interact with the device-aware socket connection
 * Uses the singleton pattern with device fingerprinting to ensure only one socket connection per device
 */
export const useSocket = () => {
  const { user } = useSelector(state => state.auth)
  const {
    isConnected,
    deviceFingerprint,
    deviceConflictDetected,
    connectionStats,
  } = useSocketContext()

  // Track initialization to prevent multiple attempts
  const initializationAttempted = useRef(false)
  const initializationPromise = useRef(null)

  // Initialize socket when hook is first used with a user
  useEffect(() => {
    // Skip if no user
    if (!user || !Object.keys(user).length) {
      return
    }

    // Skip if already attempted initialization
    if (initializationAttempted.current) {
      return
    }

    // Skip if already connected
    if (socketManager.isConnected()) {
      return
    }

    // Skip if initialization is in progress
    if (initializationPromise.current) {
      return
    }

    // Mark as attempted to prevent duplicate calls
    initializationAttempted.current = true

    // Initialize socket with user data if not already connected
    if (!socketManager.isConnectionAttempted()) {
      initializationPromise.current = socketManager
        .initializeSocket(user)
        .then(socket => {
          console.log('useSocket: Socket initialization completed')
          return socket
        })
        .catch(error => {
          console.error('useSocket: Failed to initialize socket:', error)
          // Reset on error to allow retry
          initializationAttempted.current = false
          throw error
        })
        .finally(() => {
          initializationPromise.current = null
        })
    }

    // Cleanup function
    return () => {
      // Don't reset on unmount to prevent re-initialization
      // initializationAttempted.current = false
    }
  }, [user])

  // Reset initialization flag when user changes (login/logout)
  useEffect(() => {
    if (!user || !Object.keys(user).length) {
      initializationAttempted.current = false
      initializationPromise.current = null
    }
  }, [user?._id]) // Only reset when user ID actually changes

  /**
   * Get the socket instance
   * @returns {Object|null} Socket instance or null
   */
  const getSocket = useCallback(() => {
    return socketManager.getSocket()
  }, [])

  /**
   * Disconnect the socket (for logout)
   */
  const disconnectSocket = useCallback(() => {
    if (user?._id) {
      socketManager.disconnect(user._id)
    } else {
      socketManager.disconnect()
    }
  }, [user])

  /**
   * Force disconnect and clear device fingerprint (for logout or testing)
   */
  const forceDisconnectSocket = useCallback(() => {
    socketManager.forceDisconnect()
  }, [])

  /**
   * Emit event with device context
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @returns {boolean} True if emitted successfully
   */
  const emitWithDeviceContext = useCallback((event, data = {}) => {
    return socketManager.emitWithDeviceContext(event, data)
  }, [])

  /**
   * Join a room with device context
   * @param {string} room - Room name
   * @returns {boolean} True if joined successfully
   */
  const joinRoom = useCallback(room => {
    return socketManager.joinRoom(room)
  }, [])

  /**
   * Get debug information about the socket connection
   * @returns {Object} Debug information
   */
  const getDebugInfo = useCallback(() => {
    return socketManager.getDebugInfo()
  }, [])

  /**
   * Check if socket is available and connected
   * @returns {boolean} True if socket is ready for use
   */
  const isSocketReady = useCallback(() => {
    const socket = socketManager.getSocket()
    return socket && socket.connected
  }, [])

  /**
   * Add event listener to socket with automatic cleanup
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Cleanup function
   */
  const addEventListener = useCallback((event, handler) => {
    const socket = socketManager.getSocket()

    if (!socket) {
      console.warn(
        `useSocket: Cannot add listener for ${event} - socket not available`,
      )
      return () => {}
    }

    // Wrap handler with debugging
    const debugHandler = (...args) => {
      handler(...args)
    }

    socket.on(event, debugHandler)

    // Return cleanup function
    return () => {
      const currentSocket = socketManager.getSocket()
      if (currentSocket) {
        currentSocket.off(event, debugHandler)
      }
    }
  }, [])

  /**
   * Add one-time event listener to socket
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Cleanup function
   */
  const addEventListenerOnce = useCallback((event, handler) => {
    const socket = socketManager.getSocket()

    if (!socket) {
      console.warn(
        `useSocket: Cannot add once listener for ${event} - socket not available`,
      )
      return () => {}
    }

    socket.once(event, handler)

    // Return cleanup function (though it auto-cleans after first call)
    return () => {
      const currentSocket = socketManager.getSocket()
      if (currentSocket) {
        currentSocket.off(event, handler)
      }
    }
  }, [])

  return {
    // Core socket access
    socket: socketManager.getSocket(),
    socketConnected: isConnected,

    // Device information
    deviceFingerprint,
    deviceConflictDetected,
    connectionStats,

    // Core methods
    getSocket,
    disconnectSocket,
    forceDisconnectSocket,

    // Enhanced methods with device context
    emitWithDeviceContext,
    joinRoom,
    isSocketReady,

    // Event handling
    addEventListener,
    addEventListenerOnce,

    // Debugging
    getDebugInfo,

    // Legacy aliases for backward compatibility
    emit: emitWithDeviceContext,
    on: addEventListener,
    once: addEventListenerOnce,
  }
}
