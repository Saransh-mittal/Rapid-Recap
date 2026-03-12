// screens/QuickClashV2.jsx
// V2 Quick Clash - Battles Tab - NO lazy loading for instant render
// Now supports both authenticated users AND session players

import React, { useCallback, useState, useEffect, memo, lazy, Suspense, useRef } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'

// V2 Components - DIRECT imports (no lazy loading for tab content)
import QuickClashHeaderV2 from '../components/quickClashComponents/v2/QuickClashHeaderV2'
import ActiveChallengesV2 from '../components/quickClashComponents/v2/ActiveChallengesV2'
import GlobalMatchmakingButton from '../components/quickClashComponents/globalmatchmaking/GlobalMatchmakingButton'
import SoloDrillButton from '../components/quickClashComponents/soloDrill/SoloDrillButton'
import SoloDrillModal from '../components/quickClashComponents/soloDrill/SoloDrillModal'
import { Helmet } from 'react-helmet'

// Player hook (works for both auth and session players)
import usePlayer from '../hooks/usePlayer'

// Tutorial hook
import { useTutorial } from '../components/quickClashComponents/v2/tutorial/TutorialManager'

// Redux actions
import {
  fetchAppUpdates,
  setIsNotifDrawerOpen,
  setIsNotifModalOpen,
} from '../redux/appSlice'

// Lazy loaded - ONLY for modals (rarely shown)
const NotificationDrawer = lazy(() =>
  import('../components/Header-Footer/modernNavbarComponents/drawers/NotificationDrawer.jsx')
)
const NotificationModal = lazy(() =>
  import('../components/Header-Footer/modernNavbarComponents/modals/NotificationModal.jsx')
)
// TEMPORARILY DISABLED - Daily Tasks feature
// const TaskCompletionHandler = lazy(() =>
//   import('../components/quickClashComponents/dailyTasks/TaskCompletionHandler.jsx')
// )
const BattleCreationNotifications = lazy(() =>
  import('../components/quickClashComponents/BattleCreationNotifications.jsx')
)
const QuickClashComingSoon = lazy(() =>
  import('../components/quickClashComponents/QuickClashComingSoon')
)

// Hooks
import useQuickClashGlobalMatchmaking from '../customHooks/useQuickClashGlobalMatchmaking'
import { ModalLoader } from '../components/Header-Footer/modernNavbarComponents/NavbarModalManager.jsx'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QuickClashV2 = ({ forceOpenMatchmaking = false, onForceOpenReset, onCreateAccount }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()

  // Get player info (works for both auth users and session players)
  const { isSession, isAuthenticated, player, playerId } = usePlayer()

  // Tutorial context for squad_intro completion
  const tutorialContext = useTutorial()

  // Refs to prevent re-running effects
  const authCheckedRef = useRef(false)
  const updatesLoadedRef = useRef(false)

  // State
  const [isAuthorized, setIsAuthorized] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [comingSoonData, setComingSoonData] = useState(null)
  const [selectedNotification, setSelectedNotification] = useState(null)

  // Redux (still need for notifications etc)
  const { loginCheckStatus, user } = useSelector((state) => state.auth)
  const { updatesLoading, isNotifModalOpen, isNotifDrawerOpen } = useSelector(
    (state) => state.app
  )

  // Matchmaking hook
  const { checkMatchmakingStatus } = useQuickClashGlobalMatchmaking()

  // Background authorization check - only once
  // Skip for session players (they don't need auth check)
  const checkAuthorization = useCallback(async () => {
    if (authCheckedRef.current) return
    authCheckedRef.current = true

    // Session players bypass authorization check
    if (isSession) {
      setIsAuthorized(true)
      setAuthChecked(true)
      return
    }

    try {
      await axios.get('/api/quickClash/stats')
      setIsAuthorized(true)
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.isComingSoon) {
        setIsAuthorized(false)
        setComingSoonData(error.response.data.comingSoonData)
      }
    } finally {
      setAuthChecked(true)
    }
  }, [isSession])

  useEffect(() => {
    // Run authorization check for authenticated users OR session players
    if ((user && loginCheckStatus === 'fulfilled') || isSession) {
      checkAuthorization()
    }
  }, [user, loginCheckStatus, checkAuthorization, isSession])

  useEffect(() => {
    // Fetch app updates only for authenticated users
    if (loginCheckStatus === 'fulfilled' && isAuthorized && !updatesLoadedRef.current && !isSession) {
      updatesLoadedRef.current = true
      dispatch(fetchAppUpdates())
    }
  }, [loginCheckStatus, isAuthorized, dispatch, isSession])

  useEffect(() => {
    // Check matchmaking status for both auth users and session players
    if (isAuthorized && ((loginCheckStatus === 'fulfilled') || isSession)) {
      checkMatchmakingStatus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginCheckStatus, isAuthorized, isSession])

  // Coming soon - only applicable for authenticated users
  if (authChecked && !isAuthorized && !isSession) {
    return (
      <Suspense fallback={null}>
        <QuickClashComingSoon comingSoonData={comingSoonData} />
      </Suspense>
    )
  }

  // Main content - NO lazy loading, NO entrance animations
  return (
    <>
      <Helmet>
        <title>Dashboard - Quick Clash | Rapid Recap</title>
      </Helmet>
      <div className="relative z-10 w-full max-w-lg mx-auto px-3 pt-2 pb-20 md:pb-8 md:max-w-4xl lg:max-w-6xl">
        {/* Header - direct render */}
        <QuickClashHeaderV2 />

        {/* Action Buttons - SQUAD + SOLO DRILL */}
        <div className="mt-4 mb-4 grid grid-cols-2 gap-3">
          <GlobalMatchmakingButton
            forceOpenModal={forceOpenMatchmaking}
            onForceOpenReset={onForceOpenReset}
            withBottomMargin={false}
            buttonWidth="100%"
            buttonMinWidth={{ base: '0px', md: '0px' }}
            isTutorialHighlighted={tutorialContext?.activeTutorial === 'squad_intro'}
            onSquadClick={() => {
              // Complete squad_intro tutorial when user clicks the button
              if (tutorialContext?.activeTutorial === 'squad_intro' && tutorialContext?.completeTutorial) {
                tutorialContext.completeTutorial('squad_intro')
              }
            }}
          />
          <SoloDrillButton
            buttonWidth="100%"
            isTutorialHighlighted={tutorialContext?.activeTutorial === 'solo_drill'}
            onSoloDrillClick={() => {
              if (tutorialContext?.activeTutorial === 'solo_drill' && tutorialContext?.completeTutorial) {
                tutorialContext.completeTutorial('solo_drill')
              }
            }}
            onCreateAccount={onCreateAccount}
          />
        </div>

        <SoloDrillModal />

        {/* Active Battles */}
        <ActiveChallengesV2 />

        {/* TEMPORARILY DISABLED - Daily Tasks feature
        <Suspense fallback={null}>
          <TaskCompletionHandler />
        </Suspense>
        */}
      </div>

      {/* Notifications - only when needed */}
      {isNotifDrawerOpen && (
        <Suspense fallback={null}>
          <NotificationDrawer
            setIsDrawerOpen={(val) => dispatch(setIsNotifDrawerOpen(val))}
            setIsModalOpen={(val) => dispatch(setIsNotifModalOpen(val))}
            setSelectedNotification={setSelectedNotification}
            setIsHamburgerOpen={() => {}}
          />
        </Suspense>
      )}

      {isNotifModalOpen && (
        <Suspense fallback={<ModalLoader />}>
          <NotificationModal
            selectedNotification={selectedNotification}
            setIsModalOpen={(val) => dispatch(setIsNotifModalOpen(val))}
            setIsDrawerOpen={(val) => dispatch(setIsNotifDrawerOpen(val))}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <BattleCreationNotifications />
      </Suspense>
    </>
  )
}

QuickClashV2.displayName = 'QuickClashV2'

export default memo(QuickClashV2)
