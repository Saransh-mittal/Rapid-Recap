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
  // Divider, // Kept from your original if needed elsewhere
  // Heading, // Kept from your original if needed elsewhere
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

// Import custom components
import FilterTabs from './FilterTabs'
import EmptyChallenges1v1State from './EmptyChallenges1v1State'
import StatusSection from './StatusSection'
import ConfirmationDialog from './ConfirmationDialog'

// Use React.lazy for components
const QuizReportModal = React.lazy(() => import('./QuizReportModal'))
const NewChallengeModal = React.lazy(() => import('./modals/NewChallengeModal'))
const TeamBattleList = React.lazy(() => import('./team/TeamBattleList'))
const RevengeConfirmationDialog = React.lazy(() =>
  import('./RevengeConfirmationDialog'),
)

// Custom hooks
import useQuickClash from '../../customHooks/useQuickClash'
import useQuickClashSocket from '../../customHooks/useQuickClashSocket'
import useQuickClashTeamBattle from '../../customHooks/useQuickClashTeamBattle'
import { useInView } from 'react-intersection-observer'

// Date formatting - Not strictly needed if using StatusSection for completed as per your preference
// import { format, isToday, isYesterday, isSameWeek, parseISO } from 'date-fns'

const ActiveChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()

  const spacing = useBreakpointValue({ base: 4, md: 6 })
  const buttonSize = useBreakpointValue({ base: 'xs', md: 'sm' })

  const [mode, setMode] = useState('1v1')
  const initialDataLoadedRef = useRef({ '1v1': false, '4v4': false })
  const [emptyStateShown, setEmptyStateShown] = useState({
    '1v1': false,
    '4v4': false,
  })

  const {
    isOpen: isNewChallengeModalOpen,
    onOpen: onNewChallengeModalOpen,
    onClose: onNewChallengeModalClose,
  } = useDisclosure()

  const {
    activeChallenges: challenges,
    activeChallengesLoading: loading,
    activeChallengesError: error,
    activeChallengesHasMore: hasMore,
    loadActiveChallenges,
    loadMoreActiveChallenges,
    handleAcceptChallenge,
    handleRejectChallenge,
    createChallenge,
    resetActiveChallengesState,
  } = useQuickClash()

  const { emitChallengeAccepted, emitChallengeRejected } = useQuickClashSocket()
  const { user } = useSelector(state => state.auth)
  const userId = user?._id
  const [selectedSession, setSelectedSession] = useState(null)
  const [nextPageLoading, setNextPageLoading] = useState(false)
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })
  const { activeBattlesLoading, activeBattlesError, loadTeamBattles } =
    useQuickClashTeamBattle()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isRevengeConfirmOpen, setIsRevengeConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState({ type: '', id: '' })
  const [revengeData, setRevengeData] = useState(null)
  const [revengeLoading, setRevengeLoading] = useState(false)
  const [revengeProgress, setRevengeProgress] = useState(0) // Kept for executeRevenge
  const progressTimerRef = useRef(null) // Kept for executeRevenge

  const handleLoadMore = useCallback(async () => {
    if (nextPageLoading || !hasMore) return
    setNextPageLoading(true)
    try {
      await loadMoreActiveChallenges()
    } catch (err) {
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

  useEffect(() => {
    const initializeModeFromHash = () => {
      const hash = window.location.hash.substring(1)
      if (hash.startsWith('active/')) {
        const subRoute = hash.split('/')[1]
        if (subRoute === '1v1' || subRoute === '4v4') setMode(subRoute)
        else {
          setMode('1v1')
          window.history.replaceState(null, '', '#active/1v1')
        }
      } else if (hash === 'active' || !hash) {
        setMode('1v1')
        window.history.replaceState(null, '', '#active/1v1')
      }
    }
    initializeModeFromHash()
  }, [])

  useEffect(() => {
    if (!loading && challenges.length > 0) {
      initialDataLoadedRef.current['1v1'] = true
      setEmptyStateShown(prev => ({ ...prev, '1v1': false }))
    } else if (
      !loading &&
      !initialDataLoadedRef.current['1v1'] &&
      challenges.length === 0 &&
      !error
    ) {
      setEmptyStateShown(prev => ({ ...prev, '1v1': true }))
    }
  }, [loading, challenges, error])

  useEffect(() => {
    if (!activeBattlesLoading && !activeBattlesError) {
      initialDataLoadedRef.current['4v4'] = true
    } else if (
      !activeBattlesLoading &&
      activeBattlesError &&
      !initialDataLoadedRef.current['4v4']
    ) {
      setEmptyStateShown(prev => ({ ...prev, '4v4': true }))
    }
  }, [activeBattlesLoading, activeBattlesError])

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
        !emptyStateShown['4v4'] &&
        loadTeamBattles
      ) {
        // Only call if function exists, TeamBattleList might call it too
        loadTeamBattles()
      }
    }
  }, [userId, mode, loadActiveChallenges, loadTeamBattles, emptyStateShown])

  useEffect(() => {
    if (inView && mode === '1v1' && hasMore && !nextPageLoading && !loading) {
      handleLoadMore()
    }
  }, [inView, mode, hasMore, nextPageLoading, loading, handleLoadMore])

  const filteredChallenges = useMemo(() => {
    if (!challenges || !userId || mode !== '1v1') return []
    let filtered = [...challenges]
    filtered.sort((a, b) => {
      const statusOrder = {
        active: 0,
        pending: 1,
        completed: 2,
        expired: 3,
        rejected: 4,
      }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return filtered
  }, [challenges, userId, mode])

  const handleModeChange = useCallback(newMode => setMode(newMode), [])

  const completed1v1ForDisplay = useMemo(() => {
    if (mode !== '1v1') return []
    return filteredChallenges.filter(
      c =>
        c.status === 'completed' &&
        c.challengerAttempted &&
        c.opponentAttempted,
    )
  }, [filteredChallenges, mode])

  const groupedNonCompleted1v1 = useMemo(() => {
    if (mode !== '1v1') return {}
    const nonCompleted = filteredChallenges.filter(
      c =>
        !(
          c.status === 'completed' &&
          c.challengerAttempted &&
          c.opponentAttempted
        ),
    )
    return nonCompleted.reduce((groups, challenge) => {
      const isChallenger = challenge?.challenger?._id === userId
      let statusGroup
      if (challenge.status === 'active') statusGroup = 'active'
      else if (challenge.status === 'pending')
        statusGroup = isChallenger ? 'awaiting' : 'new'
      else if (challenge.status === 'rejected') statusGroup = 'rejected'
      else if (challenge.status !== 'completed') statusGroup = 'other'
      if (statusGroup) {
        if (!groups[statusGroup]) groups[statusGroup] = []
        groups[statusGroup].push(challenge)
      }
      return groups
    }, {})
  }, [filteredChallenges, userId, mode])

  const statusGroups = useMemo(
    () => [
      { key: 'new', label: t('New Challenges'), icon: Target },
      { key: 'active', label: t('Ready to Play'), icon: Zap },
      { key: 'awaiting', label: t('Awaiting Response'), icon: HourglassIcon },
      { key: 'rejected', label: t('Rejected'), icon: X },
      { key: 'other', label: t('Other'), icon: FileText },
    ],
    [t],
  )

  const openConfirmDialog = useCallback((type, id) => {
    setConfirmAction({ type, id })
    setIsConfirmOpen(true)
  }, [])
  const closeConfirmDialog = useCallback(() => setIsConfirmOpen(false), [])
  const openReportModal = useCallback(() => setIsReportOpen(true), [])
  const closeReportModal = useCallback(() => {
    setIsReportOpen(false)
    setSelectedSession(null)
  }, [])
  const startProgressTimer = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    setRevengeProgress(5)
    progressTimerRef.current = setInterval(() => {
      setRevengeProgress(prev =>
        Math.min(
          prev + (prev < 30 ? 5 : prev < 60 ? 3 : prev < 85 ? 1 : 0.5),
          90,
        ),
      )
    })
  }, [])
  const handleRevenge = useCallback((opponent, originalChallenge) => {
    setRevengeData({
      opponent,
      originalChallengeId: originalChallenge._id,
      category: originalChallenge.category,
    })
    setIsRevengeConfirmOpen(true)
  }, [])
  const closeRevengeConfirmDialog = useCallback(() => {
    setIsRevengeConfirmOpen(false)
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
    setRevengeProgress(0)
  }, [])
  const executeRevenge = useCallback(async () => {
    if (!revengeData) return
    setRevengeLoading(true)
    startProgressTimer()
    try {
      const categoriesForNewChallenge = Array.isArray(revengeData.category)
        ? revengeData.category.filter(
            c => typeof c === 'string' && c.trim() !== '',
          )
        : revengeData.category && typeof revengeData.category === 'string'
        ? [revengeData.category]
        : []
      await createChallenge(revengeData.opponent._id, categoriesForNewChallenge)
      setRevengeProgress(100)
      await axios.post(
        `/api/quickClash/challenge/${revengeData.originalChallengeId}/markRevenge`,
      )
      await new Promise(r => setTimeout(r, 500))
      toast({ title: t('Revenge Challenge Sent!'), status: 'success' })
      loadActiveChallenges()
      closeRevengeConfirmDialog()
      setRevengeData(null)
    } catch (err) {
      toast({ title: t('Failed to Send Revenge'), status: 'error' })
      closeRevengeConfirmDialog()
      setRevengeData(null)
    } finally {
      setRevengeLoading(false)
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
  const handleAccept = useCallback(
    challengeId => openConfirmDialog('accept', challengeId),
    [openConfirmDialog],
  )
  const handleDecline = useCallback(
    challengeId => openConfirmDialog('decline', challengeId),
    [openConfirmDialog],
  )
  const handleStart = useCallback(
    challengeId => navigate(`/quickclash/session/${challengeId}`),
    [navigate],
  )
  const handleViewReport = useCallback(
    challenge => {
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
            })
          }
        } catch (err) {
          toast({
            title: t('Error'),
            description: t('Failed to load quiz session'),
            status: 'error',
          })
        }
      }
      fetchSession()
    },
    [userId, openReportModal, toast, t],
  )
  const executeConfirmAction = async () => {
    const { type, id } = confirmAction
    try {
      if (type === 'accept') {
        const ch = await handleAcceptChallenge(id)
        if (ch)
          emitChallengeAccepted({
            challengerId: ch.challenger._id,
            challengeId: ch._id,
            category: ch.category,
          })
      } else if (type === 'decline') {
        const ch = await handleRejectChallenge(id)
        if (ch)
          emitChallengeRejected({
            challengerId: ch.challenger._id,
            challengeId: ch._id,
            category: ch.category,
          })
      }
    } catch (err) {
      /* ... */
    } finally {
      closeConfirmDialog()
    }
  }

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
  const completedSectionHandlers = useMemo(
    () => ({ onViewReport: handleViewReport, onRevenge: handleRevenge }),
    [handleViewReport, handleRevenge],
  )

  const isOverallLoading = useMemo(() => {
    if (mode === '1v1') return loading && !initialDataLoadedRef.current['1v1']
    return activeBattlesLoading && !initialDataLoadedRef.current['4v4']
  }, [mode, loading, activeBattlesLoading])
  const currentError = useMemo(() => {
    if (mode === '1v1') return error
    return activeBattlesError
  }, [mode, error, activeBattlesError])
  const handleManualRefresh = useCallback(() => {
    if (mode === '1v1') {
      initialDataLoadedRef.current['1v1'] = false
      setEmptyStateShown(prev => ({ ...prev, '1v1': false }))
      if (resetActiveChallengesState) resetActiveChallengesState()
      loadActiveChallenges()
    } else {
      initialDataLoadedRef.current['4v4'] = false
      setEmptyStateShown(prev => ({ ...prev, '4v4': false }))
      if (loadTeamBattles) loadTeamBattles()
    }
  }, [mode, loadActiveChallenges, loadTeamBattles, resetActiveChallengesState])

  if (isOverallLoading) return <ActiveChallengesSkeleton mode={mode} />

  if (
    currentError &&
    !isOverallLoading &&
    ((mode === '1v1' &&
      !initialDataLoadedRef.current['1v1'] &&
      challenges.length === 0) ||
      (mode === '4v4' && !initialDataLoadedRef.current['4v4']))
  ) {
    return (
      <Center py={12}>
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

  const hasNonCompletedChallenges = statusGroups.some(
    group => (groupedNonCompleted1v1[group.key] || []).length > 0,
  )

  return (
    <Box
      className="active-challenges-container"
      data-testid="active-challenges"
    >
      <VStack align="stretch" spacing={spacing}>
        <FilterTabs selectedFilter={mode} onFilterChange={handleModeChange} />

        {mode === '1v1' ? (
          <Box
            className="challenges-1v1-view"
            data-testid="challenges-1v1-view"
          >
            {/* Case 1: Overall Empty State for 1v1 tab (NO challenges of ANY kind) */}
            {emptyStateShown['1v1'] &&
            !loading &&
            !error &&
            filteredChallenges.length === 0 ? (
              <EmptyChallenges1v1State
                type="active"
                onCreateChallenge={onNewChallengeModalOpen} // Button is shown
                variant="default"
              />
            ) : (
              <VStack spacing={spacing} align="stretch" px={1}>
                {/* Case 2: No ACTIVE/PENDING etc. challenges, but potentially COMPLETED ones exist. Show COMPACT empty state. */}
                {!loading &&
                  !error &&
                  !hasNonCompletedChallenges &&
                  completed1v1ForDisplay.length >= 0 &&
                  filteredChallenges.length > 0 && (
                    <Box mb={spacing}>
                      {' '}
                      {/* Add some margin if it's above completed */}
                      <EmptyChallenges1v1State
                        type="active"
                        // No onCreateChallenge prop here, so button won't render in compact variant
                        message={t(
                          'emptyStates.noActive1v1AboveCompleted',
                          'No active 1v1 challenges right now. Why not check out your completed games below or start a new one from the main screen?',
                        )}
                        variant="compact" // Use the compact variant (smaller, no button)
                      />
                    </Box>
                  )}

                {/* Render StatusSections for non-completed challenges ONLY IF they exist */}
                {hasNonCompletedChallenges &&
                  statusGroups.map((group, idx) => {
                    const challengesInGroup =
                      groupedNonCompleted1v1[group.key] || []
                    if (challengesInGroup.length === 0) return null
                    return (
                      <StatusSection
                        key={group.key}
                        title={group.label}
                        icon={group.icon}
                        challenges={challengesInGroup}
                        userId={userId}
                        handlers={handlers}
                        animationDelay={idx * 0.1}
                        revengeLoading={revengeLoading}
                      />
                    )
                  })}

                {/* "Completed" section using StatusSection (as per your preference) */}
                {completed1v1ForDisplay.length > 0 && (
                  <Box className="completed-challenges-section">
                    <StatusSection // This will render the "Completed (X)" if your StatusSection supports count
                      title={t('Completed')} // Or "Completed" + count if StatusSection is modified
                      icon={Trophy}
                      challenges={completed1v1ForDisplay}
                      userId={userId}
                      handlers={completedSectionHandlers}
                      animationDelay={
                        hasNonCompletedChallenges
                          ? statusGroups.length * 0.1
                          : 0.1
                      }
                      revengeLoading={revengeLoading}
                    />
                  </Box>
                )}

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
              </VStack>
            )}
          </Box>
        ) : (
          <Box className="team-battles-view" data-testid="team-battles-view">
            <Suspense fallback={<TeamBattlesSkeleton />}>
              {initialDataLoadedRef.current['4v4'] ||
              emptyStateShown['4v4'] ||
              (!activeBattlesLoading && !activeBattlesError) ? (
                <TeamBattleList />
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
      <Suspense fallback={null}>
        {isReportOpen && selectedSession && (
          <QuizReportModal
            isOpen={isReportOpen}
            onClose={closeReportModal}
            sessionId={selectedSession}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {isNewChallengeModalOpen && (
          <NewChallengeModal
            isOpen={isNewChallengeModalOpen}
            onClose={onNewChallengeModalClose}
          />
        )}
      </Suspense>
    </Box>
  )
}

const ActiveChallengesSkeleton = ({ mode }) => {
  const skelSpacing = useBreakpointValue({ base: 4, md: 6 })
  const skelPadding = useBreakpointValue({ base: 2, md: 3 })
  return (
    <Box>
      <VStack align="stretch" spacing={skelSpacing}>
        <Skeleton height="40px" width="300px" mx="auto" borderRadius="full" />
        <VStack spacing={skelSpacing} align="stretch">
          {Array.from({ length: 1 }).map((_, i) => (
            <Box
              key={i}
              bg="rgba(26, 32, 44, 0.4)"
              borderRadius="lg"
              p={skelPadding}
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
                {Array.from({ length: mode === '1v1' ? 2 : 1 }).map((_, j) => (
                  <Skeleton key={j} height="160px" borderRadius="lg" />
                ))}
              </Grid>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}
const TeamBattlesSkeleton = () => {
  const skelSpacing = useBreakpointValue({ base: 3, md: 4 })
  return (
    <VStack spacing={skelSpacing} align="stretch">
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
      {Array.from({ length: 1 }).map((_, i) => (
        <Skeleton key={i} height="180px" borderRadius="lg" />
      ))}
    </VStack>
  )
}

export default memo(ActiveChallenges)
