import { useState, useEffect, useRef, useCallback } from 'react'

const useRewardState = ({
  onClaim,
  initialClaimed = false,
  claimDelay = 1500,
}) => {
  const [claimed, setClaimed] = useState(initialClaimed)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isClaimInProgress, setIsClaimInProgress] = useState(false)
  const timeoutRef = useRef()

  const handleClaim = useCallback(() => {
    if (isClaimInProgress || claimed) return

    setIsClaimInProgress(true)
    setClaimed(true)
    setShowSuccess(true)

    timeoutRef.current = setTimeout(() => {
      onClaim?.()
      setIsClaimInProgress(false)
    }, claimDelay)
  }, [claimed, claimDelay, isClaimInProgress, onClaim])

  const reset = useCallback(() => {
    setClaimed(false)
    setShowSuccess(false)
    setIsClaimInProgress(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    claimed,
    showSuccess,
    isClaimInProgress,
    handleClaim,
    reset,
  }
}

export const useRewardAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationPhase, setAnimationPhase] = useState('initial')

  const startAnimation = useCallback(() => {
    setIsAnimating(true)
    setAnimationPhase('start')
  }, [])

  const completeAnimation = useCallback(() => {
    setAnimationPhase('complete')
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationPhase('initial')
    }, 500)
  }, [])

  return {
    isAnimating,
    animationPhase,
    startAnimation,
    completeAnimation,
  }
}

export const useRewardSound = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/path/to/reward-sound.mp3') // replace with actual sound file
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playSound = useCallback(() => {
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Handle playback error silently
      })
    }
  }, [isSoundEnabled])

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev)
  }, [])

  return {
    isSoundEnabled,
    toggleSound,
    playSound,
  }
}

export const useRewardTracking = () => {
  const [claimHistory, setClaimHistory] = useState([])

  const trackClaim = useCallback(rewardData => {
    setClaimHistory(prev => [
      ...prev,
      {
        ...rewardData,
        timestamp: new Date().toISOString(),
      },
    ])
  }, [])

  const clearHistory = useCallback(() => {
    setClaimHistory([])
  }, [])

  return {
    claimHistory,
    trackClaim,
    clearHistory,
  }
}

export const useRewardQueue = () => {
  const [queue, setQueue] = useState([])
  const [currentReward, setCurrentReward] = useState(null)

  const addToQueue = useCallback(
    reward => {
      setQueue(prev => [...prev, reward])

      if (!currentReward) {
        setCurrentReward(reward)
      }
    },
    [currentReward],
  )

  const removeFromQueue = useCallback(() => {
    if (queue.length > 0) {
      const [nextReward, ...remainingQueue] = queue
      setQueue(remainingQueue)
      setCurrentReward(nextReward)
    } else {
      setCurrentReward(null)
    }
  }, [queue])

  const clearQueue = useCallback(() => {
    setQueue([])
    setCurrentReward(null)
  }, [])

  return {
    queue,
    currentReward,
    addToQueue,
    removeFromQueue,
    clearQueue,
  }
}

export default useRewardState
