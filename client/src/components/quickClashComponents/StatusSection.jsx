// components/quickClashComponents/StatusSection.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react'
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import existing components - keep all original logic
import ChallengeItem from './ChallengeItem'
import FlippableChallengeItem from './FlippableChallengeItem'
import DateGroupHeader from './DateGroupHeader'
import {
  groupChallengesByDate,
  sortDateKeys,
} from '../../utils/dateGroupingUtils'

const MotionDiv = motion.div

// Progressive rendering configuration - EXACTLY as original
const PROGRESSIVE_CONFIG = {
  initialRenderCount: 6,
  batchSize: 4,
  intersectionThreshold: 0.1,
  rootMargin: '100px',
}

/**
 * Enhanced aesthetic challenge item skeleton with Tailwind CSS
 * Maintains the exact same design aesthetic with improved color scheme
 */
const AestheticChallengeItemSkeleton = memo(() => {
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        ${QUICK_CLASH_CLASSES.glassMedium}
        rounded-2xl
        overflow-hidden
        border
        border-white/10
        relative
        min-h-[220px]
        shadow-xl
        backdrop-brightness-110
      `}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-70 pointer-events-none rounded-2xl" />

      {/* Header Section - Status and Category */}
      <div
        className={`
        flex justify-between items-center
        p-3 md:p-4
        border-b border-white/10
        ${QUICK_CLASH_CLASSES.glassSoft}
      `}
      >
        {/* Status Badge Skeleton */}
        <div className="h-6 w-20 bg-gradient-to-r from-green-500/20 to-green-600/30 rounded-full animate-pulse" />

        {/* Category Tag Skeleton */}
        <div className="h-6 w-16 bg-gradient-to-r from-blue-500/20 to-blue-600/30 rounded-full animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="p-3 md:p-4">
        <div className="flex flex-col space-y-3">
          {/* User Player Section */}
          <div
            className={`
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-xl
            p-3
            border
            border-cyan-500/20
            bg-gradient-to-r from-cyan-500/5 to-transparent
          `}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/30 to-cyan-600/40 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-cyan-400/40 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <div className="h-3 w-10 bg-yellow-400/40 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-6 h-6 bg-blue-400/30 rounded-full animate-pulse" />
            </div>
          </div>

          {/* VS Line */}
          <div className="flex items-center justify-center py-2">
            <div
              className={`
              ${QUICK_CLASH_CLASSES.glassMedium}
              rounded-full px-4 py-1
              border border-white/10
            `}
            >
              <span
                className={`${QUICK_CLASH_CLASSES.textMuted} text-sm font-medium`}
              >
                VS
              </span>
            </div>
          </div>

          {/* Opponent Player Section */}
          <div
            className={`
            ${QUICK_CLASH_CLASSES.glassMedium}
            rounded-xl
            p-3
            border
            border-white/10
          `}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400/30 to-gray-600/40 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
                <div className="flex items-center space-x-2">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <div className="h-3 w-8 bg-yellow-400/40 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-6 h-6 bg-gray-400/30 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Action Section */}
          <div
            className={`
            flex justify-center mt-3 p-3
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-xl
            border border-white/5
          `}
          >
            <div className="flex items-center space-x-3">
              {/* Trophy Gain Indicator Skeleton */}
              <div
                className={`
                flex items-center space-x-2
                bg-yellow-400/10
                rounded-full
                px-3 py-2
                border border-yellow-400/30
              `}
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <div className="h-4 w-6 bg-yellow-400/50 rounded animate-pulse" />
              </div>

              {/* Action Button Skeleton */}
              <div className="h-9 w-24 bg-gradient-to-r from-green-500/30 to-green-600/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  )
})

/**
 * Progressive challenge renderer with intersection observer - ALL ORIGINAL LOGIC PRESERVED
 */
const ProgressiveChallengeRenderer = memo(
  ({
    challenge,
    userId,
    handlers,
    index,
    revengeLoading,
    isVisible,
    onVisibilityChange,
    shouldRender,
  }) => {
    const elementRef = useRef()

    // Setup intersection observer - EXACTLY as original
    useEffect(() => {
      if (!elementRef.current || shouldRender) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onVisibilityChange(index, true)
            observer.disconnect()
          }
        },
        {
          threshold: PROGRESSIVE_CONFIG.intersectionThreshold,
          rootMargin: PROGRESSIVE_CONFIG.rootMargin,
        },
      )

      observer.observe(elementRef.current)
      return () => observer.disconnect()
    }, [index, onVisibilityChange, shouldRender])

    // Determine component type - EXACTLY as original
    const isFlippable = useMemo(
      () =>
        challenge.status === 'completed' &&
        challenge.challengerAttempted &&
        challenge.opponentAttempted,
      [challenge],
    )

    return (
      <div ref={elementRef} className="min-h-[220px]">
        {shouldRender ? (
          isFlippable ? (
            <FlippableChallengeItem
              challenge={challenge}
              userId={userId}
              onAccept={handlers.onAccept}
              onDecline={handlers.onDecline}
              onStart={handlers.onStart}
              onViewReport={handlers.onViewReport}
              onRevenge={handlers.onRevenge}
              index={index}
              revengeLoading={revengeLoading}
            />
          ) : (
            <ChallengeItem
              challenge={challenge}
              userId={userId}
              onAccept={handlers.onAccept}
              onDecline={handlers.onDecline}
              onStart={handlers.onStart}
              onViewReport={handlers.onViewReport}
              onRevenge={handlers.onRevenge}
              index={index}
              revengeLoading={revengeLoading}
            />
          )
        ) : (
          <AestheticChallengeItemSkeleton />
        )}
      </div>
    )
  },
)

/**
 * Progressive challenge grid - ALL ORIGINAL PERFORMANCE LOGIC PRESERVED
 */
const ProgressiveChallengeGrid = memo(
  ({ challenges, columns, spacing, userId, handlers, revengeLoading }) => {
    const [visibleItems, setVisibleItems] = useState(new Set())
    const [renderCount, setRenderCount] = useState(
      PROGRESSIVE_CONFIG.initialRenderCount,
    )

    // Initialize with first batch - EXACTLY as original
    useEffect(() => {
      const initialItems = new Set()
      for (
        let i = 0;
        i < Math.min(PROGRESSIVE_CONFIG.initialRenderCount, challenges.length);
        i++
      ) {
        initialItems.add(i)
      }
      setVisibleItems(initialItems)
    }, [challenges.length])

    // Handle visibility changes - EXACTLY as original
    const handleVisibilityChange = useCallback((index, isVisible) => {
      if (isVisible) {
        setVisibleItems(prev => {
          const newSet = new Set(prev)
          newSet.add(index)
          return newSet
        })
      }
    }, [])

    // Batch render logic - EXACTLY as original
    useEffect(() => {
      const visibleCount = visibleItems.size
      const shouldLoadMore =
        visibleCount > renderCount - PROGRESSIVE_CONFIG.batchSize

      if (shouldLoadMore && renderCount < challenges.length) {
        const newRenderCount = Math.min(
          renderCount + PROGRESSIVE_CONFIG.batchSize,
          challenges.length,
        )
        setRenderCount(newRenderCount)

        setVisibleItems(prev => {
          const newSet = new Set(prev)
          for (let i = renderCount; i < newRenderCount; i++) {
            newSet.add(i)
          }
          return newSet
        })
      }
    }, [visibleItems.size, renderCount, challenges.length])

    if (!challenges?.length) return null

    // Responsive grid classes
    const gridClasses = `
      grid gap-${spacing}
      ${
        columns === 1
          ? 'grid-cols-1'
          : columns === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }
    `

    return (
      <div className={gridClasses}>
        {challenges.map((challenge, index) => (
          <ProgressiveChallengeRenderer
            key={challenge._id}
            challenge={challenge}
            userId={userId}
            handlers={handlers}
            index={index}
            revengeLoading={revengeLoading}
            isVisible={visibleItems.has(index)}
            onVisibilityChange={handleVisibilityChange}
            shouldRender={visibleItems.has(index)}
          />
        ))}
      </div>
    )
  },
)

/**
 * Progressive date-grouped content - ALL ORIGINAL LOGIC PRESERVED
 */
const ProgressiveDateGroupedContent = memo(
  ({
    dateGroupedChallenges,
    sortedDateKeys,
    columns,
    spacing,
    userId,
    handlers,
    revengeLoading,
  }) => {
    if (!sortedDateKeys?.length) return null

    return (
      <div className={`flex flex-col space-y-${spacing}`}>
        {sortedDateKeys.map((dateKey, dateIndex) => (
          <div key={dateKey}>
            <DateGroupHeader date={dateKey} index={dateIndex} />
            <div className="mt-3">
              <ProgressiveChallengeGrid
                challenges={dateGroupedChallenges[dateKey]}
                columns={columns}
                spacing={spacing}
                userId={userId}
                handlers={handlers}
                revengeLoading={revengeLoading}
              />
            </div>
          </div>
        ))}
      </div>
    )
  },
)

/**
 * Enhanced StatusSection with Tailwind CSS - ALL ORIGINAL FUNCTIONALITY PRESERVED
 *
 * Key features maintained:
 * - Progressive rendering with intersection observer
 * - Aesthetic skeleton loaders
 * - Collapsible sections with smooth animations
 * - Date grouping for completed challenges
 * - Responsive design
 * - Performance optimizations
 */
const StatusSection = memo(
  ({
    title,
    icon: Icon,
    challenges,
    userId,
    handlers,
    animationDelay = 0,
    revengeLoading,
  }) => {
    const { t } = useTranslation('QuickClash')
    const [isOpen, setIsOpen] = useState(true)

    // Responsive values - converted to Tailwind approach
    const isCompletedSection = title === t('Completed')
    const columns = useMemo(() => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        if (width < 640) return 1 // sm breakpoint
        if (width < 768) return isCompletedSection ? 1 : 2 // md breakpoint
        if (width < 1024) return isCompletedSection ? 2 : 2 // lg breakpoint
        return isCompletedSection ? 2 : 3 // xl and above
      }
      return 2
    }, [isCompletedSection])

    const spacing = 4 // Equivalent to gap-4

    // Early return if no challenges - EXACTLY as original
    if (!challenges || challenges.length === 0) return null

    // Group completed challenges by date - EXACTLY as original
    const dateGroupedChallenges = useMemo(
      () => (isCompletedSection ? groupChallengesByDate(challenges, t) : null),
      [challenges, isCompletedSection, t],
    )

    const sortedDateKeys = useMemo(
      () =>
        isCompletedSection && dateGroupedChallenges
          ? sortDateKeys(Object.keys(dateGroupedChallenges), t)
          : null,
      [dateGroupedChallenges, isCompletedSection, t],
    )

    // Memoized section content - EXACTLY as original
    const sectionContent = useMemo(() => {
      if (!isOpen) return null

      if (isCompletedSection) {
        return (
          <ProgressiveDateGroupedContent
            dateGroupedChallenges={dateGroupedChallenges}
            sortedDateKeys={sortedDateKeys}
            columns={columns}
            spacing={spacing}
            userId={userId}
            handlers={handlers}
            revengeLoading={revengeLoading}
          />
        )
      }

      return (
        <ProgressiveChallengeGrid
          challenges={challenges}
          columns={columns}
          spacing={spacing}
          userId={userId}
          handlers={handlers}
          revengeLoading={revengeLoading}
        />
      )
    }, [
      isOpen,
      isCompletedSection,
      dateGroupedChallenges,
      sortedDateKeys,
      challenges,
      columns,
      spacing,
      userId,
      handlers,
      revengeLoading,
    ])

    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay }}
        className={`
          status-section
          ${QUICK_CLASH_CLASSES.glassMedium}
          rounded-2xl
          p-4
          mb-6
          border
          border-white/10
          transition-all duration-300
          hover:border-white/20
          hover:shadow-xl
          hover:shadow-cyan-500/10
          backdrop-brightness-110
        `}
        data-testid={`status-section-${title
          .toLowerCase()
          .replace(/\s+/g, '-')}`}
      >
        {/* Section Header with toggle */}
        <div
          className={`
            flex justify-between items-center
            ${isOpen ? 'mb-4' : 'mb-0'}
            cursor-pointer
            p-3
            rounded-xl
            transition-all duration-200
            hover:bg-white/5
            ${QUICK_CLASH_CLASSES.focusRing}
          `}
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsOpen(!isOpen)
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <Icon
              className={`w-5 h-5 md:w-6 md:h-6 ${QUICK_CLASH_CLASSES.tabCyan}`}
            />
            <h3
              className={`
              ${QUICK_CLASH_CLASSES.textPrimary}
              text-sm md:text-base
              font-semibold
            `}
            >
              {title} ({challenges.length})
            </h3>
          </div>

          <button
            className={`
              p-2
              rounded-lg
              transition-all duration-200
              hover:bg-white/10
              ${QUICK_CLASH_CLASSES.focusRing}
            `}
            aria-label={isOpen ? 'Collapse section' : 'Expand section'}
          >
            {isOpen ? (
              <ChevronUp
                className={`w-4 h-4 ${QUICK_CLASH_CLASSES.textSecondary}`}
              />
            ) : (
              <ChevronDown
                className={`w-4 h-4 ${QUICK_CLASH_CLASSES.textSecondary}`}
              />
            )}
          </button>
        </div>

        {/* Collapsible Content with smooth animation */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <MotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
                opacity: { duration: 0.25 },
              }}
              className="overflow-hidden"
            >
              {sectionContent}
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>
    )
  },
)

// Set display names for debugging
AestheticChallengeItemSkeleton.displayName = 'AestheticChallengeItemSkeleton'
ProgressiveChallengeRenderer.displayName = 'ProgressiveChallengeRenderer'
ProgressiveChallengeGrid.displayName = 'ProgressiveChallengeGrid'
ProgressiveDateGroupedContent.displayName = 'ProgressiveDateGroupedContent'
StatusSection.displayName = 'StatusSection'

export default StatusSection
