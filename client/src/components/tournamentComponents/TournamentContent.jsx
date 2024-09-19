import React, { Suspense, useMemo } from 'react'
import {
  VStack,
  Skeleton,
  Center,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Box,
  Alert,
  AlertIcon,
  HStack,
  Tab,
} from '@chakra-ui/react'
import { Trophy, History } from 'lucide-react'

const PreviousTournamentLeaderboard = React.lazy(() =>
  import('./PreviousTournamentLeaderboard'),
)
const TimeInfo = React.lazy(() => import('./TimeInfo'))
const TournamentStatus = React.lazy(() => import('./TournamentStatus'))
const RegistrationSection = React.lazy(() => import('./RegistrationSection'))
const CategorySelection = React.lazy(() => import('./CategorySelection'))
const BufferPeriodDisplay = React.lazy(() => import('./BufferPeriodDisplay'))

const LoadingSkeleton = () => (
  <VStack spacing={4} width="100%">
    <Skeleton height="40px" width="100%" />
    <Skeleton height="20px" width="80%" />
    <Skeleton height="20px" width="90%" />
    <Skeleton height="20px" width="70%" />
    <Skeleton height="40px" width="60%" />
  </VStack>
)

const NoTournamentData = ({ t }) => (
  <Center height="300px">
    <Box textAlign="center">
      <Heading as="h2" size="xl" mb={4} color="pink.400">
        {t('noTournamentData.title')}
      </Heading>
      <Text fontSize="xl" color="gray.300">
        {t('noTournamentData.description')}
      </Text>
    </Box>
  </Center>
)

const TournamentTab = React.memo(
  ({ number, icon: Icon, label, isScreenSmallerThan400px, t }) => (
    <Tab
      bg="rgba(237, 100, 166, 0.1)"
      _selected={{ bg: 'pink.500', color: 'white' }}
      borderRadius="full"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      fontSize="lg"
      fontWeight="bold"
      py={3}
      px={{ base: 2, md: 6 }}
      display="flex"
      height="fit-content"
      flexDirection="column"
    >
      <Text fontSize="2xs" fontWeight="bold" m={0} p={0}>
        {t('tournamentNumber', { number })}
      </Text>
      <HStack spacing={2}>
        <Icon width={20} height={20} />
        <Text fontSize={{ base: 'sm', md: 'lg' }} wordSpacing="2px">
          {isScreenSmallerThan400px ? t(label.short) : t(label.long)}{' '}
          {t('tournament')}
        </Text>
      </HStack>
    </Tab>
  ),
)

const TournamentContent = React.memo(
  ({
    isFetching,
    tournamentData,
    previousTournamentData,
    userRegistrationDetails,
    isAuthenticated,
    isScreenSmallerThan400px,
    handleRegister,
    handleCategorySelect,
    user,
    registerLoading,
    t,
  }) => {
    const currentTournamentNumber = useMemo(
      () =>
        tournamentData
          ? String(tournamentData.tournamentNumber).padStart(3, '0')
          : '000',
      [tournamentData],
    )

    const previousTournamentNumber = useMemo(
      () =>
        previousTournamentData
          ? String(previousTournamentData.tournamentNumber).padStart(3, '0')
          : 'N/A',
      [previousTournamentData],
    )

    if (isFetching) {
      return <LoadingSkeleton />
    }

    if (!tournamentData && !previousTournamentData) {
      return <NoTournamentData t={t} />
    }

    if (!tournamentData && previousTournamentData) {
      return (
        <Suspense fallback={<Skeleton height="40px" />}>
          <BufferPeriodDisplay
            previousTournamentData={previousTournamentData}
          />
        </Suspense>
      )
    }

    return (
      <Tabs isFitted variant="soft-rounded" colorScheme="pink">
        <TabList mb="0.7em" justifyContent="center" mx={{ base: 2, md: 4 }}>
          <TournamentTab
            number={currentTournamentNumber}
            icon={Trophy}
            label={{ short: 'curr', long: 'current' }}
            isScreenSmallerThan400px={isScreenSmallerThan400px}
            t={t}
          />
          <TournamentTab
            number={previousTournamentNumber}
            icon={History}
            label={{ short: 'prev', long: 'previous' }}
            isScreenSmallerThan400px={isScreenSmallerThan400px}
            t={t}
          />
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box
              bg="rgba(0, 0, 0, 0.2)"
              borderRadius="lg"
              p={6}
              boxShadow="0 8px 32px rgba(31, 38, 135, 0.37)"
            >
              <React.Suspense fallback={<Skeleton height="40px" />}>
                <TimeInfo tournamentData={tournamentData} />
              </React.Suspense>
              <React.Suspense fallback={<Skeleton height="40px" />}>
                <TournamentStatus
                  tournamentData={tournamentData}
                  registrationStatus={
                    userRegistrationDetails.isRegistered
                      ? 'registered'
                      : 'not-registered'
                  }
                />
              </React.Suspense>
              {tournamentData?.status === 'registration' && (
                <React.Suspense fallback={<Skeleton height="40px" />}>
                  <RegistrationSection
                    isAuthenticated={isAuthenticated}
                    userRole={user?.role}
                    tournamentData={tournamentData}
                    registrationStatus={
                      userRegistrationDetails.isRegistered
                        ? 'registered'
                        : 'not-registered'
                    }
                    handleRegister={handleRegister}
                    userDetails={{
                      inGameName: user?.inGameName,
                      categories: userRegistrationDetails?.selectedCategories,
                    }}
                    registerLoading={registerLoading}
                  />
                </React.Suspense>
              )}
              {tournamentData?.status === 'ongoing' && (
                <VStack spacing={8} align="stretch">
                  {userRegistrationDetails.isRegistered ? (
                    <React.Suspense fallback={<Skeleton height="40px" />}>
                      <CategorySelection
                        userSelectedcategories={
                          userRegistrationDetails.selectedCategories
                        }
                        onCategorySelect={handleCategorySelect}
                        tournamentId={tournamentData._id}
                      />
                    </React.Suspense>
                  ) : (
                    <Alert status="warning" color="black">
                      <AlertIcon />
                      {t('tournamentStatus.notRegistered')}
                    </Alert>
                  )}
                </VStack>
              )}
            </Box>
          </TabPanel>
          <TabPanel>
            <React.Suspense fallback={<Skeleton height="40px" />}>
              <PreviousTournamentLeaderboard
                previousTournamentData={previousTournamentData}
              />
            </React.Suspense>
          </TabPanel>
        </TabPanels>
      </Tabs>
    )
  },
)

export default TournamentContent
