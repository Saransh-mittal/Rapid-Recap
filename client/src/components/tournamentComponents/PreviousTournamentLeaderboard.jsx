import React, { useMemo, Suspense } from 'react'
import {
  Box,
  Heading,
  Alert,
  AlertIcon,
  Skeleton,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import TrophySVG from '../../assets/svg/TrophySVG'
import Medal from '../../assets/svg/Medal'

// Lazy load components
const LeaderboardTable = React.lazy(() => import('./LeaderboardTable'))

const MotionBox = motion(Box)

const PreviousTournamentLeaderboard = ({ previousTournamentData }) => {
  const { t } = useTranslation('PreviousTournamentLeaderboard')
  const leaderboardData = useMemo(() => {
    return previousTournamentData?.topLeaders || []
  }, [previousTournamentData])

  const tournamentInfo = useMemo(() => {
    if (!previousTournamentData) return null
    return {
      number: String(previousTournamentData.tournamentNumber).padStart(3, '0'),
      endDate: new Date(previousTournamentData.endDate).toLocaleDateString(),
    }
  }, [previousTournamentData])

  const userStanding = useMemo(() => {
    return previousTournamentData?.userStanding || null
  }, [previousTournamentData])

  return (
    <MotionBox borderRadius="lg" py={6} px={4}>
      <VStack spacing={4} align="stretch">
        <Heading size={'md'} display="flex" alignItems="center">
          <TrophySVG color="gold" style={{ marginRight: '0.5rem' }} />
          {t('heading')}
        </Heading>

        {tournamentInfo && (
          <Box textAlign="center" fontSize="sm" color="gray.400">
            <Text>{t('endDate', { date: tournamentInfo.endDate })}</Text>
          </Box>
        )}

        {userStanding && (
          <Box
            bg="whiteAlpha.200"
            p={4}
            borderRadius="md"
            boxShadow="md"
            cursor="pointer"
            _hover={{ bg: 'whiteAlpha.300' }}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack>
                <Medal color="#ECC94B" />
                <VStack alignItems="flex-start" spacing={0}>
                  <Text fontWeight="bold">{t('Your Rank')}</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="pink.400">
                    #{userStanding.rank}
                  </Text>
                </VStack>
              </HStack>
              <VStack alignItems="flex-end" spacing={0}>
                <Text fontWeight="bold">{userStanding.name}</Text>
                <Text color="gray.400">@{userStanding.inGameName}</Text>
                <Text fontSize="xl" fontWeight="bold" color="pink.400">
                  {t('score')}: {userStanding.score}
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        <Text
          textAlign="center"
          fontSize="sm"
          fontWeight="bold"
          color="gray.300"
        >
          {t('topLeadersInfo')}
        </Text>

        {previousTournamentData ? (
          <Suspense fallback={<Skeleton height="200px" />}>
            <LeaderboardTable
              data={leaderboardData}
              tournamentId={previousTournamentData._id}
            />
          </Suspense>
        ) : (
          <Alert status="info" variant="subtle" color={'black'}>
            <AlertIcon />
            {t('noData')}
          </Alert>
        )}
      </VStack>
    </MotionBox>
  )
}

export default PreviousTournamentLeaderboard
