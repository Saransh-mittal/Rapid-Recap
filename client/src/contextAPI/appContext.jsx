// File: src/contextAPI/appContext.js

import React, {
  createContext,
  useReducer,
  useRef,
  useEffect,
  useMemo,
} from 'react'
import { Reducer } from '../reducer/useReducer'
import axios from 'axios'
import useSound from '../customHooks/useSound'

// Define async functions to fetch data
const showState = async () => {
  try {
    const response = await axios.get(`/api/user/loginCheck`)
    if (response.status === 201) {
      return { show: false, user: response.data }
    } else {
      return { show: true, user: {} }
    }
  } catch (error) {
    console.log(error.message)
    return { show: true, user: {} }
  }
}

const getDailyStreak = async () => {
  try {
    const response = await axios.get(`/api/user/streakChecker`)
    if (response.status === 200) {
      return {
        streak: response.data.streak,
        longestStreak: response.data.longestStreak,
        isBoosted: response.data.isBoosted,
      }
    }
  } catch (error) {
    console.log(error.message)
    return {
      streak: 0,
      longestStreak: 0,
      isBoosted: false,
    }
  }
}

const getAppUpdates = async () => {
  try {
    const response = await axios.get(`/api/user/getUpdates`)
    if (response.status === 200) {
      return { updates: response.data.updates }
    }
    return { updates: [] }
  } catch (error) {
    console.log(error.message)
    return { updates: [] }
  }
}

const parseURL = url => {
  const urlObj = new URL(url)
  return urlObj.pathname.split('/').filter(Boolean)
}

const getArticleId = () => {
  const segments = parseURL(window.location.href)
  const articleIndex = segments.indexOf('article')
  if (articleIndex !== -1 && articleIndex < segments.length - 1) {
    return segments[articleIndex + 1]
  }
  return null
}

const getCategory = () => {
  const segments = parseURL(window.location.href)
  const homeIndex = segments.indexOf('home')
  if (homeIndex !== -1 && homeIndex < segments.length - 1) {
    return segments[homeIndex + 1]
  }
  return null
}

const currentArticle = async () => {
  try {
    const articleId = getArticleId()
    if (articleId) {
      const response = await axios.get(`/api/articles/article/${articleId}`)
      return { news: response.data.newArticle }
    }
    return { news: {} }
  } catch (error) {
    console.log('Error fetching current article:', error.message)
    return { news: {} }
  }
}

const getUnreadFriendRequestCnt = async () => {
  try {
    const response = await axios.get(`/api/friends/unread-requests-count`)
    if (response.status === 200) {
      return response.data.unreadCount
    }
    return 0
  } catch (error) {
    console.log(error.message)
    return 0
  }
}

const markFriendRequestsAsRead = async () => {
  try {
    await axios.post(`/api/friends/request-mark-as-read`)
  } catch (error) {
    console.log(error.message)
  }
}

// Define and export initial state
export const initialState = {
  modal: false,
  forgotPassword: false,
  verifyEmail: false,
  focusedNavLink: 0,
  page: 0,
  items: [],
  homeInitialRender: true,
  category: getCategory() ? getCategory() : 'all',
  userProfile: null,
  otherUserProfiles: [],
  unreadFriendRequests: 0,
  notifyCnt: 0,
}

// Create context
export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const navLinkRefs = useRef([])
  const [state, dispatch] = useReducer(Reducer, initialState)
  const { playClick } = useSound()

  useEffect(() => {
    const fetchInitialData = async () => {
      const showStateData = await showState()
      let currentArticleData = {}

      const articleId = getArticleId()
      if (articleId) {
        currentArticleData = await currentArticle()
      }

      dispatch({
        type: 'INITIALIZE_STATE',
        payload: {
          ...showStateData,
          ...currentArticleData,
        },
      })

      // Fetch less critical data in the background
      getAppUpdates().then(getAppUpdatesData =>
        dispatch({ type: 'APP_UPDATES', payloadAppUpdates: getAppUpdatesData }),
      )
      getDailyStreak().then(getDailyStreakData =>
        dispatch({ type: 'UPDATE_DAILY_STREAK', payload: getDailyStreakData }),
      )
      getUnreadFriendRequestCnt().then(getUnreadFriendRequestCntData =>
        dispatch({
          type: 'UPDATE_UNREAD_FRIEND_REQUESTS',
          payload: getUnreadFriendRequestCntData,
        }),
      )
    }

    fetchInitialData()
  }, [])

  const updateUnreadFriendRequests = async () => {
    const { unreadFriendRequests } = await getUnreadFriendRequestCnt()
    dispatch({
      type: 'UPDATE_UNREAD_FRIEND_REQUESTS',
      payload: unreadFriendRequests,
    })
  }

  const readFriendRequests = async () => {
    await markFriendRequestsAsRead()
    dispatch({ type: 'UPDATE_UNREAD_FRIEND_REQUESTS', payload: 0 })
  }

  const memoizedValue = useMemo(
    () => ({
      state,
      dispatch,
      navLinkRefs,
      playClick,
      updateUnreadFriendRequests,
      readFriendRequests,
    }),
    [state],
  )

  return (
    <AppContext.Provider value={memoizedValue}>{children}</AppContext.Provider>
  )
}
