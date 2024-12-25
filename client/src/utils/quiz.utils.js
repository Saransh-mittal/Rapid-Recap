import axios from 'axios'
import { fetchDailyStreak } from '../redux/appSlice'
import { addReward } from '../redux/rewardsSlice'
import { REWARD_TYPES } from '../components/rewards'

const quinBoostChecker = async ({
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
  dispatch,
}) => {
  try {
    const response = await axios.get(`/api/user/quinBoostChecker`)

    if (response.status === 200) {
      const {
        quizLeftToGetQuizBoost,
        isQuinBoostAvailable,
        hasUnclaimedBoost,
        multiplier,
      } = response.data

      dispatch(setQuizLeftToGetQuizBoost(quizLeftToGetQuizBoost))
      dispatch(setIsQuinBoostAvailable(isQuinBoostAvailable))

      // Show reward if there's an unclaimed boost
      if (hasUnclaimedBoost) {
        dispatch(
          addReward({
            type: REWARD_TYPES.QUIN_BOOST,
            title: 'RQM Boost Unlocked!',
            description:
              'Your dedication earned you a bonus! Next quiz score will be multiplied by 1.5x.',
            multiplier,
          }),
        )
      }
    }
  } catch (error) {
    console.error('Error checking quinBoost:', error)
  }
}

// Add function to claim quinBoost
const claimQuinBoost = async () => {
  try {
    const response = await axios.post('/api/user/claim-quinboost')
    return response.data
  } catch (error) {
    console.error('Error claiming quinBoost:', error)
    throw error
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
      prevIQScore: result?.prevIQScore,
      newIQScore: result?.newIQScore,
      hasChange: result?.hasSocietyOrCircleChanged,
      changeDetails: result?.changedSocietyOrCircle,
      isUpgrade: result?.isUpgrade,
      pauseRealTimeIQ: result?.pauseRealTimeIQ,
      boostMultiplier: result?.boostMultiplier,
      originalIncrement: result?.originalIncrement,
      boostedIncrement: result?.boostedIncrement,
      additionalScore: result?.additionalScore,
    },
  }
}

export {
  quinBoostChecker,
  dailyStreakCheckerAndUpdater,
  parseQuizData,
  claimQuinBoost,
}
