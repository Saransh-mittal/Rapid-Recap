import { useEffect, useState, useRef, useCallback } from 'react'
import io from 'socket.io-client'

const ENDPOINT = 'http://localhost:3000' // Update this with your actual endpoint
// https://www.rapidrecap.co.in
// http://localhost:3000

export const useSocket = user => {
  const [socketConnected, setSocketConnected] = useState(false)
  const socketRef = useRef(null)

  const getSocket = useCallback(() => {
    if (!socketRef.current && user && Object.keys(user).length > 0) {
      socketRef.current = io(ENDPOINT)
      socketRef.current.emit('setup', user)
      socketRef.current.on('connected', () => setSocketConnected(true))
    }
    return socketRef.current
  }, [user])

  const disconnectSocket = useCallback(userId => {
    if (socketRef.current) {
      socketRef.current.emit('user-disconnected', userId)
      socketRef.current.disconnect()
      socketRef.current = null
      setSocketConnected(false)
    }
  }, [])

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
