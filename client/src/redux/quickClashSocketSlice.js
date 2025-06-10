// redux/quickClashSocketSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Socket connection state
  isConnected: false,
  isListening: false,
  isInitialized: false,
  deviceFingerprint: null,

  // Room states
  rooms: {
    quickClash: false, // Solo challenges room
    teams: false, // Team events room
    matchmaking: false, // 1v1 matchmaking room
  },

  // Socket events tracking
  lastEvent: null,
  eventHistory: [],

  // Connection stats
  connectionStats: {
    connectedAt: null,
    disconnectedAt: null,
    reconnectCount: 0,
    eventCount: 0,
  },

  // Error states
  connectionError: null,
  socketError: null,
}

const quickClashSocketSlice = createSlice({
  name: 'quickClashSocket',
  initialState,
  reducers: {
    // Socket connection management
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload
      if (action.payload) {
        state.connectionStats.connectedAt = new Date().toISOString()
        state.connectionError = null
      } else {
        state.connectionStats.disconnectedAt = new Date().toISOString()
        // Reset room states on disconnect
        state.rooms = {
          quickClash: false,
          teams: false,
          matchmaking: false,
        }
      }
    },

    setSocketListening: (state, action) => {
      state.isListening = action.payload
    },

    setSocketInitialized: (state, action) => {
      state.isInitialized = action.payload
    },

    setDeviceFingerprint: (state, action) => {
      state.deviceFingerprint = action.payload
    },

    // Room management
    setRoomJoined: (state, action) => {
      const { roomName, joined } = action.payload
      if (state.rooms.hasOwnProperty(roomName)) {
        state.rooms[roomName] = joined
      }
    },

    // Event tracking
    addSocketEvent: (state, action) => {
      const event = {
        ...action.payload,
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random(),
      }

      state.lastEvent = event
      state.eventHistory.unshift(event)

      // Keep only last 50 events
      if (state.eventHistory.length > 50) {
        state.eventHistory = state.eventHistory.slice(0, 50)
      }

      state.connectionStats.eventCount += 1
    },

    // Connection stats
    incrementReconnectCount: state => {
      state.connectionStats.reconnectCount += 1
    },

    // Error management
    setConnectionError: (state, action) => {
      state.connectionError = action.payload
    },

    setSocketError: (state, action) => {
      state.socketError = action.payload
    },

    clearErrors: state => {
      state.connectionError = null
      state.socketError = null
    },

    // Reset state
    resetSocketState: state => {
      return {
        ...initialState,
        deviceFingerprint: state.deviceFingerprint, // Keep device fingerprint
      }
    },

    // Clear event history
    clearEventHistory: state => {
      state.eventHistory = []
      state.lastEvent = null
      state.connectionStats.eventCount = 0
    },
  },
})

export const {
  setSocketConnected,
  setSocketListening,
  setSocketInitialized,
  setDeviceFingerprint,
  setRoomJoined,
  addSocketEvent,
  incrementReconnectCount,
  setConnectionError,
  setSocketError,
  clearErrors,
  resetSocketState,
  clearEventHistory,
} = quickClashSocketSlice.actions

export default quickClashSocketSlice.reducer
