import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import {
  Box,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Badge,
  VStack,
  HStack,
  Spinner,
  Divider,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue,
  Icon,
  Avatar,
  SimpleGrid,
  Circle,
  Center,
} from '@chakra-ui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiRefreshCw,
  FiZap,
  FiPieChart,
  FiUserCheck,
  FiChevronDown,
} from 'react-icons/fi'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
)

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const QuickClashAnalytics = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [includeBots, setIncludeBots] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  // User activity states
  const [userActivity, setUserActivity] = useState([])
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState(null)
  const [userPage, setUserPage] = useState(1)
  const [hasMoreUsers, setHasMoreUsers] = useState(true)
  const [dauMauStats, setDauMauStats] = useState({
    dau: 0,
    mau: 0,
    dauMauRatio: 0,
    totalUsersToday: 0,
  })
  const [userDetailTab, setUserDetailTab] = useState(false)

  const toast = useToast()

  // Use dark theme values by default
  const bgCard = 'gray.800'
  const borderColor = 'gray.700'
  const textColor = 'white'
  const subTextColor = 'gray.300'

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 3 })

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/admin/quick-clash/stats', {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            includeBots: includeBots,
          },
        })

        if (response.data.success) {
          setStats(response.data.stats)
          setError(null)
        } else {
          throw new Error('Failed to fetch statistics')
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data')
        toast({
          title: 'Error',
          description: err.message || 'Failed to load Quick Clash statistics',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dateRange, includeBots, toast])

  // Fetch user activity
  const fetchUserActivity = async (reset = false) => {
    try {
      setActivityLoading(true)
      setActivityError(null)

      const page = reset ? 1 : userPage
      const response = await axios.get('/api/admin/quick-clash/user-activity', {
        params: {
          date: activityDate,
          page,
          limit: 50,
          includeBots: includeBots,
        },
      })

      if (response.data.success) {
        const newUsers = response.data.users

        // Update user list
        if (reset || page === 1) {
          setUserActivity(newUsers)
        } else {
          setUserActivity(prev => [...prev, ...newUsers])
        }

        // Update pagination state
        setHasMoreUsers(response.data.pagination.hasMore)
        setUserPage(reset ? 2 : page + 1)

        // Update DAU/MAU stats
        setDauMauStats(response.data.stats)

        setActivityError(null)
      } else {
        throw new Error('Failed to fetch user activity')
      }
    } catch (err) {
      setActivityError(
        err.message || 'An error occurred while fetching user activity',
      )
      toast({
        title: 'Error',
        description: err.message || 'Failed to load user activity data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setActivityLoading(false)
    }
  }

  // Effect to fetch user activity when date changes
  useEffect(() => {
    if (userDetailTab) {
      fetchUserActivity(true)
    }
  }, [activityDate, includeBots, userDetailTab])

  // Function to load more users
  const loadMoreUsers = () => {
    fetchUserActivity(false)
  }

  // Handle date change
  const handleDateChange = e => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Function to handle activity date change
  const handleActivityDateChange = e => {
    setActivityDate(e.target.value)
  }

  // Add new stat cards for DAU/MAU
  const renderDauMauStats = () => (
    <>
      <MotionStat
        title="Daily Active Users"
        value={dauMauStats.dau}
        icon={<FiUserCheck />}
        color="teal.500"
        delay={0.1}
        isMobile={isMobile}
      />

      <MotionStat
        title="Monthly Active Users"
        value={dauMauStats.mau}
        icon={<FiUsers />}
        color="blue.500"
        delay={0.2}
        isMobile={isMobile}
      />

      <MotionStat
        title="DAU/MAU Ratio"
        value={`${dauMauStats.dauMauRatio}%`}
        icon={<FiTrendingUp />}
        color="purple.500"
        delay={0.3}
        isMobile={isMobile}
      />
    </>
  )

  // Prepare chart data for categories
  const categoryChartData = useMemo(() => {
    if (!stats || !stats.categories || stats.categories.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      }
    }

    const colorPalette = [
      '#8884d8',
      '#83a6ed',
      '#8dd1e1',
      '#82ca9d',
      '#a4de6c',
      '#d0ed57',
      '#ffc658',
      '#ff8042',
      '#ff6361',
      '#bc5090',
    ]

    return {
      labels: stats.categories.map(cat => cat.category),
      datasets: [
        {
          label: 'Challenges by Category',
          data: stats.categories.map(cat => cat.count),
          backgroundColor: stats.categories.map(
            (_, idx) => colorPalette[idx % colorPalette.length],
          ),
          borderWidth: 1,
        },
      ],
    }
  }, [stats])

  // Prepare chart data for daily trends
  const trendChartData = useMemo(() => {
    if (!stats || !stats.dailyTrends || stats.dailyTrends.length === 0) {
      return {
        labels: [],
        datasets: [],
      }
    }

    return {
      labels: stats.dailyTrends.map(day => day.date),
      datasets: [
        {
          label: 'Total Challenges',
          data: stats.dailyTrends.map(day => day.challenges),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Completed Challenges',
          data: stats.dailyTrends.map(day => day.completed),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
      ],
    }
  }, [stats])

  // Challenge status distribution chart
  const statusChartData = useMemo(() => {
    if (!stats || !stats.overall) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      }
    }

    const {
      completedChallenges,
      activeChallenges,
      pendingChallenges,
      rejectedChallenges,
      expiredChallenges,
    } = stats.overall

    return {
      labels: ['Completed', 'Active', 'Pending', 'Rejected', 'Expired'],
      datasets: [
        {
          label: 'Challenge Status',
          data: [
            completedChallenges,
            activeChallenges,
            pendingChallenges,
            rejectedChallenges,
            expiredChallenges,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)', // Completed - teal
            'rgba(54, 162, 235, 0.7)', // Active - blue
            'rgba(255, 206, 86, 0.7)', // Pending - yellow
            'rgba(255, 99, 132, 0.7)', // Rejected - red
            'rgba(153, 102, 255, 0.7)', // Expired - purple
          ],
          borderWidth: 1,
        },
      ],
    }
  }, [stats])

  // Loading state
  if (loading && !stats) {
    return (
      <Flex justifyContent="center" alignItems="center" h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color={textColor}>Loading Quick Clash analytics...</Text>
        </VStack>
      </Flex>
    )
  }

  // Error state
  if (error && !stats) {
    return (
      <Box p={8} borderRadius="lg" bg="red.50" textAlign="center">
        <Text color="red.500">{error}</Text>
        <Button
          mt={4}
          colorScheme="red"
          leftIcon={<FiRefreshCw />}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    )
  }

  // Default stats for empty data
  const defaultStats = {
    overall: {
      totalChallenges: 0,
      completedChallenges: 0,
      activeChallenges: 0,
      pendingChallenges: 0,
      rejectedChallenges: 0,
      expiredChallenges: 0,
      completionRate: 0,
      uniqueUsers: 0,
    },
    categories: [],
    dailyTrends: [],
    topUsers: [],
    timeStats: {
      avgReadingTime: 0,
      avgQuizTime: 0,
      sessionCount: 0,
    },
  }

  // Use loaded stats or defaults
  const currentStats = stats || defaultStats

  return (
    <Box py={4}>
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          mb={6}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <VStack
            align={isMobile ? 'center' : 'flex-start'}
            spacing={1}
            w={isMobile ? 'full' : 'auto'}
          >
            <Heading size={isMobile ? 'md' : 'lg'} color={textColor}>
              Quick Clash Analytics
            </Heading>
            <Text
              color={subTextColor}
              fontSize={isMobile ? 'xs' : 'sm'}
              textAlign={isMobile ? 'center' : 'left'}
            >
              Insights and metrics for the Quick Clash feature
            </Text>
          </VStack>

          <Flex
            direction={isMobile ? 'column' : 'row'}
            gap={3}
            w={isMobile ? 'full' : 'auto'}
            mt={isMobile ? 2 : 0}
          >
            <HStack
              spacing={4}
              w={isMobile ? 'full' : 'auto'}
              justify={isMobile ? 'space-between' : 'flex-start'}
            >
              <FormControl w={isMobile ? '48%' : 'auto'}>
                <FormLabel
                  htmlFor="startDate"
                  fontSize="xs"
                  color={subTextColor}
                >
                  Start Date
                </FormLabel>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  size="sm"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                />
              </FormControl>
              <FormControl w={isMobile ? '48%' : 'auto'}>
                <FormLabel htmlFor="endDate" fontSize="xs" color={subTextColor}>
                  End Date
                </FormLabel>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  size="sm"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                />
              </FormControl>
            </HStack>

            <FormControl
              display="flex"
              alignItems="center"
              mt={isMobile ? 2 : 0}
            >
              <FormLabel
                htmlFor="include-bots"
                mb="0"
                fontSize="xs"
                color={subTextColor}
              >
                Include Bot Users
              </FormLabel>
              <Switch
                id="include-bots"
                isChecked={includeBots}
                onChange={() => setIncludeBots(!includeBots)}
                colorScheme="purple"
                size={isMobile ? 'sm' : 'md'}
              />
            </FormControl>
          </Flex>
        </Flex>

        {/* Mobile-Friendly Tabs */}
        {isMobile ? (
          <Tabs
            variant="soft-rounded"
            colorScheme="purple"
            isFitted
            size="sm"
            onChange={index => setActiveTab(index)}
            mb={6}
          >
            <TabList mb={4}>
              <Tab _selected={{ color: 'white', bg: 'purple.600' }}>
                Overview
              </Tab>
              <Tab _selected={{ color: 'white', bg: 'purple.600' }}>Charts</Tab>
              <Tab _selected={{ color: 'white', bg: 'purple.600' }}>Users</Tab>
              <Tab _selected={{ color: 'white', bg: 'purple.600' }}>
                Activity
              </Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel px={0}>
                <Grid templateColumns="repeat(2, 1fr)" gap={3} mb={4}>
                  <MotionStat
                    title="Total Challenges"
                    value={currentStats.overall.totalChallenges}
                    icon={<FiBarChart2 />}
                    color="blue.500"
                    delay={0.1}
                    isMobile={true}
                  />

                  <MotionStat
                    title="Completion Rate"
                    value={`${currentStats.overall.completionRate}%`}
                    icon={<FiActivity />}
                    color="green.500"
                    delay={0.2}
                    isMobile={true}
                  />

                  <MotionStat
                    title="Unique Users"
                    value={currentStats.overall.uniqueUsers}
                    icon={<FiUsers />}
                    color="purple.500"
                    delay={0.3}
                    isMobile={true}
                  />

                  <MotionStat
                    title="Avg Reading Time"
                    value={`${currentStats.timeStats.avgReadingTime}s`}
                    icon={<FiClock />}
                    color="orange.500"
                    delay={0.4}
                    isMobile={true}
                  />

                  {currentStats.botStats && (
                    <>
                      <MotionStat
                        title="Bot Challenges"
                        value={currentStats.botStats.botChallenges}
                        icon={<FiZap />}
                        color="cyan.500"
                        delay={0.5}
                        isMobile={true}
                      />

                      <MotionStat
                        title="Bot Completion"
                        value={`${currentStats.botStats.botCompletionRate}%`}
                        icon={<FiTrendingUp />}
                        color="pink.500"
                        delay={0.6}
                        isMobile={true}
                      />
                    </>
                  )}
                </Grid>

                {/* Challenge Status Distribution */}
                <MotionChartCard
                  title="Challenge Status Distribution"
                  icon={<FiPieChart />}
                  delay={0.5}
                  isMobile={true}
                >
                  {currentStats.overall.totalChallenges > 0 ? (
                    <Box h="220px">
                      <Doughnut
                        data={statusChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: 'white',
                                font: {
                                  size: 10,
                                },
                                boxWidth: 10,
                                padding: 8,
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const total = context.dataset.data.reduce(
                                    (a, b) => a + b,
                                    0,
                                  )
                                  const percentage = Math.round(
                                    (context.raw / total) * 100,
                                  )
                                  return `${context.label}: ${context.raw} (${percentage}%)`
                                },
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <EmptyChartMessage message="No challenge data available" />
                  )}
                </MotionChartCard>
              </TabPanel>

              {/* Charts Tab */}
              <TabPanel px={0}>
                <VStack spacing={6}>
                  {/* Daily Trends */}
                  <MotionChartCard
                    title="Daily Challenge Trends"
                    icon={<FiTrendingUp />}
                    delay={0.6}
                    isMobile={true}
                  >
                    {currentStats.dailyTrends.length > 0 ? (
                      <Box h="220px">
                        <Line
                          data={trendChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  color: 'white',
                                  font: {
                                    size: 10,
                                  },
                                  boxWidth: 10,
                                  padding: 8,
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  precision: 0,
                                  color: 'rgba(255,255,255,0.7)',
                                  font: {
                                    size: 9,
                                  },
                                },
                                grid: {
                                  color: 'rgba(255,255,255,0.1)',
                                },
                              },
                              x: {
                                ticks: {
                                  color: 'rgba(255,255,255,0.7)',
                                  font: {
                                    size: 8,
                                  },
                                  maxRotation: 45,
                                  minRotation: 45,
                                },
                                grid: {
                                  color: 'rgba(255,255,255,0.1)',
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      <EmptyChartMessage message="No trend data available" />
                    )}
                  </MotionChartCard>

                  {/* Categories Distribution */}
                  <MotionChartCard
                    title="Categories Distribution"
                    icon={<FiPieChart />}
                    delay={0.7}
                    isMobile={true}
                  >
                    {currentStats.categories.length > 0 ? (
                      <Box h="220px">
                        <Bar
                          data={categoryChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false,
                              },
                              tooltip: {
                                titleFont: {
                                  size: 12,
                                },
                                bodyFont: {
                                  size: 11,
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  precision: 0,
                                  color: 'rgba(255,255,255,0.7)',
                                  font: {
                                    size: 9,
                                  },
                                },
                                grid: {
                                  color: 'rgba(255,255,255,0.1)',
                                },
                              },
                              x: {
                                ticks: {
                                  color: 'rgba(255,255,255,0.7)',
                                  font: {
                                    size: 8,
                                  },
                                  maxRotation: 45,
                                  minRotation: 45,
                                },
                                grid: {
                                  color: 'rgba(255,255,255,0.1)',
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      <EmptyChartMessage message="No category data available" />
                    )}
                  </MotionChartCard>

                  {/* Bot vs Human Graph - Only if bot stats exist */}
                  {currentStats.botStats && (
                    <MotionChartCard
                      title="Bot vs Real User Activity"
                      icon={<FiUsers />}
                      delay={0.8}
                      isMobile={true}
                    >
                      <Box h="220px">
                        <Doughnut
                          data={{
                            labels: ['Bot Users', 'Real Users'],
                            datasets: [
                              {
                                data: [
                                  currentStats.botStats.botChallenges,
                                  currentStats.overall.totalChallenges -
                                    currentStats.botStats.botChallenges,
                                ],
                                backgroundColor: [
                                  'rgba(153, 102, 255, 0.7)',
                                  'rgba(75, 192, 192, 0.7)',
                                ],
                                borderWidth: 1,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  color: 'white',
                                  font: {
                                    size: 10,
                                  },
                                  boxWidth: 10,
                                  padding: 8,
                                },
                              },
                              tooltip: {
                                callbacks: {
                                  label: function (context) {
                                    const total = context.dataset.data.reduce(
                                      (a, b) => a + b,
                                      0,
                                    )
                                    const percentage = Math.round(
                                      (context.raw / total) * 100,
                                    )
                                    return `${context.label}: ${context.raw} (${percentage}%)`
                                  },
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                    </MotionChartCard>
                  )}
                </VStack>
              </TabPanel>

              {/* Users Tab */}
              <TabPanel px={0}>
                {/* Top Users */}
                <MotionChartCard
                  title="Top Users by Challenge Participation"
                  icon={<FiAward />}
                  delay={0.8}
                  isMobile={true}
                >
                  {currentStats.topUsers.length > 0 ? (
                    <Box maxH="350px" overflowY="auto" pr={2}>
                      <VStack align="stretch" spacing={2}>
                        {currentStats.topUsers.map((user, index) => (
                          <HStack
                            key={user.userId}
                            p={2}
                            borderRadius="md"
                            bg={
                              index % 2 === 0 ? 'whiteAlpha.100' : 'transparent'
                            }
                            justify="space-between"
                          >
                            <HStack spacing={2}>
                              <Badge
                                borderRadius="full"
                                px={1.5}
                                py={0.5}
                                fontSize="xs"
                                colorScheme={index < 3 ? 'purple' : 'gray'}
                              >
                                #{index + 1}
                              </Badge>
                              <VStack align="flex-start" spacing={0}>
                                <Text fontWeight="medium" fontSize="sm">
                                  {user.inGameName || user.name}
                                </Text>
                                <Text fontSize="2xs" color={subTextColor}>
                                  {user.totalChallenges} challenges |{' '}
                                  {user.wins} wins
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge
                              colorScheme={
                                user.winRate > 60
                                  ? 'green'
                                  : user.winRate > 40
                                  ? 'blue'
                                  : 'orange'
                              }
                              fontSize="2xs"
                            >
                              {user.winRate}% win rate
                            </Badge>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  ) : (
                    <EmptyChartMessage message="No user data available" />
                  )}
                </MotionChartCard>

                {/* Bot User Stats */}
                {currentStats.botStats && currentStats.botStats.topBots && (
                  <MotionChartCard
                    title="Top Bot Users"
                    icon={<FiZap />}
                    delay={0.9}
                    isMobile={true}
                    mt={4}
                  >
                    {currentStats.botStats.topBots.length > 0 ? (
                      <Box maxH="350px" overflowY="auto" pr={2}>
                        <VStack align="stretch" spacing={2}>
                          {currentStats.botStats.topBots.map((bot, index) => (
                            <HStack
                              key={bot.userId}
                              p={2}
                              borderRadius="md"
                              bg={
                                index % 2 === 0
                                  ? 'whiteAlpha.100'
                                  : 'transparent'
                              }
                              justify="space-between"
                            >
                              <HStack spacing={2}>
                                <Badge
                                  borderRadius="full"
                                  px={1.5}
                                  py={0.5}
                                  fontSize="xs"
                                  colorScheme="purple"
                                >
                                  #{index + 1}
                                </Badge>
                                <VStack align="flex-start" spacing={0}>
                                  <Text fontWeight="medium" fontSize="sm">
                                    {bot.inGameName || bot.name}
                                  </Text>
                                  <Text fontSize="2xs" color={subTextColor}>
                                    {bot.totalChallenges} challenges |{' '}
                                    {bot.completionRate}% completed
                                  </Text>
                                </VStack>
                              </HStack>
                              <Badge fontSize="2xs" colorScheme="cyan">
                                BOT
                              </Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    ) : (
                      <EmptyChartMessage message="No bot data available" />
                    )}
                  </MotionChartCard>
                )}
              </TabPanel>

              {/* User Activity Tab (Mobile) */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {/* Date Selector and DAU/MAU Stats */}
                  <HStack spacing={4} justify="space-between" flexWrap="wrap">
                    <FormControl w="auto">
                      <FormLabel
                        htmlFor="activityDate"
                        fontSize="xs"
                        color={subTextColor}
                      >
                        Activity Date
                      </FormLabel>
                      <Input
                        id="activityDate"
                        name="activityDate"
                        type="date"
                        value={activityDate}
                        onChange={handleActivityDateChange}
                        size="sm"
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                      />
                    </FormControl>
                    <Button
                      colorScheme="purple"
                      size="sm"
                      mt="auto"
                      onClick={() => {
                        setUserDetailTab(true)
                        fetchUserActivity(true)
                      }}
                      isLoading={activityLoading}
                    >
                      View Users
                    </Button>
                  </HStack>

                  {/* DAU/MAU Stats */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    {renderDauMauStats()}
                  </Grid>

                  {/* User Activity Cards (Mobile) */}
                  <MobileUserActivity
                    users={userActivity}
                    isLoading={activityLoading}
                    hasMore={hasMoreUsers}
                    onLoadMore={loadMoreUsers}
                  />
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          /* Desktop Layout */
          <>
            {/* Key Metrics Summary */}
            <Grid
              templateColumns={{
                base: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={4}
              mb={8}
            >
              <MotionStat
                title="Total Challenges"
                value={currentStats.overall.totalChallenges}
                icon={<FiBarChart2 />}
                color="blue.500"
                delay={0.1}
              />

              <MotionStat
                title="Completion Rate"
                value={`${currentStats.overall.completionRate}%`}
                icon={<FiActivity />}
                color="green.500"
                delay={0.2}
              />

              <MotionStat
                title="Unique Users"
                value={currentStats.overall.uniqueUsers}
                icon={<FiUsers />}
                color="purple.500"
                delay={0.3}
              />

              <MotionStat
                title="Avg Reading Time"
                value={`${currentStats.timeStats.avgReadingTime}s`}
                icon={<FiClock />}
                color="orange.500"
                delay={0.4}
              />

              {currentStats.botStats && (
                <>
                  <MotionStat
                    title="Bot Challenges"
                    value={currentStats.botStats.botChallenges}
                    icon={<FiZap />}
                    color="cyan.500"
                    delay={0.5}
                  />

                  <MotionStat
                    title="Bot Completion Rate"
                    value={`${currentStats.botStats.botCompletionRate}%`}
                    icon={<FiTrendingUp />}
                    color="pink.500"
                    delay={0.6}
                  />
                </>
              )}
            </Grid>

            <Grid
              templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }}
              gap={6}
              mb={8}
            >
              {/* Challenge Status Distribution */}
              <MotionChartCard
                title="Challenge Status Distribution"
                icon={<FiPieChart />}
                delay={0.5}
              >
                {currentStats.overall.totalChallenges > 0 ? (
                  <Box h="300px">
                    <Doughnut
                      data={statusChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: 'white',
                              padding: 15,
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                const total = context.dataset.data.reduce(
                                  (a, b) => a + b,
                                  0,
                                )
                                const percentage = Math.round(
                                  (context.raw / total) * 100,
                                )
                                return `${context.label}: ${context.raw} (${percentage}%)`
                              },
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <EmptyChartMessage message="No challenge data available" />
                )}
              </MotionChartCard>

              {/* Daily Trends */}
              <MotionChartCard
                title="Daily Challenge Trends"
                icon={<FiTrendingUp />}
                delay={0.6}
              >
                {currentStats.dailyTrends.length > 0 ? (
                  <Box h="300px">
                    <Line
                      data={trendChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: 'white',
                              padding: 15,
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0,
                              color: 'rgba(255,255,255,0.7)',
                            },
                            grid: {
                              color: 'rgba(255,255,255,0.1)',
                            },
                          },
                          x: {
                            ticks: {
                              color: 'rgba(255,255,255,0.7)',
                            },
                            grid: {
                              color: 'rgba(255,255,255,0.1)',
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <EmptyChartMessage message="No trend data available" />
                )}
              </MotionChartCard>
            </Grid>

            <Grid
              templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }}
              gap={6}
              mb={8}
            >
              {/* Categories Distribution */}
              <MotionChartCard
                title="Categories Distribution"
                icon={<FiPieChart />}
                delay={0.7}
              >
                {currentStats.categories.length > 0 ? (
                  <Box h="300px">
                    <Bar
                      data={categoryChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0,
                              color: 'rgba(255,255,255,0.7)',
                            },
                            grid: {
                              color: 'rgba(255,255,255,0.1)',
                            },
                          },
                          x: {
                            ticks: {
                              color: 'rgba(255,255,255,0.7)',
                            },
                            grid: {
                              color: 'rgba(255,255,255,0.1)',
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <EmptyChartMessage message="No category data available" />
                )}
              </MotionChartCard>

              {/* Top Users */}
              <MotionChartCard
                title="Top Users by Challenge Participation"
                icon={<FiAward />}
                delay={0.8}
              >
                {currentStats.topUsers.length > 0 ? (
                  <Box maxH="300px" overflowY="auto" pr={2}>
                    <VStack align="stretch" spacing={3}>
                      {currentStats.topUsers.map((user, index) => (
                        <HStack
                          key={user.userId}
                          p={3}
                          borderRadius="md"
                          bg={
                            index % 2 === 0 ? 'whiteAlpha.100' : 'transparent'
                          }
                          justify="space-between"
                        >
                          <HStack>
                            <Badge
                              borderRadius="full"
                              px={2}
                              py={1}
                              colorScheme={index < 3 ? 'purple' : 'gray'}
                            >
                              #{index + 1}
                            </Badge>
                            <VStack align="flex-start" spacing={0}>
                              <Text fontWeight="medium">
                                {user.inGameName || user.name}
                              </Text>
                              <Text fontSize="xs" color={subTextColor}>
                                {user.totalChallenges} challenges | {user.wins}{' '}
                                wins
                              </Text>
                            </VStack>
                          </HStack>
                          <Badge
                            colorScheme={
                              user.winRate > 60
                                ? 'green'
                                : user.winRate > 40
                                ? 'blue'
                                : 'orange'
                            }
                          >
                            {user.winRate}% win rate
                          </Badge>
                          {user.isBot && (
                            <Badge ml={2} colorScheme="purple">
                              BOT
                            </Badge>
                          )}
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                ) : (
                  <EmptyChartMessage message="No user data available" />
                )}
              </MotionChartCard>
            </Grid>

            {/* Bot Analysis Section */}
            {currentStats.botStats && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                mb={8}
              >
                <Heading size="md" color={textColor} mb={4}>
                  Bot vs Human Usage Analysis
                </Heading>
                <Grid
                  templateColumns={{
                    base: 'repeat(1, 1fr)',
                    lg: 'repeat(2, 1fr)',
                  }}
                  gap={6}
                >
                  <MotionChartCard
                    title="Bot vs Real User Distribution"
                    icon={<FiPieChart />}
                    delay={1.0}
                  >
                    <Box h="300px">
                      <Doughnut
                        data={{
                          labels: ['Bot Users', 'Real Users'],
                          datasets: [
                            {
                              data: [
                                currentStats.botStats.botChallenges,
                                currentStats.overall.totalChallenges -
                                  currentStats.botStats.botChallenges,
                              ],
                              backgroundColor: [
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: 'white',
                                padding: 15,
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const total = context.dataset.data.reduce(
                                    (a, b) => a + b,
                                    0,
                                  )
                                  const percentage = Math.round(
                                    (context.raw / total) * 100,
                                  )
                                  return `${context.label}: ${context.raw} (${percentage}%)`
                                },
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </MotionChartCard>

                  {currentStats.botStats.topBots && (
                    <MotionChartCard
                      title="Top Bot Users"
                      icon={<FiZap />}
                      delay={1.1}
                    >
                      {currentStats.botStats.topBots.length > 0 ? (
                        <Box maxH="300px" overflowY="auto" pr={2}>
                          <VStack align="stretch" spacing={3}>
                            {currentStats.botStats.topBots.map((bot, index) => (
                              <HStack
                                key={bot.userId}
                                p={3}
                                borderRadius="md"
                                bg={
                                  index % 2 === 0
                                    ? 'whiteAlpha.100'
                                    : 'transparent'
                                }
                                justify="space-between"
                              >
                                <HStack>
                                  <Badge
                                    borderRadius="full"
                                    px={2}
                                    py={1}
                                    colorScheme="purple"
                                  >
                                    #{index + 1}
                                  </Badge>
                                  <VStack align="flex-start" spacing={0}>
                                    <Text fontWeight="medium">
                                      {bot.inGameName || bot.name}
                                    </Text>
                                    <Text fontSize="xs" color={subTextColor}>
                                      {bot.totalChallenges} challenges |{' '}
                                      {bot.completionRate}% completed
                                    </Text>
                                  </VStack>
                                </HStack>
                                <Badge colorScheme="cyan">BOT</Badge>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      ) : (
                        <EmptyChartMessage message="No bot data available" />
                      )}
                    </MotionChartCard>
                  )}
                </Grid>
              </MotionBox>
            )}

            {/* User Activity Section - Desktop */}
            <Box mt={8}>
              <HStack justify="space-between" mb={4}>
                <Heading size="md" color={textColor}>
                  User Activity Analysis
                </Heading>
                <HStack>
                  <FormControl w="auto">
                    <FormLabel
                      htmlFor="activityDate"
                      fontSize="sm"
                      color={subTextColor}
                    >
                      Activity Date
                    </FormLabel>
                    <Input
                      id="activityDate"
                      name="activityDate"
                      type="date"
                      value={activityDate}
                      onChange={handleActivityDateChange}
                      size="sm"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                    />
                  </FormControl>
                  <Button
                    mt={8}
                    colorScheme="purple"
                    size="sm"
                    onClick={() => {
                      setUserDetailTab(true)
                      fetchUserActivity(true)
                    }}
                    isLoading={activityLoading}
                  >
                    View User Activity
                  </Button>
                </HStack>
              </HStack>

              {/* DAU/MAU Stats */}
              <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={5}>
                {renderDauMauStats()}
              </Grid>

              {/* User Activity Table (only shown when requested) */}
              {userDetailTab && (
                <UserActivityTable
                  users={userActivity}
                  isLoading={activityLoading}
                  hasMore={hasMoreUsers}
                  onLoadMore={loadMoreUsers}
                />
              )}
            </Box>
          </>
        )}
      </MotionBox>
    </Box>
  )
}

// Helper components
const MotionStat = ({
  title,
  value,
  icon,
  color,
  delay = 0,
  isMobile = false,
}) => {
  const bgCard = 'gray.800'
  const borderColor = 'gray.700'
  const subTextColor = 'gray.300'

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      bg={bgCard}
      p={isMobile ? 3 : 5}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        borderColor: `${color}`,
        transition: 'all 0.3s ease',
      }}
    >
      <Stat>
        <HStack spacing={2}>
          <Box color={color} fontSize={isMobile ? 'md' : 'xl'}>
            {icon}
          </Box>
          <StatLabel fontSize={isMobile ? 'xs' : 'sm'} color={subTextColor}>
            {title}
          </StatLabel>
        </HStack>
        <StatNumber
          fontSize={isMobile ? 'lg' : '2xl'}
          fontWeight="bold"
          mt={isMobile ? 1 : 2}
          color="white"
        >
          {value}
        </StatNumber>
      </Stat>
    </MotionBox>
  )
}

const MotionChartCard = ({
  title,
  children,
  icon,
  delay = 0,
  isMobile = false,
  ...rest
}) => {
  const bgCard = 'gray.800'
  const borderColor = 'gray.700'
  const headerBg = 'gray.700'

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      bg={bgCard}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{
        boxShadow: 'lg',
        borderColor: 'purple.400',
        transition: 'all 0.3s ease',
      }}
      {...rest}
    >
      <Flex
        bg={headerBg}
        p={isMobile ? 3 : 4}
        alignItems="center"
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
      >
        <Box mr={2} fontSize={isMobile ? 'md' : 'lg'} color="purple.300">
          {icon}
        </Box>
        <Heading size={isMobile ? 'xs' : 'sm'} color="white">
          {title}
        </Heading>
      </Flex>
      <Box p={isMobile ? 3 : 4} bg="gray.900">
        {children}
      </Box>
    </MotionBox>
  )
}

const EmptyChartMessage = ({ message }) => (
  <Flex
    h="200px"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    p={4}
    textAlign="center"
  >
    <Text color="gray.400" fontSize={{ base: 'md', md: 'lg' }}>
      {message}
    </Text>
    <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }} mt={2}>
      Data will appear here as more challenges are completed.
    </Text>
  </Flex>
)

// Input component with dark theme styling
const Input = ({ id, name, type, value, onChange, size, ...rest }) => {
  return (
    <Box
      as="input"
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      size={size}
      borderRadius="md"
      border="1px solid"
      borderColor="gray.600"
      color="white"
      bg="gray.700"
      p={2}
      _hover={{
        borderColor: 'purple.400',
      }}
      _focus={{
        outline: 'none',
        boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
        borderColor: 'purple.500',
      }}
      {...rest}
    />
  )
}

// Mobile Card View for User Activity
const MobileUserActivity = ({ users, isLoading, hasMore, onLoadMore }) => {
  if (isLoading && users.length === 0) {
    return (
      <Center py={10}>
        <VStack spacing={3}>
          <Spinner size="xl" color="purple.500" />
          <Text color="whiteAlpha.700">Loading user activity...</Text>
        </VStack>
      </Center>
    )
  }

  if (users.length === 0 && !isLoading) {
    return (
      <Box textAlign="center" py={10} px={3}>
        <Icon as={FiUsers} boxSize={10} color="whiteAlpha.400" mb={3} />
        <Heading size="sm" mb={2} color="whiteAlpha.900">
          No User Activity
        </Heading>
        <Text color="whiteAlpha.600" fontSize="sm">
          There's no Quick Clash activity recorded for this date
        </Text>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      {users.map((user, index) => (
        <MotionBox
          key={`${user.userId}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          bg="gray.800"
          borderRadius="lg"
          borderWidth="1px"
          borderColor={user.isBot ? 'purple.700' : 'gray.700'}
          overflow="hidden"
          p={0}
          boxShadow="sm"
        >
          <Flex
            bg={user.isBot ? 'purple.900' : 'gray.750'}
            p={3}
            alignItems="center"
            borderBottomWidth="1px"
            borderBottomColor="gray.700"
          >
            <Avatar
              size="sm"
              name={user.name || user.inGameName}
              src={user.pic}
              mr={3}
              bg={user.isBot ? 'purple.500' : 'blue.500'}
            />
            <Box flex="1">
              <HStack justify="space-between" align="center">
                <VStack spacing={0} align="flex-start">
                  <Text
                    fontWeight="medium"
                    color="white"
                    fontSize="sm"
                    noOfLines={1}
                  >
                    {user.inGameName || user.name}
                  </Text>
                  <Text fontSize="2xs" color="whiteAlpha.600" noOfLines={1}>
                    {user.email}
                  </Text>
                </VStack>

                {user.isBot && (
                  <Badge size="sm" colorScheme="purple" ml={1}>
                    BOT
                  </Badge>
                )}
              </HStack>
            </Box>
          </Flex>

          <Box p={3}>
            <SimpleGrid columns={2} spacing={3}>
              <StatItem
                label="Total Challenges"
                value={user.totalChallenges}
                color="blue.400"
              />
              <StatItem
                label="Completed"
                value={user.completedChallenges}
                subValue={`${user.completionRate}%`}
                color="green.400"
              />
              <StatItem
                label="Won"
                value={user.wonChallenges}
                color="yellow.400"
              />
              <StatItem
                label="Win Rate"
                value={`${user.winRate}%`}
                color={
                  user.winRate > 60
                    ? 'green.400'
                    : user.winRate > 40
                    ? 'blue.400'
                    : 'orange.400'
                }
              />
            </SimpleGrid>

            <Flex justifyContent="flex-end" mt={2}>
              <Badge
                colorScheme={
                  user.primaryRole === 'challenger' ? 'blue' : 'green'
                }
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="full"
              >
                {user.primaryRole === 'challenger' ? 'Creator' : 'Participant'}
              </Badge>
            </Flex>
          </Box>
        </MotionBox>
      ))}

      {hasMore && (
        <Button
          onClick={onLoadMore}
          isLoading={isLoading}
          colorScheme="purple"
          variant="outline"
          size="sm"
          leftIcon={<FiChevronDown />}
          width="full"
          my={2}
        >
          Load More
        </Button>
      )}
    </VStack>
  )
}

// Stat Item for mobile cards
const StatItem = ({ label, value, subValue, color }) => (
  <Box>
    <Text fontSize="xs" color="whiteAlpha.600">
      {label}
    </Text>
    <HStack mt={1} spacing={1}>
      <Circle size="16px" bg={color} opacity={0.3} />
      <Text fontSize="md" fontWeight="bold" color="white">
        {value}
      </Text>
      {subValue && (
        <Text fontSize="2xs" color="whiteAlpha.600" alignSelf="flex-end" ml={1}>
          ({subValue})
        </Text>
      )}
    </HStack>
  </Box>
)

// Desktop Table View for User Activity
const UserActivityTable = ({ users, isLoading, hasMore, onLoadMore }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg="gray.800"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      borderWidth="1px"
      borderColor="gray.700"
      mb={6}
    >
      <Flex
        bg="gray.700"
        p={4}
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth="1px"
        borderBottomColor="gray.600"
      >
        <Heading size="sm" color="white">
          User Activity Details
        </Heading>
      </Flex>

      <Box overflowX="auto">
        <Box p={3}>
          {/* Table Header */}
          <Grid
            templateColumns="auto 1fr 1fr 1fr 1fr 1fr 1fr"
            gap={3}
            bg="gray.900"
            p={3}
            mb={1}
            borderRadius="md"
            alignItems="center"
            fontWeight="bold"
            color="gray.300"
            fontSize="sm"
          >
            <Box>User</Box>
            <Box>Name</Box>
            <Box textAlign="center">Challenges</Box>
            <Box textAlign="center">Completed</Box>
            <Box textAlign="center">Won</Box>
            <Box textAlign="center">Win Rate</Box>
            <Box textAlign="center">Role</Box>
          </Grid>

          {/* User Rows */}
          {users.length > 0 ? (
            <VStack spacing={1} align="stretch">
              {users.map((user, index) => (
                <Grid
                  key={`${user.userId}-${index}`}
                  templateColumns="auto 1fr 1fr 1fr 1fr 1fr 1fr"
                  gap={3}
                  p={2}
                  borderRadius="md"
                  alignItems="center"
                  fontSize="sm"
                  bg={index % 2 === 0 ? 'whiteAlpha.50' : 'transparent'}
                  _hover={{ bg: 'whiteAlpha.100' }}
                  transition="background 0.2s"
                >
                  <Flex align="center">
                    <Avatar
                      size="sm"
                      name={user.name || user.inGameName}
                      src={user.pic}
                    />
                  </Flex>

                  <Box>
                    <Text
                      color="white"
                      fontWeight={user.isBot ? 'normal' : 'medium'}
                    >
                      {user.inGameName}
                      {user.isBot && (
                        <Badge ml={1} colorScheme="purple" fontSize="2xs">
                          BOT
                        </Badge>
                      )}
                    </Text>
                    <Text fontSize="2xs" color="gray.400" isTruncated>
                      {user.email}
                    </Text>
                  </Box>

                  <Box textAlign="center">
                    <Text color="white">{user.totalChallenges}</Text>
                  </Box>

                  <Box textAlign="center">
                    <Text color="white">{user.completedChallenges}</Text>
                    <Text fontSize="2xs" color="gray.400">
                      {user.completionRate}%
                    </Text>
                  </Box>

                  <Box textAlign="center">
                    <Text color="white">{user.wonChallenges}</Text>
                  </Box>

                  <Box textAlign="center">
                    <Badge
                      colorScheme={
                        user.winRate > 60
                          ? 'green'
                          : user.winRate > 40
                          ? 'blue'
                          : 'orange'
                      }
                      fontSize="2xs"
                    >
                      {user.winRate}%
                    </Badge>
                  </Box>

                  <Box textAlign="center">
                    <Badge
                      colorScheme={
                        user.primaryRole === 'challenger' ? 'blue' : 'green'
                      }
                      fontSize="2xs"
                    >
                      {user.primaryRole === 'challenger'
                        ? 'Creator'
                        : 'Participant'}
                    </Badge>
                  </Box>
                </Grid>
              ))}
            </VStack>
          ) : (
            <Box py={10} textAlign="center" color="gray.500">
              {isLoading ? (
                <Spinner size="md" color="purple.500" />
              ) : (
                <Text>No user activity found for this date</Text>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Load More Button */}
      {hasMore && users.length > 0 && (
        <Box
          textAlign="center"
          py={4}
          borderTopWidth="1px"
          borderTopColor="gray.700"
        >
          <Button
            onClick={onLoadMore}
            isLoading={isLoading}
            loadingText="Loading..."
            size="sm"
            colorScheme="purple"
            variant="outline"
            _hover={{ bg: 'purple.800' }}
          >
            Load More Users
          </Button>
        </Box>
      )}

      {/* Empty State */}
      {users.length === 0 && !isLoading && (
        <Box py={10} textAlign="center" color="gray.500">
          <Icon as={FiUsers} boxSize={10} mb={4} />
          <Heading size="md" mb={2}>
            No User Activity
          </Heading>
          <Text>There's no Quick Clash activity on this date</Text>
        </Box>
      )}
    </MotionBox>
  )
}

export default QuickClashAnalytics
