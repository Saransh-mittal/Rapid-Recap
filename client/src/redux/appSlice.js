import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks for fetching data
export const fetchAppUpdates = createAsyncThunk(
  'app/fetchAppUpdates',
  async () => {
    const response = await axios.get(`/api/user/getUpdates`)
    return response.data.updates
  },
)

export const fetchDailyStreak = createAsyncThunk(
  'app/fetchDailyStreak',
  async () => {
    const response = await axios.get(`/api/user/streakChecker`)
    return response.data
  },
)

export const fetchUnreadFriendRequestsCount = createAsyncThunk(
  'app/fetchUnreadFriendRequestsCount',
  async () => {
    const response = await axios.get(`/api/friends/unread-requests-count`)
    return response.data.unreadCount
  },
)

export const markFriendRequestsAsRead = createAsyncThunk(
  'app/markFriendRequestsAsRead',
  async () => {
    await axios.post('/api/friends/request-mark-as-read')
    return 0 // Return 0 as there are no more unread requests
  },
)

const initialState = {
  updates: [],
  streak: 0,
  longestStreak: 0,
  isBoosted: false,
  unreadFriendRequests: 0,
  error: null,
  updatesLoading: false,
  streakLoading: false,
  friendRequestsLoading: false,
  markingRequestsAsRead: false,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateUnreadFriendRequests: (state, action) => {
      state.unreadFriendRequests = action.payload
    },
    setUpdates: (state, action) => {
      state.updates = action.payload
    },
    resetLoadingFlags: state => {
      state.updatesLoading = false
      state.streakLoading = false
      state.friendRequestsLoading = false
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAppUpdates.pending, state => {
        state.updatesLoading = true
      })
      .addCase(fetchAppUpdates.fulfilled, (state, action) => {
        state.updates = action.payload
        state.updatesLoading = false
      })
      .addCase(fetchAppUpdates.rejected, (state, action) => {
        state.updatesLoading = false
        state.error = action.error.message
      })
      .addCase(fetchDailyStreak.pending, state => {
        state.streakLoading = true
      })
      .addCase(fetchDailyStreak.fulfilled, (state, action) => {
        state.streak = action.payload.streak
        state.longestStreak = action.payload.longestStreak
        state.isBoosted = action.payload.isBoosted
        state.streakLoading = false
      })
      .addCase(fetchDailyStreak.rejected, (state, action) => {
        state.streakLoading = false
        state.error = action.error.message
      })
      .addCase(fetchUnreadFriendRequestsCount.pending, state => {
        state.friendRequestsLoading = true
      })
      .addCase(fetchUnreadFriendRequestsCount.fulfilled, (state, action) => {
        state.unreadFriendRequests = action.payload
        state.friendRequestsLoading = false
      })
      .addCase(fetchUnreadFriendRequestsCount.rejected, (state, action) => {
        state.friendRequestsLoading = false
        state.error = action.error.message
      })
      .addCase(markFriendRequestsAsRead.pending, state => {
        state.markingRequestsAsRead = true
      })
      .addCase(markFriendRequestsAsRead.fulfilled, (state, action) => {
        state.unreadFriendRequests = action.payload
        state.markingRequestsAsRead = false
      })
      .addCase(markFriendRequestsAsRead.rejected, state => {
        state.markingRequestsAsRead = false
        // Optionally handle error state here
      })
  },
})

export const { updateUnreadFriendRequests, resetLoadingFlags, setUpdates } =
  appSlice.actions

export default appSlice.reducer
