import React from 'react'
import { Box } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

const shimmer = keyframes`
  100% {
    transform: translateX(100%);
  }
`

const QuizStatisticsSkeleton = () => {
  return (
    <Box
      borderRadius="8px"
      backgroundColor="rgba(26, 21, 39, 0.7)"
      mb={{ base: '1rem', md: '2rem' }}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      p={{ base: '1rem', md: '1.5rem' }}
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
        zIndex={1}
      />

      <Box w="100%">
        <Box mb={4}>
          {/* Title skeleton */}
          <Box
            h="6"
            w="150px"
            bg="rgba(229,190,236,0.2)"
            borderRadius="md"
            mb={4}
          />

          {/* Chart skeleton */}
          <Box
            position="relative"
            h="180px"
            w="100%"
            bg="rgba(26, 21, 39, 0.5)"
            borderRadius="md"
            overflow="hidden"
          >
            {/* Fake bars */}
            <Box
              display="flex"
              justifyContent="space-around"
              alignItems="flex-end"
              h="100%"
              pt="30px"
              pb="30px"
            >
              {/* Attempted bar */}
              <Box
                w="40px"
                h="80%"
                bg="rgba(253, 226, 243, 0.6)"
                borderRadius="md"
                position="relative"
              >
                <Box
                  position="absolute"
                  bottom="-20px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="30px"
                  h="3"
                  bg="rgba(229,190,236,0.2)"
                  borderRadius="md"
                />
              </Box>

              {/* Avg Score bar */}
              <Box
                w="40px"
                h="50%"
                bg="rgba(229, 190, 237, 0.6)"
                borderRadius="md"
                position="relative"
              >
                <Box
                  position="absolute"
                  bottom="-20px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="30px"
                  h="3"
                  bg="rgba(229,190,236,0.2)"
                  borderRadius="md"
                />
              </Box>

              {/* Your Score bar */}
              <Box
                w="40px"
                h="65%"
                bg="rgba(145, 127, 179, 0.6)"
                borderRadius="md"
                position="relative"
              >
                <Box
                  position="absolute"
                  bottom="-20px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="30px"
                  h="3"
                  bg="rgba(229,190,236,0.2)"
                  borderRadius="md"
                />
              </Box>
            </Box>

            {/* Y-axis ticks */}
            <Box position="absolute" left="30px" top="0" h="100%" w="1px">
              {[0, 1, 2].map((_, index) => (
                <Box
                  key={index}
                  position="absolute"
                  top={`${index * 33}%`}
                  left="-15px"
                  w="10px"
                  h="2px"
                  bg="rgba(229,190,236,0.2)"
                  borderRadius="full"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default QuizStatisticsSkeleton
