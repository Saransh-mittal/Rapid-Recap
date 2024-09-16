import React, { useMemo, Suspense } from 'react'
import {
  Box,
  Heading,
  Alert,
  AlertIcon,
  Skeleton,
  VStack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

// Lazy load LeaderboardTable
const LeaderboardTable = React.lazy(() => import('./LeaderboardTable'))

const MotionBox = motion(Box)

const PreviousTournamentLeaderboard = ({ previousTournamentData }) => {
  const { t } = useTranslation('PreviousTournamentLeaderboard')

  const leaderboardData = useMemo(() => {
    return previousTournamentData?.participants.slice(0, 5) || []
  }, [previousTournamentData])

  const tournamentInfo = useMemo(() => {
    if (!previousTournamentData) return null
    return {
      number: String(previousTournamentData.tournamentNumber).padStart(3, '0'),
      endDate: new Date(previousTournamentData.endDate).toLocaleDateString(),
    }
  }, [previousTournamentData])

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg="rgba(0, 0, 0, 0.2)"
      backdropFilter="blur(10px)"
      borderRadius="lg"
      py={6}
      px={4}
      boxShadow="0 8px 32px rgba(31, 38, 135, 0.37)"
    >
      <VStack spacing={4} align="stretch">
        <Heading
          size={{ base: 'md', md: 'lg' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Trophy color="gold" style={{ marginRight: '0.5rem' }} />
          {t('heading')}
        </Heading>

        {tournamentInfo && (
          <Box textAlign="center" fontSize="sm" color="gray.400">
            <Text>
              {t('tournamentNumber', { number: tournamentInfo.number })}
            </Text>
            <Text>{t('endDate', { date: tournamentInfo.endDate })}</Text>
          </Box>
        )}

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
