// customHooks/useSparkSocket.js
// Shared socket hook for Spark Engine session players (no authentication required)
// Similar to useQuickClashSocket but specifically for /play/* routes

import { useCallback, useEffect, useRef, useState } from 'react'
import socketManager from '../services/socketInitManager'

/**
 * useSparkSocket - Shared socket hook for session players
 *
 * Provides a singleton socket connection that persists across
 * /play/* route navigation, eliminating per-component socket creation.
 */
const useSparkSocket = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const eventCleanupFunctions = useRef([])
  const isInitializedRef = useRef(false)

  // Initialize socket on mount
  useEffect(() => {
    const initSocket = async () => {
      try {
        const socket = await socketManager.initializeSocket()
        if (socket) {
          isInitializedRef.current = true
        }
      } catch (error) {
        console.error('[useSparkSocket] Failed to initialize socket:', error)
        setConnectionError(error.message)
      }
    }

    initSocket()

    // Add connection state listener
    const removeConnectionListener = socketManager.addConnectionListener(
      (connected) => {
        setIsConnected(connected)
      }
    )

    // Cleanup function - removes listener but does NOT disconnect socket
    return () => {
      removeConnectionListener()
      eventCleanupFunctions.current.forEach(cleanup => {
        if (typeof cleanup === 'function') {
          try { cleanup() } catch (error) { /* ignore */ }
        }
      })
      eventCleanupFunctions.current = []
    }
  }, [])

  // Get the socket instance
  const getSocket = useCallback(() => {
    return socketManager.getSocket()
  }, [])

  // Check if socket is ready for use
  const isSocketReady = useCallback(() => {
    const socket = socketManager.getSocket()
    return socket && socket.connected
  }, [])

  // Add an event listener to the socket
  const addEventListener = useCallback((event, handler) => {
    const socket = socketManager.getSocket()
    if (!socket) {
      return () => {}
    }

    socket.on(event, handler)

    // Create cleanup function
    const cleanup = () => {
      const currentSocket = socketManager.getSocket()
      if (currentSocket) {
        currentSocket.off(event, handler)
      }
    }

    eventCleanupFunctions.current.push(cleanup)
    return cleanup
  }, [])

  // Emit an event on the socket
  const emit = useCallback((event, data = {}) => {
    const socket = socketManager.getSocket()
    if (!socket || !socket.connected) {
      return false
    }
    socket.emit(event, data)
    return true
  }, [])

  // Emit with device context
  const emitWithDeviceContext = useCallback((event, data = {}) => {
    return socketManager.emitWithDeviceContext(event, data)
  }, [])

  // Join a room
  const joinRoom = useCallback((room) => {
    return socketManager.joinRoom(room)
  }, [])

  // Cleanup all event listeners
  const cleanupEventListeners = useCallback(() => {
    eventCleanupFunctions.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        try { cleanup() } catch (error) { /* ignore */ }
      }
    })
    eventCleanupFunctions.current = []
  }, [])

  return {
    socket: socketManager.getSocket(),
    getSocket,
    isSocketReady,
    isConnected,
    connectionError,
    addEventListener,
    emit,
    emitWithDeviceContext,
    joinRoom,
    cleanupEventListeners,
    getDebugInfo: socketManager.getDebugInfo.bind(socketManager),
  }
}

export default useSparkSocket
