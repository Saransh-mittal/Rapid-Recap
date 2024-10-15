import React from 'react'
import {
  Box,
  Flex,
  VStack,
  Text,
  Progress,
  HStack,
  Avatar,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { formatRemainingTime } from '../../../utils/helper.utils'
import CalenderSVG from '../../../assets/svg/CalenderSVG'
import { LockIcon } from '@chakra-ui/icons'
import TrophySVG from '../../../assets/svg/TrophySVG'

const TournamentContent = ({ message }) => {
  const { t: tournamentTranslate } = useTranslation('TournamentNoteMessage')
  const { isUnderMaintenance } = useSelector(state => state.tournament)

  const getIcon = tournamentStatus => {
    switch (tournamentStatus) {
      case 'registration':
        return <CalenderSVG height="40px" width="40px" />
      case 'locked':
        return <LockIcon height="40px" width="40px" />
      default:
        return <TrophySVG height="40px" width="40px" />
    }
  }

  const getColorScheme = tournamentStatus => {
    switch (tournamentStatus) {
      case 'registration':
        return 'green'
      case 'locked':
        return 'red'
      default:
        return 'blue'
    }
  }

  const getMotivationalMessage = (
    tournamentStatus,
    requiredStreak,
    userStreak,
    messageForTournamentEligibility,
    tournamentName,
  ) => {
    const randomMessageNumber = Math.floor(Math.random() * 5) + 1
    const randomMessageNumberForLocked = Math.floor(Math.random() * 3) + 1
    switch (tournamentStatus) {
      case 'registration':
        return tournamentTranslate(
          `TournamentNoteMessage.motivation.registration.${randomMessageNumber}`,
          { tournamentName },
        )
      case 'locked':
        return (
          messageForTournamentEligibility ||
          tournamentTranslate(
            `TournamentNoteMessage.motivation.locked.${randomMessageNumberForLocked}`,
            { requiredStreak: requiredStreak - userStreak },
          )
        )
      default:
        return tournamentTranslate('TournamentNoteMessage.motivation.default')
    }
  }

  const LeaderboardItem = ({ rank, name, score, pic }) => (
    <HStack spacing={2} w="100%">
      <Text
        fontWeight="bold"
        color={`${getColorScheme(message?.tournamentStatus)}.300`}
      >
        {rank}.
      </Text>
      <Avatar size="xs" src={pic} />
      <Text flex={1} color="white" isTruncated>
        {name}
      </Text>
      <Text
        fontWeight="bold"
        color={`${getColorScheme(message?.tournamentStatus)}.300`}
      >
        {score}
      </Text>
    </HStack>
  )

  if (isUnderMaintenance) return null

  return (
    <Flex direction="column" align="center" w="100%" position="relative">
      <Box
        bg={`${getColorScheme(message?.tournamentStatus)}.400`}
        borderRadius="full"
        p={2}
        mb={3}
        boxShadow={`0 0 15px ${getColorScheme(message?.tournamentStatus)}.300`}
      >
        {getIcon(message?.tournamentStatus)}
      </Box>
      <VStack spacing={2} align="center" w="100%">
        <Text fontSize="xl" fontWeight="bold" color="white" textAlign="center">
          {message?.tournamentName}
        </Text>
        {message?.tournamentStatus === 'registration' && (
          <>
            <Text fontSize="md" fontWeight="medium" color="gray.300">
              {tournamentTranslate('TournamentNoteMessage.registrationOpen')}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {tournamentTranslate('TournamentNoteMessage.registrationEnds')}
            </Text>
            <Text
              fontSize="md"
              fontWeight="bold"
              color={`${getColorScheme(message?.tournamentStatus)}.300`}
            >
              {formatRemainingTime(
                new Date(message?.registrationEndTime).getTime() -
                  new Date().getTime(),
              )}
            </Text>
          </>
        )}
        {message?.tournamentStatus === 'locked' && (
          <>
            <Text fontSize="md" fontWeight="medium" color="gray.300">
              {tournamentTranslate('TournamentNoteMessage.streakRequired', {
                requiredStreak: message?.requiredStreak,
              })}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {tournamentTranslate('TournamentNoteMessage.yourStreak', {
                userStreak: message?.userStreak,
              })}
            </Text>
            <Box w="100%" mt={2}>
              <Progress
                value={(message?.userStreak / message?.requiredStreak) * 100}
                colorScheme={getColorScheme(message?.tournamentStatus)}
                borderRadius="full"
              />
            </Box>
          </>
        )}
        {message?.leaderboard?.length > 0 && (
          <VStack w="100%" mt={4} spacing={2}>
            <Text fontSize="md" fontWeight="bold" color="white">
              {tournamentTranslate('TournamentNoteMessage.topLeaders')}
            </Text>
            {message?.leaderboard?.map((leader, index) =>
              leader?.score ? (
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
        {(message?.leaderboard?.length === 0 || !message.leaderboard) && (
          <Text
            fontSize="md"
            fontWeight="medium"
            color={`${getColorScheme(message?.tournamentStatus)}.300`}
            textAlign="center"
            mt={3}
          >
            {getMotivationalMessage(
              message?.tournamentStatus,
              message?.requiredStreak,
              message?.userStreak,
              message?.messageForTournamentEligibility,
              message?.tournamentName,
            )}
          </Text>
        )}
      </VStack>
    </Flex>
  )
}

export default TournamentContent
