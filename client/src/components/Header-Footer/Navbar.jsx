import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'
import { AppContext } from '../../contextAPI/appContext'
import axios from 'axios'
import {
  useToast,
  Button,
  Flex,
  Box,
  useMediaQuery,
  useDisclosure,
} from '@chakra-ui/react'
import useDrag from '../../customHooks/useDrag'

import { CloseIcon } from '@chakra-ui/icons'
import NotificationDrawer from './Inbox/NotificationDrawer'
import DailyStreakModal from '../streakComponents/DailyStreakModal'
import NotificationModal from './Inbox/NotificationModal'
import { useDailyStreakTour } from '../../customHooks/useTours'
import NavbarContent from './navbarComponents/NavbarContent'
import OutsideNavbarContent from './navbarComponents/OutsideNavbarContent'
import NavBrand from './navbarComponents/NavBrand'
import HamburgerModal from './navbarComponents/HamburgerModal'
import XPLevelModal from './navbarComponents/XPLevelModal'
import IQScoreModal from './navbarComponents/IQScoreModal'
import WiseWeb from '../profileComponents/WiseWeb'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/authSlice'
import {
  fetchAppUpdates,
  fetchDailyStreak,
  fetchUnreadFriendRequestsCount,
} from '../../redux/appSlice'

const Navbar = () => {
  const isSmallerThan992 = useMediaQuery('(max-width: 992px)')[0]
  const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/leaderboard', label: 'Leaderboard' },
    // { to: "/season", label: "Season" },
  ]
  const location = useLocation()
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { state, dispatch, navLinkRefs, readFriendRequests, playClick } =
    useContext(AppContext)
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { updates, streak, unreadFriendRequests, status, isBoosted } =
    useSelector(state => state.app)
  const dispatchRedux = useDispatch()
  const [visible, setVisible] = useState(true)
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const { startDrag, drag, endDrag } = useDrag()
  const [notifyCont, setNotifyCnt] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showDailyStreakModal, setShowDailyStreakModal] = useState(false)
  const [showXPLevelModal, setShowXPLevelModal] = useState(false)
  const [showIQScoreModal, setShowIQScoreModal] = useState(false)
  const { tour, isTutorialTakenCheck } = useDailyStreakTour()
  const {
    isOpen: isOpenWiseWeb,
    onOpen: onOpenWiseWeb,
    onClose: onCloseWiseWeb,
  } = useDisclosure()
  const [isHomePage, setIsHomePage] = useState(
    location.pathname.split('/')[1] === 'home',
  )
  const [profileNotif, setProfileNotif] = useState(false)
  const calculateRequiredXp = (xp, xpBaseAtNextLevel) => {
    return xpBaseAtNextLevel - xp
  }

  // Helper function to check if an object is empty
  const isEmptyObject = obj => {
    return obj && Object.keys(obj).length === 0
  }

  let level, xpBaseAtNextLevel, requiredXP

  if (user && !isEmptyObject(user)) {
    level = user.level
    xpBaseAtNextLevel = ((level + 1) * (level + 2) * 10) / 2
    requiredXP = calculateRequiredXp(user.xp, xpBaseAtNextLevel)
  }

  useEffect(() => {
    if (state.unreadFriendRequests && state.unreadFriendRequests > 0) {
      setProfileNotif(true)
    } else {
      setProfileNotif(false)
    }
  }, [state.unreadFriendRequests])

  useEffect(() => {
    const isEmptyObject = obj => {
      return obj && Object.keys(obj).length === 0
    }

    if (
      isAuthenticated &&
      user &&
      user.tutorial.dailyStreakPage &&
      user.tutorial.homePage &&
      (isEmptyObject(state.news) || !state.news)
    )
      isTutorialTakenCheck({ page: 'dailyStreakPage', tour })
  }, [user, isAuthenticated, user?.tutorial?.homePage, state?.news])

  async function getAppUpdates() {
    try {
      const response = await axios.get(`/api/user/getUpdates`)
      dispatch({
        type: 'APP_UPDATES',
        payloadAppUpdates: response.data.updates,
      })
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      getAppUpdates()
    }
  }, [user])
  useEffect(() => {
    //update notification count whose update is not read
    if (updates.length === 0) return
    let count = 0

    updates?.forEach(update => {
      if (!update.read) {
        count++
      }
    })
    setNotifyCnt(count)
  }, [updates])

  useEffect(() => {
    if (status === 'idle') {
      dispatchRedux(fetchAppUpdates())
      dispatchRedux(fetchDailyStreak())
      dispatchRedux(fetchUnreadFriendRequestsCount())
    }
  }, [status, dispatch])

  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/user/logout')
      if (response.status === 201) {
        setIsDrawerOpen(false)
        setIsHamburgerOpen(false)
        localStorage.removeItem('token')
        dispatchRedux(logout())
        toast({
          title: 'Logout Successful',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        dispatch({ type: 'RESET_STATE' })
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
    }
  }

  useEffect(() => {
    const checkIfHomePage = () => {
      setIsHomePage(location.pathname.split('/')[1] === 'home')
    }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('popstate', checkIfHomePage)
    window.addEventListener('pushState', checkIfHomePage) // Custom event if using history.pushState

    checkIfHomePage()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('popstate', checkIfHomePage)
      window.removeEventListener('pushState', checkIfHomePage)
    }
  }, [prevScrollPos, visible, location])

  const handleScroll = () => {
    const currentScrollPos = window.scrollY
    // const isHomePage = location.pathname.split("/")[1] === "home";
    const shouldSetVisible =
      prevScrollPos > currentScrollPos || currentScrollPos < 10

    if ((isHomePage && isSmallerThan992) || !isHomePage) {
      setVisible(shouldSetVisible)
    }
    setPrevScrollPos(currentScrollPos)
  }

  const getBackgroundColor = ({ heatLevel }) => {
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
  }

  return (
    <>
      <Box overflow={isHamburgerOpen ? 'hidden' : 'visible'}>
        <Box
          className={`navbar navbar-expand-lg`}
          paddingX={{ base: '1.2rem', xl: '5rem' }}
          height={'5rem'}
          w={'100vw'}
          onTouchStart={startDrag}
          onTouchMove={e => drag(e.touches[0])}
          onTouchEnd={endDrag}
          position={'fixed'}
          zIndex={'1000'}
          transform={visible ? 'translateY(0)' : 'translateY(-100%)'}
          transition="transform 0.3s ease-in-out"
          backgroundImage={
            'linear-gradient(-180deg, rgba(26, 21, 39, 0.9), rgba(14, 12, 22, 0.9) 88%, rgba(14, 12, 22, 0.9) 99%)'
          }
          borderBottom={'1px solid rgba(255, 255, 255, 0.1)'}
          boxShadow={visible ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'}
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
          {isHamburgerOpen && <NavBrand isHamburgerOpen={isHamburgerOpen} />}

          {showDailyStreakModal && (
            <DailyStreakModal
              setShowDailyStreakModal={setShowDailyStreakModal}
              getBackgroundColor={getBackgroundColor}
            />
          )}
          {showXPLevelModal && (
            <XPLevelModal setShowXPLevelModal={setShowXPLevelModal} />
          )}
          {showIQScoreModal && (
            <IQScoreModal setShowIQScoreModal={setShowIQScoreModal} />
          )}

          {isHamburgerOpen ? (
            <Button
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-label="Toggle navigation"
              display={{ base: 'flex', lg: 'none' }}
              onClick={() => {
                playClick()
                setIsHamburgerOpen(false)
              }}
              height={'35px'}
              width={'10px'}
              marginLeft={'auto'}
            >
              <CloseIcon />
            </Button>
          ) : null}
          <Flex
            w={'100%'}
            height={'100%'}
            flexDirection={'row'}
            display={isHamburgerOpen ? 'none' : 'flex'}
            position={'relative'}
          >
            <NavBrand isHamburgerOpen={isHamburgerOpen} />
            <NavbarContent
              notifyCont={notifyCont}
              isHamburgerOpen={isHamburgerOpen}
              notLogined={!isAuthenticated}
              setIsHamburgerOpen={setIsHamburgerOpen}
              navLinkRefs={navLinkRefs}
              navItems={navItems}
            />

            <OutsideNavbarContent
              setIsDrawerOpen={setIsDrawerOpen}
              notifyCont={notifyCont}
              setShowDailyStreakModal={setShowDailyStreakModal}
              setShowXPLevelModal={setShowXPLevelModal}
              setShowIQScoreModal={setShowIQScoreModal}
              tourComplete={tour.complete}
              streak={streak}
              isBoosted={isBoosted}
              getBackgroundColor={getBackgroundColor}
              notLogined={!isAuthenticated}
              isHamburgerOpen={isHamburgerOpen}
              handleLogout={handleLogout}
              navLinkRefs={navLinkRefs}
              setIsHamburgerOpen={setIsHamburgerOpen}
              level={user?.level}
              profileNotif={profileNotif}
              onOpenWiseWeb={onOpenWiseWeb}
            />
          </Flex>
          {isModalOpen && (
            <NotificationModal
              selectedNotification={selectedNotification}
              setIsModalOpen={setIsModalOpen}
              setIsDrawerOpen={setIsDrawerOpen}
            />
          )}
          {isDrawerOpen && (
            <NotificationDrawer
              setIsHamburgerOpen={setIsHamburgerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
              setIsModalOpen={setIsModalOpen}
              setSelectedNotification={setSelectedNotification}
            />
          )}
          {isOpenWiseWeb && (
            <WiseWeb
              isOpen={isOpenWiseWeb}
              onClose={onCloseWiseWeb}
              setIsHamburgerOpen={setIsHamburgerOpen}
              requestNotif={state.unreadFriendRequests > 0}
              markRequestAsRead={readFriendRequests}
            />
          )}
        </Box>
      </Box>

      <HamburgerModal
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        navItems={navItems}
        notLogined={!isAuthenticated}
        navLinkRefs={navLinkRefs}
        notifyCont={notifyCont}
        handleLogout={handleLogout}
        setIsDrawerOpen={setIsDrawerOpen}
        onOpenWiseWeb={onOpenWiseWeb}
      />
    </>
  )
}

export default Navbar
