// src/customHooks/useFriendsSocket.js - FIXED: Clean wrapper around socketManager
import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import socketManager from '../services/socketInitManager'
import {
  fetchFriends,
  fetchFriendRequests,
  updateFriendOnlineStatus,
  removePendingRequest,
  handleSocketFriendRequestAccepted,
} from '../redux/friendsSlice'
import {
  handleNewMessage,
  handleMessageStatusUpdate,
  handleMessagesRead,
  handleMessageDeleted,
  handleUserTyping,
  setSocketConnected,
} from '../redux/friendsChatSlice'
import { useNotifications } from '../utils/notifications.jsx'

/**
 * ARCHITECTURE EXPLANATION:
 * This hook is a thin wrapper around the shared socketManager that:
 * 1. Sets up friends-specific event listeners on the shared socket
 * 2. Provides friends-specific functions (chat, typing, etc.)
 * 3. Does NOT manage socket connection/reconnection (delegated to socketManager)
 *
 * KEY PATTERN: Separation of Concerns
 * - socketManager: Handles all socket lifecycle (connection, reconnection, etc.)
 * - useFriendsSocket: Only handles friends-specific business logic
 */

const useFriendsSocket = (options = {}) => {
  const { enableNotifications = true } = options

  const dispatch = useDispatch()
  const { notify } = useNotifications()
  const { t } = useTranslation('WiseWeb')

  // Redux state
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { activeConversationId } = useSelector(state => state.friendsChat)

  // Track current active conversation for notification filtering
  const activeConversationIdRef = useRef(activeConversationId)

  // Track if listeners are set up to prevent duplicates
  const listenersSetupRef = useRef(false)
  const cleanupFunctionsRef = useRef([])

  /**
   * Setup all friends-related event listeners on the shared socket
   * This is called once when the socket becomes available
   */
  const setupEventListeners = useCallback(() => {
    const socket = socketManager.getSocket()

    if (!socket || listenersSetupRef.current) {
      return
    }

    console.log('[FRIENDS_SOCKET] Setting up event listeners on shared socket')

    // Clear any existing listeners first
    cleanupFunctionsRef.current.forEach(cleanup => cleanup())
    cleanupFunctionsRef.current = []

    // Helper to add listener with automatic cleanup tracking
    const addListener = (event, handler) => {
      socket.on(event, handler)
      cleanupFunctionsRef.current.push(() => socket.off(event, handler))
    }

    // =========================================
    // FRIEND REQUEST EVENTS
    // =========================================

    addListener('friends:requestReceived', data => {
      console.log('[FRIENDS_SOCKET] Friend request received:', data)
      dispatch(fetchFriendRequests())

      if (enableNotifications) {
        notify.info(
          t('Friend Request'),
          t('{{name}} sent you a friend request', { name: data.from.name }),
          { duration: 5000 },
        )
      }
    })

    addListener('friends:requestAccepted', data => {
      console.log('[FRIENDS_SOCKET] Friend request accepted:', data)
      // Optimistic update with real-time status from payload
      dispatch(handleSocketFriendRequestAccepted(data))
      dispatch(fetchFriends())
      dispatch(fetchFriendRequests())

      if (enableNotifications) {
        notify.success(
          t('Request Accepted'),
          t('{{name}} accepted your friend request', {
            name: data.friend.name,
          }),
          { duration: 4000 },
        )
      }
    })

    // FIXED: Handle new friend added event (for the accepter)
    addListener('friends:newFriendAdded', data => {
      console.log('[FRIENDS_SOCKET] New friend added:', data)
      // Optimistic update with real-time status from payload
      dispatch(handleSocketFriendRequestAccepted(data))
      dispatch(fetchFriends())
      dispatch(fetchFriendRequests())

      if (enableNotifications) {
        notify.success(
          t('New Friend'),
          t('You are now friends with {{name}}', {
            name: data.friend.name,
          }),
          { duration: 4000 },
        )
      }
    })

    addListener('friends:requestRejected', data => {
      console.log('[FRIENDS_SOCKET] Friend request rejected:', data)
      dispatch(removePendingRequest(data.rejectedBy._id))

      if (enableNotifications) {
        notify.info(
          t('Request Update'),
          t('Your friend request was declined'),
          { duration: 3000 },
        )
      }
    })

    // =========================================
    // FRIEND STATUS EVENTS
    // =========================================

    addListener('friends:friendStatusChanged', data => {
      console.log('[FRIENDS_SOCKET] Friend status changed:', data)
      dispatch(
        updateFriendOnlineStatus({
          friendId: data.friendId,
          isOnline: data.isOnline,
        }),
      )
    })

    addListener('friends:friendRemoved', data => {
      console.log('[FRIENDS_SOCKET] Friend removed:', data)
      dispatch(fetchFriends())

      if (enableNotifications) {
        notify.warning(
          t('Friend Removed'),
          t('A friend has been removed from your list'),
          { duration: 3000 },
        )
      }
    })

    // =========================================
    // ROOM EVENTS
    // =========================================

    addListener('friends:roomJoined', data => {
      console.log('[FRIENDS_SOCKET] Joined friends room:', data)
      if (!data.alreadyJoined) {
        dispatch(fetchFriends())
        dispatch(fetchFriendRequests())
      }
    })

    addListener('friends:error', data => {
      console.error('[FRIENDS_SOCKET] Socket error:', data)

      if (enableNotifications) {
        notify.error(
          t('Connection Error'),
          data.message || t('A real-time connection error occurred'),
          { duration: 4000 },
        )
      }
    })

    addListener('friends:onlineStatusResponse', data => {
      console.log('[FRIENDS_SOCKET] Online status response:', data)

      Object.entries(data.statuses).forEach(([friendId, status]) => {
        if (!status.error) {
          dispatch(
            updateFriendOnlineStatus({
              friendId,
              isOnline: status.isOnline,
            }),
          )
        }
      })
    })

    // =========================================
    // CHAT MESSAGE EVENTS
    // =========================================

    addListener('friends:newMessage', data => {
      console.log('[FRIENDS_SOCKET] New message received:', data)

      // Prevent duplicate messages from self
      if (data.message.sender._id === user._id) {
        return
      }

      dispatch(
        handleNewMessage({
          conversationId: data.conversationId,
          message: data.message,
        }),
      )

      // Show notification if not in active conversation
      if (
        enableNotifications &&
        data.message.sender._id !== user._id &&
        (!activeConversationIdRef.current ||
          activeConversationIdRef.current !== data.conversationId)
      ) {
        notify.info(
          data.message.sender.name,
          data.message.content.length > 50
            ? data.message.content.substring(0, 47) + '...'
            : data.message.content,
          {
            duration: 4000,
            icon: data.message.sender.pic,
          },
        )
      }
    })

    addListener('friends:messageStatusUpdate', data => {
      console.log('[FRIENDS_SOCKET] Message status update:', data)
      dispatch(
        handleMessageStatusUpdate({
          messageId: data.messageId,
          status: data.status,
          conversationId: data.conversationId,
        }),
      )
    })

    addListener('friends:messagesReadUpdate', data => {
      console.log('[FRIENDS_SOCKET] Messages read update:', data)
      dispatch(
        handleMessagesRead({
          conversationId: data.conversationId,
          readerId: data.readerId,
          messageIds: data.messageIds,
        }),
      )
    })

    addListener('friends:messageDeleted', data => {
      console.log('[FRIENDS_SOCKET] Message deleted:', data)
      dispatch(
        handleMessageDeleted({
          conversationId: data.conversationId,
          messageId: data.messageId,
          deletedBy: data.deletedBy,
        }),
      )
    })

    addListener('friends:userTyping', data => {
      console.log('[FRIENDS_SOCKET] User typing:', data)
      dispatch(
        handleUserTyping({
          conversationId: data.conversationId,
          userId: data.userId,
          isTyping: data.isTyping,
        }),
      )

      // Auto-clear typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          dispatch(
            handleUserTyping({
              conversationId: data.conversationId,
              userId: data.userId,
              isTyping: false,
            }),
          )
        }, 3000)
      }
    })

    listenersSetupRef.current = true
    console.log('[FRIENDS_SOCKET] All event listeners registered')
  }, [dispatch, notify, t, enableNotifications, user])

  /**
   * Join friends room using socketManager
   */
  const joinFriendsRoom = useCallback(() => {
    const socket = socketManager.getSocket()

    if (!socket || !socket.connected) {
      console.warn('[FRIENDS_SOCKET] Cannot join room - socket not connected')
      return false
    }

    const deviceFingerprint = socketManager.getCurrentDeviceFingerprint()
    console.log('[FRIENDS_SOCKET] Joining friends room...')
    socket.emit('friends:joinRoom', { deviceFingerprint })
    return true
  }, [])

  /**
   * Check online status for specific friends
   */
  const checkFriendsOnlineStatus = useCallback(friendIds => {
    if (!Array.isArray(friendIds) || friendIds.length === 0) {
      return false
    }

    const socket = socketManager.getSocket()
    if (!socket || !socket.connected) {
      console.warn(
        '[FRIENDS_SOCKET] Cannot check online status - socket not connected',
      )
      return false
    }

    console.log(
      '[FRIENDS_SOCKET] Checking online status for friends:',
      friendIds,
    )
    socket.emit('friends:checkOnlineStatus', { friendIds })
    return true
  }, [])

  /**
   * Request friends list update
   */
  const requestFriendsUpdate = useCallback(() => {
    const socket = socketManager.getSocket()

    if (!socket || !socket.connected) {
      // Fallback to Redux refresh if socket not available
      console.log('[FRIENDS_SOCKET] Socket not connected, using Redux refresh')
      dispatch(fetchFriends())
      dispatch(fetchFriendRequests())
      return
    }

    console.log('[FRIENDS_SOCKET] Requesting friends update via socket')
    socket.emit('friends:requestUpdate', {
      deviceFingerprint: socketManager.getCurrentDeviceFingerprint(),
    })
  }, [dispatch])

  // =========================================
  // CHAT-SPECIFIC FUNCTIONS
  // =========================================

  const joinConversation = useCallback(conversationId => {
    if (!conversationId) return false

    const socket = socketManager.getSocket()
    if (!socket || !socket.connected) {
      console.warn(
        '[FRIENDS_SOCKET] Cannot join conversation - socket not connected',
      )
      return false
    }

    console.log('[FRIENDS_SOCKET] Joining conversation:', conversationId)
    socket.emit('friends:joinConversation', { conversationId })
    return true
  }, [])

  const leaveConversation = useCallback(conversationId => {
    if (!conversationId) return false

    const socket = socketManager.getSocket()
    if (!socket || !socket.connected) {
      return false
    }

    console.log('[FRIENDS_SOCKET] Leaving conversation:', conversationId)
    socket.emit('friends:leaveConversation', { conversationId })
    return true
  }, [])

  const sendTypingIndicator = useCallback((conversationId, isTyping) => {
    if (!conversationId) return false

    const socket = socketManager.getSocket()
    if (!socket || !socket.connected) {
      return false
    }

    socket.emit('friends:typing', { conversationId, isTyping })
    return true
  }, [])

  const markMessageDelivered = useCallback((messageId, conversationId) => {
    if (!messageId || !conversationId) return false

    const socket = socketManager.getSocket()
    if (!socket || !socket.connected) {
      return false
    }

    socket.emit('friends:messageDelivered', { messageId, conversationId })
    return true
  }, [])

  const markMessagesReadSocket = useCallback(
    (conversationId, messageIds = []) => {
      if (!conversationId) return false

      const socket = socketManager.getSocket()
      if (!socket || !socket.connected) {
        return false
      }

      socket.emit('friends:messagesRead', { conversationId, messageIds })
      return true
    },
    [],
  )

  // =========================================
  // LIFECYCLE MANAGEMENT
  // =========================================

  // Setup listeners when socket becomes available and user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    // Listen for socket connection changes from socketManager
    const handleConnectionChange = isConnected => {
      dispatch(setSocketConnected(isConnected))

      if (isConnected && !listenersSetupRef.current) {
        setupEventListeners()

        // Join friends room after a short delay to ensure socket is ready
        setTimeout(() => {
          joinFriendsRoom()
        }, 3000)
      }
    }

    // Add connection listener
    const removeConnectionListener = socketManager.addConnectionListener(
      handleConnectionChange,
    )

    // Check current connection state
    if (socketManager.isConnected() && !listenersSetupRef.current) {
      setupEventListeners()
      setTimeout(() => {
        joinFriendsRoom()
      }, 3000)
    }

    // Cleanup
    return () => {
      console.log('[FRIENDS_SOCKET] Cleaning up listeners')
      removeConnectionListener()

      // Clean up event listeners
      cleanupFunctionsRef.current.forEach(cleanup => cleanup())
      cleanupFunctionsRef.current = []
      listenersSetupRef.current = false
    }
  }, [isAuthenticated, user, setupEventListeners, joinFriendsRoom, dispatch])

  // Update active conversation ref
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  // =========================================
  // RETURN PUBLIC API
  // =========================================

  return {
    // Connection status (from socketManager)
    isConnected: socketManager.isConnected(),
    isConnecting: false, // socketManager handles this internally

    // Friends operations
    checkFriendsOnlineStatus,
    requestFriendsUpdate,
    joinFriendsRoom,

    // Chat operations
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    markMessageDelivered,
    markMessagesReadSocket,

    // Socket instance (if needed for edge cases)
    socket: socketManager.getSocket(),
  }
}

// =========================================
// SPECIALIZED HOOKS FOR SPECIFIC USE CASES
// =========================================

/**
 * Hook for managing chat socket connection for a specific conversation
 * PATTERN: Specialized hooks that build on the main hook
 */
export const useChatSocket = conversationId => {
  const { joinConversation, leaveConversation, isConnected } =
    useFriendsSocket()
  const conversationIdRef = useRef(conversationId)

  useEffect(() => {
    conversationIdRef.current = conversationId

    if (conversationId && isConnected) {
      const joined = joinConversation(conversationId)

      if (joined) {
        return () => {
          if (conversationIdRef.current === conversationId) {
            leaveConversation(conversationId)
          }
        }
      }
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation])

  return {
    isConnected,
    conversationId,
  }
}

/**
 * Hook for managing typing indicators with automatic timeout
 * PATTERN: Encapsulating complex behavior in a specialized hook
 */
export const useTypingIndicator = (conversationId, delay = 1000) => {
  const { sendTypingIndicator } = useFriendsSocket()
  const timeoutRef = useRef(null)

  const startTyping = useCallback(() => {
    if (!conversationId) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Send typing indicator
    sendTypingIndicator(conversationId, true)

    // Auto-stop after delay
    timeoutRef.current = setTimeout(() => {
      sendTypingIndicator(conversationId, false)
    }, delay)
  }, [conversationId, sendTypingIndicator, delay])

  const stopTyping = useCallback(() => {
    if (!conversationId) return

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Send stop typing
    sendTypingIndicator(conversationId, false)
  }, [conversationId, sendTypingIndicator])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { startTyping, stopTyping }
}

export default useFriendsSocket
