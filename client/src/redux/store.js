import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import appReducer from './appSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    ui: uiReducer,
  },
})
