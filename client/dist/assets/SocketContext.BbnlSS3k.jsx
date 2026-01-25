// contextAPI/SocketContext.jsx - UPDATED: Listen to Socket.IO reconnection events
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
 * UPDATED: Enhanced context now listens to Socket.IO's built-in reconnection events
 *
 * Key Changes:
 * 1. Added listeners for Socket.IO reconnection events (reconnect_attempt, reconnect, etc.)
 * 2. Track reconnection state from Socket.IO instead of custom logic
 * 3. Show user-friendly notifications during reconnection
 */
const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socketManager.isConnected())
  const [deviceFingerprint, setDeviceFingerprint] = useState(null)
  const [deviceConflictDetected, setDeviceConflictDetected] = useState(false)

  const [connectionStats, setConnectionStats] = useState({
    attempts: 0,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    totalReconnections: 0,
    longestConnectionDuration: 0,
  })

  // Track Socket.IO's reconnection state
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0)

  const [lastConflictTime, setLastConflictTime] = useState(0)
  const [isUIInteraction, setIsUIInteraction] = useState(false)

  const toast = useToast()
  const connectionStartTime = React.useRef(null)

  const updateConnectionState = useCallback((connected, reason) => {
    const now = new Date()

    setIsConnected(connected)

    if (connected) {
      connectionStartTime.current = now
      setConnectionStats(prev => ({
        ...prev,
        lastConnectedAt: now,
        attempts: prev.attempts + 1,
        totalReconnections:
          prev.attempts > 1
            ? prev.totalReconnections + 1
            : prev.totalReconnections,
      }))

      setIsReconnecting(false)
      setReconnectionAttempts(0)
    } else {
      let connectionDuration = 0
      if (connectionStartTime.current) {
        connectionDuration = now - connectionStartTime.current
        connectionStartTime.current = null
      }

      setConnectionStats(prev => ({
        ...prev,
        lastDisconnectedAt: now,
        longestConnectionDuration: Math.max(
          prev.longestConnectionDuration,
          connectionDuration,
        ),
      }))
    }

    if (connected) {
      const fingerprint = socketManager.getCurrentDeviceFingerprint()
      setDeviceFingerprint(fingerprint)
    }
  }, [])

  // Set up connection listener
  useEffect(() => {
    const removeConnectionListener = socketManager.addConnectionListener(
      (connected, reason) => {
        updateConnectionState(connected, reason)
      },
    )

    const removeConflictListener = socketManager.addDeviceConflictListener(
      conflictData => {
        console.warn('Device conflict detected in SocketContext:', conflictData)

        const now = Date.now()
        if (now - lastConflictTime < 10000) {
          console.log('Device conflict notification suppressed (too soon)')
          return
        }

        if (isUIInteraction) {
          console.log('Device conflict suppressed - UI interaction in progress')
          return
        }

        setLastConflictTime(now)
        setDeviceConflictDetected(true)

        const currentFingerprint = socketManager.getCurrentDeviceFingerprint()
        if (currentFingerprint && conflictData.newSocketId) {
          const currentSocket = socketManager.getSocket()
          if (currentSocket && currentSocket.id !== conflictData.newSocketId) {
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
        }

        setTimeout(() => {
          setDeviceConflictDetected(false)
        }, 15000)
      },
    )

    // NEW: Listen to Socket.IO's reconnection events
    const socket = socketManager.getSocket()
    if (socket) {
      const handleReconnectAttempt = attemptNumber => {
        console.log(`[SocketContext] 🔄 Reconnection attempt ${attemptNumber}`)
        setIsReconnecting(true)
        setReconnectionAttempts(attemptNumber)

        // Show toast on first reconnection attempt
        if (attemptNumber === 1) {
          toast({
            title: 'Connection Lost',
            description: 'Attempting to reconnect...',
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        }
      }

      const handleReconnectFailed = () => {
        console.log('[SocketContext] ❌ Reconnection failed')
        setIsReconnecting(false)
        setReconnectionAttempts(0)

        toast({
          title: 'Connection Lost',
          description:
            'Unable to reconnect to server. Please check your internet connection.',
          status: 'error',
          duration: 8000,
          isClosable: true,
          position: 'top',
        })
      }

      const handleReconnect = attemptNumber => {
        console.log(
          `[SocketContext] ✅ Reconnected after ${attemptNumber} attempts`,
        )
        setIsReconnecting(false)
        setReconnectionAttempts(0)

        toast({
          title: 'Reconnected',
          description: 'Successfully reconnected to server.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      }

      socket.on('reconnect_attempt', handleReconnectAttempt)
      socket.on('reconnect_failed', handleReconnectFailed)
      socket.on('reconnect', handleReconnect)

      return () => {
        socket.off('reconnect_attempt', handleReconnectAttempt)
        socket.off('reconnect_failed', handleReconnectFailed)
        socket.off('reconnect', handleReconnect)
        removeConnectionListener()
        removeConflictListener()
      }
    }

    const initialFingerprint = socketManager.getCurrentDeviceFingerprint()
    if (initialFingerprint) {
      setDeviceFingerprint(initialFingerprint)
    }

    return () => {
      removeConnectionListener()
      removeConflictListener()
    }
  }, [toast, isUIInteraction, updateConnectionState, lastConflictTime])

  const emitWithDeviceContext = useCallback((event, data = {}) => {
    return socketManager.emitWithDeviceContext(event, data)
  }, [])

  const joinRoom = useCallback(room => {
    return socketManager.joinRoom(room)
  }, [])

  const getDebugInfo = useCallback(() => {
    return {
      ...socketManager.getDebugInfo(),
      contextStats: connectionStats,
      deviceConflictDetected,
      reconnectionState: {
        isReconnecting,
        attempts: reconnectionAttempts,
      },
    }
  }, [
    connectionStats,
    deviceConflictDetected,
    isReconnecting,
    reconnectionAttempts,
  ])

  const forceDisconnect = useCallback(() => {
    socketManager.forceDisconnect()
    setDeviceFingerprint(null)
    setDeviceConflictDetected(false)
    setLastConflictTime(0)
    setIsReconnecting(false)
    setReconnectionAttempts(0)
    setConnectionStats({
      attempts: 0,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
      totalReconnections: 0,
      longestConnectionDuration: 0,
    })
  }, [])

  const markUIInteraction = useCallback(isInteracting => {
    setIsUIInteraction(isInteracting)

    if (isInteracting) {
      setTimeout(() => {
        setIsUIInteraction(false)
      }, 3000)
    }
  }, [])

  const getConnectionQuality = useCallback(() => {
    if (!isConnected) return 'disconnected'
    if (isReconnecting) return 'reconnecting'
    if (connectionStats.totalReconnections > 5) return 'poor'
    if (connectionStats.totalReconnections > 2) return 'fair'
    return 'good'
  }, [isConnected, isReconnecting, connectionStats.totalReconnections])

  const value = {
    socket: socketManager.getSocket(),
    isConnected,
    connectionAttempted: socketManager.isConnectionAttempted(),

    deviceFingerprint: deviceFingerprint
      ? deviceFingerprint.substring(0, 8) + '...'
      : null,
    fullDeviceFingerprint: deviceFingerprint,
    deviceConflictDetected,

    connectionStats,
    connectionQuality: getConnectionQuality(),

    isReconnecting,
    reconnectionAttempts,

    emitWithDeviceContext,
    joinRoom,
    getDebugInfo,
    forceDisconnect,
    markUIInteraction,

    isConnectionHealthy: () => getConnectionQuality() === 'good',
    needsAttention: () =>
      ['poor', 'disconnected'].includes(getConnectionQuality()),

    setSocket: () => {
      console.warn('Direct socket setting not supported')
    },
    setIsConnected: () => {
      console.warn('Direct connection state setting not supported')
    },
    setConnectionAttempted: () => {
      console.warn('Direct connection attempt setting not supported')
    },

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

export const useDeviceAwareSocket = () => {
  const context = useSocketContext()

  const {
    socket,
    isConnected,
    deviceFingerprint,
    emitWithDeviceContext,
    joinRoom,
    deviceConflictDetected,
    markUIInteraction,
    isReconnecting,
    connectionQuality,
  } = context

  const emit = useCallback(
    (event, data = {}) => {
      if (!isConnected || isReconnecting) {
        console.warn(
          `Cannot emit ${event}: Socket ${
            isReconnecting ? 'reconnecting' : 'not connected'
          }`,
        )
        return false
      }

      return emitWithDeviceContext(event, data)
    },
    [isConnected, isReconnecting, emitWithDeviceContext],
  )

  const joinDeviceAwareRoom = useCallback(
    room => {
      if (!isConnected || isReconnecting) {
        console.warn(
          `Cannot join room ${room}: Socket ${
            isReconnecting ? 'reconnecting' : 'not connected'
          }`,
        )
        return false
      }

      markUIInteraction(true)
      return joinRoom(room)
    },
    [isConnected, isReconnecting, joinRoom, markUIInteraction],
  )

  const on = useCallback(
    (event, handler) => {
      if (!socket) {
        console.warn(`Cannot listen to ${event}: Socket not available`)
        return () => {}
      }

      socket.on(event, handler)

      return () => {
        if (socket) {
          socket.off(event, handler)
        }
      }
    },
    [socket],
  )

  const once = useCallback(
    (event, handler) => {
      if (!socket) {
        console.warn(`Cannot listen to ${event}: Socket not available`)
        return () => {}
      }

      socket.once(event, handler)

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

    isReconnecting,
    connectionQuality,
    isHealthy: connectionQuality === 'good',
    needsAttention: ['poor', 'disconnected'].includes(connectionQuality),

    emit,
    on,
    once,
    joinRoom: joinDeviceAwareRoom,
    markUIInteraction,
    ...context,
  }
}

export default SocketProvider
