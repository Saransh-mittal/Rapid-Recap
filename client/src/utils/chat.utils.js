// File: chat.utils.js

import axios from 'axios'
import debounce from 'lodash.debounce'

// API Requests
export const fetchMessagesApi = async chatId => {
  const { data } = await axios.get(`/api/message/${chatId}`)
  return data
}

export const loadMoreMessagesApi = async (chatId, page) => {
  const { data } = await axios.get(
    `/api/message/${chatId}?page=${page}&limit=100`,
  )
  return data
}

export const updateMessageReadByApi = async messageId => {
  await axios.put(`/api/message/readby/${messageId}`)
}

export const sendMessageApi = async (content, chatId) => {
  const { data } = await axios.post('/api/message', { content, chatId })
  return data
}

export const sendArticleMessageApi = async (articleId, chatId) => {
  const { data } = await axios.post('/api/message', {
    articleId,
    chatId,
    type: 'article_card',
  })
  return data
}

export const deleteMessageApi = async (messageId, deleteType) => {
  await axios.delete(`/api/message/${messageId}`, { data: { deleteType } })
}

export const permanentDeleteMessageApi = async messageId => {
  await axios.delete(`/api/message/permanentdelete/${messageId}`)
}

export const addReactionApi = async (messageId, emoji) => {
  const { data } = await axios.post(`/api/message/reaction/${messageId}`, {
    emoji,
  })
  return data
}

export const removeReactionApi = async messageId => {
  const { data } = await axios.delete(`/api/message/reaction/${messageId}`)
  return data
}

export const fetchBookmarksApi = async () => {
  const response = await axios.get('/api/user/getBookmarks')
  return response.data.bookmarks
}

// Message Handlers
export const optimisticSendMessage = (user, selectedChat, newMessage) => {
  const tempId = Date.now().toString()
  const optimisticMessage = {
    _id: tempId,
    sender: {
      _id: user._id,
      name: user.name,
      pic: user.pic,
    },
    content: newMessage,
    chat: selectedChat._id,
    status: 'sending',
    createdAt: new Date().toISOString(),
  }
  return optimisticMessage
}

export const updateMessagesAfterSend = (messages, tempId, data) => {
  return messages?.find(msg => msg._id === data._id)
    ? messages
    : messages?.map(msg =>
        msg._id === tempId ? { ...data, status: 'sent' } : msg,
      )
}

export const updateMessagesAfterDelete = (messages, messageId, type, user) => {
  return messages?.map(msg =>
    msg._id === messageId
      ? type === 'everyone'
        ? { ...msg, isDeleted: true }
        : { ...msg, deletedFor: [...msg.deletedFor, user._id] }
      : msg,
  )
}

// Socket Handlers
export const handleSocketEvents = (socket, events) => {
  if (!socket) return

  socket.on('typing', events.onTyping)
  socket.on('stop typing', events.onStopTyping)
  socket.on('message recieved', events.onMessageReceived)
  socket.on('message deleted', events.onMessageDeleted)
  socket.on('message status updated', events.onMessageStatusUpdated)
  socket.on('reaction added', events.onReactionAdded)
  socket.on('reaction removed', events.onReactionRemoved)

  return () => {
    socket.emit('close chat', {
      userId: events.userId,
      chatId: events.chatId,
    })
  }
}

// src/utils/chatUtils.js
export const groupMessagesByDate = (messages, t, lng) => {
  const groups = {}
  messages &&
    messages?.forEach(message => {
      const date = formatDate(message.createdAt, t, lng)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

  return groups
}

export const formatDate = (date, t, lng) => {
  const messageDate = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (messageDate.toDateString() === today.toDateString()) {
    return t('today')
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return t('yesterday')
  } else if (lng === 'hi') {
    const day = messageDate.getDate()
    const month = t(`months.${messageDate.getMonth()}`)
    const year = messageDate.getFullYear()
    const weekday = t(`weekdays.${messageDate.getDay()}`)

    return `${weekday}, ${day} ${month}, ${year}`
  } else {
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}

export const checkScrollPosition = ({
  scrollableDiv,
  lastScrollTop,
  loadingRef,
  setLoading,
  loadMoreMessages,
  page,
  setPage,
  hasMore,
  setHasMore,
}) => {
  const SCROLL_THRESHOLD = 200
  const DEBOUNCE_DELAY = 100
  console.log('scrolling out')
  const debouncedScroll = debounce(async () => {
    console.log('scrolling')
    if (!scrollableDiv || loadingRef.current || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = scrollableDiv
    const isScrollingUp = scrollTop < lastScrollTop.current
    const isNearTop = scrollTop <= SCROLL_THRESHOLD

    if (isScrollingUp && isNearTop) {
      try {
        loadingRef.current = true
        setLoading(true)
        scrollableDiv.style.overflowY = 'hidden'

        const newMessages = await loadMoreMessages(page + 1)

        if (newMessages?.length === 0) {
          setHasMore(false)
        } else {
          setPage(prevPage => prevPage + 1)

          // Maintain scroll position
          requestAnimationFrame(() => {
            const newScrollHeight = scrollableDiv.scrollHeight
            const scrollDiff = newScrollHeight - scrollHeight
            scrollableDiv.scrollTop = scrollDiff
          })
        }
      } catch (error) {
        console.error('Error loading more messages:', error)
      } finally {
        await new Promise(resolve => setTimeout(resolve, 300))
        scrollableDiv.style.overflowY = 'auto'
        loadingRef.current = false
        setLoading(false)
      }
    }

    lastScrollTop.current = scrollTop
  }, DEBOUNCE_DELAY)

  return debouncedScroll
}

export const getDistinctEmojis = reactions => {
  return [...new Set(reactions.map(r => r.emoji))]
}

export const filterReactionsByEmoji = (reactions, emoji) => {
  return reactions.filter(r => r.emoji === emoji)
}

export const formatTime = date => {
  return new Date(date).toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })
}
