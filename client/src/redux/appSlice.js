import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_SOUND_SETTINGS } from '../models/soundSettings'
import i18n from 'i18next'
import { addReward } from './rewardsSlice'
import { REWARD_TYPES } from '../components/rewards'

// Add this thunk to your existing thunks
export const addNoteMessageIfAllowed = createAsyncThunk(
  'app/addNoteMessageIfAllowed',
  async (messageData, { getState, dispatch }) => {
    const state = getState()
    const needsOnboarding = state.auth.user?.needsOnboarding

    if (!needsOnboarding) {
      dispatch(addNoteMessage(messageData))
    }
    return null
  },
)
// Async thunks for fetching data
export const fetchAppUpdates = createAsyncThunk(
  'app/fetchAppUpdates',
  async (_, { getState, dispatch }) => {
    const { auth } = getState()
    const { user } = auth
    try {
      const response = await axios.get(`/api/user/getUpdates`)
      // console.log('App updates:', response.data.updates)

      const weeklyReportUpdates = response.data.updates.filter(
        update => update.type === 'weeklyReport' && update.read === false,
      )
      weeklyReportUpdates.sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })

      const weeklyReport = weeklyReportUpdates[0]

      weeklyReport &&
        dispatch(
          addNoteMessageIfAllowed({
            title: 'Weekly Report', // Added translation
            duration: 15000,
            width: '350px',
            content: 'Check out your weekly report to see how you did!', // Added translation
            actions: [
              {
                text: 'View Report',
                actionType: 'INBOX',
                payload: { weeklyReportId: weeklyReport?._id },
              },
            ],
          }),
        )
      return response.data.updates
    } catch (error) {
      console.error('Error fetching app updates:', error)
      // Handle error (e.g., dispatch an error
    }
  },
)

export const fetchDailyStreak = createAsyncThunk(
  'app/fetchDailyStreak',
  async (_, { getState, dispatch }) => {
    const response = await axios.get(`/api/user/streakChecker`)
    // Show streak surge reward if available
    if (response.data.hasUnclaimedStreakSurge) {
      dispatch(
        addReward({
          type: REWARD_TYPES.STREAK_SURGE,
          title: 'Streak Surge Activated!',
          description:
            'Congratulations on your 7-day streak! Get 1.5x boost on all quizzes today.',
          rewards: [
            {
              title: 'Bonus XP',
              amount: `+${response.data.xpAward} XP`,
              color: '#FFB020',
            },
            {
              title: 'RQM Boost',
              amount: `${response.data.multiplier}x Multiplier`,
              color: '#14B8A6',
            },
          ],
        }),
      )
    }
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

export const fetchUnreadNoteMessages = createAsyncThunk(
  'app/fetchUnreadNoteMessages',
  async () => {
    const response = await axios.get('/api/notify/noteMessages')
    return response.data
  },
)

// export weeklyReportInboxNotifications = createAsyncThunk(
//   'app/weeklyReportInboxNotifications',

const initialState = {
  updates: [],
  streak: 0,
  longestStreak: 0,
  isBoosted: false,
  unreadFriendRequests: 0,
  error: null,
  updatesLoading: false,
  updatesFetched: false,
  streakLoading: false,
  streakFetched: false,
  friendRequestsLoading: false,
  friendRequestsFetched: false,
  markingRequestsAsRead: false,
  isSigninOpen: false,
  isRegisterOpen: false,
  showNote: false,
  exportData: null,
  noteMessageQueue: [],
  showingSummaryForNoteMessages: false,
  showXpLevelModal: false,
  isNotifDrawerOpen: false,
  isNotifModalOpen: false,
  isNotifInboxModalOpen: false,
  soundSettings: DEFAULT_SOUND_SETTINGS,
  navigationCount: 0,
  selectedNotificationId: null,
  isWeakDevice: false,
  showIQScoreModal: false,
  showDailyStreakModal: false,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setShowDailyStreakModal: (state, action) => {
      state.showDailyStreakModal = action.payload
    },
    setShowIQScoreModal: (state, action) => {
      state.showIQScoreModal = action.payload
    },
    setStreakLoading: (state, action) => {
      state.streakLoading = action.payload
    },
    updateUnreadFriendRequests: (state, action) => {
      state.unreadFriendRequests = action.payload
    },
    setNavigationCount: (state, action) => {
      state.navigationCount = action.payload
    },
    setUpdates: (state, action) => {
      state.updates = action.payload
    },
    toggleSound: (state, action) => {
      const soundType = action.payload
      state.soundSettings[soundType] = !state.soundSettings[soundType]
    },
    setIsNotifDrawerOpen: (state, action) => {
      state.isNotifDrawerOpen = action.payload
    },
    setIsNotifModalOpen: (state, action) => {
      state.isNotifModalOpen = action.payload
    },

    setIsNotifInboxModalOpen: (state, action) => {
      state.isNotifInboxModalOpen = action.payload
    },
    setShowXpLevelModal: (state, action) => {
      state.showXpLevelModal = action.payload
    },
    resetLoadingFlags: state => {
      state.updatesLoading = false
      state.streakLoading = false
      state.friendRequestsLoading = false
    },
    resetAllState: state => {
      state.updates = []
      state.streak = 0
      state.longestStreak = 0
      state.isBoosted = false
      state.unreadFriendRequests = 0
      state.error = null
      state.updatesLoading = false
      state.streakLoading = false
      state.friendRequestsLoading = false
      state.markingRequestsAsRead = false
    },
    setShowNote: (state, action) => {
      state.showNote = action.payload
    },
    setIsSigninOpen: (state, action) => {
      if (window.location.hash !== '#signin' && action.payload) {
        window.location.hash = 'signin'
      }
      if (!action.payload) {
        window.location.hash = ''
      }
      state.isSigninOpen = action.payload
    },
    setIsRegisterOpen: (state, action) => {
      if (window.location.hash !== '#register' && action.payload) {
        window.location.hash = '#register'
      }
      if (!action.payload) {
        window.location.hash = ''
      }
      state.isRegisterOpen = action.payload
    },
    setExportData: (state, action) => {
      state.exportData = action.payload
    },
    setWeakMode: (state, action) => {
      state.isWeakDevice = action.payload
    },
    addNoteMessage: (state, action) => {
      state.noteMessageQueue.push({
        ...action.payload,
        id: uuidv4(), // Generate a unique ID for each message
        content: action.payload?.content?.toString(),
        actions: action.payload.actions || [],
        messageType: action.payload.messageType || 'default',
      })
    },
    setSoundSettings: (state, action) => {
      state.soundSettings = action.payload
    },
    removeNoteMessageWithId: (state, action) => {
      state.noteMessageQueue = state.noteMessageQueue.filter(
        message => message.id !== action.payload,
      )
    },
    clearNoteMessageQueue: state => {
      state.noteMessageQueue = []
    },
    setSelectedNotificationId: (state, action) => {
      state.selectedNotificationId = action.payload
    },
    setShowingSummaryForNoteMessages: (state, action) => {
      state.showingSummaryForNoteMessages = action.payload
    },
    logout: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAppUpdates.pending, state => {
        state.updatesLoading = true
      })
      .addCase(fetchAppUpdates.fulfilled, (state, action) => {
        state.updates = action.payload
        state.updatesLoading = false
        state.updatesFetched = true
      })
      .addCase(fetchAppUpdates.rejected, (state, action) => {
        state.updatesLoading = false
        state.error = action.error.message
        state.updatesFetched = true
      })
      .addCase(fetchDailyStreak.pending, state => {
        state.streakLoading = true
      })
      .addCase(fetchDailyStreak.fulfilled, (state, action) => {
        state.streak = action.payload.streak
        action.payload?.pastStreak &&
          state.noteMessageQueue.push({
            messageType: 'streak',
            streakStatus: 'broken',
            streakCount: action.payload.pastStreak,
            title:
              i18n.language === 'en'
                ? 'Oh no! Your streak has ended'
                : 'ओह नहीं! आपकी स्ट्रीक समाप्त हो गई है।',
            width: '300px',
          })
        // action.payload?.seven_day_streak &&
        //   state.noteMessageQueue.push({
        //     messageType: 'xpAward',
        //     title:
        //       i18n.language === 'en'
        //         ? 'Congratulations on Your 7-Day Streak!'
        //         : 'आपकी 7-दिन की स्ट्रीक पर बधाई!',
        //     isMilestone: true,
        //     milestoneContent:
        //       i18n.language === 'en'
        //         ? 'Enjoy a 1.5x score multiplier on all quizzes today!'
        //         : 'आज सभी क्विज़ पर 1.5x स्कोर मल्टीप्लायर का आनंद लें!',
        //     width: '300px',
        //     xpAwarded: action.payload?.xpAwarded,
        //     duration: null,
        //   })
        action.payload?.isRevivalPeriod &&
          state.noteMessageQueue.push({
            messageType: 'streak',
            streakStatus: 'revival',
            streakCount: action.payload?.streakBeforeBreak,
            remainingTime: action.payload?.remainingTimeBeforeRevival, // 1 hour in seconds
            remainingQuizzes: 6 - action.payload?.todaysQuizAttemptsCount,
            title:
              i18n.language === 'en'
                ? 'Revive your streak!'
                : 'अपनी स्ट्रीक को फिर से जीवित करें!',
            content:
              i18n.language === 'en'
                ? 'You need to utilize a quin boost in the revival period to revive your streak.'
                : 'आपको अपनी स्ट्रीक को फिर से जीवित करने के लिए पुनर्जीवन अवधि में एक क्विन बूस्ट का उपयोग करना होगा।',
            width: '300px',
            duration: 12000,
          })
        state.longestStreak = action.payload.longestStreak
        state.isBoosted = action.payload.isBoosted
        state.streakLoading = false
        state.streakFetched = true
      })
      .addCase(fetchDailyStreak.rejected, (state, action) => {
        state.streakLoading = false
        state.error = action.error.message
        state.streakFetched = true
      })
      .addCase(fetchUnreadFriendRequestsCount.pending, state => {
        state.friendRequestsLoading = true
      })
      .addCase(fetchUnreadFriendRequestsCount.fulfilled, (state, action) => {
        state.unreadFriendRequests = action.payload
        state.friendRequestsLoading = false
        state.friendRequestsFetched = true
      })
      .addCase(fetchUnreadFriendRequestsCount.rejected, (state, action) => {
        state.friendRequestsLoading = false
        state.error = action.error.message
        state.friendRequestsFetched = true
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
      .addCase(fetchUnreadNoteMessages.fulfilled, (state, action) => {
        action.payload.forEach(message => {
          state.noteMessageQueue.push({
            ...message,
            id: message._id,
            content: message?.content?.toString(),
            actions: message?.actions || [],
            messageType: message?.messageType || 'default',
          })
        })
      })
  },
})

export const {
  updateUnreadFriendRequests,
  resetLoadingFlags,
  setUpdates,
  resetAllState,
  setIsRegisterOpen,
  setIsSigninOpen,
  setStreakLoading,
  setShowNote,
  setExportData,
  addNoteMessage,
  clearNoteMessageQueue,
  setShowingSummaryForNoteMessages,
  removeNoteMessageWithId,
  setShowXpLevelModal,
  setIsNotifDrawerOpen,
  setIsNotifModalOpen,
  toggleSound,
  setWeakMode,
  setSoundSettings,
  setNavigationCount,
  setSelectedNotificationId,
  setIsNotifInboxModalOpen,
  setShowIQScoreModal,
  setShowDailyStreakModal,
  logout: logoutApp,
} = appSlice.actions

export default appSlice.reducer
