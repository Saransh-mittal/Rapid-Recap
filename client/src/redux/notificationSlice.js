// src/redux/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import {
  isSupported as notifSupported,
  sendSubscriptionToBackend,
  urlBase64ToUint8Array,
} from '../utils/notif.utils'

// Thunk to check the notification status
export const checkNotificationStatus = createAsyncThunk(
  'notifications/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const isSupported = notifSupported
      if (!isSupported) return { supported: false, isSubscribed: false }

      const permission = Notification.permission
      const serviceWorker = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })
      const subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BMtN9qkLo6TLtMK1erTFjiH_2Ivu9qd9cLpq3Cyiq0e8FHiDHtB022jiOB9d3HoocouCVUf6-scRF08RDzZ_kLY',
        ),
      })
      sendSubscriptionToBackend(subscription)
      return { supported: true, isSubscribed: permission === 'granted' }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const isSubscribedChecker = createAsyncThunk(
  'notifications/isSubscribed',
  async (_, { rejectWithValue }) => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        return { isSubscribed: false }
      }

      const response = await axios.post('/api/subs/check', subscription)

      const data = response.data

      if (data.isSubscribed) {
        return { isSubscribed: true }
      }
      return { isSubscribed: false }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Thunk to enable notifications
export const enableNotifications = createAsyncThunk(
  'notifications/enable',
  async (_, { rejectWithValue }) => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        return { isSubscribed: false, showInstructions: true }
      }

      const serviceWorker = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      const subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BMtN9qkLo6TLtMK1erTFjiH_2Ivu9qd9cLpq3Cyiq0e8FHiDHtB022jiOB9d3HoocouCVUf6-scRF08RDzZ_kLY',
        ),
      })

      const response = await sendSubscriptionToBackend(subscription)
      if (response.ok) {
        return { isSubscribed: true }
      }

      return { isSubscribed: false }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    showInstructions: false,
    supported: true,

    loading: false,
    isSubscribed: false,
    error: null,
  },
  reducers: {
    resetStatus: state => {
      state.isSubscribed = false
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(checkNotificationStatus.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(checkNotificationStatus.fulfilled, (state, action) => {
        state.loading = false
        state.supported = action.payload.supported
        state.isSubscribed = action.payload.isSubscribed
      })
      .addCase(checkNotificationStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(enableNotifications.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(enableNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.isSubscribed = action.payload.isSubscribed
        state.showInstructions = action.payload.showInstructions
      })
      .addCase(enableNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(isSubscribedChecker.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(isSubscribedChecker.fulfilled, (state, action) => {
        state.loading = false
        state.isSubscribed = action.payload.isSubscribed
      })
      .addCase(isSubscribedChecker.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetStatus } = notificationSlice.actions

export default notificationSlice.reducer
