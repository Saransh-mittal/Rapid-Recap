// StreakNoteMessage.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import {
  Text,
  VStack,
  Box,
  Flex,
  Progress,
  HStack,
  Badge,
  Icon,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import NoteMessage from '../NoteMessage'
import { formatRemainingTime } from '../../../utils/helper.utils'
import { useTranslation } from 'react-i18next'
import { TimeIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Zap, Clock } from 'lucide-react'

// Lazy load SVG components
const FireSVG = lazy(() => import('../../../assets/svg/FireSVG'))
const UnlinkSVG = lazy(() => import('../../../assets/svg/UnlinkSVG'))
const RevivalSVG = lazy(() => import('../../../assets/svg/RevivalSVG'))
const CheckCircle = lazy(() => import('../../../assets/svg/CheckCircle'))

// Motion components
const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionProgress = motion(Progress)
const MotionBadge = motion(Badge)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 10,
    },
  },
}

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.9, 1, 0.9],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: 'reverse',
  },
}

const StreakNoteMessage = ({
  messageId,
  streakStatus,
  streakCount,
  remainingTime,
  remainingQuizzes,
  title,
  onClose,
  duration,
  width = '320px',
}) => {
  const { t } = useTranslation('StreakNoteMessage')
  const [progress, setProgress] = useState(100)
  const [timeLeft, setTimeLeft] = useState(remainingTime)

  useEffect(() => {
    if (streakStatus === 'revival' && remainingTime) {
      setTimeLeft(remainingTime)
      const maxTime = remainingTime

      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1
          setProgress((newTime / maxTime) * 100)
          return newTime > 0 ? newTime : 0
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [streakStatus, remainingTime])

  const getIcon = () => {
    switch (streakStatus) {
      case 'broken':
        return <UnlinkSVG height="40px" width="40px" />
      case 'revival':
        return <RevivalSVG height="40px" width="40px" />
      case 'revived':
        return <CheckCircle height="40px" width="40px" />
      default:
        return <FireSVG height="40px" width="40px" />
    }
  }

  const getColorScheme = () => {
    switch (streakStatus) {
      case 'broken':
        return 'red'
      case 'revival':
        return 'yellow'
      case 'revived':
        return 'green'
      default:
        return 'orange'
    }
  }

  const getGradient = () => {
    switch (streakStatus) {
      case 'broken':
        return 'linear(to-r, red.600, red.400)'
      case 'revival':
        return 'linear(to-r, yellow.600, yellow.400)'
      case 'revived':
        return 'linear(to-r, green.600, green.400)'
      default:
        return 'linear(to-r, orange.600, orange.400)'
    }
  }

  const customContent = useMemo(
    () => (
      <MotionFlex
        direction="column"
        align="center"
        w="100%"
        position="relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <MotionBox
          bg={`${getColorScheme()}.500`}
          bgGradient={getGradient()}
          borderRadius="full"
          p={3}
          mb={4}
          boxShadow={`0 0 20px ${getColorScheme()}.400`}
          variants={itemVariants}
          whileHover={{
            y: -3,
            boxShadow: `0 0 25px ${getColorScheme()}.500`,
            rotate: streakStatus === 'revival' ? [0, -5, 5, -5, 0] : 0,
          }}
          animate={
            streakStatus === 'broken'
              ? { rotate: [0, -5, 0, 5, 0] }
              : streakStatus === 'revived'
              ? { scale: [1, 1.2, 1] }
              : {}
          }
          transition={{
            duration: 1.5,
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: streakStatus === 'broken' ? 1 : 0,
          }}
        >
          <Suspense fallback={<Box width="40px" height="40px" />}>
            {getIcon()}
          </Suspense>
        </MotionBox>

        <VStack spacing={3} align="center" w="100%">
          <MotionText
            fontSize="xl"
            fontWeight="bold"
            color="white"
            textAlign="center"
            variants={itemVariants}
            textShadow="0 1px 3px rgba(0,0,0,0.3)"
          >
            {title}
          </MotionText>

          <MotionBox
            variants={itemVariants}
            bg="rgba(255,255,255,0.05)"
            borderRadius="lg"
            p={3}
            w="100%"
            borderLeft="3px solid"
            borderColor={`${getColorScheme()}.400`}
          >
            <HStack spacing={3} align="center">
              <Icon
                as={streakStatus === 'broken' ? WarningTwoIcon : Zap}
                color={`${getColorScheme()}.400`}
                boxSize={6}
              />
              <MotionText
                fontSize="lg"
                fontWeight="bold"
                bgGradient={`linear(to-r, ${getColorScheme()}.300, ${getColorScheme()}.500)`}
                bgClip="text"
                animate={streakStatus !== 'broken' ? pulseAnimation : {}}
              >
                {streakStatus === 'broken'
                  ? t('StreakNoteMessage.broken', { streakCount })
                  : streakStatus === 'revival'
                  ? t(`StreakNoteMessage.reviveMsg`, { streakCount })
                  : t('StreakNoteMessage.current', { streakCount })}
              </MotionText>
            </HStack>
          </MotionBox>

          {streakStatus === 'revival' && (
            <MotionBox variants={itemVariants} width="100%">
              <Flex
                align="center"
                mb={2}
                justify="space-between"
                bg="rgba(255,255,255,0.05)"
                px={3}
                py={2}
                borderRadius="md"
              >
                <HStack>
                  <Icon
                    as={Clock}
                    color={`${getColorScheme()}.400`}
                    boxSize={4}
                  />
                  <Text fontSize="sm" color="whiteAlpha.800">
                    {t('StreakNoteMessage.timeRemaining')}
                  </Text>
                </HStack>
                <MotionText
                  fontSize="md"
                  fontWeight="bold"
                  color={`${getColorScheme()}.300`}
                  animate={pulseAnimation}
                >
                  {formatRemainingTime(timeLeft * 1000)}
                </MotionText>
              </Flex>

              <Box position="relative" w="100%" mt={2} mb={3}>
                <MotionProgress
                  value={progress}
                  colorScheme={getColorScheme()}
                  borderRadius="full"
                  height="8px"
                  bg="rgba(255,255,255,0.1)"
                  animate={{
                    boxShadow: [
                      `0 0 0px ${getColorScheme()}.400`,
                      `0 0 8px ${getColorScheme()}.400`,
                      `0 0 0px ${getColorScheme()}.400`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />

                {/* Time markers */}
                <Flex
                  position="absolute"
                  top="-18px"
                  left="0"
                  right="0"
                  justify="space-between"
                >
                  <MotionText fontSize="xs" color="whiteAlpha.600">
                    0h
                  </MotionText>
                  <MotionText fontSize="xs" color="whiteAlpha.600">
                    {Math.floor(remainingTime / 3600)}h
                  </MotionText>
                </Flex>
              </Box>

              {remainingQuizzes > 0 && (
                <MotionFlex
                  align="center"
                  justify="center"
                  mt={2}
                  bg={`rgba(${
                    getColorScheme() === 'yellow'
                      ? '237, 137, 54'
                      : '72, 187, 120'
                  }, 0.1)`}
                  borderRadius="md"
                  p={2}
                  animate={{
                    boxShadow: [
                      `0 0 0px ${getColorScheme()}.400`,
                      `0 0 8px ${getColorScheme()}.400`,
                      `0 0 0px ${getColorScheme()}.400`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  <Icon as={Zap} color={`${getColorScheme()}.400`} mr={2} />
                  <MotionText
                    fontSize="sm"
                    fontWeight="semibold"
                    color={`${getColorScheme()}.400`}
                  >
                    {t('StreakNoteMessage.completeQuizzes', {
                      remainingQuizzes,
                      quizText:
                        remainingQuizzes === 1 ? t('quiz') : t('quizzes'),
                    })}
                  </MotionText>
                </MotionFlex>
              )}
            </MotionBox>
          )}

          {streakStatus === 'revived' && (
            <MotionBox
              variants={itemVariants}
              mt={2}
              bg="rgba(72, 187, 120, 0.1)"
              borderRadius="lg"
              p={3}
              w="100%"
              textAlign="center"
            >
              <MotionText
                fontSize="md"
                fontWeight="semibold"
                color="green.400"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                {t('StreakNoteMessage.streakRevived')}
              </MotionText>
            </MotionBox>
          )}

          {streakStatus === 'broken' && (
            <MotionBox
              variants={itemVariants}
              mt={2}
              bg="rgba(245, 101, 101, 0.1)"
              borderRadius="lg"
              p={3}
              w="100%"
              textAlign="center"
            >
              <MotionText fontSize="md" fontWeight="semibold" color="red.400">
                {t('StreakNoteMessage.streakRestart')}
              </MotionText>
            </MotionBox>
          )}
        </VStack>
      </MotionFlex>
    ),
    [streakStatus, streakCount, timeLeft, remainingQuizzes, progress, title, t],
  )

  const getActions = () => {
    switch (streakStatus) {
      case 'broken':
        return [
          {
            text: t('StreakNoteMessage.actions.startNew'),
            actionType: 'START_NEW_STREAK',
          },
        ]
      case 'revival':
        return [
          {
            text: t('StreakNoteMessage.actions.takeQuiz'),
            actionType: 'TAKE_QUIZ',
          },
        ]
      case 'revived':
        return [
          {
            text: t('StreakNoteMessage.actions.viewStreak'),
            actionType: 'VIEW_STREAK',
          },
        ]
      default:
        return []
    }
  }

  // Custom header with animation
  const customHeader = (
    <Flex
      align="center"
      justify="space-between"
      w="100%"
      bgGradient={getGradient()}
      px={4}
      py={2}
      borderTopLeftRadius="lg"
      borderTopRightRadius="lg"
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
    >
      <HStack>
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Icon
            as={streakStatus === 'broken' ? WarningTwoIcon : Zap}
            color="white"
            boxSize={5}
          />
        </MotionBox>
        <Text fontWeight="bold" color="white" fontSize="sm">
          {t('StreakNoteMessage.title', {
            status: t(`StreakNoteMessage.status.${streakStatus}`),
          })}
        </Text>
      </HStack>
      <MotionBadge
        variant="solid"
        colorScheme={getColorScheme()}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 200,
            damping: 15,
          },
        }}
      >
        {t(`StreakNoteMessage.statusBadge.${streakStatus}`)}
      </MotionBadge>
    </Flex>
  )

  return (
    <NoteMessage
      messageId={messageId}
      title={t('StreakNoteMessage.title', {
        status: t(`StreakNoteMessage.status.${streakStatus}`),
      })}
      customHeader={customHeader}
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={getActions()}
    />
  )
}

export default StreakNoteMessage
