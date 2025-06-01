// contextAPI/SocketContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useToast } from '@chakra-ui/react'
import socketManager from '../services/socketInitManager'

/**
 * Enhanced context for sharing socket connection with device fingerprinting support
 * Uses the singleton socketManager to ensure only one connection per device exists
 */
const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  // State to track connection status and device info for UI updates
  const [isConnected, setIsConnected] = useState(socketManager.isConnected())
  const [deviceFingerprint, setDeviceFingerprint] = useState(null)
  const [deviceConflictDetected, setDeviceConflictDetected] = useState(false)
  const [connectionStats, setConnectionStats] = useState({
    attempts: 0,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
  })
  const [lastConflictTime, setLastConflictTime] = useState(0)

  const toast = useToast()

  // Set up connection listener when provider mounts
  useEffect(() => {
    // Add listener for connection changes
    const removeConnectionListener = socketManager.addConnectionListener(
      connected => {
        setIsConnected(connected)

        // Update connection stats
        setConnectionStats(prev => ({
          ...prev,
          [connected ? 'lastConnectedAt' : 'lastDisconnectedAt']: new Date(),
          attempts: connected ? prev.attempts + 1 : prev.attempts,
        }))

        // Get device fingerprint when connected
        if (connected) {
          const fingerprint = socketManager.getCurrentDeviceFingerprint()
          setDeviceFingerprint(fingerprint)
        }
      },
    )

    // Add listener for device conflicts
    const removeConflictListener = socketManager.addDeviceConflictListener(
      conflictData => {
        console.warn('Device conflict detected in SocketContext:', conflictData)

        // Prevent duplicate notifications within 5 seconds
        const now = Date.now()
        if (now - lastConflictTime < 5000) {
          console.log(
            'Device conflict notification suppressed (too soon since last one)',
          )
          return
        }

        setLastConflictTime(now)
        setDeviceConflictDetected(true)

        // Show user-friendly toast notification only for genuine conflicts
        // Check if this is actually a different device/session
        const currentFingerprint = socketManager.getCurrentDeviceFingerprint()
        if (currentFingerprint && conflictData.newSocketId) {
          toast({
            title: 'Multiple Sessions Detected',
            description:
              'Another tab or device is using your account. This session will be disconnected.',
            status: 'warning',
            duration: 8000,
            isClosable: true,
            position: 'top',
          })
        }

        // Reset conflict state after a delay
        setTimeout(() => {
          setDeviceConflictDetected(false)
        }, 10000)
      },
    )

    // Get initial device fingerprint if available
    const initialFingerprint = socketManager.getCurrentDeviceFingerprint()
    if (initialFingerprint) {
      setDeviceFingerprint(initialFingerprint)
    }

    // Clean up listeners on unmount
    return () => {
      removeConnectionListener()
      removeConflictListener()
    }
  }, [toast])

  // Helper function to emit events with device context
  const emitWithDeviceContext = useCallback((event, data = {}) => {
    return socketManager.emitWithDeviceContext(event, data)
  }, [])

  // Helper function to join rooms
  const joinRoom = useCallback(room => {
    return socketManager.joinRoom(room)
  }, [])

  // Helper function to get debug information
  const getDebugInfo = useCallback(() => {
    return {
      ...socketManager.getDebugInfo(),
      contextStats: connectionStats,
      deviceConflictDetected,
    }
  }, [connectionStats, deviceConflictDetected])

  // Force disconnect function (for logout or testing)
  const forceDisconnect = useCallback(() => {
    socketManager.forceDisconnect()
    setDeviceFingerprint(null)
    setDeviceConflictDetected(false)
    setLastConflictTime(0)
    setConnectionStats({
      attempts: 0,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
    })
  }, [])

  // Provide enhanced interface to components
  const value = {
    // Core socket access
    socket: socketManager.getSocket(),
    isConnected,
    connectionAttempted: socketManager.isConnectionAttempted(),

    // Device fingerprinting info
    deviceFingerprint: deviceFingerprint
      ? deviceFingerprint.substring(0, 8) + '...'
      : null,
    fullDeviceFingerprint: deviceFingerprint,
    deviceConflictDetected,

    // Connection statistics
    connectionStats,

    // Enhanced methods
    emitWithDeviceContext,
    joinRoom,
    getDebugInfo,
    forceDisconnect,

    // Legacy wrapper functions for backward compatibility
    setSocket: newSocket => {
      console.warn(
        'Direct socket setting is not supported with device-aware singleton manager',
      )
    },
    setIsConnected: state => {
      console.warn(
        'Direct connection state setting is not supported with device-aware singleton manager',
      )
    },
    setConnectionAttempted: state => {
      console.warn(
        'Direct connection attempt setting is not supported with device-aware singleton manager',
      )
    },

    // Manager access method for advanced usage
    getExistingSocket: () => socketManager.getSocket(),
    socketManager,
  }

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}

// Enhanced hook for device-aware socket operations
export const useDeviceAwareSocket = () => {
  const context = useSocketContext()

  const {
    socket,
    isConnected,
    deviceFingerprint,
    emitWithDeviceContext,
    joinRoom,
    deviceConflictDetected,
  } = context

  // Device-aware emit function
  const emit = useCallback(
    (event, data = {}) => {
      if (!isConnected) {
        console.warn(`Cannot emit ${event}: Socket not connected`)
        return false
      }

      return emitWithDeviceContext(event, data)
    },
    [isConnected, emitWithDeviceContext],
  )

  // Device-aware room joining
  const joinDeviceAwareRoom = useCallback(
    room => {
      if (!isConnected) {
        console.warn(`Cannot join room ${room}: Socket not connected`)
        return false
      }

      return joinRoom(room)
    },
    [isConnected, joinRoom],
  )

  // Listen to events with automatic cleanup
  const on = useCallback(
    (event, handler) => {
      if (!socket) {
        console.warn(`Cannot listen to ${event}: Socket not available`)
        return () => {}
      }

      socket.on(event, handler)

      // Return cleanup function
      return () => {
        if (socket) {
          socket.off(event, handler)
        }
      }
    },
    [socket],
  )

  // Listen to events once
  const once = useCallback(
    (event, handler) => {
      if (!socket) {
        console.warn(`Cannot listen to ${event}: Socket not available`)
        return () => {}
      }

      socket.once(event, handler)

      // Return cleanup function (though it's automatically cleaned up after first call)
      return () => {
        if (socket) {
          socket.off(event, handler)
        }
      }
    },
    [socket],
  )

  return {
    socket,
    isConnected,
    deviceFingerprint,
    deviceConflictDetected,
    emit,
    on,
    once,
    joinRoom: joinDeviceAwareRoom,
    ...context,
  }
}

export default SocketProvider
