// /hooks/useTimer.js
import { useState, useEffect, useRef } from 'react'

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

  // Update the ref whenever userAnswers changes
  useEffect(() => {
    userAnswersRef.current = userAnswers
  }, [userAnswers])

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
