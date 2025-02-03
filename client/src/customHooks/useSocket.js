import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import io from 'socket.io-client'
import { useSocketContext } from '../contextAPI/SocketContext'

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? 'https://rapidrecap.ai'
    : 'http://localhost:3000'

export const useSocket = () => {
  const { user } = useSelector(state => state.auth)
  const { socket, setSocket, isConnected, setIsConnected } = useSocketContext()

  const getSocket = useCallback(() => {
    if (!socket && user && Object.keys(user).length > 0) {
      const newSocket = io(ENDPOINT)

      newSocket.emit('setup', user)

      newSocket.on('connected', () => {
        setIsConnected(true)
      })
      newSocket.on('force-reload', () => {
        console.log('Force reload signal received')
        window.location.reload()
      })
      setSocket(newSocket)
      return newSocket
    }
    return socket
  }, [user, socket, setSocket, setIsConnected])

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.emit('user-disconnected', user?._id)
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [socket, user, setSocket, setIsConnected])

  return {
    socket,
    socketConnected: isConnected,
    getSocket,
    disconnectSocket,
  }
}
