import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../contextAPI/appContext";

export const isTutorialTakenCheck = async ({ page, tour }) => {
  try {
    const response = await axios.get(`/api/user/isTutorialTakenCheck/${page}`);
    if (response.data.status) tour.start();
  } catch (err) {
    console.error(err);
  }
};

// export const isTutorialTakenUpdate = async (page) => {
//   const { state, dispatch } = useContext(AppContext);
//   try {
//     console.log(page);
//     const res = await axios.post(`/api/user/isTutorialTakenUpdate`, {
//       page,
//     });
//     if (res.status === 200) {
//       const user = state.user;
//       user.tutorial[page] = false;
//       dispatch({ type: "setUser", payloadUser: user });
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };
