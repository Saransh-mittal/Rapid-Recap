import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  useRef,
  memo,
} from 'react'
import {
  Box,
  VStack,
  Text,
  useToast,
  Spinner,
  Center,
  Icon,
  Button,
  useDisclosure,
  Flex,
  Divider,
  Heading,
  HStack,
  useBreakpointValue,
  Skeleton,
  Grid,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {
  Target,
  Zap,
  HourglassIcon,
  Trophy,
  X,
  FileText,
  ChevronDown,
  Users,
  RefreshCw,
} from 'lucide-react'

// Import custom components - using dynamic imports for performance
import FilterTabs from './FilterTabs'
import EmptyState from './EmptyState'
import StatusSection from './StatusSection'
import ConfirmationDialog from './ConfirmationDialog'

// Use React.lazy for components that aren't always needed
const QuizReportModal = React.lazy(() => import('./QuizReportModal'))
const NewChallengeModal = React.lazy(() => import('./modals/NewChallengeModal'))
const CompletedChallengesView = React.lazy(() =>
  import('./CompletedChallengesView'),
)
const TeamBattleList = React.lazy(() => import('./team/TeamBattleList'))
const RevengeConfirmationDialog = React.lazy(() =>
  import('./RevengeConfirmationDialog'),
)

// Custom hooks
import useQuickClash from '../../customHooks/useQuickClash'
import useQuickClashSocket from '../../customHooks/useQuickClashSocket'
import useQuickClashTeamBattle from '../../customHooks/useQuickClashTeamBattle'
import { useInView } from 'react-intersection-observer'

/**
 * Displays active challenges, allowing filtering between 1v1 and 4v4 modes
 * - Performance optimized with memo, lazy loading, and virtualization
 * - Responsive design with useBreakpointValue
 * - Improved loading states and skeleton screens
 * - Enhanced visual design and animations
 * - Implements infinite scrolling for better performance
 * - Hash-based navigation for direct linking to modes
 */
const ActiveChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()

  // Responsive styling
  const padding = useBreakpointValue({ base: 2, md: 3 })
  const spacing = useBreakpointValue({ base: 4, md: 6 })
  const buttonSize = useBreakpointValue({ base: 'xs', md: 'sm' })

  // Mode state (1v1 or 4v4) - will be synced with URL hash
  const [mode, setMode] = useState('1v1')

  // Track initial data loads to prevent infinite loading cycles
  const initialDataLoadedRef = useRef({
    '1v1': false,
    '4v4': false,
  })

  // Track if we've shown the empty state to prevent cycling
  const [emptyStateShown, setEmptyStateShown] = useState({
    '1v1': false,
    '4v4': false,
  })

  // 1v1 Challenge states
  const [filter, setFilter] = useState('all')
  const {
    activeChallenges: challenges,
    activeChallengesLoading: loading,
    activeChallengesError: error,
    activeChallengesPage: page,
    activeChallengesHasMore: hasMore,
    loadActiveChallenges,
    loadMoreActiveChallenges,
    handleAcceptChallenge,
    handleRejectChallenge,
    createChallenge,
  } = useQuickClash()
  const { emitChallengeAccepted, emitChallengeRejected } = useQuickClashSocket()
  const { user } = useSelector(state => state.auth)
  const userId = user?._id
  const [selectedSession, setSelectedSession] = useState(null)
  const [nextPageLoading, setNextPageLoading] = useState(false)

  // IntersectionObserver for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // 4v4 Team battle states
  const {
    activeBattles,
    activeBattlesLoading,
    activeBattlesError,
    loadTeamBattles,
    goToBattle,
  } = useQuickClashTeamBattle()

  // Modal disclosures
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isRevengeConfirmOpen, setIsRevengeConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState({ type: '', id: '' })

  // Revenge state
  const [revengeData, setRevengeData] = useState(null)
  const [revengeLoading, setRevengeLoading] = useState(false)
  const [revengeProgress, setRevengeProgress] = useState(0)
  const progressTimerRef = useRef(null)

  // Initialize mode from URL hash on component mount
  useEffect(() => {
    const initializeModeFromHash = () => {
      const hash = window.location.hash.substring(1) // Remove # symbol

      if (hash.startsWith('active/')) {
        const subRoute = hash.split('/')[1]
        if (subRoute === '1v1' || subRoute === '4v4') {
          setMode(subRoute)
        } else {
          // Invalid sub-route, default to 1v1 and update hash
          setMode('1v1')
          window.history.replaceState(null, '', '#active/1v1')
        }
      } else if (hash === 'active') {
        // No sub-route specified, default to 1v1 and update hash
        setMode('1v1')
        window.history.replaceState(null, '', '#active/1v1')
      } else if (!hash) {
        // No hash at all, set default
        setMode('1v1')
        window.history.replaceState(null, '', '#active/1v1')
      }
    }

    initializeModeFromHash()
  }, [])

  // Track when data has been loaded
  useEffect(() => {
    if (!loading && challenges.length > 0) {
      initialDataLoadedRef.current['1v1'] = true
    } else if (
      !loading &&
      !initialDataLoadedRef.current['1v1'] &&
      challenges.length === 0
    ) {
      setEmptyStateShown(prev => ({ ...prev, '1v1': true }))
    }
  }, [loading, challenges])

  useEffect(() => {
    if (!activeBattlesLoading && activeBattles.length > 0) {
      initialDataLoadedRef.current['4v4'] = true
    } else if (
      !activeBattlesLoading &&
      !initialDataLoadedRef.current['4v4'] &&
      activeBattles.length === 0
    ) {
      setEmptyStateShown(prev => ({ ...prev, '4v4': true }))
    }
  }, [activeBattlesLoading, activeBattles])

  // Fetch challenges/battles on mount and when mode changes
  useEffect(() => {
    if (userId) {
      if (
        mode === '1v1' &&
        !initialDataLoadedRef.current['1v1'] &&
        !emptyStateShown['1v1']
      ) {
        loadActiveChallenges()
      } else if (
        mode === '4v4' &&
        !initialDataLoadedRef.current['4v4'] &&
        !emptyStateShown['4v4']
      ) {
        loadTeamBattles()
      }
    }
  }, [userId, mode, loadActiveChallenges, loadTeamBattles, emptyStateShown])

  // Handle infinite scrolling
  useEffect(() => {
    if (inView && mode === '1v1' && hasMore && !nextPageLoading && !loading) {
      handleLoadMore()
    }
  }, [inView, mode, hasMore, nextPageLoading, loading])

  // Filter 1v1 challenges based on the selected filter
  const filteredChallenges = useMemo(() => {
    if (!challenges || !userId || mode !== '1v1') return []

    let filtered = [...challenges]

    // Filter based on type (sent/received)
    switch (filter) {
      case 'sent':
        filtered = filtered.filter(c => c.challenger._id === userId)
        break
      case 'received':
        filtered = filtered.filter(c => c.opponent._id === userId)
        break
    }

    // Sort challenges by status and date (pending first, then active, expired last)
    filtered.sort((a, b) => {
      const statusOrder = {
        active: 0,
        pending: 1,
        completed: 2,
        expired: 3,
        rejected: 4,
      }

      // First sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff

      // For same status, sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return filtered
  }, [filter, challenges, userId, mode])

  // Handle tab changes between 1v1 and 4v4
  const handleModeChange = useCallback(newMode => {
    setMode(newMode)
    // Hash update is handled by FilterTabs component
  }, [])

  // Extract completed challenges for enhanced view
  const completedChallenges = useMemo(() => {
    if (mode !== '1v1') return []

    return filteredChallenges.filter(
      c =>
        c.status === 'completed' &&
        c.challengerAttempted &&
        c.opponentAttempted,
    )
  }, [filteredChallenges, mode])

  // Group challenges by their status
  const groupedChallenges = useMemo(() => {
    if (!filteredChallenges.length || mode !== '1v1') return {}

    // Group challenges by status, but exclude completed challenges as they'll be shown separately
    return filteredChallenges.reduce((groups, challenge) => {
      if (
        challenge.status === 'completed' &&
        challenge.challengerAttempted &&
        challenge.opponentAttempted
      ) {
        // Skip completed challenges as they'll be shown in the CompletedChallengesView
        return groups
      }

      const isChallenger = challenge?.challenger?._id === userId
      let statusGroup

      if (challenge.status === 'completed') {
        statusGroup = 'completed'
      } else if (challenge.status === 'active') {
        statusGroup = 'active'
      } else if (challenge.status === 'pending') {
        statusGroup = isChallenger ? 'awaiting' : 'new'
      } else if (challenge.status === 'rejected') {
        statusGroup = 'rejected'
      } else {
        statusGroup = 'other'
      }

      if (!groups[statusGroup]) {
        groups[statusGroup] = []
      }

      groups[statusGroup].push(challenge)
      return groups
    }, {})
  }, [filteredChallenges, userId, mode])

  // Define display order and labels for status groups
  const statusGroups = [
    { key: 'new', label: t('New Challenges'), icon: Target },
    { key: 'active', label: t('Ready to Play'), icon: Zap },
    { key: 'awaiting', label: t('Awaiting Response'), icon: HourglassIcon },
    { key: 'rejected', label: t('Rejected'), icon: X },
    { key: 'other', label: t('Other'), icon: FileText },
  ]

  // Handle confirmation dialog
  const openConfirmDialog = useCallback((type, id) => {
    setConfirmAction({ type, id })
    setIsConfirmOpen(true)
  }, [])

  const closeConfirmDialog = useCallback(() => {
    setIsConfirmOpen(false)
  }, [])

  // Handle report modal
  const openReportModal = useCallback(() => {
    setIsReportOpen(true)
  }, [])

  const closeReportModal = useCallback(() => {
    setIsReportOpen(false)
    setSelectedSession(null)
  }, [])

  // Setup simulated progress timer for better UX during long operations
  const startProgressTimer = useCallback(() => {
    // Clear any existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }

    // Reset progress
    setRevengeProgress(5)

    // Create a timer that increments progress slowly
    progressTimerRef.current = setInterval(() => {
      setRevengeProgress(prev => {
        // Slow down progress as it gets higher
        const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 85 ? 1 : 0.5
        const newValue = Math.min(prev + increment, 90)
        return newValue
      })
    }, 800) // Update slightly faster for better UX
  }, [])

  // Handle revenge action
  const handleRevenge = useCallback((opponent, originalChallenge) => {
    // Store the revenge data for use when confirmed
    setRevengeData({
      opponent,
      originalChallengeId: originalChallenge._id,
      category: originalChallenge.category,
    })

    // Open the revenge confirmation dialog
    setIsRevengeConfirmOpen(true)
  }, [])

  // Close revenge confirmation dialog
  const closeRevengeConfirmDialog = useCallback(() => {
    setIsRevengeConfirmOpen(false)
    // Clear progress timer if it exists
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
    // Reset progress if dialog is being closed
    setRevengeProgress(0)
  }, [])

  // Execute the revenge action when confirmed
  const executeRevenge = useCallback(async () => {
    if (!revengeData) return

    // Start loading state
    setRevengeLoading(true)

    // Start progress timer for UX
    startProgressTimer()

    try {
      // Create a new challenge with the same category
      const result = await createChallenge(revengeData.opponent._id, [
        revengeData.category,
      ])

      // Complete the progress
      setRevengeProgress(100)

      // Make API call to update the original challenge's revengeStatus
      await axios.post(
        `/api/quickClash/challenge/${revengeData.originalChallengeId}/markRevenge`,
      )

      // Short delay to show completed progress
      await new Promise(resolve => setTimeout(resolve, 500))

      // Show success message
      toast({
        title: t('Revenge Challenge Sent!'),
        description: t(
          "Your revenge challenge has been sent. It's time for redemption!",
        ),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      })

      // Refresh challenges list
      loadActiveChallenges()

      // Close the confirmation dialog
      closeRevengeConfirmDialog()

      // Clear the revenge data
      setRevengeData(null)
    } catch (error) {
      console.error('Error creating revenge challenge:', error)

      // Show error toast
      toast({
        title: t('Failed to Send Revenge'),
        description:
          error.response?.data?.message ||
          t('An error occurred while creating the revenge challenge.'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      })

      // Close dialog after error
      closeRevengeConfirmDialog()

      // Clear the revenge data
      setRevengeData(null)
    } finally {
      // End loading state
      setRevengeLoading(false)

      // Clear progress timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [
    revengeData,
    createChallenge,
    closeRevengeConfirmDialog,
    toast,
    t,
    loadActiveChallenges,
    startProgressTimer,
  ])

  // Challenge action handlers
  const handleAccept = useCallback(
    challengeId => {
      openConfirmDialog('accept', challengeId)
    },
    [openConfirmDialog],
  )

  const handleDecline = useCallback(
    challengeId => {
      openConfirmDialog('decline', challengeId)
    },
    [openConfirmDialog],
  )

  const handleStart = useCallback(
    challengeId => {
      navigate(`/quickclash/session/${challengeId}`)
    },
    [navigate],
  )

  const handleViewReport = useCallback(
    challenge => {
      // Find the completed session for this challenge
      const fetchSession = async () => {
        try {
          const response = await axios.get(
            `/api/quickClash/challenge/${challenge._id}/sessions?userId=${userId}`,
          )
          if (response.data && response.data.sessionId) {
            setSelectedSession(response.data.sessionId)
            openReportModal()
          } else {
            toast({
              title: t('Error'),
              description: t('Could not find your quiz session'),
              status: 'error',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
            })
          }
        } catch (error) {
          console.error('Error fetching session:', error)
          toast({
            title: t('Error'),
            description: t('Failed to load quiz session'),
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          })
        }
      }

      fetchSession()
    },
    [userId, openReportModal, toast, t],
  )

  // Execute the confirmed action
  const executeConfirmAction = async () => {
    const { type, id } = confirmAction

    try {
      if (type === 'accept') {
        const challenge = await handleAcceptChallenge(id)

        // If successful, emit socket event
        if (challenge) {
          emitChallengeAccepted({
            challengerId: challenge.challenger._id,
            challengeId: challenge._id,
            category: challenge.category,
          })
        }
      } else if (type === 'decline') {
        const challenge = await handleRejectChallenge(id)

        // If successful, emit socket event
        if (challenge) {
          emitChallengeRejected({
            challengerId: challenge.challenger._id,
            challengeId: challenge._id,
            category: challenge.category,
          })
        }
      }

      // No need to fetch challenges again as Redux will update the state
    } catch (error) {
      console.error(`Error ${type}ing challenge:`, error)

      // Show error toast
      toast({
        title: t(`Failed to ${type} challenge`),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      })
    } finally {
      closeConfirmDialog()
    }
  }

  // Handle loading more challenges
  const handleLoadMore = useCallback(async () => {
    if (nextPageLoading || !hasMore) return

    setNextPageLoading(true)
    try {
      await loadMoreActiveChallenges()
    } catch (error) {
      console.error('Error loading more challenges:', error)
      toast({
        title: t('Error'),
        description: t('Failed to load more challenges'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      })
    } finally {
      setNextPageLoading(false)
    }
  }, [nextPageLoading, hasMore, loadMoreActiveChallenges, toast, t])

  // Handle entering a team battle
  const handleEnterTeamBattle = useCallback(
    battleId => {
      goToBattle(battleId)
    },
    [goToBattle],
  )

  // Combine all handlers for child components
  const handlers = useMemo(
    () => ({
      onAccept: handleAccept,
      onDecline: handleDecline,
      onStart: handleStart,
      onViewReport: handleViewReport,
      onRevenge: handleRevenge,
    }),
    [handleAccept, handleDecline, handleStart, handleViewReport, handleRevenge],
  )

  // Improved loading state determination with more precise conditions
  const isLoading = useMemo(() => {
    if (mode === '1v1') {
      return (
        loading &&
        !initialDataLoadedRef.current['1v1'] &&
        !emptyStateShown['1v1']
      )
    } else {
      return (
        activeBattlesLoading &&
        !initialDataLoadedRef.current['4v4'] &&
        !emptyStateShown['4v4']
      )
    }
  }, [mode, loading, activeBattlesLoading, emptyStateShown])

  // Get error based on current mode
  const currentError = useMemo(() => {
    if (mode === '1v1') {
      return error
    } else {
      return activeBattlesError
    }
  }, [mode, error, activeBattlesError])

  // Manual refresh function that clears tracked states
  const handleManualRefresh = useCallback(() => {
    if (mode === '1v1') {
      // Reset states for 1v1 mode
      initialDataLoadedRef.current['1v1'] = false
      setEmptyStateShown(prev => ({ ...prev, '1v1': false }))
      loadActiveChallenges()
    } else {
      // Reset states for 4v4 mode
      initialDataLoadedRef.current['4v4'] = false
      setEmptyStateShown(prev => ({ ...prev, '4v4': false }))
      loadTeamBattles()
    }
  }, [mode, loadActiveChallenges, loadTeamBattles])

  // Render loading skeleton
  if (isLoading) {
    return <ActiveChallengesSkeleton mode={mode} />
  }

  // If there was an error and no challenges have been loaded yet
  if (
    currentError &&
    ((mode === '1v1' && !challenges.length) ||
      (mode === '4v4' && !activeBattles.length))
  ) {
    return (
      <Center
        py={12}
        className="active-challenges-error"
        data-testid="active-challenges-error"
      >
        <VStack
          spacing={5}
          bg="gray.800"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="red.500"
          maxW="400px"
        >
          <Icon as={FileText} boxSize={8} color="red.400" />
          <Text color="white" fontWeight="medium" textAlign="center">
            {currentError}
          </Text>
          <Button
            colorScheme="purple"
            onClick={handleManualRefresh}
            size={buttonSize}
            leftIcon={<RefreshCw size={16} />}
          >
            {t('Retry')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <Box
      className="active-challenges-container"
      data-testid="active-challenges"
    >
      <VStack align="stretch" spacing={spacing}>
        {/* Mode Selection Tabs with Hash Navigation */}
        <FilterTabs selectedFilter={mode} onFilterChange={handleModeChange} />

        {/* Challenge Lists based on selected mode */}
        {mode === '1v1' ? (
          /* 1v1 Challenges View */
          <Box
            className="challenges-1v1-view"
            data-testid="challenges-1v1-view"
          >
            {filteredChallenges.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <VStack spacing={spacing} align="stretch" px={1}>
                {/* Regular status sections (non-completed challenges) */}
                {statusGroups.map((group, idx) => (
                  <StatusSection
                    key={group.key}
                    title={group.label}
                    icon={group.icon}
                    challenges={groupedChallenges[group.key] || []}
                    userId={userId}
                    handlers={handlers}
                    animationDelay={idx * 0.1}
                    revengeLoading={revengeLoading}
                  />
                ))}

                {/* Enhanced completed challenges section with date grouping */}
                {completedChallenges.length > 0 && (
                  <Box className="completed-challenges-section">
                    <StatusSection
                      title={t('Completed')}
                      icon={Trophy}
                      challenges={completedChallenges}
                      userId={userId}
                      handlers={{
                        onViewReport: handleViewReport,
                        onRevenge: handleRevenge,
                      }}
                      animationDelay={statusGroups.length * 0.1}
                      revengeLoading={revengeLoading}
                    />
                  </Box>
                )}
              </VStack>
            )}

            {/* Load more section - visible only when needed */}
            {hasMore && filteredChallenges.length > 0 && (
              <Center mt={4} mb={6} ref={loadMoreRef}>
                {nextPageLoading ? (
                  <HStack spacing={3}>
                    <Spinner size="sm" color="purple.400" />
                    <Text color="whiteAlpha.700">
                      {t('Loading more challenges...')}
                    </Text>
                  </HStack>
                ) : (
                  <Button
                    onClick={handleLoadMore}
                    colorScheme="purple"
                    variant="outline"
                    size={buttonSize}
                    leftIcon={<ChevronDown size={16} />}
                    _hover={{ transform: 'translateY(2px)' }}
                    transition="all 0.2s"
                  >
                    {t('Load More Challenges')}
                  </Button>
                )}
              </Center>
            )}
          </Box>
        ) : (
          /* 4v4 Team Battles View */
          <Box className="team-battles-view" data-testid="team-battles-view">
            <Suspense fallback={<TeamBattlesSkeleton />}>
              {initialDataLoadedRef.current['4v4'] || emptyStateShown['4v4'] ? (
                <TeamBattleList
                  key={`team-battle-list-${emptyStateShown['4v4']}`}
                />
              ) : (
                <Box py={8} textAlign="center">
                  <Text color="whiteAlpha.700">
                    {t('Loading team battles...')}
                  </Text>
                </Box>
              )}
            </Suspense>
          </Box>
        )}
      </VStack>

      {/* Dialogs and Modals */}
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirmDialog}
        onConfirm={executeConfirmAction}
        title={
          confirmAction.type === 'accept'
            ? t('Accept Challenge?')
            : t('Decline Challenge?')
        }
        message={
          confirmAction.type === 'accept'
            ? t('You can start it immediately after accepting.')
            : t('This action cannot be undone.')
        }
        confirmText={
          confirmAction.type === 'accept' ? t('Accept') : t('Decline')
        }
      />

      {/* Revenge Confirmation Dialog */}
      {revengeData && (
        <Suspense fallback={null}>
          <RevengeConfirmationDialog
            isOpen={isRevengeConfirmOpen}
            onClose={closeRevengeConfirmDialog}
            onConfirm={executeRevenge}
            opponentName={
              revengeData.opponent?.inGameName || revengeData.opponent?.name
            }
            category={revengeData.category}
            isLoading={revengeLoading}
            loadingProgress={revengeProgress}
          />
        </Suspense>
      )}

      {/* Quiz Report Modal */}
      <Suspense fallback={null}>
        {isReportOpen && selectedSession && (
          <QuizReportModal
            isOpen={isReportOpen}
            onClose={closeReportModal}
            sessionId={selectedSession}
          />
        )}
      </Suspense>
    </Box>
  )
}

/**
 * Skeleton for ActiveChallenges component
 */
const ActiveChallengesSkeleton = ({ mode }) => {
  const spacing = useBreakpointValue({ base: 4, md: 6 })
  const padding = useBreakpointValue({ base: 2, md: 3 })

  return (
    <Box>
      <VStack align="stretch" spacing={spacing}>
        {/* Tabs skeleton */}
        <Skeleton height="40px" width="300px" mx="auto" borderRadius="full" />

        {/* Challenges skeleton */}
        <VStack spacing={spacing} align="stretch">
          {Array.from({ length: 3 }).map((_, i) => (
            <Box
              key={i}
              bg="rgba(26, 32, 44, 0.4)"
              borderRadius="lg"
              p={padding}
              borderWidth="1px"
              borderColor="whiteAlpha.100"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <HStack>
                  <Skeleton height="20px" width="20px" borderRadius="full" />
                  <Skeleton height="20px" width="120px" borderRadius="md" />
                </HStack>
                <Skeleton height="24px" width="24px" borderRadius="full" />
              </Flex>

              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                }}
                gap={3}
              >
                {Array.from({ length: mode === '1v1' ? 3 : 2 }).map((_, j) => (
                  <Skeleton key={j} height="180px" borderRadius="lg" />
                ))}
              </Grid>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}

/**
 * Skeleton for TeamBattles section
 */
const TeamBattlesSkeleton = () => {
  const spacing = useBreakpointValue({ base: 3, md: 4 })

  return (
    <VStack spacing={spacing} align="stretch">
      <Flex justify="space-between" align="center" mb={2}>
        <HStack>
          <Skeleton height="32px" width="100px" borderRadius="md" />
          <Skeleton height="32px" width="100px" borderRadius="md" />
        </HStack>
        <HStack>
          <Skeleton height="32px" width="80px" borderRadius="md" />
          <Skeleton height="32px" width="120px" borderRadius="md" />
        </HStack>
      </Flex>

      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} height="200px" borderRadius="lg" />
      ))}
    </VStack>
  )
}

export default memo(ActiveChallenges)
