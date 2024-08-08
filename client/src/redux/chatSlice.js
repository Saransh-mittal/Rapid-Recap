import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { useSocket } from '../customHooks/useSocket'

// Async thunk actions
export const getInitialNotificationCount = createAsyncThunk(
  'chat/getInitialNotificationCount',
  async () => {
    const { data } = await axios.get('/api/notify/new-message-chats')
    return data.unreadChats
  },
)

const initialState = {
  selectedChat: null,
  user: null,
  notification: [],
  chats: [],
  messagesFetched: false,
  hasMore: true,
  chatRequests: [],
  isChatOpen: false,
  routeCount: 0,
  isLastRoute: false,
  fetchAgain: false,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
    setNotification: (state, action) => {
      state.notification = action.payload
    },
    setChats: (state, action) => {
      state.chats = action.payload
    },
    updateLatestMessage: (state, action) => {
      // Implement the logic to update the latest message in the chats
    },
    setMessagesFetched: (state, action) => {
      state.messagesFetched = action.payload
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload
    },
    setChatRequests: (state, action) => {
      state.chatRequests = action.payload
    },
    setIsChatOpen: (state, action) => {
      state.isChatOpen = action.payload
    },
    setRouteCount: (state, action) => {
      state.routeCount = action.payload
    },
    setIsLastRoute: (state, action) => {
      state.isLastRoute = action.payload
    },
    setFetchAgain: (state, action) => {
      state.fetchAgain = action.payload
    },
    setSocket: (state, action) => {
      state.socket = action.payload
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(getInitialNotificationCount.fulfilled, (state, action) => {
      state.notification = action.payload
    })
  },
})

export const {
  setSelectedChat,
  setUser,
  setNotification,
  setChats,
  updateLatestMessage,
  setMessagesFetched,
  setHasMore,
  setChatRequests,
  setIsChatOpen,
  setRouteCount,
  setIsLastRoute,
  setFetchAgain,
  setSocket,
  setSocketConnected,
} = chatSlice.actions

export default chatSlice.reducer
