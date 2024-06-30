import { createContext, useReducer, useRef } from "react";
import { Reducer } from "../reducer/useReducer";
import axios from "axios";

async function showState() {
  try {
    const response = await axios.get(`/api/user/loginCheck`);
    //console.log(response.data);
    if (response.status === 201) {
      return { show: false, user: response.data };
    } else return { show: true, user: {} };
  } catch (error) {
    console.log(error.message);
    return { show: true, user: {} };
  }
}

async function getDailyStreak() {
  try {
    const response = await axios.get(`/api/user/streakChecker`);
    if (response.status === 200) {
      return {
        streak: response.data.streak,
        longestStreak: response.data.longestStreak,
        isBoosted: response.data.isBoosted,
      };
    }
  } catch (error) {
    console.log(error.message);
    return {
      streak: 0,
      longestStreak: 0,
      isBoosted: false,
    };
  }
}

async function getAppUpdates() {
  try {
    const response = await axios.get(`/api/user/getUpdates`);
    if (response.status === 200) {
      return { updates: response.data.updates };
    }
    return { updates: [] };
  } catch (error) {
    console.log(error.message);
    return { updates: [] };
  }
}

function parseURL(url) {
  const urlObj = new URL(url);
  return urlObj.pathname.split("/").filter(Boolean);
}

function getArticleId() {
  const segments = parseURL(window.location.href);
  const articleIndex = segments.indexOf("article");
  if (articleIndex !== -1 && articleIndex < segments.length - 1) {
    return segments[articleIndex + 1];
  }
  return null;
}

function getCategory() {
  const segments = parseURL(window.location.href);
  const homeIndex = segments.indexOf("home");
  if (homeIndex !== -1 && homeIndex < segments.length - 1) {
    return segments[homeIndex + 1];
  }
  return null;
}

async function currentArticle() {
  try {
    const articleId = getArticleId();
    if (articleId) {
      const response = await axios.get(`/api/articles/article/${articleId}`);
      return { news: response.data.newArticle };
    }
    return { news: {} };
  } catch (error) {
    console.log("Error fetching current article:", error.message);
    return { news: {} };
  }
}

const category = getCategory();

export const initialState = {
  // Define your initial state properties here
  ...(await showState()),
  ...(await currentArticle()),
  ...(await getAppUpdates()),
  ...(await getDailyStreak()),
  modal: false,
  forgotPassword: false,
  verifyEmail: false,
  focusedNavLink: 0,
  page: 0,
  items: [],
  homeInitialRender: true,
  category: category ? category : "all",
  userProfile: null,
  otherUserProfiles: [],
  // ...
};
// async function init() {
//   initialState.show = ;
// }
// init();
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navLinkRefs = useRef([]);
  const [state, dispatch] = useReducer(Reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch, navLinkRefs }}>
      {children}
    </AppContext.Provider>
  );
};
