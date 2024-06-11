import axios from "axios";

const quinBoostChecker = async ({
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
}) => {
  try {
    const response = await axios.get(`/api/user/quinBoostChecker`);

    if (response.status === 200) {
      setQuizLeftToGetQuizBoost(response.data.quizLeftToGetQuizBoost);
      setIsQuinBoostAvailable(response.data.isQuinBoostAvailable);
    }
  } catch (error) {
    console.log(error);
  }
};

const dailyStreakCheckerAndUpdater = async ({ dispatch }) => {
  try {
    const res = await axios.get(`/api/user/streakChecker`);
    //console.log(res);
    if (res.status === 200) {
      dispatch({
        type: "setIsBoosted",
        payloadIsBoosted: res.data.isBoosted,
      });
      dispatch({
        type: "setDailyStreak",
        payloadDailyStreak: res.data.streak,
      });
      dispatch({
        type: "setLongestDailyStreak",
        payloadLongestDailyStreak: res.data.longestStreak,
      });
    }
  } catch (error) {
    console.error(error.message);
  }
};

export { quinBoostChecker, dailyStreakCheckerAndUpdater };
