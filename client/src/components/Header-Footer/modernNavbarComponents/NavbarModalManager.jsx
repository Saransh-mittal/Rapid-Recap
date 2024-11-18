import React, { memo, Suspense, useState } from 'react'
import { Flex, Spinner, useToast } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import {
  markFriendRequestsAsRead,
  setIsNotifDrawerOpen,
  setIsNotifModalOpen,
  setShowDailyStreakModal,
  setShowIQScoreModal,
  setShowXpLevelModal,
} from '../../../redux/appSlice'

// Lazy load all modals and drawers
const NotificationDrawer = React.lazy(() =>
  import('./drawers/NotificationDrawer'),
)
const NotificationModal = React.lazy(() => import('./modals/NotificationModal'))
const XPLevelModal = React.lazy(() => import('./modals/XPLevelModal'))
const DailyStreakModal = React.lazy(() => import('./modals/DailyStreakModal'))
const IQScoreModal = React.lazy(() => import('./modals/IQScoreModal'))
const WiseWeb = React.lazy(() => import('./modals/WiseWeb'))
const HamburgerDrawer = React.lazy(() => import('./drawers/HamburgerDrawer'))
const UserSearchDrawer = React.lazy(() =>
  import('../../miscellaneous/UserSearchDrawer'),
)

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
    const toast = useToast()
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

    const navItems = [
      { label: 'Home', path: '/home/all' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Tournament', path: '/tournament' },
      { label: 'Leaderboard', path: '/leaderboard' },
    ]
    return (
      <>
        {/* Notification Drawer */}
        {isNotifDrawerOpen && (
          <Suspense fallback={<ModalLoader />}>
            <NotificationDrawer
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
              <NotificationModal
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
          <Suspense fallback={<ModalLoader />}>
            <XPLevelModal
              xp={user?.xp}
              level={user?.level}
              onClose={handleCloseXPModal}
            />
          </Suspense>
        )}

        {/* Daily Streak Modal */}
        {showDailyStreakModal && (
          <Suspense fallback={<ModalLoader />}>
            <DailyStreakModal
              setShowDailyStreakModal={val =>
                dispatch(setShowDailyStreakModal(val))
              }
            />
          </Suspense>
        )}

        {/* IQ Score Modal */}
        {showIQScoreModal && (
          <Suspense fallback={<ModalLoader />}>
            <IQScoreModal
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
          <Suspense fallback={<ModalLoader />}>
            <HamburgerDrawer
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
