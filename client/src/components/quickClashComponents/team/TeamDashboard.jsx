// components/quickClashComponents/team/TeamDashboard.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useSelector } from 'react-redux'
import {
  Users,
  Trophy,
  UserPlus,
  Copy,
  Shield,
  RefreshCw,
  PlusCircle,
  LogOut,
  Loader2,
} from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import sub-components
import CreateTeamModal from './CreateTeamModal'
import JoinTeamModal from './JoinTeamModal'
import EmptyTeamState from './EmptyTeamState'
import InviteUserModal from './InviteUserModal'

// Import custom hook for team operations
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

// You'll need to install these components:
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add badge
// npx shadcn-ui@latest add avatar
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Haptic feedback
import { haptics } from '../../../utils/haptics'

const MotionDiv = motion.div

// NO staggered animations - causes stutter on tab switch
const containerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
}

const itemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
}

/**
 * Enhanced Team Card Component - Converted to Tailwind CSS
 */
const TeamCard = memo(
  ({
    team,
    isLeader,
    userId,
    onLeave,
    onRemoveMember,
    onInvite,
    onCopyTeamCode,
  }) => {
    const { t } = useTranslation('QuickClash')

    // Memoize computed values - EXACTLY as original
    const teamMembers = useMemo(() => team.members || [], [team.members])
    const isTeamFull = useMemo(
      () => teamMembers.length >= team.maxMembers,
      [teamMembers.length, team.maxMembers],
    )
    const emptySlots = useMemo(
      () => team.maxMembers - teamMembers.length,
      [team.maxMembers, teamMembers.length],
    )

    // Memoized event handlers - EXACTLY as original + haptics
    const handleCopyCode = useCallback(
      () => {
        haptics.selection() // Tactile feedback
        onCopyTeamCode(team.teamCode)
      },
      [onCopyTeamCode, team.teamCode],
    )
    const handleLeave = useCallback(
      () => {
        haptics.warning() // Tactile feedback for leaving
        onLeave(team?._id)
      },
      [onLeave, team?._id],
    )
    const handleInvite = useCallback(() => {
      haptics.light() // Tactile feedback
      onInvite()
    }, [onInvite])

    return (
      <div
        className={`
          w-full max-w-md mx-auto rounded-2xl overflow-hidden
          ${QUICK_CLASH_CLASSES.glassMedium}
          border border-white/20
          ${QUICK_CLASH_CLASSES.shadowSoft}
          transition-all duration-300
          hover:-translate-y-1 hover:shadow-xl
          backdrop-brightness-110
        `}
      >
        {/* Team Header */}
        <div
          className={`
          ${QUICK_CLASH_CLASSES.glassMedium}
          px-4 py-3 border-b border-white/10
          bg-gradient-to-r from-cyan-500/10 to-blue-500/10
        `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-cyan-400" />
              <h3
                className={`
                text-xl font-bold
                ${QUICK_CLASH_CLASSES.textGradientCyan}
              `}
              >
                {team.name}
              </h3>
            </div>

            <div
              className={`
              flex items-center justify-center
              ${QUICK_CLASH_CLASSES.glassMedium}
              rounded-lg px-3 py-1.5
              border border-yellow-500/30
              ${QUICK_CLASH_CLASSES.shadowSoft}
            `}
            >
              <Trophy className="w-4 h-4 text-yellow-400 mr-1.5" />
              <span className="text-yellow-300 font-bold text-sm">
                {team.avgTrophies || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="px-4 py-2.5 flex gap-2 flex-wrap">
          {isLeader && (
            <Badge
              className={`
              ${QUICK_CLASH_CLASSES.badgeCyan}
              font-bold px-3 py-1
            `}
            >
              {t('LEADER')}
            </Badge>
          )}
          {team.isInMatch && (
            <Badge
              className={`
              ${QUICK_CLASH_CLASSES.statusActive}
              font-bold px-3 py-1
            `}
            >
              {t('IN BATTLE')}
            </Badge>
          )}
        </div>

        {/* Team Code and Invite Section */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${QUICK_CLASH_CLASSES.textMuted}`}>
                {t('Team Code')}:
              </span>
              <span
                className={`
                text-sm font-bold tracking-wider
                ${QUICK_CLASH_CLASSES.textPrimary}
              `}
              >
                {team.teamCode}
              </span>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyCode}
              className={`
                w-8 h-8 p-0
                ${QUICK_CLASH_CLASSES.glassMedium}
                hover:bg-blue-500/10 border border-white/20
                ${QUICK_CLASH_CLASSES.focusRing}
              `}
              aria-label={t('Copy Team Code')}
            >
              <Copy className="w-4 h-4 text-blue-400" />
            </Button>
          </div>

          {isLeader && (
            <Button
              size="sm"
              onClick={handleInvite}
              disabled={isTeamFull || team.isInMatch}
              className={`
                w-full
                ${
                  isTeamFull || team.isInMatch
                    ? `${QUICK_CLASH_CLASSES.glassMedium} border border-white/20 text-white/50 cursor-not-allowed`
                    : `${QUICK_CLASH_CLASSES.btnSecondary} ${QUICK_CLASH_CLASSES.focusRing}`
                }
                transition-all duration-200
              `}
            >
              {isTeamFull
                ? t('Team Full')
                : team.isInMatch
                ? t('In Battle')
                : t('Invite Player')}
            </Button>
          )}
        </div>

        {/* Members Section */}
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <h4
              className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textMuted}`}
            >
              {t('Members')} ({teamMembers.length}/{team.maxMembers})
            </h4>
          </div>

          <div className="space-y-1">
            {teamMembers.map(member => (
              <MemberRow
                key={member.user._id}
                member={member}
                userId={userId}
                isLeader={isLeader}
                isInMatch={team.isInMatch}
                onRemove={onRemoveMember}
              />
            ))}
          </div>

          {/* Empty slots indicator */}
          {!isTeamFull && (
            <div className="mt-2 space-y-1">
              {Array.from({ length: emptySlots }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className={`
                    flex items-center py-2.5 px-3 rounded-lg
                    ${QUICK_CLASH_CLASSES.glassLight}
                    border-2 border-dashed border-white/20
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${QUICK_CLASH_CLASSES.glassMedium}
                    `}
                    >
                      <UserPlus className="w-4 h-4 text-white/40" />
                    </div>
                    <span
                      className={`text-sm italic ${QUICK_CLASH_CLASSES.textMuted}`}
                    >
                      {isLeader
                        ? t('Invite a player')
                        : t('Waiting for player')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Footer */}
        <div
          className={`
          flex justify-between items-center px-4 py-3
          border-t border-white/10
          ${QUICK_CLASH_CLASSES.glassLight}
        `}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLeave}
            disabled={team.isInMatch}
            className={`
              text-red-400 hover:text-red-300 hover:bg-red-500/10
              ${QUICK_CLASH_CLASSES.focusRing}
              transition-all duration-200
            `}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('Leave')}
          </Button>

          <div className="flex items-center gap-2">
            <span className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
              {t('Avg Trophies')}:
            </span>
            <span
              className={`text-xs font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
            >
              {team.avgTrophies || 0}
            </span>
          </div>
        </div>
      </div>
    )
  },
)

/**
 * Enhanced Member Row Component - Converted to Tailwind CSS
 */
const MemberRow = memo(({ member, userId, isLeader, isInMatch, onRemove }) => {
  const { t } = useTranslation('QuickClash')

  const isCurrentUser = member.user._id === userId
  const handleRemove = useCallback(
    () => onRemove(member.user._id),
    [onRemove, member.user._id],
  )

  return (
    <div
      className={`
        flex items-center justify-between py-2.5 px-3 rounded-lg
        ${
          isCurrentUser
            ? `${QUICK_CLASH_CLASSES.glassMedium} border border-cyan-500/30 bg-cyan-500/15`
            : 'hover:bg-white/5'
        }
        transition-all duration-200
      `}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={member.user.pic}
            alt={member.user.name || member.user.inGameName}
          />
          <AvatarFallback className="bg-cyan-600 text-white text-sm font-bold">
            {(member.user.name ||
              member.user.inGameName ||
              '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`
                text-sm font-medium truncate
                ${
                  isCurrentUser
                    ? 'text-cyan-300'
                    : QUICK_CLASH_CLASSES.textPrimary
                }
              `}
            >
              {member.user.name || member.user.inGameName}
            </span>
            {isCurrentUser && (
              <Badge
                className={`
                ${QUICK_CLASH_CLASSES.badgeCyan}
                text-xs px-2 py-0.5
              `}
              >
                {t('YOU')}
              </Badge>
            )}
          </div>

          {member.role === 'leader' && (
            <Badge
              className={`
              ${QUICK_CLASH_CLASSES.badgeCyan}
              text-xs px-2 py-0.5
            `}
            >
              {t('LEADER')}
            </Badge>
          )}
        </div>
      </div>

      {isLeader && !isCurrentUser && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          disabled={isInMatch}
          className={`
            text-red-400 hover:text-red-300 hover:bg-red-500/10
            ${QUICK_CLASH_CLASSES.focusRing}
            transition-all duration-200 text-xs px-2 py-1
          `}
        >
          {t('Remove')}
        </Button>
      )}
    </div>
  )
})

/**
 * Enhanced Team Dashboard - Converted to Tailwind CSS with blue-cyan theme
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced team card design with glassmorphic effects
 * - Maintained all original functionality and performance optimizations
 * - Improved responsive design with better mobile experience
 * - Enhanced visual hierarchy and call-to-action buttons
 * - Preserved all socket integration and team management features
 */
const TeamDashboard = () => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  // Responsive configuration
  const responsiveConfig = useMemo(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      return {
        buttonSize: width < 768 ? 'sm' : 'default',
        headingSize: width < 768 ? 'text-lg' : 'text-xl',
        iconSize: width < 768 ? 'w-5 h-5' : 'w-6 h-6',
        cardColumns: width < 768 ? 1 : width < 1024 ? 2 : 3,
      }
    }
    return {
      buttonSize: 'default',
      headingSize: 'text-xl',
      iconSize: 'w-6 h-6',
      cardColumns: 2,
    }
  }, [])

  // State - FIXED: loading starts FALSE, use ref to track first load
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)  // Start FALSE
  const [error, setError] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const initialLoadDone = React.useRef(false)  // Track if we've loaded

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const { getSocket } = useSocket()
  const { setupTeamBattleSocketListeners } = useQuickClashTeamBattle()

  // ALL ORIGINAL FUNCTIONS PRESERVED EXACTLY

  // Memoized function to fetch teams
  const fetchTeams = useCallback(async (force = false) => {
    // Skip if already loaded (unless forced)
    if (initialLoadDone.current && !force) return

    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api/quickClash/teams')
      setTeams(response.data.teams || [])
      initialLoadDone.current = true
    } catch (error) {
      console.error('Error fetching teams:', error)
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch teams'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Socket setup and team fetch
  useEffect(() => {
    setupTeamBattleSocketListeners()

    const socket = getSocket()
    if (socket) {
      const handleTeamUpdate = () => fetchTeams()

      socket.on('quickClash:teamInvitationAccepted', handleTeamUpdate)
      socket.on('quickClash:teamMemberJoined', handleTeamUpdate)
      socket.on('quickClash:teamMemberLeft', handleTeamUpdate)
      socket.on('quickClash:teamMemberRemoved', handleTeamUpdate)

      return () => {
        socket.off('quickClash:teamInvitationAccepted', handleTeamUpdate)
        socket.off('quickClash:teamMemberJoined', handleTeamUpdate)
        socket.off('quickClash:teamMemberLeft', handleTeamUpdate)
        socket.off('quickClash:teamMemberRemoved', handleTeamUpdate)
      }
    }
  }, [setupTeamBattleSocketListeners, fetchTeams, getSocket])

  // Initial fetch
  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Memoized handlers - EXACTLY as original + haptics
  const handleRefresh = useCallback(async () => {
    haptics.light() // Tactile feedback on refresh
    setRefreshing(true)
    await fetchTeams(true)  // Force refresh
    setRefreshing(false)
  }, [fetchTeams])

  const handleCreateTeam = useCallback(
    async teamData => {
      try {
        await axios.post('/api/quickClash/team', teamData)
        console.log('Team created successfully!')
        fetchTeams()
        setIsCreateModalOpen(false)
      } catch (error) {
        console.error('Failed to create team:', error)
      }
    },
    [fetchTeams],
  )

  const handleJoinTeam = useCallback(
    async teamCode => {
      try {
        await axios.post('/api/quickClash/team/join', { teamCode })
        console.log('Team joined successfully!')
        fetchTeams()
        setIsJoinModalOpen(false)
      } catch (error) {
        console.error('Failed to join team:', error)
      }
    },
    [fetchTeams],
  )

  const handleLeaveTeam = useCallback(
    async teamId => {
      try {
        await axios.post(`/api/quickClash/team/${teamId}/leave`)
        console.log('Left team successfully')
        fetchTeams()
      } catch (error) {
        console.error('Failed to leave team:', error)
      }
    },
    [fetchTeams],
  )

  const handleRemoveMember = useCallback(
    async (teamId, memberId) => {
      try {
        await axios.post(`/api/quickClash/team/${teamId}/remove`, { memberId })
        fetchTeams()
      } catch (error) {
        console.error('Failed to remove member:', error)
      }
    },
    [fetchTeams],
  )

  const handleInviteUser = useCallback(
    async (teamId, inviteeId) => {
      try {
        await axios.post(`/api/quickClash/team/${teamId}/invite`, { inviteeId })
        console.log('User invited successfully')
        setIsInviteModalOpen(false)
        fetchTeams()
      } catch (error) {
        console.error('Failed to invite user:', error)
      }
    },
    [fetchTeams],
  )

  const copyTeamCode = useCallback(async code => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code)
        console.log('Team code copied to clipboard')
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          const result = document.execCommand('copy')
          document.body.removeChild(textArea)
          if (result) {
            console.log('Team code copied to clipboard')
          } else {
            throw new Error('Copy command failed')
          }
        } catch (err) {
          document.body.removeChild(textArea)
          throw err
        }
      }
    } catch (error) {
      console.error('Failed to copy team code:', error)
    }
  }, [])

  // Memoized check for team leader
  const isUserTeamLeader = useCallback(
    team => {
      return team?.members.some(
        member => member?.user?._id === user?._id && member?.role === 'leader',
      )
    },
    [user?._id],
  )

  // Memoized team card handlers
  const teamCardHandlers = useMemo(
    () => ({
      onLeave: handleLeaveTeam,
      onRemoveMember: teamId => memberId =>
        handleRemoveMember(teamId, memberId),
      onInvite: team => () => {
        setSelectedTeam(team)
        setIsInviteModalOpen(true)
      },
      onCopyTeamCode: copyTeamCode,
    }),
    [handleLeaveTeam, handleRemoveMember, copyTeamCode],
  )

  // Loading state - ONLY on first load when no data
  if (loading && !refreshing && teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
          <p
            className={`${QUICK_CLASH_CLASSES.textBright} text-lg font-medium`}
          >
            {t('Loading your teams...')}
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !teams.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-5">
          <div
            className={`
            p-4 rounded-full border border-red-500
            ${QUICK_CLASH_CLASSES.glassMedium}
          `}
          >
            <RefreshCw className="w-12 h-12 text-red-400" />
          </div>
          <p className="text-red-400 text-lg font-medium">{error}</p>
          <Button
            onClick={handleRefresh}
            className={`
              ${QUICK_CLASH_CLASSES.btnDanger}
              ${QUICK_CLASH_CLASSES.focusRing}
            `}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Try Again')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <MotionDiv
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full px-2 md:px-4"
    >
      {/* Header */}
      <div className="mb-6 mt-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className={`${responsiveConfig.iconSize} text-cyan-400`} />
              <h2
                className={`${responsiveConfig.headingSize} font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
              >
                {t('My Teams')}
              </h2>
            </div>

            <Button
              size="sm"
              // variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className={`
                ${QUICK_CLASH_CLASSES.glassMedium}
                ${QUICK_CLASH_CLASSES.btnPrimary}
                hover:bg-cyan-500/10 border border-white/20
                ${QUICK_CLASH_CLASSES.focusRing}
              `}
              aria-label={t('Refresh teams')}
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size={responsiveConfig.buttonSize}
              className={`
                ${QUICK_CLASH_CLASSES.btnPrimary}
                ${QUICK_CLASH_CLASSES.focusRing}
                ${QUICK_CLASH_CLASSES.transformHover}
                flex-1 md:flex-none
              `}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('Create Team')}
            </Button>

            <Button
              onClick={() => setIsJoinModalOpen(true)}
              size={responsiveConfig.buttonSize}
              variant="outline"
              className={`
                ${QUICK_CLASH_CLASSES.glassMedium}
                border-blue-500/60 text-blue-300
                hover:bg-blue-500/10 hover:border-blue-400/80
                ${QUICK_CLASH_CLASSES.focusRing}
                ${QUICK_CLASH_CLASSES.transformHover}
                flex-1 md:flex-none
              `}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t('Join Team')}
            </Button>
          </div>
        </div>
      </div>

      {/* Teams Content */}
      {teams.length === 0 ? (
        <MotionDiv variants={itemVariants}>
          <EmptyTeamState
            onCreateTeam={() => setIsCreateModalOpen(true)}
            onJoinTeam={() => setIsJoinModalOpen(true)}
          />
        </MotionDiv>
      ) : (
        <MotionDiv
          variants={itemVariants}
          className={`
            grid gap-6
            ${
              responsiveConfig.cardColumns === 1
                ? 'grid-cols-1'
                : responsiveConfig.cardColumns === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }
          `}
        >
          {teams.map(team => (
            <TeamCard
              key={team._id}
              team={team}
              isLeader={isUserTeamLeader(team)}
              userId={user._id}
              onLeave={teamCardHandlers.onLeave}
              onRemoveMember={teamCardHandlers.onRemoveMember(team._id)}
              onInvite={teamCardHandlers.onInvite(team)}
              onCopyTeamCode={teamCardHandlers.onCopyTeamCode}
            />
          ))}
        </MotionDiv>
      )}

      {/* Modals */}
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
    </MotionDiv>
  )
}

TeamCard.displayName = 'TeamCard'
MemberRow.displayName = 'MemberRow'

export default memo(TeamDashboard)
