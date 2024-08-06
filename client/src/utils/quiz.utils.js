import axios from 'axios'
import { fetchDailyStreak } from '../redux/appSlice'
import { useSelector } from 'react-redux'

const quinBoostChecker = async ({
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
}) => {
  try {
    const response = await axios.get(`/api/user/quinBoostChecker`)

    if (response.status === 200) {
      setQuizLeftToGetQuizBoost(response.data.quizLeftToGetQuizBoost)
      setIsQuinBoostAvailable(response.data.isQuinBoostAvailable)
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

export { quinBoostChecker, dailyStreakCheckerAndUpdater }
