import React, { useEffect, useState, Suspense, lazy } from 'react'
import axios from 'axios'
import {
  Box,
  Container,
  Spinner,
  useMediaQuery,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'

// Component Imports
import DashboardHeader from '../components/dashboardComponents/DashboardHeader'
import DateRangeSelector from '../components/dashboardComponents/DateRangeSelector'
import DataSelector from '../components/dashboardComponents/DataSelector'
import UserStats from '../components/dashboardComponents/UserStats'
import MergedDataTable from '../components/dashboardComponents/MergedDataTable'
import ManagementButtons from '../components/dashboardComponents/ManagementButtons'
import FeedbackButtons from '../components/dashboardComponents/FeedbackButtons'

// Lazy loaded components
const NotificationStatus = lazy(() =>
  import('../components/miscellaneous/NotificationStatus'),
)
const ArticleManagement = lazy(() =>
  import('../components/dashboardComponents/ArticleManagement'),
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
const TournamentFeedbackAnalysis = lazy(() =>
  import('../components/dashboardComponents/TournamentFeedbackAnalysis'),
)
const TestTournamentManagement = lazy(() =>
  import('../components/dashboardComponents/TestTournamentManagement'),
)
const OnboardingArticleList = lazy(() =>
  import('../components/dashboardComponents/OnboardingArticleList'),
)
const OnboardingArticleAdd = lazy(() =>
  import('../components/dashboardComponents/OnboardingArticleAdd'),
)

const Dashboard = () => {
  // State management
  const [quizAttempts, setQuizAttempts] = useState([])
  const [notificationStatus, setNotificationStatus] = useState({
    usersEnabled: [],
    usersDisabled: [],
    totalEnabled: 0,
    totalDisabled: 0,
  })
  const [lastLogin, setLastLogin] = useState([])
  const [timeSpent, setTimeSpent] = useState([])
  const [newUsers, setNewUsers] = useState([])
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
  const [filteredArticles, setFilteredArticles] = useState([])

  // Media query hook
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  // Disclosure hooks for modals
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

  // Data fetching functions
  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/admin/onboarding-articles')
      setArticles(response.data)
      setFilteredArticles(response.data)
    } catch (error) {
      console.error('Error fetching articles:', error)
    }
  }

  const fetchDashboardData = async () => {
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

      if (selectedTables.includes('newUsers')) {
        promises.push(
          axios
            .get('/api/admin/new-users', {
              params: { startDate, endDate },
              ...config,
            })
            .then(response => {
              setNewUsers(
                response.data.users.map(user => ({
                  ...user._id,
                  createdAt: user.createdAt,
                })),
              )
            }),
        )
      }
      if (selectedTables.includes('newUsers')) {
        promises.push(
          axios
            .get('/api/admin/new-users', {
              params: { startDate, endDate },
              ...config,
            })
            .then(response => {
              setNewUsers(response.data.users)
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

  // Effects
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
    setLastLoginAfterDate(today)
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [startDate, endDate, lastLoginAfterDate, selectedTables])

  // Event handlers
  const handleTableChange = table => {
    setSelectedTables(prevSelectedTables => {
      if (prevSelectedTables.includes(table)) {
        return prevSelectedTables.filter(t => t !== table)
      } else {
        return [...prevSelectedTables, table]
      }
    })
  }

  const handleStartDateChange = value => {
    const today = new Date().toISOString().split('T')[0]
    if (value > today) {
      setDateError('Dates cannot be in the future.')
    } else if (value > endDate) {
      setDateError('Start date cannot be greater than end date.')
    } else {
      setDateError('')
      setStartDate(value)
    }
  }

  const handleEndDateChange = value => {
    const today = new Date().toISOString().split('T')[0]
    if (value > today) {
      setDateError('Dates cannot be in the future.')
    } else if (value < startDate) {
      setDateError('End date cannot be less than start date.')
    } else {
      setDateError('')
      setEndDate(value)
    }
  }

  const handleLastLoginDateChange = value => {
    const today = new Date().toISOString().split('T')[0]
    if (value > today) {
      setDateError('Dates cannot be in the future.')
    } else {
      setDateError('')
      setLastLoginAfterDate(value)
    }
  }

  const handleAddModalClose = () => {
    setIsAddModalOpen(false)
    setSelectedArticle(null)
    fetchArticles()
    onOnboardingArticleOpen()
  }

  // Data processing
  const mergeData = () => {
    let mergedData = []

    if (selectedTables.includes('newUsers')) {
      // If newUsers is selected, only show users created in date range
      mergedData = newUsers.map(user => ({
        name: user.name,
        email: user.email,
        inGameName: user.inGameName,
        createdAt: user.createdAt,
        quizAttempts:
          quizAttempts.find(q => q.email === user.email)?.quizAttempts || 0,
        lastLogin: lastLogin.find(l => l.email === user.email)?.lastLogin || '',
        timeSpent: timeSpent.find(t => t.email === user.email)?.timeSpent || 0,
      }))
    } else {
      // Original merging logic for other tables
      const users = new Set([
        ...quizAttempts.map(user => user.email),
        ...lastLogin.map(user => user.email),
        ...timeSpent.map(user => user.email),
      ])

      mergedData = Array.from(users).map(email => {
        const quizData = quizAttempts.find(user => user.email === email) || {}
        const loginData = lastLogin.find(user => user.email === email) || {}
        const timeData = timeSpent.find(user => user.email === email) || {}

        return {
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
        }
      })
    }

    return {
      data: mergedData,
      totals: {
        totalUsers: mergedData.length,
        totalQuizAttemptsUsers: mergedData.filter(user => user.quizAttempts > 0)
          .length,
        totalLastLoginUsers: mergedData.filter(user => user.lastLogin).length,
        totalTimeSpentUsers: mergedData.filter(user => user.timeSpent > 0)
          .length,
        totalNewUsers: selectedTables.includes('newUsers')
          ? mergedData.length
          : 0,
      },
    }
  }

  const getMergedColumns = () => {
    const columns = ['name', 'email', 'inGameName']
    if (selectedTables.includes('quizAttempts')) columns.push('quizAttempts')
    if (selectedTables.includes('lastLogin')) columns.push('lastLogin')
    if (selectedTables.includes('timeSpent')) columns.push('timeSpent')
    if (selectedTables.includes('newUsers')) columns.push('createdAt')
    return columns
  }

  const { data: mergedData, totals } = mergeData()
  const columns = getMergedColumns()

  return (
    <Box minHeight="100vh" mt={'4.5rem'} px={isLargerThan768 ? '2rem' : '0rem'}>
      <Container maxW="container.xl" py={8}>
        <DashboardHeader />

        <Tabs isFitted variant="soft-rounded" colorScheme="teal">
          <TabList mb="1em" mx={{ base: 0, md: '2rem' }}>
            <Tab color="gray.200">Users Data</Tab>
            <Tab color="gray.200">Management</Tab>
            <Tab color="gray.200">Feedback</Tab>
          </TabList>

          <TabPanels>
            {/* Users Data Tab */}
            <TabPanel>
              <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                lastLoginAfterDate={lastLoginAfterDate}
                selectedTables={selectedTables}
                dateError={dateError}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onLastLoginDateChange={handleLastLoginDateChange}
              />

              <DataSelector
                selectedTables={selectedTables}
                handleTableChange={handleTableChange}
              />

              {selectedTables.length > 0 && (
                <>
                  <UserStats totals={totals} />
                  <MergedDataTable
                    loading={loading}
                    columns={columns}
                    data={mergedData}
                  />
                </>
              )}
            </TabPanel>

            {/* Management Tab */}
            <TabPanel>
              <ManagementButtons
                onNotificationStatusOpen={onNotificationStatusOpen}
                onTournamentManagementOpen={onTournamentManagementOpen}
                onArticleManagementOpen={onArticleManagementOpen}
                onCurrentAffairsOpen={onCurrentAffairsOpen}
                onTestTournamentManagementOpen={onTestTournamentManagementOpen}
                onOnboardingArticleOpen={onOnboardingArticleOpen}
              />
            </TabPanel>

            {/* Feedback Tab */}
            <TabPanel>
              <FeedbackButtons
                onStoryFeedbackAnalysisOpen={onStoryFeedbackAnalysisOpen}
                onQuizFeedbackAnalysisOpen={onQuizFeedbackAnalysisOpen}
                onTournamentFeedbackAnalysisOpen={
                  onTournamentFeedbackAnalysisOpen
                }
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Modals */}
        <Suspense fallback={<Spinner />}>
          <NotificationStatus
            isOpen={isNotificationStatusOpen}
            onClose={onNotificationStatusClose}
            data={notificationStatus}
            isLoading={isLoadingStatus}
          />
          <ArticleManagement
            isOpen={isArticleManagementOpen}
            onOpen={onArticleManagementOpen}
            onClose={onArticleManagementClose}
          />
          <CurrentAffairsManagement
            isOpen={isCurrentAffairsOpen}
            onClose={onCurrentAffairsClose}
          />
          <TournamentManagement
            isOpen={isTournamentManagementOpen}
            onClose={onTournamentManagementClose}
          />
          <StoryFeedbackAnalysis
            isOpen={isStoryFeedbackAnalysisOpen}
            onClose={onStoryFeedbackAnalysisClose}
          />
          <QuizFeedbackAnalysis
            isOpen={isQuizFeedbackAnalysisOpen}
            onClose={onQuizFeedbackAnalysisClose}
          />
          <TournamentFeedbackAnalysis
            isOpen={isTournamentFeedbackAnalysisOpen}
            onClose={onTournamentFeedbackAnalysisClose}
          />
          <TestTournamentManagement
            isOpen={isTestTournamentManagementOpen}
            onClose={onTestTournamentManagementClose}
          />
          <OnboardingArticleList
            isOpen={isOnboardingArticleOpen && !isAddModalOpen}
            onClose={onOnboardingArticleClose}
            setIsAddModalOpen={setIsAddModalOpen}
            setSelectedArticle={setSelectedArticle}
            articles={articles}
            fetchArticles={fetchArticles}
          />
          <OnboardingArticleAdd
            isOpen={isAddModalOpen}
            onClose={handleAddModalClose}
            article={selectedArticle}
          />
        </Suspense>
      </Container>
    </Box>
  )
}

export default React.memo(Dashboard)
