// components/quickClashComponents/lobby/SparkLobby.jsx
// Spark Engine - Team lobby with 4 slots for viral invites
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import useSparkSocket from '../../../customHooks/useSparkSocket'
import SlotInviteModal from './SlotInviteModal'
import { notificationManager } from '../../../utils/notifications'

// API calls
const lobbyAPI = {
  getTeamInfo: async (teamCode) => {
    const response = await axios.get(`/api/play/team/${teamCode}/info`)
    return response.data
  },
  createTeam: async (sessionId) => {
    const response = await axios.post('/api/play/team/create', { sessionId })
    return response.data
  },
  generateInviteUrl: async (teamId) => {
    const response = await axios.post('/api/play/invite', { teamId })
    return response.data
  },
}

// Gradient colors
const gradientPurple = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
const gradientGold = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'



const SparkLobby = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, teamCode: initialTeamCode, leftMatchmakingReason } = location.state || {}

  const [team, setTeam] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoiningMatchmaking, setIsJoiningMatchmaking] = useState(false)
  const [isRemoving, setIsRemoving] = useState(null) // Track which member is being removed
  const [memberToRemove, setMemberToRemove] = useState(null) // For confirmation modal
  const [error, setError] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Check session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('playSessionId')
    if (!session && !storedSessionId) {
      navigate('/play')
      return
    }

    const initializeLobby = async () => {
      try {
        const sessionId = localStorage.getItem('playSessionId')

        // Check for active battle restoration (for non-upgraded session players)
        // This handles the case where a session player closed the app during an active battle
        const activeBattleId = localStorage.getItem('sparkActiveBattleId')
        if (activeBattleId) {
          try {
            const battleResponse = await axios.get(`/api/play/battle/${activeBattleId}`, {
              headers: { 'X-Session-Id': sessionId }
            })
            if (battleResponse.data.battle && battleResponse.data.battle.status !== 'completed') {
              // Battle is still active - redirect to it
              console.log('[SparkLobby] Found active battle, redirecting:', activeBattleId)
              navigate(`/play/battle/${activeBattleId}`, { replace: true })
              return
            }
          } catch (err) {
            // Battle not found or error - clear stale battleId
            console.log('[SparkLobby] Active battle not found or error, clearing:', err.message)
          }
          // Clear stale battleId
          localStorage.removeItem('sparkActiveBattleId')
        }

        // Priority for teamCode:
        // 1. From navigation state (when redirected from matchmaking or invited)
        // 2. From localStorage (when pressing browser back)
        const teamCodeToUse = initialTeamCode || localStorage.getItem('sparkTeamCode')
        let teamData

        if (teamCodeToUse && teamCodeToUse !== 'NEW') {
          // Fetch existing team
          const response = await lobbyAPI.getTeamInfo(teamCodeToUse)
          teamData = response.team
          // Ensure teamCode is saved for future back navigations
          localStorage.setItem('sparkTeamCode', teamData.teamCode)
        } else {
          // Create a new team for session player
          const sessionId = session?.sessionId || storedSessionId
          const { team: newTeam } = await lobbyAPI.createTeam(sessionId)

          // Save teamCode to localStorage for back navigation
          localStorage.setItem('sparkTeamCode', newTeam.teamCode)

          // Fetch full team info for display
          const response = await lobbyAPI.getTeamInfo(newTeam.teamCode)
          teamData = response.team
        }

        // Check matchmaking status ONLY if on lobby route and no leftMatchmakingReason
        // (leftMatchmakingReason means we intentionally left matchmaking)
        // Also skip if we just came from matchmaking page (back button) to avoid race condition
        // where the leave API hasn't completed yet
        const cameFromMatchmaking = document.referrer?.includes('/play/matchmaking') ||
          sessionStorage.getItem('sparkLeftMatchmaking') === 'true'

        if (window.location.pathname === '/play/lobby' && !leftMatchmakingReason && !cameFromMatchmaking) {
          try {
            const sessionId = localStorage.getItem('playSessionId')
            const statusResponse = await axios.get('/api/play/matchmaking/status', {
              headers: { 'X-Session-Id': sessionId }
            })

            if (statusResponse.data.success && statusResponse.data.inMatchmaking) {
              // Team is in matchmaking - redirect accordingly
              if (statusResponse.data.status === 'battleReady' && statusResponse.data.battleId) {
                // Battle is ready - go directly to battle
                navigate(`/play/battle/${statusResponse.data.battleId}`, {
                  state: {
                    battleId: statusResponse.data.battleId,
                    team: teamData,
                  },
                  replace: true,
                })
                return
              } else {
                // Still searching - go to matchmaking page
                navigate('/play/matchmaking', {
                  state: {
                    team: teamData,
                    matchmakingId: statusResponse.data.matchmaking?._id,
                  },
                  replace: true,
                })
                return
              }
            }
          } catch (statusError) {
            // If status check fails, just continue to lobby
            console.error('Matchmaking status check failed:', statusError)
          }
        }

        // Clear the flag after use
        sessionStorage.removeItem('sparkLeftMatchmaking')

        setTeam(teamData)
      } catch (err) {
        console.error('Lobby init error:', err)
        // Clear saved team code on error
        localStorage.removeItem('sparkTeamCode')
        // If team creation fails, navigate back
        navigate('/play')
      } finally {
        setIsLoading(false)
      }
    }

    initializeLobby()
  }, [session, initialTeamCode, navigate, leftMatchmakingReason])

  // Use shared socket from SparkLayout
  const { addEventListener, isConnected, cleanupEventListeners } = useSparkSocket()

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!team?._id) return

    // Listen for team member updates
    const cleanupTeamUpdated = addEventListener('quickClash:teamUpdated', (data) => {
      if (data.team) {
        setTeam(data.team)
      }
    })

    // Listen for new team members joining - show toast notification
    const cleanupMemberJoined = addEventListener('quickClash:teamMemberJoined', (data) => {
      const playerName = data.userInGameName || data.userName || 'A player'
      notificationManager.matchmaking(
        'New Teammate!',
        `${playerName} joined your squad`
      )
    })

    // Listen for being removed from team
    const cleanupMemberRemoved = addEventListener('quickClash:teamMemberRemoved', (data) => {
      if (data.isCurrentUser) {
        // Current player was removed from the team - show toast notification
        notificationManager.error(
          'Removed from Team',
          data.teamName ? `You were removed from ${data.teamName}` : 'You were removed from the team'
        )
        localStorage.removeItem('sparkTeamCode')
        navigate('/play', {
          state: { message: 'You were removed from the team' },
          replace: true,
        })
      }
    })

    return () => {
      cleanupTeamUpdated()
      cleanupMemberJoined()
      cleanupMemberRemoved()
    }
  }, [team?._id, addEventListener, navigate])

  const handleSlotClick = useCallback((slotIndex) => {
    setSelectedSlot(slotIndex)
    // Generate invite URL
    const baseUrl = window.location.origin
    const inviteLink = team?.teamCode
      ? `${baseUrl}/play/join/${team.teamCode}`
      : `${baseUrl}/play?join=pending`
    setInviteUrl(inviteLink)
    setShowInviteModal(true)
  }, [team])

  const handleStartBattle = useCallback(async () => {
    if (!team?._id) {
      setError('Team not ready')
      return
    }

    setIsJoiningMatchmaking(true)
    setError('')

    try {
      const sessionId = localStorage.getItem('playSessionId')
      const response = await axios.post('/api/play/matchmaking/join', {
        sessionId,
        teamId: team._id,
      })

      // Navigate to matchmaking screen with team and matchmaking info
      console.log('[SparkLobby] Navigating to /play/matchmaking, history length:', window.history.length)
      navigate('/play/matchmaking', {
        state: {
          team,
          matchmakingId: response.data.matchmaking?.matchmakingId,
        },
      })
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to join matchmaking'
      setError(errorMsg)
      setIsJoiningMatchmaking(false)
    }
  }, [team, navigate])

  const isFull = team?.memberCount >= team?.maxMembers
  // Always allow starting - solo players will be matched with randoms
  const canStart = team?.memberCount >= 1

  // Check if current user is the leader
  const currentSessionId = localStorage.getItem('playSessionId')
  const isLeader = team?.members?.some(
    m => m.type === 'session' && m.sessionId === currentSessionId && m.role === 'leader'
  )

  // Handle removing a team member - show confirmation modal
  const handleRemoveMember = useCallback((member, e) => {
    e.stopPropagation() // Prevent slot click
    if (!isLeader || !team?._id) return
    setMemberToRemove(member)
  }, [isLeader, team?._id])

  // Confirm removal
  const confirmRemoveMember = useCallback(async () => {
    if (!memberToRemove || !team?._id) return

    setIsRemoving(memberToRemove.sessionId)
    setError('')

    try {
      const sessionId = localStorage.getItem('playSessionId')
      const response = await axios.post(
        `/api/play/team/${team._id}/remove`,
        { memberSessionPlayerId: memberToRemove._id },
        { headers: { 'X-Session-Id': sessionId } }
      )

      if (response.data.success && response.data.team) {
        setTeam(response.data.team)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to remove member'
      setError(errorMsg)
    } finally {
      setIsRemoving(null)
      setMemberToRemove(null)
    }
  }, [memberToRemove, team?._id])

  if (isLoading) {
    return (
      <div style={styles.container} className='sparkLobby-loading'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={styles.loader}
        />
      </div>
    )
  }

  // Get button label based on team size and leader status
  const getStartButtonLabel = () => {
    if (!isLeader) return '⏳ Waiting for Leader'
    if (isFull) return '⚔️ Start Battle'
    if (team?.memberCount === 1) return '⚔️ Start Solo'
    return `⚔️ Start (${team?.memberCount}/4)`
  }

  // Get help text based on team size and leader status
  const getHelpText = () => {
    if (!isLeader) return '👑 Only the team leader can start the battle'
    if (isFull) return '🔥 Squad ready! Let\'s go!'
    if (team?.memberCount === 1) return '💡 Start now — we\'ll match you with teammates!'
    return `💡 Missing ${4 - team?.memberCount} players? Start anyway — we'll fill with randoms!`
  }

  return (
    <div style={styles.container} className='sparkLobby'>
      {/* Background */}
      <div style={styles.bgGradient} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.content}
      >
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Your Squad</h1>
          <div style={styles.teamCode}>
            <span style={styles.codeLabel}>Team Code:</span>
            <span style={styles.code}>{team?.teamCode}</span>
          </div>
        </div>

        {/* Slots Grid */}
        <div style={styles.slotsGrid}>
          {[...Array(4)].map((_, index) => {
            const member = team?.members?.[index]
            const isFilled = !!member
            const isMemberLeader = member?.role === 'leader'
            const isCurrentUser = member?.type === 'session' && member?.sessionId === currentSessionId
            const canRemove = isLeader && isFilled && !isMemberLeader && !isCurrentUser

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  ...styles.slot,
                  ...(isFilled ? styles.slotFilled : styles.slotEmpty),
                }}
                onClick={() => !isFilled && handleSlotClick(index)}
                whileHover={!isFilled ? { scale: 1.02, borderColor: 'rgba(102, 126, 234, 0.6)' } : {}}
                whileTap={!isFilled ? { scale: 0.98 } : {}}
              >
                {isFilled ? (
                  <>
                    {/* Remove Button */}
                    {canRemove && (
                      <motion.button
                        onClick={(e) => handleRemoveMember(member, e)}
                        style={styles.removeButton}
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
                        whileTap={{ scale: 0.9 }}
                        disabled={isRemoving === member.sessionId}
                      >
                        {isRemoving === member.sessionId ? '...' : '✕'}
                      </motion.button>
                    )}
                    {/* Player Avatar */}
                    <div style={styles.avatar}>
                      {member.pic ? (
                        <img src={member.pic} alt="" style={styles.avatarImg} />
                      ) : (
                        <span style={styles.avatarEmoji}>
                          {member.type === 'session' ? '⚡' : '👤'}
                        </span>
                      )}
                      {isMemberLeader && <div style={styles.leaderBadge}>👑</div>}
                    </div>
                    {/* Player Name */}
                    <div style={styles.playerName}>{member.inGameName}</div>
                    {/* Trophies */}
                    <div style={styles.playerTrophies}>🏆 {member.trophies}</div>
                  </>
                ) : (
                  <>
                    {/* Empty Slot */}
                    <motion.div
                      style={styles.emptyIcon}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      +
                    </motion.div>
                    <div style={styles.emptyText}>Invite</div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Players</span>
            <span style={styles.statValue}>
              {team?.memberCount || 0}/{team?.maxMembers || 4}
            </span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Avg Trophies</span>
            <span style={styles.statValue}>🏆 {team?.avgTrophies || 1000}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p style={styles.errorText}>{error}</p>
        )}

        {/* Action Buttons */}
        <div style={styles.actions}>
          <motion.button
            style={{
              ...styles.button,
              ...styles.startButton,
              opacity: (isJoiningMatchmaking || !isLeader) ? 0.6 : 1,
              cursor: !isLeader ? 'not-allowed' : 'pointer',
            }}
            onClick={isLeader ? handleStartBattle : undefined}
            disabled={isJoiningMatchmaking || !isLeader}
            whileHover={(isLeader && !isJoiningMatchmaking) ? { scale: 1.02 } : {}}
            whileTap={(isLeader && !isJoiningMatchmaking) ? { scale: 0.98 } : {}}
          >
            {isJoiningMatchmaking ? '⏳ Finding Match...' : getStartButtonLabel()}
          </motion.button>

          <motion.button
            style={{ ...styles.button, ...styles.inviteButton }}
            onClick={() => handleSlotClick(team?.memberCount || 0)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            📤 Share Invite
          </motion.button>
        </div>

        {/* Help Text */}
        <p style={styles.helpText}>{getHelpText()}</p>
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <SlotInviteModal
            inviteUrl={inviteUrl}
            teamCode={team?.teamCode}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Remove Member Confirmation Modal */}
      <AnimatePresence>
        {memberToRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setMemberToRemove(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={styles.confirmModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.confirmIcon}>🚫</div>
              <h3 style={styles.confirmTitle}>Remove Player</h3>
              <p style={styles.confirmText}>
                Remove <strong>{memberToRemove.inGameName}</strong> from the team?
              </p>
              <div style={styles.confirmButtons}>
                <motion.button
                  style={styles.cancelButton}
                  onClick={() => setMemberToRemove(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  style={styles.removeConfirmButton}
                  onClick={confirmRemoveMember}
                  disabled={isRemoving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isRemoving ? 'Removing...' : 'Remove'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
    background: '#0a0a0f',
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 60%)',
  },
  loader: {
    width: 40,
    height: 40,
    border: '3px solid rgba(102, 126, 234, 0.3)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
  },
  content: {
    position: 'relative',
    width: '100%',
    maxWidth: 500,
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },
  teamCode: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  codeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  code: {
    fontSize: 16,
    fontWeight: 600,
    color: '#667eea',
    letterSpacing: 2,
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  slot: {
    position: 'relative', // For absolute positioned remove button
    aspectRatio: '1',
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  slotFilled: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: '2px solid rgba(102, 126, 234, 0.3)',
  },
  slotEmpty: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px dashed rgba(255, 255, 255, 0.15)',
  },
  avatar: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'rgba(102, 126, 234, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  leaderBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  playerName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    maxWidth: '90%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  playerTrophies: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyIcon: {
    fontSize: 40,
    fontWeight: 300,
    color: 'rgba(255, 255, 255, 0.2)',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
    padding: '16px 24px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: '16px 24px',
    fontSize: 15,
    fontWeight: 600,
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  startButton: {
    color: '#fff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
  },
  inviteButton: {
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  helpText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  // Confirmation Modal Styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  confirmModal: {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16162e 100%)',
    borderRadius: 24,
    padding: 32,
    maxWidth: 340,
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  confirmIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  confirmText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    margin: '0 0 24px 0',
    lineHeight: 1.5,
  },
  confirmButtons: {
    display: 'flex',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: '14px 20px',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    transition: 'all 0.2s ease',
  },
  removeConfirmButton: {
    flex: 1,
    padding: '14px 20px',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    transition: 'all 0.2s ease',
  },
}

export default SparkLobby
