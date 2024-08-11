import React, { Suspense, useCallback } from 'react'
import {
  Badge,
  Box,
  Button,
  Flex,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react'
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useSound from '../../../customHooks/useSound'
import { ChatState } from '../../../contextAPI/ChatProvider'
import FaMessenger from '../../../assets/svg/FaMessenger'

// Lazy load components
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

const OutsideNavbarContent = ({
  setIsDrawerOpen,
  notifyCont,
  setShowDailyStreakModal,
  setShowXPLevelModal,
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
  const { user } = useSelector(state => state.auth)
  const { unreadFriendRequests } = useSelector(state => state.app)
  const { playClick } = useSound()
  const { notification } = ChatState()
  const navigate = useNavigate()

  const {
    isOpen: isOpenUserSearch,
    onOpen: onOpenUserSearch,
    onClose: onCloseUserSearch,
  } = useDisclosure()

  const isEmptyObject = useCallback(obj => {
    return obj && Object.keys(obj).length === 0
  }, [])

  return (
    <Flex
      gap={{ base: 1, lg: 3 }}
      alignItems={'center'}
      display={isHamburgerOpen ? 'none' : 'flex'}
    >
      {/* Profile dropdown menu */}
      {notLogined && (
        <Suspense fallback={<Spinner />}>
          <GetStarted
            display={{ base: 'none', lg: 'flex' }}
            innerText={'Get Started'}
          />
        </Suspense>
      )}
      {!notLogined && (
        <>
          {user && !isEmptyObject(user) ? (
            <Box>
              <Suspense fallback={<Spinner />}>
                <IQScore
                  score={user?.IQ_score}
                  _hover={{
                    cursor: 'pointer',
                  }}
                  className={'xp-level'}
                  onClick={() => {
                    playClick()
                    setShowIQScoreModal(true)
                  }}
                />
              </Suspense>
            </Box>
          ) : (
            <Spinner />
          )}
          {user && !isEmptyObject(user) && (
            <Box>
              <Suspense fallback={<Spinner />}>
                <XPLevel
                  level={level}
                  _hover={{
                    cursor: 'pointer',
                  }}
                  className={'xp-level'}
                  onClick={() => {
                    playClick()
                    setShowXPLevelModal(true)
                  }}
                />
              </Suspense>
            </Box>
          )}
          {streak === undefined ? (
            <Spinner />
          ) : (
            <Suspense fallback={<Spinner />}>
              <StreakFire
                marginAroundBox={'auto'}
                widthOfBox={'1.6em'}
                heightOfBox={'1.6em'}
                _hover={{
                  cursor: 'pointer',
                  backgroundColor: '#0f0d15',
                  backgroundImage:
                    'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                }}
                className={'streak-tracker-lg'}
                onClick={() => {
                  playClick()
                  setShowDailyStreakModal(true)
                }}
                streak={streak}
                isBoosted={isBoosted}
                getBackgroundColor={getBackgroundColor}
              />
            </Suspense>
          )}
          {!isEmptyObject(user) && (
            <Box
              _hover={{
                cursor: 'pointer',
              }}
              display={{ base: 'none', lg: 'flex' }}
              onClick={() => {
                playClick()
                onOpenUserSearch()
              }}
              position={'relative'}
              mx={1}
            >
              <SearchIcon boxSize={6} />
              <Suspense fallback={<Spinner />}>
                <UserSearchDrawer
                  isOpen={isOpenUserSearch}
                  onClose={onCloseUserSearch}
                />
              </Suspense>
            </Box>
          )}
          {!isEmptyObject(user) && (
            <Box
              _hover={{
                cursor: 'pointer',
              }}
              display={{ base: 'none', lg: 'flex' }}
              onClick={() => navigate('/chats')}
              position={'relative'}
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
                  right={'-0.5rem'}
                  top={'-0.7rem'}
                  zIndex={2}
                >
                  {notification.length}
                </Badge>
              )}
              <FaMessenger width={'23px'} height={'23px'} />
            </Box>
          )}
        </>
      )}
      {!notLogined && !isHamburgerOpen ? (
        <Flex display={{ base: 'none', lg: 'flex' }}>
          <Suspense fallback={<Spinner />}>
            <ProfileDropDownMenu
              setIsDrawerOpen={setIsDrawerOpen}
              className="profile-dropdown-lg"
              handleLogout={handleLogout}
              toProfile={'/profile'}
              refProfile={ref => (navLinkRefs.current[4] = ref)}
              profileNotif={profileNotif}
              notifyCont={notifyCont}
              onOpenWiseWeb={onOpenWiseWeb}
            />
          </Suspense>
          {(unreadFriendRequests !== 0 || notifyCont !== 0) && (
            <Box
              h="14px"
              w="14px"
              bg={'red'}
              borderRadius={'50%'}
              position={'absolute'}
              right={'2.3%'}
              top={'10%'}
              zIndex={2}
            />
          )}
        </Flex>
      ) : null}
      {!isHamburgerOpen ? (
        <Flex className="menu-button">
          <Button
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-label="Toggle navigation"
            display={{ base: 'flex', lg: 'none' }}
            onClick={() => {
              playClick()
              setIsHamburgerOpen(true)
            }}
            marginBottom={isHamburgerOpen ? '2rem' : '0'}
            height={'35px'}
            width={'10px'}
            position={'relative'}
          >
            {(unreadFriendRequests > 0 ||
              (Array.isArray(notification) && notification.length > 0)) && (
              <Box
                h="14px"
                w="14px"
                bg={'red'}
                borderRadius={'50%'}
                position={'absolute'}
                right={'-0.25rem'}
                top={'-0.25rem'}
                zIndex={2}
              />
            )}
            <HamburgerIcon height={'35px'} width={'20px'} />
            {(unreadFriendRequests !== 0 || notifyCont !== 0) && (
              <Box
                h="15px"
                w="15px"
                bg={'red'}
                borderRadius={'50%'}
                position={'absolute'}
                right={'-18%'}
                top={'-18%'}
                zIndex={2}
              />
            )}
          </Button>
        </Flex>
      ) : null}
    </Flex>
  )
}

export default OutsideNavbarContent
