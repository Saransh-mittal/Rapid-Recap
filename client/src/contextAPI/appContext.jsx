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

const initialState = {
  // Define your initial state properties here
  ...(await showState()),
  modal: false,
  news: {},
  forgotPassword: false,
  verifyEmail: false,
  focusedNavLink: 0,
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
