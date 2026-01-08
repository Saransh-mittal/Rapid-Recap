// components/quickClashComponents/lobby/SparkLobby.jsx
// Spark Engine - Team lobby with 4 slots for viral invites
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { io } from 'socket.io-client'
import SlotInviteModal from './SlotInviteModal'

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

// Determine socket endpoint (same logic as socketInitManager)
const getSocketEndpoint = () => {
  if (import.meta.env.PROD) {
    return 'https://rapidrecap.ai'
  }
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  if (import.meta.env.VITE_SOCKET_ENDPOINT) {
    return import.meta.env.VITE_SOCKET_ENDPOINT
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000'
  }
  return `${protocol}//${hostname}:3000`
}

const SparkLobby = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, teamCode: initialTeamCode } = location.state || {}

  const [team, setTeam] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoiningMatchmaking, setIsJoiningMatchmaking] = useState(false)
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
        if (initialTeamCode && initialTeamCode !== 'NEW') {
          // Fetch existing team
          const { team: teamData } = await lobbyAPI.getTeamInfo(initialTeamCode)
          setTeam(teamData)
        } else {
          // Create a new team for session player
          const sessionId = session?.sessionId || storedSessionId
          const { team: newTeam } = await lobbyAPI.createTeam(sessionId)

          // Fetch full team info for display
          const { team: teamData } = await lobbyAPI.getTeamInfo(newTeam.teamCode)
          setTeam(teamData)
        }
      } catch (err) {
        console.error('Lobby init error:', err)
        // If team creation fails, navigate back
        navigate('/play')
      } finally {
        setIsLoading(false)
      }
    }

    initializeLobby()
  }, [session, initialTeamCode, navigate])

  // Socket connection for real-time updates
  const socketRef = useRef(null)

  useEffect(() => {
    if (!team?._id) return

    const sessionId = localStorage.getItem('playSessionId')
    if (!sessionId) return

    const endpoint = getSocketEndpoint()
    console.log('[SparkLobby] Connecting socket to:', endpoint, 'for team:', team._id, 'sessionId:', sessionId)

    const socket = io(endpoint, {
      auth: {
        sessionId,
        type: 'spark',
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[SparkLobby] Socket connected:', socket.id)
    })

    socket.on('connect_error', (error) => {
      console.error('[SparkLobby] Socket connection error:', error.message)
    })

    // Listen for team member updates
    socket.on('quickClash:teamUpdated', (data) => {
      console.log('[SparkLobby] Team updated:', data)
      if (data.team) {
        setTeam(data.team)
      }
    })

    // Listen for matchmaking started (when leader starts matchmaking)
    socket.on('quickClash:teamJoinedMatchmaking', (data) => {
      console.log('[SparkLobby] Matchmaking started by leader:', data)
      // Navigate ALL team members to matchmaking screen
      navigate('/play/matchmaking', {
        state: {
          team: data.team || team,
          matchmakingId: data.matchmakingId,
        },
      })
    })

    // Listen for match found (if still in lobby when match is found)
    socket.on('quickClash:matchFound', (data) => {
      console.log('[SparkLobby] Match found:', data)
      navigate(`/play/battle/${data.battleId}`, {
        state: {
          battleId: data.battleId,
          team: data.team,
          opponent: data.opponent,
        },
      })
    })

    socket.on('disconnect', (reason) => {
      console.log('[SparkLobby] Socket disconnected:', reason)
    })

    return () => {
      console.log('[SparkLobby] Cleaning up socket')
      socket.disconnect()
      socketRef.current = null
    }
  }, [team?._id, navigate, team])

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

  if (isLoading) {
    return (
      <div style={styles.container}>
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
    <div style={styles.container}>
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
            const isLeader = member?.role === 'leader'

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
                    {/* Player Avatar */}
                    <div style={styles.avatar}>
                      {member.pic ? (
                        <img src={member.pic} alt="" style={styles.avatarImg} />
                      ) : (
                        <span style={styles.avatarEmoji}>
                          {member.type === 'session' ? '⚡' : '👤'}
                        </span>
                      )}
                      {isLeader && <div style={styles.leaderBadge}>👑</div>}
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
}

export default SparkLobby
