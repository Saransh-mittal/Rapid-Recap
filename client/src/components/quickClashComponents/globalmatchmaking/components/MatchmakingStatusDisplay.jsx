// components/quickClashComponents/globalmatchmaking/components/MatchmakingStatusDisplay.jsx
import React, { useMemo } from 'react'
import { VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

// Import sub-components for different states
import BattleReadyDisplay from './BattleReadyDisplay'
import BattleCreationDisplay from './BattleCreationDisplay'
import MatchmakingSearchDisplay from './MatchmakingSearchDisplay'
import TeamSelectionIntro from './TeamSelectionIntro'

/**
 * Main status display component that renders appropriate UI based on matchmaking state
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

    // Memoize badge info calculation
    const badgeInfo = useMemo(() => {
      if (joinType === 'solo' && inMatchmaking && !battleReady) {
        return {
          icon: 'User',
          color: 'blue',
          text: t('Solo Player'),
          tooltip: t('You joined matchmaking as an individual player'),
        }
      }
      if (joinType === 'solo' && battleReady) {
        return {
          icon: 'UserPlus',
          color: 'teal',
          text: t('Auto-Team Member'),
          tooltip: t('You were assigned to an auto-formed team'),
        }
      }
      if (joinType === 'sourceTeam' && originalTeam) {
        return {
          icon: 'Users',
          color: 'purple',
          text: originalTeam.name || t('Team Member'),
          tooltip: t('Your original team was merged into a larger team'),
        }
      }
      if (joinType === 'regular' && teamName) {
        return {
          icon: 'Users',
          color: 'purple',
          text: teamName,
          tooltip: t('You joined matchmaking with your team'),
        }
      }
      return {
        icon: 'Users',
        color: 'gray',
        text: teamName || t('Player'),
        tooltip: t('Matchmaking information'),
      }
    }, [joinType, inMatchmaking, battleReady, originalTeam, teamName, t])

    // Handle different battle creation states
    if (battleCreationStatus === 'creating') {
      return <BattleCreationDisplay status="creating" error={null} />
    }

    if (battleCreationStatus === 'failed') {
      return (
        <BattleCreationDisplay status="failed" error={battleCreationError} />
      )
    }

    // If battle is ready, show battle ready UI
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

    // If currently in matchmaking, show search display
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

    // Default: Not in matchmaking, show team selection intro
    return <TeamSelectionIntro />
  },
)

MatchmakingStatusDisplay.displayName = 'MatchmakingStatusDisplay'

export default MatchmakingStatusDisplay
