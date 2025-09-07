// components/quickClashComponents/ChallengeItem.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, { useState, useMemo, useCallback, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Target, Check, X, PlayCircle, FileText } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import UI components - keep original imports
import StatusBadge from './ui/StatusBadge'
import PlayerStatus from './ui/PlayerStatus'
import VSLine from './VSLine'
import EnhancedPotentialTrophyDisplay from './ui/EnhancedPotentialTrophyDisplay'
import CompactTrophyStakeDisplay from './ui/CompactTrophyStakeDisplay'

// You'll need to install this component: npx shadcn-ui@latest add button
import { Button } from '@/components/ui/button'

const MotionDiv = motion.div

/**
 * Enhanced ChallengeItem - Faithful conversion with consistent color scheme and performance optimizations
 *
 * Key improvements:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced responsive design with better breakpoint handling
 * - Improved accessibility with proper focus management
 * - Maintained all original performance optimizations (memoization, callbacks)
 * - Enhanced visual feedback with micro-animations
 *
 * This is used for non-completed challenges and challenges where not both players have attempted
 */
const ChallengeItem = memo(
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

    // Keep original potential trophy calculations
    const getTrophyPotentialGain = useCallback(() => {
      if (!challenge) return 0

      if (challenge.status === 'active' || challenge.status === 'pending') {
        if (!challenge.trophyPotential) return 0

        return isChallenger
          ? challenge.trophyPotential.challenger?.potentialGain
          : challenge.trophyPotential.opponent?.potentialGain
      }

      return 0
    }, [challenge, isChallenger])

    const getTrophyPotentialLoss = useCallback(() => {
      if (!challenge) return 0
      if (challenge.status === 'active' || challenge.status === 'pending') {
        if (!challenge.trophyPotential) return 0
        return isChallenger
          ? challenge.trophyPotential.challenger?.potentialLoss
          : challenge.trophyPotential.opponent?.potentialLoss
      }
      return 0
    }, [challenge, isChallenger])

    // Enhanced card styling with blue-cyan color scheme
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
          {/* Header skeleton */}
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
            <div className="h-5 w-24 bg-white/20 rounded-lg animate-pulse" />
            <div className="h-6 w-6 bg-white/20 rounded-full animate-pulse" />
          </div>

          {/* Body skeleton */}
          <div className={responsiveValues.spacing}>
            <div className="h-6 w-full bg-white/20 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-4/5 bg-white/20 rounded-lg animate-pulse" />
            <div className="h-2 w-full bg-white/10 rounded-full my-3 animate-pulse" />
            <div className="h-6 w-full bg-white/20 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-4/5 bg-white/20 rounded-lg animate-pulse" />
          </div>

          {/* Action skeleton */}
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
          challenge-item
          ${QUICK_CLASH_CLASSES.glassMedium}
          rounded-2xl
          overflow-hidden
          border-2
          ${cardStyles.borderClass}
          ${cardStyles.shadowClass}
          relative
          h-full
          transition-all duration-300
          hover:-translate-y-1
          hover:shadow-xl
          backdrop-brightness-110
        `}
        data-testid="challenge-item"
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
          {/* Player Status Section */}
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
                  challenge.status === 'active' ? challenge.category : null
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
              <Button
                size={responsiveValues.buttonSize}
                onClick={handleViewReport}
                className={`
                  ${QUICK_CLASH_CLASSES.glassMedium}
                  ${QUICK_CLASH_CLASSES.textPrimary}
                  ${QUICK_CLASH_CLASSES.hoverCyan}
                  border-cyan-400/40
                  hover:bg-cyan-500/10
                  rounded-lg
                  transition-all duration-200
                  hover:scale-105
                  ${QUICK_CLASH_CLASSES.shadowCyan}
                  ${QUICK_CLASH_CLASSES.focusRing}
                `}
              >
                <FileText className={`${responsiveValues.iconSize} mr-2`} />
                {t('View Report')}
              </Button>
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
                  <Check className={`${responsiveValues.iconSize} mr-2`} />
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
                <CompactTrophyStakeDisplay
                  potentialGain={getTrophyPotentialGain()}
                  potentialLoss={getTrophyPotentialLoss()}
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
                  <PlayCircle className={`${responsiveValues.iconSize} mr-2`} />
                  {t('Start')}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </MotionDiv>
    )
  },
)

ChallengeItem.displayName = 'ChallengeItem'

export default ChallengeItem
