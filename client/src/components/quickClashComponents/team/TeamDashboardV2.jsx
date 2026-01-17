// components/quickClashComponents/team/TeamDashboardV2.jsx
// Premium Team Dashboard with enterprise-level gaming UI/UX

import React, { useState, useEffect, useCallback, memo, useRef } from 'react'
import { motion } from 'framer-motion'
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
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '@/components/ui/button'

// Import sub-components
import TeamCardV2 from './TeamCardV2'
import CreateTeamModal from './CreateTeamModal'
import JoinTeamModal from './JoinTeamModal'
import EmptyTeamState from './EmptyTeamState'
import InviteUserModal from './InviteUserModal'
import SlotInviteModal from '../lobby/SlotInviteModal'
const InviteOptionsModal = React.lazy(() => import('../v2/TeamInvitePromptModal'))

// Import custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

// Notifications
import { notificationManager } from '../../../utils/notifications'

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

const TeamDashboardV2 = ({ isActive = true }) => {
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
  const [isInviteOptionsOpen, setIsInviteOptionsOpen] = useState(false)
  const [isSlotInviteModalOpen, setIsSlotInviteModalOpen] = useState(false)

  const { getSocket } = useSocket()
  const { setupTeamBattleSocketListeners } = useQuickClashTeamBattle()

  // Pending invitations state
  const [pendingInvitations, setPendingInvitations] = useState([])
  const [invitationsLoading, setInvitationsLoading] = useState(true)
  const [invitationsExpanded, setInvitationsExpanded] = useState(true)
  const [processingInviteId, setProcessingInviteId] = useState(null)

  // Fetch teams - defined first since other handlers depend on it
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

  // Fetch pending invitations
  const fetchPendingInvitations = useCallback(async () => {
    try {
      const response = await axios.get('/api/quickClash/team/invitations/pending')
      if (response.data.success) {
        setPendingInvitations(response.data.invitations || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending invitations:', error)
    } finally {
      setInvitationsLoading(false)
    }
  }, [])

  // Accept invitation
  const handleAcceptInvitation = useCallback(async (invitationId) => {
    setProcessingInviteId(invitationId)
    try {
      await axios.post(`/api/quickClash/team/invitation/${invitationId}/accept`)
      notificationManager.success('Invitation Accepted', 'You have joined the team!')
      // Refresh both invitations and teams
      await Promise.all([fetchPendingInvitations(), fetchTeams(true)])
    } catch (error) {
      notificationManager.error('Error', error.response?.data?.message || 'Failed to accept invitation')
    } finally {
      setProcessingInviteId(null)
    }
  }, [fetchPendingInvitations, fetchTeams])

  // Reject invitation
  const handleRejectInvitation = useCallback(async (invitationId) => {
    setProcessingInviteId(invitationId)
    try {
      await axios.post(`/api/quickClash/team/invitation/${invitationId}/reject`)
      notificationManager.info('Invitation Declined', 'You declined the team invitation')
      await fetchPendingInvitations()
    } catch (error) {
      notificationManager.error('Error', error.response?.data?.message || 'Failed to reject invitation')
    } finally {
      setProcessingInviteId(null)
    }
  }, [fetchPendingInvitations])

  // Socket setup
  useEffect(() => {
    setupTeamBattleSocketListeners()

    const socket = getSocket()
    if (socket) {
      const handleTeamUpdate = () => fetchTeams(true)

      // Handle member joined - show toast notification
      const handleMemberJoined = (data) => {
        const playerName = data.userInGameName || data.userName || 'A player'
        const teamName = data.teamName || 'your team'
        notificationManager.matchmaking(
          'New Teammate!',
          `${playerName} joined ${teamName}`
        )
        fetchTeams(true)
      }

      // Handle member removal separately to show toast notification
      const handleMemberRemoved = (data) => {
        if (data.isCurrentUser) {
          // Current user was removed from a team - show toast notification
          notificationManager.error(
            'Removed from Team',
            data.teamName ? `You were removed from ${data.teamName}` : 'You were removed from the team'
          )
        }
        // Refresh teams in either case
        fetchTeams(true)
      }

      // Handle leadership transferred - show toast notification
      const handleLeadershipTransferred = (data) => {
        const teamName = data.teamName || 'the team'
        const isCurrentUserNewLeader = data.newLeaderId === user?._id

        if (isCurrentUserNewLeader) {
          // Current user is the new leader - show personalized message
          notificationManager.success(
            'You\'re the Leader!',
            `You are now the leader of ${teamName}`
          )
        } else {
          // Someone else is the new leader
          const newLeaderName = data.newLeaderName || 'Someone'
          notificationManager.success(
            'New Leader!',
            `${newLeaderName} is now the leader of ${teamName}`
          )
        }
        fetchTeams(true)
      }

      // Handle new invitation received - refresh invitations
      const handleInvitationReceived = () => {
        fetchPendingInvitations()
      }

      socket.on('quickClash:teamInvitationAccepted', handleTeamUpdate)
      socket.on('quickClash:teamMemberJoined', handleMemberJoined)
      socket.on('quickClash:teamMemberLeft', handleTeamUpdate)
      socket.on('quickClash:teamMemberRemoved', handleMemberRemoved)
      socket.on('quickClash:teamLeadershipTransferred', handleLeadershipTransferred)
      socket.on('quickClash:teamInvitationReceived', handleInvitationReceived)

      return () => {
        socket.off('quickClash:teamInvitationAccepted', handleTeamUpdate)
        socket.off('quickClash:teamMemberJoined', handleMemberJoined)
        socket.off('quickClash:teamMemberLeft', handleTeamUpdate)
        socket.off('quickClash:teamMemberRemoved', handleMemberRemoved)
        socket.off('quickClash:teamLeadershipTransferred', handleLeadershipTransferred)
        socket.off('quickClash:teamInvitationReceived', handleInvitationReceived)
      }
    }
  }, [setupTeamBattleSocketListeners, fetchTeams, fetchPendingInvitations, getSocket])

  // Initial fetch - invitations always fetched fresh, teams use cache
  useEffect(() => {
    fetchTeams()
    // Always fetch invitations fresh to ensure we have the latest
    fetchPendingInvitations()
  }, [fetchTeams, fetchPendingInvitations])

  // Refresh invitations when tab becomes active (user switches to Teams tab)
  useEffect(() => {
    if (isActive) {
      console.log('[TeamDashboardV2] Tab became active, refreshing invitations')
      fetchPendingInvitations()
    }
  }, [isActive, fetchPendingInvitations])

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
    quizAudioService.playButtonClick() // Sound for copy action
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

  // Stable handler for opening invite options modal (dual flow)
  const handleInviteClick = useCallback((team) => {
    setSelectedTeam(team)
    setIsInviteOptionsOpen(true)
  }, [])

  // Handler for choosing "Share Link" option
  const handleInviteViaLink = useCallback(() => {
    setIsInviteOptionsOpen(false)
    setIsSlotInviteModalOpen(true)
  }, [])

  // Handler for choosing "In-App Invite" option
  const handleInviteInApp = useCallback(() => {
    setIsInviteOptionsOpen(false)
    setIsInviteModalOpen(true)
  }, [])

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
    <div className="w-full px-3 md:px-4 pt-2 pb-4">
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

      {/* ===== ACTION BUTTONS - Only show when user has teams ===== */}
      {teams.length > 0 && (
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Button
              onClick={() => { quizAudioService.playButtonClick(); setIsCreateModalOpen(true) }}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('Create Team')}
            </Button>
          </div>

          <div className="flex-1">
            <Button
              onClick={() => { quizAudioService.playButtonClick(); setIsJoinModalOpen(true) }}
              variant="outline"
              className="w-full h-11 bg-transparent border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 font-semibold active:scale-95 transition-transform"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t('Join Team')}
            </Button>
          </div>
        </div>
      )}

      {/* ===== PENDING INVITATIONS - Sleek inline design ===== */}
      {pendingInvitations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="space-y-2">
            {pendingInvitations.map((invite) => (
              <div
                key={invite._id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/30 transition-all"
              >
                {/* Mail icon indicator */}
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                </div>

                {/* Invite info - with member count */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white/90 text-sm font-medium truncate leading-tight">
                      {invite.invitationData?.teamName || 'Team'}
                    </p>
                    {invite.invitationData?.memberCount && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/30 text-purple-300 rounded flex-shrink-0">
                        {invite.invitationData.memberCount}/{invite.invitationData.maxMembers || 4}
                      </span>
                    )}
                  </div>
                  <p className="text-purple-300/60 text-xs truncate">
                    {t('from')} {invite.invitationData?.inviterName || 'Someone'}
                  </p>
                </div>

                {/* Action buttons - compact */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    disabled={processingInviteId === invite._id}
                    onClick={() => handleRejectInvitation(invite._id)}
                    className="w-7 h-7 rounded-lg bg-red-500/15 hover:bg-red-500/30 border border-red-500/25 flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    {processingInviteId === invite._id ? (
                      <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </button>
                  <button
                    disabled={processingInviteId === invite._id}
                    onClick={() => handleAcceptInvitation(invite._id)}
                    className="w-7 h-7 rounded-lg bg-green-500/15 hover:bg-green-500/30 border border-green-500/25 flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    {processingInviteId === invite._id ? (
                      <Loader2 className="w-3.5 h-3.5 text-green-400 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ===== TEAMS CONTENT ===== */}
      {teams.length === 0 ? (
        <EmptyTeamState
          onCreateTeam={() => setIsCreateModalOpen(true)}
          onJoinTeam={() => setIsJoinModalOpen(true)}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {teams.map((team) => (
            <TeamCardV2
              key={team._id}
              team={team}
              isLeader={isUserTeamLeader(team)}
              userId={user._id}
              onLeave={handleLeaveTeam}
              onRemoveMember={handleRemoveMember}
              onTransferLeadership={handleTransferLeadership}
              onInvite={handleInviteClick}
              onCopyTeamCode={copyTeamCode}
            />
          ))}
        </div>
      )}

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

      {/* Invite Options Modal - Dual flow: Share Link vs In-App */}
      {selectedTeam && (
        <React.Suspense fallback={null}>
          <InviteOptionsModal
            isOpen={isInviteOptionsOpen}
            onClose={() => {
              setIsInviteOptionsOpen(false)
              setSelectedTeam(null)
            }}
            onInviteViaLink={handleInviteViaLink}
            onInviteInApp={handleInviteInApp}
            team={selectedTeam}
          />
        </React.Suspense>
      )}

      {/* Slot Invite Modal - Share link flow */}
      {selectedTeam && isSlotInviteModalOpen && (
        <SlotInviteModal
          inviteUrl={`${window.location.origin}/play/join/${selectedTeam.teamCode}`}
          teamCode={selectedTeam.teamCode}
          onClose={() => {
            setIsSlotInviteModalOpen(false)
            setSelectedTeam(null)
          }}
        />
      )}
    </div>
  )
}

export default memo(TeamDashboardV2)
