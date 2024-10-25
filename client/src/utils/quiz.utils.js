import axios from 'axios'
import { fetchDailyStreak } from '../redux/appSlice'

const quinBoostChecker = async ({
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
  dispatch,
}) => {
  try {
    const response = await axios.get(`/api/user/quinBoostChecker`)

    if (response.status === 200) {
      dispatch(setQuizLeftToGetQuizBoost(response.data.quizLeftToGetQuizBoost))
      dispatch(setIsQuinBoostAvailable(response.data.isQuinBoostAvailable))
    }
  } catch (error) {
    console.log(error)
  }
}

const dailyStreakCheckerAndUpdater = async dispatch => {
  console.log('Checking daily streak...')
  try {
    await dispatch(fetchDailyStreak()).unwrap()
    // Optional: Do something with the result if needed
  } catch (error) {
    console.error('Failed to fetch daily streak:', error)
    // Optional: Handle the error (e.g., show a notification to the user)
  }
}

const parseQuizData = result => {
  const [correct, total] = result?.score?.split('/').map(Number) || [0, 0]

  return {
    score: {
      correct,
      total,
      percentage: (correct / total) * 100,
    },
    timeTaken: result?.timeTaken,
    difficulty: result?.quizDifficulty,
    baseRQM: result?.baseRQM_score,
    finalRQM: result?.RQM_score,
    performanceBonus: result?.performanceBonus,
    boost: result?.boost,
    isBoost: result?.isBoosted,
    iqData: {
      prevScore: result?.prevIQScore,
      newScore: result?.newIQScore,
      hasChange: result?.hasSocietyOrCircleChanged,
      changeDetails: result?.changedSocietyOrCircle,
      isUpgrade: result?.isUpgrade,
      pauseRealTimeIQ: result?.pauseRealTimeIQ,
    },
  }
}

export { quinBoostChecker, dailyStreakCheckerAndUpdater, parseQuizData }
