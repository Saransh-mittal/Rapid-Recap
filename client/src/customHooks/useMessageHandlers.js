// File: useMessageHandlers.js
import { useCallback, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import {
  fetchMessagesApi,
  loadMoreMessagesApi,
  updateMessageReadByApi,
  sendMessageApi,
  deleteMessageApi,
  permanentDeleteMessageApi,
  optimisticSendMessage,
  updateMessagesAfterSend,
  updateMessagesAfterDelete,
  fetchBookmarksApi,
  sendArticleMessageApi,
  addReactionApi,
  removeReactionApi,
} from '../utils/chat.utils'

const useMessageHandlers = ({
  selectedChat,
  user,
  socket,
  setMessagesFetched,
  setHasMore,
  updateLatestMessage,
  setNotification,
  onOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [showBookmarksModal, setShowBookmarksModal] = useState(false)
  const [deleteInfo, setDeleteInfo] = useState({ messageId: null, type: null })
  const toast = useToast()

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    if (!selectedChat) return
    try {
      const cachedMessages = JSON.parse(
        localStorage.getItem(`messages-${selectedChat._id}`),
      )
      if (cachedMessages) {
        setMessages(cachedMessages)
      }
      const data = await fetchMessagesApi(selectedChat._id)
      if (data.length === 0) {
        setMessagesFetched(true)
        return
      }
      setMessages(prevMessages => {
        if (
          prevMessages?.length > 0 &&
          prevMessages[0].chat.toString() === selectedChat._id.toString()
        )
          return [...data, ...prevMessages]
        return [...data]
      })
      localStorage.setItem(`messages-${selectedChat._id}`, JSON.stringify(data))

      data.forEach(message => {
        if (
          message.sender._id !== user._id &&
          !message.readBy.includes(user._id)
        ) {
          console.log('updating read by')
          updateMessageReadBy(message._id)
        }
      })
      socket?.emit('join chat', selectedChat._id)
      setMessagesFetched(true)
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to Load the Messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedChat, toast])

  const loadMoreMessages = async page => {
    try {
      const data = await loadMoreMessagesApi(selectedChat._id, page)
      if (!data.length) {
        setHasMore(false)
      }
      setMessages(prevMessages => {
        const newMessageIds = new Set(data.map(msg => msg._id))
        const uniquePrevMessages = prevMessages?.filter(
          msg => !newMessageIds.has(msg._id),
        )
        return [...data, ...uniquePrevMessages]
      })
      return data
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to Load More Messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }

  const updateMessageReadBy = async messageId => {
    try {
      await updateMessageReadByApi(messageId)
      socket?.emit('message read', {
        messageId,
        userId: user._id,
      })
    } catch (error) {
      console.error('Error updating message read status:', error)
    }
  }

  const sendMessage = async event => {
    if (event.key === 'Enter' && newMessage) {
      socket?.emit('stop typing', selectedChat._id)
      const optimisticMessage = optimisticSendMessage(
        user,
        selectedChat,
        newMessage,
      )
      setMessages(prevMessages => [...prevMessages, optimisticMessage])
      const currentNewMessage = newMessage
      setNewMessage('')
      try {
        const data = await sendMessageApi(currentNewMessage, selectedChat._id)
        socket?.emit('new message', data)
        setMessages(prevMessages =>
          updateMessagesAfterSend(prevMessages, optimisticMessage._id, data),
        )
        updateLatestMessage(selectedChat._id, data)
        if (messages?.length === 0 && selectedChat.chatCreatedBy === user._id) {
          socket?.emit('chat request', {
            chatId: selectedChat._id,
            recipientId: selectedChat.users.find(u => u._id !== user._id)._id,
          })
        }
      } catch (error) {
        setMessages(prevMessages =>
          prevMessages?.filter(msg => msg._id !== optimisticMessage._id),
        )
        toast({
          title: 'Error Occurred!',
          description: 'Failed to send the Message',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        })
      }
    }
  }

  const handleDeleteMessage = (messageId, type) => {
    if (type === 'everyone') {
      setDeleteInfo({ messageId, type })
      onOpen()
    } else if (type === 'me') {
      deleteMessage(messageId, type)
    } else {
      permanentDeleteMessage(messageId)
    }
  }

  const permanentDeleteMessage = async messageId => {
    try {
      await permanentDeleteMessageApi(messageId)
      setMessages(prevMessages =>
        prevMessages?.filter(msg => msg._id !== messageId),
      )
      toast({
        title: 'Message deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      })
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error deleting message',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }

  const deleteMessage = async (messageId, type) => {
    try {
      await deleteMessageApi(messageId, type)
      const updatedMessages = updateMessagesAfterDelete(
        messages,
        messageId,
        type,
        user,
      )
      setMessages(updatedMessages)
      const newLatestMessage = updatedMessages
        .filter(msg => !msg.isDeleted && !msg.deletedFor.includes(user._id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      updateLatestMessage(selectedChat._id, newLatestMessage || null)
      if (type === 'everyone') {
        socket?.emit('delete message', {
          chatId: selectedChat._id,
          messageId: messageId,
          deleteType: type,
          senderId: user?._id.toString(),
        })
      }
      toast({
        title: 'Message deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      })
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error deleting message',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }

  const confirmDelete = () => {
    deleteMessage(deleteInfo.messageId, deleteInfo.type)
    onClose()
  }

  const handleAddReaction = async (messageId, emoji) => {
    const messageToUpdate = messages?.find(msg => msg._id === messageId)
    if (!messageToUpdate) return

    const tempReaction = {
      _id: Date.now().toString(),
      emoji: emoji,
      user: user._id,
    }

    const updatedMessage = {
      ...messageToUpdate,
      reactions: [...messageToUpdate.reactions, tempReaction],
    }

    setMessages(prevMessages =>
      prevMessages?.map(msg => (msg._id === messageId ? updatedMessage : msg)),
    )
    try {
      const data = await addReactionApi(messageId, emoji)
      setMessages(messages?.map(msg => (msg._id === messageId ? data : msg)))
      socket?.emit('new reaction', data)
    } catch (error) {
      setMessages(prevMessages =>
        prevMessages?.map(msg =>
          msg._id === messageId ? messageToUpdate : msg,
        ),
      )
      console.log(error)
      toast({
        title: 'Error adding reaction',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }

  const handleRemoveReaction = async messageId => {
    try {
      const data = await removeReactionApi(messageId)
      setMessages(messages?.map(msg => (msg._id === messageId ? data : msg)))
      socket?.emit('remove reaction', data)
    } catch (error) {
      toast({
        title: 'Error removing reaction',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }

  const fetchBookmarks = async () => {
    setIsLoadingBookmarks(true)
    try {
      const bookmarksData = await fetchBookmarksApi()
      setBookmarks(bookmarksData)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setIsLoadingBookmarks(false)
    }
  }

  const handleShareBookmark = async (articleId, article) => {
    if (!selectedChat) return
    try {
      setShowBookmarksModal(false)
      const tempId = Date.now().toString()
      const optimisticMessage = {
        _id: tempId,
        sender: {
          _id: user._id,
          name: user.name,
          pic: user.pic,
        },
        chat: selectedChat._id,
        status: 'sending',
        createdAt: new Date().toISOString(),
        article,
        type: 'article_card',
      }

      setMessages(prevMessages => [...prevMessages, optimisticMessage])
      const data = await sendArticleMessageApi(articleId, selectedChat._id)
      socket.emit('new message', data)
      setMessages(prevMessages =>
        updateMessagesAfterSend(prevMessages, optimisticMessage._id, data),
      )
    } catch (error) {
      console.error('Error sharing bookmark:', error)
    }
  }

  return {
    messages,
    loading,
    newMessage,
    isLoadingBookmarks,
    bookmarks,
    deleteInfo,
    setNewMessage,
    setDeleteInfo,
    fetchMessages,
    loadMoreMessages,
    updateMessageReadBy,
    sendMessage,
    handleDeleteMessage,
    permanentDeleteMessage,
    deleteMessage,
    confirmDelete,
    handleAddReaction,
    handleRemoveReaction,
    fetchBookmarks,
    handleShareBookmark,
    showBookmarksModal,
    setShowBookmarksModal,
    setMessages,
  }
}

export default useMessageHandlers
