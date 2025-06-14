// src/components/quizComponents/RQMScoreCard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CountingNumber from './CountingNumber.jsx'

const MotionBox = motion(Box)

// Memoized score calculations to prevent recalculation on re-renders
const useScoreCalculations = quizData => {
  return useMemo(() => {
    const baseScore = quizData?.baseRQM || quizData?.finalRQM
    const withPerformance = quizData?.performanceBonus
      ? parseInt((baseScore * quizData?.performanceBonus).toFixed(0))
      : baseScore
    const finalScore = quizData?.finalRQM

    return { baseScore, withPerformance, finalScore }
  }, [quizData?.baseRQM, quizData?.finalRQM, quizData?.performanceBonus])
}

// Memoized label calculations
const useScoreLabels = (baseScore, withPerformance, quizData, t) => {
  return useMemo(() => {
    const performanceLabel =
      baseScore < withPerformance
        ? t('performanceBonus', {
            bonus: ((parseFloat(quizData?.performanceBonus) - 1) * 100).toFixed(
              0,
            ),
          })
        : null

    const boostLabel = quizData?.isBoost
      ? t('quizBoost', { boost: ((quizData?.boost - 1) * 100).toFixed(0) })
      : null

    return { performanceLabel, boostLabel }
  }, [
    baseScore,
    withPerformance,
    quizData?.performanceBonus,
    quizData?.isBoost,
    quizData?.boost,
    t,
  ])
}

// Memoized header component
const ScoreHeader = React.memo(({ isTournament, t }) => (
  <Flex alignItems="center" gap={2} mb={6}>
    <Icon
      as={Brain}
      boxSize={5}
      color={isTournament ? 'yellow.400' : 'purple.400'}
    />
    <Text fontSize="sm" fontWeight="medium" color="purple.200">
      {t('rqmScore')}
    </Text>
  </Flex>
))

const TimeDilationBadge = React.memo(({ t }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{
      delay: 0.5,
      duration: 0.3,
      type: 'spring',
      stiffness: 260,
      damping: 20,
    }}
  >
    <Flex
      position="absolute"
      top="-25px"
      right="-35px"
      bg="rgba(139, 92, 246, 0.9)"
      backdropFilter="blur(8px)"
      rounded="full"
      px={2}
      py={1}
      alignItems="center"
      gap={1}
      border="1px solid rgba(255, 255, 255, 0.2)"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      w={'max-content'}
    >
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <Clock size={14} color="white" />
      </motion.div>
      <Text
        fontSize="xs"
        color="white"
        fontWeight="semibold"
        textShadow="0 1px 2px rgba(0, 0, 0, 0.2)"
      >
        {t('Time Dilated')}
      </Text>
    </Flex>
  </motion.div>
))

const FinalScoreDisplay = React.memo(
  ({ finalScore, isTournament, timeDilationBoosted, t }) => (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
        willChange: 'transform',
      }}
      style={{ position: 'relative' }}
    >
      <MotionBox
        position="absolute"
        inset="-16px"
        rounded="xl"
        bgGradient="linear(to-r, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))"
        filter="blur(16px)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{ willChange: 'opacity' }}
      />
      <Text
        fontSize="4xl"
        fontWeight="bold"
        bgGradient={
          isTournament
            ? 'linear(to-r, yellow.400, orange.400)'
            : 'linear(to-r, purple.400, pink.400)'
        }
        bgClip="text"
        style={{ willChange: 'transform' }}
      >
        {finalScore}
      </Text>

      {timeDilationBoosted && <TimeDilationBadge t={t} />}
    </motion.div>
  ),
)

const RQMScoreCard = React.memo(
  ({ step, quizData, isTournament, animationDelay }) => {
    const { t } = useTranslation('SubmittedQuizInterface')
    const [rqmStep, setRqmStep] = useState(0)

    // Memoized calculations
    const { baseScore, withPerformance, finalScore } =
      useScoreCalculations(quizData)
    const { performanceLabel, boostLabel } = useScoreLabels(
      baseScore,
      withPerformance,
      quizData,
      t,
    )

    // Use RAF for smoother stepping
    useEffect(() => {
      if (step >= 1) {
        let frameId
        let lastStepTime = performance.now()
        const stepInterval = 1500

        const updateStep = timestamp => {
          if (timestamp - lastStepTime >= stepInterval) {
            setRqmStep(prev => {
              if (prev < 3) {
                lastStepTime = timestamp
                return prev + 1
              }
              return prev
            })
          }
          if (rqmStep < 3) {
            frameId = requestAnimationFrame(updateStep)
          }
        }

        frameId = requestAnimationFrame(updateStep)
        return () => cancelAnimationFrame(frameId)
      }
    }, [step])

    // Memoized render function
    const renderRQMScore = useCallback(() => {
      switch (rqmStep) {
        case 0:
          return (
            <Text
              fontSize="4xl"
              fontWeight="bold"
              bgGradient={
                isTournament
                  ? 'linear(to-r, yellow.400, orange.400)'
                  : 'linear(to-r, purple.400, pink.400)'
              }
              bgClip="text"
              style={{ willChange: 'transform' }}
            >
              {baseScore}
            </Text>
          )
        case 1:
          return (
            <CountingNumber
              from={baseScore}
              to={withPerformance}
              duration={2}
              label={performanceLabel}
              color="green.400"
            />
          )
        case 2:
          return (
            <CountingNumber
              from={withPerformance}
              to={finalScore}
              duration={3}
              label={boostLabel}
              color="blue.400"
            />
          )
        default:
          return (
            <FinalScoreDisplay
              finalScore={finalScore}
              timeDilationBoosted={quizData?.timeDilationBoosted}
              isTournament={isTournament}
              t={t}
            />
          )
      }
    }, [
      rqmStep,
      baseScore,
      withPerformance,
      finalScore,
      performanceLabel,
      boostLabel,
      isTournament,
    ])

    if (step < 2) return null

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: animationDelay,
          ease: 'easeOut',
        }}
        bg="whiteAlpha.50"
        rounded="xl"
        p={6}
        borderWidth={1}
        borderColor="whiteAlpha.100"
        w={{
          base: '100%',
          md:
            !quizData?.iqData ||
            Object.keys(quizData?.iqData).length === 0 ||
            Object.values(quizData?.iqData).every(
              val => val === null || val === undefined,
            )
              ? '100%'
              : '50%',
        }}
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      >
        <ScoreHeader isTournament={isTournament} t={t} />

        <Box
          h="80px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ willChange: 'transform' }}
        >
          <AnimatePresence mode="wait">{renderRQMScore()}</AnimatePresence>
        </Box>
      </MotionBox>
    )
  },
)

export default RQMScoreCard
