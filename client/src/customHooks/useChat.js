// src/customHooks/useChat.js - Main chat hook for easy integration
import { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import {
  fetchConversations,
  getOrCreateConversation,
  fetchMessages,
  sendMessage,
  markMessagesAsRead,
  setActiveConversation,
  clearActiveConversation,
  clearError,
} from '../redux/friendsChatSlice'
import useFriendsSocket from './useFriendsSocket'

/**
 * Main chat hook that provides all chat functionality
 * Simplifies chat integration across components
 */
const useChat = (options = {}) => {
  const {
    autoLoadConversations = true,
    showToastNotifications = true,
    enableRealTime = true,
  } = options

  const { t } = useTranslation('WiseWeb')
  const dispatch = useDispatch()
  const toast = useToast()

  // Redux state
  const chatState = useSelector(state => state.friendsChat)
  const { user } = useSelector(state => state.auth)

  // Socket integration
  const {
    isConnected: socketConnected,
    joinFriendConversation: joinConversation,
    leaveFriendConversation: leaveConversation,
    sendFriendTypingIndicator: sendTypingIndicator,
  } = window?.friendsSocket || {}

  // Auto-load conversations on mount
  useEffect(() => {
    if (autoLoadConversations && user) {
      dispatch(fetchConversations())
    }
  }, [autoLoadConversations, user, dispatch])

  // Show toast notifications for errors
  useEffect(() => {
    if (showToastNotifications) {
      Object.entries(chatState.error).forEach(([key, error]) => {
        if (error) {
          toast({
            title: t('Chat Error'),
            description: error,
            status: 'error',
            duration: 4000,
            isClosable: true,
          })
          // Clear error after showing toast
          dispatch(clearError(key))
        }
      })
    }
  }, [chatState.error, showToastNotifications, toast, t, dispatch])

  // Enhanced conversation management
  const startChatWithFriend = useCallback(
    async friendId => {
      try {
        const result = await dispatch(
          getOrCreateConversation({ friendId }),
        ).unwrap()
        dispatch(setActiveConversation(result.conversation._id))

        if (enableRealTime) {
          joinConversation(result.conversation._id)
        }

        return result.conversation
      } catch (error) {
        console.error('Failed to start chat:', error)
        return null
      }
    },
    [dispatch, enableRealTime, joinConversation],
  )

  const selectConversation = useCallback(
    conversationId => {
      // Leave previous conversation room
      if (chatState.activeConversationId && enableRealTime) {
        leaveConversation(chatState.activeConversationId)
      }

      // Set new active conversation
      dispatch(setActiveConversation(conversationId))

      // Join new conversation room
      if (enableRealTime) {
        joinConversation(conversationId)
      }

      // Load messages if not already loaded
      if (!chatState.messages[conversationId]) {
        dispatch(fetchMessages({ conversationId }))
      }

      // Mark messages as read
      dispatch(markMessagesAsRead({ conversationId }))
    },
    [
      chatState.activeConversationId,
      chatState.messages,
      dispatch,
      enableRealTime,
      joinConversation,
      leaveConversation,
    ],
  )

  const closeConversation = useCallback(() => {
    if (chatState.activeConversationId && enableRealTime) {
      leaveConversation(chatState.activeConversationId)
    }
    dispatch(clearActiveConversation())
  }, [
    chatState.activeConversationId,
    dispatch,
    enableRealTime,
    leaveConversation,
  ])

  const sendChatMessage = useCallback(
    async (content, conversationId = null) => {
      const targetConversationId =
        conversationId || chatState.activeConversationId

      if (!targetConversationId) {
        throw new Error('No active conversation')
      }

      try {
        const result = await dispatch(
          sendMessage({
            conversationId: targetConversationId,
            content,
          }),
        ).unwrap()

        return result.message
      } catch (error) {
        throw new Error(error)
      }
    },
    [chatState.activeConversationId, dispatch],
  )

  const loadMoreMessages = useCallback(
    async (conversationId = null) => {
      const targetConversationId =
        conversationId || chatState.activeConversationId

      if (!targetConversationId) return

      const messages = chatState.messages[targetConversationId] || []
      const oldestMessage = messages[0]

      if (oldestMessage && chatState.hasMoreMessages[targetConversationId]) {
        dispatch(
          fetchMessages({
            conversationId: targetConversationId,
            before: oldestMessage.createdAt,
          }),
        )
      }
    },
    [
      chatState.activeConversationId,
      chatState.messages,
      chatState.hasMoreMessages,
      dispatch,
    ],
  )

  // Enhanced typing indicators
  const startTyping = useCallback(
    (conversationId = null) => {
      const targetConversationId =
        conversationId || chatState.activeConversationId
      if (targetConversationId && enableRealTime) {
        sendTypingIndicator(targetConversationId, true)
      }
    },
    [chatState.activeConversationId, enableRealTime, sendTypingIndicator],
  )

  const stopTyping = useCallback(
    (conversationId = null) => {
      const targetConversationId =
        conversationId || chatState.activeConversationId
      if (targetConversationId && enableRealTime) {
        sendTypingIndicator(targetConversationId, false)
      }
    },
    [chatState.activeConversationId, enableRealTime, sendTypingIndicator],
  )

  // Helper functions
  const getUnreadCount = useCallback(
    (conversationId = null) => {
      if (conversationId) {
        return chatState.unreadCounts[conversationId] || 0
      }

      // Total unread count across all conversations
      return Object.values(chatState.unreadCounts).reduce(
        (sum, count) => sum + count,
        0,
      )
    },
    [chatState.unreadCounts],
  )

  const isConversationActive = useCallback(
    conversationId => {
      return chatState.activeConversationId === conversationId
    },
    [chatState.activeConversationId],
  )

  const getConversationMessages = useCallback(
    conversationId => {
      return chatState.messages[conversationId] || []
    },
    [chatState.messages],
  )

  const getActiveConversation = useCallback(() => {
    return chatState.conversations.find(
      conv => conv._id === chatState.activeConversationId,
    )
  }, [chatState.conversations, chatState.activeConversationId])

  return {
    // State
    conversations: chatState.conversations,
    activeConversation: getActiveConversation(),
    activeConversationId: chatState.activeConversationId,
    loading: chatState.loading,
    error: chatState.error,
    socketConnected,

    // Actions
    startChatWithFriend,
    selectConversation,
    closeConversation,
    sendChatMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,

    // Helpers
    getUnreadCount,
    isConversationActive,
    getConversationMessages,
    getActiveConversation,

    // Real-time status
    isTyping: conversationId => {
      const typingUsers = chatState.typingUsers[conversationId] || []
      return typingUsers.length > 0
    },

    // Refresh functions
    refreshConversations: () => dispatch(fetchConversations()),
    refreshMessages: conversationId =>
      dispatch(fetchMessages({ conversationId })),
  }
}

export default useChat
