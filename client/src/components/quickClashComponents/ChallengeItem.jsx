// components/quickClashComponents/ChallengeItem.jsx - COMPACT VERSION (Original Design, Smaller Height)
import React, { useState, useMemo, useCallback, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Target,
  Check,
  X,
  PlayCircle,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// Import UI components
import StatusBadge from './ui/StatusBadge'
import CompactTrophyStakeDisplay from './ui/CompactTrophyStakeDisplay'
import WinProbabilityBadge from './ui/WinProbabilityBadge'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const MotionDiv = motion.div

/**
 * ChallengeItem - Compact Version
 *
 * Same beautiful design as original, but:
 * - ✅ Reduced card height (tighter padding)
 * - ✅ Smaller internal spacing
 * - ✅ Compact typography
 * - ✅ All functionality preserved
 * - ✅ Premium feel maintained
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

    // Memoize basic challenge properties
    const {
      isChallenger,
      opponent,
      myAttempted,
      isWinner,
      isTie,
      isDefeat,
      userPlayer,
    } = useMemo(() => {
      if (!challenge || !userId) {
        return {
          isChallenger: false,
          opponent: null,
          myAttempted: false,
          isWinner: false,
          isTie: false,
          isDefeat: false,
          userPlayer: null,
        }
      }

      const isChallenger = challenge.challenger._id === userId
      const opponent = isChallenger ? challenge.opponent : challenge.challenger
      const userPlayer = isChallenger
        ? challenge.challenger
        : challenge.opponent
      const myAttempted = isChallenger
        ? challenge.challengerAttempted
        : challenge.opponentAttempted

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
        myAttempted,
        isWinner,
        isTie,
        isDefeat,
        userPlayer,
      }
    }, [challenge, userId])

    // Extract win probability data
    const winProbability = useMemo(() => {
      if (!challenge?.winProbability) return null

      const myProb = isChallenger
        ? challenge.winProbability.challenger
        : challenge.winProbability.opponent

      return {
        probability: myProb?.probability || 0.5,
        dataQuality: myProb?.dataQuality || 'medium',
        sampleSize: myProb?.sampleSize || 0,
      }
    }, [challenge, isChallenger])

    // Trophy potential calculations
    const { potentialGain, potentialLoss } = useMemo(() => {
      if (!challenge || challenge.status !== 'active') {
        return { potentialGain: 0, potentialLoss: 0 }
      }

      if (!challenge.trophyPotential) {
        return { potentialGain: 0, potentialLoss: 0 }
      }

      return {
        potentialGain: isChallenger
          ? challenge.trophyPotential.challenger?.potentialGain || 0
          : challenge.trophyPotential.opponent?.potentialGain || 0,
        potentialLoss: isChallenger
          ? challenge.trophyPotential.challenger?.potentialLoss || 0
          : challenge.trophyPotential.opponent?.potentialLoss || 0,
      }
    }, [challenge, isChallenger])

    // Determine card styling based on status
    const cardStyles = useMemo(() => {
      if (!challenge) {
        return {
          borderClass: 'border-white/10',
          shadowClass: 'shadow-lg',
          gradientClass: '',
        }
      }

      if (challenge.status === 'completed') {
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
      }

      if (challenge.status === 'active' && !myAttempted) {
        return {
          borderClass: 'border-green-400/40',
          shadowClass: 'shadow-xl shadow-green-500/10',
          gradientClass: 'from-green-500/5 to-transparent',
        }
      }

      return {
        borderClass: 'border-white/10',
        shadowClass: 'shadow-lg',
        gradientClass: '',
      }
    }, [challenge, isWinner, isTie, isDefeat, myAttempted])

    // Get category color
    const getCategoryColor = useCallback(() => {
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

    // Event handlers
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

    if (!challenge) return null

    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`
          group
          ${QUICK_CLASH_CLASSES.glassLight}
          rounded-2xl
          overflow-hidden
          border
          ${cardStyles.borderClass}
          ${cardStyles.shadowClass}
          relative
          transition-all duration-300
          hover:border-opacity-60
          hover:shadow-2xl
          hover:-translate-y-0.5
          backdrop-brightness-105
        `}
      >
        {/* Gradient Background Overlay */}
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

        {/* MAIN CONTENT CONTAINER */}
        <div className="relative z-10">
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* SECTION 1: HEADER - Status & Expiry (Compact) */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {challenge.status !== 'completed' && (
            <div
              className={`
              px-3 md:px-4 py-2 md:py-2.5
              border-b border-white/5
              flex items-center justify-between
              group-hover:bg-white/[0.03]
              transition-colors duration-200
            `}
            >
              <StatusBadge
                status={challenge.status}
                isChallenger={isChallenger}
                expiresAt={challenge.expiresAt}
              />
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* SECTION 2: PLAYER MATCHUP - Compact */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="px-3 md:px-4 py-3 md:py-3.5 space-y-2 md:space-y-2.5">
            {/* USER PLAYER CARD - With Score if Attempted */}
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
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Avatar */}
                <Avatar className="w-8 h-8 ring-2 ring-cyan-400/50 flex-shrink-0">
                  <AvatarImage src={userPlayer?.pic} alt={userPlayer?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-cyan-500 text-white font-bold text-xs">
                    {userPlayer?.name?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Status */}
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-semibold text-white truncate max-w-[100px]">
                    {userPlayer?.inGameName || userPlayer?.name}
                  </p>
                  <span className="text-xs text-cyan-300/80 font-medium">
                    You
                  </span>
                </div>
              </div>

              {/* Right section: Score + Total */}
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {/* Score - Show only if USER has attempted */}
                {(myAttempted || challenge?.status === 'completed') && (
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

                {/* Total Trophy Count */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-white/50 font-medium">
                    Total
                  </span>
                  <span className="text-sm text-yellow-400 font-bold">
                    {userPlayer?.quickClashTrophies || 0}
                  </span>
                </div>
              </div>
            </MotionDiv>

            {/* VS DIVIDER - Minimal */}
            <div className="flex items-center justify-center py-1.5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="px-2.5 text-xs text-white/50 font-medium">
                vs
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* CATEGORY BADGE + WIN PROBABILITY - Horizontal Line */}
            {challenge.status === 'active' && challenge.category && (
              <MotionDiv
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-center gap-3"
              >
                {/* Category Badge */}
                <div
                  className={`
                  flex items-center gap-1.5
                  px-3 py-1.5
                  rounded-full
                  border border-cyan-400/40
                  bg-cyan-500/10
                  backdrop-blur-sm
                  ${!myAttempted ? 'animate-pulse' : ''}
                `}
                >
                  <Target className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-cyan-300">
                    {challenge.category}
                  </span>
                </div>

                {/* Win Probability Badge - On Same Line */}
                {winProbability && (
                  <WinProbabilityBadge
                    probability={winProbability.probability}
                    dataQuality={winProbability.dataQuality}
                    sampleSize={winProbability.sampleSize}
                    size="sm"
                    showIcon={true}
                    variant="user"
                  />
                )}
              </MotionDiv>
            )}

            {/* OPPONENT PLAYER CARD - With Score if Attempted */}
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
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Avatar */}
                <Avatar className="w-8 h-8 ring-2 ring-white/20 flex-shrink-0">
                  <AvatarImage src={opponent?.pic} alt={opponent?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white font-bold text-xs">
                    {opponent?.name?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Status */}
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-semibold text-white truncate max-w-[100px]">
                    {opponent?.inGameName || opponent?.name}
                  </p>
                  <span className="text-xs text-white/50 font-medium">
                    Opponent
                  </span>
                </div>
              </div>

              {/* Right section: Score + Total */}
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {/* Score - Show only if OPPONENT has attempted */}
                {((isChallenger && challenge?.opponentAttempted) ||
                  (!isChallenger && challenge?.challengerAttempted) ||
                  challenge?.status === 'completed') && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-white/50 font-medium">
                      Score
                    </span>
                    <span className="text-sm font-bold text-white">
                      {isChallenger
                        ? challenge.opponentScore
                        : challenge.challengerScore}
                    </span>
                  </div>
                )}

                {/* Total Trophy Count */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-white/50 font-medium">
                    Total
                  </span>
                  <span className="text-sm text-yellow-400 font-bold">
                    {opponent?.quickClashTrophies || 0}
                  </span>
                </div>
              </div>
            </MotionDiv>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* SECTION 3: ACTIONS - Win Probability & Controls */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {challenge.status !== 'completed' && (
            <div className="px-3 md:px-4 pb-3 md:pb-3.5">
              {/* Top Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-2.5 md:mb-3" />

              {/* ACTION RENDERING LOGIC */}
              {myAttempted ? (
                /* STATE 1: Already Attempted - Show View Report */
                <MotionDiv
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={handleViewReport}
                    className={`
                      w-full
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
                    <FileText className="w-3.5 h-3.5 mr-2" />
                    {t('View Report')}
                  </Button>
                </MotionDiv>
              ) : challenge.status === 'pending' && !isChallenger ? (
                /* STATE 2: Pending - Show Accept/Decline */
                <MotionDiv
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-2"
                >
                  <Button
                    onClick={handleAccept}
                    className={`
                      flex-1
                      ${QUICK_CLASH_CLASSES.btnSuccess}
                      rounded-lg
                      font-semibold
                      py-2 md:py-2.5
                      text-xs md:text-sm
                      transition-all duration-200
                      hover:scale-105
                      hover:-translate-y-0.5
                      shadow-lg shadow-green-500/20
                      ${QUICK_CLASH_CLASSES.focusRing}
                    `}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {t('Accept')}
                  </Button>

                  <Button
                    onClick={handleDecline}
                    variant="outline"
                    className={`
                      flex-1
                      ${QUICK_CLASH_CLASSES.glassMedium}
                      ${QUICK_CLASH_CLASSES.textPrimary}
                      border border-red-400/40
                      hover:bg-red-500/10
                      hover:border-red-400/60
                      rounded-lg
                      font-semibold
                      py-2 md:py-2.5
                      text-xs md:text-sm
                      transition-all duration-200
                      ${QUICK_CLASH_CLASSES.focusRing}
                    `}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    {t('Decline')}
                  </Button>
                </MotionDiv>
              ) : challenge.status === 'active' && !myAttempted ? (
                /* STATE 3: Active & Ready - Compact Layout */
                <div className="space-y-2 md:space-y-2.5">
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                  {/* Trophy Stakes + Start Button Row */}
                  <MotionDiv
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    className="flex items-center justify-between gap-2"
                  >
                    {/* Trophy Display */}
                    <div className="flex-shrink-0">
                      <CompactTrophyStakeDisplay
                        potentialGain={potentialGain}
                        potentialLoss={potentialLoss}
                        size="sm"
                      />
                    </div>

                    {/* Start Button */}
                    <Button
                      onClick={handleStart}
                      className={`
                        flex-1
                        ${QUICK_CLASH_CLASSES.btnSuccess}
                        rounded-lg
                        font-bold
                        py-2 md:py-2.5
                        text-xs md:text-sm
                        transition-all duration-200
                        hover:scale-105
                        hover:-translate-y-1
                        shadow-lg shadow-green-500/30
                        hover:shadow-green-500/50
                        ${QUICK_CLASH_CLASSES.focusRing}
                      `}
                    >
                      <PlayCircle className="w-3.5 h-3.5 mr-1" />
                      {t('Start')}
                    </Button>
                  </MotionDiv>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </MotionDiv>
    )
  },
)

ChallengeItem.displayName = 'ChallengeItem'

export default ChallengeItem
