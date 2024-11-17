// ProfileMenu.js
import React, { memo, useState, useCallback } from 'react'
import {
  Box,
  Image,
  VStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useDisclosure,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, HelpCircle } from 'lucide-react'

const MotionBox = motion(Box)

const MenuItem = memo(
  ({ icon: Icon, label, onClick, color = 'whiteAlpha.900' }) => (
    <MotionBox
      display="flex"
      alignItems="center"
      gap={3}
      px={4}
      py={2.5}
      cursor="pointer"
      whileHover={{ x: 4, color: 'white' }}
      color={color}
      onClick={onClick}
      role="button"
    >
      <Icon size={16} />
      <Text fontSize="sm">{label}</Text>
    </MotionBox>
  ),
)

MenuItem.displayName = 'MenuItem'

const ProfileMenu = memo(({ user }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      // Your existing logout logic here
      await dispatch(/* your logout action */)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
      onClose()
    }
  }, [dispatch, navigate, onClose])

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      onClick: () => {
        navigate(`/profile/${user?.inGameName}`)
        onClose()
      },
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => {
        navigate('/settings')
        onClose()
      },
    },
    {
      icon: HelpCircle,
      label: 'Help',
      onClick: () => {
        navigate('/help')
        onClose()
      },
    },
    {
      icon: LogOut,
      label: isLoggingOut ? 'Logging out...' : 'Logout',
      onClick: handleLogout,
      color: 'red.400',
    },
  ]

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom-end"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <MotionBox
          display="flex"
          alignItems="center"
          cursor="pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
        >
          <Image
            src={user?.pic || '/images/default-avatar.png'}
            alt="Profile"
            boxSize="30px"
            borderRadius="full"
            objectFit="cover"
          />
          <Box ml={1} color="whiteAlpha.700">
            <Box
              as="span"
              fontSize="16px"
              transform="rotate(90deg)"
              display="inline-block"
            >
              ⋯
            </Box>
          </Box>
        </MotionBox>
      </PopoverTrigger>

      <PopoverContent
        bg="rgba(14, 12, 22, 0.97)"
        backdropFilter="blur(8px)"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        width="200px"
        overflow="hidden"
      >
        <PopoverBody p={0}>
          <AnimatePresence>
            <VStack spacing={0} align="stretch" py={1}>
              {menuItems.map((item, index) => (
                <MenuItem
                  key={item.label}
                  {...item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </VStack>
          </AnimatePresence>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
})

ProfileMenu.displayName = 'ProfileMenu'

export default ProfileMenu
