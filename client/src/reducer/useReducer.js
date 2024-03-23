export const Reducer = (state, action) => {
  switch (action.type) {
    // Define your action types and their corresponding state updates
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
    default:
      return state;
  }
};
