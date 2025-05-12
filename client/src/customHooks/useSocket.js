import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSocketContext } from '../contextAPI/SocketContext'
import socketManager from '../services/socketInitManager'

/**
 * Custom hook to interact with the socket connection
 * Uses the singleton pattern to ensure only one socket connection app-wide
 */
export const useSocket = () => {
  const { user } = useSelector(state => state.auth)
  const { isConnected } = useSocketContext()

  // Initialize socket when hook is first used with a user
  useEffect(() => {
    // Skip if no user
    if (!user || !Object.keys(user).length) return

    // Initialize socket with user data if not already connected
    if (
      !socketManager.isConnected() &&
      !socketManager.isConnectionAttempted()
    ) {
      socketManager.initializeSocket(user)
    }
  }, [user])

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

  return {
    socket: socketManager.getSocket(),
    socketConnected: isConnected,
    getSocket,
    disconnectSocket,
  }
}
