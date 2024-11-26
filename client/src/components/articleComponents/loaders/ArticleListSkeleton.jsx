import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
const shimmer = keyframes`
  100% {
    transform: translateX(100%);
  }
`

const ArticleCardSkeleton = () => {
  return (
    <Box
      minH="100px"
      borderTop="2px solid lightblue"
      p={2}
      w="100%"
      h="auto"
      display="flex"
      flexDirection="column"
      bg="rgba(42, 47, 79, 0.7)"
      borderRadius="xl"
      mb={3}
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

      {/* Date and read time skeleton */}
      <Flex w="100%" justifyContent="space-between" mb={2}>
        <Box w="100px" h="4" bg="rgba(156,175,170,0.2)" borderRadius="md" />
        <Box w="60px" h="4" bg="rgba(156,175,170,0.2)" borderRadius="md" />
      </Flex>

      {/* Image and title container */}
      <Flex mr={3} mb={2} alignItems="center">
        {/* Image skeleton */}
        <Box
          w={{ base: '130px', md: '160px' }}
          h={{ base: '100px', md: '120px' }}
          mr={3}
          mt={2}
          bg="rgba(156,175,170,0.2)"
          borderRadius="8px"
          flexShrink={0}
        />

        {/* Title skeleton - multiple lines */}
        <Flex flexDirection="column" w="100%" mt={2}>
          <Box
            w="100%"
            h="4"
            bg="rgba(156,175,170,0.2)"
            borderRadius="md"
            mb={2}
          />
          <Box
            w="90%"
            h="4"
            bg="rgba(156,175,170,0.2)"
            borderRadius="md"
            mb={2}
          />
          <Box w="80%" h="4" bg="rgba(156,175,170,0.2)" borderRadius="md" />
        </Flex>
      </Flex>
    </Box>
  )
}

const ArticleListSkeleton = ({ count = 3 }) => {
  return (
    <Box minH="100px" w="100%" position="relative">
      {Array(count)
        .fill(null)
        .map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
    </Box>
  )
}

export default ArticleListSkeleton
