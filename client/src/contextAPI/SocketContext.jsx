import React, { createContext, useContext, useState } from 'react'

const SocketContext = createContext()

let globalSocket = null

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)

  const value = {
    socket: globalSocket,
    setSocket: newSocket => {
      globalSocket = newSocket
    },
    isConnected,
    setIsConnected,
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
