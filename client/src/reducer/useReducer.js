// File: src/reducer/useReducer.js

import { initialState } from '../contextAPI/appContext'

export const Reducer = (state, action) => {
  switch (action.type) {
    // Initialize state with fetched data
    case 'INITIALIZE_STATE':
      return {
        ...state,
        ...action.payload,
      }

    // Update items array
    case 'ITEMS':
      return { ...state, items: action.payloadItems }

    // Set news data
    case 'setNews':
      return { ...state, news: action.payloadNews }

    // Set focused navigation link
    case 'setFocusedNavLink':
      return { ...state, focusedNavLink: action.payloadFocusedNavLink }

    // Set category
    case 'category':
      return { ...state, category: action.payloadCategory }

    // Set user profile data
    case 'profile':
      return { ...state, userProfile: action.payloadProfile }

    // Set other user profiles data
    case 'otherUserProfiles':
      return { ...state, otherUserProfiles: action.payloadOtherUserProfiles }

    // Reset state to initial values with some specific modifications
    case 'RESET_STATE':
      return {
        ...initialState,
        show: true,
        unreadFriendRequests: 0,
      }

    // Default case to return the current state
    default:
      return state
  }
}
