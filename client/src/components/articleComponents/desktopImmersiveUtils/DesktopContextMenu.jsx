// Fixed Desktop Context Menu Component for Immersive Mode
// Location: client/src/components/articleComponents/desktopImmersiveUtils/DesktopContextMenu.jsx

import React, { useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useMediaQuery,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  Home,
  Square,
  Maximize,
  Minimize,
  Eye,
} from 'lucide-react'

const MotionBox = motion(Box)

export const DesktopContextMenu = ({
  isVisible = false,
  position = null,
  onClose = () => {},
  onNavigate = () => {},
  onExit = () => {},
  onToggleFullscreen = () => {},
  onToggleControls = () => {},
}) => {
  // FIXED: Always call hooks in the same order, regardless of conditions
  const [isDesktop] = useMediaQuery('(min-width: 992px)')

  // FIXED: Always call useMemo, but handle null position inside
  const adjustedPosition = useMemo(() => {
    // Handle null/undefined position
    if (
      !position ||
      typeof position.x !== 'number' ||
      typeof position.y !== 'number'
    ) {
      return { x: 0, y: 0 }
    }

    const menuWidth = 220
    const menuHeight = 280 // Approximate height
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = position.x
    let y = position.y

    // Adjust horizontal position
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10
    }

    // Adjust vertical position
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10
    }

    return { x: Math.max(10, x), y: Math.max(10, y) }
  }, [position]) // Only depend on position

  // FIXED: Define menu items outside of conditional render
  const menuItems = useMemo(
    () => [
      {
        label: 'Previous Section',
        action: () => onNavigate(-1),
        icon: ArrowUp,
        shortcut: '↑',
      },
      {
        label: 'Next Section',
        action: () => onNavigate(1),
        icon: ArrowDown,
        shortcut: '↓',
      },
      {
        label: 'Go to Top',
        action: () => onNavigate('top'),
        icon: Home,
        shortcut: 'Home',
      },
      { type: 'separator' },
      {
        label: 'Toggle Fullscreen',
        action: onToggleFullscreen,
        icon:
          typeof document !== 'undefined' && document.fullscreenElement
            ? Minimize
            : Maximize,
        shortcut: 'Ctrl+F',
      },
      {
        label: 'Toggle Controls',
        action: onToggleControls,
        icon: Eye,
        shortcut: 'Ctrl+H',
      },
      { type: 'separator' },
      {
        label: 'Exit Immersive Mode',
        action: onExit,
        icon: Square,
        shortcut: 'Esc',
        danger: true,
      },
    ],
    [onNavigate, onToggleFullscreen, onToggleControls, onExit],
  )

  // FIXED: Early return after all hooks have been called
  if (!isDesktop || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <>
        {/* Backdrop to close menu */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={9999}
          onClick={onClose}
        />

        {/* Menu */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          position="fixed"
          left={adjustedPosition.x}
          top={adjustedPosition.y}
          zIndex={10000}
          bg="rgba(15, 15, 15, 0.98)"
          backdropFilter="blur(20px)"
          borderRadius="xl"
          border="1px solid rgba(255,255,255,0.15)"
          boxShadow="0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)"
          py={2}
          minW="220px"
          maxW="280px"
          overflow="hidden"
        >
          <VStack spacing={0} align="stretch">
            {menuItems.map((item, index) => {
              if (item.type === 'separator') {
                return (
                  <Box
                    key={`separator-${index}`}
                    h="1px"
                    bg="rgba(255,255,255,0.1)"
                    mx={3}
                    my={1}
                  />
                )
              }

              return (
                <MotionBox
                  key={`menu-item-${index}`}
                  as="button"
                  px={4}
                  py={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  color={item.danger ? 'red.300' : 'white'}
                  fontSize="sm"
                  fontWeight="500"
                  whileHover={{
                    backgroundColor: item.danger
                      ? 'rgba(245, 101, 101, 0.15)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    try {
                      item.action?.()
                    } catch (error) {
                      console.error('Error executing menu action:', error)
                    } finally {
                      onClose?.()
                    }
                  }}
                  transition="background 0.15s ease"
                  cursor="pointer"
                  w="100%"
                  textAlign="left"
                  _focus={{ outline: 'none' }}
                >
                  <HStack spacing={3} flex={1}>
                    <Icon
                      as={item.icon}
                      boxSize={4}
                      color={item.danger ? 'red.400' : 'whiteAlpha.800'}
                    />
                    <Text flex={1}>{item.label}</Text>
                  </HStack>

                  {item.shortcut && (
                    <Text
                      fontSize="xs"
                      color="whiteAlpha.500"
                      fontFamily="mono"
                      bg="rgba(255,255,255,0.08)"
                      px={2}
                      py={1}
                      borderRadius="md"
                      minW="fit-content"
                    >
                      {item.shortcut}
                    </Text>
                  )}
                </MotionBox>
              )
            })}
          </VStack>

          {/* Menu accent border */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="2px"
            bg="linear-gradient(90deg, rgba(159, 122, 234, 0.8), rgba(214, 158, 46, 0.8))"
            borderTopRadius="xl"
          />
        </MotionBox>
      </>
    </AnimatePresence>
  )
}

export default DesktopContextMenu
