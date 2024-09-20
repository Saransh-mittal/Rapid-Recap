import React, { useMemo, lazy, Suspense } from 'react'
import { Text, VStack, Box, Flex, Progress } from '@chakra-ui/react'
import NoteMessage from '../NoteMessage'
import { formatRemainingTime } from '../../../utils/helper.utils'
import { useTranslation } from 'react-i18next'
import { LockIcon } from '@chakra-ui/icons'

const TrophySVG = lazy(() => import('../../../assets/svg/TrophySVG'))
const CalenderSVG = lazy(() => import('../../../assets/svg/CalenderSVG'))

const TournamentNoteMessage = ({
  messageId,
  tournamentStatus,
  tournamentName,
  registrationEndTime,
  userStreak,
  requiredStreak,
  onClose,
  duration,
  width = '320px',
}) => {
  const { t } = useTranslation('TournamentNoteMessage')

  const getIcon = () => {
    switch (tournamentStatus) {
      case 'registration':
        return <CalenderSVG height="40px" width="40px" />
      case 'locked':
        return <LockIcon height="40px" width="40px" />
      default:
        return <TrophySVG height="40px" width="40px" />
    }
  }

  const getColorScheme = () => {
    switch (tournamentStatus) {
      case 'registration':
        return 'green'
      case 'locked':
        return 'red'
      default:
        return 'blue'
    }
  }

  const getMotivationalMessage = () => {
    switch (tournamentStatus) {
      case 'registration':
        return t('TournamentNoteMessage.motivation.registration', {
          tournamentName,
        })
      case 'locked':
        return t('TournamentNoteMessage.motivation.locked', {
          requiredStreak: requiredStreak - userStreak,
        })
      default:
        return t('TournamentNoteMessage.motivation.default')
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
            {tournamentName}
          </Text>
          {tournamentStatus === 'registration' && (
            <>
              <Text fontSize="md" fontWeight="medium" color="gray.300">
                {t('TournamentNoteMessage.registrationOpen')}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {t('TournamentNoteMessage.registrationEnds')}
              </Text>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={`${getColorScheme()}.300`}
              >
                {formatRemainingTime(registrationEndTime)}
              </Text>
            </>
          )}
          {tournamentStatus === 'locked' && (
            <>
              <Text fontSize="md" fontWeight="medium" color="gray.300">
                {t('TournamentNoteMessage.streakRequired', { requiredStreak })}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {t('TournamentNoteMessage.yourStreak', { userStreak })}
              </Text>
              <Box w="100%" mt={2}>
                <Progress
                  value={(userStreak / requiredStreak) * 100}
                  colorScheme={getColorScheme()}
                  borderRadius="full"
                />
              </Box>
            </>
          )}
          <Text
            fontSize="md"
            fontWeight="medium"
            color={`${getColorScheme()}.300`}
            textAlign="center"
            mt={3}
          >
            {getMotivationalMessage()}
          </Text>
        </VStack>
      </Flex>
    ),
    [
      tournamentStatus,
      tournamentName,
      registrationEndTime,
      userStreak,
      requiredStreak,
      t,
    ],
  )

  const getActions = () => {
    switch (tournamentStatus) {
      case 'registration':
        return [
          {
            text: t('TournamentNoteMessage.actions.register'),
            actionType: 'REGISTER_TOURNAMENT',
          },
        ]
      default:
        return [
          {
            text: t('TournamentNoteMessage.actions.viewTournament'),
            actionType: 'VIEW_TOURNAMENT',
          },
        ]
    }
  }

  return (
    <NoteMessage
      messageId={messageId}
      title={t('TournamentNoteMessage.title', {
        status: t(`TournamentNoteMessage.status.${tournamentStatus}`),
      })}
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={getActions()}
    />
  )
}

export default TournamentNoteMessage
