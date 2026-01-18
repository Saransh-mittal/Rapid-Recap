// components/quickClashComponents/v2/QuickClashLayoutV2.jsx
// V2 Layout - Premium UI with smooth animations & background refresh
// Now supports both authenticated users AND session players

import React, { memo, useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Trophy, Users, User, Lock, Award } from 'lucide-react'
import axios from 'axios'

// Haptic feedback
import { haptics } from '../../../utils/haptics'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'
import { fetchTeamBattles } from '../../../redux/quickClashTeamBattleSlice'

// Socket hook
import { useSocket } from '../../../customHooks/useSocket'

// Player hook (works for both auth and session players)
import usePlayer from '../../../hooks/usePlayer'

// Notification manager for team join feedback
import { notificationManager } from '../../../utils/notifications'

// Tab content
import QuickClashV2 from '../../../screens/QuickClashV2'
import BattleHistoryV2 from '../../../screens/BattleHistoryV2'
import TeamsPageV2 from '../../../screens/TeamsPageV2'

// Session player components
import SessionPlayerBanner from './SessionPlayerBanner'
const SessionWelcomeModal = lazy(() => import('./SessionWelcomeModal'))
const LockedTabTeaser = lazy(() => import('./LockedTabTeaser'))
const SessionSignupPanel = lazy(() => import('./SessionSignupPanel'))
const SessionTeamDashboard = lazy(() => import('../team/SessionTeamDashboard'))

// Streak popup - shown on first daily visit for all players
const StreakPopup = lazy(() => import('./StreakPopup'))

// Lazy load QuickClash Profile
const QuickClashProfile = React.lazy(() => import('../profile/QuickClashProfileV2'))
const QuickClashLeaderboardTab = React.lazy(() => import('../leaderboard/QuickClashLeaderboardTab'))

// ============================================================================
// DATA MANAGER - Prefetch & background refresh
// ============================================================================

const DataManager = memo(({ activeTab, isSession }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const initialLoadRef = useRef({ battles: false, history: false, teams: false })

  // Background refresh when switching tabs
  useEffect(() => {
    // For session players, we still try to fetch (the API will use session ID)
    // For authenticated users, we need user._id
    if (!user?._id && !isSession) return

    // On tab change, refresh that tab's data in background
    if (activeTab === 'history') {
      dispatch(fetchTeamBattles({ status: 'completed', page: 1 }))
    } else if (activeTab === 'battles') {
      dispatch(fetchTeamBattles({ status: 'active', page: 1 }))
    }
    // Teams refresh is handled by TeamDashboard internally
    // Profile refresh is handled internally
  }, [activeTab, dispatch, user, isSession])

  return null
})
DataManager.displayName = 'DataManager'

// ============================================================================
// BOTTOM NAVIGATION - Premium with animations + lock icons for session players
// ============================================================================

const BottomNavContent = memo(({ activeTab, onTabChange, isSession, pendingInvitationsCount = 0 }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()

  // Get notification count from Redux for Profile tab badge
  // Exclude team invitations (they're shown in Teams tab with pendingInvitationsCount)
  const { updates, unreadFriendRequests, notification } = useSelector((state) => state.app)
  const notificationCount = React.useMemo(() => {
    // Filter out team invitations from the count
    const unreadUpdates = updates?.filter(u => !u.read && u.type !== 'teamInvitation').length || 0
    const friendRequests = unreadFriendRequests || 0
    const notificationItems = Array.isArray(notification) ? notification.length : 0
    return unreadUpdates + friendRequests + notificationItems
  }, [updates, unreadFriendRequests, notification])

  // Tab configuration with lock status for session players
  const tabs = [
    { id: 'battles', icon: Swords, label: t('Battles'), color: '#22d3ee', glowColor: 'rgba(34, 211, 238, 0.4)', locked: false, badge: 0 },
    { id: 'history', icon: Trophy, label: t('History'), color: '#facc15', glowColor: 'rgba(250, 204, 21, 0.4)', locked: false, badge: 0 },
    { id: 'leaderboard', icon: Award, label: t('Ranks'), color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.4)', locked: false, badge: 0 },
    { id: 'teams', icon: Users, label: t('Teams'), color: '#a78bfa', glowColor: 'rgba(167, 139, 250, 0.4)', locked: isSession, badge: isSession ? 0 : pendingInvitationsCount },
    { id: 'profile', icon: User, label: t('Profile'), color: '#34d399', glowColor: 'rgba(52, 211, 153, 0.4)', locked: isSession, badge: 0 }, // Temporarily hidden notification badge
  ]

  const handleTabClick = useCallback((tabId) => {
    // All tabs now use the same handler - including locked tabs (they show teaser content)
    onTabChange(tabId)
  }, [onTabChange])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
      }}
      className="md:hidden"
    >
      {/* Gradient fade overlay */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          left: 0,
          right: 0,
          height: 40,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.98), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Navigation bar */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div style={{ display: 'flex', maxWidth: 448, margin: '0 auto', position: 'relative' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '12px 0 10px',
                  position: 'relative',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                whileTap={{ scale: 0.92 }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      width: 32,
                      height: 3,
                      backgroundColor: tab.locked ? 'rgba(255,255,255,0.3)' : tab.color,
                      borderRadius: 2,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Icon with lock badge for locked tabs */}
                <motion.div
                  animate={{
                    color: tab.locked
                      ? 'rgba(255, 255, 255, 0.3)'
                      : isActive ? tab.color : 'rgba(255, 255, 255, 0.4)',
                    scale: isActive ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ position: 'relative' }}
                >
                  <Icon style={{ width: 24, height: 24 }} />
                  {tab.locked && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -6,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Lock style={{ width: 7, height: 7, color: 'rgba(255,255,255,0.5)' }} />
                    </div>
                  )}
                  {/* Notification red dot for Profile tab */}
                  {tab.badge > 0 && !tab.locked && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        border: '1.5px solid rgba(15, 23, 42, 0.95)',
                      }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    color: tab.locked
                      ? 'rgba(255, 255, 255, 0.3)'
                      : isActive ? tab.color : 'rgba(255, 255, 255, 0.4)',
                    fontWeight: isActive ? 700 : 500,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ fontSize: 11, letterSpacing: 0.3 }}
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
})
BottomNavContent.displayName = 'BottomNavContent'

const BottomNav = memo(({ activeTab, onTabChange, isSession, pendingInvitationsCount = 0 }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <BottomNavContent activeTab={activeTab} onTabChange={onTabChange} isSession={isSession} pendingInvitationsCount={pendingInvitationsCount} />,
    document.body
  )
})
BottomNav.displayName = 'BottomNav'

// ============================================================================
// TAB CONTENT WRAPPER - Uses z-index stacking to keep tabs mounted & visible
// ============================================================================

const TabContent = memo(({ isActive, children, tabName }) => {
  // Active tab: visible in normal flow
  // Hidden tabs: use display:none to completely remove from layout (fixes scroll issue)
  if (!isActive) {
    return (
      <div style={{ display: 'none' }} aria-hidden="true">
        {children}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }} aria-hidden={false}>
      {children}
    </div>
  )
})
TabContent.displayName = 'TabContent'

// ============================================================================
// MAIN LAYOUT
// ============================================================================

const getTabFromPath = (path) => {
  if (path.includes('/history')) return 'history'
  if (path.includes('/leaderboard')) return 'leaderboard'
  if (path.includes('/teams')) return 'teams'
  if (path.includes('/profile')) return 'profile'
  return 'battles'
}

// Key for localStorage to track if welcome modal has been shown
const WELCOME_SHOWN_KEY = 'qc_session_welcome_shown'

// Key for localStorage to track last streak popup date
const STREAK_POPUP_DATE_KEY = 'qc_streak_popup_date'

// Check if streak popup should be shown today
const shouldShowStreakPopup = () => {
  if (typeof window === 'undefined') return false
  const lastShownDate = localStorage.getItem(STREAK_POPUP_DATE_KEY)
  const today = new Date().toLocaleDateString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
  return lastShownDate !== today
}

const QuickClashLayoutV2 = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Get player info (works for both auth users and session players)
  const { isSession, isAuthenticated, player } = usePlayer()

  // Socket hook for real-time updates
  const { getSocket, socketConnected } = useSocket()

  // Use window.location.pathname directly for initialization - always accurate
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname))

  // Welcome modal state (for session players)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Signup panel state (for session player account creation)
  const [showSignupPanel, setShowSignupPanel] = useState(false)

  // Streak popup state (for daily streak reminder)
  const [showStreakPopup, setShowStreakPopup] = useState(false)

  // State to trigger opening the GlobalMatchmaking modal externally
  const [forceOpenMatchmaking, setForceOpenMatchmaking] = useState(false)

  // Pending matchmaking flag - waits for welcome modal to close
  const [pendingAutoMatchmaking, setPendingAutoMatchmaking] = useState(false)

  // Pending team invitations count for Teams tab badge
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0)

  // Track the last location.key to detect real navigation vs replaceState
  const lastLocationKey = useRef(location.key)

  // Fetch pending invitations count on mount and listen for socket events
  useEffect(() => {
    if (isSession) return // Session players don't have invitations

    // Fetch initial count
    const fetchPendingInvitations = async () => {
      try {
        const response = await axios.get('/api/quickClash/team/invitations/pending')
        if (response.data.success) {
          setPendingInvitationsCount(response.data.invitations?.length || 0)
        }
      } catch (error) {
        console.error('Failed to fetch pending invitations:', error)
      }
    }

    fetchPendingInvitations()

    // Listen for socket events - only when socket is connected
    const socket = getSocket()
    if (!socket) {
      console.log('[QuickClashLayoutV2] Socket not ready yet for invitation listeners')
      return
    }

    console.log('[QuickClashLayoutV2] Setting up invitation socket listeners')

    // When a new invitation is received
    const handleInvitationReceived = (data) => {
      console.log('[QuickClashLayoutV2] Received team invitation:', data)
      // Show toast notification
      const inviterName = data.inviterName || 'Someone'
      const teamName = data.teamName || 'a team'
      notificationManager.matchmaking(
        'New Team Invite!',
        `${inviterName} invited you to join ${teamName}`
      )
      // Increment the badge count
      setPendingInvitationsCount(prev => prev + 1)
    }

    // When an invitation is handled (accepted/rejected)
    const handleInvitationHandled = () => {
      // Refresh the count
      fetchPendingInvitations()
    }

    socket.on('quickClash:teamInvitationReceived', handleInvitationReceived)
    socket.on('quickClash:teamInvitationAccepted', handleInvitationHandled)
    socket.on('quickClash:teamInvitationRejected', handleInvitationHandled)

    return () => {
      socket.off('quickClash:teamInvitationReceived', handleInvitationReceived)
      socket.off('quickClash:teamInvitationAccepted', handleInvitationHandled)
      socket.off('quickClash:teamInvitationRejected', handleInvitationHandled)
    }
  }, [isSession, getSocket, socketConnected]) // Added socketConnected to re-run when socket becomes available

  // Check if welcome modal should be shown for session players
  useEffect(() => {
    if (isSession) {
      const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY)
      const showWelcomeFromNav = location.state?.showWelcome
      const autoMatchmaking = location.state?.autoMatchmaking

      if (!hasSeenWelcome || showWelcomeFromNav) {
        // Delay modal to let the UI load first
        const timer = setTimeout(() => {
          setShowWelcomeModal(true)
          localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
          // Queue auto-matchmaking for after welcome modal closes
          if (autoMatchmaking) {
            setPendingAutoMatchmaking(true)
          }
        }, 500)
        return () => clearTimeout(timer)
      } else if (autoMatchmaking) {
        // No welcome modal needed, directly open matchmaking
        const timer = setTimeout(() => {
          setForceOpenMatchmaking(true)
          // Clear the navigation state to prevent re-triggering
          navigate(location.pathname, { replace: true, state: {} })
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [isSession, location.state, location.pathname, navigate])

  // Check if signup panel should be opened (from "Save Streak Forever" etc.)
  useEffect(() => {
    if (isSession && location.state?.showSignup) {
      // Delay slightly to let the page render
      const timer = setTimeout(() => {
        setShowSignupPanel(true)
        // Clear the state to prevent re-opening on refresh
        navigate(location.pathname, { replace: true, state: {} })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isSession, location.state?.showSignup, location.pathname, navigate])

  // Handle team join result from TeamJoinRedirect
  useEffect(() => {
    const { teamJoined, teamJoinError, teamJoinMessage } = location.state || {}

    if (teamJoined) {
      notificationManager.success(teamJoinMessage || 'Successfully joined the team!')
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} })
    } else if (teamJoinError) {
      notificationManager.error(teamJoinMessage || 'Failed to join team')
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  // Check if streak popup should be shown on daily first visit
  useEffect(() => {
    // Only show if player data is loaded
    if (!player) return

    // Check if already shown today
    if (!shouldShowStreakPopup()) return

    // For session players, show after welcome modal is dismissed
    // For authenticated users, show immediately
    const delay = isSession ? 1500 : 800

    const timer = setTimeout(() => {
      // Don't show streak popup if welcome modal is open
      if (showWelcomeModal) return

      setShowStreakPopup(true)
      // Mark as shown today
      const today = new Date().toLocaleDateString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
      localStorage.setItem(STREAK_POPUP_DATE_KEY, today)
    }, delay)

    return () => clearTimeout(timer)
  }, [player, isSession, showWelcomeModal])

  const handleTabChange = useCallback((tabId) => {
    if (tabId === activeTab) return

    haptics.selection() // Tactile feedback on tab switch
    quizAudioService.playButtonClick() // Audio feedback on tab switch
    setActiveTab(tabId)

    // Update URL silently (doesn't change location.key)
    const paths = {
      battles: '/quickclash',
      history: '/quickclash/history',
      leaderboard: '/quickclash/leaderboard',
      teams: '/quickclash/teams',
      profile: '/quickclash/profile'
    }
    window.history.replaceState(null, '', paths[tabId])
  }, [activeTab])

  // Sync activeTab when location.key changes (real navigation, not replaceState)
  // This handles navigation BACK from TeamBattlePage
  useEffect(() => {
    // If location.key changed, this is a real navigation (not replaceState)
    if (location.key !== lastLocationKey.current) {
      lastLocationKey.current = location.key
      const expectedTab = getTabFromPath(location.pathname)
      setActiveTab(expectedTab)
    }
  }, [location.key, location.pathname])

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Handler for "Create Account" actions - opens signup panel
  const handleCreateAccount = useCallback(() => {
    haptics.impact()
    quizAudioService.playSubmit()
    // Open the signup slide-over panel
    setShowSignupPanel(true)
  }, [])

  // Check if a tab is locked for session players
  const isTabLocked = useCallback((tabId) => {
    if (!isSession) return false
    return tabId === 'teams' || tabId === 'profile'
  }, [isSession])

  return (
    <>
      {/* Background data refresh on tab change */}
      <DataManager activeTab={activeTab} isSession={isSession} />

      {/* Session Player Banner (only for session players) */}
      {isSession && player && (
        <SessionPlayerBanner player={player} onCreateAccount={handleCreateAccount} />
      )}

      {/* Tab content container with proper stacking context */}
      <div style={{ position: 'relative' }}>
        {/* Battles Tab - Available for all */}
        <TabContent isActive={activeTab === 'battles'} tabName="battles">
          <QuickClashV2
            forceOpenMatchmaking={forceOpenMatchmaking}
            onForceOpenReset={() => setForceOpenMatchmaking(false)}
          />
        </TabContent>

        {/* History Tab - Available for all (with session notice for session players) */}
        <TabContent isActive={activeTab === 'history'} tabName="history">
          <BattleHistoryV2 />
        </TabContent>

        {/* Leaderboard Tab - Available for all */}
        <TabContent isActive={activeTab === 'leaderboard'} tabName="leaderboard">
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            </div>
          }>
            <div className="pb-20 md:pb-4">
              <QuickClashLeaderboardTab />
            </div>
          </React.Suspense>
        </TabContent>

        {/* Teams Tab - Session players get view-only team dashboard */}
        <TabContent isActive={activeTab === 'teams'} tabName="teams">
          {isSession ? (
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              </div>
            }>
              <SessionTeamDashboard onCreateAccount={handleCreateAccount} />
            </Suspense>
          ) : (
            <TeamsPageV2 isActive={activeTab === 'teams'} />
          )}
        </TabContent>

        {/* Profile Tab - Locked for session players */}
        <TabContent isActive={activeTab === 'profile'} tabName="profile">
          {isSession ? (
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            }>
              <LockedTabTeaser tabType="profile" onCreateAccount={handleCreateAccount} />
            </Suspense>
          ) : (
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            }>
              <div className="pb-20 md:pb-4">
                <QuickClashProfile />
              </div>
            </React.Suspense>
          )}
        </TabContent>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} isSession={isSession} pendingInvitationsCount={pendingInvitationsCount} />

      {/* Session Player Welcome Modal */}
      {isSession && (
        <Suspense fallback={null}>
          <SessionWelcomeModal
            isOpen={showWelcomeModal}
            onClose={() => {
              setShowWelcomeModal(false)
              // Trigger matchmaking if it was pending (from Play Next Match flow)
              if (pendingAutoMatchmaking) {
                setPendingAutoMatchmaking(false)
                // Small delay to let the modal animate out
                setTimeout(() => {
                  setForceOpenMatchmaking(true)
                  // Clear navigation state
                  navigate(location.pathname, { replace: true, state: {} })
                }, 300)
              }
            }}
            onCreateAccount={handleCreateAccount}
          />
        </Suspense>
      )}

      {/* Session Player Signup Panel - Slide-over for account creation */}
      {isSession && (
        <Suspense fallback={null}>
          <SessionSignupPanel
            isOpen={showSignupPanel}
            onClose={() => setShowSignupPanel(false)}
            sessionPlayer={player}
          />
        </Suspense>
      )}

      {/* Daily Streak Popup - for all players (session + authenticated) */}
      <Suspense fallback={null}>
        <StreakPopup
          isOpen={showStreakPopup}
          onClose={() => setShowStreakPopup(false)}
          onPlayBattle={() => {
            // Navigate to battles tab if not already there
            if (activeTab !== 'battles') {
              handleTabChange('battles')
            }
            // Open the GlobalMatchmaking modal
            setForceOpenMatchmaking(true)
          }}
          onCreateAccount={isSession ? handleCreateAccount : undefined}
          streak={player?.streak}
          isSessionPlayer={isSession}
        />
      </Suspense>
    </>
  )
}

QuickClashLayoutV2.displayName = 'QuickClashLayoutV2'
export default memo(QuickClashLayoutV2)
