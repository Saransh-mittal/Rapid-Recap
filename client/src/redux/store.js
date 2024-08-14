import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import appReducer from './appSlice'
import uiReducer from './uiSlice'
import contentReducer from './contentSlice'
import articleReducer from './articleSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    ui: uiReducer,
    content: contentReducer,
    articles: articleReducer,
  },
})
