import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import appReducer from './appSlice'
import uiReducer from './uiSlice'
import contentReducer from './contentSlice'
import articleReducer from './articleSlice'
import notificationReducer from './notificationSlice'
import quizReducer from './quizSlice'
import gameHubReducer from './gameHubSlice'
import tournamentReducer from './tournamentSlice'
import loadingProgressReducer from './loadingProgressSlice'
import noteMessageSummaryReducer from './noteMessageSummarySlice'
import rewardsReducer from './rewardsSlice'
import demotionSummaryReducer from './demotionSummarySlice'
import inventoryReducer from './inventorySlice'
import quickClashReducer from './quickClashSlice'
import quickClashDailyTasksReducer from './quickClashDailyTasksSlice'
import quickClashTeamBattleReducer from './quickClashTeamBattleSlice'
import quickClashGlobalMatchmakingReducer from './quickClashGlobalMatchmakingSlice'
import quickClashAnalysisReducer from './quickClashAnalysisSlice'
import quickClashProfileReducer from './quickClashProfileSlice'
import quickClashSocketReducer from './quickClashSocketSlice'
import soloDrillReducer from './soloDrillSlice'
import friendsReducer from './friendsSlice'
import friendsChatReducer from './friendsChatSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    ui: uiReducer,
    content: contentReducer,
    articles: articleReducer,
    notifications: notificationReducer,
    quiz: quizReducer,
    gameHub: gameHubReducer,
    tournament: tournamentReducer,
    loadingProgress: loadingProgressReducer,
    noteMessageSummary: noteMessageSummaryReducer,
    rewards: rewardsReducer,
    demotionSummary: demotionSummaryReducer,
    inventory: inventoryReducer,
    quickClash: quickClashReducer,
    quickClashDailyTasks: quickClashDailyTasksReducer,
    quickClashTeamBattle: quickClashTeamBattleReducer,
    quickClashGlobalMatchmaking: quickClashGlobalMatchmakingReducer,
    quickClashAnalysis: quickClashAnalysisReducer,
    quickClashProfile: quickClashProfileReducer,
    quickClashSocket: quickClashSocketReducer,
    soloDrill: soloDrillReducer,
    friends: friendsReducer,
    friendsChat: friendsChatReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Temporarily disable serialization check until we identify root cause
        // The friends slice now handles Set instances defensively
        ignoredPaths: ['friends.pendingRequests'],
      },
    }),
  // Enable Redux DevTools for debugging
  devTools: process.env.NODE_ENV !== 'production',
})
