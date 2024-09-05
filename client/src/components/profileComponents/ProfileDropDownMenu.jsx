import { Avatar, Flex, Box, Icon, Text, Spinner } from '@chakra-ui/react'
import React, { useState, useMemo, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import useSound from '../../customHooks/useSound'
import { NavLink } from 'react-router-dom'
import { addNoteMessage } from '../../redux/appSlice'
import { LockIcon, QuestionIcon } from '@chakra-ui/icons'
import UserSVG from '../../assets/svg/UserSVG'
import LogoutSVG from '../../assets/svg/LogoutSVG'
import { useTranslation } from 'react-i18next'

const Inbox = React.lazy(() =>
  import('../Header-Footer/navbarComponents/Inbox'),
)
const UserFriendsSVG = React.lazy(() =>
  import('../../assets/svg/UserFriendsSVG'),
)

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
}

const ProfileDropDownMenu = ({
  handleLogout,
  toProfile,
  refProfile,
  className,
  setIsDrawerOpen,
  notifyCont,
  onOpenWiseWeb,
  display,
}) => {
  const { t } = useTranslation(['ProfileDropDownMenu'])
  const listStyle = useMemo(
    () => ({
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '10px',
      backgroundColor: '#526D82',
      color: 'white',
      cursor: 'pointer',
      width: '120px',
      borderBottom: '1px solid',
      backgroundImage:
        'linear-gradient(to right, transparent, #27374D, transparent)',
      backgroundClip: 'border-box',
      borderImage:
        'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)) 1',
    }),
    [],
  )

  const listHoverStyle = useMemo(
    () => ({
      backgroundColor: '#27374D',
    }),
    [],
  )

  const { playClick } = useSound()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { unreadFriendRequests } = useSelector(state => state.app)
  const dispatch = useDispatch()
  const showDashboard = isAuthenticated && user && user.role === 'admin'

  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleProfileClick = useCallback(() => {
    playClick()
    setIsOpen(false)
  }, [playClick])

  return (
    <Flex className={className} position={'relative'} display={display}>
      <motion.nav
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          filter: 'drop-shadow(1px 1px 1px #4700b3)',
          width: '60px',
          height: '40px',
          position: 'relative',
          right: '0',
          top: '0',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={toggleDropdown}
          style={{
            position: 'absolute',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Flex position={'relative'}>
            <Avatar src={user?.pic} h={'35px'} w={'35px'} rounded={'50%'} />
          </Flex>
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
        <motion.ul
          variants={{
            open: {
              clipPath: 'inset(0% 0% 0% 0% round 10px)',
              transition: {
                type: 'spring',
                bounce: 0,
                duration: 0.7,
                delayChildren: 0.3,
                staggerChildren: 0.05,
              },
            },
            closed: {
              clipPath: 'inset(10% 50% 90% 50% round 10px)',
              transition: {
                type: 'spring',
                bounce: 0,
                duration: 0.3,
              },
            },
          }}
          style={{
            position: 'absolute',
            backgroundColor: '#9DB2BF',
            pointerEvents: isOpen ? 'auto' : 'none',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            top: '3rem',
            right: '-1rem',
          }}
        >
          <Suspense fallback={<Spinner />}>
            <NavLink
              to={`${toProfile}/${user?.inGameName}`}
              ref={refProfile}
              onClick={handleProfileClick}
            >
              <motion.li
                whileHover={listHoverStyle}
                style={listStyle}
                variants={itemVariants}
              >
                <Flex
                  width={'100%'}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                  gap={2}
                >
                  <UserSVG fill={'white'} width={'16px'} height={'16px'} />
                  <Text padding={0} margin={0}>
                    {t('view_profile')}
                  </Text>
                </Flex>
              </motion.li>
            </NavLink>
            {showDashboard && (
              <NavLink to={`/dashboard`} onClick={handleProfileClick}>
                <motion.li
                  whileHover={listHoverStyle}
                  style={listStyle}
                  variants={itemVariants}
                >
                  <Flex
                    width={'100%'}
                    justifyContent={'flex-start'}
                    alignItems={'center'}
                    gap={2}
                  >
                    <Text padding={0} margin={0}>
                      Dashboard
                    </Text>
                  </Flex>
                </motion.li>
              </NavLink>
            )}
            <motion.li
              whileHover={listHoverStyle}
              style={listStyle}
              variants={itemVariants}
            >
              {user?.role === 'guest' ? (
                <Flex
                  width={'100%'}
                  alignItems={'center'}
                  opacity={0.5}
                  justifyContent={'flex-start'}
                  onClick={() =>
                    dispatch(
                      addNoteMessage({
                        title: t('register_message.title'),
                        duration: 10000,
                        width: '250px',
                        actions: [
                          {
                            actionType: 'SECURE_YOUR_PROGRESS',
                          },
                        ],
                      }),
                    )
                  }
                >
                  <Flex
                    onClick={onOpenWiseWeb}
                    width={'100%'}
                    justifyContent={'flex-start'}
                    alignItems={'center'}
                    gap={2}
                  >
                    <UserFriendsSVG
                      fill={'white'}
                      width={'16px'}
                      height={'16px'}
                    />
                    <Text padding={0} margin={0} fontSize={'0.75rem'}>
                      {t('Wise Web')}
                    </Text>
                  </Flex>
                  <Icon as={LockIcon} color={'white'} ml={2} />
                </Flex>
              ) : (
                <Flex
                  onClick={onOpenWiseWeb}
                  width={'100%'}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                  gap={2}
                >
                  <UserFriendsSVG
                    fill={'white'}
                    width={'16px'}
                    height={'16px'}
                  />
                  <Text padding={0} margin={0}>
                    {t('Wise Web')}
                  </Text>
                  {unreadFriendRequests !== 0 && (
                    <Box
                      h="8px"
                      w="8px"
                      bg={'red'}
                      borderRadius={'50%'}
                      position={'absolute'}
                      right={'22%'}
                      top={'40%'}
                      zIndex={2}
                    />
                  )}
                </Flex>
              )}
            </motion.li>
            <motion.li
              whileHover={listHoverStyle}
              style={listStyle}
              variants={itemVariants}
            >
              <Flex
                w={'100%'}
                justifyContent={'flex-start'}
                alignItems={'center'}
                gap={2}
                onClick={() => setIsDrawerOpen(true)}
              >
                <Inbox
                  className={'inbox-button-lg'}
                  notifyCont={notifyCont}
                  display={{ base: 'none', md: 'flex' }}
                  h="16px"
                  w="16px"
                />

                <Text padding={0} margin={0}>
                  {t('View Inbox')}
                </Text>
              </Flex>
            </motion.li>
            <NavLink to={`/contact`} onClick={handleProfileClick}>
              <motion.li
                whileHover={listHoverStyle}
                style={listStyle}
                variants={itemVariants}
              >
                <Flex
                  width={'100%'}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                  gap={2}
                >
                  <QuestionIcon fill={'white'} width={'16px'} height={'16px'} />
                  <Text padding={0} margin={0}>
                    {t('Contact Us')}
                  </Text>
                </Flex>
              </motion.li>
            </NavLink>
            <motion.li
              whileHover={listHoverStyle}
              style={listStyle}
              variants={itemVariants}
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
            >
              <Flex
                width={'100%'}
                justifyContent={'flex-start'}
                alignItems={'center'}
                gap={2}
              >
                <LogoutSVG fill={'white'} width={'16px'} height={'16px'} />
                <Text padding={0} margin={0}>
                  {t('logout')}
                </Text>
              </Flex>
            </motion.li>
          </Suspense>
        </motion.ul>
      </motion.nav>
    </Flex>
  )
}

export default ProfileDropDownMenu
