// src/components/rewards/displays/TournamentWinnerDisplay/hooks/useTournamentAnimations.js
import { useEffect, useState } from 'react'

export const useTournamentAnimations = () => {
  const [animationState, setAnimationState] = useState({
    iconReady: false,
    titleReady: false,
    rewardsReady: false,
  })

  useEffect(() => {
    const iconTimer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, iconReady: true }))
    }, 300)

    const titleTimer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, titleReady: true }))
    }, 600)

    const rewardsTimer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, rewardsReady: true }))
    }, 900)

    return () => {
      clearTimeout(iconTimer)
      clearTimeout(titleTimer)
      clearTimeout(rewardsTimer)
    }
  }, [])

  return animationState
}

export const useStaggeredEntrance = (items, baseDelay = 0.1) => {
  return items.map((item, index) => ({
    ...item,
    transition: {
      delay: baseDelay * index,
      duration: 0.5,
    },
  }))
}
