import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isAuthenticated: false,
  forgotPassword: false,
  verifyEmail: false,
  loginCheckStatus: 'pending',
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.loginCheckStatus = 'fulfilled'
    },
    logout: state => {
      state.user = null
      state.isAuthenticated = false
    },
    setForgotPassword: (state, action) => {
      state.forgotPassword = action.payload
    },
    setVerifyEmail: (state, action) => {
      state.verifyEmail = action.payload
    },
  },
})

export const { setUser, logout, setForgotPassword, setVerifyEmail } =
  authSlice.actions

export default authSlice.reducer
