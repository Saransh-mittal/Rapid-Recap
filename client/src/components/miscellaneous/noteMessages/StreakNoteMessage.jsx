import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { Text, VStack, Box, Flex, Progress } from '@chakra-ui/react'
import NoteMessage from '../NoteMessage'

const FireSVG = lazy(() => import('../../../assets/svg/FireSVG'))
const UnlinkSVG = lazy(() => import('../../../assets/svg/UnlinkSVG'))
const RevivalSVG = lazy(() => import('../../../assets/svg/RevivalSVG'))
const CheckCircle = lazy(() => import('../../../assets/svg/CheckCircle'))

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
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (streakStatus === 'revival' && remainingTime) {
      const timer = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress - 100 / remainingTime
          return newProgress > 0 ? newProgress : 0
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
        return ''
      case 'revival':
        return 'yellow'
      case 'revived':
        return 'green'
      default:
        return 'orange'
    }
  }

  const customContent = useMemo(
    () => (
      <Flex direction="column" align="center" w="100%" position="relative">
        <Box
          bg={`${getColorScheme()}.400`}
          borderRadius="full"
          p={2}
          mb={3}
          boxShadow={`0 0 15px ${getColorScheme()}.300`}
        >
          <Suspense fallback={<Box width="40px" height="40px" />}>
            {getIcon()}
          </Suspense>
        </Box>
        <VStack spacing={2} align="center" w="100%">
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="white"
            textAlign="center"
          >
            {title}
          </Text>
          <Text fontSize="md" fontWeight="medium" color="gray.300">
            {streakStatus === 'broken'
              ? `Your ${streakCount}-day streak has ended`
              : `Current streak: ${streakCount} days`}
          </Text>
          {streakStatus === 'revival' && (
            <>
              <Text fontSize="sm" color="gray.400">
                Time remaining to revive your streak:
              </Text>
              <Box w="100%" mt={2}>
                <Progress
                  value={progress}
                  colorScheme={getColorScheme()}
                  borderRadius="full"
                />
              </Box>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={`${getColorScheme()}.300`}
              >
                {Math.ceil(remainingTime / 60)} minutes left
              </Text>
              {remainingQuizzes > 0 && (
                <Text fontSize="sm" color="gray.400">
                  Complete {remainingQuizzes} more{' '}
                  {remainingQuizzes === 1 ? 'quiz' : 'quizzes'} to revive your
                  streak!
                </Text>
              )}
            </>
          )}
        </VStack>
      </Flex>
    ),
    [
      streakStatus,
      streakCount,
      remainingTime,
      remainingQuizzes,
      progress,
      title,
    ],
  )

  const getActions = () => {
    switch (streakStatus) {
      case 'broken':
        return [{ text: 'Start New Streak', actionType: 'START_NEW_STREAK' }]
      case 'revival':
        return [{ text: 'Take a Quiz', actionType: 'TAKE_QUIZ' }]
      case 'revived':
        return [{ text: 'View Streak', actionType: 'VIEW_STREAK' }]
      default:
        return []
    }
  }

  return (
    <NoteMessage
      messageId={messageId}
      title={`Streak ${
        streakStatus.charAt(0).toUpperCase() + streakStatus.slice(1)
      }`}
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={getActions()}
    />
  )
}

export default StreakNoteMessage
