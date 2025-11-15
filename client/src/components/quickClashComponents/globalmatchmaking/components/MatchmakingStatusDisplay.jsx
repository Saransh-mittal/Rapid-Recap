// components/quickClashComponents/globalmatchmaking/components/MatchmakingStatusDisplay.jsx
// REDESIGNED - Enhanced state orchestration with smooth transitions
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// Sub-components for different states
import BattleReadyDisplay from './BattleReadyDisplay'
import BattleCreationDisplay from './BattleCreationDisplay'
import MatchmakingSearchDisplay from './MatchmakingSearchDisplay'
import TeamSelectionIntro from './TeamSelectionIntro'

/**
 * MatchmakingStatusDisplay - REDESIGNED
 *
 * Design Philosophy: Seamless state transitions with contextual information
 * - Each state has its own optimized component
 * - Badge info provides quick visual identification
 * - Smooth animations between state changes
 */
const MatchmakingStatusDisplay = React.memo(
  ({
    inMatchmaking,
    battleReady,
    battleCreationStatus,
    battleCreationError,
    matchmakingTime,
    teamName,
    joinType,
    originalTeam,
    statusUpdates,
    formatMatchmakingTime,
  }) => {
    const { t } = useTranslation('QuickClash')

    // Memoized badge configuration for visual consistency
    const badgeInfo = useMemo(() => {
      // Solo player states
      if (joinType === 'solo' && inMatchmaking && !battleReady) {
        return {
          icon: 'User',
          color: 'emerald',
          text: t('Solo Player'),
          tooltip: t('You joined matchmaking as an individual player'),
          bgClass: 'bg-emerald-500/10',
          borderClass: 'border-emerald-400/40',
          textClass: 'text-emerald-300',
        }
      }
      if (joinType === 'solo' && battleReady) {
        return {
          icon: 'UserPlus',
          color: 'teal',
          text: t('Auto-Team Member'),
          tooltip: t('You were assigned to an auto-formed team'),
          bgClass: 'bg-teal-500/10',
          borderClass: 'border-teal-400/40',
          textClass: 'text-teal-300',
        }
      }

      // Source team states
      if (joinType === 'sourceTeam' && originalTeam) {
        return {
          icon: 'Users',
          color: 'purple',
          text: originalTeam.name || t('Team Member'),
          tooltip: t('Your original team was merged into a larger team'),
          bgClass: 'bg-purple-500/10',
          borderClass: 'border-purple-400/40',
          textClass: 'text-purple-300',
        }
      }

      // Regular team states
      if (joinType === 'regular' && teamName) {
        return {
          icon: 'Users',
          color: 'blue',
          text: teamName,
          tooltip: t('You joined matchmaking with your team'),
          bgClass: 'bg-blue-500/10',
          borderClass: 'border-blue-400/40',
          textClass: 'text-blue-300',
        }
      }

      // Default state
      return {
        icon: 'Users',
        color: 'gray',
        text: teamName || t('Player'),
        tooltip: t('Matchmaking information'),
        bgClass: 'bg-gray-500/10',
        borderClass: 'border-gray-400/40',
        textClass: 'text-gray-300',
      }
    }, [joinType, inMatchmaking, battleReady, originalTeam, teamName, t])

    // Handle battle creation states
    if (battleCreationStatus === 'creating') {
      return <BattleCreationDisplay status="creating" error={null} />
    }

    if (battleCreationStatus === 'failed') {
      return (
        <BattleCreationDisplay status="failed" error={battleCreationError} />
      )
    }

    // Battle ready state
    if (battleReady) {
      return (
        <BattleReadyDisplay
          battleReady={battleReady}
          matchmakingTime={matchmakingTime}
          badgeInfo={badgeInfo}
          formatMatchmakingTime={formatMatchmakingTime}
        />
      )
    }

    // Currently searching state
    if (inMatchmaking) {
      return (
        <MatchmakingSearchDisplay
          matchmakingTime={matchmakingTime}
          badgeInfo={badgeInfo}
          joinType={joinType}
          originalTeam={originalTeam}
          statusUpdates={statusUpdates}
          formatMatchmakingTime={formatMatchmakingTime}
        />
      )
    }

    // Default: Team selection intro
    return <TeamSelectionIntro />
  },
)

MatchmakingStatusDisplay.displayName = 'MatchmakingStatusDisplay'

export default MatchmakingStatusDisplay
