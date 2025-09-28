// src/redux/friendsChatSlice.js - FIXED: Enhanced message deduplication and better optimistic updates
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Helper functions for API calls with error handling
const createApiCall = (url, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout for chat

  return axios({
    ...options,
    url,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId))
}

const withRetry = async (apiCall, maxRetries = 1) => {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error

      // Don't retry on client errors (4xx) except 408, 429
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (![408, 429].includes(error.response.status)) {
          throw error
        }
      }

      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        )
      }
    }
  }

  throw lastError
}

// ===========================================
// ASYNC THUNKS FOR CHAT OPERATIONS
// ===========================================

// Fetch all conversations for user
export const fetchConversations = createAsyncThunk(
  'friendsChat/fetchConversations',
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall('/api/friends/chat/conversations'),
      )
      return response.data
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch conversations',
      )
    }
  },
)

// Get or create conversation with friend
export const getOrCreateConversation = createAsyncThunk(
  'friendsChat/getOrCreateConversation',
  async ({ friendId }, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall('/api/friends/chat/conversation', {
          method: 'POST',
          data: { friendId },
        }),
      )
      return response.data
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get conversation',
      )
    }
  },
)

// Fetch messages for a conversation
export const fetchMessages = createAsyncThunk(
  'friendsChat/fetchMessages',
  async (
    { conversationId, limit = 30, before },
    { rejectWithValue, signal },
  ) => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (before) params.append('before', before)

      const response = await withRetry(() =>
        createApiCall(
          `/api/friends/chat/conversation/${conversationId}/messages?${params}`,
        ),
      )
      return { ...response.data, conversationId }
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch messages',
      )
    }
  },
)

// Send a message
export const sendMessage = createAsyncThunk(
  'friendsChat/sendMessage',
  async ({ conversationId, content }, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall(
          `/api/friends/chat/conversation/${conversationId}/message`,
          {
            method: 'POST',
            data: { content },
          },
        ),
      )
      return { ...response.data, conversationId }
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send message',
      )
    }
  },
)

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  'friendsChat/markMessagesAsRead',
  async ({ conversationId }, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall(`/api/friends/chat/conversation/${conversationId}/read`, {
          method: 'POST',
        }),
      )
      return { ...response.data, conversationId }
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark messages as read',
      )
    }
  },
)

// Delete a message
export const deleteMessage = createAsyncThunk(
  'friendsChat/deleteMessage',
  async ({ messageId, conversationId }, { rejectWithValue, signal }) => {
    try {
      const response = await withRetry(() =>
        createApiCall(`/api/friends/chat/message/${messageId}`, {
          method: 'DELETE',
        }),
      )
      return { ...response.data, messageId, conversationId }
    } catch (error) {
      if (signal?.aborted) {
        return rejectWithValue('Request was cancelled')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete message',
      )
    }
  },
)

// ===========================================
// HELPER FUNCTIONS FOR MESSAGE MANAGEMENT
// ===========================================

// FIXED: Enhanced message deduplication helper
const addMessageWithDeduplication = (messageArray, newMessage) => {
  // Ensure messageArray is always an array
  if (!Array.isArray(messageArray)) {
    console.warn(
      '[CHAT_SLICE] messageArray is not an array, initializing as empty array',
    )
    messageArray = []
  }

  // Check for exact duplicates by ID
  const existingIndex = messageArray.findIndex(m => m._id === newMessage._id)

  if (existingIndex !== -1) {
    // Message already exists - update it if newer or more complete
    const existingMessage = messageArray[existingIndex]

    // Replace if new message has more recent timestamp or better status
    const shouldReplace =
      new Date(newMessage.createdAt || newMessage.updatedAt) >
        new Date(existingMessage.createdAt || existingMessage.updatedAt) ||
      (newMessage.status && newMessage.status !== 'sending')

    if (shouldReplace) {
      const updatedArray = [...messageArray]
      updatedArray[existingIndex] = { ...existingMessage, ...newMessage }
      console.log('[CHAT_SLICE] Updated existing message:', newMessage._id)
      return updatedArray
    } else {
      console.log('[CHAT_SLICE] Skipped duplicate message:', newMessage._id)
      return messageArray
    }
  }

  // New message - add to array
  console.log('[CHAT_SLICE] Adding new message:', newMessage._id)
  return [...messageArray, newMessage]
}

// FIXED: Helper to remove optimistic messages (renamed to avoid conflict)
const removeOptimisticMessageFromArray = (messageArray, tempId) => {
  if (!Array.isArray(messageArray)) {
    console.warn(
      '[CHAT_SLICE] messageArray is not an array in removeOptimisticMessageFromArray',
    )
    return []
  }
  return messageArray.filter(m => m._id !== tempId)
}

// FIXED: Helper to replace optimistic messages seamlessly (renamed to avoid conflict)
const replaceOptimisticMessageInArray = (messageArray, tempId, realMessage) => {
  if (!Array.isArray(messageArray)) {
    console.warn(
      '[CHAT_SLICE] messageArray is not an array in replaceOptimisticMessageInArray',
    )
    return [realMessage]
  }

  const tempIndex = messageArray.findIndex(m => m._id === tempId)
  if (tempIndex !== -1) {
    const updatedArray = [...messageArray]
    // FIXED: Keep the same _id to avoid React re-rendering/animations
    updatedArray[tempIndex] = {
      ...realMessage,
      _id: tempId, // Keep the optimistic ID to maintain React key stability
      realId: realMessage._id, // Store the real ID for reference
      isOptimistic: false, // Mark as no longer optimistic
    }
    console.log('[CHAT_SLICE] Seamlessly updated optimistic message:', tempId)
    return updatedArray
  }

  // If temp message not found, just add the real message
  console.log(
    '[CHAT_SLICE] Temp message not found, adding real message:',
    realMessage._id,
  )
  return addMessageWithDeduplication(messageArray, realMessage)
}

// ===========================================
// INITIAL STATE
// ===========================================

const initialState = {
  // Conversations data
  conversations: [], // List of user's conversations
  activeConversationId: null, // Currently active conversation

  // Messages data
  messages: {}, // Map of conversationId -> messages array
  hasMoreMessages: {}, // Map of conversationId -> boolean

  // Loading states
  loading: {
    conversations: false,
    messages: false,
    sendMessage: false,
    markAsRead: false,
    deleteMessage: false,
    createConversation: false,
  },

  // Error states
  error: {
    conversations: null,
    messages: null,
    sendMessage: null,
    markAsRead: null,
    deleteMessage: null,
    createConversation: null,
  },

  // UI states
  typingUsers: {}, // Map of conversationId -> array of typing user IDs
  unreadCounts: {}, // Map of conversationId -> unread count
  isInConversationRoom: false, // Whether user is in active conversation room

  // Socket connection state
  socketConnected: false,

  // Performance optimization
  lastFetch: {
    conversations: null,
    messages: {}, // Map of conversationId -> timestamp
  },

  // FIXED: Enhanced draft messages and optimistic updates tracking
  draftMessages: {}, // Map of conversationId -> draft content
  optimisticMessages: [], // Track optimistic message IDs for cleanup (array for Redux serialization)
}

// ===========================================
// REDUX SLICE
// ===========================================

const friendsChatSlice = createSlice({
  name: 'friendsChat',
  initialState,
  reducers: {
    // ===========================================
    // SOCKET EVENT HANDLERS - FIXED
    // ===========================================

    // FIXED: Enhanced new message handler with deduplication
    handleNewMessage: (state, action) => {
      const { conversationId, message } = action.payload

      // Initialize messages array if not exists
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = []
      }

      // FIXED: Use enhanced deduplication
      state.messages[conversationId] = addMessageWithDeduplication(
        state.messages[conversationId],
        message,
      )

      // Update conversation in list
      const conversation = state.conversations.find(
        c => c._id === conversationId,
      )
      if (conversation) {
        conversation.lastMessage = message
        conversation.lastMessageAt = message.createdAt

        // Increment unread count if not in active conversation
        if (state.activeConversationId !== conversationId) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1
          state.unreadCounts[conversationId] = conversation.unreadCount
        }
      }

      // Sort conversations by last message time
      state.conversations.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
      )
    },

    handleMessageStatusUpdate: (state, action) => {
      const { messageId, status, conversationId } = action.payload

      if (state.messages[conversationId]) {
        const message = state.messages[conversationId].find(
          m => m._id === messageId,
        )
        if (message) {
          message.status = status
          console.log(
            '[CHAT_SLICE] Updated message status:',
            messageId,
            '→',
            status,
          )
        }
      }
    },

    handleMessagesRead: (state, action) => {
      const { conversationId, readerId, messageIds } = action.payload

      if (state.messages[conversationId]) {
        messageIds.forEach(messageId => {
          const message = state.messages[conversationId].find(
            m => m._id === messageId,
          )
          if (message) {
            message.status = 'read'
            if (!message.readBy) message.readBy = []

            const alreadyRead = message.readBy.some(
              read => read.user._id === readerId,
            )
            if (!alreadyRead) {
              message.readBy.push({
                user: { _id: readerId },
                readAt: new Date().toISOString(),
              })
            }
          }
        })
      }
    },

    handleMessageDeleted: (state, action) => {
      const { conversationId, messageId } = action.payload

      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter(
          m => m._id !== messageId,
        )
        console.log('[CHAT_SLICE] Removed deleted message:', messageId)
      }
    },

    handleUserTyping: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = []
      }

      const typingArray = state.typingUsers[conversationId]
      const userIndex = typingArray.indexOf(userId)

      if (isTyping && userIndex === -1) {
        typingArray.push(userId)
      } else if (!isTyping && userIndex !== -1) {
        typingArray.splice(userIndex, 1)
      }
    },

    // ===========================================
    // UI STATE MANAGEMENT
    // ===========================================

    setActiveConversation: (state, action) => {
      const conversationId = action.payload
      state.activeConversationId = conversationId

      // Reset unread count for active conversation
      if (conversationId) {
        const conversation = state.conversations.find(
          c => c._id === conversationId,
        )
        if (conversation) {
          conversation.unreadCount = 0
          state.unreadCounts[conversationId] = 0
        }
      }
    },

    clearActiveConversation: state => {
      state.activeConversationId = null
      state.isInConversationRoom = false
    },

    setInConversationRoom: (state, action) => {
      state.isInConversationRoom = action.payload
    },

    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },

    // Draft message management
    setDraftMessage: (state, action) => {
      const { conversationId, content } = action.payload
      state.draftMessages[conversationId] = content
    },

    clearDraftMessage: (state, action) => {
      const conversationId = action.payload
      delete state.draftMessages[conversationId]
    },

    // Error management
    clearError: (state, action) => {
      const errorType = action.payload
      if (state.error[errorType]) {
        state.error[errorType] = null
      }
    },

    clearAllErrors: state => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null
      })
    },

    // FIXED: Enhanced optimistic message updates
    addOptimisticMessage: (state, action) => {
      const { conversationId, message } = action.payload

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = []
      }

      // Create optimistic message with unique temp ID
      const optimisticMessage = {
        ...message,
        _id:
          message._id ||
          `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'sent', // FIXED: Show as sent immediately instead of sending
        createdAt: new Date().toISOString(),
        isOptimistic: true, // FIXED: Mark as optimistic for tracking
      }

      // Add to optimistic messages tracking
      if (!state.optimisticMessages.includes(optimisticMessage._id)) {
        state.optimisticMessages.push(optimisticMessage._id)
      }

      // FIXED: Use deduplication helper
      state.messages[conversationId] = addMessageWithDeduplication(
        state.messages[conversationId],
        optimisticMessage,
      )

      // Update conversation
      const conversation = state.conversations.find(
        c => c._id === conversationId,
      )
      if (conversation) {
        conversation.lastMessage = optimisticMessage
        conversation.lastMessageAt = optimisticMessage.createdAt
      }

      console.log(
        '[CHAT_SLICE] Added optimistic message:',
        optimisticMessage._id,
      )
    },

    // FIXED: Enhanced optimistic message replacement
    replaceOptimisticMessage: (state, action) => {
      const { conversationId, tempId, realMessage } = action.payload

      if (
        state.messages[conversationId] &&
        Array.isArray(state.messages[conversationId])
      ) {
        // FIXED: Use renamed helper function for replacement
        state.messages[conversationId] = replaceOptimisticMessageInArray(
          state.messages[conversationId],
          tempId,
          realMessage,
        )

        // Remove from optimistic tracking
        state.optimisticMessages = state.optimisticMessages.filter(
          id => id !== tempId,
        )

        // Update conversation last message if it was the optimistic one
        const conversation = state.conversations.find(
          c => c._id === conversationId,
        )
        if (conversation && conversation.lastMessage?._id === tempId) {
          // FIXED: Keep the same ID but update with real message data
          conversation.lastMessage = {
            ...realMessage,
            _id: tempId, // Keep optimistic ID for consistency
            realId: realMessage._id, // Store real ID
          }
          conversation.lastMessageAt = realMessage.createdAt
        }

        console.log(
          '[CHAT_SLICE] Replaced optimistic message:',
          tempId,
          '→',
          realMessage._id,
        )
      } else {
        console.warn(
          '[CHAT_SLICE] Cannot replace optimistic message - messages array not found or not array',
        )
        // Initialize messages and add the real message
        state.messages[conversationId] = [realMessage]
        state.optimisticMessages = state.optimisticMessages.filter(
          id => id !== tempId,
        )
      }
    },

    // FIXED: Enhanced optimistic message removal
    removeOptimisticMessage: (state, action) => {
      const { conversationId, tempId } = action.payload

      if (
        state.messages[conversationId] &&
        Array.isArray(state.messages[conversationId])
      ) {
        // FIXED: Use renamed helper function for removal
        state.messages[conversationId] = removeOptimisticMessageFromArray(
          state.messages[conversationId],
          tempId,
        )

        // Remove from optimistic tracking
        state.optimisticMessages = state.optimisticMessages.filter(
          id => id !== tempId,
        )

        console.log('[CHAT_SLICE] Removed failed optimistic message:', tempId)
      } else {
        console.warn(
          '[CHAT_SLICE] Cannot remove optimistic message - messages array not found or not array',
        )
        // Just remove from tracking
        state.optimisticMessages = state.optimisticMessages.filter(
          id => id !== tempId,
        )
      }
    },

    // FIXED: Cleanup all optimistic messages (for error recovery)
    cleanupOptimisticMessages: (state, action) => {
      const { conversationId } = action.payload

      if (
        state.messages[conversationId] &&
        Array.isArray(state.messages[conversationId])
      ) {
        const beforeCount = state.messages[conversationId].length

        // Remove all optimistic messages
        state.messages[conversationId] = state.messages[conversationId].filter(
          message =>
            !message.isOptimistic &&
            !state.optimisticMessages.includes(message._id),
        )

        const afterCount = state.messages[conversationId].length
        console.log(
          '[CHAT_SLICE] Cleaned up optimistic messages:',
          beforeCount - afterCount,
          'removed',
        )
      } else {
        // Initialize as empty array if not exists or not array
        state.messages[conversationId] = []
        console.log(
          '[CHAT_SLICE] Initialized empty messages array for conversation:',
          conversationId,
        )
      }

      // Clear optimistic tracking
      state.optimisticMessages = []
    },
  },

  // ===========================================
  // ASYNC THUNK HANDLERS
  // ===========================================

  extraReducers: builder => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, state => {
        state.loading.conversations = true
        state.error.conversations = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false
        state.conversations = action.payload.conversations || []
        state.lastFetch.conversations = new Date().toISOString()

        // Update unread counts
        action.payload.conversations?.forEach(conv => {
          state.unreadCounts[conv._id] = conv.unreadCount || 0
        })
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false
        state.error.conversations = action.payload
      })

      // Get/Create Conversation
      .addCase(getOrCreateConversation.pending, state => {
        state.loading.createConversation = true
        state.error.createConversation = null
      })
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        state.loading.createConversation = false
        const conversation = action.payload.conversation

        // Add or update conversation in list
        const existingIndex = state.conversations.findIndex(
          c => c._id === conversation._id,
        )

        if (existingIndex !== -1) {
          state.conversations[existingIndex] = conversation
        } else {
          state.conversations.unshift(conversation)
        }

        state.unreadCounts[conversation._id] = conversation.unreadCount || 0
      })
      .addCase(getOrCreateConversation.rejected, (state, action) => {
        state.loading.createConversation = false
        state.error.createConversation = action.payload
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, state => {
        state.loading.messages = true
        state.error.messages = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false
        const { conversationId, messages, hasMore } = action.payload

        // FIXED: Better message loading logic with deduplication
        if (
          !state.messages[conversationId] ||
          state.messages[conversationId].length === 0
        ) {
          // Loading initial messages - replace array
          state.messages[conversationId] = messages || []
        } else {
          // Loading more messages - prepend with deduplication
          const existingMessages = state.messages[conversationId]
          const newMessages = (messages || []).reverse() // Reverse to process oldest first

          let updatedMessages = [...existingMessages]

          // Add each new message with deduplication
          newMessages.forEach(newMessage => {
            updatedMessages = addMessageWithDeduplication(
              updatedMessages,
              newMessage,
            )
          })

          // Sort by creation time to maintain order
          updatedMessages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          )

          state.messages[conversationId] = updatedMessages
        }

        state.hasMoreMessages[conversationId] = hasMore
        state.lastFetch.messages[conversationId] = new Date().toISOString()

        console.log(
          '[CHAT_SLICE] Loaded messages for conversation:',
          conversationId,
          'Total:',
          state.messages[conversationId]?.length,
        )
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false
        state.error.messages = action.payload
      })

      // Send Message
      .addCase(sendMessage.pending, state => {
        state.loading.sendMessage = true
        state.error.sendMessage = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sendMessage = false
        // The optimistic message will be replaced via socket event or replacement action
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sendMessage = false
        state.error.sendMessage = action.payload

        // FIXED: Clean up failed optimistic messages
        const failedOptimisticMessages = [...state.optimisticMessages] // Array copy
        failedOptimisticMessages.forEach(tempId => {
          const conversationId = Object.keys(state.messages).find(
            convId =>
              state.messages[convId] &&
              Array.isArray(state.messages[convId]) &&
              state.messages[convId].some(m => m._id === tempId),
          )
          if (conversationId) {
            state.messages[conversationId] = removeOptimisticMessageFromArray(
              state.messages[conversationId],
              tempId,
            )
            state.optimisticMessages = state.optimisticMessages.filter(
              id => id !== tempId,
            )
          } else {
            // Just remove from tracking if conversation not found
            state.optimisticMessages = state.optimisticMessages.filter(
              id => id !== tempId,
            )
          }
        })
      })

      // Mark as Read
      .addCase(markMessagesAsRead.pending, state => {
        state.loading.markAsRead = true
        state.error.markAsRead = null
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.loading.markAsRead = false
        const { conversationId } = action.payload

        // Reset unread count
        const conversation = state.conversations.find(
          c => c._id === conversationId,
        )
        if (conversation) {
          conversation.unreadCount = 0
          state.unreadCounts[conversationId] = 0
        }
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.loading.markAsRead = false
        state.error.markAsRead = action.payload
      })

      // Delete Message
      .addCase(deleteMessage.pending, state => {
        state.loading.deleteMessage = true
        state.error.deleteMessage = null
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading.deleteMessage = false
        // Message removal will be handled by socket event
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading.deleteMessage = false
        state.error.deleteMessage = action.payload
      })
  },
})

// ===========================================
// ACTIONS EXPORT
// ===========================================

export const {
  handleNewMessage,
  handleMessageStatusUpdate,
  handleMessagesRead,
  handleMessageDeleted,
  handleUserTyping,
  setActiveConversation,
  clearActiveConversation,
  setInConversationRoom,
  setSocketConnected,
  setDraftMessage,
  clearDraftMessage,
  clearError,
  clearAllErrors,
  addOptimisticMessage,
  replaceOptimisticMessage,
  removeOptimisticMessage,
  cleanupOptimisticMessages, // FIXED: Added cleanup action
} = friendsChatSlice.actions

export default friendsChatSlice.reducer
