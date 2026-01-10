// SparkLayout.jsx
// Route wrapper for /play/* routes - initializes shared socket
import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import useSparkSocket from '../../../customHooks/useSparkSocket'

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
