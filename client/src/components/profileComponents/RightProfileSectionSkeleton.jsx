import { keyframes } from '@emotion/react'
import { Flex, Box } from '@chakra-ui/react'

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`

// Base skeleton component with shimmer effect
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

// Graph card skeleton component
const GraphCardSkeleton = () => (
  <Flex
    bgGradient="linear(to-b, rgba(45, 35, 90, 0.7), rgba(35, 25, 70, 0.7))"
    border="1px solid rgba(108, 93, 182, 0.3)"
    borderRadius="10px"
    padding="20px"
    flexDirection="column"
    width="100%"
    height="250px"
    gap={4}
  >
    {/* Header section */}
    <Flex justifyContent="space-between" mb={4}>
      <BaseSkeletonBox height="24px" width="120px" />
      <BaseSkeletonBox height="24px" width="80px" />
    </Flex>

    {/* Graph area */}
    <BaseSkeletonBox
      height="160px"
      width="100%"
      marginTop="auto"
      marginBottom="auto"
    />
  </Flex>
)

// Quiz stats card skeleton
const QuizStatsSkeleton = () => (
  <Flex
    bgGradient="linear(to-b, rgba(45, 35, 90, 0.7), rgba(35, 25, 70, 0.7))"
    border="1px solid rgba(108, 93, 182, 0.3)"
    borderRadius="10px"
    padding="20px"
    flexDirection="column"
    width="100%"
    height="250px"
    gap={4}
  >
    {/* Title */}
    <BaseSkeletonBox height="24px" width="140px" mb={2} />

    {/* Stats bars */}
    <Flex flexDirection="column" gap={4}>
      <BaseSkeletonBox height="30px" width="100%" />
      <BaseSkeletonBox height="30px" width="90%" />
      <BaseSkeletonBox height="30px" width="85%" />
    </Flex>
  </Flex>
)

// Society card skeleton
const SocietyCardSkeleton = () => (
  <Flex
    bgGradient="linear(to-b, rgba(45, 35, 90, 0.7), rgba(35, 25, 70, 0.7))"
    border="1px solid rgba(108, 93, 182, 0.3)"
    borderRadius="10px"
    padding="20px"
    flexDirection="column"
    width="100%"
    height="250px"
    gap={4}
  >
    {/* Title */}
    <BaseSkeletonBox height="24px" width="160px" />

    {/* Society content */}
    <Flex justifyContent="space-around" alignItems="center" height="100%">
      <BaseSkeletonBox height="100px" width="100px" borderRadius="full" />
      <BaseSkeletonBox height="80px" width="2px" />
      <BaseSkeletonBox height="100px" width="100px" borderRadius="full" />
    </Flex>
  </Flex>
)

// Main right profile section skeleton
export const RightProfileSectionSkeleton = () => {
  return (
    <Flex
      w="100%"
      flexDirection="column"
      margin="6px"
      alignItems="center"
      gap={5}
    >
      {/* Top row with graphs */}
      <Flex
        w="100%"
        margin="10px"
        marginBottom="5px"
        flexDirection={{ xl: 'row', base: 'column' }}
        justifyContent="space-between"
        gap={5}
      >
        <GraphCardSkeleton />
        <GraphCardSkeleton />
      </Flex>

      {/* Bottom section */}
      <Flex
        flexDirection="column"
        gap="10px"
        w="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Flex
          w="100%"
          margin="10px"
          marginBottom="5px"
          flexDirection={{ xl: 'row', base: 'column' }}
          justifyContent="space-between"
          gap={5}
        >
          <QuizStatsSkeleton />
          <SocietyCardSkeleton />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default RightProfileSectionSkeleton
