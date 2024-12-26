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
  },
})
