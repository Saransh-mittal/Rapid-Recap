import React, { lazy, Suspense, useCallback, useMemo } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Flex,
  ListItem,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Text,
  Tooltip,
  UnorderedList,
  useDisclosure,
  useToast,
  VStack,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react'
import { LockIcon, SearchIcon } from '@chakra-ui/icons'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ChatState } from '../../../../contextAPI/ChatProvider'
import Footer from '../../Footer'
import FixedBackground from '../../../miscellaneous/FixedBackground'

const LogoutButton = lazy(() => import('../LogoutButton'))
const GetStarted = lazy(() => import('../GetStarted'))
const NavBrand = lazy(() => import('../NavBrand'))
const Inbox = lazy(() => import('../Inbox'))
const UserSearchDrawer = lazy(() =>
  import('../../../miscellaneous/UserSearchDrawer'),
)
const FaMessenger = lazy(() => import('../../../../assets/svg/FaMessenger'))
const UserFriendsSVG = lazy(() =>
  import('../../../../assets/svg/UserFriendsSVG'),
)

const HamburgerDrawer = ({
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
  const toast = useToast()
  const { user, isAdmin, isAuthenticated } = useSelector(state => state.auth)
  const { unreadFriendRequests } = useSelector(state => state.app)

  const chatState = ChatState()
  const accentColor = useColorModeValue('purple.400', 'purple.300')

  const notification = chatState ? chatState.notification : []
  const openChat = chatState ? chatState.openChat : () => {}
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
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent>
        <FixedBackground starCount={15} />
        <DrawerHeader
          w={'100%'}
          alignItems={'center'}
          p={'20px'}
          display={'flex'}
          justifyContent={'space-between'}
        >
          <NavBrand isHamburgerOpen={true} />
          <DrawerCloseButton bg={'white'} color={'black'} size={'lg'} />
        </DrawerHeader>
        <DrawerBody p={0} w={'100%'} zIndex={1}>
          <VStack
            spacing={4}
            align="stretch"
            height={'calc(100vh - 80px)'}
            justifyContent={'space-between'}
            px={4}
          >
            <VStack spacing={6} align="center" mt={8}>
              {!notLogined && (
                <Flex
                  flexDirection={'column'}
                  gap={4}
                  justifyContent={'center'}
                  alignItems={'center'}
                  onClick={handleProfileClick}
                  cursor={'pointer'}
                >
                  <Avatar
                    src={user?.pic}
                    h={'6rem'}
                    w={'6rem'}
                    rounded={'50%'}
                  />

                  <VStack spacing={0} align="center" mb={3}>
                    <Flex fontSize="xl" fontWeight="bold" mb={0}>
                      <Text textColor={'gray.200'}>{user?.name}</Text>

                      <Suspense fallback={<Spinner />}></Suspense>
                    </Flex>
                    <Text fontSize="sm" color={accentColor} mb={0}>
                      @{user?.inGameName}
                    </Text>
                  </VStack>
                </Flex>
              )}

              <Flex gap={4} justifyContent="center" flexWrap="wrap">
                {!notLogined && (
                  <>
                    <Box onClick={handleChatClick} position="relative">
                      {Array.isArray(notification) &&
                        notification.length > 0 && (
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

                      <FaMessenger
                        width={'25px'}
                        height={'25px'}
                        fill={'#fff'}
                      />
                    </Box>

                    <Inbox
                      className={'inbox-button-lg'}
                      onClick={handleInboxClick}
                      notifyCont={notifyCont}
                      h="25px"
                      w="25px"
                    />

                    <Flex
                      onClick={() => {
                        toast({
                          title: 'Wise Web',
                          description:
                            'Wise Web is currently under maintenance',
                          status: 'info',
                          duration: 9000,
                          isClosable: true,
                          position: 'top',
                        })
                        // onClose()
                        // onOpenWiseWeb()
                      }}
                      position="relative"
                    >
                      <UserFriendsSVG
                        width={'25px'}
                        height={'25px'}
                        fill={'#fff'}
                      />

                      {unreadFriendRequests !== 0 && (
                        <Box
                          h="8px"
                          w="8px"
                          bg={'red'}
                          borderRadius={'50%'}
                          position={'absolute'}
                          right={'-4px'}
                          top={'-4px'}
                        />
                      )}
                    </Flex>
                    <Box onClick={handleUserSearchClick}>
                      <SearchIcon boxSize={6} color={'white'} />

                      <UserSearchDrawer
                        isOpen={isOpenUserSearch}
                        onClose={onCloseUserSearch}
                        onSearchClick={onClose}
                      />
                    </Box>
                  </>
                )}
              </Flex>

              <UnorderedList
                styleType="none"
                spacing={4}
                width="100%"
                display="flex"
                flexDirection="column"
                alignItems="center"
                p={0}
                m={0}
              >
                {memoizedNavItems}
              </UnorderedList>
            </VStack>

            <VStack spacing={4} mb={8}>
              {notLogined ? (
                <GetStarted
                  innerText={t('getStarted')}
                  hamburgerOnClose={onClose}
                />
              ) : (
                <LogoutButton handleLogout={handleLogout} />
              )}
              <Footer onCloseMenu={onClose} />
            </VStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default HamburgerDrawer
