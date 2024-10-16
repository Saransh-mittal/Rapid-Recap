import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'
import axios from 'axios'
import {
  useToast,
  Button,
  Flex,
  Box,
  useMediaQuery,
  useDisclosure,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAuth, verifyAdminStatus } from '../../redux/authSlice'
import {
  fetchAppUpdates,
  fetchDailyStreak,
  fetchUnreadFriendRequestsCount,
  logoutApp,
  markFriendRequestsAsRead,
  resetAllState,
  resetLoadingFlags,
  setIsNotifDrawerOpen,
  setIsNotifModalOpen,
} from '../../redux/appSlice'
import useSound from '../../customHooks/useSound'
import Loading from '../miscellaneous/Loading'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { useNavbar } from '../../contextAPI/NavbarContext'

const LoadingContext = React.createContext()

// HOC to wrap lazy components
const withLoadTracking = (WrappedComponent, componentName) => {
  return function WithLoadTracking(props) {
    const { onComponentLoad } = React.useContext(LoadingContext)

    useEffect(() => {
      onComponentLoad(componentName)
    }, [])

    return <WrappedComponent {...props} />
  }
}

// Lazy load components
const getLazyComponent = (importFunc, componentName) => {
  return React.lazy(() =>
    importFunc().then(module => ({
      default: withLoadTracking(module.default, componentName),
    })),
  )
}
// Lazy load components
const NotificationDrawer = React.lazy(() =>
  import('./Inbox/NotificationDrawer'),
)
const DailyStreakModal = React.lazy(() =>
  import('../streakComponents/DailyStreakModal'),
)
const NotificationModal = React.lazy(() => import('./Inbox/NotificationModal'))

const IQScoreModal = React.lazy(() => import('./navbarComponents/IQScoreModal'))
const WiseWeb = React.lazy(() => import('./navbarComponents/WiseWeb'))
const OutsideNavbarContent = getLazyComponent(
  () => import('./navbarComponents/OutsideNavbarContent'),
  'OutsideNavbarContent',
)
const NavBrand = getLazyComponent(
  () => import('./navbarComponents/NavBrand'),
  'NavBrand',
)
const HamburgerModal = getLazyComponent(
  () => import('./navbarComponents/HamburgerModal'),
  'HamburgerModal',
)
const NavbarContent = getLazyComponent(
  () => import('./navbarComponents/NavbarContent'),
  'NavbarContent',
)
const Navbar = ({ onNavbarLoad }) => {
  const { t } = useTranslation('Navbar')
  const isSmallerThan992 = useMediaQuery('(max-width: 992px)')[0]
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { playClick } = useSound()
  const navLinkRefs = useRef([])
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false)
  const cancelRef = React.useRef()

  const [apiCallsComplete, setApiCallsComplete] = useState(false)
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)

  const [visible, setVisible] = useState(true)
  const { isVisibleRef } = useNavbar()
  const navbarRef = useRef(null)
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [notifyCont, setNotifyCnt] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showDailyStreakModal, setShowDailyStreakModal] = useState(false)

  const [showIQScoreModal, setShowIQScoreModal] = useState(false)
  const [logoutLoader, setLogoutLoader] = useState(false)
  const [loadedComponents, setLoadedComponents] = useState({})
  const dispatchRedux = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const {
    updates,
    streak,
    unreadFriendRequests,
    updatesLoading,
    streakLoading,
    friendRequestsLoading,
    isBoosted,
    isNotifDrawerOpen,
    isNotifModalOpen,
    updatesFetched,
    streakFetched,
    friendRequestsFetched,
  } = useSelector(state => state.app)

  const {
    isOpen: isOpenWiseWeb,
    onOpen: onOpenWiseWeb,
    onClose: onCloseWiseWeb,
  } = useDisclosure()

  const handleComponentLoad = useCallback(componentName => {
    setLoadedComponents(prev => {
      const newLoadedComponents = { ...prev, [componentName]: true }

      return newLoadedComponents
    })
  }, [])

  const [isHomePage, setIsHomePage] = useState(
    location.pathname.split('/')[1] === 'home',
  )
  const [profileNotif, setProfileNotif] = useState(false)

  const navItems = useMemo(
    () => [
      { to: '/home/all', label: t('home') },
      { to: '/tournament', label: t('tournament') },
      { to: '/leaderboard', label: t('leaderboard') },
      { to: '/dashboard', label: 'Dashboard' },
    ],
    [t],
  )

  const calculateRequiredXp = useCallback((xp, xpBaseAtNextLevel) => {
    return xpBaseAtNextLevel - xp
  }, [])

  const isEmptyObject = useCallback(obj => {
    return obj && Object.keys(obj).length === 0
  }, [])

  let level, xpBaseAtNextLevel, requiredXP

  if (user && !isEmptyObject(user)) {
    level = user.level
    xpBaseAtNextLevel = ((level + 1) * (level + 2) * 10) / 2
    requiredXP = calculateRequiredXp(user.xp, xpBaseAtNextLevel)
  }

  useEffect(() => {
    if (unreadFriendRequests && unreadFriendRequests > 0) {
      setProfileNotif(true)
    } else {
      setProfileNotif(false)
    }
  }, [unreadFriendRequests])

  useEffect(() => {
    if (updates?.length === 0) return
    let count = 0

    updates?.forEach(update => {
      if (!update.read) {
        count++
      }
    })
    setNotifyCnt(count)
  }, [updates])

  const checkStreak = useCallback(() => {
    if (!streakLoading) {
      dispatchRedux(fetchDailyStreak())
    }
  }, [streakLoading, user, dispatchRedux])

  useEffect(() => {
    if (!updatesLoading) {
      dispatchRedux(fetchAppUpdates())
    }
    checkStreak()
    if (!friendRequestsLoading) {
      dispatchRedux(fetchUnreadFriendRequestsCount())
    }

    dispatchRedux(verifyAdminStatus())
  }, [dispatchRedux, user])

  useEffect(() => {
    if (updatesFetched && streakFetched && friendRequestsFetched) {
      setApiCallsComplete(true)
    }
  }, [updatesFetched, streakFetched, friendRequestsFetched])

  useEffect(() => {
    const allComponentsLoaded = Object.keys(loadedComponents).length === 4 // Adjust this number
    if (allComponentsLoaded && apiCallsComplete) {
      onNavbarLoad()
    }
  }, [loadedComponents, apiCallsComplete, onNavbarLoad])

  const handleLogout = useCallback(async () => {
    setLogoutLoader(true)
    try {
      const response = await axios.post('/api/user/logout')
      if (response.status === 201) {
        await i18n.changeLanguage('en')
        dispatchRedux(setIsNotifDrawerOpen(false))

        setIsHamburgerOpen(false)
        localStorage.removeItem('token')
        localStorage.removeItem('role')

        dispatchRedux(logoutAuth())
        dispatchRedux(logoutApp())
        dispatchRedux(resetLoadingFlags())
        dispatchRedux(resetAllState())
        toast({
          title: 'Logout Successful',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })

        navigate('/')
      } else {
        throw new Error('Logout Failed')
      }
    } catch (error) {
      toast({
        title: 'Logout Failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error.message)
    } finally {
      setLogoutLoader(false)
    }
  }, [dispatchRedux, navigate, toast])
  const handleGuestLogout = () => {
    if (user?.role === 'guest') {
      setIsLogoutConfirmationOpen(true)
    } else {
      handleLogout()
    }
  }
  const handleConfirmGuestLogout = () => {
    setIsLogoutConfirmationOpen(false)
    handleLogout()
  }
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY
      const shouldBeVisible =
        prevScrollPos > currentScrollPos || currentScrollPos < 10

      isVisibleRef.current = shouldBeVisible
      // Update navbar visibility using the ref
      if (navbarRef.current) {
        navbarRef.current.style.transform = shouldBeVisible
          ? 'translateY(0)'
          : 'translateY(-100%)'
      }
      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [prevScrollPos])
  useEffect(() => {
    const checkIfHomePage = () => {
      setIsHomePage(location.pathname.split('/')[1] === 'home')
    }
    window.addEventListener('popstate', checkIfHomePage)
    window.addEventListener('pushState', checkIfHomePage)

    checkIfHomePage()
    return () => {
      window.removeEventListener('popstate', checkIfHomePage)
      window.removeEventListener('pushState', checkIfHomePage)
    }
  }, [location])

  const getBackgroundColor = useCallback(({ heatLevel }) => {
    if (heatLevel <= 0.2) {
      return 'rgba(139, 0, 0, 1)'
    } else if (heatLevel <= 0.4) {
      return 'rgba(255, 0, 0, 1)'
    } else if (heatLevel <= 0.6) {
      return 'rgba(255, 165, 0, 1)'
    } else if (heatLevel <= 0.8) {
      return 'rgba(255, 255, 0, 1)'
    } else {
      return 'rgba(0, 0, 255, 1)'
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ onComponentLoad: handleComponentLoad }}>
      {logoutLoader && <Loading />}
      <Box overflow={isHamburgerOpen ? 'hidden' : 'visible'} width="100vw">
        <Box
          ref={navbarRef}
          className={`navbar navbar-expand-lg`}
          paddingX={{ base: '1.2rem', xl: '5rem' }}
          height={'5rem'}
          w={'100vw'}
          position={'fixed'}
          zIndex={'1000'}
          backgroundColor={'rgba(15, 13, 21, 0.4)'}
          borderBottom={'1px solid rgba(255, 255, 255, 0.1)'}
          boxShadow={
            isVisibleRef.current ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
          }
          style={{
            transition:
              'transform 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)) 1',
          }}
          borderBottomWidth={'1px'}
          borderBottomStyle={'solid'}
          justifyContent={'center'}
        >
          <Suspense fallback={<Spinner />}>
            {showDailyStreakModal && (
              <DailyStreakModal
                setShowDailyStreakModal={setShowDailyStreakModal}
                getBackgroundColor={getBackgroundColor}
              />
            )}
          </Suspense>
          <Suspense fallback={<Spinner />}>
            {showIQScoreModal && (
              <IQScoreModal
                setShowIQScoreModal={setShowIQScoreModal}
                isGuest={user?.role === 'guest'}
              />
            )}
          </Suspense>

          <Flex
            w={'100%'}
            height={'100%'}
            flexDirection={'row'}
            display={isHamburgerOpen ? 'none' : 'flex'}
            position={'relative'}
          >
            <NavBrand isHamburgerOpen={isHamburgerOpen} />
            <Suspense fallback={<Spinner />}>
              <NavbarContent
                notifyCont={notifyCont}
                isHamburgerOpen={isHamburgerOpen}
                notLogined={!isAuthenticated}
                setIsHamburgerOpen={setIsHamburgerOpen}
                navLinkRefs={navLinkRefs}
                navItems={navItems}
              />
            </Suspense>
            <Suspense fallback={<Spinner />}>
              <OutsideNavbarContent
                setIsDrawerOpen={val =>
                  dispatchRedux(setIsNotifDrawerOpen(val))
                }
                notifyCont={notifyCont}
                setShowDailyStreakModal={setShowDailyStreakModal}
                setShowIQScoreModal={setShowIQScoreModal}
                streak={streak}
                isBoosted={isBoosted}
                getBackgroundColor={getBackgroundColor}
                notLogined={!isAuthenticated}
                isHamburgerOpen={isHamburgerOpen}
                handleLogout={handleGuestLogout}
                navLinkRefs={navLinkRefs}
                setIsHamburgerOpen={setIsHamburgerOpen}
                level={user?.level}
                profileNotif={profileNotif}
                onOpenWiseWeb={onOpenWiseWeb}
              />
            </Suspense>
          </Flex>
          <Suspense fallback={null}>
            {isNotifModalOpen && (
              <NotificationModal
                selectedNotification={selectedNotification}
                setIsModalOpen={val => dispatchRedux(setIsNotifModalOpen(val))}
                setIsDrawerOpen={val =>
                  dispatchRedux(setIsNotifDrawerOpen(val))
                }
              />
            )}
          </Suspense>

          {isNotifDrawerOpen && (
            <NotificationDrawer
              setIsHamburgerOpen={setIsHamburgerOpen}
              setIsDrawerOpen={val => dispatchRedux(setIsNotifDrawerOpen(val))}
              setIsModalOpen={val => dispatchRedux(setIsNotifModalOpen(val))}
              setSelectedNotification={setSelectedNotification}
            />
          )}
          <Suspense fallback={null}>
            {isOpenWiseWeb && (
              <WiseWeb
                isOpen={isOpenWiseWeb}
                onClose={onCloseWiseWeb}
                setIsHamburgerOpen={setIsHamburgerOpen}
                requestNotif={unreadFriendRequests > 0}
                markRequestAsRead={() =>
                  dispatchRedux(markFriendRequestsAsRead())
                }
              />
            )}
          </Suspense>
        </Box>
      </Box>

      <HamburgerModal
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        navItems={navItems}
        notLogined={!isAuthenticated}
        navLinkRefs={navLinkRefs}
        notifyCont={notifyCont}
        handleLogout={handleGuestLogout}
        setIsDrawerOpen={val => dispatchRedux(setIsNotifDrawerOpen(val))}
        onOpenWiseWeb={onOpenWiseWeb}
      />

      <AlertDialog
        isOpen={isLogoutConfirmationOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsLogoutConfirmationOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            bg="#1a1527"
            backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
            color={'white'}
          >
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              color={'gray.400'}
            >
              Confirm Logout!!!
            </AlertDialogHeader>

            <AlertDialogBody>
              As a guest user, your progress and account may be lost if you log
              out. Are you sure you want to proceed?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsLogoutConfirmationOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmGuestLogout}
                ml={3}
              >
                Confirm Logout
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </LoadingContext.Provider>
  )
}

export default Navbar
