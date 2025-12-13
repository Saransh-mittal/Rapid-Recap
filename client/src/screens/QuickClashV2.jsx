// screens/QuickClashV2.jsx
// V2 Quick Clash - Battles Tab - NO lazy loading for instant render

import React, { useCallback, useState, useEffect, memo, lazy, Suspense, useRef } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'

// V2 Components - DIRECT imports (no lazy loading for tab content)
import QuickClashHeaderV2 from '../components/quickClashComponents/v2/QuickClashHeaderV2'
import ActiveChallengesV2 from '../components/quickClashComponents/v2/ActiveChallengesV2'
import GlobalMatchmakingButton from '../components/quickClashComponents/globalmatchmaking/GlobalMatchmakingButton'

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
const TaskCompletionHandler = lazy(() =>
  import('../components/quickClashComponents/dailyTasks/TaskCompletionHandler.jsx')
)
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

const QuickClashV2 = () => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const toast = useToast()

  // Refs to prevent re-running effects
  const authCheckedRef = useRef(false)
  const updatesLoadedRef = useRef(false)

  // State
  const [isAuthorized, setIsAuthorized] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [comingSoonData, setComingSoonData] = useState(null)
  const [selectedNotification, setSelectedNotification] = useState(null)

  // Redux
  const { loginCheckStatus, user } = useSelector((state) => state.auth)
  const { updatesLoading, isNotifModalOpen, isNotifDrawerOpen } = useSelector(
    (state) => state.app
  )

  // Matchmaking hook
  const { checkMatchmakingStatus } = useQuickClashGlobalMatchmaking()

  // Background authorization check - only once
  const checkAuthorization = useCallback(async () => {
    if (authCheckedRef.current) return
    authCheckedRef.current = true

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
  }, [])

  useEffect(() => {
    if (user && loginCheckStatus === 'fulfilled') {
      checkAuthorization()
    }
  }, [user, loginCheckStatus, checkAuthorization])

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled' && isAuthorized && !updatesLoadedRef.current) {
      updatesLoadedRef.current = true
      dispatch(fetchAppUpdates())
    }
  }, [loginCheckStatus, isAuthorized, dispatch])

  useEffect(() => {
    if (isAuthorized && loginCheckStatus === 'fulfilled') {
      checkMatchmakingStatus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginCheckStatus, isAuthorized])

  // Coming soon
  if (authChecked && !isAuthorized) {
    return (
      <Suspense fallback={null}>
        <QuickClashComingSoon comingSoonData={comingSoonData} />
      </Suspense>
    )
  }

  // Main content - NO lazy loading, NO entrance animations
  return (
    <>
      <div className="relative z-10 w-full max-w-lg mx-auto px-3 pt-2 pb-20 md:pb-8 md:max-w-4xl lg:max-w-6xl">
        {/* Header - direct render */}
        <QuickClashHeaderV2 />

        {/* Matchmaking - DIRECT import, no Suspense */}
        <div className="mt-4 mb-4">
          <GlobalMatchmakingButton />
        </div>

        {/* Active Battles */}
        <ActiveChallengesV2 />

        {/* Background handlers */}
        <Suspense fallback={null}>
          <TaskCompletionHandler />
        </Suspense>
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
