import React, { useState, lazy, Suspense } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Collapse,
  Spinner,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'

const PreviousTournamentLeaderboard = lazy(() =>
  import('./PreviousTournamentLeaderboard'),
)

const BufferPeriodDisplay = ({ previousTournamentData }) => {
  const { t } = useTranslation('Tournament')
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const toggleLeaderboard = () => setShowLeaderboard(!showLeaderboard)

  return (
    <Box bg="rgba(0, 0, 0, 0.2)" borderRadius="lg" py={6} px={3}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" display="flex" alignItems="center">
          <Clock color="#4FD1C5" style={{ marginRight: '0.5rem' }} />
          {t('bufferPeriod.title')}
        </Heading>
        <Text>
          {t('bufferPeriod.message', {
            tournamentNumber: String(
              previousTournamentData.tournamentNumber,
            ).padStart(3, '0'),
          })}
        </Text>
        <Text>{t('bufferPeriod.nextTournamentPrompt')}</Text>
        <Button
          colorScheme="pink"
          size="lg"
          onClick={toggleLeaderboard}
          rightIcon={showLeaderboard ? <ChevronUp /> : <ChevronDown />}
        >
          {showLeaderboard
            ? t('bufferPeriod.hidePreviousResults')
            : t('bufferPeriod.viewPreviousResults')}
        </Button>
        <Collapse in={showLeaderboard} animateOpacity>
          <Box mt={4}>
            <Suspense fallback={<Spinner size="xl" />}>
              <PreviousTournamentLeaderboard
                previousTournamentData={previousTournamentData}
              />
            </Suspense>
          </Box>
        </Collapse>
      </VStack>
    </Box>
  )
}

export default BufferPeriodDisplay
