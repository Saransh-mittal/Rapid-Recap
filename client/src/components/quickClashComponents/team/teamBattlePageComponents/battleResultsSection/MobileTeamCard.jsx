// components/quickClashComponents/team/teamBattlePageComponents/battleResultsSection/MobileTeamCard.jsx
import React, { memo, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Flex,
  Text,
  Badge,
  Icon,
  Progress,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Target, TrendingUp, TrendingDown, Crown } from 'lucide-react'

import MobileStatItem from './MobileStatItem'
import {
  calculateTrophyChange,
  getCompletedChallenges,
} from './battleResultsUtils'

const MotionBox = motion(Box)

/**
 * Responsive Team Card Component
 */
const MobileTeamCard = memo(
  ({
    displayTeam, // Always "A" or "B" for display
    actualTeam, // The actual team ("A" or "B") in the battle data
    data,
    wins,
    totalScore,
    challenges,
    trophyExchange,
    isWinner,
    isTie,
    isUserTeam,
  }) => {
    const { t } = useTranslation('QuickClash')

    const teamColor = displayTeam === 'A' ? 'blue' : 'red'

    // Responsive values
    const cardPadding = useBreakpointValue({
      base: 3,
      md: 4,
      lg: 5,
    })

    const spacing = useBreakpointValue({
      base: 3,
      md: 4,
      lg: 5,
    })

    const badgeFontSize = useBreakpointValue({
      base: 'sm',
      md: 'md',
      lg: 'md',
    })

    const teamNameFontSize = useBreakpointValue({
      base: 'sm',
      md: 'md',
      lg: 'lg',
    })

    const scoreFontSize = useBreakpointValue({
      base: 'lg',
      md: 'xl',
      lg: '2xl',
    })

    const progressLabelFontSize = useBreakpointValue({
      base: 'xs',
      md: 'sm',
      lg: 'sm',
    })

    const statSpacing = useBreakpointValue({
      base: 4,
      md: 6,
      lg: 8,
    })

    const crownSize = useBreakpointValue({
      base: 4,
      md: 5,
      lg: 6,
    })

    // Memoized calculations
    const completedChallenges = useMemo(
      () => getCompletedChallenges(challenges, actualTeam),
      [challenges, actualTeam],
    )

    const trophyChange = useMemo(
      () => calculateTrophyChange(trophyExchange, isWinner, isTie),
      [trophyExchange, isWinner, isTie],
    )

    const progressPercentage = useMemo(
      () => (completedChallenges / challenges.length) * 100,
      [completedChallenges, challenges.length],
    )

    return (
      <MotionBox
        bg={`rgba(${
          teamColor === 'blue' ? '59, 130, 246' : '239, 68, 68'
        }, 0.1)`}
        borderRadius={{ base: 'lg', md: 'xl' }}
        p={cardPadding}
        border="1px solid"
        borderColor={`${teamColor}.500`}
        position="relative"
        overflow="hidden"
        w="100%"
        boxShadow={`0 4px 15px rgba(${
          teamColor === 'blue' ? '59, 130, 246' : '239, 68, 68'
        }, 0.15)`}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px rgba(${
            teamColor === 'blue' ? '59, 130, 246' : '239, 68, 68'
          }, 0.25)`,
        }}
        transition="all 0.3s ease"
      >
        {/* Winner Glow Effect */}
        {isWinner && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient={`radial(circle, rgba(${
              teamColor === 'blue' ? '59, 130, 246' : '239, 68, 68'
            }, 0.15) 0%, transparent 70%)`}
            opacity={0.6}
          />
        )}

        <VStack spacing={spacing} position="relative" zIndex={1}>
          {/* Team Header */}
          <Flex justify="space-between" align="center" w="100%">
            <HStack spacing={{ base: 2, md: 3 }}>
              <Badge
                colorScheme={teamColor}
                px={{ base: 3, md: 4 }}
                py={{ base: 1, md: 2 }}
                borderRadius="md"
                fontSize={badgeFontSize}
                fontWeight="bold"
              >
                {t(`Team ${displayTeam}`)}
              </Badge>
              <Text
                fontSize={teamNameFontSize}
                color="whiteAlpha.700"
                fontWeight="medium"
                noOfLines={1}
              >
                {data?.name || t(`Team ${displayTeam}`)}
              </Text>
              {isWinner && (
                <MotionBox
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon as={Crown} color="gold" boxSize={crownSize} />
                </MotionBox>
              )}
            </HStack>
            <Text
              fontWeight="bold"
              color={`${teamColor}.400`}
              fontSize={scoreFontSize}
              fontFamily="'Orbitron', sans-serif"
            >
              {totalScore} pts
            </Text>
          </Flex>

          {/* Stats Row - Responsive Layout */}
          <HStack justify="space-between" w="100%" spacing={statSpacing}>
            {/* Wins */}
            <MobileStatItem
              icon={Trophy}
              label={t('Wins')}
              value={wins}
              color="green.400"
            />

            {/* Challenges */}
            <MobileStatItem
              icon={Target}
              label={t('Challenges')}
              value={`${completedChallenges}/${challenges.length}`}
              color={`${teamColor}.400`}
            />

            {/* Trophy Change */}
            {trophyExchange && (
              <MobileStatItem
                icon={trophyChange > 0 ? TrendingUp : TrendingDown}
                label={t('Trophies')}
                value={`${trophyChange > 0 ? '+' : ''}${trophyChange}`}
                color={trophyChange > 0 ? 'green.400' : 'red.400'}
              />
            )}
          </HStack>

          {/* Progress Bar */}
          <Box w="100%">
            <Flex
              justify="space-between"
              align="center"
              mb={{ base: 1, md: 2 }}
            >
              <Text fontSize={progressLabelFontSize} color="whiteAlpha.600">
                {t('Progress')}
              </Text>
              <Text fontSize={progressLabelFontSize} color="whiteAlpha.600">
                {completedChallenges}/{challenges.length}
              </Text>
            </Flex>
            <Progress
              value={progressPercentage}
              colorScheme={teamColor}
              size={{ base: 'sm', md: 'md' }}
              borderRadius="full"
              bg="rgba(0, 0, 0, 0.3)"
            />
          </Box>
        </VStack>
      </MotionBox>
    )
  },
)

MobileTeamCard.displayName = 'MobileTeamCard'

export default MobileTeamCard
