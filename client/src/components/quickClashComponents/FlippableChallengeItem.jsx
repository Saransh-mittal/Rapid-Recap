// components/quickClashComponents/FlippableChallengeItem.jsx - IMPROVED VERSION (Cleaned & Compact)
import React, {
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useEffect,
  useRef,
  memo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BarChart, RotateCcw, Zap, Loader2 } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import UI components
import ResultBanner from './ui/ResultBanner'

import useQuickClash from '../../customHooks/useQuickClash'
import { Button } from '@/components/ui/button'

// Lazy load analysis components
const AnalysisSummaryCard = lazy(() =>
  import('./analysisCard/AnalysisSummaryCard'),
)
const ChallengeAnalysisModal = lazy(() => import('./ChallengeAnalysisModal'))

const MotionDiv = motion.div

/**
 * FlippableChallengeItem - IMPROVED VERSION
 *
 * PURPOSE: Only handles COMPLETED challenges with flip card + analysis
 *
 * KEY IMPROVEMENTS:
 * ✅ Removed redundant action buttons (use ChallengeItem for pending/active)
 * ✅ Removed status badge (only for completed challenges)
 * ✅ Made more compact (reduced padding & spacing)
 * ✅ Simplified logic (no duplicate calculations)
 * ✅ Cleaner separation of concerns
 * ✅ Focuses only on: flip animation, analysis display
 *
 * When to use:
 * - Use ChallengeItem for: pending, active challenges with actions
 * - Use FlippableChallengeItem for: completed challenges with analysis flip
 */
const FlippableChallengeItem = memo(
  ({ challenge, userId, onViewReport, onRevenge, revengeLoading, index }) => {
    const { t } = useTranslation('QuickClash')
    const [showTrophyAnimation, setShowTrophyAnimation] = useState(false)
    const [isFlipped, setIsFlipped] = useState(false)
    const [cardHeight, setCardHeight] = useState('auto')
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
    const frontCardRef = useRef(null)

    // Get hook methods
    const {
      fetchChallengeAnalysis,
      retryAnalysisFetch,
      challengeAnalyses,
      challengeAnalysesLoading,
      challengeAnalysesError,
    } = useQuickClash()

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //
    // MEMOIZED CALCULATIONS (Minimal, only what's needed)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //

    const {
      isChallenger,
      opponent,
      isWinner,
      isTie,
      isDefeat,
      userPlayer,
      opponentPlayer,
    } = useMemo(() => {
      if (!challenge || !userId) {
        return {
          isChallenger: false,
          opponent: null,
          isWinner: false,
          isTie: false,
          isDefeat: false,
          userPlayer: null,
          opponentPlayer: null,
        }
      }

      const isChallenger = challenge.challenger._id === userId
      const opponent = isChallenger ? challenge.opponent : challenge.challenger
      const userPlayer = isChallenger
        ? challenge.challenger
        : challenge.opponent
      const opponentPlayer = isChallenger
        ? challenge.opponent
        : challenge.challenger

      // Result determination
      const isWinner =
        challenge.status === 'completed' &&
        ((isChallenger &&
          challenge.challengerScore > challenge.opponentScore) ||
          (!isChallenger &&
            challenge.opponentScore > challenge.challengerScore))

      const isTie =
        challenge.status === 'completed' &&
        challenge.challengerScore === challenge.opponentScore

      const isDefeat = challenge.status === 'completed' && !isWinner && !isTie

      return {
        isChallenger,
        opponent,
        isWinner,
        isTie,
        isDefeat,
        userPlayer,
        opponentPlayer,
      }
    }, [challenge, userId])

    // Analysis data
    const analysis = useMemo(
      () => challengeAnalyses[challenge?._id],
      [challengeAnalyses, challenge],
    )

    const isAnalysisLoading = useMemo(
      () => challengeAnalysesLoading[challenge?._id],
      [challengeAnalysesLoading, challenge],
    )

    const analysisError = useMemo(
      () => challengeAnalysesError[challenge?._id],
      [challengeAnalysesError, challenge],
    )

    // Card styling based on result
    const cardStyles = useMemo(() => {
      if (isWinner) {
        return {
          borderClass: 'border-cyan-400/40',
          shadowClass: 'shadow-xl shadow-cyan-500/10',
          gradientClass: 'from-cyan-500/5 to-transparent',
        }
      } else if (isTie) {
        return {
          borderClass: 'border-amber-400/40',
          shadowClass: 'shadow-xl shadow-amber-500/10',
          gradientClass: 'from-amber-500/5 to-transparent',
        }
      } else if (isDefeat) {
        return {
          borderClass: 'border-red-400/40',
          shadowClass: 'shadow-xl shadow-red-500/10',
          gradientClass: 'from-red-500/5 to-transparent',
        }
      }
      return {
        borderClass: 'border-white/10',
        shadowClass: 'shadow-lg',
        gradientClass: '',
      }
    }, [isWinner, isTie, isDefeat])

    // Get category color
    const getCategoryStyle = useCallback(() => {
      if (!challenge?.category) return 'cyan'
      const colors = {
        World: 'blue',
        Politics: 'red',
        Business: 'green',
        Technology: 'cyan',
        Sports: 'orange',
        Health: 'teal',
        Science: 'purple',
        Environment: 'green',
      }
      return colors[challenge.category] || 'cyan'
    }, [challenge])

    // Trophy change calculation
    const getTrophyChange = useCallback(() => {
      if (!challenge?.trophyUpdates) return undefined
      return isChallenger
        ? challenge.trophyUpdates.challenger?.change
        : challenge.trophyUpdates.opponent?.change
    }, [challenge, isChallenger])

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //
    // EFFECTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //

    // Measure card height for flip animation
    useEffect(() => {
      if (frontCardRef.current && !isFlipped) {
        const height = frontCardRef.current.clientHeight
        setCardHeight(`${height}px`)
      }
    }, [frontCardRef, isFlipped, challenge])

    // Fetch analysis when card is flipped
    useEffect(() => {
      if (
        isFlipped &&
        !analysis &&
        !isAnalysisLoading &&
        !analysisError &&
        challenge?._id
      ) {
        fetchChallengeAnalysis(challenge._id)
      }
    }, [
      isFlipped,
      analysis,
      isAnalysisLoading,
      analysisError,
      challenge,
      fetchChallengeAnalysis,
    ])

    // Trophy animation trigger
    useEffect(() => {
      if (challenge?.trophyUpdates && (isWinner || isDefeat || isTie)) {
        const timer = setTimeout(() => {
          setShowTrophyAnimation(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }, [challenge?.trophyUpdates, isWinner, isDefeat, isTie])

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //
    // EVENT HANDLERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //

    const handleFlip = useCallback(e => {
      if (e) e.stopPropagation()
      setIsFlipped(prev => !prev)
    }, [])

    const handleAnalysisClose = useCallback(() => {
      setIsAnalysisOpen(false)
    }, [])

    const handleRetryAnalysis = useCallback(() => {
      retryAnalysisFetch(challenge._id)
    }, [retryAnalysisFetch, challenge])

    const handleViewAnalysis = useCallback(() => {
      setIsAnalysisOpen(true)
    }, [])

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //
    // RENDER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //

    if (!challenge) return null

    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="relative"
        style={{ height: isFlipped ? cardHeight : 'auto' }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //
            // FRONT FACE - Result Display
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //
            <MotionDiv
              key="front"
              ref={frontCardRef}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className={`
                ${QUICK_CLASH_CLASSES.glassLight}
                rounded-2xl
                overflow-hidden
                border
                ${cardStyles.borderClass}
                ${cardStyles.shadowClass}
                relative
                h-full
                backdrop-brightness-105
                transition-all duration-300
                hover:border-opacity-60
                hover:shadow-2xl
                hover:-translate-y-0.5
              `}
            >
              {/* Gradient overlay */}
              {cardStyles.gradientClass && (
                <div
                  className={`
                  absolute inset-0
                  bg-gradient-to-br ${cardStyles.gradientClass}
                  opacity-60
                  pointer-events-none
                  rounded-2xl
                `}
                />
              )}

              <div className="relative z-10">
                {/* PLAYER MATCHUP - Compact */}
                <div className="px-3 md:px-4 py-3 md:py-3.5 space-y-2 md:space-y-2.5">
                  {/* User Player Card - With Score & Trophy Change */}
                  <MotionDiv
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`
                      flex items-center justify-between
                      p-2.5 md:p-3
                      rounded-lg
                      border border-cyan-400/30
                      bg-gradient-to-r from-cyan-500/8 to-transparent
                      backdrop-blur-sm
                      hover:border-cyan-400/50
                      transition-all duration-200
                    `}
                  >
                    {userPlayer && (
                      <>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full ring-2 ring-cyan-400/50 flex-shrink-0 bg-gradient-to-br from-cyan-400 to-cyan-500" />
                          <div className="flex flex-col min-w-0">
                            <p className="text-xs font-semibold text-white truncate max-w-[100px]">
                              {userPlayer?.inGameName || userPlayer?.name}
                            </p>
                            <span className="text-xs text-cyan-300/80 font-medium">
                              You
                            </span>
                          </div>
                        </div>

                        {/* Right section: Score + Trophy */}
                        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                          {/* Score */}
                          {challenge?.challengerScore !== undefined && (
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-white/50 font-medium">
                                Score
                              </span>
                              <span className="text-sm font-bold text-white">
                                {isChallenger
                                  ? challenge.challengerScore
                                  : challenge.opponentScore}
                              </span>
                            </div>
                          )}

                          {/* Trophy Change */}
                          {challenge?.trophyUpdates &&
                            getTrophyChange() !== undefined && (
                              <div className="flex flex-col items-center">
                                <span className="text-xs text-white/50 font-medium">
                                  Trophy
                                </span>
                                <span
                                  className={`text-sm font-bold ${
                                    getTrophyChange() >= 0
                                      ? 'text-green-400'
                                      : 'text-red-400'
                                  }`}
                                >
                                  {getTrophyChange() >= 0 ? '+' : ''}
                                  {getTrophyChange()}
                                </span>
                              </div>
                            )}

                          {/* Total Trophies */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-white/50 font-medium">
                              Total
                            </span>
                            <span className="text-sm font-bold text-yellow-400">
                              {userPlayer?.quickClashTrophies || 0}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </MotionDiv>

                  {/* VS Divider */}
                  <div className="flex items-center justify-center py-1.5">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="px-2.5 text-xs text-white/50 font-medium">
                      vs
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* Opponent Player Card - With Score & Trophy Change */}
                  <MotionDiv
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`
                      flex items-center justify-between
                      p-2.5 md:p-3
                      rounded-lg
                      border border-white/10
                      bg-gradient-to-r from-slate-600/5 to-transparent
                      backdrop-blur-sm
                      hover:border-white/20
                      transition-all duration-200
                    `}
                  >
                    {opponentPlayer && (
                      <>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full ring-2 ring-white/20 flex-shrink-0 bg-gradient-to-br from-gray-400 to-gray-500" />
                          <div className="flex flex-col min-w-0">
                            <p className="text-xs font-semibold text-white truncate max-w-[100px]">
                              {opponentPlayer?.inGameName ||
                                opponentPlayer?.name}
                            </p>
                            <span className="text-xs text-white/50 font-medium">
                              Opponent
                            </span>
                          </div>
                        </div>

                        {/* Right section: Score + Trophy */}
                        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                          {/* Score */}
                          {challenge?.opponentScore !== undefined && (
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-white/50 font-medium">
                                Score
                              </span>
                              <span className="text-sm font-bold text-white">
                                {!isChallenger
                                  ? challenge.challengerScore
                                  : challenge.opponentScore}
                              </span>
                            </div>
                          )}

                          {/* Trophy Change */}
                          {challenge?.trophyUpdates && (
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-white/50 font-medium">
                                Trophy
                              </span>
                              <span
                                className={`text-sm font-bold ${
                                  (isChallenger
                                    ? challenge.trophyUpdates.opponent?.change
                                    : challenge.trophyUpdates.challenger
                                        ?.change) >= 0
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {(isChallenger
                                  ? challenge.trophyUpdates.opponent?.change
                                  : challenge.trophyUpdates.challenger
                                      ?.change) >= 0
                                  ? '+'
                                  : ''}
                                {isChallenger
                                  ? challenge.trophyUpdates.opponent?.change
                                  : challenge.trophyUpdates.challenger?.change}
                              </span>
                            </div>
                          )}

                          {/* Total Trophies */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-white/50 font-medium">
                              Total
                            </span>
                            <span className="text-sm font-bold text-yellow-400">
                              {opponentPlayer?.quickClashTrophies || 0}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </MotionDiv>
                </div>

                {/* Actions - View Report & Flip */}
                <div className="px-3 md:px-4 pb-3 md:pb-3.5">
                  <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-2.5 md:mb-3" />

                  <div className="flex justify-center gap-2">
                    {/* Analysis/Flip Button */}
                    <Button
                      onClick={handleFlip}
                      className={`
                        flex-1
                        bg-transparent
                        text-blue-300
                        border-2 border-blue-400/40
                        hover:bg-blue-500/15
                        hover:text-white
                        hover:border-blue-300/60
                        hover:scale-105
                        transition-all duration-300
                        rounded-lg
                        font-semibold
                        py-2 md:py-2.5
                        text-xs md:text-sm
                        shadow-lg shadow-blue-500/30
                        hover:shadow-blue-500/50
                        ${QUICK_CLASH_CLASSES.focusRing}
                      `}
                    >
                      <BarChart className="w-3.5 h-3.5 mr-2" />
                      {t('Analysis')}
                    </Button>

                    {/* Report Button - If Already Attempted */}
                    {challenge?.challengerAttempted &&
                      challenge?.opponentAttempted && (
                        <Button
                          onClick={() => onViewReport(challenge)}
                          className={`
                            flex-1
                            ${QUICK_CLASH_CLASSES.glassMedium}
                            ${QUICK_CLASH_CLASSES.textPrimary}
                            hover:bg-cyan-500/20
                            border border-cyan-400/40
                            hover:border-cyan-400/60
                            rounded-lg
                            font-semibold
                            py-2 md:py-2.5
                            text-xs md:text-sm
                            transition-all duration-200
                            hover:scale-105
                            hover:-translate-y-0.5
                            ${QUICK_CLASH_CLASSES.shadowCyan}
                            ${QUICK_CLASH_CLASSES.focusRing}
                          `}
                        >
                          <BarChart className="w-3.5 h-3.5 mr-2" />
                          {t('Report')}
                        </Button>
                      )}
                  </div>
                </div>
              </div>

              {/* Result Banner */}
              {challenge.status === 'completed' &&
                challenge.challengerAttempted &&
                challenge.opponentAttempted && (
                  <ResultBanner
                    isWinner={isWinner}
                    isTie={isTie}
                    isDefeat={isDefeat}
                    expiresAt={challenge.expiresAt}
                    category={challenge.category}
                    onRevenge={
                      isDefeat ? () => onRevenge(opponent, challenge) : null
                    }
                    revengeStatus={challenge.revengeStatus}
                    revengeLoading={revengeLoading}
                  />
                )}
            </MotionDiv>
          ) : (
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //
            // BACK FACE - Analysis Display
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ //
            <MotionDiv
              key="back"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className={`
                ${QUICK_CLASH_CLASSES.glassLight}
                rounded-2xl
                overflow-hidden
                border
                ${cardStyles.borderClass}
                ${cardStyles.shadowClass}
                relative
                h-full
                backdrop-brightness-105
              `}
            >
              {/* Flip Back Button */}
              <button
                onClick={handleFlip}
                className={`
                  absolute top-2 right-2 z-10
                  w-10 h-10
                  ${QUICK_CLASH_CLASSES.glassMedium}
                  hover:bg-blue-500/20
                  border border-blue-400/30
                  hover:border-blue-300/50
                  rounded-full
                  flex items-center justify-center
                  transition-all duration-300
                  hover:scale-110
                  hover:rotate-180
                  ${QUICK_CLASH_CLASSES.shadowBlue}
                  hover:shadow-blue-500/60
                  ${QUICK_CLASH_CLASSES.focusRing}
                `}
                aria-label={t('View Challenge')}
                title={t('View Challenge')}
              >
                <RotateCcw className="w-4 h-4 text-blue-300 hover:text-white transition-colors" />
              </button>

              {/* Analysis Summary Card */}
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
                    <Zap className={`w-8 h-8 ${QUICK_CLASH_CLASSES.tabCyan}`} />
                    <p
                      className={`${QUICK_CLASH_CLASSES.textPrimary} text-center text-xs md:text-sm`}
                    >
                      {t('Analyzing challenge data...')}
                    </p>
                    <Loader2
                      className={`w-6 h-6 ${QUICK_CLASH_CLASSES.tabCyan} animate-spin`}
                    />
                  </div>
                }
              >
                <div className="h-full">
                  {analysis ? (
                    <AnalysisSummaryCard
                      challenge={challenge}
                      analysis={analysis}
                      userId={userId}
                      isLoading={isAnalysisLoading}
                      isError={!!analysisError}
                      errorMessage={analysisError}
                      onViewFull={handleViewAnalysis}
                      onRetry={handleRetryAnalysis}
                    />
                  ) : isAnalysisLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                      <p
                        className={`${QUICK_CLASH_CLASSES.textPrimary} font-medium`}
                      >
                        {t('Loading analysis...')}
                      </p>
                    </div>
                  ) : analysisError ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
                      <p
                        className={`${QUICK_CLASH_CLASSES.textSecondary} text-center text-sm`}
                      >
                        {t('Error loading analysis')}
                      </p>
                      <Button
                        onClick={handleRetryAnalysis}
                        className={`${QUICK_CLASH_CLASSES.btnSecondary} rounded-lg`}
                      >
                        {t('Retry')}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Suspense>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Full Analysis Modal */}
        {isAnalysisOpen && (
          <Suspense
            fallback={
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <p
                    className={`${QUICK_CLASH_CLASSES.textPrimary} font-medium`}
                  >
                    {t('Loading analysis...')}
                  </p>
                </div>
              </div>
            }
          >
            <ChallengeAnalysisModal
              isOpen={isAnalysisOpen}
              onClose={handleAnalysisClose}
              challengeId={challenge._id}
            />
          </Suspense>
        )}
      </MotionDiv>
    )
  },
)

FlippableChallengeItem.displayName = 'FlippableChallengeItem'

export default FlippableChallengeItem
