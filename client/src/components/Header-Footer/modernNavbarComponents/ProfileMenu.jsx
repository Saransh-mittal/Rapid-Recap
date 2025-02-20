// ProfileMenu.js
import React, { memo } from 'react'
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
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  User,
  LogOut,
  HelpCircle,
  LayoutDashboard,
  Scroll,
  Gift,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const MenuItem = memo(
  ({ icon: Icon, label, isHidden, onClick, color = 'whiteAlpha.900' }) => (
    <MotionBox
      display={isHidden ? 'none' : 'flex'}
      alignItems="center"
      gap={3}
      px={4}
      py={2.5}
      cursor="pointer"
      whileHover={{ x: 4, color: '#ffffff' }}
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

const ProfileMenu = memo(({ user, handleLogout, isLoggingOut }) => {
  const navigate = useNavigate()
  const { t } = useTranslation('Navbar')
  const { isOpen, onToggle, onClose } = useDisclosure()

  const { isAuthenticated } = useSelector(state => state.auth)
  const showDashboard = isAuthenticated && user && user.role === 'admin'

  const menuItems = [
    {
      icon: User,
      label: t('profileMenu.profile.title'),
      onClick: () => {
        navigate(`/profile/${user?.inGameName}`)
        onClose()
      },
    },
    {
      icon: LayoutDashboard,
      label: t('profileMenu.dashboard'),
      onClick: () => {
        navigate('/dashboard')
        onClose()
      },
      isHidden: !showDashboard,
    },
    {
      icon: Gift,
      label: t('profileMenu.referral'), // Add translation key
      onClick: () => {
        navigate('/referral')
        onClose()
      },
    },
    {
      icon: Scroll,
      label: t('profileMenu.manual'), // Add translation key
      onClick: () => {
        navigate('/manual')
        onClose()
      },
    },
    {
      icon: HelpCircle,
      label: t('profileMenu.help'),
      onClick: () => {
        navigate('/contact')
        onClose()
      },
    },
    {
      icon: LogOut,
      label: isLoggingOut
        ? t('profileMenu.logout.loading')
        : t('profileMenu.logout.default'),
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
        width="fit-content"
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
