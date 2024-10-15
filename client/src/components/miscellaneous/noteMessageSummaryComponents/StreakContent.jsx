import React from 'react'
import { Box, Text, VStack, HStack, Progress } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatRemainingTime } from '../../../utils/helper.utils'
import UnlinkSVG from '../../../assets/svg/UnlinkSVG'
import RevivalSVG from '../../../assets/svg/RevivalSVG'
import CheckCircle from '../../../assets/svg/CheckCircle'
import FireSVG from '../../../assets/svg/FireSVG'

const StreakContent = ({ message }) => {
  const { t } = useTranslation('NoteMessageSummary')

  const getStreakIcon = streakStatus => {
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

  const getStreakColorScheme = streakStatus => {
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

  return (
    <HStack spacing={3}>
      <Box
        bg={`${getStreakColorScheme(message.streakStatus)}.400`}
        borderRadius="full"
        p={2}
        boxShadow={`0 0 15px ${getStreakColorScheme(message.streakStatus)}.300`}
      >
        {getStreakIcon(message.streakStatus)}
      </Box>
      <VStack align="start" spacing={0}>
        <Text fontWeight="bold">{message.title}</Text>
        <Text color={`${getStreakColorScheme(message.streakStatus)}.400`}>
          {message.streakStatus === 'broken'
            ? t('streakEnded', { count: message.streakCount })
            : t('streak', { count: message.streakCount })}
        </Text>
        {message.streakStatus === 'revival' && message.remainingTime && (
          <>
            {message.remainingQuizzes > 0 && (
              <Text fontSize="sm" color="gray.400">
                {t('completeMoreQuizzes', {
                  count: message.remainingQuizzes,
                  quizCount:
                    message.remainingQuizzes === 1 ? t('quiz') : t('quizzes'),
                })}
              </Text>
            )}
            <Text fontSize="sm" color="gray.400">
              {t('timeToRevive', {
                formattedTime: formatRemainingTime(message.remainingTime),
              })}
            </Text>
            <Box w="100%" mt={1}>
              <Progress
                value={(message.remainingTime / (24 * 60 * 60)) * 100}
                size="xs"
                colorScheme={getStreakColorScheme(message.streakStatus)}
              />
            </Box>
          </>
        )}
      </VStack>
    </HStack>
  )
}

export default StreakContent
