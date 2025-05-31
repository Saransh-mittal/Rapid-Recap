import React, {
  useState,
  useEffect,
  useRef,
  // lazy, // No longer needed for TaskPopup here
  // Suspense, // No longer needed for TaskPopup here
  useCallback,
  // useMemo, // No longer needed for pendingTasks badge
} from 'react'
import {
  Box,
  Icon,
  VStack,
  useDisclosure,
  Button,
  useToast,
  Portal,
  Center,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Menu as MenuIcon, X, Sword } from 'lucide-react' // Removed Users
// import { useSelector } from 'react-redux'; // Kept for potential future use, but not strictly needed now

// Import existing components to reuse
import QuickClashLeaderboardButton from './leaderboard/QuickClashLeaderboardButton'
// MatchmakingButton and GlobalMatchmakingButton are removed from here

// const TaskPopup = lazy(() => import('./dailyTasks/TaskPopup')) // TaskPopup is no longer triggered from here

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Pre-define animation variants outside component to prevent recreation on each render
const menuItemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: i => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      type: 'spring',
      stiffness: 240,
      damping: 20,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
}

// Main button animation variants
const mainButtonVariants = {
  closed: {
    rotate: 0,
    background: 'linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)',
  },
  open: {
    rotate: 90,
    background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
  },
}

// Pre-define styles for menu item wrappers
const leaderboardButtonStyle = {
  '> div, > button': {
    position: 'static !important',
    transform: 'none !important',
    top: 'auto !important',
    left: 'auto !important',
    right: 'auto !important',
    bottom: 'auto !important',
  },
  '.chakra-button': {
    width: '48px !important',
    height: '48px !important',
    borderRadius: 'full !important',
    p: '0 !important',
    minWidth: 'auto !important',
  },
  '.chakra-button > span, .chakra-button > div > span': {
    display: 'none !important',
  },
}

// matchmakingButtonStyle is no longer needed here

const FloatingActionMenu = ({
  onNewChallenge /* onFindMatch prop is no longer used here */,
}) => {
  const { t } = useTranslation('QuickClash')
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const toast = useToast()
  const menuRef = useRef(null)

  // Load saved position on mount
  useEffect(() => {
    setPosition({ x: window.innerWidth - 70, y: window.innerHeight - 160 })
  }, [])

  // Save position when it changes (but only when not dragging)
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('floatingMenuPosition', JSON.stringify(position))
    }
  }, [position, isDragging])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onClose()
  }, [onClose])

  const handleDragEnd = useCallback((_, info) => {
    setIsDragging(false)
    setPosition(prevPosition => {
      const newX = Math.max(
        20,
        Math.min(window.innerWidth - 70, prevPosition.x + info.offset.x),
      )
      const newY = Math.max(
        20,
        Math.min(window.innerHeight - 70, prevPosition.y + info.offset.y),
      )
      return { x: newX, y: newY }
    })
  }, [])

  const handleResetPosition = useCallback(() => {
    const defaultPosition = {
      x: window.innerWidth - 80,
      y: window.innerHeight - 100,
    }
    setPosition(defaultPosition)
    localStorage.setItem(
      'floatingMenuPosition',
      JSON.stringify(defaultPosition),
    )
    toast({
      title: t('Position Reset'),
      description: t('Menu position has been reset to default'),
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [toast, t])

  const handleNewChallengeClick = useCallback(() => {
    onNewChallenge()
    onClose()
  }, [onNewChallenge, onClose])

  return (
    <Portal>
      <MotionBox
        ref={menuRef}
        position="fixed"
        top={'60px'}
        className={'matchmaking-floating-menu'}
        zIndex={100}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ x: position.x, y: position.y }}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', damping: 20 }}
        userSelect="none"
      >
        <MotionButton
          width="60px"
          height="60px"
          borderRadius="full"
          userSelect="none"
          bgGradient={
            isOpen
              ? 'linear(to-br, red.500, red.600)'
              : 'linear(to-br, purple.500, purple.600)'
          }
          color="white"
          onClick={onToggle}
          boxShadow="0 5px 15px rgba(0,0,0,0.3)"
          position="relative"
          overflow="hidden"
          variants={mainButtonVariants}
          animate={isOpen ? 'open' : 'closed'}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onDoubleClick={handleResetPosition}
          _active={{ transform: 'scale(0.95)' }}
        >
          {!isOpen && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              overflow="hidden"
              borderRadius="full"
              pointerEvents="none"
            >
              <MotionBox
                position="absolute"
                top="15%"
                left="15%"
                width="6px"
                height="6px"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.8)"
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: 0.2,
                }}
              />
              <MotionBox
                position="absolute"
                bottom="25%"
                right="20%"
                width="4px"
                height="4px"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.8)"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: 0.5,
                }}
              />
            </Box>
          )}
          <Center>
            <Icon as={isOpen ? X : MenuIcon} boxSize={6} zIndex={2} />
          </Center>
        </MotionButton>

        <AnimatePresence mode="wait">
          {isOpen && (
            <VStack
              position="absolute"
              bottom="70px"
              right="5px"
              spacing={3}
              align="flex-end"
              userSelect="none"
            >
              <MotionBox
                custom={0} // First item
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <MotionButton
                  onClick={handleNewChallengeClick}
                  size="md"
                  colorScheme="purple"
                  borderRadius="full"
                  width="48px"
                  height="48px"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  boxShadow="0 4px 10px rgba(0,0,0,0.25)"
                  _hover={{ transform: 'translateY(-2px)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  userSelect="none"
                >
                  <Icon as={Sword} boxSize={5} />
                </MotionButton>
              </MotionBox>

              {/* MatchmakingButton (1v1) - REMOVED */}
              {/* GlobalMatchmakingButton (4v4) - REMOVED */}

              <MotionBox
                custom={1} // Adjusted custom index
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                userSelect="none"
                exit="exit"
                sx={leaderboardButtonStyle}
              >
                <QuickClashLeaderboardButton />
              </MotionBox>
            </VStack>
          )}
        </AnimatePresence>
      </MotionBox>
    </Portal>
  )
}
export default React.memo(FloatingActionMenu)
