// components/quickClashComponents/team/SessionTeamDashboard.jsx
// View-only team dashboard for session players
// Reuses TeamCardV2 for consistent UI, with locked actions for modifications

import React, { useState, useEffect, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  Users,
  Lock,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'

// Reuse existing TeamCardV2
import TeamCardV2 from './TeamCardV2'

// Hooks
import usePlayer from '../../../hooks/usePlayer'

// Audio and haptics
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

// ============================================================================
// LOADING SKELETON
// ============================================================================

const TeamSkeleton = memo(() => (
  <div className="w-full px-3 pt-2">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 animate-pulse" />
        <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
    <div className="rounded-xl overflow-hidden bg-slate-900/40 border border-white/10 animate-pulse">
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white/10" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-white/10 rounded mb-1.5" />
          <div className="h-3 w-24 bg-white/5 rounded" />
        </div>
        <div className="h-6 w-16 bg-yellow-500/10 rounded" />
      </div>
    </div>
  </div>
))
TeamSkeleton.displayName = 'TeamSkeleton'

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyTeamState = memo(({ onCreateAccount }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center px-4"
  >
    <div className="relative w-20 h-20 mx-auto mb-6">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 opacity-20 blur-xl" />
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10">
        <Users className="w-8 h-8 text-purple-400" />
      </div>
    </div>
    <h2 className="text-xl font-bold text-white mb-2">No Team Yet</h2>
    <p className="text-sm text-white/50 mb-6 max-w-xs">
      You haven't joined a team. Create an account to start or join a team for team battles!
    </p>
    <motion.button
      onClick={onCreateAccount}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500"
      style={{ boxShadow: '0 4px 20px rgba(147, 51, 234, 0.3)' }}
    >
      <Sparkles className="w-4 h-4" />
      Create Free Account
    </motion.button>
    <p className="mt-4 text-xs text-white/30">
      Keep your progress and unlock team features
    </p>
  </motion.div>
))
EmptyTeamState.displayName = 'EmptyTeamState'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SessionTeamDashboard = memo(({ onCreateAccount }) => {
  const { player, isSession } = usePlayer()

  // State
  const [team, setTeam] = useState(null)
  const [permissions, setPermissions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch team data
  const fetchTeam = useCallback(async () => {
    if (!isSession || !player?.sessionId) return

    try {
      setError(null)
      const response = await axios.get('/api/play/my-team', {
        headers: { 'X-Session-Id': player.sessionId }
      })

      if (response.data.success) {
        setTeam(response.data.team)
        setPermissions(response.data.permissions)
      }
    } catch (err) {
      console.error('Failed to fetch team:', err)
      setError(err.response?.data?.message || 'Failed to load team')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isSession, player?.sessionId])

  // Initial fetch
  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTeam()
  }, [fetchTeam])

  // Handlers for locked actions - trigger signup
  const handleLockedAction = useCallback(() => {
    haptics.impact()
    quizAudioService.playButtonClick()
    if (onCreateAccount) {
      onCreateAccount()
    }
  }, [onCreateAccount])

  // Copy team code
  const handleCopyTeamCode = useCallback(async (code) => {
    haptics.selection()
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  // Transform session player team data to TeamCardV2 format
  const transformedTeam = team ? {
    ...team,
    members: team.members?.map(m => ({
      ...m,
      // TeamCardV2 expects member.user format
      user: m.user || (m.sessionPlayer ? {
        _id: m.sessionPlayer._id,
        name: m.sessionPlayer.inGameName,
        inGameName: m.sessionPlayer.inGameName,
        pic: null,
        quickClashTrophies: m.sessionPlayer.trophies || 1000,
      } : null),
    })).filter(m => m.user) || [],
  } : null

  // Get current player ID for TeamCardV2
  const currentPlayerId = team?.members?.find(m => m.isCurrentPlayer)?.sessionPlayer?._id ||
                          team?.members?.find(m => m.isCurrentPlayer)?.user?._id

  // Loading state
  if (loading) {
    return <TeamSkeleton />
  }

  // Error state
  if (error && !team) {
    return (
      <div className="w-full px-3 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load team</h3>
          <p className="text-sm text-white/50 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-gradient-to-r from-purple-500 to-pink-500">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>
    )
  }

  // No team - empty state
  if (!team) {
    return (
      <div className="w-full px-3 pt-2">
        <EmptyTeamState onCreateAccount={onCreateAccount} />
      </div>
    )
  }

  // Team view - reuse TeamCardV2
  return (
    <div className="w-full px-3 pt-2 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/15 border border-purple-500/30">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-indigo-200 bg-clip-text text-transparent">
            My Team
          </h2>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-9 h-9 p-0 hover:bg-white/5 border border-white/10"
        >
          <RefreshCw className={`w-4 h-4 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Reuse TeamCardV2 */}
      {transformedTeam && (
        <TeamCardV2
          team={transformedTeam}
          isLeader={false} // Session players can't manage team
          userId={currentPlayerId}
          onLeave={handleLockedAction} // Triggers signup
          onRemoveMember={handleLockedAction} // Triggers signup
          onTransferLeadership={handleLockedAction} // Triggers signup
          onInvite={handleLockedAction} // Triggers signup
          onCopyTeamCode={handleCopyTeamCode}
        />
      )}

      {/* Conversion prompt */}
      <div className="mt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Unlock all team features</p>
              <p className="text-xs text-white/50 mt-0.5">Invite friends, manage your team, and more</p>
            </div>
            <Button
              onClick={onCreateAccount}
              size="sm"
              className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
            >
              Sign Up
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
})

SessionTeamDashboard.displayName = 'SessionTeamDashboard'
export default SessionTeamDashboard
