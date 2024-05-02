import { initialState } from "../contextAPI/appContext";
export const Reducer = (state, action) => {
  switch (action.type) {
    // Define your action types and their corresponding state updates
    case "ITEMS":
      return { ...state, items: action.payloadItems };
    case "PAGE":
      return { ...state, page: action.payloadPage };
    case "SHOW":
      return { ...state, show: true };
    case "UNSHOW":
      return { ...state, show: false };
    case "showModal":
      return { ...state, modal: action.payloadModal };
    case "setNews":
      return { ...state, news: action.payloadNews };
    case "forgotPassword":
      return { ...state, forgotPassword: action.payloadForgotPassword };
    case "verifyEmail":
      return { ...state, verifyEmail: action.payloadverifyEmail };
    case "setUser":
      return { ...state, user: action.payloadUser };
    case "setFocusedNavLink":
      return { ...state, focusedNavLink: action.payloadFocusedNavLink };
    // Add more cases for other actions
    case "homeInitialRender":
      return { ...state, homeInitialRender: false };
    case "category":
      return { ...state, category: action.payloadCategory };
    case "profile":
      return { ...state, userProfile: action.payloadProfile };
    case "otherUserProfiles":
      return { ...state, otherUserProfiles: action.payloadOtherUserProfiles };
    case "APP_UPDATES":
      return { ...state, updates: action.payloadAppUpdates };
    case "setDailyStreak":
      return { ...state, streak: action.payloadDailyStreak };
    case "setLongestDailyStreak":
      return { ...state, streak: action.payloadLongestDailyStreak };
    case "setIsBoosted":
      return { ...state, isBoosted: action.payloadIsBoosted };
    case "RESET_STATE":
      return { ...initialState, show: true, user: null };
    default:
      return state;
  }
};
