// components/quickClashComponents/ActiveChallenges.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  useRef,
  memo,
} from 'react'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {
  Target,
  Zap,
  Clock,
  Trophy,
  X,
  FileText,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import ALL original components - EXACTLY as original
import FilterTabs from './FilterTabs'
import EmptyChallenges1v1State from './EmptyChallenges1v1State'
import StatusSection from './StatusSection'
import ConfirmationDialog from './ConfirmationDialog'

// React.lazy components - EXACTLY as original
const QuizReportModal = React.lazy(() => import('./QuizReportModal'))
const NewChallengeModal = React.lazy(() => import('./modals/NewChallengeModal'))
const TeamBattleList = React.lazy(() => import('./team/TeamBattleList'))
const RevengeConfirmationDialog = React.lazy(() =>
  import('./RevengeConfirmationDialog'),
)
import TeamBattlesSkeleton from './team/TeamBattlesSkeleton'

// Custom hooks - EXACTLY as original
import useQuickClash from '../../customHooks/useQuickClash'
import useQuickClashTeamBattle from '../../customHooks/useQuickClashTeamBattle'
import { useInView } from 'react-intersection-observer'

// Cached responsive configuration - EXACTLY as original
const RESPONSIVE_CONFIG = {
  spacing: { base: 4, md: 6 },
  buttonSize: { base: 'xs', md: 'sm' },
}

// Enhanced skeleton component with consistent colors
const ActiveChallengesSkeleton = memo(({ mode }) => (
  <div>
    <div className="flex flex-col space-y-4 md:space-y-6">
      {/* Filter tabs skeleton with consistent colors */}
      <div
        className={`w-80 h-12 ${QUICK_CLASH_CLASSES.glassMedium} rounded-full mx-auto animate-pulse`}
      />

      <div className="flex flex-col space-y-4 md:space-y-6">
        {Array.from({ length: 1 }).map((_, i) => (
          <div
            key={i}
            className={`${QUICK_CLASH_CLASSES.glassMedium} rounded-2xl p-2 md:p-3 shadow-xl`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-white/20 rounded-full animate-pulse" />
                <div className="w-32 h-5 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="w-6 h-6 bg-white/20 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: mode === '1v1' ? 2 : 1 }).map((_, j) => (
                <div
                  key={j}
                  className="h-40 bg-white/10 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
))

ActiveChallengesSkeleton.displayName = 'ActiveChallengesSkeleton'

/**
 * ActiveChallenges component - FAITHFUL CONVERSION with consistent color scheme
 * ALL ORIGINAL FUNCTIONALITY PRESERVED - ONLY VISUAL STYLING UPDATED
 */
const ActiveChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()

  // ALL ORIGINAL STATE AND LOGIC PRESERVED EXACTLY
  const [mode, setMode] = useState('1v1')
  const initialDataLoadedRef = useRef({ '1v1': false, '4v4': false })
  const [emptyStateShown, setEmptyStateShown] = useState({
    '1v1': false,
    '4v4': false,
  })

  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false)

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

  const { user } = useSelector(state => state.auth)
  const userId = useMemo(() => user?._id, [user])

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
  const [revengeProgress, setRevengeProgress] = useState(0)
  const progressTimerRef = useRef(null)

  // ALL ORIGINAL EFFECTS AND HANDLERS PRESERVED EXACTLY - NO CHANGES TO LOGIC

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

  // ALL ORIGINAL useEffect HOOKS - EXACTLY AS ORIGINAL
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
        loadTeamBattles()
      }
    }
  }, [userId, mode, loadActiveChallenges, loadTeamBattles, emptyStateShown])

  useEffect(() => {
    if (inView && mode === '1v1' && hasMore && !nextPageLoading && !loading) {
      handleLoadMore()
    }
  }, [inView, mode, hasMore, nextPageLoading, loading, handleLoadMore])

  // ALL ORIGINAL MEMOIZED COMPUTATIONS - EXACTLY AS ORIGINAL
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
      { key: 'awaiting', label: t('Awaiting Response'), icon: Clock },
      { key: 'rejected', label: t('Rejected'), icon: X },
      { key: 'other', label: t('Other'), icon: FileText },
    ],
    [t],
  )

  // ALL ORIGINAL EVENT HANDLERS PRESERVED EXACTLY - NO CHANGES
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

  const executeConfirmAction = useCallback(async () => {
    const { type, id } = confirmAction
    try {
      if (type === 'accept') {
        await handleAcceptChallenge(id)
      } else if (type === 'decline') {
        await handleRejectChallenge(id)
      }
    } catch (err) {
      // Error handling is done in the hooks
    } finally {
      closeConfirmDialog()
    }
  }, [
    confirmAction,
    handleAcceptChallenge,
    handleRejectChallenge,
    closeConfirmDialog,
  ])

  // Handlers objects - EXACTLY as original
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

  // Loading and error states - EXACTLY as original
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

  const hasNonCompletedChallenges = useMemo(() => {
    return statusGroups.some(
      group => (groupedNonCompleted1v1[group.key] || []).length > 0,
    )
  }, [statusGroups, groupedNonCompleted1v1])

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
      <div className="flex items-center justify-center py-12">
        <div
          className={`flex flex-col items-center space-y-5 ${QUICK_CLASH_CLASSES.glassStrong} border-red-500/50 p-6 rounded-2xl max-w-md shadow-xl`}
        >
          <FileText className="w-8 h-8 text-red-400" />
          <p
            className={`${QUICK_CLASH_CLASSES.textPrimary} font-medium text-center`}
          >
            {currentError}
          </p>
          <button
            className={`flex items-center space-x-2 px-4 py-2 ${QUICK_CLASH_CLASSES.btnPrimary} text-sm rounded-lg transition-all duration-200 hover:scale-105`}
            onClick={handleManualRefresh}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('Retry')}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="active-challenges-container"
      data-testid="active-challenges"
    >
      <div className="flex flex-col space-y-4 md:space-y-6">
        {/* FilterTabs with consistent spacing */}
        <div className="mb-2">
          <FilterTabs selectedFilter={mode} onFilterChange={handleModeChange} />
        </div>

        {mode === '1v1' ? (
          <div
            className="challenges-1v1-view"
            data-testid="challenges-1v1-view"
          >
            {/* ALL ORIGINAL LOGIC FOR EMPTY STATES AND CONTENT PRESERVED */}
            {emptyStateShown['1v1'] &&
            !loading &&
            !error &&
            filteredChallenges.length === 0 ? (
              <EmptyChallenges1v1State
                type="active"
                onCreateChallenge={() => setIsNewChallengeModalOpen(true)}
                variant="default"
              />
            ) : (
              <div className="flex flex-col space-y-4 md:space-y-6 px-1">
                {!loading &&
                  !error &&
                  !hasNonCompletedChallenges &&
                  completed1v1ForDisplay.length >= 0 &&
                  filteredChallenges.length > 0 && (
                    <div className="mb-4 md:mb-6">
                      <EmptyChallenges1v1State
                        type="active"
                        message={t(
                          'emptyStates.noActive1v1AboveCompleted',
                          'No active 1v1 challenges right now. Why not check out your completed games below or start a new one from the main screen?',
                        )}
                        variant="compact"
                      />
                    </div>
                  )}

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

                {completed1v1ForDisplay.length > 0 && (
                  <div className="completed-challenges-section">
                    <StatusSection
                      title={t('Completed')}
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
                  </div>
                )}

                {/* Load More Section with consistent styling */}
                {hasMore && filteredChallenges.length > 0 && (
                  <div
                    className="flex justify-center mt-4 mb-6"
                    ref={loadMoreRef}
                  >
                    {nextPageLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <span
                          className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm`}
                        >
                          {t('Loading more challenges...')}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={handleLoadMore}
                        className={`flex items-center space-x-2 px-6 py-3 ${QUICK_CLASH_CLASSES.glassMedium} hover:bg-slate-900/60 border-cyan-600/30 text-cyan-400 hover:text-cyan-300 rounded-2xl hover:-translate-y-1 transition-all duration-200 shadow-lg`}
                      >
                        <ChevronDown className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {t('Load More Challenges')}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="team-battles-view" data-testid="team-battles-view">
            <Suspense fallback={<TeamBattlesSkeleton />}>
              {initialDataLoadedRef.current['4v4'] ||
              emptyStateShown['4v4'] ||
              (!activeBattlesLoading && !activeBattlesError) ? (
                <TeamBattleList />
              ) : (
                <div className="py-8 text-center">
                  <p className={QUICK_CLASH_CLASSES.textSecondary}>
                    {t('Loading team battles...')}
                  </p>
                </div>
              )}
            </Suspense>
          </div>
        )}
      </div>

      {/* ALL ORIGINAL MODALS PRESERVED EXACTLY */}
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
            onClose={() => setIsNewChallengeModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  )
}

export default memo(ActiveChallenges)
