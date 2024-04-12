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

function parseURL(url) {
  // Split the URL by slashes
  const segments = url.split("/");
  // The segment after the base URL will indicate the route
  const route = segments[3];
  const id = segments[4];

  // Check if the route matches any of the known routes
  return { route, id };
}

async function currentArticle() {
  try {
    const url = window.location.href;

    const { route, id } = parseURL(url);
    if (route === "article") {
      const response = await axios.get(`/api/articles/article/${id}`);

      return { news: response.data.newArticle };
    } //const response = await axios.get(`/api/news/currentArticle`);
    //return response.data;
    return { news: {} };
  } catch (error) {
    console.log(error.message);
    return { news: {} };
  }
}

//function to get initial category from home url
function getCategory() {
  const url = window.location.href;
  const { route } = parseURL(url);

  return route;
}
const category = getCategory();
export const initialState = {
  // Define your initial state properties here
  ...(await showState()),
  ...(await currentArticle()),
  modal: false,
  forgotPassword: false,
  verifyEmail: false,
  focusedNavLink: 0,
  page: 0,
  items: [],
  homeInitialRender: true,
  category: !category && category !== "" ? category : "general",
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
