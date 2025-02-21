// /hooks/useTimer.js
import { useMemo } from 'react'
import { useState, useEffect, useRef } from 'react'
import {
  calculateTotalEffect,
  getCategoryFromBoost,
  isCategoryBoost,
} from '../utils/helper.utils'
import { useSelector } from 'react-redux'

const useTimer = (
  remainingTime,
  isOpen,
  submitted,
  showInstruction,
  userAnswers,
  onTimerEnd,
  setSubmitted,
) => {
  const [timer, setTimer] = useState(remainingTime || 50)
  const [timeTaken, setTimeTaken] = useState(0)
  const userAnswersRef = useRef(userAnswers)
  const { activeAbilities } = useSelector(state => state.inventory)
  const filteredActiveAbilities = activeAbilities.filter(ability => {
    // Handle category boosts

    if (ability && ability?.name && isCategoryBoost(ability.name) && category) {
      const boostCategory = getCategoryFromBoost(ability.name)

      return boostCategory.toLowerCase() === category.toLowerCase()
    }
    // Include all other types of boosts
    return true
  })
  const timeDilationEffect = useMemo(
    () =>
      calculateTotalEffect(
        filteredActiveAbilities.filter(
          ability => ability?.name === 'TimeDilation',
        ),
        'POWER_UP',
      ),
    [activeAbilities],
  )
  const additionalTime = useMemo(
    () =>
      timeDilationEffect?.additionalTime
        ? timeDilationEffect?.additionalTime
        : 0,
    [timeDilationEffect],
  )

  // Update the ref whenever userAnswers changes
  useEffect(() => {
    userAnswersRef.current = userAnswers
  }, [userAnswers])
  useEffect(() => {
    setTimer((remainingTime || 50) + additionalTime)
  }, [additionalTime])

  useEffect(() => {
    let timerId = null

    if (isOpen && !submitted && !showInstruction) {
      timerId = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer > 0) {
            return prevTimer - 1
          } else {
            onTimerEnd({
              timeTaken: 50,
              userAnswers: userAnswersRef.current,
              setSubmitted,
            })
            clearInterval(timerId)
            return prevTimer
          }
        })
        setTimeTaken(prevTimeTaken => prevTimeTaken + 1)
      }, 1000)
    }

    if (submitted || showInstruction || !isOpen) {
      clearInterval(timerId)
    }

    return () => clearInterval(timerId)
  }, [isOpen, submitted, showInstruction])

  return { timer, timeTaken }
}

export default useTimer
