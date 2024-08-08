import { createSlice } from '@reduxjs/toolkit'
import { getCategory } from '../utils/helper.utils'

const initialState = {
  items: [],
  category: getCategory() ? getCategory() : 'all',
  userProfile: null,
  otherUserProfiles: [],
  loading: {
    items: false,
    userProfile: false,
    otherUserProfiles: false,
    news: false,
  },
  error: {
    items: null,
    userProfile: null,
    otherUserProfiles: null,
    news: null,
  },
}

export const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload
    },
    setItemsState: (state, action) => {
      state.items = action.payload
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload
    },
    setOtherUserProfiles: (state, action) => {
      state.otherUserProfiles = action.payload
    },
    clearUserProfile: state => {
      state.userProfile = null
    },
    clearOtherUserProfiles: state => {
      state.otherUserProfiles = []
    },
    clearNews: state => {
      state.news = null
    },
  },
})

export const {
  setCategory,
  clearUserProfile,
  clearOtherUserProfiles,
  clearNews,
  setItemsState,
  setUserProfile,
  setOtherUserProfiles,
} = contentSlice.actions

export default contentSlice.reducer
