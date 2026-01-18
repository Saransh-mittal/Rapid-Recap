// screens/PlayLanding.jsx
// Spark Engine - Landing page matching Quick Clash V2 theme
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUser, setLoginCheckStatus } from '../redux/authSlice'

// Spark Engine API service
const playAPI = {
  createSession: async (inGameName, deviceFingerprint, invitedByTeam) => {
    const response = await axios.post('/api/play/session', {
      inGameName,
      deviceFingerprint,
      invitedByTeam,
    })
    return response.data
  },
  restoreSession: async (sessionId, deviceFingerprint) => {
    const response = await axios.post('/api/play/session/restore', {
      sessionId,
      deviceFingerprint,
    })
    return response.data
  },
  getTeamInfo: async (teamCode) => {
    const response = await axios.get(`/api/play/team/${teamCode}/info`)
    return response.data
  },
  joinTeam: async (teamCode, sessionId) => {
    const response = await axios.post(`/api/play/join/${teamCode}`, {
      sessionId,
    })
    return response.data
  },
}

// Device + Browser fingerprint (unique per browser instance)
const getDeviceFingerprint = () => {
  // Check for existing browser-specific ID first
  let browserId = localStorage.getItem('_spark_browser_id')
  if (!browserId) {
    // Generate a new unique ID for this browser instance
    browserId = crypto.randomUUID ? crypto.randomUUID() :
      `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('_spark_browser_id', browserId)
  }

  // Combine with device info for a more robust fingerprint
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl')
  const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info')
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'
  const screen = `${window.screen.width}x${window.screen.height}`

  // Create a hash-like fingerprint combining browser ID and device info
  const combined = `${browserId}|${screen}|${renderer}`
  // Simple hash function
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return `${browserId.slice(0, 16)}-${Math.abs(hash).toString(36)}`
}

// QC V2 Theme colors
const theme = {
  bgPrimary: 'rgba(15, 23, 42, 0.98)', // slate-900
  bgSecondary: 'rgba(30, 41, 59, 0.8)', // slate-800
  accentCyan: '#22d3ee', // cyan-400
  accentPurple: '#a78bfa', // violet-400
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.08)',
}

// Auth buttons component with custom styled Google button overlay
const AuthButtons = ({ onPlayNow, onGoogleSuccess, onGoogleError, isLoading, lastLoggedInName }) => {
  // Determine button text based on whether there's a previously logged-in user
  const googleButtonText = lastLoggedInName
    ? `Continue as ${lastLoggedInName}`
    : 'Sign in with Google'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      style={authStyles.container}
    >
      {/* Play Now - Primary CTA */}
      <motion.button
        onClick={onPlayNow}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={authStyles.playNowButton}
      >
        ⚡ Play Now
      </motion.button>
      <p style={authStyles.helperText}>Start playing instantly as a new player</p>

      <div style={authStyles.orDivider}>
        <span style={authStyles.orLine} />
        <span style={authStyles.orText}>{lastLoggedInName ? 'welcome back!' : 'already have an account?'}</span>
        <span style={authStyles.orLine} />
      </div>

      {/* Google button container - custom styling with GoogleLogin overlay */}
      <div style={authStyles.googleButtonContainer}>
        {/* Visual button (decorative) */}
        <div style={authStyles.googleButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 10, flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleButtonText}
        </div>
        {/* Invisible GoogleLogin overlay - actually handles the click */}
        <div style={authStyles.googleOverlay}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              onGoogleSuccess({ data: { ...credentialResponse } }, credentialResponse)
            }}
            onError={onGoogleError}
            theme="outline"
            size="large"
            width="320"
            type="standard"
          />
        </div>
      </div>
    </motion.div>
  )
}

// AuthButtons styles
const authStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  playNowButton: {
    width: '100%',
    padding: '16px 24px',
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    background: `linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)`,
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 24px rgba(34, 211, 238, 0.4)',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    margin: '-8px 0 8px 0',
    textAlign: 'center',
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    margin: '4px 0',
  },
  orLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  googleButtonContainer: {
    position: 'relative',
    width: '100%',
    height: 48,
  },
  googleButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#ffffff',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  googleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    cursor: 'pointer',
  },
}

const PlayLanding = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { teamCode } = useParams()
  const [searchParams] = useSearchParams()
  const joinCode = teamCode || searchParams.get('join')

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [teamInfo, setTeamInfo] = useState(null)
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const [showNameInput, setShowNameInput] = useState(false)
  const [lastLoggedInName, setLastLoggedInName] = useState('')

  // Check for previously logged-in player name on mount
  useEffect(() => {
    const savedName = localStorage.getItem('lastLoggedInPlayerName')
    if (savedName) {
      setLastLoggedInName(savedName)
    }
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedSessionId = localStorage.getItem('playSessionId')
        const fingerprint = getDeviceFingerprint()

        // Always try to restore - either by sessionId or fingerprint
        const { session } = await playAPI.restoreSession(storedSessionId, fingerprint)

        if (session) {
          // Update localStorage with the restored session (in case it was fingerprint-restored)
          if (session.sessionId && session.sessionId !== storedSessionId) {
            localStorage.setItem('playSessionId', session.sessionId)
          }

          // Also store the session name for client-side use
          if (session.inGameName) {
            localStorage.setItem('playSessionName', session.inGameName)
          }

          // Check if this is an "upgraded" session player (has used V2 UI before)
          const isUpgraded = localStorage.getItem('sparkUpgraded') === 'true'

          if (isUpgraded) {
            // Upgraded session players go directly to Quick Clash V2
            navigate('/quickclash', { replace: true })
          } else {
            // New session players go to the lobby for onboarding
            navigate('/play/lobby', { state: { session } })
          }
          return
        }
      } catch (err) {
        // Session not found or invalid - clear localStorage
        localStorage.removeItem('playSessionId')
        localStorage.removeItem('playSessionToken')
        localStorage.removeItem('playSessionName')
        localStorage.removeItem('sparkUpgraded')
      } finally {
        setIsRestoringSession(false)
      }
    }

    checkExistingSession()
  }, [navigate])

  // Fetch team info if joining via invite
  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (!joinCode) return
      try {
        const { team } = await playAPI.getTeamInfo(joinCode)
        setTeamInfo(team)
      } catch (err) {
        setError('Team not found or no longer available')
      }
    }
    fetchTeamInfo()
  }, [joinCode])

  // Handle Google Login success (receives credentialResponse from GoogleLogin component)
  const handleGoogleSuccess = async (_, credentialResponse) => {
    setIsLoading(true)
    setError('')
    try {
      // Call backend with the credential response
      const response = await axios.post('/api/user/handleGoogleLogin', {
        credentialResponse,
      })

      if (response.data.EnterInGameName) {
        // User needs to enter in-game name (new user via Google)
        // For now, show error - they should use Play Now instead
        setError('New account - please click "Play Now" to start playing!')
        setIsLoading(false)
        return
      }

      // Existing user - dispatch login and redirect
      dispatch(setUser(response.data.user))
      dispatch(setLoginCheckStatus('fulfilled'))
      localStorage.setItem('token', response.data.token)
      navigate('/quickclash')
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle session creation with name
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const fingerprint = getDeviceFingerprint()
      const { session, token } = await playAPI.createSession(
        name.trim(),
        fingerprint,
        joinCode
      )

      localStorage.setItem('playSessionId', session.sessionId)
      localStorage.setItem('playSessionToken', token)

      if (joinCode) {
        await playAPI.joinTeam(joinCode, session.sessionId)
      }

      navigate('/play/lobby', { state: { session, teamCode: joinCode } })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [name, joinCode, navigate])

  if (isRestoringSession) {
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

  return (
    <div style={styles.container}>
      {/* Background gradient - QC V2 style */}
      <div style={styles.bgGradient} />

      {/* Floating orbs */}
      <div style={styles.bgOrbs}>
        <motion.div
          style={{ ...styles.orb, ...styles.orbCyan }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          style={{ ...styles.orb, ...styles.orbPurple }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={styles.logoContainer}
        >
          <span style={styles.logo}>⚔️</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={styles.title}
        >
          Quick <span style={{ color: theme.accentCyan }}>Clash</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={styles.subtitle}
        >
          {joinCode ? 'Join the battle!' : 'Challenge your friends'}
        </motion.p>

        {/* Team Info (if joining) */}
        <AnimatePresence>
          {teamInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.teamInfo}
            >
              <div style={styles.teamName}>{teamInfo.name || 'Team'}</div>
              <div style={styles.teamStats}>
                <span>{teamInfo.memberCount}/{teamInfo.maxMembers} players</span>
                <span>🏆 {teamInfo.avgTrophies}</span>
              </div>
              <div style={styles.slots}>
                {[...Array(teamInfo.maxMembers)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.slot,
                      ...(i < teamInfo.memberCount ? styles.slotFilled : styles.slotEmpty),
                    }}
                  >
                    {i < teamInfo.memberCount ? '👤' : '+'}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show name input OR Google signin */}
        {showNameInput ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.inputContainer}
            >
              <input
                type="text"
                placeholder="Choose your battle name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value.replace(/\s/g, ''))
                  setError('')
                }}
                maxLength={16}
                style={styles.input}
                autoFocus
              />
              <span style={styles.charCount}>{name.length}/16</span>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading || !name.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...styles.button,
                opacity: isLoading || !name.trim() ? 0.6 : 1,
              }}
            >
              {isLoading ? '⏳ Starting...' : '⚔️ Enter Battle'}
            </motion.button>
          </form>
        ) : (
          <GoogleOAuthProvider clientId="492859619634-m81f6tnro73fg6sflkuj0nemm1g6aecb.apps.googleusercontent.com">
            <AuthButtons
              onPlayNow={() => setShowNameInput(true)}
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={() => setError('Google login failed')}
              isLoading={isLoading}
              lastLoggedInName={lastLoggedInName}
            />
          </GoogleOAuthProvider>
        )}

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={styles.error}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={styles.footer}
        >
          Invite friends • Fill your squad • Start the clash
        </motion.p>
      </motion.div>
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
    overflow: 'hidden',
    background: '#0f172a', // slate-900
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(34, 211, 238, 0.08) 0%, transparent 50%)',
  },
  bgOrbs: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(100px)',
  },
  orbCyan: {
    width: 500,
    height: 500,
    background: 'rgba(34, 211, 238, 0.3)',
    top: '-20%',
    right: '-15%',
  },
  orbPurple: {
    width: 400,
    height: 400,
    background: 'rgba(167, 139, 250, 0.25)',
    bottom: '5%',
    left: '-10%',
  },
  loader: {
    width: 40,
    height: 40,
    border: `3px solid rgba(34, 211, 238, 0.3)`,
    borderTopColor: theme.accentCyan,
    borderRadius: '50%',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 380,
    padding: '40px 32px',
    borderRadius: 24,
    background: theme.bgPrimary,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${theme.border}`,
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 52,
    display: 'inline-block',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  teamInfo: {
    background: 'rgba(34, 211, 238, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    border: '1px solid rgba(34, 211, 238, 0.15)',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  teamStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  slots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
  },
  slot: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
  },
  slotFilled: {
    background: 'rgba(34, 211, 238, 0.2)',
    border: '2px solid rgba(34, 211, 238, 0.4)',
  },
  slotEmpty: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px dashed rgba(255, 255, 255, 0.15)',
    color: theme.textMuted,
  },
  authSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  googleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    margin: '8px 0',
  },
  orLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    fontSize: 12,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playNowButton: {
    width: '100%',
    padding: '16px 24px',
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    background: `linear-gradient(135deg, ${theme.accentCyan} 0%, #06b6d4 100%)`,
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 24px rgba(34, 211, 238, 0.4)',
    letterSpacing: 0.5,
  },
  guestButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: theme.textPrimary,
    background: 'rgba(255, 255, 255, 0.08)',
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    paddingRight: 55,
    fontSize: 15,
    fontWeight: 500,
    color: theme.textPrimary,
    background: 'rgba(255, 255, 255, 0.05)',
    border: `2px solid ${theme.border}`,
    borderRadius: 12,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  charCount: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 12,
    color: theme.textMuted,
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#000',
    background: theme.accentCyan,
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 20px rgba(34, 211, 238, 0.35)',
  },
  error: {
    fontSize: 13,
    color: '#ff6b6b',
    textAlign: 'center',
    padding: '10px 16px',
    background: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    marginTop: 16,
  },
  footer: {
    marginTop: 28,
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
}

export default PlayLanding
