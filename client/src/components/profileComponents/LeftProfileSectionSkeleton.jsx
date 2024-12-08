import { keyframes } from '@emotion/react'
import { Flex, Box } from '@chakra-ui/react'

// Enhanced shimmer animation keyframes
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`

// Enhanced base skeleton with more visible gradient
const BaseSkeletonBox = ({
  height,
  width,
  borderRadius = '10px',
  ...props
}) => {
  return (
    <Box
      height={height}
      width={width}
      borderRadius={borderRadius}
      background="linear-gradient(90deg, rgba(78, 67, 132, 0.5) 25%, rgba(108, 93, 182, 0.8) 37%, rgba(78, 67, 132, 0.5) 63%)"
      backgroundSize="1000px 100%"
      animation={`${shimmer} 2s infinite linear`}
      boxShadow="0px 0px 15px rgba(108, 93, 182, 0.2)"
      {...props}
    />
  )
}

// Enhanced profile info skeleton
const ProfileInfoSkeleton = () => (
  <Flex
    bgGradient="linear(to-b, rgba(45, 35, 90, 0.7), rgba(35, 25, 70, 0.7))"
    border="1px solid rgba(108, 93, 182, 0.3)"
    borderRadius="10px"
    marginTop={'18px'}
    padding="10px"
    flexDirection="column"
    width="100%"
    gap={4}
    boxShadow="0px 4px 20px rgba(0, 0, 0, 0.3)"
  >
    <Flex alignItems="center" gap={4}>
      <BaseSkeletonBox height="80px" width="80px" borderRadius="full" />
      <Flex flexDirection="column" flex={1} gap={2}>
        <BaseSkeletonBox height="24px" width="60%" />
        <BaseSkeletonBox height="20px" width="40%" />
      </Flex>
    </Flex>
    <BaseSkeletonBox height="24px" width="80%" />
    <BaseSkeletonBox height="20px" width="70%" />
  </Flex>
)

// Enhanced experience level skeleton
const ExperienceLevelSkeleton = () => (
  <Flex
    bgGradient="linear(to-b, rgba(45, 35, 90, 0.7), rgba(35, 25, 70, 0.7))"
    border="1px solid rgba(108, 93, 182, 0.3)"
    borderRadius="10px"
    padding="15px"
    flexDirection="column"
    width="100%"
    gap={4}
    boxShadow="0px 4px 20px rgba(0, 0, 0, 0.3)"
  >
    <BaseSkeletonBox height="28px" width="40%" />
    <Flex justifyContent="space-between" alignItems="center">
      <BaseSkeletonBox height="120px" width="120px" borderRadius="full" />
      <Flex flexDirection="column" flex={1} marginLeft={6} gap={3}>
        <BaseSkeletonBox height="24px" width="70%" />
        <BaseSkeletonBox height="20px" width="50%" />
        <BaseSkeletonBox height="20px" width="60%" />
      </Flex>
    </Flex>
  </Flex>
)

// Enhanced button skeleton
const ButtonSkeleton = () => (
  <BaseSkeletonBox
    height="50px"
    width="100%"
    marginTop="12px"
    boxShadow="0px 4px 15px rgba(108, 93, 182, 0.15)"
  />
)

// Main skeleton component
export const LeftProfileSectionSkeleton = () => {
  return (
    <Flex
      flexDirection="column"
      w={{ lg: '45%', sm: '100%', base: '100%' }}
      margin="6px"
      gap={3}
    >
      <ProfileInfoSkeleton />
      <ExperienceLevelSkeleton />
      <ButtonSkeleton />
      <ButtonSkeleton />
      <ButtonSkeleton />
    </Flex>
  )
}

export default LeftProfileSectionSkeleton
