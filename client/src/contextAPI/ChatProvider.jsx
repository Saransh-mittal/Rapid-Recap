import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from './appContext'
import { useSocket } from '../customHooks/useSocket'
import axios from 'axios'
import { useDisclosure } from '@chakra-ui/react'
import { useNavigationCount } from '../customHooks/useNavigationCount.js'

const ChatContext = createContext()

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState()
  const [user, setUser] = useState()
  const [notification, setNotification] = useState([])
  const [chats, setChats] = useState()
  const [messagesFetched, setMessagesFetched] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [chatRequests, setChatRequests] = useState([])
  const [fetchAgain, setFetchAgain] = useState(false)
  const { getSocket, disconnectSocket, socket, socketConnected } =
    useSocket(user)
  const {
    isOpen: isChatOpen,
    onOpen: openChat,
    onClose: closeChat,
  } = useDisclosure()
  const { count: routeCount, isLastRoute } = useNavigationCount()

  const history = useNavigate()

  const { state } = useContext(AppContext)

  const sortChats = chatsToSort => {
    return chatsToSort.sort((a, b) => {
      const aTime = a.latestMessage
        ? new Date(a.latestMessage.createdAt).getTime()
        : 0
      const bTime = b.latestMessage
        ? new Date(b.latestMessage.createdAt).getTime()
        : 0
      return bTime - aTime
    })
  }

  const updateLatestMessage = (chatId, newLatestMessage) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat =>
        chat._id === chatId
          ? { ...chat, latestMessage: newLatestMessage }
          : chat,
      )
      return sortChats(updatedChats)
    })

    if (selectedChat && selectedChat._id === chatId) {
      setSelectedChat(prevSelectedChat => ({
        ...prevSelectedChat,
        latestMessage: newLatestMessage,
      }))
    }
  }

  const getInitialNotificationCnt = async () => {
    const { data } = await axios.get('/api/notify/new-message-chats')
    setNotification(data.unreadChats)
  }

  useEffect(() => {
    getInitialNotificationCnt()
    setUser(state.user)

    getSocket()

    const handleDisconnect = () => {
      setFetchAgain(false)
      disconnectSocket(state.user?._id?.toString())
    }

    const handleReconnect = () => {
      console.log('Reconnecting...')
      console.log('fetchAgain', fetchAgain)
      setFetchAgain(true)
      getSocket()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleDisconnect()
      } else {
        handleReconnect()
      }
    }

    // Use multiple events for better coverage
    window.addEventListener('beforeunload', handleDisconnect)
    window.addEventListener('pagehide', handleDisconnect)
    window.addEventListener('pageshow', handleReconnect)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // For mobile browsers
    document.addEventListener('pause', handleDisconnect)
    document.addEventListener('resume', handleReconnect)

    return () => {
      window.removeEventListener('beforeunload', handleDisconnect)
      window.removeEventListener('pagehide', handleDisconnect)
      window.removeEventListener('pageshow', handleReconnect)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('pause', handleDisconnect)
      document.removeEventListener('resume', handleReconnect)
      handleDisconnect()
    }
  }, [state.user, getSocket])

  useEffect(() => {
    if (socket) {
      socket.on('unread notification', data => {
        // console.log(data);
        setNotification(prev => {
          return prev.includes(data.chatId) ? prev : [...prev, data.chatId]
        })
      })
    }
    if (socket && user) {
      const heartbeatInterval = setInterval(() => {
        socket.emit('heartbeat', user._id)
      }, 20000) // Send heartbeat every 20 seconds
      return () => {
        clearInterval(heartbeatInterval)
      }
    }
  })

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        updateLatestMessage,
        socket,
        socketConnected,
        messagesFetched,
        setMessagesFetched,
        hasMore,
        setHasMore,
        chatRequests,
        setChatRequests,
        isChatOpen,
        openChat,
        closeChat,
        isLastRoute,
        routeCount,
        setFetchAgain,
        fetchAgain,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const ChatState = () => {
  return useContext(ChatContext)
}

export default ChatProvider
