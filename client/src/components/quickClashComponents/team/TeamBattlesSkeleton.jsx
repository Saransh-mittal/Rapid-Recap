// components/quickClashComponents/team/TeamBattlesSkeleton.jsx
import React, { memo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  Icon,
  useBreakpointValue,
  Progress,
  Center,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Users, Target, Clock, Swords } from 'lucide-react'

const MotionBox = motion(Box)

// Enhanced skeleton for team battle header stats
const HeaderStatsSkeleton = memo(() => {
  const statSize = useBreakpointValue({ base: 'sm', md: 'md' })

  return (
    <Flex justify="center" mb={6} gap={{ base: 3, md: 6 }} wrap="wrap">
      {/* Home Button Skeleton */}
      <Skeleton
        height="40px"
        width="120px"
        borderRadius="full"
        startColor="rgba(255, 255, 255, 0.05)"
        endColor="rgba(255, 255, 255, 0.1)"
      />

      {/* Trophy Count Skeleton */}
      <Box
        bg="rgba(255, 193, 7, 0.1)"
        borderRadius="full"
        px={4}
        py={2}
        borderWidth="1px"
        borderColor="rgba(255, 193, 7, 0.3)"
      >
        <HStack spacing={2}>
          <Icon as={Trophy} color="yellow.400" boxSize={5} />
          <Skeleton
            height="20px"
            width="40px"
            startColor="rgba(255, 193, 7, 0.2)"
            endColor="rgba(255, 193, 7, 0.4)"
          />
        </HStack>
      </Box>

      {/* Star Count Skeleton */}
      <Skeleton
        height="40px"
        width="80px"
        borderRadius="full"
        startColor="rgba(255, 215, 0, 0.1)"
        endColor="rgba(255, 215, 0, 0.2)"
      />

      {/* Notification Skeleton */}
      <SkeletonCircle
        size="40px"
        startColor="rgba(124, 58, 237, 0.1)"
        endColor="rgba(124, 58, 237, 0.2)"
      />
    </Flex>
  )
})

// Enhanced skeleton for individual battle card
const BattleCardSkeleton = memo(({ isActive = true, index = 0 }) => {
  const padding = useBreakpointValue({ base: 3, md: 4 })
  const avatarSize = useBreakpointValue({ base: 'sm', md: 'md' })

  const borderColor = isActive ? 'green.500' : 'purple.500'
  const headerBg = isActive ? 'green.600' : 'purple.600'
  const statusColor = isActive ? 'green' : 'purple'

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="xl"
      borderWidth="2px"
      borderColor={borderColor}
      overflow="hidden"
      position="relative"
    >
      {/* Header with Status Badge */}
      <Flex
        bg={headerBg}
        px={padding}
        py={2}
        justify="space-between"
        align="center"
      >
        {/* Status Badge Skeleton */}
        <HStack bg="rgba(255, 255, 255, 0.2)" borderRadius="md" px={3} py={1}>
          <Icon as={isActive ? Swords : Trophy} color="white" boxSize={3} />
          <Skeleton
            height="16px"
            width="60px"
            startColor="rgba(255, 255, 255, 0.1)"
            endColor="rgba(255, 255, 255, 0.3)"
          />
        </HStack>

        {/* 4v4 Badge Skeleton */}
        <Box
          bg="rgba(0, 0, 0, 0.3)"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="xs"
          fontWeight="bold"
        >
          4V4
        </Box>
      </Flex>

      {/* Progress Section */}
      <Box px={padding} pt={3}>
        <Flex justify="space-between" align="center" mb={2}>
          <HStack spacing={1}>
            <Icon as={Target} color="purple.400" boxSize={3} />
            <Text fontSize="xs" color="whiteAlpha.700">
              Progress
            </Text>
          </HStack>
          <Skeleton
            height="14px"
            width="30px"
            startColor="rgba(255, 255, 255, 0.1)"
            endColor="rgba(255, 255, 255, 0.2)"
          />
        </Flex>
        <Progress
          value={isActive ? 25 : 100}
          size="sm"
          colorScheme={statusColor}
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.1)"
        />
      </Box>

      {/* Teams Section */}
      <Flex px={padding} py={4} justify="space-between" align="center">
        {/* Left Team */}
        <VStack spacing={2} align="center" flex="1">
          {/* Team Name Skeleton */}
          <Skeleton
            height="18px"
            width="100px"
            startColor="rgba(255, 255, 255, 0.1)"
            endColor="rgba(255, 255, 255, 0.2)"
          />

          {/* Avatar Group Skeleton */}
          <HStack spacing="-1">
            <SkeletonCircle
              size={avatarSize === 'sm' ? '32px' : '40px'}
              startColor="rgba(66, 153, 225, 0.2)"
              endColor="rgba(66, 153, 225, 0.4)"
            />
            <SkeletonCircle
              size={avatarSize === 'sm' ? '32px' : '40px'}
              startColor="rgba(66, 153, 225, 0.2)"
              endColor="rgba(66, 153, 225, 0.4)"
            />
            {/* +2 indicator */}
            <Center
              w={avatarSize === 'sm' ? '32px' : '40px'}
              h={avatarSize === 'sm' ? '32px' : '40px'}
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
              borderWidth="2px"
              borderColor="rgba(255, 255, 255, 0.3)"
              fontSize="xs"
              fontWeight="bold"
              color="white"
            >
              +2
            </Center>
          </HStack>

          {/* Score Skeleton */}
          <Skeleton
            height="24px"
            width="20px"
            startColor="rgba(66, 153, 225, 0.2)"
            endColor="rgba(66, 153, 225, 0.4)"
          />
        </VStack>

        {/* VS Section */}
        <VStack spacing={2} px={3}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="whiteAlpha.600"
            letterSpacing="wider"
          >
            VS
          </Text>

          {/* Action Button Skeleton */}
          <Skeleton
            height="32px"
            width="80px"
            borderRadius="md"
            startColor={
              isActive ? 'rgba(72, 187, 120, 0.2)' : 'rgba(56, 178, 172, 0.2)'
            }
            endColor={
              isActive ? 'rgba(72, 187, 120, 0.4)' : 'rgba(56, 178, 172, 0.4)'
            }
          />
        </VStack>

        {/* Right Team */}
        <VStack spacing={2} align="center" flex="1">
          {/* Team Name Skeleton */}
          <Skeleton
            height="18px"
            width="80px"
            startColor="rgba(255, 255, 255, 0.1)"
            endColor="rgba(255, 255, 255, 0.2)"
          />

          {/* Avatar Group Skeleton */}
          <HStack spacing="-1">
            <SkeletonCircle
              size={avatarSize === 'sm' ? '32px' : '40px'}
              startColor="rgba(245, 101, 101, 0.2)"
              endColor="rgba(245, 101, 101, 0.4)"
            />
            <SkeletonCircle
              size={avatarSize === 'sm' ? '32px' : '40px'}
              startColor="rgba(245, 101, 101, 0.2)"
              endColor="rgba(245, 101, 101, 0.4)"
            />
            {/* +2 indicator */}
            <Center
              w={avatarSize === 'sm' ? '32px' : '40px'}
              h={avatarSize === 'sm' ? '32px' : '40px'}
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
              borderWidth="2px"
              borderColor="rgba(255, 255, 255, 0.3)"
              fontSize="xs"
              fontWeight="bold"
              color="white"
            >
              +2
            </Center>
          </HStack>

          {/* Score Skeleton */}
          <Skeleton
            height="24px"
            width="20px"
            startColor="rgba(245, 101, 101, 0.2)"
            endColor="rgba(245, 101, 101, 0.4)"
          />
        </VStack>
      </Flex>

      {/* Footer - Time Info */}
      <Box
        px={padding}
        py={2}
        borderTop="1px"
        borderColor="whiteAlpha.100"
        bg="rgba(0, 0, 0, 0.2)"
      >
        <HStack spacing={1} justify="center" fontSize="xs" color="blue.400">
          <Icon as={Clock} boxSize={3} />
          <Skeleton
            height="14px"
            width="120px"
            startColor="rgba(66, 153, 225, 0.2)"
            endColor="rgba(66, 153, 225, 0.4)"
          />
        </HStack>
      </Box>
    </MotionBox>
  )
})

// Battle Section Header Skeleton
const SectionHeaderSkeleton = memo(({ title, icon, isActive = true }) => {
  const padding = useBreakpointValue({ base: 2, md: 4 })
  const iconSize = useBreakpointValue({ base: 4, md: 5 })

  return (
    <Flex
      bg="rgba(26, 32, 44, 0.6)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      p={padding}
      justify="space-between"
      align="center"
      mb={4}
    >
      <HStack spacing={3}>
        <Icon
          as={icon}
          color={isActive ? 'green.400' : 'purple.400'}
          boxSize={iconSize}
        />
        <Skeleton
          height="20px"
          width="120px"
          startColor="rgba(255, 255, 255, 0.1)"
          endColor="rgba(255, 255, 255, 0.2)"
        />
        <SkeletonCircle
          size="24px"
          startColor={
            isActive ? 'rgba(72, 187, 120, 0.2)' : 'rgba(124, 58, 237, 0.2)'
          }
          endColor={
            isActive ? 'rgba(72, 187, 120, 0.4)' : 'rgba(124, 58, 237, 0.4)'
          }
        />
      </HStack>

      <HStack spacing={2}>
        <SkeletonCircle
          size="32px"
          startColor="rgba(124, 58, 237, 0.1)"
          endColor="rgba(124, 58, 237, 0.2)"
        />
        <SkeletonCircle
          size="32px"
          startColor="rgba(124, 58, 237, 0.1)"
          endColor="rgba(124, 58, 237, 0.2)"
        />
      </HStack>
    </Flex>
  )
})

// Main TeamBattlesSkeleton Component
const TeamBattlesSkeleton = memo(() => {
  const containerPadding = useBreakpointValue({ base: 1, md: 4 })
  const sectionSpacing = useBreakpointValue({ base: 4, md: 6 })
  const headerSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const columns = useBreakpointValue({ base: 1, md: 2 })

  return (
    <Box
      width="100%"
      maxWidth="100vw"
      overflow="hidden"
      px={containerPadding}
      className="team-battles-skeleton"
    >
      {/* Header Stats Skeleton */}
      <HeaderStatsSkeleton />

      {/* Page Title Skeleton */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        textAlign="center"
        mb={sectionSpacing}
      >
        <HStack spacing={3} justify="center" mb={2}>
          <Icon as={Users} boxSize={6} color="purple.400" />
          <Skeleton
            height="28px"
            width="160px"
            startColor="rgba(255, 255, 255, 0.1)"
            endColor="rgba(255, 255, 255, 0.2)"
          />
        </HStack>
        <Skeleton
          height="16px"
          width="280px"
          mx="auto"
          startColor="rgba(255, 255, 255, 0.05)"
          endColor="rgba(255, 255, 255, 0.1)"
        />
      </MotionBox>

      <VStack spacing={sectionSpacing} align="stretch">
        {/* Active Battles Section */}
        <Box>
          <SectionHeaderSkeleton
            title="Active Battles"
            icon={Swords}
            isActive={true}
          />

          {/* Active Battle Card */}
          <BattleCardSkeleton isActive={true} index={0} />
        </Box>

        {/* Completed Battles Section */}
        <Box>
          <SectionHeaderSkeleton
            title="Completed Battles"
            icon={Trophy}
            isActive={false}
          />

          {/* Date Header Skeleton */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            mb={3}
          >
            <HStack
              bg="rgba(124, 58, 237, 0.1)"
              borderRadius="full"
              px={4}
              py={2}
              borderWidth="1px"
              borderColor="rgba(124, 58, 237, 0.3)"
              maxW="200px"
            >
              <Icon as={Clock} color="purple.400" boxSize={4} />
              <Skeleton
                height="16px"
                width="100px"
                startColor="rgba(124, 58, 237, 0.2)"
                endColor="rgba(124, 58, 237, 0.4)"
              />
            </HStack>
          </MotionBox>

          {/* Completed Battle Cards */}
          {columns === 1 ? (
            <VStack spacing={4}>
              <BattleCardSkeleton isActive={false} index={0} />
            </VStack>
          ) : (
            <Flex gap={4} wrap="wrap">
              <Box flex="1" minW="300px">
                <BattleCardSkeleton isActive={false} index={0} />
              </Box>
              <Box flex="1" minW="300px">
                <BattleCardSkeleton isActive={false} index={1} />
              </Box>
            </Flex>
          )}
        </Box>
      </VStack>

      {/* Loading indicator at bottom */}
      <Center py={6} mt={4}>
        <MotionBox
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <HStack spacing={2}>
            {[...Array(3)].map((_, i) => (
              <SkeletonCircle
                key={i}
                size="8px"
                startColor="rgba(124, 58, 237, 0.3)"
                endColor="rgba(124, 58, 237, 0.6)"
              />
            ))}
          </HStack>
        </MotionBox>
      </Center>
    </Box>
  )
})

// Set display names for debugging
HeaderStatsSkeleton.displayName = 'HeaderStatsSkeleton'
BattleCardSkeleton.displayName = 'BattleCardSkeleton'
SectionHeaderSkeleton.displayName = 'SectionHeaderSkeleton'
TeamBattlesSkeleton.displayName = 'TeamBattlesSkeleton'

export default TeamBattlesSkeleton
