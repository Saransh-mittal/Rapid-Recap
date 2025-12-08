import axios from 'axios'
import { fetchDailyStreak } from '../redux/appSlice'
import { addReward } from '../redux/rewardsSlice'
import { REWARD_TYPES } from '../components/rewards'

const quinBoostChecker = async ({ setQuizLeftToGetQuizBoost, dispatch }) => {
  try {
    const response = await axios.get(`/api/abilities/check/QuinBoost`)

    if (response.status === 200) {
      const {
        quizLeftToGetQuizBoost,
        isQuinBoostAvailable,
        hasUnclaimedBoost,
        ability,
        multiplier,
      } = response.data

      dispatch(setQuizLeftToGetQuizBoost(quizLeftToGetQuizBoost))

      // Show reward if there's an unclaimed boost
      if (hasUnclaimedBoost) {
        dispatch(
          addReward({
            type: REWARD_TYPES.RQM_BOOST,
            name: ability.name,
            title: 'RQM Boost Unlocked!',
            description:
              ability.description ||
              `Your dedication earned you a bonus! Next quiz score will be multiplied by ${multiplier}x.`,
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
  try {
    await dispatch(fetchDailyStreak()).unwrap()
  } catch (error) {
    console.error('Failed to fetch daily streak:', error)
  }
}

// Add claim endpoint for streak surge
const claimStreakSurge = async () => {
  try {
    const response = await axios.post('/api/user/claim-streak-surge')
    return response.data
  } catch (error) {
    console.error('Error claiming streak surge:', error)
    throw error
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
    baseRQM: result?.score?.baseRQM || result?.baseRQM_score,
    finalRQM: result?.RQM_score,
    timeDilationBoosted: result?.timeDilationBoosted,
    performanceBonus: result?.performanceBonus,
    precisionBonus: result?.score?.precisionBonus || result?.precisionBonus || 0,
    scoreSurgeBonus: result?.score?.scoreSurgeBonus || result?.scoreSurgeBonus || 0,
    forgeScore: result?.forgeScore || 0,
    activePowerups: result?.activePowerups || [],
    forgeQuestions: result?.forgeQuestions || [],
    questions: result?.questions || [],
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
  claimStreakSurge,
}
