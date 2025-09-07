// components/quickClashComponents/FlippableChallengeItem.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
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
import {
  Shield,
  Award,
  Target,
  Check,
  X,
  PlayCircle,
  FileText,
  RotateCcw,
  Zap,
  BarChart,
  Loader2,
} from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import UI components - keep original imports
import StatusBadge from './ui/StatusBadge'
import PlayerStatus from './ui/PlayerStatus'
import ResultBanner from './ui/ResultBanner'
import VSLine from './VSLine'
import useQuickClash from '../../customHooks/useQuickClash'
import EnhancedPotentialTrophyDisplay from './ui/EnhancedPotentialTrophyDisplay'
import { useSelector } from 'react-redux'

// You'll need to install these components:
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add dialog
import { Button } from '@/components/ui/button'

// Lazy load the analysis components - keep original lazy loading
const AnalysisSummaryCard = lazy(() =>
  import('./analysisCard/AnalysisSummaryCard'),
)
const ChallengeAnalysisModal = lazy(() => import('./ChallengeAnalysisModal'))

const MotionDiv = motion.div

/**
 * Enhanced FlippableChallengeItem - Faithful conversion with sophisticated flip functionality
 *
 * Key features maintained:
 * - Complex flip animation between front/back faces
 * - Lazy loading of analysis components for performance
 * - All original memoization and performance optimizations
 * - Sophisticated responsive design
 * - Blue-cyan harmony color scheme integration
 * - Analysis integration with error handling and retry logic
 * - Trophy animations and state management
 *
 * This is the premium version used for completed challenges where both players completed
 */
const FlippableChallengeItem = memo(
  ({
    challenge,
    userId,
    onAccept,
    onDecline,
    onStart,
    onViewReport,
    onRevenge,
    revengeLoading,
    index,
  }) => {
    const { t } = useTranslation('QuickClash')
    const [showTrophyAnimation, setShowTrophyAnimation] = useState(false)
    const [isFlipped, setIsFlipped] = useState(false)
    const [cardHeight, setCardHeight] = useState('auto')
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
    const frontCardRef = useRef(null)

    // Responsive values using window size (converted from Chakra UI breakpoints)
    const responsiveValues = useMemo(() => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        return {
          fontSize: width < 768 ? 'text-xs' : 'text-sm',
          iconSize: width < 768 ? 'w-3 h-3' : 'w-4 h-4',
          buttonSize: width < 768 ? 'sm' : 'default',
          padding: width < 768 ? 'p-2' : 'p-3',
          spacing: width < 768 ? 'space-y-1' : 'space-y-2',
        }
      }
      return {
        fontSize: 'text-sm',
        iconSize: 'w-4 h-4',
        buttonSize: 'default',
        padding: 'p-3',
        spacing: 'space-y-2',
      }
    }, [])

    const {
      fetchChallengeAnalysis,
      generateAnalysis,
      retryAnalysisFetch,
      challengeAnalyses,
      challengeAnalysesLoading,
      challengeAnalysesError,
    } = useQuickClash()

    // Memoize basic challenge properties - EXACTLY as original
    const {
      isChallenger,
      opponent,
      myAttempted,
      isExpired,
      myScore,
      isWinner,
      isTie,
      isDefeat,
      showFlipButton,
      showPlayerStatus,
    } = useMemo(() => {
      if (!challenge || !userId) {
        return {
          isChallenger: false,
          opponent: null,
          myAttempted: false,
          isExpired: false,
          myScore: 0,
          isWinner: false,
          isTie: false,
          isDefeat: false,
          showFlipButton: false,
          showPlayerStatus: false,
        }
      }

      const isChallenger = challenge.challenger._id === userId
      const opponent = isChallenger ? challenge.opponent : challenge.challenger
      const myAttempted = isChallenger
        ? challenge.challengerAttempted
        : challenge.opponentAttempted
      const isExpired = new Date(challenge.expiresAt) < new Date()
      const myScore = isChallenger
        ? challenge.challengerScore
        : challenge.opponentScore

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

      const showFlipButton = challenge.status === 'completed'
      const showPlayerStatus =
        challenge.status !== 'pending' && challenge.status !== 'rejected'

      return {
        isChallenger,
        opponent,
        myAttempted,
        isExpired,
        myScore,
        isWinner,
        isTie,
        isDefeat,
        showFlipButton,
        showPlayerStatus,
      }
    }, [challenge, userId])

    // Memoize player data - EXACTLY as original
    const { userPlayer, opponentPlayer } = useMemo(() => {
      if (!challenge || !userId) {
        return { userPlayer: null, opponentPlayer: null }
      }

      const isUserTheChallenger = challenge.challenger._id === userId

      const uPlayer = isUserTheChallenger
        ? challenge.challenger
        : challenge.opponent
      const oPlayer = isUserTheChallenger
        ? challenge.opponent
        : challenge.challenger

      const uPlayerScore = isUserTheChallenger
        ? challenge.challengerScore
        : challenge.opponentScore
      const oPlayerScore = isUserTheChallenger
        ? challenge.opponentScore
        : challenge.challengerScore

      const uPlayerAttempted = isUserTheChallenger
        ? challenge.challengerAttempted
        : challenge.opponentAttempted
      const oPlayerAttempted = isUserTheChallenger
        ? challenge.opponentAttempted
        : challenge.challengerAttempted

      const uPlayerTrophies = uPlayer?.quickClashTrophies
      const oPlayerTrophies = oPlayer?.quickClashTrophies

      return {
        userPlayer: {
          player: uPlayer,
          score: uPlayerScore,
          attempted: uPlayerAttempted,
          trophies: uPlayerTrophies,
        },
        opponentPlayer: {
          player: oPlayer,
          score: oPlayerScore,
          attempted: oPlayerAttempted,
          trophies: oPlayerTrophies,
        },
      }
    }, [challenge, userId])

    // Analysis data - keep original logic
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

    // Keep original height measurement effect
    useEffect(() => {
      if (frontCardRef.current && !isFlipped) {
        const height = frontCardRef.current.clientHeight
        setCardHeight(`${height}px`)
      }
    }, [frontCardRef, isFlipped, challenge])

    // Keep original analysis fetch effect
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

    // Keep original trophy animation effect
    useEffect(() => {
      if (challenge?.trophyUpdates && (isWinner || isDefeat || isTie)) {
        const timer = setTimeout(() => {
          setShowTrophyAnimation(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }, [challenge?.trophyUpdates, isWinner, isDefeat, isTie])

    // Keep original trophy change calculation
    const getTrophyChange = useCallback(() => {
      if (!challenge?.trophyUpdates) return undefined

      const userChange = isChallenger
        ? challenge.trophyUpdates.challenger?.change
        : challenge.trophyUpdates.opponent?.change

      return userChange
    }, [challenge, isChallenger])

    // Keep original potential trophy calculation
    const getTrophyPotential = useCallback(() => {
      if (!challenge) return 0

      if (challenge.status === 'active' || challenge.status === 'pending') {
        if (!challenge.trophyPotential) return 0

        return isChallenger
          ? challenge.trophyPotential.challenger?.potentialGain
          : challenge.trophyPotential.opponent?.potentialGain
      }

      return 0
    }, [challenge, isChallenger])

    // Enhanced card styling with blue-cyan color scheme - EXACTLY as original logic
    const cardStyles = useMemo(() => {
      if (!challenge)
        return {
          borderClass: 'border-white/20',
          shadowClass: '',
          gradientClass: '',
        }

      let borderClass = 'border-white/20'
      let shadowClass = ''
      let gradientClass = ''

      if (challenge.status === 'completed') {
        if (isWinner) {
          borderClass = 'border-cyan-400/60'
          shadowClass = QUICK_CLASH_CLASSES.shadowCyan
          gradientClass = 'from-cyan-500/5 to-transparent'
        } else if (isTie) {
          borderClass = 'border-yellow-400/60'
          shadowClass = 'shadow-lg shadow-yellow-500/20'
          gradientClass = 'from-yellow-500/5 to-transparent'
        } else if (isDefeat) {
          borderClass = 'border-red-400/60'
          shadowClass = 'shadow-lg shadow-red-500/20'
          gradientClass = 'from-red-500/5 to-transparent'
        }
      } else if (challenge.status === 'active' && !myAttempted) {
        borderClass = 'border-green-400/60'
        shadowClass = 'shadow-lg shadow-green-500/20'
        gradientClass = 'from-green-500/5 to-transparent'
      } else if (challenge.status === 'pending') {
        borderClass = 'border-yellow-400/60'
        shadowClass = 'shadow-lg shadow-yellow-500/15'
        gradientClass = 'from-yellow-500/5 to-transparent'
      }

      return {
        borderClass,
        shadowClass,
        gradientClass,
      }
    }, [challenge, isWinner, isTie, isDefeat, myAttempted])

    // Keep original category style calculation
    const getCategoryStyle = useCallback(() => {
      if (!challenge) return 'cyan'

      const categoryColors = {
        World: 'blue',
        Politics: 'red',
        Business: 'green',
        Technology: 'cyan',
        Sports: 'orange',
        Health: 'teal',
        Science: 'purple',
        Environment: 'green',
      }

      return categoryColors[challenge.category] || 'cyan'
    }, [challenge])

    // Optimized event handlers with useCallback - EXACTLY as original
    const handleFlip = useCallback(e => {
      if (e) e.stopPropagation()
      setIsFlipped(prev => !prev)
    }, [])

    const handleViewAnalysis = useCallback(() => {
      setIsAnalysisOpen(true)
    }, [])

    const handleAnalysisClose = useCallback(() => {
      setIsAnalysisOpen(false)
    }, [])

    const handleRetryAnalysis = useCallback(() => {
      retryAnalysisFetch(challenge._id)
    }, [retryAnalysisFetch, challenge])

    const handleAccept = useCallback(() => {
      onAccept(challenge._id)
    }, [onAccept, challenge])

    const handleDecline = useCallback(() => {
      onDecline(challenge._id)
    }, [onDecline, challenge])

    const handleStart = useCallback(() => {
      onStart(challenge._id)
    }, [onStart, challenge])

    const handleViewReport = useCallback(() => {
      onViewReport(challenge)
    }, [onViewReport, challenge])

    const handleRevenge = useCallback(() => {
      if (isDefeat) {
        onRevenge(opponent, challenge)
      }
    }, [onRevenge, opponent, isDefeat, challenge])

    // Enhanced skeleton fallback with Tailwind
    if (!challenge) {
      return (
        <div
          className={`
          ${QUICK_CLASH_CLASSES.glassMedium}
          rounded-2xl
          border border-white/20
          overflow-hidden
          ${responsiveValues.padding}
        `}
        >
          {/* Skeleton content - same as ChallengeItem */}
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
            <div className="h-5 w-24 bg-white/20 rounded-lg animate-pulse" />
            <div className="h-6 w-6 bg-white/20 rounded-full animate-pulse" />
          </div>
          <div className={responsiveValues.spacing}>
            <div className="h-6 w-full bg-white/20 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-4/5 bg-white/20 rounded-lg animate-pulse" />
            <div className="h-2 w-full bg-white/10 rounded-full my-3 animate-pulse" />
            <div className="h-6 w-full bg-white/20 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-4/5 bg-white/20 rounded-lg animate-pulse" />
          </div>
          <div className="flex justify-center mt-4">
            <div className="h-8 w-44 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </div>
      )
    }

    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`
          flippable-challenge-item
          relative
          transition-all duration-300
          ${isFlipped ? '' : 'hover:-translate-y-1 hover:shadow-xl'}
        `}
        style={{ height: isFlipped ? cardHeight : 'auto' }}
        data-testid="flippable-challenge-item"
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // FRONT FACE - Keep original structure exactly
            <MotionDiv
              key="front"
              ref={frontCardRef}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className={`
                ${QUICK_CLASH_CLASSES.glassMedium}
                rounded-2xl
                overflow-hidden
                border-2
                ${cardStyles.borderClass}
                ${cardStyles.shadowClass}
                relative
                h-full
                backdrop-brightness-110
              `}
            >
              {/* Gradient overlay */}
              {cardStyles.gradientClass && (
                <div
                  className={`
                  absolute inset-0
                  bg-gradient-to-br ${cardStyles.gradientClass}
                  opacity-70
                  pointer-events-none
                  rounded-2xl
                `}
                />
              )}

              {/* Card Header - Only show for non-completed challenges */}
              {challenge.status !== 'completed' && (
                <div
                  className={`
                  flex justify-between items-center
                  ${responsiveValues.padding}
                  border-b border-white/10
                  ${QUICK_CLASH_CLASSES.glassSoft}
                  relative z-10
                `}
                >
                  <StatusBadge
                    status={challenge.status}
                    isChallenger={isChallenger}
                    expiresAt={challenge.expiresAt}
                  />
                </div>
              )}

              {/* Card Body */}
              <div className={`${responsiveValues.padding} relative z-10`}>
                {/* Player Status Section - EXACTLY as original */}
                {showPlayerStatus && userPlayer && opponentPlayer && (
                  <div className={`${responsiveValues.spacing} mb-3`}>
                    <PlayerStatus
                      player={
                        isChallenger ? challenge.challenger : challenge.opponent
                      }
                      score={
                        isChallenger
                          ? challenge.challengerScore
                          : challenge.opponentScore
                      }
                      attempted={
                        isChallenger
                          ? challenge.challengerAttempted
                          : challenge.opponentAttempted
                      }
                      isUser={true}
                      trophies={
                        isChallenger
                          ? challenge.challenger.quickClashTrophies
                          : challenge.opponent.quickClashTrophies
                      }
                      trophyChange={getTrophyChange()}
                      showTrophyAnimation={showTrophyAnimation}
                      protectionApplied={
                        challenge.trophyUpdates?.protectionApplied &&
                        (isChallenger
                          ? challenge.trophyUpdates.protectionApplied.challenger
                          : challenge.trophyUpdates.protectionApplied.opponent)
                      }
                      isTie={isTie}
                    />

                    {/* VS Line */}
                    <VSLine
                      category={
                        challenge.status === 'active'
                          ? challenge.category
                          : null
                      }
                      categoryColorScheme={getCategoryStyle()}
                      isActiveChallenge={challenge.status === 'active'}
                      myAttempted={myAttempted}
                    />

                    <PlayerStatus
                      player={opponent}
                      score={
                        isChallenger
                          ? challenge.opponentScore
                          : challenge.challengerScore
                      }
                      attempted={
                        isChallenger
                          ? challenge.opponentAttempted
                          : challenge.challengerAttempted
                      }
                      isUser={false}
                      trophies={opponent.quickClashTrophies}
                      trophyChange={undefined}
                      showTrophyAnimation={false}
                      protectionApplied={false}
                      isTie={false}
                    />
                  </div>
                )}

                {/* Actions Section */}
                <div
                  className={`
                  flex justify-center
                  mt-4
                  p-3
                  ${QUICK_CLASH_CLASSES.glassLight}
                  rounded-xl
                  border border-white/5
                `}
                >
                  {myAttempted ? (
                    <div className="flex items-center space-x-3">
                      {/* Enhanced "View Report" Button */}
                      <Button
                        size={responsiveValues.buttonSize}
                        onClick={handleViewReport}
                        className={`
                          bg-transparent
                          ${QUICK_CLASH_CLASSES.textSecondary}
                          border-2 border-cyan-400/40
                          hover:bg-cyan-500/15
                          hover:text-white
                          hover:border-cyan-300/60
                          hover:scale-105
                          transition-all duration-300
                          ${QUICK_CLASH_CLASSES.shadowCyan}
                          ${QUICK_CLASH_CLASSES.focusRing}
                          font-bold
                          rounded-lg
                        `}
                      >
                        <FileText
                          className={`${responsiveValues.iconSize} mr-2`}
                        />
                        {t('View Report')}
                      </Button>

                      {/* Enhanced "Analysis" Button */}
                      {showFlipButton && (
                        <Button
                          size={responsiveValues.buttonSize}
                          onClick={handleFlip}
                          className={`
                            bg-transparent
                            text-blue-300
                            border-2 border-blue-400/40
                            hover:bg-blue-500/15
                            hover:text-white
                            hover:border-blue-300/60
                            hover:scale-105
                            transition-all duration-300
                            shadow-lg shadow-blue-500/30
                            hover:shadow-blue-500/50
                            ${QUICK_CLASH_CLASSES.focusRing}
                            font-bold
                            rounded-lg
                          `}
                        >
                          <BarChart
                            className={`${responsiveValues.iconSize} mr-2`}
                          />
                          {t('Analysis')}
                        </Button>
                      )}
                    </div>
                  ) : challenge.status === 'pending' && !isChallenger ? (
                    <div className="flex items-center space-x-3">
                      <Button
                        size={responsiveValues.buttonSize}
                        onClick={handleAccept}
                        className={`
                          ${QUICK_CLASH_CLASSES.btnSuccess}
                          rounded-lg
                          font-medium
                          transition-all duration-200
                          hover:scale-105
                          shadow-lg shadow-green-500/30
                          hover:shadow-green-500/50
                          ${QUICK_CLASH_CLASSES.focusRing}
                        `}
                      >
                        <Check
                          className={`${responsiveValues.iconSize} mr-2`}
                        />
                        {t('Accept')}
                      </Button>
                      <Button
                        size={responsiveValues.buttonSize}
                        onClick={handleDecline}
                        variant="outline"
                        className={`
                          ${QUICK_CLASH_CLASSES.glassMedium}
                          ${QUICK_CLASH_CLASSES.textPrimary}
                          border-red-400/40
                          hover:bg-red-500/10
                          hover:border-red-400/60
                          hover:text-red-300
                          rounded-lg
                          transition-all duration-200
                          ${QUICK_CLASH_CLASSES.focusRing}
                        `}
                      >
                        <X className={`${responsiveValues.iconSize} mr-2`} />
                        {t('Decline')}
                      </Button>
                    </div>
                  ) : challenge.status === 'active' && !myAttempted ? (
                    <div className="flex items-center gap-3">
                      <EnhancedPotentialTrophyDisplay
                        potentialGain={getTrophyPotential()}
                        size={responsiveValues.fontSize}
                        compact={true}
                      />

                      <Button
                        size={responsiveValues.buttonSize}
                        onClick={handleStart}
                        className={`
                          ${QUICK_CLASH_CLASSES.btnSuccess}
                          rounded-lg
                          font-bold
                          px-6
                          transition-all duration-200
                          hover:scale-105
                          hover:-translate-y-0.5
                          shadow-lg shadow-green-500/30
                          hover:shadow-green-500/50
                          ${QUICK_CLASH_CLASSES.focusRing}
                        `}
                      >
                        <PlayCircle
                          className={`${responsiveValues.iconSize} mr-2`}
                        />
                        {t('Start')}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Result Banner - Keep original exactly */}
              {challenge.status === 'completed' &&
                challenge.challengerAttempted &&
                challenge.opponentAttempted && (
                  <ResultBanner
                    isWinner={isWinner}
                    isTie={isTie}
                    isDefeat={isDefeat}
                    expiresAt={challenge.expiresAt}
                    category={challenge.category}
                    onRevenge={isDefeat ? handleRevenge : null}
                    revengeStatus={challenge.revengeStatus}
                    revengeLoading={revengeLoading}
                  />
                )}
            </MotionDiv>
          ) : (
            // BACK FACE - Keep original structure exactly
            <MotionDiv
              key="back"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className={`
                ${QUICK_CLASH_CLASSES.glassMedium}
                rounded-2xl
                overflow-hidden
                border-2
                ${cardStyles.borderClass}
                ${cardStyles.shadowClass}
                relative
                h-full
                backdrop-brightness-110
              `}
            >
              {/* Enhanced flip back button */}
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

              {/* Analysis Summary Card with enhanced fallback */}
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
                    <Zap className={`w-8 h-8 ${QUICK_CLASH_CLASSES.tabCyan}`} />
                    <p
                      className={`${QUICK_CLASH_CLASSES.textPrimary} text-center ${responsiveValues.fontSize}`}
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
                </div>
              </Suspense>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Analysis Modal - Keep original exactly */}
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
