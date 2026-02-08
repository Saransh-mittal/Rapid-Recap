// SparkLayout.jsx
// Route wrapper for /play/* routes - initializes shared socket
import React, { useEffect, useState, Suspense } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import useSparkSocket from '../../../customHooks/useSparkSocket'
import usePlayer from '../../../hooks/usePlayer'

const OnboardingOverlay = React.lazy(() => import('../v2/OnboardingOverlay'))

/**
 * SparkLayout - Wrapper component for all /play/* routes
 *
 * Responsibilities:
 * 1. Initialize socket connection on mount
 * 2. Keep socket alive across child route navigation
 * 3. Provide basic connection status UI
 */
const SparkLayout = () => {
  const navigate = useNavigate()
  const { isConnected, connectionError, isSocketReady } = useSparkSocket()
  const [showConnectionBanner, setShowConnectionBanner] = useState(false)
  const { player } = usePlayer()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check onboarding status
  const hasOnboardingCompleted = player?.tutorialProgress?.quickClashOnboarding
  const playerLoaded = !!player

  useEffect(() => {
    if (!playerLoaded) return
    if (!hasOnboardingCompleted) {
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [hasOnboardingCompleted, playerLoaded])

  // Check for session
  useEffect(() => {
    const sessionId = localStorage.getItem('playSessionId')
    if (!sessionId) {
      console.log('[SparkLayout] No session found, redirecting to /play')
      navigate('/play', { replace: true })
    }
  }, [navigate])

  // Show connection banner if disconnected for too long
  useEffect(() => {
    let timeout
    if (!isConnected) {
      timeout = setTimeout(() => {
        setShowConnectionBanner(true)
      }, 3000) // Show after 3 seconds of disconnection
    } else {
      setShowConnectionBanner(false)
    }
    return () => clearTimeout(timeout)
  }, [isConnected])

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Connection status banner */}
      {showConnectionBanner && (
        <div style={styles.connectionBanner}>
          <span style={styles.bannerIcon}>⚡</span>
          <span>Reconnecting...</span>
        </div>
      )}

      {/* Onboarding Overlay - First Run only */}
      <Suspense fallback={null}>
        <OnboardingOverlay
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      </Suspense>

      {/* Child routes */}
      <Outlet />
    </div>
  )
}

const styles = {
  connectionBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
    color: 'white',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 500,
    zIndex: 9999,
  },
  bannerIcon: {
    fontSize: 16,
  },
}

export default SparkLayout
