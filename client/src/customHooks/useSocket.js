// customHooks/useSocket.js - FINAL FIX: Prevents duplicate socket creation during reconnection
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSocketContext } from '../contextAPI/SocketContext'
import socketManager from '../services/socketInitManager'

/**
 * FINAL FIXED: Enhanced custom hook that properly handles reconnection
 *
 * UPDATED: Now supports both authenticated users AND session players
 * - Authenticated users: Uses user object for auth
 * - Session players: Uses sessionId from localStorage for auth
 *
 * Critical Fix:
 * - Only initialize socket if it doesn't exist at all
 * - Don't re-initialize when Socket.IO is handling automatic reconnection
 * - Check socket existence before creating new instances
 *
 * This prevents the duplicate socket creation issue during reconnection
 */
export const useSocket = () => {
  const { user } = useSelector(state => state.auth)
  const {
    isConnected,
    deviceFingerprint,
    deviceConflictDetected,
    connectionStats,
  } = useSocketContext()

  // Track initialization only
  const initializationAttempted = useRef(false)
  const initializationPromise = useRef(null)

  // Track session ID for session players
  const [sessionId] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('playSessionId') : null
  })

  // Determine if we have valid auth (user OR session)
  const hasAuth = !!(user && Object.keys(user).length) || !!sessionId

  /**
   * Initialize socket - Socket.IO will handle reconnection automatically
   * Now supports both authenticated users and session players
   */
  const initializeWithReconnection = useCallback(async () => {
    // Skip if no auth available (no user AND no sessionId)
    if (!hasAuth) {
      return null
    }

    // Skip if already attempted initialization
    if (initializationAttempted.current) {
      return socketManager.getSocket()
    }

    // Skip if already connected
    if (socketManager.isConnected()) {
      return socketManager.getSocket()
    }

    // Skip if initialization is in progress
    if (initializationPromise.current) {
      return initializationPromise.current
    }

    // Mark as attempted to prevent duplicate calls
    initializationAttempted.current = true

    const authType = user ? 'authenticated' : 'session'
    console.log(
      `[useSocket] Starting initialization as ${authType} (Socket.IO handles reconnection)`,
    )

    try {
      // Pass user if available, otherwise socketManager will use sessionId
      initializationPromise.current = socketManager.initializeSocket(user || null)
      const socket = await initializationPromise.current

      console.log('[useSocket] ✅ Initialization completed')
      return socket
    } catch (error) {
      console.error('[useSocket] ❌ Initialization failed:', error)
      // Reset on error to allow retry
      initializationAttempted.current = false
      throw error
    } finally {
      initializationPromise.current = null
    }
  }, [user, hasAuth])

  /**
   * Manual reconnection function for UI controls (if needed)
   */
  const manualReconnect = useCallback(async () => {
    console.log('[useSocket] Manual reconnection requested')

    // Reset state
    initializationAttempted.current = false
    initializationPromise.current = null

    // Force disconnect to ensure clean state
    socketManager.forceDisconnect()

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 500))

    // Attempt reconnection
    return initializeWithReconnection()
  }, [initializeWithReconnection])

  /**
   * Enable/disable Socket.IO's reconnection
   */
  const setReconnectionEnabled = useCallback(enabled => {
    console.log('[useSocket] Reconnection', enabled ? 'enabled' : 'disabled')

    const socket = socketManager.getSocket()
    if (socket && socket.io) {
      if (enabled) {
        socket.io.reconnection(true)
      } else {
        socket.io.reconnection(false)
      }
    }
  }, [])

  // CRITICAL FIX: Auto-initialize ONLY when socket doesn't exist at all
  // UPDATED: Now also initializes for session players
  useEffect(() => {
    const authType = user ? 'user' : (sessionId ? 'session' : 'none')
    console.log(
      '[useSocket] Auth state - User:',
      !!user,
      'SessionId:',
      !!sessionId,
      'Connected:',
      isConnected,
    )

    // FIXED: Check if socket exists before initializing
    const socketExists = socketManager.getSocket() !== null

    // Only initialize if:
    // 1. Auth exists (user OR sessionId)
    // 2. Not currently connected
    // 3. Socket instance doesn't exist (prevents re-initialization during reconnection)
    if (hasAuth && !isConnected && !socketExists) {
      console.log(
        `[useSocket] Starting auto-initialization as ${authType} (no socket exists)...`,
      )
      initializeWithReconnection()
    } else if (socketExists && !isConnected) {
      console.log(
        '[useSocket] Socket exists but disconnected - Socket.IO will handle reconnection',
      )
    }

    return () => {
      // Reset flags when auth changes (login/logout)
      if (!hasAuth) {
        initializationAttempted.current = false
        initializationPromise.current = null
      }
    }
  }, [user, sessionId, hasAuth, isConnected, initializeWithReconnection])

  // Reset initialization flag when user changes
  useEffect(() => {
    if (!user || !Object.keys(user).length) {
      // Only log if we had a user before (actual logout)
      if (initializationAttempted.current) {
        console.log('[useSocket] User logged out, resetting state')
      }
      initializationAttempted.current = false
      initializationPromise.current = null
    }
  }, [user?._id])

  /**
   * Get the socket instance
   */
  const getSocket = useCallback(() => {
    return socketManager.getSocket()
  }, [])

  /**
   * Disconnect the socket (for logout)
   */
  const disconnectSocket = useCallback(() => {
    console.log('[useSocket] Manual disconnect requested')

    if (user?._id) {
      socketManager.disconnect(user._id)
    } else {
      socketManager.disconnect()
    }
  }, [user])

  /**
   * Force disconnect and clear device fingerprint
   */
  const forceDisconnectSocket = useCallback(() => {
    console.log('[useSocket] Force disconnect requested')
    socketManager.forceDisconnect()
  }, [])

  /**
   * Emit event with device context
   */
  const emitWithDeviceContext = useCallback((event, data = {}) => {
    return socketManager.emitWithDeviceContext(event, data)
  }, [])

  /**
   * Join a room with device context
   */
  const joinRoom = useCallback(room => {
    return socketManager.joinRoom(room)
  }, [])

  /**
   * Get debug information
   */
  const getDebugInfo = useCallback(() => {
    return socketManager.getDebugInfo()
  }, [])

  /**
   * Check if socket is ready
   */
  const isSocketReady = useCallback(() => {
    const socket = socketManager.getSocket()
    return socket && socket.connected
  }, [])

  /**
   * Add event listener with automatic cleanup
   */
  const addEventListener = useCallback((event, handler) => {
    const socket = socketManager.getSocket()

    if (!socket) {
      console.warn(
        `useSocket: Cannot add listener for ${event} - socket not available`,
      )
      return () => {}
    }

    socket.on(event, handler)

    return () => {
      const currentSocket = socketManager.getSocket()
      if (currentSocket) {
        currentSocket.off(event, handler)
      }
    }
  }, [])

  /**
   * Add one-time event listener
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

    return () => {
      const currentSocket = socketManager.getSocket()
      if (currentSocket) {
        currentSocket.off(event, handler)
      }
    }
  }, [])

  // Get reconnection state from socketManager
  const reconnectionState = socketManager.getReconnectionState()

  return {
    // Core socket access
    socket: socketManager.getSocket(),
    socketConnected: isConnected,

    // Device information
    deviceFingerprint,
    deviceConflictDetected,
    connectionStats,

    // Reconnection state (from Socket.IO's built-in reconnection)
    isReconnecting: reconnectionState.isReconnecting,
    reconnectAttempts: 0, // Socket.IO doesn't expose attempt count
    maxReconnectAttempts: 5, // From socket config

    // Core methods
    getSocket,
    disconnectSocket,
    forceDisconnectSocket,

    // Reconnection controls
    manualReconnect,
    setReconnectionEnabled,

    // Enhanced methods
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
