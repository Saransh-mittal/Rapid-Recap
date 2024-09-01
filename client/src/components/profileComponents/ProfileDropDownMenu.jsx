import { Avatar, Flex, Box, Icon } from '@chakra-ui/react'
import React, { useState, useMemo, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import useSound from '../../customHooks/useSound'
import { NavLink } from 'react-router-dom'
import { addNoteMessage } from '../../redux/appSlice'
import { LockIcon } from '@chakra-ui/icons'

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
      width: '100px',
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
  const { user } = useSelector(state => state.auth)
  const { unreadFriendRequests } = useSelector(state => state.app)
  const dispatch = useDispatch()

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
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <motion.li
              whileHover={listHoverStyle}
              style={listStyle}
              variants={itemVariants}
            >
              <Inbox
                className={'inbox-button-lg'}
                onClick={() => setIsDrawerOpen(true)}
                notifyCont={notifyCont}
                display={{ base: 'none', md: 'flex' }}
                h="5"
                w="5"
              />
            </motion.li>
            <motion.li
              whileHover={listHoverStyle}
              style={listStyle}
              variants={itemVariants}
              padding={0}
            >
              {user?.role === 'guest' ? (
                <Flex
                  width={'100%'}
                  alignItems={'center'}
                  opacity={0.5}
                  justifyContent={'center'}
                  onClick={() =>
                    dispatch(
                      addNoteMessage({
                        title: 'Register to make friends and build Wise Web',
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
                  <UserFriendsSVG
                    fill={'white'}
                    width={'20px'}
                    height={'20px'}
                  />
                  <Icon as={LockIcon} color={'white'} ml={2} />
                </Flex>
              ) : (
                <Flex
                  onClick={onOpenWiseWeb}
                  width={'100%'}
                  justifyContent={'center'}
                >
                  <UserFriendsSVG
                    fill={'white'}
                    width={'20px'}
                    height={'20px'}
                  />
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
                View Profile
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
              Logout
            </motion.li>
          </Suspense>
        </motion.ul>
      </motion.nav>
    </Flex>
  )
}

export default ProfileDropDownMenu
