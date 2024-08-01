import { Badge, Box, Button, Flex, useDisclosure } from '@chakra-ui/react'
import React, { useContext } from 'react'
import Inbox from './Inbox'
import StreakFire from './StreakFire'
import ProfileDropDownMenu from '../../profileComponents/ProfileDropDownMenu'
import { HamburgerIcon } from '@chakra-ui/icons'
import GetStarted from './GetStarted'
import XPLevel from './XPLevel'
import IQScore from './IQScore'
import { AppContext } from '../../../contextAPI/appContext'
// import { FaFacebookMessenger } from "react-icons/fa";
// import Messenger from "../../../screens/Messenger";
import { FaFacebookMessenger } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ChatState } from '../../../contextAPI/ChatProvider'
import { SearchIcon } from '@chakra-ui/icons'
import UserSearchDrawer from '../../miscellaneous/UserSearchDrawer'
import useSound from '../../../customHooks/useSound'

const OutsideNavbarContent = ({
  setIsDrawerOpen,
  notifyCont,
  setShowDailyStreakModal,
  setShowXPLevelModal,
  setShowIQScoreModal,
  tourComplete,
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
  const isEmptyObject = obj => {
    return obj && Object.keys(obj).length === 0
  }
  const { state, playClick } = useContext(AppContext)
  const { notification } = ChatState()
  const navigate = useNavigate()
  const {
    isOpen: isOpenUserSearch,
    onOpen: onOpenUserSearch,
    onClose: onCloseUserSearch,
  } = useDisclosure()

  return (
    <>
      <Flex
        gap={{ base: 1, lg: 3 }}
        alignItems={'center'}
        display={isHamburgerOpen ? 'none' : 'flex'}
      >
        {/* Profile dropdown menu */}
        {notLogined && (
          <GetStarted
            display={{ base: 'none', lg: 'flex' }}
            innerText={'Get Started'}
          />
        )}
        {!notLogined && (
          <>
            {state.user && !isEmptyObject(state.user) && (
              <Box>
                {' '}
                <IQScore
                  score={state.user?.IQ_score}
                  _hover={{
                    cursor: 'pointer',
                  }}
                  className={'xp-level'}
                  onClick={() => {
                    playClick()
                    setShowIQScoreModal(true)
                  }}
                />
              </Box>
            )}
            {state.user && !isEmptyObject(state.user) && (
              <Box>
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
              </Box>
            )}
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
                tourComplete()
              }}
              streak={streak}
              isBoosted={isBoosted}
              getBackgroundColor={getBackgroundColor}
            />
            {!isEmptyObject(state.user) && (
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
                <UserSearchDrawer
                  isOpen={isOpenUserSearch}
                  onClose={onCloseUserSearch}
                />
              </Box>
            )}
            {!isEmptyObject(state.user) && (
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
                  >
                    {notification.length}
                  </Badge>
                )}
                <FaFacebookMessenger size={23} />
              </Box>
            )}
          </>
        )}
        {!notLogined && !isHamburgerOpen ? (
          <Flex display={{ base: 'none', lg: 'flex' }}>
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
          </Flex>
        ) : null}
        {!isHamburgerOpen ? (
          <>
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
                {(state.unreadFriendRequests > 0 ||
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
              </Button>
            </Flex>
          </>
        ) : null}
      </Flex>
    </>
  )
}

export default OutsideNavbarContent
