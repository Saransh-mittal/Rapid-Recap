import React, {
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useState,
  useEffect,
} from 'react'
import {
  Box,
  VStack,
  Text,
  CloseButton,
  Button,
  useDisclosure,
  HStack,
  Divider,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  removeNoteMessageWithId,
  setIsNotifDrawerOpen,
  setShowingSummaryForNoteMessages,
  setShowXpLevelModal,
} from '../../redux/appSlice'
import { createHandleMessageAction } from '../../utils/messageActionHandlers'
import { useNavigate } from 'react-router-dom'
// import useSound from 'use-sound'
// import achievementSound from '../../assets/sounds/achievement.mp3'
// import milestoneSound from '../../assets/sounds/milestone.mp3'
import Confetti from 'react-confetti'

// Lazy load components and assets
const ButtonFactory = lazy(() => import('./ButtonFactory'))
const TrophySVG = lazy(() => import('../../assets/svg/TrophySVG'))

const MotionBox = motion(Box)

const NoteMessageSummary = ({ messages, onClose }) => {
  const dispatch = useDispatch()
  const { isOpen, onClose: closeDisclosure } = useDisclosure({
    defaultIsOpen: true,
  })
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [showConfetti, setShowConfetti] = useState(false)
  // const [playAchievement] = useSound(achievementSound, { volume: 0.5 })
  // const [playMilestone] = useSound(milestoneSound, { volume: 0.5 })

  // Memoize handleMessageAction to prevent unnecessary re-renders
  const handleMessageAction = useMemo(
    () =>
      createHandleMessageAction(dispatch, {
        setShowingSummaryForNoteMessages,
        removeNoteMessageWithId,
        setShowXpLevelModal,
        setIsNotifDrawerOpen,
        navigateToProfile: id => navigate(`/profile/${id}`),
      }),
    [dispatch, navigate],
  )

  // Memoize handleDismiss and handleAction to avoid recreating the functions on every render
  const handleDismiss = useCallback(
    id => {
      handleMessageAction('DISMISS', id)
    },
    [handleMessageAction],
  )

  const handleAction = useCallback(
    (actionType, messageId) => {
      handleMessageAction(actionType, messageId, user?.inGameName)
    },
    [handleMessageAction, user?.inGameName],
  )

  const handleClose = useCallback(() => {
    closeDisclosure()
    setTimeout(onClose, 500) // Delay to allow for exit animation
  }, [closeDisclosure, onClose])

  useEffect(() => {
    const hasMilestone = messages.some(message => message.isMilestone)
    if (hasMilestone) {
      setShowConfetti(true)
      // playMilestone()
      setTimeout(() => setShowConfetti(false), 5000) // Run confetti for 5 seconds
    } else if (messages.some(message => message.messageType === 'xpAward')) {
      // playAchievement()
    }
  }, [
    messages,
    // playMilestone,
    // playAchievement
  ])

  const renderMessageContent = useCallback(message => {
    switch (message.messageType) {
      case 'xpAward':
        return (
          <Suspense fallback={null}>
            <HStack spacing={3}>
              <Box
                bg={message.isMilestone ? 'yellow.500' : 'yellow.400'}
                borderRadius="full"
                p={2}
                boxShadow={
                  message.isMilestone
                    ? '0 0 20px rgba(255, 255, 0, 0.5)'
                    : '0 0 15px rgba(255, 255, 0, 0.3)'
                }
              >
                <TrophySVG height={'40px'} width={'40px'} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">
                  {message.isMilestone ? 'Milestone Achieved!' : message.title}
                </Text>
                <Text color={message.isMilestone ? 'purple.400' : 'green.400'}>
                  {message.xpAwarded} XP earned
                </Text>
              </VStack>
            </HStack>
          </Suspense>
        )
      default:
        return (
          <>
            <Text fontWeight="bold">{message.title}</Text>
            <Text>{message.content}</Text>
          </>
        )
    }
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionBox
          position="fixed"
          top="20px"
          right="20px"
          width="350px"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          zIndex={1001}
        >
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={200}
              gravity={0.2}
            />
          )}
          <Box
            bg="gray.800"
            color="gray.100"
            borderRadius="md"
            overflow="hidden"
            boxShadow="lg"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Box
              bg="gray.700"
              px={5}
              py={3}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottomWidth="1px"
              borderColor="gray.600"
            >
              <Text fontWeight="bold">All Messages</Text>
              <CloseButton size="sm" onClick={handleClose} />
            </Box>
            <VStack
              spacing={2}
              align="stretch"
              p={4}
              maxHeight="400px"
              overflowY="auto"
            >
              {messages.map((message, index) => (
                <Box key={index} bg="gray.700" p={3} borderRadius="md">
                  {renderMessageContent(message)}
                  <HStack mt={2} spacing={2}>
                    <Suspense fallback={null}>
                      {message.actions &&
                        message.actions.map((action, actionIndex) => (
                          <ButtonFactory
                            key={actionIndex}
                            actionType={action.actionType}
                            onClick={() =>
                              handleAction(action.actionType, message.id)
                            }
                            size="sm"
                            innerText={action.text}
                          >
                            {!action.actionType === 'SIGN_IN' && action.text}
                          </ButtonFactory>
                        ))}
                    </Suspense>
                    <Button size="sm" onClick={() => handleDismiss(message.id)}>
                      Dismiss
                    </Button>
                  </HStack>
                </Box>
              ))}
            </VStack>
            <Divider />
            <Box p={4}>
              <Button width="100%" onClick={handleClose}>
                Dismiss All
              </Button>
            </Box>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default NoteMessageSummary
