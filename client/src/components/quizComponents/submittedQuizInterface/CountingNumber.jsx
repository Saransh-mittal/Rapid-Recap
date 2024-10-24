import React, { useState, useEffect } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const CountingNumber = ({
  from,
  to,
  duration = 1,
  onComplete,
  label,
  color,
  isTournament = false,
}) => {
  const [displayNumber, setDisplayNumber] = useState(from)

  useEffect(() => {
    const steps = 30
    const stepDuration = (duration * 1000) / steps
    const increment = (to - from) / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      if (currentStep <= steps) {
        setDisplayNumber(Math.round(from + increment * currentStep))
      } else {
        clearInterval(timer)
        setDisplayNumber(to)
        if (onComplete) onComplete()
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [from, to, duration, onComplete])

  return (
    <Box
      position="relative"
      h="80px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {label && (
        <MotionBox
          position="absolute"
          top={-5}
          left={'-50%'}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          w={'150px'}
        >
          <Text fontSize="sm" fontWeight="medium" color={color}>
            {label}
          </Text>
        </MotionBox>
      )}

      <Text
        fontSize="4xl"
        fontWeight="bold"
        bgGradient={
          isTournament
            ? 'linear(to-r, yellow.400, orange.400)'
            : 'linear(to-r, purple.400, pink.400)'
        }
        bgClip="text"
        key={displayNumber}
        as={motion.span}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {displayNumber}
      </Text>
    </Box>
  )
}

export default CountingNumber
