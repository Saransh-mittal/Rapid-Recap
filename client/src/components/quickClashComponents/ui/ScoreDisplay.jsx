import React from 'react'
import { Center, useColorModeValue } from '@chakra-ui/react'

/**
 * Displays a score value in a circular badge
 */
const ScoreDisplay = ({ score, size = 'md' }) => {
  const bgGradient = useColorModeValue(
    'linear(to-r, purple.600, blue.400)',
    'linear(to-r, purple.500, blue.300)',
  )

  return (
    <Center
      w={size === 'sm' ? '32px' : '40px'}
      h={size === 'sm' ? '32px' : '40px'}
      borderRadius="full"
      bgGradient={bgGradient}
      color="white"
      fontWeight="bold"
      fontSize={size === 'sm' ? 'xs' : 'sm'}
      boxShadow="0 0 10px rgba(124, 58, 237, 0.5)"
    >
      {score}
    </Center>
  )
}

export default ScoreDisplay
