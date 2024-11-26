import React, { useMemo } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { keyframes as emotionKeyframes } from '@emotion/react'

const shimmer = emotionKeyframes`
  100% {
    transform: translateX(100%);
  }
`

const MainArticleContentSkeleton = () => {
  // Generate random widths once and memoize them
  const lineWidths = useMemo(
    () => ({
      paragraph1: Array(8)
        .fill()
        .map(() => `${Math.random() * (100 - 75) + 75}%`),
      paragraph2: Array(3)
        .fill()
        .map(() => `${Math.random() * (90 - 70) + 70}%`),
      paragraph3: Array(5)
        .fill()
        .map(() => `${Math.random() * (95 - 80) + 80}%`),
    }),
    [],
  )

  return (
    <Flex w={{ base: '90vw', sm: '90vw', md: '100%' }} overflow="hidden">
      <Box
        px={{ base: 2, sm: 3, md: 4, lg: 6 }}
        py={3}
        bg="rgba(26, 21, 39, 0.8)"
        borderRadius="lg"
        boxShadow="dark-lg"
        w="100%"
        position="relative"
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

        {/* Image skeleton */}
        <Flex justifyContent="center" mt={[2, 3, 5]}>
          <Box
            width={{ base: '100%', sm: '100%', md: '80%', lg: '100%' }}
            height={{ base: '200px', sm: '300px', md: '400px' }}
            bg="rgba(229,190,236,0.2)"
            borderRadius="md"
            mb={[2, 3, 4]}
          />
        </Flex>

        {/* Content skeleton */}
        <Box mt={6} position="relative">
          {/* First paragraph */}
          {lineWidths.paragraph1.map((width, i) => (
            <Box
              key={`p1-${i}`}
              height="16px"
              bg="rgba(229,190,236,0.2)"
              borderRadius="md"
              mb={3}
              width={width}
            />
          ))}

          {/* Second paragraph */}
          <Box mt={6}>
            {lineWidths.paragraph2.map((width, i) => (
              <Box
                key={`p2-${i}`}
                height="16px"
                bg="rgba(229,190,236,0.2)"
                borderRadius="md"
                mb={3}
                width={width}
              />
            ))}
          </Box>

          {/* Third paragraph */}
          <Box mt={6}>
            {lineWidths.paragraph3.map((width, i) => (
              <Box
                key={`p3-${i}`}
                height="16px"
                bg="rgba(229,190,236,0.2)"
                borderRadius="md"
                mb={3}
                width={width}
              />
            ))}
          </Box>

          {/* Source link skeleton */}
          <Flex mt={8} justify="flex-start">
            <Box
              height="10px"
              width="150px"
              bg="rgba(229,190,236,0.2)"
              borderRadius="full"
            />
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}

export default MainArticleContentSkeleton
