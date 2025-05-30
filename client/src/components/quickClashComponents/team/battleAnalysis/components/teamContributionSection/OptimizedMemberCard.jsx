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
    // mvpAwards, // This prop seems unused directly here if member already has mvp flags
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
      <motion.div // Use motion.div for layout prop if needed, or just Box
        key={member.user._id}
        // w="full" // Handled by GridItem in parent
        initial={{ opacity: 0, y: 10, scale: 0.98 }} // Reduced animation
        animate={{
          opacity: animationPhase >= 1 ? 1 : 0,
          y: animationPhase >= 1 ? 0 : 10,
          scale: animationPhase >= 1 ? 1 : 0.98,
        }}
        transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }} // Faster
        whileHover={
          canClick && !isMobile ? { y: -2, transition: { duration: 0.2 } } : {}
        } // Reduced hover effect
        // cursor={canClick ? 'pointer' : 'default'} // Apply cursor to Box
        // onClick={canClick ? () => onMemberClick(member.user._id) : undefined} // Apply onClick to Box
      >
        <Box
          bg={
            isSelf
              ? 'rgba(139, 92, 246, 0.12)' // Slightly reduced opacity
              : isMVP
              ? `rgba(${getMVPBgColor(mvpStatus.config.color)},0.08)` // Reduced opacity
              : 'rgba(255, 255, 255, 0.03)' // Reduced opacity
          }
          backdropFilter={isMobile ? 'none' : 'blur(8px)'} // Reduced blur, none on mobile
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
          p={3} // Reduced padding
          position="relative"
          overflow="hidden" // Keep hidden to ensure rounded corners clip content
          transition="all 0.2s ease-out" // Faster transition
          boxShadow={
            isMVP && !isMobile
              ? `0 0 15px rgba(${getMVPBgColor(mvpStatus.config.color)},0.3)` // Reduced shadow
              : isSelected && canClick && !isMobile
              ? `0 0 12px rgba(${getPerformanceBgColor(
                  performance.color,
                )},0.25)` // Reduced shadow
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
              top={1} // Stays close to top of padded area
              left={1} // Stays close to left of padded area
              bgGradient={`linear(to-r, ${mvpStatus.config.color}.600, ${mvpStatus.config.color}.700)`}
              color="white"
              px={1.5} // Reduced padding
              py={0.5}
              borderRadius="full"
              fontSize="2xs"
              fontWeight="bold"
              textTransform="uppercase"
              zIndex={2} // Ensure it's above other static content within padding
              boxShadow="0 2px 4px rgba(0,0,0,0.2)" // Reduced shadow
            >
              <HStack spacing={0.5}>
                <Icon as={mvpStatus.config.icon} boxSize={2} />
                <span>{mvpStatus.config.label}</span>
              </HStack>
            </Badge>
          )}

          {/* Performance Tier Badge */}
          <Badge
            position="absolute"
            top={isMVP ? 6 : 2} // Position adjusted if MVP badge is present
            right={2}
            bgGradient={performance.gradient}
            color="white"
            px={1.5} // Reduced padding
            py={0.5}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="bold"
            textTransform="uppercase"
            zIndex={2} // Ensure it's above other static content
          >
            {performance.tier}
          </Badge>

          <VStack spacing={3} align="stretch" pt={isMVP ? 6 : 0}>
            {/* Header Section */}
            <HStack spacing={2.5}>
              <Box position="relative">
                <Avatar
                  size="md" // Consistent size
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
                  size="16px" // Reduced size
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
                    size="18px" // Reduced size
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
                  fontSize="sm" // Reduced size
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
                  {/* This small text badge for MVP type might be redundant if the larger banner is prominent enough */}
                  {/* For now, keeping it as it was in the original */}
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
                  {t('Category')}: {member.category || t('N/A')}
                </Text>
              </VStack>
            </HStack>
            {/* Stats Section */}
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={1}>
                  <Icon
                    as={Trophy}
                    color={`${performance.color}.400`}
                    boxSize={3.5} // Reduced size
                  />
                  <Text color="whiteAlpha.800" fontSize="xs">
                    {t('Score')}
                  </Text>
                </HStack>
                <HStack spacing={1}>
                  <Text
                    fontSize="lg" // Reduced size
                    fontWeight="bold"
                    color={`${performance.color}.300`}
                  >
                    {member.score || 0}
                  </Text>
                  {performance.tier && (
                    <Badge
                      colorScheme={performance.color}
                      variant="outline"
                      fontSize="2xs"
                      px={1}
                    >
                      {performance.tier}
                    </Badge>
                  )}
                </HStack>
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
                      boxSize={3} // Reduced size
                    />
                    <Text color="whiteAlpha.800" fontSize="xs">
                      {t('Trophies')}
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm" // Reduced size
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
                <motion.div // use motion.div for layout prop
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }} // Faster
                  // layout // Add layout prop for smoother animation if needed
                >
                  <VStack
                    spacing={2}
                    pt={2} // Reduced padding
                    borderTop="1px dashed"
                    borderColor="whiteAlpha.200"
                  >
                    <Text
                      fontSize="2xs"
                      color="whiteAlpha.600"
                      textAlign="center"
                    >
                      {t('Detailed stats coming soon...')}
                    </Text>
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
