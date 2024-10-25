import React, { useState, useEffect, useMemo } from 'react'
import { Box, Flex, Icon, Text, VStack, Badge, Tooltip } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, PauseCircle, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setIsOpen } from '../../../redux/quizSlice'

// Correct motion component definitions
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)

// Memoized GuestBadge component
const GuestBadge = React.memo(({ t, inGameName, navigate }) => {
  const dispatch = useDispatch()
  return (
    <Tooltip label={t('loginToTrackIQ')} placement="bottom" hasArrow>
      <Box mb={10}>
        <MotionBadge
          variant="subtle"
          colorScheme="yellow"
          rounded="full"
          px={3}
          py={1}
          fontSize="xs"
          display="flex"
          alignItems="center"
          gap={2}
          cursor="pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          _hover={{
            bg: 'yellow.100',
            color: 'yellow.800',
          }}
          onClick={() => {
            navigate(`/profile/${inGameName}`)
            dispatch(setIsOpen(false))
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          <Text>{t('expectedScore')}</Text>
          <Icon as={LogIn} boxSize={3} />
        </MotionBadge>
      </Box>
    </Tooltip>
  )
})

// Memoized ScoreDifference component
const ScoreDifference = React.memo(({ difference, duration }) => (
  <MotionText
    fontSize="sm"
    color="yellow.300"
    opacity={0.7}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: duration, duration: 0.3 }}
    style={{ willChange: 'transform, opacity' }}
  >
    +{difference} points
  </MotionText>
))

// Memoized PreciseCountingNumber component
const PreciseCountingNumber = React.memo(
  ({ from, to, duration = 2, isGuest, needsOnboarding, inGameName }) => {
    const [displayNumber, setDisplayNumber] = useState(from || 0)
    const { t } = useTranslation('SubmittedQuizInterface')
    const navigate = useNavigate()

    useEffect(() => {
      if (isGuest) {
        setDisplayNumber(to)
        return
      }

      let frameId
      const startTime = performance.now()
      const totalDuration = duration * 1000

      const animate = currentTime => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / totalDuration, 1)

        setDisplayNumber(from + (to - from) * progress)

        if (progress < 1) {
          frameId = requestAnimationFrame(animate)
        }
      }

      frameId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(frameId)
    }, [from, to, duration, isGuest])

    const [integerPart, decimalPart] = useMemo(
      () => displayNumber?.toFixed(1).split('.'),
      [displayNumber],
    )

    const difference = useMemo(() => (to - from).toFixed(1), [to, from])

    return (
      <VStack spacing={2}>
        <MotionFlex
          alignItems="baseline"
          gap="1px"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{ willChange: 'transform' }}
        >
          <Text
            fontSize="4xl"
            fontWeight="bold"
            bgGradient="linear(to-r, yellow.400, orange.400)"
            bgClip="text"
          >
            {integerPart}
          </Text>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            bgGradient="linear(to-r, yellow.400, orange.400)"
            bgClip="text"
            opacity={0.8}
          >
            .{decimalPart}
          </Text>
        </MotionFlex>

        {isGuest
          ? !needsOnboarding && (
              <GuestBadge t={t} inGameName={inGameName} navigate={navigate} />
            )
          : difference > 0 && (
              <ScoreDifference difference={difference} duration={duration} />
            )}
      </VStack>
    )
  },
)

// Main IQScoreCard component
const IQScoreCard = React.memo(
  ({ step, quizData, isTournament, animationDelay }) => {
    const { t } = useTranslation('SubmittedQuizInterface')
    const [showAnimation, setShowAnimation] = useState(false)
    const { user } = useSelector(state => state.auth)

    const scoreData = useMemo(() => {
      const isGuest = user?.role === 'guest'
      const needsOnboarding = user?.needsOnboarding
      const isPaused = quizData?.iqData?.pauseRealTimeIQ
      const prevScore = parseFloat(quizData?.iqData?.prevScore)
      const newScore = parseFloat(quizData?.iqData?.newScore)
      const [integerPart, decimalPart] = prevScore
        ?.toFixed(1)
        .toString()
        .split('.')

      return {
        isGuest,
        needsOnboarding,
        isPaused,
        prevScore,
        newScore,
        integerPart,
        decimalPart,
      }
    }, [user, quizData])

    useEffect(() => {
      if (step >= 2) {
        const timer = setTimeout(() => setShowAnimation(true), 1000)
        return () => clearTimeout(timer)
      }
    }, [step])

    if (
      !quizData?.iqData ||
      Object.keys(quizData?.iqData).length === 0 ||
      Object.values(quizData?.iqData).every(
        val => val === null || val === undefined,
      ) ||
      step < 2
    )
      return null

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        bg="whiteAlpha.50"
        rounded="xl"
        p={6}
        borderWidth={1}
        borderColor="whiteAlpha.100"
        height="180px"
        position="relative"
        overflow="hidden"
        w={{ base: '100%', md: '50%' }}
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      >
        <Flex alignItems="center" gap={2} mb={6}>
          <Icon as={Zap} boxSize={5} color="yellow.400" />
          <Text fontSize="sm" fontWeight="medium" color="yellow.200">
            {t('iqScore')}
          </Text>

          {scoreData.isGuest && (
            <Tooltip label={t('registerTooltip')} placement="top" hasArrow>
              <MotionBadge
                position="absolute"
                right={4}
                colorScheme="purple"
                variant="subtle"
                fontSize="xs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('guestMode')}
              </MotionBadge>
            </Tooltip>
          )}

          {scoreData.isPaused && !scoreData.isGuest && (
            <MotionBadge
              position="absolute"
              right={0}
              display="flex"
              alignItems="center"
              gap={1}
              colorScheme="orange"
              variant="subtle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Icon as={PauseCircle} boxSize={3} />
              <Text fontSize="xs">{t('iqPaused')}</Text>
            </MotionBadge>
          )}
        </Flex>

        <Box position="relative" height="80px">
          <AnimatePresence mode="wait">
            {!showAnimation ? (
              <MotionFlex
                key="initial"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                position="absolute"
                inset={0}
                alignItems="center"
                justifyContent="center"
                gap="1px"
              >
                <Text
                  fontSize="4xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, yellow.400, orange.400)"
                  bgClip="text"
                >
                  {scoreData.integerPart}
                </Text>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, yellow.400, orange.400)"
                  bgClip="text"
                  opacity={0.8}
                  mb={-2}
                >
                  .{scoreData.decimalPart}
                </Text>
              </MotionFlex>
            ) : (
              <MotionFlex
                key="animated"
                position="absolute"
                inset={0}
                alignItems="center"
                justifyContent="center"
              >
                <PreciseCountingNumber
                  from={
                    scoreData.isGuest ? scoreData.newScore : scoreData.prevScore
                  }
                  to={scoreData.newScore}
                  duration={2}
                  isGuest={scoreData.isGuest}
                  needsOnboarding={scoreData.needsOnboarding}
                  inGameName={user?.inGameName}
                />
              </MotionFlex>
            )}
          </AnimatePresence>

          <MotionBox
            position="absolute"
            inset="-16px"
            rounded="xl"
            bgGradient="linear(to-r, yellow.500, orange.500)"
            initial={{ opacity: 0 }}
            animate={{ opacity: showAnimation ? 0.2 : 0 }}
            transition={{ duration: 0.5 }}
            filter="blur(16px)"
            style={{
              pointerEvents: 'none',
              willChange: 'opacity',
              transform: 'translateZ(0)',
            }}
          />
        </Box>

        {scoreData.isGuest && (
          <MotionText
            position="absolute"
            bottom={1}
            left={0}
            right={0}
            textAlign="center"
            fontSize="xs"
            color="gray.300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {t('registerNote')}
          </MotionText>
        )}
      </MotionBox>
    )
  },
)

export default IQScoreCard
