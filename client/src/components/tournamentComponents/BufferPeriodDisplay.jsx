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
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

const PreviousTournamentLeaderboard = lazy(() =>
  import('./PreviousTournamentLeaderboard'),
)

const ClockSVG = lazy(() => import('../../assets/svg/ClockSVG'))

const BufferPeriodDisplay = ({ previousTournamentData }) => {
  const { t } = useTranslation('Tournament')
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const toggleLeaderboard = () => setShowLeaderboard(!showLeaderboard)

  return (
    <Box bg="rgba(0, 0, 0, 0.2)" borderRadius="lg" py={6} px={3}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" display="flex" alignItems="center">
          <ClockSVG
            color="#4FD1C5"
            style={{ marginRight: '0.5rem' }}
            width={'20px'}
            height={'20px'}
          />
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
          rightIcon={showLeaderboard ? <ChevronUpIcon /> : <ChevronDownIcon />}
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
