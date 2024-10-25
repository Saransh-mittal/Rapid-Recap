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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Alert,
  AlertIcon,
  Skeleton,
  useMediaQuery,
  useDisclosure,
  Spinner,
  Text,
  Button,
  Container,
  useColorModeValue,
  Icon,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'
import TournamentFeedbackAnalysis from '../components/dashboardComponents/TournamentFeedbackAnalysis'
import { FaChartBar, FaCog, FaComments } from 'react-icons/fa'
import OnboardingArticleList from '../components/dashboardComponents/OnboardingArticleList'
import OnboardingArticleAdd from '../components/dashboardComponents/OnboardingArticleAdd'

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
const QuizFeedbackAnalysis = lazy(() =>
  import('../components/dashboardComponents/QuizFeedbackAnalysis'),
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
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [articles, setArticles] = useState([])
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  const textColor = useColorModeValue('gray.200', 'gray.200')
  const subtleTextColor = useColorModeValue('gray.400', 'gray.400')
  const borderColor = useColorModeValue('gray.700', 'gray.700')
  const buttonColorScheme = 'teal'

  const {
    isOpen: isNotificationStatusOpen,
    onOpen: onNotificationStatusOpen,
    onClose: onNotificationStatusClose,
  } = useDisclosure()
  const {
    isOpen: isTournamentManagementOpen,
    onOpen: onTournamentManagementOpen,
    onClose: onTournamentManagementClose,
  } = useDisclosure()
  const {
    isOpen: isArticleManagementOpen,
    onOpen: onArticleManagementOpen,
    onClose: onArticleManagementClose,
  } = useDisclosure()
  const {
    isOpen: isCurrentAffairsOpen,
    onOpen: onCurrentAffairsOpen,
    onClose: onCurrentAffairsClose,
  } = useDisclosure()
  const {
    isOpen: isStoryFeedbackAnalysisOpen,
    onOpen: onStoryFeedbackAnalysisOpen,
    onClose: onStoryFeedbackAnalysisClose,
  } = useDisclosure()
  const {
    isOpen: isQuizFeedbackAnalysisOpen,
    onOpen: onQuizFeedbackAnalysisOpen,
    onClose: onQuizFeedbackAnalysisClose,
  } = useDisclosure()
  const {
    isOpen: isTournamentFeedbackAnalysisOpen,
    onOpen: onTournamentFeedbackAnalysisOpen,
    onClose: onTournamentFeedbackAnalysisClose,
  } = useDisclosure()
  const {
    isOpen: isTestTournamentManagementOpen,
    onOpen: onTestTournamentManagementOpen,
    onClose: onTestTournamentManagementClose,
  } = useDisclosure()
  const {
    isOpen: isOnboardingArticleOpen,
    onOpen: onOnboardingArticleOpen,
    onClose: onOnboardingArticleClose,
  } = useDisclosure()

  const handleAddModalClose = () => {
    setIsAddModalOpen(false)
    setSelectedArticle(null)
    fetchArticles()
    onOnboardingArticleOpen()
  }

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/admin/onboarding-articles')
      setArticles(response.data)
      setFilteredArticles(response.data)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast({
        title: 'Error fetching articles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

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

  const handleTableChange = useCallback(table => {
    setSelectedTables(prevSelectedTables => {
      if (prevSelectedTables.includes(table)) {
        return prevSelectedTables.filter(t => t !== table)
      } else {
        return [...prevSelectedTables, table]
      }
    })
  }, [])

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
    <Box minHeight="100vh" mt={'4.5rem'} px={isLargerThan768 ? '2rem' : '0rem'}>
      <Container maxW="container.xl" py={8}>
        <Flex direction="column" align="center" mb={8}>
          <Heading
            as="h1"
            size={isLargerThan768 ? '2xl' : 'lg'}
            mb={2}
            p={2}
            borderRadius="md"
            color={textColor}
            textAlign="center"
          >
            Dashboard
          </Heading>
          <Text fontSize={isLargerThan768 ? 'lg' : 'md'} color="gray.500">
            Manage and analyze your application data
          </Text>
        </Flex>

        <Tabs isFitted variant="soft-rounded" colorScheme={buttonColorScheme}>
          <TabList mb="1em" mx={{ base: 0, md: '2rem' }}>
            <Tab color={textColor}>Users Data</Tab>
            <Tab color={textColor}>Management</Tab>
            <Tab color={textColor}>Feedback</Tab>
          </TabList>

          <TabPanels>
            {/* Data Filters Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box p={6} borderRadius="lg" boxShadow="md">
                  <Heading size={isLargerThan768 ? 'md' : 'sm'} mb={4}>
                    Date Range Selection
                  </Heading>
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
                      mt={4}
                    />
                  )}
                  {dateError && (
                    <Alert status="error" mt={4}>
                      <AlertIcon />
                      {dateError}
                    </Alert>
                  )}
                </Box>

                <Box p={6} borderRadius="lg" boxShadow="md">
                  <Heading size={isLargerThan768 ? 'md' : 'sm'} mb={4}>
                    Data Selection
                  </Heading>
                  <SimpleGrid columns={[1, null, 3]} spacing={4}>
                    <Button
                      onClick={() => handleTableChange('quizAttempts')}
                      colorScheme={buttonColorScheme}
                      variant={
                        selectedTables.includes('quizAttempts')
                          ? 'solid'
                          : 'outline'
                      }
                    >
                      Quiz Attempts
                    </Button>
                    <Button
                      onClick={() => handleTableChange('lastLogin')}
                      colorScheme={buttonColorScheme}
                      variant={
                        selectedTables.includes('lastLogin')
                          ? 'solid'
                          : 'outline'
                      }
                    >
                      Last Login Times
                    </Button>
                    <Button
                      onClick={() => handleTableChange('timeSpent')}
                      colorScheme={buttonColorScheme}
                      variant={
                        selectedTables.includes('timeSpent')
                          ? 'solid'
                          : 'outline'
                      }
                    >
                      Time Spent
                    </Button>
                  </SimpleGrid>
                </Box>

                {/* User Stats */}
                {selectedTables.length > 0 && (
                  <Box p={6} borderRadius="lg" boxShadow="md">
                    <Heading size={isLargerThan768 ? 'md' : 'sm'} mb={4}>
                      User Statistics
                    </Heading>
                    <SimpleGrid columns={[2, null, 4]} spacing={4}>
                      <Stat
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p={4}
                        boxShadow="sm"
                      >
                        <StatLabel>Total Users</StatLabel>
                        <StatNumber>{totals.totalUsers}</StatNumber>
                      </Stat>
                      <Stat
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p={4}
                        boxShadow="sm"
                      >
                        <StatLabel>Quiz Attempts Users</StatLabel>
                        <StatNumber>{totals.totalQuizAttemptsUsers}</StatNumber>
                      </Stat>
                      <Stat
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p={4}
                        boxShadow="sm"
                      >
                        <StatLabel>Last Login Users</StatLabel>
                        <StatNumber>{totals.totalLastLoginUsers}</StatNumber>
                      </Stat>
                      <Stat
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p={4}
                        boxShadow="sm"
                      >
                        <StatLabel>Time Spent Users</StatLabel>
                        <StatNumber>{totals.totalTimeSpentUsers}</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </Box>
                )}

                {/* Merged Data Table */}
                {selectedTables.length > 0 && (
                  <Box py={6} borderRadius="lg" boxShadow="md">
                    <Heading size={isLargerThan768 ? 'md' : 'sm'} mb={4}>
                      Merged Data
                    </Heading>
                    {loading ? (
                      <Skeleton height="200px" />
                    ) : (
                      <Suspense fallback={<Spinner />}>
                        <DataTable
                          columns={getMergedColumns()}
                          data={mergedData}
                        />
                      </Suspense>
                    )}
                  </Box>
                )}
              </VStack>
            </TabPanel>

            {/* Management Tab */}
            <TabPanel>
              <SimpleGrid columns={[1, null, 3]} spacing={4}>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onNotificationStatusOpen}
                >
                  Notification Status
                </Button>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onTournamentManagementOpen}
                >
                  Manage Tournaments
                </Button>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onArticleManagementOpen}
                >
                  Manage Articles
                </Button>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onCurrentAffairsOpen}
                >
                  Current Affairs
                </Button>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onTestTournamentManagementOpen}
                >
                  Manage Test Tournament
                </Button>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onOnboardingArticleOpen}
                >
                  Manage Onboarding Articles
                </Button>
              </SimpleGrid>
            </TabPanel>

            {/* Feedback Tab */}
            <TabPanel>
              <SimpleGrid columns={[1, null, 3]} spacing={4}>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onStoryFeedbackAnalysisOpen}
                >
                  Story Feedback
                </Button>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onQuizFeedbackAnalysisOpen}
                >
                  Quiz Feedback
                </Button>
                <Button
                  colorScheme={buttonColorScheme}
                  onClick={onTournamentFeedbackAnalysisOpen}
                >
                  Tournament Feedback
                </Button>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

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
        <QuizFeedbackAnalysis
          isOpen={isQuizFeedbackAnalysisOpen}
          onClose={onQuizFeedbackAnalysisClose}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <TournamentFeedbackAnalysis
          isOpen={isTournamentFeedbackAnalysisOpen}
          onClose={onTournamentFeedbackAnalysisClose}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <TestTournamentManagement
          isOpen={isTestTournamentManagementOpen}
          onClose={onTestTournamentManagementClose}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <OnboardingArticleList
          isOpen={isOnboardingArticleOpen && !isAddModalOpen} // Only show list when add modal is closed
          onClose={onOnboardingArticleClose}
          setIsAddModalOpen={setIsAddModalOpen}
          setSelectedArticle={setSelectedArticle}
          articles={articles}
          fetchArticles={fetchArticles}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <OnboardingArticleAdd
          isOpen={isAddModalOpen}
          onClose={handleAddModalClose}
          article={selectedArticle}
        />
      </Suspense>
    </Box>
  )
}

export default React.memo(Dashboard)
