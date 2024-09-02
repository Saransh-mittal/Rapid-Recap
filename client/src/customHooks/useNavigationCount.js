import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigationType } from 'react-router-dom'
import { setNavigationCount } from '../redux/appSlice'

export const useNavigationCount = () => {
  const { navigationCount } = useSelector(state => state.app)
  const dispatch = useDispatch()
  const [count, setCount] = useState(() => {
    const saved = navigationCount
    return saved ? parseInt(saved, 10) : 0
  })
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'PUSH') {
      setCount(prevCount => prevCount + 1)
    } else if (navigationType === 'POP') {
      setCount(prevCount => Math.max(0, prevCount - 1))
    }
  }, [navigationType, location.pathname])

  useEffect(() => {
    dispatch(setNavigationCount(count))
  }, [count])

  const isLastRoute = count < 1
  console.log(count)
  return { count, isLastRoute }
}
