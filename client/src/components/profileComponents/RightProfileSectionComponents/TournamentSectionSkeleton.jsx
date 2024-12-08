import React from 'react'
import { keyframes } from '@emotion/react'
import { Box, Flex, VStack } from '@chakra-ui/react'

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`

// Base skeleton component
const BaseSkeletonBox = ({
  height,
  width,
  borderRadius = '10px',
  ...props
}) => (
  <Box
    height={height}
    width={width}
    borderRadius={borderRadius}
    background="linear-gradient(90deg, rgba(78, 67, 132, 0.4) 25%, rgba(108, 93, 182, 0.6) 37%, rgba(78, 67, 132, 0.4) 63%)"
    backgroundSize="1000px 100%"
    animation={`${shimmer} 2s infinite linear`}
    {...props}
  />
)

// Graph skeleton
const GraphSkeleton = () => (
  <VStack spacing={4} align="stretch" w={{ base: '100%', xl: '40%' }}>
    {/* Graph header */}
    <Flex align="center" gap={2}>
      <BaseSkeletonBox height="32px" width="32px" borderRadius="md" />
      <BaseSkeletonBox height="24px" width="200px" />
    </Flex>

    {/* Graph area */}
    <Box
      h={{ base: '300px', md: '310px' }}
      w="100%"
      position="relative"
      overflow="hidden"
    >
      <BaseSkeletonBox height="100%" width="100%" />
    </Box>

    {/* Rank indicator */}
    <Flex w="100%" justifyContent="center">
      <BaseSkeletonBox height="60px" width="200px" />
    </Flex>
  </VStack>
)

// Category stats grid skeleton
const CategoryStatsSkeleton = () => (
  <VStack
    spacing={6}
    align="stretch"
    w={{ base: '100%', xl: '55%' }}
    mt={{ base: 8, xl: 0 }}
  >
    {/* Trophy section */}
    <Flex
      direction="column"
      align="center"
      justify="center"
      bg="rgba(128, 90, 213, 0.1)"
      borderRadius="lg"
      p={4}
    >
      <BaseSkeletonBox height="32px" width="32px" borderRadius="full" mb={2} />
      <BaseSkeletonBox height="28px" width="250px" mb={2} />
      <BaseSkeletonBox height="16px" width="200px" />
    </Flex>

    {/* Category stats grid */}
    <Flex flexWrap="wrap" gap={4} justify="center">
      {[1, 2, 3, 4, 5, 6].map((_, index) => (
        <Box
          key={index}
          w={{ base: '45%', xl: '30%' }}
          h="150px"
          bgGradient="linear(to-b, rgba(45, 35, 90, 0.7), rgba(35, 25, 70, 0.7))"
          border="1px solid rgba(108, 93, 182, 0.3)"
          borderRadius="lg"
          p={4}
        >
          <VStack spacing={3}>
            <BaseSkeletonBox height="24px" width="80%" />
            <BaseSkeletonBox height="40px" width="60%" borderRadius="full" />
            <BaseSkeletonBox height="16px" width="70%" />
          </VStack>
        </Box>
      ))}
    </Flex>

    {/* Analytics button */}
    <BaseSkeletonBox height="50px" width="100%" />
  </VStack>
)

// Main tournament section skeleton
export const TournamentSectionSkeleton = () => {
  return (
    <Box w="full" mx="auto" p={{ base: 4, md: 6 }} borderRadius="lg">
      <VStack spacing={8} align="stretch">
        <Flex
          direction={{ base: 'column', xl: 'row' }}
          justify="space-between"
          align={{ base: 'center', xl: 'flex-start' }}
        >
          <GraphSkeleton />
          <CategoryStatsSkeleton />
        </Flex>
      </VStack>
    </Box>
  )
}

export default TournamentSectionSkeleton
