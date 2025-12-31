// components/quickClashComponents/v2/QuickClashLayoutV2.jsx
// V2 Layout - Premium UI with smooth animations & background refresh

import React, { memo, useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Trophy, Users, User } from 'lucide-react'

// Haptic feedback
import { haptics } from '../../../utils/haptics'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'
import { fetchTeamBattles } from '../../../redux/quickClashTeamBattleSlice'

// Tab content
import QuickClashV2 from '../../../screens/QuickClashV2'
import BattleHistoryV2 from '../../../screens/BattleHistoryV2'
import TeamsPageV2 from '../../../screens/TeamsPageV2'

// Lazy load QuickClash Profile
const QuickClashProfile = React.lazy(() => import('../profile/QuickClashProfileV2'))

// ============================================================================
// DATA MANAGER - Prefetch & background refresh
// ============================================================================

const DataManager = memo(({ activeTab }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const initialLoadRef = useRef({ battles: false, history: false, teams: false })

  // Background refresh when switching tabs
  useEffect(() => {
    if (!user?._id) return

    // On tab change, refresh that tab's data in background
    if (activeTab === 'history') {
      dispatch(fetchTeamBattles({ status: 'completed', page: 1 }))
    } else if (activeTab === 'battles') {
      dispatch(fetchTeamBattles({ status: 'active', page: 1 }))
    }
    // Teams refresh is handled by TeamDashboard internally
  }, [activeTab, dispatch, user])

  return null
})
DataManager.displayName = 'DataManager'

// ============================================================================
// BOTTOM NAVIGATION - Premium with animations
// ============================================================================

const BottomNavContent = memo(({ activeTab, onTabChange }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const tabs = [
    { id: 'battles', icon: Swords, label: t('Battles'), color: '#22d3ee', glowColor: 'rgba(34, 211, 238, 0.4)' },
    { id: 'history', icon: Trophy, label: t('History'), color: '#facc15', glowColor: 'rgba(250, 204, 21, 0.4)' },
    { id: 'teams', icon: Users, label: t('Teams'), color: '#a78bfa', glowColor: 'rgba(167, 139, 250, 0.4)' },
    { id: 'profile', icon: User, label: t('Profile'), color: '#34d399', glowColor: 'rgba(52, 211, 153, 0.4)' },
  ]

  const handleTabClick = useCallback((tabId) => {
    // All tabs now use the same handler - profile is a real tab
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
                      backgroundColor: tab.color,
                      borderRadius: 2,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  animate={{
                    color: isActive ? tab.color : 'rgba(255, 255, 255, 0.4)',
                    scale: isActive ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ position: 'relative' }}
                >
                  <Icon style={{ width: 24, height: 24 }} />
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    color: isActive ? tab.color : 'rgba(255, 255, 255, 0.4)',
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

const BottomNav = memo(({ activeTab, onTabChange }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <BottomNavContent activeTab={activeTab} onTabChange={onTabChange} />,
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
  if (path.includes('/teams')) return 'teams'
  if (path.includes('/profile')) return 'profile'
  return 'battles'
}

const QuickClashLayoutV2 = () => {
  const location = useLocation()
  // Use window.location.pathname directly for initialization - always accurate
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname))

  // Track the last location.key to detect real navigation vs replaceState
  const lastLocationKey = useRef(location.key)


  const handleTabChange = useCallback((tabId) => {
    if (tabId === activeTab) return

    haptics.selection() // Tactile feedback on tab switch
    quizAudioService.playButtonClick() // Audio feedback on tab switch
    setActiveTab(tabId)

    // Update URL silently (doesn't change location.key)
    const paths = {
      battles: '/quickclash',
      history: '/quickclash/history',
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

  return (
    <>
      {/* Background data refresh on tab change */}
      <DataManager activeTab={activeTab} />

      {/* Tab content container with proper stacking context */}
      <div style={{ position: 'relative' }}>
        {/* Active tab content - conditionally rendered for proper remounting */}
        <TabContent isActive={activeTab === 'battles'} tabName="battles">
          <QuickClashV2 />
        </TabContent>
        <TabContent isActive={activeTab === 'history'} tabName="history">
          <BattleHistoryV2 />
        </TabContent>
        <TabContent isActive={activeTab === 'teams'} tabName="teams">
          <TeamsPageV2 />
        </TabContent>
        <TabContent isActive={activeTab === 'profile'} tabName="profile">
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          }>
            <div className="pb-20 md:pb-4">
              <QuickClashProfile />
            </div>
          </React.Suspense>
        </TabContent>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  )
}

QuickClashLayoutV2.displayName = 'QuickClashLayoutV2'
export default memo(QuickClashLayoutV2)
