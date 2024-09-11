import React, { useEffect, useState, useCallback } from 'react'
import { Box, Text } from '@chakra-ui/react'
import useSound from '../../customHooks/useSound'

const Countdown = ({ timer, submitted, isTournament = false }) => {
  const [offset, setOffset] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)
  const initialTimer = 50
  const { play30SecSound, play20SecSound, play10SecSound, playEndSound } =
    useSound()

  // Helper to switch between default and tournament colors
  const getColor = useCallback(() => {
    if (timer > 30) return isTournament ? '#FFD700' : '#9F7AEA' // Gold or Purple
    if (timer > 20) return isTournament ? '#FFEA70' : '#F6E05E' // Light Gold or Yellow
    if (timer > 10) return isTournament ? '#FFC107' : '#ED8936' // Amber or Orange
    return isTournament ? '#FF4500' : '#F56565' // Red for both
  }, [timer, isTournament])

  useEffect(() => {
    const percentage = (timer / initialTimer) * 100
    const newOffset = 283 - (283 * percentage) / 100
    setOffset(newOffset)

    if (!submitted) {
      if (timer === 30) {
        play30SecSound()
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 1000)
      } else if (timer === 20) {
        play20SecSound()
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 1000)
      } else if (timer <= 10 && timer > 0) {
        play10SecSound()
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 200)
      }
    }
  }, [
    timer,
    initialTimer,
    play30SecSound,
    play20SecSound,
    play10SecSound,
    playEndSound,
    submitted,
  ])

  return (
    <Box
      position="relative"
      width="80px"
      height="80px"
      mt={'1rem'}
      animation={isFlashing ? 'flash 0.5s' : 'none'}
      css={{
        '@keyframes flash': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeDasharray="283"
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <Text
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        fontSize={timer > 9 ? '24px' : '20px'}
        fontWeight="bold"
        color={getColor()}
      >
        {timer}
      </Text>
    </Box>
  )
}

export default Countdown
