// components/quickClashComponents/team/TeamBattleItem.jsx - WITH WIN PROBABILITY
import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  BarChart2,
  Trophy,
  Swords,
  Shield,
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import UI components
import TeamWinProbabilityDisplay from '../ui/TeamWinProbabilityDisplay' // NEW

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

const MotionDiv = motion.div

/**
 * TeamBattleItem - WITH WIN PROBABILITY INTEGRATION
 *
 * NEW FEATURE: Shows live team win probability with trend indicators
 * - Displays current probability vs initial probability
 * - Shows trend indicators (↑ ↓ →)
 * - Certainty score display
 * - Only shows for battles with winProbability data
 */
const TeamBattleItem = memo(({ battle, index, onEnter, onViewAnalysis }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  const responsiveConfig = useMemo(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      return {
        avatarSize: width < 768 ? 'w-8 h-8' : 'w-10 h-10',
        fontSize: width < 768 ? 'text-sm' : 'text-base',
        padding: width < 768 ? 'p-3' : 'p-4',
        buttonSize: width < 768 ? 'sm' : 'default',
        avatarMax: width < 768 ? 2 : width < 1024 ? 3 : 4,
      }
    }
    return {
      avatarSize: 'w-10 h-10',
      fontSize: 'text-base',
      padding: 'p-4',
      buttonSize: 'default',
      avatarMax: 4,
    }
  }, [])

  // Memoized calculations
  const { battleOutcome, completionPercentage, timeInfo, leftTeam, rightTeam } =
    useMemo(() => {
      if (!battle || !user) {
        return {
          battleOutcome: { label: 'ACTIVE', color: 'green', icon: Zap },
          completionPercentage: 0,
          timeInfo: { label: '', timeText: null },
          leftTeam: null,
          rightTeam: null,
        }
      }

      const isInTeamA = battle.teamAMembers?.some(
        member => member.user._id === user._id,
      )
      const userTeam = isInTeamA ? 'teamA' : 'teamB'

      const teams = {
        teamA: {
          data: battle.teamA,
          members: battle.teamAMembers,
          wins: battle.teamAWins,
          type: 'teamA',
        },
        teamB: {
          data: battle.teamB,
          members: battle.teamBMembers,
          wins: battle.teamBWins,
          type: 'teamB',
        },
      }
      const leftTeam = teams[userTeam]
      const rightTeam = teams[userTeam === 'teamA' ? 'teamB' : 'teamA']

      let battleOutcome
      if (battle.status === 'completed') {
        if (battle.winner === 'tie') {
          battleOutcome = { label: 'DRAW', color: 'yellow', icon: Shield }
        } else if (battle.winner === userTeam) {
          battleOutcome = { label: 'VICTORY', color: 'cyan', icon: Trophy }
        } else {
          battleOutcome = { label: 'DEFEAT', color: 'red', icon: Swords }
        }
      } else {
        battleOutcome = { label: 'ACTIVE', color: 'green', icon: Zap }
      }

      const totalChallenges = battle.challenges?.length || 0
      const completedChallenges =
        battle.challenges?.filter(
          challenge => challenge.teamACompleted && challenge.teamBCompleted,
        ).length || 0
      const completionPercentage =
        totalChallenges > 0
          ? Math.round((completedChallenges / totalChallenges) * 100)
          : 0

      let timeInfo = { label: '', timeText: null, color: 'text-gray-400' }
      const isBattleOver = battle.status !== 'active'

      if (isBattleOver) {
        timeInfo = {
          label: t('Ended'),
          timeText: null,
          color: 'text-gray-400',
        }
      } else if (battle.expiresAt) {
        timeInfo = {
          label: t('Expires'),
          timeText: formatDistanceToNow(new Date(battle.expiresAt), {
            addSuffix: true,
          }),
          color: 'text-blue-400',
        }
      }

      return {
        battleOutcome,
        completionPercentage,
        timeInfo,
        leftTeam,
        rightTeam,
      }
    }, [battle, user, t])

  // NEW: Extract win probability data
  const winProbability = useMemo(() => {
    if (!battle?.winProbability || !user) return null

    const isInTeamA = battle.teamAMembers?.some(
      member => member.user._id === user._id,
    )

    const myTeamProb = isInTeamA
      ? battle.winProbability.teamA
      : battle.winProbability.teamB

    if (!myTeamProb) return null

    // Calculate completed challenges count
    const totalChallenges = battle.challenges?.length || 4
    const completedChallenges =
      battle.challenges?.filter(
        challenge => challenge.teamACompleted && challenge.teamBCompleted,
      ).length || 0

    // Calculate certainty score from history
    let certaintyScore = 0
    if (myTeamProb.history && myTeamProb.history.length > 0) {
      const latestHistory = myTeamProb.history[myTeamProb.history.length - 1]
      certaintyScore = latestHistory.certaintyScore || 0
    }

    return {
      currentProbability: myTeamProb.current || myTeamProb.initial || 0.5,
      initialProbability: myTeamProb.initial || 0.5,
      certaintyScore,
      completedChallenges,
      totalChallenges,
    }
  }, [battle, user])

  // Card styling
  const cardStyles = useMemo(() => {
    const colorMap = {
      cyan: {
        border: 'border-cyan-500/60',
        header: 'bg-cyan-600',
        progress: 'bg-cyan-500',
      },
      red: {
        border: 'border-red-500/60',
        header: 'bg-red-600',
        progress: 'bg-red-500',
      },
      yellow: {
        border: 'border-yellow-500/60',
        header: 'bg-yellow-600',
        progress: 'bg-yellow-500',
      },
      green: {
        border: 'border-green-500/60',
        header: 'bg-green-600',
        progress: 'bg-green-500',
      },
    }

    return colorMap[battleOutcome.color] || colorMap.green
  }, [battleOutcome.color])

  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: index * 0.05,
        ease: 'easeOut',
      },
    },
  }

  // Render avatar group
  const renderAvatarGroup = (members, borderColor) => {
    if (!members || members.length === 0) return null

    const visibleMembers = members.slice(0, responsiveConfig.avatarMax)
    const remainingCount = Math.max(
      0,
      members.length - responsiveConfig.avatarMax,
    )

    return (
      <div className="flex -space-x-1">
        {visibleMembers.map(member => (
          <Avatar
            key={member.user._id}
            className={`
              ${responsiveConfig.avatarSize}
              border-2 ${borderColor}
              ${member.user._id === user?._id ? 'border-cyan-400' : ''}
              ${QUICK_CLASH_CLASSES.shadowSoft}
            `}
          >
            <AvatarImage
              src={member.user.pic}
              alt={member.user.name || member.user.inGameName}
            />
            <AvatarFallback className="bg-slate-700 text-white text-xs">
              {(member.user.name ||
                member.user.inGameName ||
                '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}

        {remainingCount > 0 && (
          <div
            className={`
              ${responsiveConfig.avatarSize}
              rounded-full border-2 border-white/30
              bg-slate-700/50 backdrop-blur-sm
              flex items-center justify-center
              text-white text-xs font-bold
            `}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }

  if (!battle || !leftTeam || !rightTeam) return null

  return (
    <MotionDiv
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className="w-full max-w-full min-w-0"
    >
      <div
        className={`
          ${QUICK_CLASH_CLASSES.glassMedium}
          rounded-2xl border-2 ${cardStyles.border}
          overflow-hidden relative
          ${QUICK_CLASH_CLASSES.shadowCyan}
          hover:shadow-xl hover:-translate-y-1
          transition-all duration-300
          backdrop-brightness-110
        `}
      >
        {/* Header */}
        <div
          className={`
            ${cardStyles.header} ${responsiveConfig.padding}
            flex justify-between items-center py-2
          `}
        >
          <Badge
            className={`
              flex items-center gap-2
              bg-white/20 text-white border-0
              px-2 py-1 text-xs font-bold
            `}
          >
            <battleOutcome.icon className="w-3 h-3" />
            {t(battleOutcome.label)}
          </Badge>

          <Badge
            className={`
              bg-black/30 text-white border-0
              px-2 py-1 text-xs
            `}
          >
            4v4
          </Badge>
        </div>

        {/* Progress Bar Section */}
        <div className={`${responsiveConfig.padding} pt-3`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" />
              <span className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
                {t('Progress')}
              </span>
            </div>
            <span className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
              {completionPercentage}%
            </span>
          </div>

          <Progress
            value={completionPercentage}
            className={`
              h-2 ${QUICK_CLASH_CLASSES.glassLight} rounded-full overflow-hidden
            `}
          />
        </div>

        {/* NEW: Win Probability Section (only for active battles) */}
        {winProbability && battle.status === 'active' && (
          <div className={`${responsiveConfig.padding} pt-2`}>
            <TeamWinProbabilityDisplay
              currentProbability={winProbability.currentProbability}
              initialProbability={winProbability.initialProbability}
              certaintyScore={winProbability.certaintyScore}
              completedChallenges={winProbability.completedChallenges}
              totalChallenges={winProbability.totalChallenges}
              size="md"
              showTrend={true}
              showCertainty={true}
            />
          </div>
        )}

        {/* Teams Section */}
        <div
          className={`${responsiveConfig.padding} py-4 flex justify-between items-center`}
        >
          {/* Left Team (User's team) */}
          <div className="flex flex-col items-center space-y-2 flex-1 min-w-0">
            <h4
              className={`
                ${responsiveConfig.fontSize} font-bold
                ${QUICK_CLASH_CLASSES.textPrimary}
                truncate text-center max-w-full
              `}
            >
              {leftTeam.data?.name ||
                `Team ${leftTeam.type === 'teamA' ? 'A' : 'B'}`}
            </h4>

            {renderAvatarGroup(leftTeam.members, 'border-blue-400')}

            <span className="text-xl font-black text-blue-400 leading-none">
              {leftTeam.wins || 0}
            </span>
          </div>

          {/* VS Section */}
          <div className="flex flex-col items-center space-y-2 px-3 min-w-0">
            <span
              className={`
                text-lg font-bold tracking-wider
                ${QUICK_CLASH_CLASSES.textMuted}
              `}
            >
              VS
            </span>

            <div className="flex flex-col space-y-1">
              {battle.status === 'completed' && (
                <Button
                  size={responsiveConfig.buttonSize}
                  onClick={e => {
                    e.stopPropagation()
                    onViewAnalysis?.(battle._id)
                  }}
                  className={`
                    ${QUICK_CLASH_CLASSES.btnSecondary}
                    text-xs min-w-[80px] h-8
                    ${QUICK_CLASH_CLASSES.focusRing}
                  `}
                >
                  <BarChart2 className="w-3 h-3 mr-1" />
                  {t('Analysis')}
                </Button>
              )}

              {battle.status === 'active' && (
                <Button
                  size={responsiveConfig.buttonSize}
                  onClick={e => {
                    e.stopPropagation()
                    onEnter?.(battle._id)
                  }}
                  className={`
                    ${QUICK_CLASH_CLASSES.btnSuccess}
                    text-xs min-w-[80px] h-8
                    ${QUICK_CLASH_CLASSES.focusRing}
                    ${QUICK_CLASH_CLASSES.transformHover}
                  `}
                >
                  {t('Enter')}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Team (Opponent team) */}
          <div className="flex flex-col items-center space-y-2 flex-1 min-w-0">
            <h4
              className={`
                ${responsiveConfig.fontSize} font-bold
                ${QUICK_CLASH_CLASSES.textPrimary}
                truncate text-center max-w-full
              `}
            >
              {rightTeam.data?.name ||
                `Team ${rightTeam.type === 'teamA' ? 'A' : 'B'}`}
            </h4>

            {renderAvatarGroup(rightTeam.members, 'border-red-400')}

            <span className="text-xl font-black text-red-400 leading-none">
              {rightTeam.wins || 0}
            </span>
          </div>
        </div>

        {/* Footer - Time Info */}
        {timeInfo.label && (
          <div
            className={`
              ${responsiveConfig.padding} py-2
              border-t border-white/10
              ${QUICK_CLASH_CLASSES.glassLight}
            `}
          >
            <div
              className={`
              flex items-center justify-center gap-1
              text-xs ${timeInfo.color}
            `}
            >
              <span>
                {timeInfo.timeText
                  ? `${timeInfo.label}: ${timeInfo.timeText}`
                  : timeInfo.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </MotionDiv>
  )
})

TeamBattleItem.displayName = 'TeamBattleItem'

export default TeamBattleItem
