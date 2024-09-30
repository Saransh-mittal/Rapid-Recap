import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import axios from 'axios'
import {
  Box,
  Flex,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Button,
  Text,
  Alert,
  AlertIcon,
  Skeleton,
  useMediaQuery,
  useDisclosure,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react'

const ArticleManagement = lazy(() =>
  import('../components/dashboardComponents/ArticleManagement'),
)

const DataTable = lazy(() => import('../components/miscellaneous/DataTable'))
const NotificationStatus = lazy(() =>
  import('../components/miscellaneous/NotificationStatus'),
)
const CurrentAffairsManagement = lazy(() =>
  import('../components/dashboardComponents/CurrentAffairsManagement'),
)
const TournamentManagement = lazy(() =>
  import('../components/dashboardComponents/TournamentManagement'),
)
const StoryFeedbackAnalysis = lazy(() =>
  import('../components/dashboardComponents/StoryFeedbackAnalysis'),
)

const TestTournamentManagement = lazy(() =>
  import('../components/dashboardComponents/TestTournamentManagement'),
)

const Dashboard = () => {
  const [quizAttempts, setQuizAttempts] = useState([])
  const [notificationStatus, setNotificationStatus] = useState({
    usersEnabled: [],
    usersDisabled: [],
    totalEnabled: 0,
    totalDisabled: 0,
  })
  const [lastLogin, setLastLogin] = useState([])
  const [timeSpent, setTimeSpent] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [lastLoginAfterDate, setLastLoginAfterDate] = useState('')
  const [selectedTables, setSelectedTables] = useState(['quizAttempts'])
  const [dateError, setDateError] = useState('')
  const [loading, setLoading] = useState(true)
  const isScreenSmallerThen650px = useMediaQuery('(max-width: 650px)')[0]
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isTournamentManagementOpen,
    onOpen: onTournamentManagementOpen,
    onClose: onTournamentManagementClose,
  } = useDisclosure()
  const {
    isOpen: isNotificationStatusOpen,
    onOpen: onNotificationStatusOpen,
    onClose: onNotificationStatusClose,
  } = useDisclosure()
  const {
    isOpen: isCurrentAffairsOpen,
    onOpen: onCurrentAffairsOpen,
    onClose: onCurrentAffairsClose,
  } = useDisclosure()
  const {
    isOpen: isArticleManagementOpen,
    onOpen: onArticleManagementOpen,
    onClose: onArticleManagementClose,
  } = useDisclosure()
  const {
    isOpen: isStoryFeedbackAnalysisOpen,
    onOpen: onStoryFeedbackAnalysisOpen,
    onClose: onStoryFeedbackAnalysisClose,
  } = useDisclosure()
  const {
    isOpen: isTestTournamentManagementOpen,
    onOpen: onTestTournamentManagementOpen,
    onClose: onTestTournamentManagementClose,
  } = useDisclosure()
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  const renderModalButton = useCallback(
    (label, onClickHandler) => (
      <Button
        onClick={onClickHandler}
        backgroundColor="blue.500"
        color="white"
        size={isLargerThan768 ? 'md' : 'sm'}
        width="100%"
      >
        {label}
      </Button>
    ),
    [isLargerThan768],
  )

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
    setLastLoginAfterDate(today)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const config = { headers: { Authorization: `Bearer ${token}` } }

        const promises = []

        if (selectedTables.includes('quizAttempts')) {
          promises.push(
            axios
              .get('/api/admin/quiz-attempts', {
                params: { startDate, endDate },
                ...config,
              })
              .then(quizResponse => {
                setQuizAttempts(
                  quizResponse.data.users.map(user => ({
                    ...user._id,
                    quizAttempts: user.quizAttempts,
                  })),
                )
              }),
          )
        }

        if (selectedTables.includes('lastLogin')) {
          promises.push(
            axios
              .get('/api/admin/last-login', {
                params: { afterDate: lastLoginAfterDate },
                ...config,
              })
              .then(loginResponse => {
                setLastLogin(loginResponse.data.users)
              }),
          )
        }

        if (selectedTables.includes('timeSpent')) {
          promises.push(
            axios
              .get('/api/admin/time-spent', {
                params: { startDate, endDate },
                ...config,
              })
              .then(timeResponse => {
                setTimeSpent(
                  timeResponse.data.users.map(user => ({
                    timeSpent: Math.ceil(user.timeSpent),
                    ...user._id,
                  })),
                )
              }),
          )
        }

        promises.push(
          axios
            .get('/api/admin/notification-status', config)
            .then(notificationResponse => {
              setNotificationStatus(notificationResponse.data)
              setIsLoadingStatus(false)
            }),
        )

        await Promise.all(promises)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate, lastLoginAfterDate, selectedTables])

  const handleNotificationStatusClick = useCallback(() => {
    onOpen()
  }, [onOpen])

  // const handleModalClick = useCallback(() => {
  //   onModalOpen()
  // }, [onModalOpen])

  const handleTableChange = useCallback(table => {
    setSelectedTables(prevSelectedTables => {
      if (prevSelectedTables.includes(table)) {
        return prevSelectedTables.filter(t => t !== table)
      } else {
        return [...prevSelectedTables, table]
      }
    })
  }, [])

  const renderTableButton = useCallback(
    (label, table) => (
      <Button
        onClick={() => handleTableChange(table)}
        backgroundColor={
          selectedTables.includes(table) ? 'blue.500' : 'gray.200'
        }
        color={selectedTables.includes(table) ? 'white' : 'black'}
        size={isLargerThan768 ? 'md' : 'sm'}
        width="100%"
      >
        {label}
      </Button>
    ),
    [selectedTables, handleTableChange, isLargerThan768],
  )

  const handleDateChange = useCallback(
    setter => event => {
      const { value } = event.target
      const today = new Date().toISOString().split('T')[0]
      if (value > today) {
        setDateError('Dates cannot be in the future.')
      } else if (setter === setStartDate && value > endDate) {
        setDateError('Start date cannot be greater than end date.')
      } else if (setter === setEndDate && value < startDate) {
        setDateError('End date cannot be less than start date.')
      } else {
        setDateError('')
        setter(value)
      }
    },
    [startDate, endDate],
  )

  const mergeData = useCallback(() => {
    const mergedData = []
    const users = new Set([
      ...quizAttempts.map(user => user.email),
      ...lastLogin.map(user => user.email),
      ...timeSpent.map(user => user.email),
    ])

    let totalUsers = users.size
    let totalQuizAttemptsUsers = 0
    let totalLastLoginUsers = 0
    let totalTimeSpentUsers = 0

    users.forEach(email => {
      const quizData = quizAttempts.find(user => user.email === email) || {}
      const loginData = lastLogin.find(user => user.email === email) || {}
      const timeData = timeSpent.find(user => user.email === email) || {}

      if (quizData.email) totalQuizAttemptsUsers++
      if (loginData.email) totalLastLoginUsers++
      if (timeData.email) totalTimeSpentUsers++

      mergedData.push({
        name: quizData.name || loginData.name || timeData.name || '',
        email,
        inGameName:
          quizData.inGameName ||
          loginData.inGameName ||
          timeData.inGameName ||
          '',
        quizAttempts: quizData.quizAttempts || 0,
        lastLogin: loginData.lastLogin || '',
        timeSpent: timeData.timeSpent || 0,
      })
    })

    return {
      data: mergedData,
      totals: {
        totalUsers,
        totalQuizAttemptsUsers,
        totalLastLoginUsers,
        totalTimeSpentUsers,
      },
    }
  }, [quizAttempts, lastLogin, timeSpent])

  const getMergedColumns = useCallback(() => {
    const columns = ['name', 'email', 'inGameName']
    if (selectedTables.includes('quizAttempts')) columns.push('quizAttempts')
    if (selectedTables.includes('lastLogin')) columns.push('lastLogin')
    if (selectedTables.includes('timeSpent')) columns.push('timeSpent')
    return columns
  }, [selectedTables])

  const { data: mergedData, totals } = mergeData()

  return (
    <Box margin={{ base: '5rem 0 0 0', lg: '5rem' }}>
      <Heading textAlign={'center'} margin={'1rem'}>
        Dashboard
      </Heading>
      <Flex
        justifyContent={'space-between'}
        mt={'-2rem'}
        flexDirection={{ base: 'column' }}
        w={'100%'}
      >
        <Flex
          flexDirection={'column'}
          alignItems={'center'}
          mt={'4rem'}
          mx={{ base: '0.75rem', md: '0' }}
        >
          <VStack spacing={4} align="stretch" mt={4}>
            {(selectedTables.includes('quizAttempts') ||
              selectedTables.includes('timeSpent')) && (
              <SimpleGrid columns={[1, null, 2]} spacing={4}>
                <Input
                  type="date"
                  value={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleDateChange(setStartDate)}
                  placeholder="Start Date"
                />
                <Input
                  type="date"
                  value={endDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleDateChange(setEndDate)}
                  placeholder="End Date"
                />
              </SimpleGrid>
            )}
            {selectedTables.includes('lastLogin') && (
              <Input
                type="date"
                value={lastLoginAfterDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={handleDateChange(setLastLoginAfterDate)}
                placeholder="Last Login After Date"
              />
            )}
            {dateError && (
              <Alert status="error">
                <AlertIcon />
                {dateError}
              </Alert>
            )}
            <SimpleGrid columns={[2, null, 3, 4]} spacing={4}>
              {renderTableButton('Quiz Attempts', 'quizAttempts')}
              {renderTableButton('Last Login Times', 'lastLogin')}
              {renderTableButton('Time Spent', 'timeSpent')}
              {renderModalButton(
                'Notification Status',
                onNotificationStatusOpen,
              )}
              {renderModalButton(
                'Manage Tournaments',
                onTournamentManagementOpen,
              )}
              {renderModalButton('Manage Articles', onArticleManagementOpen)}
              {renderModalButton('Current Affairs', onCurrentAffairsOpen)}
              {renderModalButton('Story Feedback', onStoryFeedbackAnalysisOpen)}
              {renderModalButton(
                'Manage Test Tournament',
                onTestTournamentManagementOpen,
              )}
            </SimpleGrid>
          </VStack>
        </Flex>
        <Flex w="100%" mt="3rem">
          {selectedTables.length > 0 && (
            <VStack w="100%" justifyContent="space-between" p={4}>
              <Table
                variant="striped"
                size="md"
                w={{ base: '100%', md: '70%' }}
              >
                <Thead>
                  <Tr bg="#363062">
                    <Th
                      colSpan={2}
                      textAlign="center"
                      color="white"
                      fontSize="1rem"
                    >
                      User Statistics
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td bg="#818FB4" color="black" fontWeight={'bold'}>
                      <Text fontSize={'1.15rem'}>Total Users:</Text>
                    </Td>
                    <Td bg="#818FB4" color="black" fontWeight={'bold'}>
                      <Text fontSize={'1.15rem'}>{totals.totalUsers}</Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td bg="#363062" color="black" fontWeight={'bold'}>
                      <Text fontSize={'1.15rem'}>
                        Total Quiz Attempts Users:
                      </Text>
                    </Td>
                    <Td bg="#363062" color="black" fontWeight={'bold'}>
                      <Text fontSize={'1.15rem'}>
                        {totals.totalQuizAttemptsUsers}
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td bg="#818FB4" color="black" fontWeight={'bold'}>
                      <Text fontSize={'1.15rem'}>Total Last Login Users:</Text>
                    </Td>
                    <Td bg="#818FB4" color="black" fontWeight={'bold'}>
                      <Text fontSize={'1.15rem'}>
                        {totals.totalLastLoginUsers}
                      </Text>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td bg="#363062" color="black" fontWeight={'bold'}>
                      <Text fontSize={'1.15rem'}>Total Time Spent Users:</Text>
                    </Td>
                    <Td bg="#363062" color="black" fontWeight={'bold'}>
                      <Text fontSize={'1.15rem'}>
                        {totals.totalTimeSpentUsers}
                      </Text>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </VStack>
          )}
        </Flex>
      </Flex>
      {selectedTables.length > 0 && (
        <Box mt={8}>
          <Flex justifyContent={'center'}>
            <Heading size="lg" mb={'1rem'}>
              Merged Data
            </Heading>
          </Flex>
          {loading ? (
            <Skeleton height="200px" />
          ) : (
            <Suspense fallback={<Spinner />}>
              <DataTable columns={getMergedColumns()} data={mergedData} />
            </Suspense>
          )}
        </Box>
      )}
      <Suspense fallback={<Spinner />}>
        <NotificationStatus
          isOpen={isNotificationStatusOpen}
          onClose={onNotificationStatusClose}
          data={notificationStatus}
          isLoading={isLoadingStatus}
        />
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <ArticleManagement
          isOpen={isArticleManagementOpen}
          onOpen={onArticleManagementOpen}
          onClose={onArticleManagementClose}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <CurrentAffairsManagement
          isOpen={isCurrentAffairsOpen}
          onClose={onCurrentAffairsClose}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <TournamentManagement
          isOpen={isTournamentManagementOpen}
          onClose={onTournamentManagementClose}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <StoryFeedbackAnalysis
          isOpen={isStoryFeedbackAnalysisOpen}
          onClose={onStoryFeedbackAnalysisClose}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <TestTournamentManagement
          isOpen={isTestTournamentManagementOpen}
          onClose={onTestTournamentManagementClose}
        />
      </Suspense>
    </Box>
  )
}

export default React.memo(Dashboard)
