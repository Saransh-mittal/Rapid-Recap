// src/components/quizComponents/CountingNumber.jsx
import React, { useState } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useAnimationFrame } from '../../../customHooks/useAnimationFrame'

const MotionText = motion(Text)

const CountingNumber = React.memo(
  ({
    from,
    to,
    duration = 1,
    onComplete,
    label,
    color,
    isTournament = false,
  }) => {
    const [displayNumber, setDisplayNumber] = useState(from)

    useAnimationFrame(
      progress => {
        const currentNumber = from + (to - from) * progress
        setDisplayNumber(Math.round(currentNumber))

        if (progress === 1 && onComplete) {
          onComplete()
        }
      },
      duration * 1000,
      [from, to, duration, onComplete],
    )

    return (
      <Box
        position="relative"
        h="80px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {label && (
          <MotionText
            position="absolute"
            top={-5}
            fontSize="sm"
            fontWeight="medium"
            color={color}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            width={'150px'}
          >
            {label}
          </MotionText>
        )}

        <MotionText
          fontSize="4xl"
          fontWeight="bold"
          bgGradient={
            isTournament
              ? 'linear(to-r, yellow.400, orange.400)'
              : 'linear(to-r, purple.400, pink.400)'
          }
          bgClip="text"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {displayNumber}
        </MotionText>
      </Box>
    )
  },
)

export default CountingNumber
