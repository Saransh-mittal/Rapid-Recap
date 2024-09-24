import React, { useMemo, lazy, Suspense } from 'react'
import { VStack, Alert, AlertIcon, Heading, Text, Flex } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

// Lazy load RegisteredUsersCount component
const RegisteredUsersCount = lazy(() => import('./RegisteredUsersCount'))
const ClockSVG = lazy(() => import('../../assets/svg/ClockSVG'))
const UserCheckSVG = lazy(() => import('../../assets/svg/UserCheckSVG'))
const UserPlusSVG = lazy(() => import('../../assets/svg/UserPlusSVG'))
const TrophySVG = lazy(() => import('../../assets/svg/TrophySVG'))

const TournamentStatus = ({ tournamentData, registrationStatus }) => {
  const { t } = useTranslation('TournamentStatus')
  const { isAuthenticated, user } = useSelector(state => state.auth)

  // Memoize the tournament status to avoid re-renders when not required
  const status = useMemo(() => tournamentData?.status, [tournamentData?.status])
  const registeredCount = useMemo(
    () => tournamentData?.registeredCount,
    [tournamentData?.registeredCount],
  )

  return (
    <>
      {status === 'upcoming' && (
        <VStack spacing={6} align="stretch">
          <Heading
            size="lg"
            mb={4}
            display="flex"
            alignItems="center"
            fontSize={{ base: 'lg', md: 'xl' }}
          >
            <Suspense fallback={<div>{t('loading')}</div>}>
              <ClockSVG color="#4FD1C5" style={{ marginRight: '0.5rem' }} />
            </Suspense>
            {t('upcoming.title')}
          </Heading>
          <Flex
            direction="column"
            align="center"
            justify="center"
            borderRadius="md"
            p={4}
            fontSize="sm"
            fontWeight="semibold"
            bg={registrationStatus === 'registered' ? 'green.100' : 'blue.100'}
            color={
              registrationStatus === 'registered' ? 'green.800' : 'blue.800'
            }
            borderColor={
              registrationStatus === 'registered' ? 'green.500' : 'blue.500'
            }
            borderWidth="1px"
            wordBreak="break-word"
          >
            {!isAuthenticated ? (
              <Text>{t('upcoming.loginPrompt')}</Text>
            ) : user?.role === 'guest' ? (
              <Text>{t('upcoming.guestPrompt')}</Text>
            ) : registrationStatus === 'registered' ? (
              <Flex align="center">
                <Suspense fallback={<div>{t('loading')}</div>}>
                  <UserCheckSVG style={{ marginRight: '0.5rem' }} size={16} />
                </Suspense>
                <Text>{t('upcoming.registered')}</Text>
              </Flex>
            ) : (
              <>
                <Flex align="center">
                  <Suspense fallback={<div>{t('loading')}</div>}>
                    <UserPlusSVG className="mr-2" size={16} />
                  </Suspense>
                  <Text>{t('upcoming.notRegistered')}</Text>
                </Flex>
                <Text mt={2} color="gray.600" textAlign="center">
                  {t('upcoming.futurePrompt')}
                </Text>
              </>
            )}
          </Flex>
          <Suspense fallback={<div>{t('loading')}</div>}>
            <RegisteredUsersCount count={registeredCount} />
          </Suspense>
        </VStack>
      )}
      {status === 'ongoing' && (
        <VStack spacing={6} align="stretch">
          <Heading size="lg" mb={4} display="flex" alignItems="center">
            <Suspense fallback={<div>{t('loading')}</div>}>
              <TrophySVG color="#ECC94B" style={{ marginRight: '0.5rem' }} />
            </Suspense>
            {t('ongoing.title')}
          </Heading>
        </VStack>
      )}
      {status === 'completed' && (
        <VStack spacing={6} align="stretch">
          <Heading size={{ base: 'md', md: 'lg' }} mb={4}>
            {t('completed.title')}
          </Heading>
          <Alert status="info" borderRadius="md" bg="blue.700" color="white">
            <AlertIcon color="blue.200" />
            {t('completed.message')}
          </Alert>
        </VStack>
      )}
    </>
  )
}

export default React.memo(TournamentStatus)
