import React, { useMemo, lazy, Suspense } from 'react'
import {
  Text,
  VStack,
  Box,
  Flex,
  Progress,
  HStack,
  Avatar,
  Spinner,
} from '@chakra-ui/react'
import NoteMessage from '../NoteMessage'
import { formatRemainingTime } from '../../../utils/helper.utils'
import { useTranslation } from 'react-i18next'
import { LockIcon } from '@chakra-ui/icons'
import TournamentOngoingMessage from './TournamentMessagesSubComp/TournamentOngoingMessage'
import { useSelector } from 'react-redux'

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
  leaderboard = [], // New prop for leaderboard data
  messageForTournamentEligibility,
}) => {
  const { t } = useTranslation('TournamentNoteMessage')
  const { isUnderMaintenance } = useSelector(state => state.tournament)

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
    const randomMessageNumber = Math.floor(Math.random() * 5) + 1
    const randomMessageNumberForLocked = Math.floor(Math.random() * 3) + 1
    switch (tournamentStatus) {
      case 'registration':
        return t(
          `TournamentNoteMessage.motivation.registration.${randomMessageNumber}`,
          {
            tournamentName,
          },
        )
      case 'locked':
        return (
          messageForTournamentEligibility ||
          t(
            `TournamentNoteMessage.motivation.locked.${randomMessageNumberForLocked}`,
            {
              requiredStreak: requiredStreak - userStreak,
            },
          )
        )
      default:
        return t('TournamentNoteMessage.motivation.default')
    }
  }

  const LeaderboardItem = ({ rank, name, score, pic }) => (
    <HStack spacing={2} w="100%">
      <Text fontWeight="bold" color={`${getColorScheme()}.300`}>
        {rank}.
      </Text>
      <Avatar size="xs" src={pic} />
      <Text flex={1} color="white" isTruncated>
        {name}
      </Text>
      <Text fontWeight="bold" color={`${getColorScheme()}.300`}>
        {score}
      </Text>
    </HStack>
  )

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
          {tournamentStatus === 'ongoing' && (
            <Suspense fallback={<Spinner />}>
              <TournamentOngoingMessage
                t={t}
                tournamentNumber={tournamentName}
              />
            </Suspense>
          )}
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
                {formatRemainingTime(
                  new Date(registrationEndTime).getTime() -
                    new Date().getTime(),
                )}
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
          {leaderboard?.length > 0 && (
            <VStack w="100%" mt={4} spacing={2}>
              <Text fontSize="md" fontWeight="bold" color="white">
                {t('TournamentNoteMessage.topLeaders')}
              </Text>
              {leaderboard?.map((leader, index) =>
                leader?.score > 0 ? (
                  <LeaderboardItem
                    key={leader.userId}
                    rank={index + 1}
                    name={leader.inGameName || leader.name}
                    score={leader.score}
                    pic={leader.pic}
                  />
                ) : null,
              )}
            </VStack>
          )}
          {(leaderboard.length === 0 || !leaderboard) && (
            <Text
              fontSize="md"
              fontWeight="medium"
              color={`${getColorScheme()}.300`}
              textAlign="center"
              mt={3}
            >
              {getMotivationalMessage()}
            </Text>
          )}
        </VStack>
      </Flex>
    ),
    [
      tournamentStatus,
      tournamentName,
      registrationEndTime,
      userStreak,
      requiredStreak,
      leaderboard,
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

  if (isUnderMaintenance) return null

  return (
    <NoteMessage
      messageId={messageId}
      title={
        leaderboard.length === 0
          ? t('TournamentNoteMessage.title', {
              status: t(`TournamentNoteMessage.status.${tournamentStatus}`),
            })
          : t('TournamentNoteMessage.tournamentLeaderboard')
      }
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={getActions()}
    />
  )
}

export default TournamentNoteMessage
