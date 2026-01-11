// SparkBattlePage.jsx
// Battle page for Spark Engine session players (no authentication required)
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import useSparkSocket from '../../../customHooks/useSparkSocket'

// Session-aware API client
const sessionApi = {
  getBattle: async (battleId, sessionId) => {
    const response = await axios.get(`/api/play/battle/${battleId}`, {
      headers: { 'X-Session-Id': sessionId }
    })
    return response.data
  },
  getChallenge: async (challengeId, sessionId) => {
    const response = await axios.get(`/api/play/challenge/${challengeId}`, {
      headers: { 'X-Session-Id': sessionId }
    })
    return response.data
  },
  submitQuiz: async (challengeId, answers, sessionId) => {
    const response = await axios.post(`/api/play/quiz/submit`, {
      challengeId,
      answers,
      sessionId,
    }, {
      headers: { 'X-Session-Id': sessionId }
    })
    return response.data
  }
}

const SparkBattlePage = () => {
  const navigate = useNavigate()
  const { battleId } = useParams()
  const location = useLocation()
  const { team, opponent } = location.state || {}

  const [battle, setBattle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentView, setCurrentView] = useState('battle') // battle, reading, quiz
  const [selectedChallenge, setSelectedChallenge] = useState(null)

  const sessionId = localStorage.getItem('playSessionId')

  // Fetch battle data with retry logic for transaction timing issues
  useEffect(() => {
    if (!battleId || !sessionId) {
      setError('Battle or session not found')
      setLoading(false)
      return
    }

    const fetchBattle = async (retryCount = 0) => {
      const MAX_RETRIES = 5
      const RETRY_DELAY = 1000 // 1 second between retries

      try {
        const data = await sessionApi.getBattle(battleId, sessionId)
        setBattle(data.battle)
        setLoading(false)
      } catch (err) {
        console.error(`Failed to fetch battle (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, err)

        // If battle not found (404) and we haven't exhausted retries, retry after delay
        // This handles the race condition where transaction may not have committed yet
        if (err.response?.status === 404 && retryCount < MAX_RETRIES) {
          console.log(`Battle not found, retrying in ${RETRY_DELAY}ms...`)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          return fetchBattle(retryCount + 1)
        }

        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load battle')
        setLoading(false)
      }
    }

    fetchBattle()
  }, [battleId, sessionId])

  // Use shared socket from SparkLayout
  const { addEventListener, getSocket, emit } = useSparkSocket()

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!battleId || !sessionId) return

    // Join battle room
    emit('spark:joinBattle', { battleId })

    // Listen for battle updates
    const cleanupUpdated = addEventListener('spark:battleUpdated', (data) => {
      if (data.battle) {
        setBattle(data.battle)
      }
    })

    // Listen for battle completion
    const cleanupCompleted = addEventListener('spark:battleCompleted', (data) => {
      if (data.battle) {
        setBattle(data.battle)
      }
    })

    return () => {
      cleanupUpdated()
      cleanupCompleted()
    }
  }, [battleId, sessionId, addEventListener, emit])

  // Handle selecting a category/challenge to read
  const handleSelectChallenge = useCallback(async (challenge) => {
    try {
      const data = await sessionApi.getChallenge(challenge._id, sessionId)
      setSelectedChallenge(data.challenge)
      setCurrentView('reading')
    } catch (err) {
      console.error('Failed to fetch challenge:', err)
      setError('Failed to load challenge')
    }
  }, [sessionId])

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!battle?.expiresAt) return null
    const expiresAt = new Date(battle.expiresAt)
    const now = new Date()
    const diff = expiresAt - now
    if (diff <= 0) return 'Expired'
    const mins = Math.floor(diff / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [battle?.expiresAt])

  if (loading) {
    return (
      <div style={styles.container}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={styles.loader}
        />
        <p style={styles.loadingText}>Loading battle...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>❌</div>
          <h2 style={styles.errorTitle}>Error</h2>
          <p style={styles.errorText}>{error}</p>
          <motion.button
            style={styles.backButton}
            onClick={() => navigate('/quickclash')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Quick Clash
          </motion.button>
        </div>
      </div>
    )
  }

  if (!battle) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Battle not found</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/quickclash')}>
          ← Back
        </button>
        <div style={styles.timerBadge}>
          <span style={styles.timerIcon}>⏱️</span>
          <span style={styles.timerText}>{timeRemaining}</span>
        </div>
      </div>

      {/* Score Display */}
      <motion.div
        style={styles.scoreCard}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={styles.teamScore}>
          <span style={styles.teamLabel}>Your Team</span>
          <span style={styles.score}>{battle.teamAScore || 0}</span>
        </div>
        <div style={styles.vsText}>VS</div>
        <div style={styles.teamScore}>
          <span style={styles.teamLabel}>Opponent</span>
          <span style={styles.score}>{battle.teamBScore || 0}</span>
        </div>
      </motion.div>

      {/* Categories */}
      <div style={styles.categoriesSection}>
        <h3 style={styles.sectionTitle}>Categories</h3>
        <div style={styles.categoriesGrid}>
          {battle.challenges?.map((challenge, index) => {
            // Handle both string and object category formats
            const categoryName = typeof challenge.category === 'string'
              ? challenge.category
              : challenge.category?.name || `Category ${index + 1}`

            return (
              <motion.div
                key={challenge._id || index}
                style={{
                  ...styles.categoryCard,
                  ...(challenge.teamACompleted && challenge.teamBCompleted ? styles.completedCard : {}),
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!challenge.teamACompleted && !challenge.teamBCompleted) {
                    handleSelectChallenge(challenge)
                  }
                }}
              >
                <span style={styles.categoryIcon}>📚</span>
                <span style={styles.categoryName}>{categoryName}</span>
                {(challenge.teamACompleted && challenge.teamBCompleted) && (
                  <span style={styles.completedBadge}>✓</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Battle Status */}
      <div style={styles.statusSection}>
        <p style={styles.statusText}>
          {battle.status === 'completed'
            ? '🏆 Battle Complete!'
            : battle.status === 'active'
              ? '⚔️ Battle in Progress'
              : battle.status}
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    width: 48,
    height: 48,
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#22d3ee',
    borderRadius: '50%',
    marginTop: 100,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 20,
    fontSize: 16,
  },
  errorCard: {
    background: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    padding: 40,
    textAlign: 'center',
    maxWidth: 400,
    marginTop: 100,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 8,
  },
  backButton: {
    marginTop: 24,
    padding: '12px 32px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
  },
  header: {
    width: '100%',
    maxWidth: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
  },
  timerBadge: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  timerIcon: {
    fontSize: 16,
  },
  timerText: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: 'monospace',
  },
  scoreCard: {
    background: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    width: '100%',
    maxWidth: 600,
    marginBottom: 24,
  },
  teamScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  teamLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  score: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 700,
  },
  vsText: {
    color: '#a78bfa',
    fontSize: 20,
    fontWeight: 700,
  },
  categoriesSection: {
    width: '100%',
    maxWidth: 600,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  categoryCard: {
    background: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  completedCard: {
    opacity: 0.6,
    cursor: 'default',
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: '#22c55e',
    borderRadius: '50%',
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: '#fff',
  },
  statusSection: {
    marginTop: 24,
    textAlign: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
  },
}

export default SparkBattlePage
