import { useState, useEffect } from 'react'

export const useScoreAnimation = (scoreData, step) => {
  const [showAnimation, setShowAnimation] = useState(false)
  const [currentScore, setCurrentScore] = useState(null)
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    if (step >= 2) {
      setCurrentScore(scoreData.prevScore)
      const startAnimation = setTimeout(() => setShowAnimation(true), 1000)
      return () => clearTimeout(startAnimation)
    }
  }, [step, scoreData.prevScore])

  useEffect(() => {
    if (!showAnimation) return

    const animations = [
      () => {
        setCurrentScore(
          (
            parseFloat(scoreData.prevScore) +
            parseFloat(scoreData.originalIncrement)
          ).toFixed(1),
        )
        setAnimationStep(1)
      },
      () => {
        setCurrentScore(scoreData.newScore)
        setAnimationStep(2)
      },
      () => {
        setAnimationStep(3)
      },
    ]

    const timers = animations.map((animation, index) =>
      setTimeout(animation, 2000 + index * 800),
    )

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [showAnimation, scoreData])

  return { showAnimation, currentScore, animationStep }
}
