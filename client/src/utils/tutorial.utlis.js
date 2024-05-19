import axios from "axios";

export const isTutorialTakenCheck = async ({ page, tour }) => {
  try {
    const response = await axios.get(`/api/user/isTutorialTakenCheck/${page}`);

    if (response.data.status) tour.start();
  } catch (err) {
    console.error(err);
  }
};

export const isTutorialTakenUpdate = async (page) => {
  try {
    await axios.post(`/api/user/isTutorialTakenUpdate`, {
      page,
    });
  } catch (err) {
    console.error(err);
  }
};
