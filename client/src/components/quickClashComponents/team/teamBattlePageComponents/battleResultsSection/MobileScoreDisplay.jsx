// components/quickClashComponents/team/teamBattlePageComponents/battleResultsSection/MobileScoreDisplay.jsx
import React, { memo, useMemo } from 'react'
import { Box, VStack, HStack, Text, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  getUserTeamData,
  getOpponentTeamData,
  getWinnerText,
  getWinnerColor,
} from './battleResultsUtils'

const MotionBox = motion.div

/**
 * Responsive Score Display Component
 */
const MobileScoreDisplay = memo(({ currentBattle, userTeam, resultData }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const containerPadding = useBreakpointValue({
    base: 4,
    md: 6,
    lg: 8,
  })

  const spacing = useBreakpointValue({
    base: 3,
    md: 4,
    lg: 5,
  })

  const scoreFontSize = useBreakpointValue({
    base: '3xl',
    md: '4xl',
    lg: '5xl',
  })

  const dividerFontSize = useBreakpointValue({
    base: 'xl',
    md: '2xl',
    lg: '3xl',
  })

  const winnerFontSize = useBreakpointValue({
    base: 'md',
    md: 'lg',
    lg: 'xl',
  })

  const teamLabelFontSize = useBreakpointValue({
    base: 'xs',
    md: 'sm',
    lg: 'md',
  })

  const pointsFontSize = useBreakpointValue({
    base: 'sm',
    md: 'md',
    lg: 'lg',
  })

  const scoreSpacing = useBreakpointValue({
    base: 6,
    md: 8,
    lg: 10,
  })

  // Memoized team data calculations
  const userTeamData = useMemo(
    () => getUserTeamData(currentBattle, userTeam),
    [currentBattle, userTeam],
  )

  const opponentTeamData = useMemo(
    () => getOpponentTeamData(currentBattle, userTeam),
    [currentBattle, userTeam],
  )

  const winnerText = useMemo(
    () => getWinnerText(currentBattle, userTeam, t),
    [currentBattle, userTeam, t],
  )

  const winnerColor = useMemo(
    () => getWinnerColor(currentBattle, userTeam),
    [currentBattle, userTeam],
  )

  return (
    <Box
      bg="rgba(0, 0, 0, 0.3)"
      backdropFilter="blur(8px)"
      borderRadius={{ base: 'lg', md: 'xl' }}
      p={containerPadding}
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      maxW={{ base: '100%', md: '600px', lg: '700px' }}
      mx="auto"
    >
      <VStack spacing={spacing}>
        {/* Winner Announcement */}
        <Text
          fontSize={winnerFontSize}
          fontWeight="bold"
          color="white"
          textAlign="center"
          bg={`linear-gradient(135deg, ${winnerColor})`}
          bgClip="text"
          letterSpacing="wide"
        >
          {winnerText}
        </Text>

        {/* Compact Score */}
        <HStack spacing={scoreSpacing} justify="center" align="center">
          {/* User Team Score (Team A) */}
          <VStack spacing={{ base: 1, md: 2 }}>
            <MotionBox
              animate={{
                textShadow: [
                  '0 0 8px rgba(59, 130, 246, 0.4)',
                  '0 0 15px rgba(59, 130, 246, 0.6)',
                  '0 0 8px rgba(59, 130, 246, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Text
                fontSize={scoreFontSize}
                fontWeight="black"
                color="#3B82F6"
                fontFamily="'Orbitron', sans-serif"
                lineHeight="1"
              >
                {userTeamData.wins}
              </Text>
            </MotionBox>
            <Text
              fontSize={teamLabelFontSize}
              color="whiteAlpha.600"
              fontWeight="medium"
            >
              {t('Team A')}
            </Text>
          </VStack>

          {/* VS Divider */}
          <Text
            fontSize={dividerFontSize}
            fontWeight="bold"
            color="whiteAlpha.500"
            fontFamily="'Orbitron', sans-serif"
          >
            :
          </Text>

          {/* Opponent Team Score (Team B) */}
          <VStack spacing={{ base: 1, md: 2 }}>
            <MotionBox
              animate={{
                textShadow: [
                  '0 0 8px rgba(239, 68, 68, 0.4)',
                  '0 0 15px rgba(239, 68, 68, 0.6)',
                  '0 0 8px rgba(239, 68, 68, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Text
                fontSize={scoreFontSize}
                fontWeight="black"
                color="#EF4444"
                fontFamily="'Orbitron', sans-serif"
                lineHeight="1"
              >
                {opponentTeamData.wins}
              </Text>
            </MotionBox>
            <Text
              fontSize={teamLabelFontSize}
              color="whiteAlpha.600"
              fontWeight="medium"
            >
              {t('Team B')}
            </Text>
          </VStack>
        </HStack>

        {/* Points Summary */}
        <HStack
          spacing={{ base: 4, md: 6 }}
          justify="center"
          fontSize={pointsFontSize}
        >
          <Text color="#3B82F6" fontWeight="bold">
            {userTeamData.totalScore} pts
          </Text>
          <Text color="whiteAlpha.400">•</Text>
          <Text color="#EF4444" fontWeight="bold">
            {opponentTeamData.totalScore} pts
          </Text>
        </HStack>

        {/* Tiebreaker Info */}
        {userTeamData.wins === opponentTeamData.wins && (
          <Text
            fontSize={{ base: 'xs', md: 'sm' }}
            color="yellow.400"
            fontWeight="medium"
            bg="rgba(245, 158, 11, 0.1)"
            px={{ base: 3, md: 4 }}
            py={{ base: 1, md: 2 }}
            borderRadius="full"
            border="1px solid"
            borderColor="yellow.400"
          >
            🏆 {t('Tiebreaker: Total Points')}
          </Text>
        )}
      </VStack>
    </Box>
  )
})

MobileScoreDisplay.displayName = 'MobileScoreDisplay'

export default MobileScoreDisplay
