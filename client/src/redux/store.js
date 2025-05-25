import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import appReducer from './appSlice'
import uiReducer from './uiSlice'
import contentReducer from './contentSlice'
import articleReducer from './articleSlice'
import notificationReducer from './notificationSlice'
import quizReducer from './quizSlice'
import tournamentReducer from './tournamentSlice'
import loadingProgressReducer from './loadingProgressSlice'
import noteMessageSummaryReducer from './noteMessageSummarySlice'
import rewardsReducer from './rewardsSlice'
import demotionSummaryReducer from './demotionSummarySlice'
import inventoryReducer from './inventorySlice'
import quickClashReducer from './quickClashSlice'
import quickClashMatchmakingReducer from './quickClashMatchmakingSlice'
import quickClashDailyTasksReducer from './quickClashDailyTasksSlice'
import quickClashTeamBattleReducer from './quickClashTeamBattleSlice'
import quickClashGlobalMatchmakingReducer from './quickClashGlobalMatchmakingSlice'
import quickClashAnalysisReducer from './quickClashAnalysisSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    ui: uiReducer,
    content: contentReducer,
    articles: articleReducer,
    notifications: notificationReducer,
    quiz: quizReducer,
    tournament: tournamentReducer,
    loadingProgress: loadingProgressReducer,
    noteMessageSummary: noteMessageSummaryReducer,
    rewards: rewardsReducer,
    demotionSummary: demotionSummaryReducer,
    inventory: inventoryReducer,
    quickClash: quickClashReducer,
    quickClashMatchmaking: quickClashMatchmakingReducer,
    quickClashDailyTasks: quickClashDailyTasksReducer,
    quickClashTeamBattle: quickClashTeamBattleReducer,
    quickClashGlobalMatchmaking: quickClashGlobalMatchmakingReducer,
    quickClashAnalysis: quickClashAnalysisReducer,
  },
})
