import React, { Suspense, useCallback, useMemo } from 'react'
import {
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  Skeleton,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import useSound from '../../../customHooks/useSound'
import { ChatState } from '../../../contextAPI/ChatProvider'
import FaMessenger from '../../../assets/svg/FaMessenger'
import levelImage from '../../../assets/level.webp'
import { motion } from 'framer-motion'

import ImageShimmerLoader from '../../miscellaneous/shimmerLoaders/ImageShimmerLoader'
import SVGShimmerLoader from '../../miscellaneous/shimmerLoaders/SVGShimmerLoader'
import IconShimmerLoader from '../../miscellaneous/shimmerLoaders/IconShimmerLoader'
import { BsLock } from 'react-icons/bs'
import { addNoteMessage, setShowXpLevelModal } from '../../../redux/appSlice'

const StreakFire = React.lazy(() => import('./StreakFire'))
const ProfileDropDownMenu = React.lazy(() =>
  import('../../profileComponents/ProfileDropDownMenu'),
)
const GetStarted = React.lazy(() => import('./GetStarted'))
const XPLevel = React.lazy(() => import('./XPLevel'))
const IQScore = React.lazy(() => import('./IQScore'))
const UserSearchDrawer = React.lazy(() =>
  import('../../miscellaneous/UserSearchDrawer'),
)

const streakFireSVGPath = `M9.588 2.085a1 1 0 01.97.092c2.85 1.966 4.498 4.744 5.31 6.67l.854-.885a1 1 0 011.56.154c2.177 3.38 2.211 7.383.521 10.3C17.039 21.459 13.583 22 11.977 22c-1.569 0-4.905-.27-6.825-3.584-.832-1.435-1.27-3.053-1.125-4.704.146-1.66.876-3.284 2.264-4.721.86-.891 1.505-2.122 1.957-3.322.449-1.193.68-2.278.752-2.806a1 1 0 01.588-.778z`

const OutsideNavbarContent = ({
  setIsDrawerOpen,
  notifyCont,
  setShowDailyStreakModal,
  setShowIQScoreModal,
  streak,
  isBoosted,
  getBackgroundColor,
  notLogined,
  isHamburgerOpen,
  handleLogout,
  navLinkRefs,
  setIsHamburgerOpen,
  level,
  profileNotif,
  onOpenWiseWeb,
}) => {
  const { t } = useTranslation('OutsideNavbarContent')
  const { user, loginCheckStatus } = useSelector(state => state.auth)
  const { unreadFriendRequests } = useSelector(state => state.app)
  const { playClick } = useSound()
  const { notification } = ChatState()
  const navigate = useNavigate()
  const isToken = localStorage.getItem('token')
  const isSmallerThan992 = useMediaQuery('(max-width: 992px)')[0]

  const {
    isOpen: isOpenUserSearch,
    onOpen: onOpenUserSearch,
    onClose: onCloseUserSearch,
  } = useDisclosure()

  const isEmptyObject = useCallback(
    obj => obj && Object.keys(obj).length === 0,
    [],
  )

  const renderNotificationBadge = useMemo(
    () => (
      <Box
        h="13px"
        w="13px"
        bg="red"
        borderRadius="50%"
        position="absolute"
        right="1.3rem"
        top="0.2rem"
        zIndex={2}
      />
    ),
    [],
  )

  const renderProfileDropdown = () => (
    <Suspense
      fallback={
        <motion.button
          whileTap={{ scale: 0.97 }}
          style={{
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <Skeleton h={'35px'} w={'35px'} rounded={'50%'} />
          <motion.div
            variants={{
              open: { rotate: 180 },
              closed: { rotate: 0 },
            }}
            transition={{ duration: 0.2 }}
            style={{ originY: 0.55 }}
          >
            <svg width="15" height="15" viewBox="0 0 20 20">
              <path d="M0 7 L 20 7 L 10 16" fill="white" />
            </svg>
          </motion.div>
        </motion.button>
      }
    >
      <ProfileDropDownMenu
        setIsDrawerOpen={setIsDrawerOpen}
        className="profile-dropdown-lg"
        handleLogout={handleLogout}
        toProfile="/profile"
        refProfile={ref => (navLinkRefs.current[4] = ref)}
        profileNotif={profileNotif}
        notifyCont={notifyCont}
        onOpenWiseWeb={onOpenWiseWeb}
        display={{ base: 'none', lg: 'flex' }}
      />
      {(unreadFriendRequests !== 0 || notifyCont !== 0) &&
        !isSmallerThan992 &&
        renderNotificationBadge}
    </Suspense>
  )

  if (loginCheckStatus === 'pending' && isToken) {
    return <PendingLoginContent />
  }

  if (notLogined) {
    return (
      <>
        <Suspense
          fallback={
            <Skeleton width={'150px'} height={'40px'} borderRadius={'15px'} />
          }
        >
          <GetStarted
            display={{ base: 'none', lg: 'flex' }}
            innerText={t('OutsideNavbarContent.getStarted')}
          />
        </Suspense>
        <HamburgerMenuButton
          isHamburgerOpen={isHamburgerOpen}
          setIsHamburgerOpen={setIsHamburgerOpen}
          playClick={playClick}
          unreadFriendRequests={unreadFriendRequests}
          notification={notification}
          notifyCont={notifyCont}
          renderNotificationBadge={renderNotificationBadge}
          isSmallerThan992={isSmallerThan992}
        />
      </>
    )
  }

  return (
    <Flex
      gap={{ base: 1, lg: 3 }}
      alignItems="center"
      display={isHamburgerOpen ? 'none' : 'flex'}
    >
      {user && !isEmptyObject(user) && (
        <>
          <IQScoreComponent
            user={user}
            setShowIQScoreModal={setShowIQScoreModal}
            playClick={playClick}
          />
          <XPLevelComponent level={level} playClick={playClick} />
          <StreakFireComponent
            streak={streak}
            isBoosted={isBoosted}
            getBackgroundColor={getBackgroundColor}
            setShowDailyStreakModal={setShowDailyStreakModal}
            playClick={playClick}
          />
          <SearchComponent
            onOpenUserSearch={onOpenUserSearch}
            playClick={playClick}
            isOpenUserSearch={isOpenUserSearch}
            onCloseUserSearch={onCloseUserSearch}
          />
          <MessengerComponent
            playClick={playClick}
            notification={notification}
            navigate={navigate}
            renderNotificationBadge={renderNotificationBadge}
            isGuest={user?.role === 'guest'}
          />
          {renderProfileDropdown()}
        </>
      )}
      <HamburgerMenuButton
        isHamburgerOpen={isHamburgerOpen}
        setIsHamburgerOpen={setIsHamburgerOpen}
        playClick={playClick}
        unreadFriendRequests={unreadFriendRequests}
        notification={notification}
        notifyCont={notifyCont}
        renderNotificationBadge={renderNotificationBadge}
        isSmallerThan992={isSmallerThan992}
      />
    </Flex>
  )
}

const PendingLoginContent = () => (
  <Flex gap={{ base: 1, lg: 3 }} alignItems="center">
    <Skeleton
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="full"
      p="0.5rem"
      transition="all 0.3s"
      title="Your Information Quotient (IQ) Score"
      width={'105px'}
      h={'40px'}
      gap={1}
    />
    <ImageShimmerLoader imageUrl={levelImage} width={40} height={40} />
    <SVGShimmerLoader
      svgPath={streakFireSVGPath}
      width="1.6em"
      height="1.6em"
    />
    <IconShimmerLoader icon={<SearchIcon color="grey" />} />
    <IconShimmerLoader
      icon={<FaMessenger fill="grey" width="23px" height="23px" />}
    />
    <motion.button
      whileTap={{ scale: 0.97 }}
      style={{
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
      }}
    >
      <Skeleton h={'35px'} w={'35px'} rounded={'50%'} />
      <motion.div
        variants={{
          open: { rotate: 180 },
          closed: { rotate: 0 },
        }}
        transition={{ duration: 0.2 }}
        style={{ originY: 0.55 }}
      >
        <svg width="15" height="15" viewBox="0 0 20 20">
          <path d="M0 7 L 20 7 L 10 16" fill="white" />
        </svg>
      </motion.div>
    </motion.button>
  </Flex>
)

const IQScoreComponent = ({ user, setShowIQScoreModal, playClick }) => {
  const { t } = useTranslation('HeaderFooter')
  const dispatch = useDispatch()
  return (
    <>
      <Suspense
        fallback={
          <Skeleton
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            p="0.5rem"
            transition="all 0.3s"
            title={t('OutsideNavbarContent.iqScore.title')}
            width={'105px'}
            h={'40px'}
            gap={1}
          />
        }
      >
        <IQScore
          user={user}
          score={user?.IQ_score}
          _hover={{ cursor: 'pointer' }}
          className="xp-level"
          onClick={() => {
            playClick()
            user?.role !== 'guest'
              ? setShowIQScoreModal(true)
              : dispatch(
                  addNoteMessage({
                    title: t('OutsideNavbarContent.iqScore.guestMessage'),
                    duration: 10000,
                    width: '250px',
                    actions: [
                      {
                        actionType: 'SECURE_YOUR_PROGRESS',
                      },
                    ],
                  }),
                )
          }}
        />
      </Suspense>
    </>
  )
}

const XPLevelComponent = ({ level, playClick }) => {
  const { t } = useTranslation('HeaderFooter')
  const dispatch = useDispatch()
  return (
    <Suspense
      fallback={
        <ImageShimmerLoader imageUrl={levelImage} width={40} height={40} />
      }
    >
      <XPLevel
        level={level}
        _hover={{ cursor: 'pointer' }}
        className="xp-level"
        onClick={() => {
          playClick()
          dispatch(setShowXpLevelModal(true))
        }}
      />
    </Suspense>
  )
}

const StreakFireComponent = ({
  streak,
  isBoosted,
  getBackgroundColor,
  setShowDailyStreakModal,
  playClick,
}) => (
  <Suspense
    fallback={
      <SVGShimmerLoader
        svgPath={streakFireSVGPath}
        width="1.6em"
        height="1.6em"
      />
    }
  >
    <StreakFire
      marginAroundBox="auto"
      widthOfBox="1.6em"
      heightOfBox="1.6em"
      _hover={{
        cursor: 'pointer',
        backgroundColor: '#0f0d15',
        backgroundImage:
          'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
      }}
      className="streak-tracker-lg"
      onClick={() => {
        playClick()
        setShowDailyStreakModal(true)
      }}
      streak={streak}
      isBoosted={isBoosted}
      getBackgroundColor={getBackgroundColor}
    />
  </Suspense>
)

const SearchComponent = ({
  onOpenUserSearch,
  playClick,
  isOpenUserSearch,
  onCloseUserSearch,
}) => (
  <Box
    _hover={{ cursor: 'pointer' }}
    display={{ base: 'none', lg: 'flex' }}
    onClick={() => {
      playClick()
      onOpenUserSearch()
    }}
    position="relative"
    mx={1}
  >
    <SearchIcon boxSize={6} />
    <Suspense
      fallback={<IconShimmerLoader icon={<SearchIcon color="grey" />} />}
    >
      <UserSearchDrawer isOpen={isOpenUserSearch} onClose={onCloseUserSearch} />
    </Suspense>
  </Box>
)

const MessengerComponent = ({ notification, navigate, isGuest, playClick }) => {
  const dispatch = useDispatch()
  return (
    <Box
      _hover={{ cursor: 'pointer' }}
      display={{ base: 'none', lg: 'flex' }}
      onClick={() => {
        playClick()
        isGuest
          ? dispatch(
              addNoteMessage({
                title: 'Register to do chat and grow Wise Web',
                duration: 10000,
                width: '250px',
                actions: [
                  {
                    actionType: 'SECURE_YOUR_PROGRESS',
                  },
                ],
              }),
            )
          : navigate('/chats')
      }}
      position="relative"
      mx={1}
    >
      {Array.isArray(notification) && notification.length > 0 && (
        <Badge
          bg={'red'}
          position={'absolute'}
          color={'white'}
          borderRadius={'50%'}
          h={'18px'}
          w={'18px'}
          textAlign={'center'}
          right="-0.5rem"
          top="-0.7rem"
        >
          {notification.length}
        </Badge>
      )}
      {isGuest ? (
        <>
          <FaMessenger width="23px" height="23px" fill="grey" />
          <Icon as={BsLock} position={'absolute'} top={'14%'} left={'17%'} />
        </>
      ) : (
        <FaMessenger width="23px" height="23px" />
      )}
    </Box>
  )
}

const HamburgerMenuButton = ({
  setIsHamburgerOpen,
  playClick,
  unreadFriendRequests,
  notification,
  notifyCont,
  isSmallerThan992,
}) => {
  return (
    <Flex className="menu-button" display={{ base: 'flex', lg: 'none' }}>
      <Button
        onClick={() => {
          playClick()
          setIsHamburgerOpen(true)
        }}
        height="35px"
        width="10px"
        position="relative"
      >
        {(unreadFriendRequests > 0 ||
          (Array.isArray(notification) && notification.length > 0) ||
          notifyCont !== 0) &&
        isSmallerThan992 ? (
          <Box
            h="16px"
            w="16px"
            bg={'red'}
            borderRadius={'50%'}
            position={'absolute'}
            right={'-0.4rem'}
            top={'-0.4rem'}
            zIndex={2}
          />
        ) : null}
        <HamburgerIcon height="35px" width="20px" />
      </Button>
    </Flex>
  )
}

export default OutsideNavbarContent
