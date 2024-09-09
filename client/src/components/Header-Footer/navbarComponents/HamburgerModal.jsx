import React, { lazy, Suspense, useCallback, useMemo } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Flex,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  UnorderedList,
  useDisclosure,
} from '@chakra-ui/react'
import { LockIcon, SearchIcon } from '@chakra-ui/icons'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ChatState } from '../../../contextAPI/ChatProvider'
import heroBG from '../../../assets/hero/hero-bg.webp'
import FixedBackground from '../../miscellaneous/FixedBackground'

const BackgroundCircles = lazy(() =>
  import('../design/Header').then(module => ({
    default: module.BackgroundCircles,
  })),
)
const Rings = lazy(() =>
  import('../design/Header').then(module => ({ default: module.Rings })),
)
const SideLines = lazy(() =>
  import('../design/Header').then(module => ({ default: module.SideLines })),
)
const LogoutButton = lazy(() => import('./LogoutButton'))
const GetStarted = lazy(() => import('./GetStarted'))
const NavBrand = lazy(() => import('./NavBrand'))
const Inbox = lazy(() => import('./Inbox'))
const UserSearchDrawer = lazy(() =>
  import('../../miscellaneous/UserSearchDrawer'),
)
const FaMessenger = lazy(() => import('../../../assets/svg/FaMessenger'))
const UserFriendsSVG = lazy(() => import('../../../assets/svg/UserFriendsSVG'))

const HamburgerModal = ({
  isOpen,
  onClose,
  navItems,
  notLogined,
  navLinkRefs,
  handleLogout,
  notifyCont,
  setIsDrawerOpen,
  onOpenWiseWeb,
}) => {
  const { t } = useTranslation('HamburgerModal')
  const { user, isAdmin, isAuthenticated } = useSelector(state => state.auth)
  const { unreadFriendRequests } = useSelector(state => state.app)

  const { notification, openChat } = ChatState()
  const navigate = useNavigate()
  const {
    isOpen: isOpenUserSearch,
    onOpen: onOpenUserSearch,
    onClose: onCloseUserSearch,
  } = useDisclosure()

  const handleProfileClick = useCallback(() => {
    onClose()
    navigate(`/profile/${user.inGameName}`)
  }, [onClose, navigate, user?.inGameName])

  const handleChatClick = useCallback(() => {
    onClose()
    navigate('/chats')
    openChat()
  }, [onClose, navigate, openChat])

  const handleInboxClick = useCallback(() => {
    setIsDrawerOpen(true)
    onClose()
  }, [setIsDrawerOpen, onClose])

  const handleUserSearchClick = useCallback(() => {
    onOpenUserSearch()
  }, [onOpenUserSearch])

  const showDashboard = isAdmin && isAuthenticated && user
  const memoizedNavItems = useMemo(() => {
    return navItems.map((item, index) => {
      if (item.label === 'Dashboard' && !showDashboard) return null
      return (
        <ListItem
          className="nav-item"
          key={index}
          onClick={onClose}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          gap={'0.25rem'}
        >
          <Tooltip
            label={t('leaderboardLocked')}
            isDisabled={!(notLogined && item.label === 'Leaderboard')}
            placement="bottom"
            hasArrow
          >
            <NavLink
              to={item.to}
              className={`nav-link ${
                notLogined && item.label === 'Leaderboard' ? 'locked' : ''
              }`}
              onClick={e =>
                notLogined && item.label === 'Leaderboard'
                  ? e.preventDefault()
                  : null
              }
              ref={ref => (navLinkRefs.current[index] = ref)}
            >
              {item.label}
            </NavLink>
          </Tooltip>
          {notLogined && item.label === 'Leaderboard' && <LockIcon />}
        </ListItem>
      )
    })
  }, [
    navItems,
    notLogined,
    onClose,
    navLinkRefs,
    isAdmin,
    isAuthenticated,
    user,
    t,
  ])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <FixedBackground />
        <ModalHeader
          w={'100%'}
          alignItems={'center'}
          p={'20px'}
          display={'flex'}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <NavBrand isHamburgerOpen={true} />
          </Suspense>
          <ModalCloseButton
            marginTop={'15px'}
            marginRight={'10px'}
            bg={'white'}
            color={'black'}
            height={'35px'}
            width={'40px'}
          />
        </ModalHeader>
        <ModalBody p={0} w={'100%'}>
          <Flex
            height={'100vh'}
            width={'100%'}
            position={'relative'}
            justifyContent={'center'}
            alignItems={'center'}
            flexDirection={'column'}
            className="hamburger-menu"
            overflow={'hidden'}
          >
            {!notLogined && (
              <Flex
                position={'absolute'}
                top={'3rem'}
                zIndex={1}
                flexDirection={'column'}
                gap={4}
                justifyContent={'center'}
                alignItems={'center'}
                onClick={handleProfileClick}
                cursor={'pointer'}
              >
                <Flex w={'100%'} h={'100%'} position={'relative'}></Flex>
                <Avatar src={user?.pic} h={'6rem'} w={'6rem'} rounded={'50%'} />
                <Text letterSpacing={'2px'} fontWeight={'bold'}>
                  <span
                    style={{
                      background: '#5ac8fa',
                      color: '#0f0d15',
                      borderRadius: '10px',
                      padding: '5px',
                    }}
                  >
                    {user?.name}
                  </span>
                </Text>
              </Flex>
            )}

            <UnorderedList
              display={'flex'}
              p={0}
              m={0}
              w={'100%'}
              justifyContent={'center'}
              alignItems={'center'}
              listStyleType={'none'}
              gap={'2rem'}
              letterSpacing={'2px'}
              flexDirection="column"
              zIndex={1}
              position={'absolute'}
              top={notLogined ? '30%' : '32%'}
            >
              <Flex gap={4}>
                <ListItem
                  className="nav-item"
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  gap={'0.25rem'}
                >
                  <Box
                    _hover={{ cursor: 'pointer' }}
                    onClick={handleChatClick}
                    display={notLogined ? 'none' : 'block'}
                    color={'white'}
                    position={'relative'}
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
                        right={'-0.5rem'}
                        top={'-0.65rem'}
                      >
                        {notification.length}
                      </Badge>
                    )}
                    <Suspense fallback={<div>Loading...</div>}>
                      <FaMessenger
                        width={'25px'}
                        height={'25px'}
                        fill={'#fff'}
                      />
                    </Suspense>
                  </Box>
                </ListItem>
                <ListItem
                  className="nav-item"
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  gap={'0.25rem'}
                >
                  <Suspense fallback={<div>Loading...</div>}>
                    <Inbox
                      className={'inbox-button-lg'}
                      onClick={handleInboxClick}
                      notifyCont={notifyCont}
                      display={notLogined ? 'none' : 'flex'}
                      h="25px"
                      w="25px"
                    />
                  </Suspense>
                </ListItem>
                <ListItem
                  className="nav-item"
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  gap={'0.25rem'}
                >
                  <Flex
                    onClick={() => {
                      onClose()
                      onOpenWiseWeb()
                    }}
                    width={'100%'}
                    justifyContent={'center'}
                    display={notLogined ? 'none' : 'block'}
                  >
                    <Suspense fallback={<div>Loading...</div>}>
                      <UserFriendsSVG
                        width={'25px'}
                        height={'25px'}
                        fill={'#fff'}
                      />
                    </Suspense>
                    {unreadFriendRequests !== 0 && (
                      <Box
                        h="8px"
                        w="8px"
                        bg={'red'}
                        borderRadius={'50%'}
                        position={'absolute'}
                        right={'39%'}
                        top={'0'}
                        zIndex={2}
                      />
                    )}
                  </Flex>
                </ListItem>
                <ListItem>
                  <Box
                    _hover={{ cursor: 'pointer' }}
                    display={notLogined ? 'none' : 'flex'}
                    onClick={handleUserSearchClick}
                    position={'relative'}
                    mx={1}
                  >
                    <SearchIcon boxSize={6} color={'white'} />
                    <Suspense fallback={<div>Loading...</div>}>
                      <UserSearchDrawer
                        isOpen={isOpenUserSearch}
                        onClose={onCloseUserSearch}
                        onSearchClick={onClose}
                      />
                    </Suspense>
                  </Box>
                </ListItem>
              </Flex>
              {memoizedNavItems}
            </UnorderedList>
            <Suspense fallback={<div>Loading...</div>}>
              <Rings />
              <SideLines />
              <BackgroundCircles />
            </Suspense>
            <Flex position={'absolute'} bottom={notLogined ? '30%' : '22%'}>
              {notLogined ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <GetStarted
                    innerText={t('getStarted')}
                    hamburgerOnClose={onClose}
                  />
                </Suspense>
              ) : (
                <Suspense fallback={<div>Loading...</div>}>
                  <LogoutButton handleLogout={handleLogout} />
                </Suspense>
              )}
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default HamburgerModal
