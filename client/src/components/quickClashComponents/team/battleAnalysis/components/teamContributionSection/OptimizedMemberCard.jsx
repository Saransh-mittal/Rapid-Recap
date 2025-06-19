// components/quickClashComponents/team/battleAnalysis/components/OptimizedMemberCard.jsx
import React, { useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  HStack,
  VStack,
  Avatar,
  Progress,
  Circle,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  ChevronDown,
  Shield,
  Check,
  X,
  Trophy,
  Star,
  Crown,
  Flame,
  Target,
  Award,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Helper functions for MVP/Performance colors, specific to this card
const getMVPBgColor = color => {
  switch (color) {
    case 'purple':
      return '139,92,246' // Corresponds to purple.500
    case 'green':
      return '16,185,129' // Corresponds to green.500 (approx)
    case 'orange':
      return '249,115,22' // Corresponds to orange.500 (approx)
    default:
      return '107,114,128' // Corresponds to gray.500
  }
}

const getPerformanceBgColor = color => {
  switch (color) {
    case 'purple':
      return '139,92,246'
    case 'green':
      return '16,185,129'
    case 'blue':
      return '59,130,246'
    case 'yellow':
      return '245,158,11' // Corresponds to yellow.500 (approx for F59E0B)
    case 'red':
      return '239,68,68' // Corresponds to red.500
    default:
      return '107,114,128'
  }
}

const OptimizedMemberCard = React.memo(
  ({
    member,
    isUserTeam,
    index,
    userId,
    performance,
    teamTotalScore,
    onMemberClick,
    isSelected,
    animationPhase,
    isMobile,
  }) => {
    const { t } = useTranslation('QuickClash')

    const isSelf = member.user._id === userId
    const canClick = isUserTeam

    const mvpStatus = useMemo(() => {
      if (member.isMatchMVP) {
        return {
          type: 'Match MVP',
          config: { color: 'purple', icon: Crown, label: 'MATCH MVP' },
        }
      } else if (member.isTeamMVP) {
        return {
          type: 'Team MVP',
          config: { color: 'green', icon: Trophy, label: 'TEAM MVP' },
        }
      } else if (member.isPivotalPlayer) {
        return {
          type: 'Pivotal Player',
          config: { color: 'orange', icon: Star, label: 'PIVOTAL' },
        }
      }
      return null
    }, [member])

    const isMVP = !!mvpStatus

    return (
      <motion.div
        key={member.user._id}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{
          opacity: animationPhase >= 1 ? 1 : 0,
          y: animationPhase >= 1 ? 0 : 10,
          scale: animationPhase >= 1 ? 1 : 0.98,
        }}
        transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
        whileHover={
          canClick && !isMobile ? { y: -2, transition: { duration: 0.2 } } : {}
        }
      >
        <Box
          bg={
            isSelf
              ? 'rgba(139, 92, 246, 0.12)'
              : isMVP
              ? `rgba(${getMVPBgColor(mvpStatus.config.color)},0.08)`
              : 'rgba(255, 255, 255, 0.03)'
          }
          backdropFilter={isMobile ? 'none' : 'blur(8px)'}
          borderRadius="xl"
          border="2px solid"
          borderColor={
            isSelf
              ? 'purple.500'
              : isMVP
              ? `${mvpStatus.config.color}.500`
              : isSelected && canClick
              ? `${performance.color}.400`
              : 'rgba(255, 255, 255, 0.1)'
          }
          p={3}
          position="relative"
          overflow="hidden"
          transition="all 0.2s ease-out"
          boxShadow={
            isMVP && !isMobile
              ? `0 0 15px rgba(${getMVPBgColor(mvpStatus.config.color)},0.3)`
              : isSelected && canClick && !isMobile
              ? `0 0 12px rgba(${getPerformanceBgColor(
                  performance.color,
                )},0.25)`
              : 'sm'
          }
          cursor={canClick ? 'pointer' : 'default'}
          onClick={canClick ? () => onMemberClick(member.user._id) : undefined}
          w="full"
        >
          {/* MVP Badge */}
          {isMVP && (
            <Badge
              position="absolute"
              top={1}
              left={1}
              bgGradient={`linear(to-r, ${mvpStatus.config.color}.600, ${mvpStatus.config.color}.700)`}
              color="white"
              px={1.5}
              py={0.5}
              borderRadius="full"
              fontSize="2xs"
              fontWeight="bold"
              textTransform="uppercase"
              zIndex={2}
              boxShadow="0 2px 4px rgba(0,0,0,0.2)"
            >
              <HStack spacing={0.5}>
                <Icon as={mvpStatus.config.icon} boxSize={2} />
                <span>{mvpStatus.config.label}</span>
              </HStack>
            </Badge>
          )}

          {/* Performance Grade Badge */}
          <Badge
            position="absolute"
            top={isMVP ? 6 : 2}
            right={2}
            bgGradient={performance.gradient}
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            zIndex={2}
          >
            {t('GRADE')}: {performance.tier}
          </Badge>

          <VStack spacing={3} align="stretch" pt={isMVP ? 6 : 0}>
            {/* Header Section */}
            <HStack spacing={2.5}>
              <Box position="relative">
                <Avatar
                  size="md"
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  border="2px solid"
                  borderColor={
                    isMVP
                      ? `${mvpStatus.config.color}.500`
                      : `${performance.color}.500`
                  }
                />
                <Circle
                  size="16px"
                  bg={
                    member.completed
                      ? 'green.400'
                      : member.participated
                      ? 'yellow.400'
                      : 'gray.500'
                  }
                  position="absolute"
                  bottom="-2px"
                  right="-2px"
                  border="2px solid"
                  borderColor={isSelf ? 'purple.600' : 'gray.800'}
                >
                  <Icon
                    as={
                      member.completed
                        ? Check
                        : member.participated
                        ? Activity
                        : X
                    }
                    boxSize={2}
                    color="white"
                  />
                </Circle>
                {isSelf && (
                  <Circle
                    size="18px"
                    bg="purple.500"
                    position="absolute"
                    top="-4px"
                    right="-4px"
                    border="2px solid white"
                    zIndex={1}
                  >
                    <Icon as={Crown} boxSize={2} color="white" />
                  </Circle>
                )}
              </Box>
              <VStack align="flex-start" spacing={0.5} flex={1} minW={0}>
                <Text
                  fontWeight="bold"
                  color="white"
                  fontSize="sm"
                  noOfLines={1}
                  title={member.user.name || member.user.inGameName}
                >
                  {member.user.name || member.user.inGameName}
                </Text>
                <HStack spacing={1} wrap="wrap">
                  {isSelf && (
                    <Badge
                      colorScheme="purple"
                      variant="subtle"
                      fontSize="3xs"
                      px={1}
                    >
                      {t('YOU')}
                    </Badge>
                  )}
                  {isMVP && (
                    <Badge
                      colorScheme={mvpStatus.config.color}
                      variant="solid"
                      fontSize="3xs"
                      px={1}
                    >
                      {mvpStatus.type}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="2xs" color="whiteAlpha.600" noOfLines={1}>
                  {t('Category')}: {member?.category?.toUpperCase() || t('N/A')}
                </Text>
              </VStack>
            </HStack>

            {/* Stats Section - UPDATED: Added Grade below score */}
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={1}>
                  <Icon
                    as={Trophy}
                    color={`${performance.color}.400`}
                    boxSize={3.5}
                  />
                  <Text color="whiteAlpha.800" fontSize="xs">
                    {t('Score')}
                  </Text>
                </HStack>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={`${performance.color}.300`}
                >
                  {member.score || 0}
                </Text>
              </HStack>

              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="2xs" color="whiteAlpha.700">
                    {t('Team Contribution')}
                  </Text>
                  <Text
                    fontSize="2xs"
                    color={`${performance.color}.400`}
                    fontWeight="semibold"
                  >
                    {Math.round(
                      ((member.score || 0) / Math.max(teamTotalScore, 1)) * 100,
                    )}
                    %
                  </Text>
                </HStack>
                <Progress
                  value={
                    ((member.score || 0) / Math.max(teamTotalScore, 1)) * 100
                  }
                  size="sm"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  sx={{ '& > div': { background: performance.gradient } }}
                />
              </Box>

              {member.trophyChange !== undefined && (
                <HStack justify="space-between">
                  <HStack spacing={1}>
                    <Icon
                      as={
                        member.trophyChange > 0
                          ? ArrowUp
                          : member.trophyChange < 0
                          ? ArrowDown
                          : Minus
                      }
                      color={
                        member.trophyChange > 0
                          ? 'green.400'
                          : member.trophyChange < 0
                          ? 'red.400'
                          : 'yellow.400'
                      }
                      boxSize={3}
                    />
                    <Text color="whiteAlpha.800" fontSize="xs">
                      {t('Trophies')}
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={
                      member.trophyChange > 0
                        ? 'green.300'
                        : member.trophyChange < 0
                        ? 'red.300'
                        : 'yellow.300'
                    }
                  >
                    {member.trophyChange > 0 ? '+' : ''}
                    {member.trophyChange}
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Expandable Details - simplified */}
            <AnimatePresence>
              {isSelected && canClick && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <VStack
                    spacing={2}
                    pt={2}
                    borderTop="1px dashed"
                    borderColor="whiteAlpha.200"
                  >
                    <Box
                      w="full"
                      p={2}
                      bg={`rgba(${getPerformanceBgColor(
                        performance.color,
                      )},0.1)`}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={`${performance.color}.600`}
                    >
                      <VStack spacing={1}>
                        <Text
                          fontSize="xs"
                          color={`${performance.color}.300`}
                          fontWeight="bold"
                        >
                          {t('Performance Level')}: {t(performance.levelKey)}
                        </Text>
                        <Text
                          fontSize="2xs"
                          color="whiteAlpha.700"
                          textAlign="center"
                        >
                          {performance.description}
                        </Text>
                      </VStack>
                    </Box>
                  </VStack>
                </motion.div>
              )}
            </AnimatePresence>
          </VStack>
        </Box>
      </motion.div>
    )
  },
)

OptimizedMemberCard.displayName = 'OptimizedMemberCard'
export default OptimizedMemberCard
