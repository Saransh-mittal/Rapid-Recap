import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../redux/authSlice'

// Custom hook to update tutorial taken status
export const useTutorialTakenUpdate = () => {
  const { user: loggedInUser } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const updateTutorialStatus = async page => {
    try {
      const res = await axios.post(`/api/user/isTutorialTakenUpdate`, {
        page,
      })
      if (res.status === 200) {
        const user = loggedInUser
        user.tutorial[page] = false
        dispatch(setUser(user))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return updateTutorialStatus
}
