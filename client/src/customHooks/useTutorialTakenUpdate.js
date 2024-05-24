import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../contextAPI/appContext";

// Custom hook to update tutorial taken status
export const useTutorialTakenUpdate = () => {
  const { state, dispatch } = useContext(AppContext);

  const updateTutorialStatus = async (page) => {
    try {
      const res = await axios.post(`/api/user/isTutorialTakenUpdate`, {
        page,
      });
      if (res.status === 200) {
        const user = state.user;
        user.tutorial[page] = false;
        dispatch({ type: "setUser", payloadUser: user });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return updateTutorialStatus;
};
