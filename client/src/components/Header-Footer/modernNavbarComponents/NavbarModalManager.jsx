import React, { memo, Suspense, useEffect, useMemo, useState } from 'react'
import { Flex, Spinner } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import {
  markFriendRequestsAsRead,
  setIsNotifDrawerOpen,
  setIsNotifModalOpen,
  setShowDailyStreakModal,
  setShowIQScoreModal,
  setShowXpLevelModal,
} from '../../../redux/appSlice'
import { useTranslation } from 'react-i18next'
import { createPreloadableComponents } from '../../../utils/lazyLoading'

// Lazy load all modals and drawers
const WiseWeb = React.lazy(() => import('./modals/WiseWeb'))
const UserSearchDrawer = React.lazy(() =>
  import('../../miscellaneous/UserSearchDrawer'),
)
const modalComponents = {
  NotificationModal: () => import('./modals/NotificationModal'),
  XPLevelModal: () => import('./modals/XPLevelModal'),
  DailyStreakModal: () => import('./modals/DailyStreakModal'),
  IQScoreModal: () => import('./modals/IQScoreModal'),
}
const drawerComponents = {
  NotificationDrawer: () => import('./drawers/NotificationDrawer'),
  HamburgerDrawer: () => import('./drawers/HamburgerDrawer'),
}

const LazyDrawers = createPreloadableComponents(drawerComponents)
const LazyModals = createPreloadableComponents(modalComponents)

// Loading fallback component
const ModalLoader = () => (
  <Flex
    position="fixed"
    top={0}
    left={0}
    right={0}
    bottom={0}
    bg="rgba(0,0,0,0.4)"
    zIndex={1000}
    justify="center"
    align="center"
  >
    <Spinner color="purple.500" size="xl" />
  </Flex>
)

const NavbarModalManager = memo(
  ({
    isHamburgerOpen,
    setIsHamburgerOpen,
    isOpenUserSearch,
    onCloseUserSearch,
    handleLogout,
  }) => {
    const dispatch = useDispatch()
    const [selectedNotification, setSelectedNotification] = useState(null)

    const { t } = useTranslation('Navbar')

    // Get all necessary state from Redux
    const {
      isNotifDrawerOpen,
      isNotifModalOpen,
      showXpLevelModal,
      showDailyStreakModal,
      showIQScoreModal,
      isWiseWebOpen,
      updates,
      unreadFriendRequests,
    } = useSelector(state => state.app)

    const { user, isAuthenticated } = useSelector(state => state.auth)

    const handleCloseXPModal = () => {
      dispatch(setShowXpLevelModal(false))
    }
    const navItems = useMemo(
      () => [
        { key: 'Home', label: t('home'), path: '/home' },
        { key: 'Dashboard', label: t('dashboard'), path: '/dashboard' },
        { key: 'Tournament', label: t('tournament'), path: '/tournament' },
        { key: 'Leaderboard', label: t('leaderboard'), path: '/leaderboard' },
        {
          key: 'HallOfChampions',
          label: t('hallOfChampions'),
          path: '/hall-of-champions',
        },
      ],
      [t],
    )
    useEffect(() => {
      // Immediately preload the most commonly used modals
      LazyModals.IQScoreModal.preload()
      LazyModals.XPLevelModal.preload()
      LazyDrawers.HamburgerDrawer.preload()
      LazyModals.DailyStreakModal.preload()
      // Preload other modals during idle time
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          LazyModals.NotificationModal.preload()
          LazyDrawers.NotificationDrawer.preload()
        })
      }
    }, [])
    return (
      <>
        {/* Notification Drawer */}
        {isNotifDrawerOpen && (
          <Suspense fallback={<ModalLoader />}>
            <LazyDrawers.NotificationDrawer
              setIsHamburgerOpen={setIsHamburgerOpen}
              setIsDrawerOpen={val => dispatch(setIsNotifDrawerOpen(val))}
              setIsModalOpen={val => dispatch(setIsNotifModalOpen(val))}
              setSelectedNotification={setSelectedNotification}
            />
          </Suspense>
        )}

        {
          /* Notification Modal */
          isNotifModalOpen && (
            <Suspense fallback={<ModalLoader />}>
              <LazyModals.NotificationModal
                selectedNotification={selectedNotification}
                setIsModalOpen={val => dispatch(setIsNotifModalOpen(val))}
                setIsDrawerOpen={val => dispatch(setIsNotifDrawerOpen(val))}
              />
            </Suspense>
          )
        }

        {
          /* User Search Drawer */
          isOpenUserSearch && (
            <Suspense fallback={<ModalLoader />}>
              <UserSearchDrawer
                isOpen={isOpenUserSearch}
                onClose={onCloseUserSearch}
              />
            </Suspense>
          )
        }

        {/* XP Level Modal */}
        {showXpLevelModal && (
          <Suspense fallback={null}>
            <LazyModals.XPLevelModal
              xp={user?.xp}
              level={user?.level}
              onClose={handleCloseXPModal}
            />
          </Suspense>
        )}

        {/* Daily Streak Modal */}
        {showDailyStreakModal && (
          <Suspense fallback={null}>
            <LazyModals.DailyStreakModal
              setShowDailyStreakModal={val =>
                dispatch(setShowDailyStreakModal(val))
              }
            />
          </Suspense>
        )}

        {/* IQ Score Modal */}
        {showIQScoreModal && (
          <Suspense fallback={null}>
            <LazyModals.IQScoreModal
              setShowIQScoreModal={val => dispatch(setShowIQScoreModal(val))}
              isGuest={user?.role === 'guest'}
            />
          </Suspense>
        )}

        {/* Wise Web Modal */}
        {/* {isWiseWebOpen && (
        <Suspense fallback={<ModalLoader />}>
          <WiseWeb
            isOpen={isWiseWebOpen}
            onClose={() => dispatch(setIsWiseWebOpen(false))}
            setIsHamburgerOpen={setIsHamburgerOpen}
            requestNotif={unreadFriendRequests > 0}
            markRequestAsRead={() => dispatch(markFriendRequestsAsRead())}
          />
        </Suspense>
      )} */}
        {/* Hamburger Drawer */}
        {isHamburgerOpen && (
          <Suspense fallback={null}>
            <LazyDrawers.HamburgerDrawer
              isOpen={isHamburgerOpen}
              onClose={() => setIsHamburgerOpen(false)}
              navItems={navItems}
              notLogined={!isAuthenticated}
              navLinkRefs={{ current: [] }}
              handleLogout={handleLogout}
              notifyCont={updates?.filter(u => !u.read).length}
              setIsDrawerOpen={val => dispatch(setIsNotifDrawerOpen(val))}
              onOpenWiseWeb={() => {
                /* Add your WiseWeb open logic here */
              }}
            />
          </Suspense>
        )}
      </>
    )
  },
)

NavbarModalManager.displayName = 'NavbarModalManager'

export default NavbarModalManager
