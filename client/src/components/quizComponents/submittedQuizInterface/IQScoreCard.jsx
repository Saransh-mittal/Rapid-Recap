import React, { useState, useEffect } from 'react'
import { Box, Flex, Icon, Text, VStack, Badge, Tooltip } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, PauseCircle, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)

const PreciseCountingNumber = ({
  from,
  to,
  duration = 2,
  isGuest,
  needsOnboarding,
  inGameName,
}) => {
  const [displayNumber, setDisplayNumber] = useState(from || 0)
  const { t } = useTranslation('SubmittedQuizInterface')
  const navigate = useNavigate()
  useEffect(() => {
    if (isGuest) {
      setDisplayNumber(to)
      return
    }

    const steps = 40
    const stepDuration = (duration * 1000) / steps
    const increment = (to - from) / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      if (currentStep <= steps) {
        setDisplayNumber(from + increment * currentStep)
      } else {
        clearInterval(timer)
        setDisplayNumber(to)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [from, to, duration, isGuest])

  const [integerPart, decimalPart] = displayNumber?.toFixed(1).split('.')
  const difference = (to - from).toFixed(1)

  return (
    <VStack spacing={2}>
      <MotionFlex
        alignItems="baseline"
        gap="1px"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
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

      {isGuest ? (
        !needsOnboarding ? (
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
                onClick={() => navigate(`/profile/${inGameName}`)}
              >
                <Text>{t('expectedScore')}</Text>
                <Icon as={LogIn} boxSize={3} />
              </MotionBadge>
            </Box>
          </Tooltip>
        ) : null
      ) : (
        difference > 0 && (
          <MotionText
            fontSize="sm"
            color="yellow.300"
            opacity={0.7}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: duration, duration: 0.3 }}
          >
            +{difference} points
          </MotionText>
        )
      )}
    </VStack>
  )
}

const IQScoreCard = ({ step, quizData, isTournament, animationDelay }) => {
  const { t } = useTranslation('SubmittedQuizInterface')
  const [showAnimation, setShowAnimation] = useState(false)
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    if (step >= 2) {
      const timer = setTimeout(() => {
        setShowAnimation(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [step])

  const isGuest = user?.role === 'guest'
  const needsOnboarding = user?.needsOnboarding
  const isPaused = quizData?.iqData?.pauseRealTimeIQ
  const prevScore = parseFloat(quizData?.iqData?.prevScore)
  const newScore = parseFloat(quizData?.iqData?.newScore)
  const [integerPart, decimalPart] = prevScore?.toFixed(1).toString().split('.')

  if (
    !quizData?.iqData ||
    Object.keys(quizData?.iqData).length === 0 ||
    Object.values(quizData?.iqData).every(
      val => val === null || val === undefined,
    )
  )
    return null

  if (step < 2) return null

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      bg="whiteAlpha.50"
      backdropFilter="blur(8px)"
      rounded="xl"
      p={6}
      borderWidth={1}
      borderColor="whiteAlpha.100"
      height="180px"
      position="relative"
      overflow="hidden"
      w={{ base: '100%', md: '50%' }}
    >
      <Flex alignItems="center" gap={2} mb={6}>
        <Icon as={Zap} boxSize={5} color="yellow.400" />
        <Text fontSize="sm" fontWeight="medium" color="yellow.200">
          {t('iqScore')}
        </Text>

        {isGuest && (
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

        {isPaused && !isGuest && (
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
              top="0"
              left="0"
              right="0"
              bottom="0"
              alignItems="center"
              justifyContent="center"
              gap={'1px'}
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
                mb={-2}
              >
                .{decimalPart}
              </Text>
            </MotionFlex>
          ) : (
            <MotionFlex
              key="animated"
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              alignItems="center"
              justifyContent="center"
            >
              <PreciseCountingNumber
                from={isGuest ? newScore : prevScore}
                to={newScore}
                duration={2}
                isGuest={isGuest}
                needsOnboarding={needsOnboarding}
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
          animate={{
            opacity: showAnimation ? 0.2 : 0,
          }}
          transition={{ duration: 0.5 }}
          filter="blur(16px)"
          style={{ pointerEvents: 'none' }}
        />
      </Box>

      {isGuest && (
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
}

export default IQScoreCard
