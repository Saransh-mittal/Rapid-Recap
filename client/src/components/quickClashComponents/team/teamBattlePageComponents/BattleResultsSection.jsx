// components/quickClashComponents/team/teamBattlePageComponents/BattleResultsSection.jsx
import React, { useState, useEffect, useMemo, memo } from 'react'
import { Box, VStack, Grid } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Import optimized subcomponents
import ResultHeader from './battleResultsSection/ResultHeader'
import MobileScoreDisplay from './battleResultsSection/MobileScoreDisplay'
import MobileTeamCard from './battleResultsSection/MobileTeamCard'
import MobileTrophyBonuses from './battleResultsSection/MobileTrophyBonuses'
import CelebrationParticles from './battleResultsSection/CelebrationParticles'
import { calculateResultData } from './battleResultsSection/battleResultsUtils'

const MotionBox = motion(Box)

/**
 * Optimized Battle Results Section - Main Component
 * Broken down into smaller, maintainable components with performance optimizations
 */
const BattleResultsSection = memo(({ currentBattle, userTeam, variants }) => {
  const { t } = useTranslation('QuickClash')
  const [showCelebration, setShowCelebration] = useState(false)
  const [animationPhase, setAnimationPhase] = useState('initial')

  // Early return for non-completed battles
  if (currentBattle.status !== 'completed') return null

  // Memoized result calculations
  const resultData = useMemo(
    () => calculateResultData(currentBattle, userTeam),
    [currentBattle, userTeam],
  )

  // Optimized animation sequence
  useEffect(() => {
    let timeouts = []

    const runSequence = async () => {
      setAnimationPhase('reveal')

      timeouts.push(
        setTimeout(() => {
          setAnimationPhase('details')
        }, 400),
      )

      if (resultData.isUserWinner) {
        timeouts.push(
          setTimeout(() => {
            setShowCelebration(true)
          }, 600),
        )
      }
    }

    runSequence()

    // Cleanup timeouts on unmount
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [resultData.isUserWinner])

  return (
    <MotionBox
      variants={variants}
      mx={{ base: 3, md: 6, lg: 8 }}
      mb={{ base: 6, md: 8, lg: 10 }}
      position="relative"
      overflow="hidden"
    >
      {/* Main Container */}
      <MotionBox
        bg="rgba(15, 23, 42, 0.95)"
        backdropFilter="blur(15px)"
        borderRadius={{ base: 'xl', md: '2xl' }}
        border="2px solid"
        borderColor={`${resultData.resultColor}.500`}
        position="relative"
        overflow="hidden"
        boxShadow={`0 0 25px rgba(${resultData.resultColorRgb}, 0.25)`}
      >
        {/* Subtle Background Effect */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={`radial(circle at 50% 10%, rgba(${resultData.resultColorRgb}, 0.08) 0%, transparent 50%)`}
          opacity={0.8}
        />

        {/* Celebration Particles */}
        <AnimatePresence>
          {showCelebration && resultData.isUserWinner && (
            <CelebrationParticles />
          )}
        </AnimatePresence>

        <VStack
          spacing={{ base: 4, md: 6, lg: 8 }}
          p={{ base: 4, md: 6, lg: 8 }}
          position="relative"
          zIndex={1}
        >
          {/* Header with Result Badge */}
          <ResultHeader
            resultData={resultData}
            animationPhase={animationPhase}
            t={t}
          />

          {/* Score Display */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={
              animationPhase === 'details'
                ? { opacity: 1, y: 0 }
                : animationPhase === 'reveal'
                ? { opacity: 0.3, y: 10 }
                : {}
            }
            transition={{ duration: 0.4, delay: 0.1 }}
            w="100%"
          >
            <MobileScoreDisplay
              currentBattle={currentBattle}
              userTeam={userTeam}
              resultData={resultData}
            />
          </MotionBox>

          {/* Team Cards */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={animationPhase === 'details' ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            w="100%"
          >
            {/* Mobile Layout - Stacked */}
            <VStack spacing={3} display={{ base: 'flex', lg: 'none' }}>
              {/* User's Team (always displayed as Team A) */}
              <MobileTeamCard
                displayTeam="A"
                actualTeam={userTeam === 'teamA' ? 'A' : 'B'}
                data={
                  userTeam === 'teamA'
                    ? currentBattle.teamA
                    : currentBattle.teamB
                }
                wins={
                  userTeam === 'teamA'
                    ? currentBattle.teamAWins
                    : currentBattle.teamBWins
                }
                totalScore={
                  userTeam === 'teamA'
                    ? currentBattle.teamATotalScore
                    : currentBattle.teamBTotalScore
                }
                challenges={currentBattle.challenges}
                trophyExchange={currentBattle.trophyExchange}
                isWinner={resultData.isUserWinner}
                isTie={resultData.isTie}
                isUserTeam={true}
              />

              {/* Opponent's Team (always displayed as Team B) */}
              <MobileTeamCard
                displayTeam="B"
                actualTeam={userTeam === 'teamA' ? 'B' : 'A'}
                data={
                  userTeam === 'teamA'
                    ? currentBattle.teamB
                    : currentBattle.teamA
                }
                wins={
                  userTeam === 'teamA'
                    ? currentBattle.teamBWins
                    : currentBattle.teamAWins
                }
                totalScore={
                  userTeam === 'teamA'
                    ? currentBattle.teamBTotalScore
                    : currentBattle.teamATotalScore
                }
                challenges={currentBattle.challenges}
                trophyExchange={currentBattle.trophyExchange}
                isWinner={
                  currentBattle.winner ===
                  (userTeam === 'teamA' ? 'teamB' : 'teamA')
                }
                isTie={resultData.isTie}
                isUserTeam={false}
              />
            </VStack>

            {/* Desktop/Tablet Layout - Side by Side */}
            <Grid
              templateColumns="repeat(2, 1fr)"
              gap={6}
              display={{ base: 'none', lg: 'grid' }}
            >
              {/* User's Team (always displayed as Team A) */}
              <MobileTeamCard
                displayTeam="A"
                actualTeam={userTeam === 'teamA' ? 'A' : 'B'}
                data={
                  userTeam === 'teamA'
                    ? currentBattle.teamA
                    : currentBattle.teamB
                }
                wins={
                  userTeam === 'teamA'
                    ? currentBattle.teamAWins
                    : currentBattle.teamBWins
                }
                totalScore={
                  userTeam === 'teamA'
                    ? currentBattle.teamATotalScore
                    : currentBattle.teamBTotalScore
                }
                challenges={currentBattle.challenges}
                trophyExchange={currentBattle.trophyExchange}
                isWinner={resultData.isUserWinner}
                isTie={resultData.isTie}
                isUserTeam={true}
              />

              {/* Opponent's Team (always displayed as Team B) */}
              <MobileTeamCard
                displayTeam="B"
                actualTeam={userTeam === 'teamA' ? 'B' : 'A'}
                data={
                  userTeam === 'teamA'
                    ? currentBattle.teamB
                    : currentBattle.teamA
                }
                wins={
                  userTeam === 'teamA'
                    ? currentBattle.teamBWins
                    : currentBattle.teamAWins
                }
                totalScore={
                  userTeam === 'teamA'
                    ? currentBattle.teamBTotalScore
                    : currentBattle.teamATotalScore
                }
                challenges={currentBattle.challenges}
                trophyExchange={currentBattle.trophyExchange}
                isWinner={
                  currentBattle.winner ===
                  (userTeam === 'teamA' ? 'teamB' : 'teamA')
                }
                isTie={resultData.isTie}
                isUserTeam={false}
              />
            </Grid>
          </MotionBox>

          {/* Trophy Bonuses */}
          {currentBattle.trophyExchange && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                animationPhase === 'details' ? { opacity: 1, scale: 1 } : {}
              }
              transition={{ duration: 0.4, delay: 0.3 }}
              w="100%"
            >
              <MobileTrophyBonuses
                trophyExchange={currentBattle.trophyExchange}
              />
            </MotionBox>
          )}
        </VStack>
      </MotionBox>
    </MotionBox>
  )
})

BattleResultsSection.displayName = 'BattleResultsSection'

export default BattleResultsSection
