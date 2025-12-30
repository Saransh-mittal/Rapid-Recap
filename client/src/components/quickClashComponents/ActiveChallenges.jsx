// components/quickClashComponents/ActiveChallenges.jsx - UPDATED: 4v4 Only (1v1 Deprecated)
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  useRef,
  memo,
} from 'react'
import { notificationManager } from '../../utils/notifications'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { FileText, RefreshCw } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import only 4v4 related components
import ConfirmationDialog from './ConfirmationDialog'

// React.lazy components
const QuizReportModal = React.lazy(() => import('./QuizReportModal'))
const NewChallengeModal = React.lazy(() => import('./modals/NewChallengeModal'))
const TeamBattleList = React.lazy(() => import('./team/TeamBattleList'))
const RevengeConfirmationDialog = React.lazy(() =>
  import('./RevengeConfirmationDialog'),
)
import TeamBattlesSkeleton from './team/TeamBattlesSkeleton'

// Custom hooks - only 4v4 related
import useQuickClashTeamBattle from '../../customHooks/useQuickClashTeamBattle'
import { useInView } from 'react-intersection-observer'

// Cached responsive configuration
const RESPONSIVE_CONFIG = {
  spacing: { base: 4, md: 6 },
  buttonSize: { base: 'xs', md: 'sm' },
}

// Loading skeleton for 4v4 team battles only
const ActiveChallengesSkeleton = memo(() => (
  <div>
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
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
              {Array.from({ length: 1 }).map((_, j) => (
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
 * ActiveChallenges component - 4v4 Team Battles Only
 * 1v1 Solo Matchmaking has been deprecated
 */
const ActiveChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()

  // State management for 4v4 only
  const initialDataLoadedRef = useRef({ '4v4': false })
  const [emptyStateShown, setEmptyStateShown] = useState({ '4v4': false })

  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false)
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  const { user } = useSelector(state => state.auth)
  const userId = useMemo(() => user?._id, [user])

  const [selectedSession, setSelectedSession] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isRevengeConfirmOpen, setIsRevengeConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState({ type: '', id: '' })
  const [revengeData, setRevengeData] = useState(null)
  const [revengeLoading, setRevengeLoading] = useState(false)
  const [revengeProgress, setRevengeProgress] = useState(0)
  const progressTimerRef = useRef(null)

  // 4v4 Team Battle hooks
  const {
    activeBattles,
    activeBattlesLoading,
    activeBattlesError,
    activeBattlesHasMore,
    loadTeamBattles,
    loadMoreTeamBattles,
  } = useQuickClashTeamBattle()

  const [nextPageLoading, setNextPageLoading] = useState(false)

  // Initialize 4v4 on component mount - always show 4v4
  useEffect(() => {
    // Ensure URL always points to 4v4
    const hash = window.location.hash.substring(1)
    if (!hash.startsWith('active/4v4')) {
      window.history.replaceState(null, '', '#active/4v4')
    }
  }, [])

  // Load team battles on mount
  useEffect(() => {
    if (userId && !initialDataLoadedRef.current['4v4']) {
      loadTeamBattles()
      initialDataLoadedRef.current['4v4'] = true
    }
  }, [userId, loadTeamBattles])

  // Handle loading state for 4v4
  useEffect(() => {
    if (!activeBattlesLoading && !activeBattlesError) {
      setEmptyStateShown(prev => ({ ...prev, '4v4': true }))
    }
  }, [activeBattlesLoading, activeBattlesError])

  // Load more functionality
  useEffect(() => {
    if (
      inView &&
      activeBattlesHasMore &&
      !nextPageLoading &&
      !activeBattlesLoading
    ) {
      handleLoadMore()
    }
  }, [inView])

  const handleLoadMore = useCallback(async () => {
    if (nextPageLoading || !activeBattlesHasMore) return
    setNextPageLoading(true)
    try {
      await loadMoreTeamBattles()
    } catch (err) {
      notificationManager.error(t('Error'), t('Failed to load more battles'))
    } finally {
      setNextPageLoading(false)
    }
  }, [nextPageLoading, activeBattlesHasMore, loadMoreTeamBattles, t])

  // Confirmation dialog handlers
  const closeConfirmDialog = useCallback(() => {
    setIsConfirmOpen(false)
    setConfirmAction({ type: '', id: '' })
  }, [])

  const closeReportModal = useCallback(() => {
    setIsReportOpen(false)
    setSelectedSession(null)
  }, [])

  const closeRevengeConfirmDialog = useCallback(() => {
    setIsRevengeConfirmOpen(false)
    setRevengeData(null)
    setRevengeProgress(0)
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }
  }, [])

  const handleManualRefresh = useCallback(() => {
    setEmptyStateShown(prev => ({ ...prev, '4v4': false }))
    initialDataLoadedRef.current['4v4'] = false
    loadTeamBattles()
  }, [loadTeamBattles])

  // Determine loading and error states
  const isLoading = useMemo(() => {
    return activeBattlesLoading && !initialDataLoadedRef.current['4v4']
  }, [activeBattlesLoading])

  const currentError = useMemo(() => {
    if (activeBattlesError) {
      if (typeof activeBattlesError === 'string') {
        return activeBattlesError
      }
      if (activeBattlesError.message) {
        return activeBattlesError.message
      }
      return t('Failed to load team battles')
    }
    return null
  }, [activeBattlesError, t])

  // Render loading skeleton
  if (isLoading) {
    return <ActiveChallengesSkeleton />
  }

  // Render error state
  if (currentError && !isLoading && !initialDataLoadedRef.current['4v4']) {
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
        {/* 4v4 Team Battles View - Only */}
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

          {/* Load More Section */}
          {activeBattlesHasMore &&
            activeBattles &&
            activeBattles.length > 0 && (
              <div className="flex justify-center mt-6 mb-8" ref={loadMoreRef}>
                {nextPageLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span
                      className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm`}
                    >
                      {t('Loading more battles...')}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleLoadMore}
                    className={`flex items-center space-x-2 px-6 py-3 ${QUICK_CLASH_CLASSES.glassMedium} hover:bg-slate-900/60 border-cyan-600/30 text-cyan-400 hover:text-cyan-300 rounded-2xl hover:-translate-y-1 transition-all duration-200 shadow-lg`}
                  >
                    <span className="text-sm font-medium">
                      {t('Load More Battles')}
                    </span>
                  </button>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Confirmation and Report Dialogs - Preserved for 4v4 functionality */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirmDialog}
        title={t('Confirm Action')}
        message={t('Are you sure you want to proceed?')}
        confirmText={t('Confirm')}
      />

      {revengeData && (
        <Suspense fallback={null}>
          <RevengeConfirmationDialog
            isOpen={isRevengeConfirmOpen}
            onClose={closeRevengeConfirmDialog}
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
