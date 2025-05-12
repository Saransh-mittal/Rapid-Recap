import React, { createContext, useContext, useState, useEffect } from 'react'
import socketManager from '../services/socketInitManager'

/**
 * Context for sharing socket connection across components
 * Uses the singleton socketManager to ensure only one connection exists
 */
const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  // State to track connection status for UI updates
  const [isConnected, setIsConnected] = useState(socketManager.isConnected())

  // Set up connection listener when provider mounts
  useEffect(() => {
    // Add listener for connection changes
    const removeListener = socketManager.addConnectionListener(connected => {
      setIsConnected(connected)
    })

    // Clean up listener on unmount
    return removeListener
  }, [])

  // Provide simplified interface to components
  const value = {
    // Direct access to manager methods
    socket: socketManager.getSocket(),
    isConnected,
    connectionAttempted: socketManager.isConnectionAttempted(),

    // Wrapper functions
    setSocket: newSocket => {
      console.warn(
        'Direct socket setting is not supported with singleton manager',
      )
    },
    setIsConnected: state => {
      console.warn(
        'Direct connection state setting is not supported with singleton manager',
      )
    },
    setConnectionAttempted: state => {
      console.warn(
        'Direct connection attempt setting is not supported with singleton manager',
      )
    },

    // Manager access method
    getExistingSocket: () => socketManager.getSocket(),

    // Expose manager for advanced usage
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

export default SocketProvider
