import React from 'react'
import { Box } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
const shimmer = keyframes`
  100% {
    transform: translateX(100%);
  }
`

const QuizSkeleton = () => {
  return (
    <Box
      p={6}
      borderRadius="lg"
      bg="linear-gradient(180deg, rgba(42,47,79,0.7) 0%, rgba(145,127,179,0.7) 100%)"
      boxShadow="lg"
      mb={5}
      position="relative"
      overflow="hidden"
    >
      {/* Shimmer overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        transform="translateX(-100%)"
        animation={`${shimmer} 2s infinite`}
        background="linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)"
      />

      {/* Title skeleton */}
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box
          h="8"
          w="75%"
          bg="rgba(229,190,236,0.2)"
          borderRadius="lg"
          mb={4}
        />

        {/* Stats area skeleton */}
        <Box
          h="6"
          w="50%"
          bg="rgba(229,190,236,0.2)"
          borderRadius="lg"
          mb={3}
        />

        {/* Medal and score skeleton */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Box h="6" w="6" bg="rgba(229,190,236,0.2)" borderRadius="full" />
          <Box h="6" w="32" bg="rgba(229,190,236,0.2)" borderRadius="lg" />
        </Box>

        {/* Button skeleton */}
        <Box h="12" w="36" bg="rgba(229,190,236,0.2)" borderRadius="full" />
      </Box>
    </Box>
  )
}

const TakeQuizSkeleton = () => {
  return (
    <Box m={4} w="full" position="relative" overflow="hidden">
      {/* Shimmer overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        transform="translateX(-100%)"
        animation={`${shimmer} 2s infinite`}
        background="linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)"
      />

      {/* Button skeleton */}
      <Box h="16" w="full" bg="rgba(229,190,236,0.2)" borderRadius="full" />
    </Box>
  )
}

const QuizSkeletonWrapper = () => {
  return (
    <Box
      position="relative"
      w="full"
      borderRadius="lg"
      overflow="hidden"
      bg="rgba(42,47,79,0.7)"
      mb={4}
    >
      <Box p={4}>
        <QuizSkeleton />
      </Box>
    </Box>
  )
}

export default QuizSkeletonWrapper
