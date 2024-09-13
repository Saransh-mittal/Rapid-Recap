import React, { useMemo, Suspense } from 'react'
import { Box, Heading, Alert, AlertIcon } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import CrownSVG from '../../assets/svg/CrownSVG'

// Lazy load LeaderboardTable
const LeaderboardTable = React.lazy(() => import('./LeaderboardTable'))

const PreviousTournamentLeaderboard = ({ previousTournamentData }) => {
  const { t } = useTranslation('PreviousTournamentLeaderboard')

  // Memoize the sliced data to avoid re-slicing on every render
  const leaderboardData = useMemo(() => {
    return previousTournamentData?.participants.slice(0, 5) || []
  }, [previousTournamentData])

  return (
    <Box
      bg="rgba(0, 0, 0, 0.2)"
      backdropFilter="blur(10px)"
      borderRadius="lg"
      py={6}
      px={2}
      boxShadow="0 8px 32px rgba(31, 38, 135, 0.37)"
    >
      <Heading
        size={{ base: 'lg', md: 'lg', lg: 'md' }}
        mb={4}
        display="flex"
        alignItems="center"
      >
        <CrownSVG color="#C0C0C0" style={{ marginRight: '0.5rem' }} />
        {t('heading')}
      </Heading>
      {previousTournamentData ? (
        <Suspense fallback={<Box>{t('loading')}</Box>}>
          <LeaderboardTable data={leaderboardData} />
        </Suspense>
      ) : (
        <Alert status="info" color="black">
          <AlertIcon />
          {t('noData')}
        </Alert>
      )}
    </Box>
  )
}

export default PreviousTournamentLeaderboard
