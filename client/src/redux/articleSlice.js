// Enhanced articleSlice.js to handle new search metadata
// File: redux/articleSlice.js

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
    articleData: null,
    searchResults: [],
    isSearching: false,
    error: null,
    hasMore: true,
    searchLoading: false,
    searchTerm: '',
    totalUsersGivenQuiz: 0,
    // New search metadata
    searchMetadata: {
      searchType: null,
      searchDuration: null,
      cached: false,
      queryIntent: null,
      suggestions: [],
      avgRelevance: null,
    },
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload
    },
    setArticleData: (state, action) => {
      state.articleData = action.payload
      state.totalUsersGivenQuiz = action.payload?.quizAttemptCnt || 0
    },
    clearSearch: state => {
      state.searchTerm = ''
      state.searchResults = []
      state.isSearching = false
      state.hasMore = true
      state.searchMetadata = {
        searchType: null,
        searchDuration: null,
        cached: false,
        queryIntent: null,
        suggestions: [],
        avgRelevance: null,
      }
    },
    setTotalUsersGivenQuiz: (state, action) => {
      state.totalUsersGivenQuiz = action.payload
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
        if (location.pathname === '/' || location.pathname === '/get-started') {
          return
        }
        state.searchLoading = false
        state.isSearching = true

        // Handle pagination
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

        // Store search metadata
        state.searchMetadata = {
          searchType: action.payload.searchType || 'unknown',
          searchDuration: action.payload.searchDuration || null,
          cached: action.payload.cached || false,
          queryIntent: action.payload.queryIntent || null,
          suggestions: action.payload.suggestions || [],
          avgRelevance: action.payload.avgRelevance || null,
        }
      })
      .addCase(searchArticles.rejected, (state, action) => {
        state.searchLoading = false
        state.isSearching = false
        state.error = action.payload
        state.searchMetadata = {
          searchType: null,
          searchDuration: null,
          cached: false,
          queryIntent: null,
          suggestions: [],
          avgRelevance: null,
        }
      })
  },
})

export const {
  clearSearch,
  setSearchTerm,
  setArticleData,
  setTotalUsersGivenQuiz,
} = articleSlice.actions

export default articleSlice.reducer
