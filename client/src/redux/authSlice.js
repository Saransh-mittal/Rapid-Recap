import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export const verifyAdminStatus = createAsyncThunk(
  'auth/verifyAdminStatus',
  async () => {
    try {
      const response = await axios.get('/api/admin/verify-admin', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      return response.data.isAdmin
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  },
)

const initialState = {
  user: null,
  isAuthenticated: false,
  forgotPassword: false,
  verifyEmail: false,
  loginCheckStatus: 'pending',
  isAdmin: false,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsAdmin: (state, action) => {
      state.isAdmin = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.loginCheckStatus = 'fulfilled'
    },
    logout: () => {
      return initialState
    },
    setForgotPassword: (state, action) => {
      state.forgotPassword = action.payload
    },
    setVerifyEmail: (state, action) => {
      state.verifyEmail = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(verifyAdminStatus.pending, state => {
        state.isAdmin = false
      })
      .addCase(verifyAdminStatus.fulfilled, (state, action) => {
        state.isAdmin = action.payload
      })
      .addCase(verifyAdminStatus.rejected, (state, action) => {
        state.isAdmin = false
        state.error = action.payload
      })
  },
})

export const {
  setUser,
  logout: logoutAuth,
  setForgotPassword,
  setVerifyEmail,
  setIsAdmin,
} = authSlice.actions

export default authSlice.reducer
