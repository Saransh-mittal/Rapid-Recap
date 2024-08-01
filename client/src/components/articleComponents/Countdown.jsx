import React, { useEffect, useState } from 'react'
import { Box, Text } from '@chakra-ui/react'

const Countdown = ({ timer, submitted }) => {
  const [offset, setOffset] = useState(0)
  const initialTimer = 50
  const color = timer > 10 ? '#9F7AEA' : '#F56565'

  useEffect(() => {
    const percentage = (timer / initialTimer) * 100
    const newOffset = 283 - (283 * percentage) / 100
    setOffset(newOffset)
  }, [timer, initialTimer])

  return (
    <Box position="relative" width="80px" height="80px" mt={'1rem'}>
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
          stroke={color}
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
        color={color}
      >
        {timer}
      </Text>
    </Box>
  )
}

export default Countdown
