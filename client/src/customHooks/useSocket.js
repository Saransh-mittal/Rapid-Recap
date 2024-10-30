import { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import io from 'socket.io-client'

const ENDPOINT = 'https://www.rapidrecap.co.in' // Update this with your actual endpoint
//https://www.rapidrecap.co.in
// http://localhost:3000

export const useSocket = () => {
  const [socketConnected, setSocketConnected] = useState(false)
  const socketRef = useRef(null)
  const { user } = useSelector(state => state.auth)

  const getSocket = useCallback(() => {
    if (!socketRef.current && user && Object.keys(user).length > 0) {
      socketRef.current = io(ENDPOINT)
      socketRef.current.emit('setup', user)
      socketRef.current.on('connected', () => setSocketConnected(true))
    }
    return socketRef.current
  }, [user])

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('user-disconnected', user._id)
      socketRef.current.disconnect()
      socketRef.current = null
      setSocketConnected(false)
    }
  }, [user])

  useEffect(() => {
    const socket = getSocket()

    return () => {
      if (socket) {
        socket.disconnect()
        socketRef.current = null
        setSocketConnected(false)
      }
    }
  }, [getSocket])

  return {
    socket: socketRef.current,
    socketConnected,
    getSocket,
    disconnectSocket,
  }
}
