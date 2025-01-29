import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Fetch demotion summary
export const fetchDemotionSummary = createAsyncThunk(
  'demotionSummary/fetch',
  async () => {
    const response = await axios.get('/api/user/demotion-summary')
    return response.data
  },
)

const demotionSummarySlice = createSlice({
  name: 'demotionSummary',
  initialState: {
    isVisible: false,
    summary: null,
    loading: false,
    error: null,
    expiryDate: null,
  },
  reducers: {
    hideDemotionSummary: state => {
      state.isVisible = false
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDemotionSummary.pending, state => {
        state.loading = true
      })
      .addCase(fetchDemotionSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
        state.isVisible = action.payload.isVisible
        state.expiryDate = action.payload.expiryDate
      })
      .addCase(fetchDemotionSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { hideDemotionSummary } = demotionSummarySlice.actions
export default demotionSummarySlice.reducer
