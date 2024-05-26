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

export { quinBoostChecker };
