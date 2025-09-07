// components/quickClashComponents/team/TeamBattleList.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { format, isToday, isYesterday, isSameWeek, parseISO } from 'date-fns'
import {
  RefreshCw,
  Trophy,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Swords,
  Shield,
  Loader2,
} from 'lucide-react'
import { useInView } from 'react-intersection-observer'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import custom components
import TeamBattleItem from './TeamBattleItem'
import DateGroupHeader from '../DateGroupHeader'
import EmptyBattlesState from './EmptyBattlesState'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'
import { useNavigate } from 'react-router-dom'

// You'll need to install these components:
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add badge
// npx shadcn-ui@latest add collapsible
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Import battle analysis modal (lazy loaded)
const ChallengeAnalysisModal = React.lazy(() =>
  import('../ChallengeAnalysisModal'),
)

const MotionDiv = motion.div

/**
 * Enhanced Battle Section Component - Accordion style section for battles
 * Converted to Tailwind CSS with blue-cyan theme
 */
const BattleSection = memo(
  ({
    title,
    icon: IconComponent,
    battles,
    loading,
    error,
    hasMore,
    onLoadMore,
    onRefresh,
    onEnterBattle,
    onViewAnalysis,
    isRefreshing,
    sectionType,
  }) => {
    const { t } = useTranslation('QuickClash')
    const [isOpen, setIsOpen] = useState(true)

    // Responsive configuration
    const responsiveConfig = useMemo(() => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        return {
          columns: width < 768 ? 1 : 2,
          spacing: width < 768 ? 'gap-3' : 'gap-4',
          iconSize: width < 768 ? 'w-4 h-4' : 'w-5 h-5',
          headingSize: width < 768 ? 'text-sm' : 'text-base',
          padding: width < 768 ? 'p-2' : 'p-4',
        }
      }
      return {
        columns: 2,
        spacing: 'gap-4',
        iconSize: 'w-5 h-5',
        headingSize: 'text-base',
        padding: 'p-4',
      }
    }, [])

    // Group battles by date - EXACTLY as original
    const groupedBattles = useMemo(() => {
      if (!battles.length) return {}

      const grouped = battles.reduce((acc, battle) => {
        const battleDate = parseISO(battle.createdAt)
        let dateKey

        if (isToday(battleDate)) {
          dateKey = t('Today')
        } else if (isYesterday(battleDate)) {
          dateKey = t('Yesterday')
        } else if (isSameWeek(battleDate, new Date())) {
          dateKey = format(battleDate, 'EEEE')
        } else {
          dateKey = format(battleDate, 'MMMM d, yyyy')
        }

        if (!acc[dateKey]) {
          acc[dateKey] = []
        }

        acc[dateKey].push(battle)
        return acc
      }, {})

      return grouped
    }, [battles, t])

    // Sort date keys - EXACTLY as original
    const sortedDateKeys = useMemo(() => {
      const keys = Object.keys(groupedBattles)
      return keys.sort((a, b) => {
        if (a === t('Today')) return -1
        if (b === t('Today')) return 1
        if (a === t('Yesterday')) return -1
        if (b === t('Yesterday')) return 1
        return new Date(b) - new Date(a)
      })
    }, [groupedBattles, t])

    // Ref for infinite scrolling - EXACTLY as original
    const { ref: bottomRef, inView } = useInView({
      threshold: 0.1,
      triggerOnce: false,
    })

    // Handle infinite scroll - EXACTLY as original
    useEffect(() => {
      if (inView && hasMore && !loading && !isRefreshing) {
        onLoadMore()
      }
    }, [inView, hasMore, loading, isRefreshing, onLoadMore])

    // Enhanced styling based on section type
    const sectionColors = {
      active: {
        accent: 'text-green-400',
        badge: 'bg-green-500/20 text-green-300 border-green-500/30',
        header: 'bg-green-500/10',
        hover: 'hover:bg-green-500/20',
      },
      completed: {
        accent: 'text-cyan-400',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        header: 'bg-cyan-500/10',
        hover: 'hover:bg-cyan-500/20',
      },
    }

    const colors = sectionColors[sectionType] || sectionColors.completed

    return (
      <MotionDiv
        className={`
          ${QUICK_CLASH_CLASSES.glassMedium}
          rounded-2xl border border-white/20 overflow-hidden
          ${QUICK_CLASH_CLASSES.shadowSoft}
          hover:border-white/30 hover:shadow-xl
          transition-all duration-300
          backdrop-brightness-110
        `}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {/* Section Header */}
          <CollapsibleTrigger asChild>
            <div
              className={`
                flex justify-between items-center cursor-pointer
                ${responsiveConfig.padding} ${colors.header}
                border-b border-white/10 ${colors.hover}
                transition-all duration-200
              `}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  className={`${responsiveConfig.iconSize} ${colors.accent}`}
                />
                <h3
                  className={`${responsiveConfig.headingSize} font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
                >
                  {title}
                </h3>
                <Badge
                  className={`
                    ${colors.badge}
                    rounded-full px-2 py-1 text-xs font-medium
                  `}
                >
                  {battles.length}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={e => {
                    e.stopPropagation()
                    onRefresh()
                  }}
                  disabled={isRefreshing}
                  className={`
                    w-8 h-8 p-0
                    ${QUICK_CLASH_CLASSES.glassMedium}
                    hover:bg-white/10
                    border border-white/10 hover:border-white/20
                    ${QUICK_CLASH_CLASSES.focusRing}
                    ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}
                    transition-all duration-300
                  `}
                  aria-label={t('Refresh')}
                >
                  <RefreshCw className="w-4 h-4 text-white/70" />
                </Button>

                <div className="w-8 h-8 flex items-center justify-center">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-white/70" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/70" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          {/* Section Content */}
          <CollapsibleContent>
            <div className={responsiveConfig.padding}>
              {loading && battles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2
                    className={`
                      w-8 h-8 animate-spin
                      ${colors.accent}
                    `}
                  />
                  <p className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
                    {t('Loading battles...')}
                  </p>
                </div>
              ) : error && battles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Shield className="w-8 h-8 text-red-400" />
                  <p className="text-red-400 text-sm text-center">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onRefresh}
                    className={`
                      ${QUICK_CLASH_CLASSES.glassMedium}
                      border-red-400/40 text-red-300
                      hover:bg-red-500/10 hover:border-red-400/60
                      ${QUICK_CLASH_CLASSES.focusRing}
                    `}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('Try Again')}
                  </Button>
                </div>
              ) : battles.length === 0 ? (
                <EmptyBattlesState
                  type={sectionType}
                  onCreateMatch={() => {
                    window.location.hash = 'teams'
                  }}
                />
              ) : (
                <div
                  className={`flex flex-col ${responsiveConfig.spacing} items-stretch`}
                >
                  {sortedDateKeys.map((dateKey, dateIndex) => (
                    <div key={dateKey}>
                      <DateGroupHeader date={dateKey} index={dateIndex} />

                      <div
                        className={`
                          grid mt-2
                          ${
                            responsiveConfig.columns === 1
                              ? 'grid-cols-1'
                              : 'grid-cols-1 md:grid-cols-2'
                          }
                          ${responsiveConfig.spacing}
                        `}
                      >
                        {groupedBattles[dateKey].map((battle, index) => (
                          <TeamBattleItem
                            key={battle._id}
                            battle={battle}
                            index={index}
                            onEnter={onEnterBattle}
                            onViewAnalysis={onViewAnalysis}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Load more indicator */}
                  {hasMore && (
                    <div ref={bottomRef} className="flex justify-center py-4">
                      <MotionDiv
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      >
                        <Loader2
                          className={`
                            w-6 h-6 animate-spin
                            ${colors.accent}
                          `}
                        />
                      </MotionDiv>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </MotionDiv>
    )
  },
)

BattleSection.displayName = 'BattleSection'

/**
 * Enhanced TeamBattleList with Accordion Sections - Converted to Tailwind CSS
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced glassmorphic effects with consistent styling
 * - Maintained all original functionality and performance optimizations
 * - Improved responsive design with Tailwind's utility classes
 * - Enhanced accessibility with better focus states and ARIA labels
 */
const TeamBattleList = memo(() => {
  const { t } = useTranslation('QuickClash')
  const { getSocket } = useSocket()
  const navigate = useNavigate()

  // Responsive sizing
  const responsiveConfig = useMemo(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      return {
        headerSize: width < 768 ? 'text-lg' : 'text-xl',
        containerPadding: width < 768 ? 'px-1' : 'px-4',
        sectionSpacing: width < 768 ? 'space-y-4' : 'space-y-6',
      }
    }
    return {
      headerSize: 'text-xl',
      containerPadding: 'px-4',
      sectionSpacing: 'space-y-6',
    }
  }, [])

  // State - EXACTLY as original
  const [selectedBattleId, setSelectedBattleId] = useState(null)
  const [refreshingActive, setRefreshingActive] = useState(false)
  const [refreshingCompleted, setRefreshingCompleted] = useState(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)

  // Get team battle data from hook - EXACTLY as original
  const {
    activeBattles,
    activeBattlesLoading,
    activeBattlesError,
    activeBattlesHasMore,

    completedBattles,
    completedBattlesLoading,
    completedBattlesError,
    completedBattlesHasMore,

    loadTeamBattles,
    loadMoreTeamBattles,
    goToBattle,
  } = useQuickClashTeamBattle()

  // ALL ORIGINAL useEffect HOOKS PRESERVED EXACTLY

  // Join teams socket room when component mounts
  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.emit('quickClash:viewTeamBattles')
      console.log('Joined quickClash:teams room from TeamBattleList')
    }

    return () => {
      if (socket) {
        socket.off('quickClash:teamBattleUpdated')
      }
    }
  }, [getSocket])

  // Fetch both active and completed battles on mount
  useEffect(() => {
    loadTeamBattles('active')
    loadTeamBattles('completed')
  }, [loadTeamBattles])

  // ALL ORIGINAL EVENT HANDLERS PRESERVED EXACTLY

  // Handle refreshing active battles
  const handleRefreshActive = useCallback(async () => {
    setRefreshingActive(true)
    try {
      await loadTeamBattles('active')
      // Note: toast functionality would need to be implemented with a toast library
      // You might want to use react-hot-toast or sonner
      console.log(t('Active battles have been refreshed'))
    } finally {
      setRefreshingActive(false)
    }
  }, [loadTeamBattles, t])

  // Handle refreshing completed battles
  const handleRefreshCompleted = useCallback(async () => {
    setRefreshingCompleted(true)
    try {
      await loadTeamBattles('completed')
      console.log(t('Completed battles have been refreshed'))
    } finally {
      setRefreshingCompleted(false)
    }
  }, [loadTeamBattles, t])

  // Handle loading more battles
  const handleLoadMoreActive = useCallback(() => {
    if (!activeBattlesLoading && activeBattlesHasMore && !refreshingActive) {
      loadMoreTeamBattles('active')
    }
  }, [
    activeBattlesLoading,
    activeBattlesHasMore,
    refreshingActive,
    loadMoreTeamBattles,
  ])

  const handleLoadMoreCompleted = useCallback(() => {
    if (
      !completedBattlesLoading &&
      completedBattlesHasMore &&
      !refreshingCompleted
    ) {
      loadMoreTeamBattles('completed')
    }
  }, [
    completedBattlesLoading,
    completedBattlesHasMore,
    refreshingCompleted,
    loadMoreTeamBattles,
  ])

  // Handle entering a team battle
  const handleEnterTeamBattle = useCallback(
    battleId => {
      goToBattle(battleId)
    },
    [goToBattle],
  )

  // Handle viewing battle analysis
  const handleViewBattleAnalysis = useCallback(
    battleId => {
      navigate(`/quickclash/analysis/${battleId}`)
      window.scrollTo(0, 0)
    },
    [navigate],
  )

  return (
    <div
      className={`
        w-full max-w-full overflow-hidden ${responsiveConfig.containerPadding}
        enhanced-team-battle-list
      `}
      data-testid="team-battle-list"
    >
      {/* Header */}
      <MotionDiv
        className="flex flex-col items-center mb-6 md:mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-cyan-400" />
          <h2
            className={`${responsiveConfig.headerSize} font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
          >
            {t('Team Battles')}
          </h2>
        </div>

        <p className={`${QUICK_CLASH_CLASSES.textMuted} text-base text-center`}>
          {t('Compete with your team in 4v4 knowledge battles')}
        </p>
      </MotionDiv>

      {/* Battle Sections */}
      <div
        className={`flex flex-col ${responsiveConfig.sectionSpacing} items-stretch`}
      >
        {/* Active Battles Section */}
        <BattleSection
          title={t('Active Battles')}
          icon={Swords}
          battles={activeBattles}
          loading={activeBattlesLoading}
          error={activeBattlesError}
          hasMore={activeBattlesHasMore}
          onLoadMore={handleLoadMoreActive}
          onRefresh={handleRefreshActive}
          onEnterBattle={handleEnterTeamBattle}
          onViewAnalysis={handleViewBattleAnalysis}
          isRefreshing={refreshingActive}
          sectionType="active"
        />

        {/* Completed Battles Section */}
        <BattleSection
          title={t('Completed Battles')}
          icon={Trophy}
          battles={completedBattles}
          loading={completedBattlesLoading}
          error={completedBattlesError}
          hasMore={completedBattlesHasMore}
          onLoadMore={handleLoadMoreCompleted}
          onRefresh={handleRefreshCompleted}
          onEnterBattle={handleEnterTeamBattle}
          onViewAnalysis={handleViewBattleAnalysis}
          isRefreshing={refreshingCompleted}
          sectionType="completed"
        />
      </div>

      {/* Analysis Modal */}
      {isAnalysisOpen && selectedBattleId && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          }
        >
          <ChallengeAnalysisModal
            isOpen={isAnalysisOpen}
            onClose={() => setIsAnalysisOpen(false)}
            challengeId={selectedBattleId}
          />
        </React.Suspense>
      )}
    </div>
  )
})

TeamBattleList.displayName = 'TeamBattleList'

export default TeamBattleList
