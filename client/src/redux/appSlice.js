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

const initialState = {
  updates: [],
  streak: 0,
  longestStreak: 0,
  isBoosted: false,
  unreadFriendRequests: 0,
  status: 'idle',
  error: null,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateUnreadFriendRequests: (state, action) => {
      state.unreadFriendRequests = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAppUpdates.fulfilled, (state, action) => {
        state.updates = action.payload
        state.status = 'succeeded'
      })
      .addCase(fetchDailyStreak.fulfilled, (state, action) => {
        state.streak = action.payload.streak
        state.longestStreak = action.payload.longestStreak
        state.isBoosted = action.payload.isBoosted
        state.status = 'succeeded'
      })
      .addCase(fetchUnreadFriendRequestsCount.fulfilled, (state, action) => {
        state.unreadFriendRequests = action.payload
        state.status = 'succeeded'
      })
      .addMatcher(
        action => action.type.endsWith('/pending'),
        state => {
          state.status = 'loading'
        },
      )
      .addMatcher(
        action => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed'
          state.error = action.error.message
        },
      )
  },
})

export const { updateUnreadFriendRequests } = appSlice.actions

export default appSlice.reducer
