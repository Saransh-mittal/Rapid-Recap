import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const searchArticles = createAsyncThunk(
  'articles/searchArticles',
  async ({ query, page, limit }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/articles/search`, {
        params: { query, page, limit },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  },
)

const articleSlice = createSlice({
  name: 'articles',
  initialState: {
    searchResults: [],
    isSearching: false,
    error: null,
    hasMore: true,
    searchLoading: false,
    searchTerm: '',
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload
    },
    clearSearch: state => {
      state.searchResults = []
      state.isSearching = false
      state.hasMore = true
    },
  },
  extraReducers: builder => {
    builder
      .addCase(searchArticles.pending, state => {
        state.searchLoading = true
        state.isSearching = true
        state.error = null
      })
      .addCase(searchArticles.fulfilled, (state, action) => {
        state.searchLoading = false
        state.isSearching = true
        if (action.payload.currentPage === 1) {
          state.searchResults = action.payload.articles
        } else {
          state.searchResults = [
            ...state.searchResults,
            ...action.payload.articles,
          ]
        }
        state.hasMore = action.payload.hasMore
        state.error = null
      })
      .addCase(searchArticles.rejected, (state, action) => {
        state.searchLoading = false
        state.isSearching = false
        state.error = action.payload
      })
  },
})

export const { clearSearch, setSearchTerm } = articleSlice.actions

export default articleSlice.reducer
