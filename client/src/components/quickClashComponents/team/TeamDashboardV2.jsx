// components/quickClashComponents/team/TeamDashboardV2.jsx
// Premium Team Dashboard with enterprise-level gaming UI/UX

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useSelector } from 'react-redux'
import {
  Users,
  RefreshCw,
  PlusCircle,
  UserPlus,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '@/components/ui/button'

// Import sub-components
import TeamCardV2 from './TeamCardV2'
import CreateTeamModal from './CreateTeamModal'
import JoinTeamModal from './JoinTeamModal'
import EmptyTeamState from './EmptyTeamState'
import InviteUserModal from './InviteUserModal'

// Import custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

// ============================================================================
// LOADING SKELETON
// ============================================================================

const TeamCardSkeleton = memo(() => (
  <div className="w-full rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-white/10 animate-pulse">
    {/* Header */}
    <div className="px-4 py-4 bg-gradient-to-r from-cyan-500/5 to-transparent border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/10" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-white/10 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded mt-2" />
        </div>
        <div className="h-8 w-16 bg-yellow-500/10 rounded-lg" />
      </div>
    </div>

    {/* Code section */}
    <div className="px-4 py-3 border-b border-white/5">
      <div className="flex gap-2 mb-3">
        <div className="h-4 w-20 bg-white/5 rounded" />
        <div className="h-4 w-16 bg-white/10 rounded" />
      </div>
      <div className="h-9 w-full bg-cyan-500/10 rounded-lg" />
    </div>

    {/* Members */}
    <div className="px-4 py-3 space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="h-4 w-24 bg-white/5 rounded" />
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="px-4 py-3 border-t border-white/5">
      <div className="h-4 w-20 bg-white/5 rounded" />
    </div>
  </div>
))
TeamCardSkeleton.displayName = 'TeamCardSkeleton'

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const TeamDashboardV2 = () => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  // State
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const initialLoadDone = useRef(false)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const { getSocket } = useSocket()
  const { setupTeamBattleSocketListeners } = useQuickClashTeamBattle()

  // Fetch teams
  const fetchTeams = useCallback(async (force = false) => {
    if (initialLoadDone.current && !force) return

    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/api/quickClash/teams')
      setTeams(response.data.teams || [])
      initialLoadDone.current = true
    } catch (error) {
      console.error('Error fetching teams:', error)
      setError(error.response?.data?.message || 'Failed to fetch teams')
    } finally {
      setLoading(false)
    }
  }, [])

  // Socket setup
  useEffect(() => {
    setupTeamBattleSocketListeners()

    const socket = getSocket()
    if (socket) {
      const handleTeamUpdate = () => fetchTeams(true)

      socket.on('quickClash:teamInvitationAccepted', handleTeamUpdate)
      socket.on('quickClash:teamMemberJoined', handleTeamUpdate)
      socket.on('quickClash:teamMemberLeft', handleTeamUpdate)
      socket.on('quickClash:teamMemberRemoved', handleTeamUpdate)
      socket.on('quickClash:teamLeadershipTransferred', handleTeamUpdate)

      return () => {
        socket.off('quickClash:teamInvitationAccepted', handleTeamUpdate)
        socket.off('quickClash:teamMemberJoined', handleTeamUpdate)
        socket.off('quickClash:teamMemberLeft', handleTeamUpdate)
        socket.off('quickClash:teamMemberRemoved', handleTeamUpdate)
        socket.off('quickClash:teamLeadershipTransferred', handleTeamUpdate)
      }
    }
  }, [setupTeamBattleSocketListeners, fetchTeams, getSocket])

  // Initial fetch
  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTeams(true)
    setRefreshing(false)
  }, [fetchTeams])

  const handleCreateTeam = useCallback(async teamData => {
    try {
      await axios.post('/api/quickClash/team', teamData)
      fetchTeams(true)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }, [fetchTeams])

  const handleJoinTeam = useCallback(async teamCode => {
    try {
      await axios.post('/api/quickClash/team/join', { teamCode })
      fetchTeams(true)
      setIsJoinModalOpen(false)
    } catch (error) {
      console.error('Failed to join team:', error)
    }
  }, [fetchTeams])

  const handleLeaveTeam = useCallback(async teamId => {
    try {
      await axios.post(`/api/quickClash/team/${teamId}/leave`)
      fetchTeams(true)
    } catch (error) {
      console.error('Failed to leave team:', error)
    }
  }, [fetchTeams])

  const handleRemoveMember = useCallback(async (teamId, memberId) => {
    try {
      await axios.post(`/api/quickClash/team/${teamId}/remove`, { memberId })
      fetchTeams(true)
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }, [fetchTeams])

  const handleTransferLeadership = useCallback(async (teamId, newLeaderId) => {
    try {
      await axios.post(`/api/quickClash/team/${teamId}/transfer-leadership`, { newLeaderId })
      fetchTeams(true)
    } catch (error) {
      console.error('Failed to transfer leadership:', error)
    }
  }, [fetchTeams])

  const handleInviteUser = useCallback(async (teamId, inviteeId) => {
    try {
      await axios.post(`/api/quickClash/team/${teamId}/invite`, { inviteeId })
      setIsInviteModalOpen(false)
      fetchTeams(true)
    } catch (error) {
      console.error('Failed to invite user:', error)
    }
  }, [fetchTeams])

  const copyTeamCode = useCallback(async code => {
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
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [])

  // Check if user is team leader
  const isUserTeamLeader = useCallback(team => {
    return team?.members.some(
      member => member?.user?._id === user?._id && member?.role === 'leader'
    )
  }, [user?._id])

  // Memoized handlers for team cards
  const teamCardHandlers = useMemo(() => ({
    onLeave: handleLeaveTeam,
    onRemoveMember: teamId => memberId => handleRemoveMember(teamId, memberId),
    onTransferLeadership: teamId => newLeaderId => handleTransferLeadership(teamId, newLeaderId),
    onInvite: team => () => {
      setSelectedTeam(team)
      setIsInviteModalOpen(true)
    },
    onCopyTeamCode: copyTeamCode,
  }), [handleLeaveTeam, handleRemoveMember, handleTransferLeadership, copyTeamCode])

  // Loading state - only on first load
  if (loading && !refreshing && teams.length === 0) {
    return (
      <div className="w-full px-3 md:px-4 pt-2">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 animate-pulse" />
            <div className="h-6 w-28 bg-white/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex gap-3 mb-6">
          <div className="h-10 flex-1 bg-cyan-500/20 rounded-lg animate-pulse" />
          <div className="h-10 flex-1 bg-blue-500/10 rounded-lg animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <TeamCardSkeleton />
          <TeamCardSkeleton />
        </div>
      </div>
    )
  }

  // Error state
  if (error && !teams.length) {
    return (
      <div className="w-full px-3 md:px-4 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('Failed to load teams')}</h3>
          <p className="text-white/50 text-sm mb-4">{error}</p>
          <Button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Try Again')}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full px-3 md:px-4 pt-2 pb-4"
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/15 border border-cyan-500/30">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
            {t('My Teams')}
          </h2>
          {teams.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
              {teams.length}
            </span>
          )}
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

      {/* ===== ACTION BUTTONS ===== */}
      <div className="flex gap-3 mb-6">
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {t('Create Team')}
          </Button>
        </motion.div>

        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setIsJoinModalOpen(true)}
            variant="outline"
            className="w-full h-11 bg-transparent border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t('Join Team')}
          </Button>
        </motion.div>
      </div>

      {/* ===== TEAMS CONTENT ===== */}
      <AnimatePresence mode="wait">
        {teams.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EmptyTeamState
              onCreateTeam={() => setIsCreateModalOpen(true)}
              onJoinTeam={() => setIsJoinModalOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="teams"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
          >
            {teams.map((team, index) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
              >
                <TeamCardV2
                  team={team}
                  isLeader={isUserTeamLeader(team)}
                  userId={user._id}
                  onLeave={teamCardHandlers.onLeave}
                  onRemoveMember={teamCardHandlers.onRemoveMember(team._id)}
                  onTransferLeadership={teamCardHandlers.onTransferLeadership(team._id)}
                  onInvite={teamCardHandlers.onInvite(team)}
                  onCopyTeamCode={teamCardHandlers.onCopyTeamCode}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MODALS ===== */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTeam}
      />

      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinTeam}
      />

      {selectedTeam && (
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          teamId={selectedTeam._id}
          teamName={selectedTeam.name}
          onInvite={inviteeId => handleInviteUser(selectedTeam._id, inviteeId)}
        />
      )}
    </motion.div>
  )
}

export default memo(TeamDashboardV2)
