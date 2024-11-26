import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { keyframes as emotionKeyframes } from '@emotion/react'

const shimmer = emotionKeyframes`
  100% {
    transform: translateX(100%);
  }
`

const ArticleHeaderSkeleton = () => {
  return (
    <Box w="100%" mb={[3, 4, 5]}>
      <Flex
        bg="linear-gradient(135deg, rgba(42, 47, 79, 0.7) 0%, rgba(145, 127, 179, 0.7) 100%)"
        px={[3, 4, 6]}
        py={[2, 3]}
        borderTopRadius="xl"
        flexDirection="column"
        w="100%"
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

        {/* Title skeleton */}
        <Box
          h="2.5rem"
          w="90%"
          bg="rgba(229,190,236,0.2)"
          borderRadius="md"
          mb={4}
        />

        {/* Upper section with icons */}
        <Flex
          direction={['column', 'column', 'row']}
          justify="space-between"
          align={['flex-start', 'flex-start', 'center']}
          mb={4}
        >
          <Flex w="100%" mb={[2, 2, 0]} gap={2}>
            {/* AI Tag and Bookmark */}
            <Flex alignItems="center" gap={2}>
              <Box
                h="6"
                w="24"
                bg="rgba(229,190,236,0.2)"
                borderRadius="full"
              />
              <Box h="6" w="6" bg="rgba(229,190,236,0.2)" borderRadius="full" />
            </Flex>
          </Flex>

          {/* Right side buttons */}
          <Flex
            alignItems="center"
            gap={2}
            w={['100%', '100%', 'auto']}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
          >
            <Box h="8" w="24" bg="rgba(229,190,236,0.2)" borderRadius="full" />
            <Box h="8" w="8" bg="rgba(229,190,236,0.2)" borderRadius="full" />
          </Flex>
        </Flex>

        {/* Bottom section */}
        <Flex
          flexDirection={['column', 'column', 'row']}
          justifyContent="space-between"
          alignItems={{ base: 'flex-start', md: 'center' }}
          gap={2}
        >
          {/* Theme selector */}
          <Flex gap={2} alignItems="center">
            <Box h="8" w="40" bg="rgba(229,190,236,0.2)" borderRadius="md" />
            <Box h="6" w="24" bg="rgba(229,190,236,0.2)" borderRadius="full" />
          </Flex>

          {/* Date and read time */}
          <Box h="6" w="40" bg="rgba(229,190,236,0.2)" borderRadius="md" />
        </Flex>
      </Flex>
    </Box>
  )
}

export default ArticleHeaderSkeleton
