// File: src/reducer/useReducer.js

import { initialState } from "../contextAPI/appContext";

export const Reducer = (state, action) => {
  switch (action.type) {
    // Initialize state with fetched data
    case "INITIALIZE_STATE":
      return {
        ...state,
        ...action.payload,
      };

    // Update items array
    case "ITEMS":
      return { ...state, items: action.payloadItems };

    // Update current page number
    case "PAGE":
      return { ...state, page: action.payloadPage };

    // Show specific UI elements
    case "SHOW":
      return { ...state, show: true };

    // Hide specific UI elements
    case "UNSHOW":
      return { ...state, show: false };

    // Show modal with specific payload
    case "showModal":
      return { ...state, modal: action.payloadModal };

    // Set news data
    case "setNews":
      return { ...state, news: action.payloadNews };

    // Toggle forgot password state
    case "forgotPassword":
      return { ...state, forgotPassword: action.payloadForgotPassword };

    // Toggle verify email state
    case "verifyEmail":
      return { ...state, verifyEmail: action.payloadverifyEmail };

    // Set user data
    case "setUser":
      return { ...state, user: action.payloadUser };

    // Set focused navigation link
    case "setFocusedNavLink":
      return { ...state, focusedNavLink: action.payloadFocusedNavLink };

    // Set home initial render state to false
    case "homeInitialRender":
      return { ...state, homeInitialRender: false };

    // Set category
    case "category":
      return { ...state, category: action.payloadCategory };

    // Set user profile data
    case "profile":
      return { ...state, userProfile: action.payloadProfile };

    // Set other user profiles data
    case "otherUserProfiles":
      return { ...state, otherUserProfiles: action.payloadOtherUserProfiles };

    // Update application updates data
    case "APP_UPDATES":
      return { ...state, updates: action.payloadAppUpdates };

    // Set daily streak
    case "setDailyStreak":
      return { ...state, streak: action.payloadDailyStreak };

    case "UPDATE_DAILY_STREAK":
      return {
        ...state,
        streak: action.payload.streak,
        longestStreak: action.payload.longestStreak,
        isBoosted: action.payload.isBoosted,
      };

    // Set longest daily streak
    case "setLongestDailyStreak":
      return { ...state, longestStreak: action.payloadLongestDailyStreak };

    // Set boosted state
    case "setIsBoosted":
      return { ...state, isBoosted: action.payloadIsBoosted };

    // Update unread friend requests count
    case "UPDATE_UNREAD_FRIEND_REQUESTS":
      return { ...state, unreadFriendRequests: action.payload };

    // Reset state to initial values with some specific modifications
    case "RESET_STATE":
      return {
        ...initialState,
        show: true,
        user: {},
        unreadFriendRequests: 0,
      };

    // Default case to return the current state
    default:
      return state;
  }
};
