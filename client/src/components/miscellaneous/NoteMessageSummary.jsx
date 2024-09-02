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
  Progress,
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
import Confetti from 'react-confetti'
import { formatRemainingTime } from '../../utils/helper.utils'
import { getMilestoneInfo } from './noteMessages/milestones'

// Lazy load components and assets
const ButtonFactory = lazy(() => import('./ButtonFactory'))
const TrophySVG = lazy(() => import('../../assets/svg/TrophySVG'))
const FireSVG = lazy(() => import('../../assets/svg/FireSVG'))
const UnlinkSVG = lazy(() => import('../../assets/svg/UnlinkSVG'))
const RevivalSVG = lazy(() => import('../../assets/svg/RevivalSVG'))
const CheckCircle = lazy(() => import('../../assets/svg/CheckCircle'))

const MotionBox = motion(Box)

const NoteMessageSummary = ({ messages, onClose }) => {
  const dispatch = useDispatch()
  const { isOpen, onClose: closeDisclosure } = useDisclosure({
    defaultIsOpen: true,
  })
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [showConfetti, setShowConfetti] = useState(false)

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
    const hasMilestone = messages.some(
      message =>
        (message.messageType === 'xpAward' &&
          (message.isMilestone || message.milestoneName)) ||
        (message.messageType === 'streak' &&
          message.streakStatus === 'revived'),
    )
    if (hasMilestone) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000) // Run confetti for 5 seconds
    }
  }, [messages])

  const getStreakIcon = streakStatus => {
    switch (streakStatus) {
      case 'broken':
        return <UnlinkSVG height="40px" width="40px" />
      case 'revival':
        return <RevivalSVG height="40px" width="40px" />
      case 'revived':
        return <CheckCircle height="40px" width="40px" />
      default:
        return <FireSVG height="40px" width="40px" />
    }
  }

  const getStreakColorScheme = streakStatus => {
    switch (streakStatus) {
      case 'broken':
        return 'red'
      case 'revival':
        return 'yellow'
      case 'revived':
        return 'green'
      default:
        return 'orange'
    }
  }

  const renderMessageContent = useCallback(message => {
    switch (message.messageType) {
      case 'xpAward':
        const milestoneInfo = message.milestoneName
          ? getMilestoneInfo(message.milestoneName)
          : null
        const totalXp = message.xpAwarded + (milestoneInfo?.xpReward || 0)

        return (
          <Suspense fallback={null}>
            <HStack spacing={3}>
              <Box
                bg={
                  message.isMilestone || message.milestoneName
                    ? 'yellow.500'
                    : 'yellow.400'
                }
                borderRadius="full"
                p={2}
                boxShadow={
                  message.isMilestone || message.milestoneName
                    ? '0 0 20px rgba(255, 255, 0, 0.5)'
                    : '0 0 15px rgba(255, 255, 0, 0.3)'
                }
              >
                <TrophySVG height={'40px'} width={'40px'} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">
                  {message.isMilestone || message.milestoneName
                    ? 'Milestone Achieved!'
                    : message.title}
                </Text>
                <Text
                  color={
                    message.isMilestone || message.milestoneName
                      ? 'purple.400'
                      : 'green.400'
                  }
                >
                  {totalXp} XP earned
                </Text>
                {message.xpSource && (
                  <Text color="gray.400" fontSize="sm">
                    {message.xpSource}
                  </Text>
                )}
                {message.milestoneName && (
                  <>
                    <Text color="blue.300" fontSize="sm">
                      {message.milestoneName} Milestone
                    </Text>
                    {milestoneInfo && (
                      <Text color="gray.400" fontSize="xs">
                        {milestoneInfo.description}
                      </Text>
                    )}
                  </>
                )}
                {message.isMilestone &&
                  !message.milestoneName &&
                  message.milestoneContent && (
                    <Text color="gray.400" fontSize="xs">
                      {message.milestoneContent}
                    </Text>
                  )}
              </VStack>
            </HStack>
          </Suspense>
        )
      case 'streak':
        return (
          <Suspense fallback={null}>
            <HStack spacing={3}>
              <Box
                bg={`${getStreakColorScheme(message.streakStatus)}.400`}
                borderRadius="full"
                p={2}
                boxShadow={`0 0 15px ${getStreakColorScheme(
                  message.streakStatus,
                )}.300`}
              >
                {getStreakIcon(message.streakStatus)}
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{message.title}</Text>
                <Text
                  color={`${getStreakColorScheme(message.streakStatus)}.400`}
                >
                  {message.streakStatus === 'broken'
                    ? `${message.streakCount}-day streak ended`
                    : `${message.streakCount}-day streak`}
                </Text>
                {message.streakStatus === 'revival' &&
                  message.remainingTime && (
                    <>
                      {message.remainingQuizzes > 0 && (
                        <Text fontSize="sm" color="gray.400">
                          Complete {message.remainingQuizzes} more{' '}
                          {message.remainingQuizzes === 1 ? 'quiz' : 'quizzes'}{' '}
                          to revive your streak!
                        </Text>
                      )}
                      <Text fontSize="sm" color="gray.400">
                        {formatRemainingTime(message.remainingTime)} to revive
                      </Text>
                      <Box w="100%" mt={1}>
                        <Progress
                          value={(message.remainingTime / (24 * 60 * 60)) * 100}
                          size="xs"
                          colorScheme={getStreakColorScheme(
                            message.streakStatus,
                          )}
                        />
                      </Box>
                    </>
                  )}
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
                  <HStack mt={2} spacing={2} justify={'center'}>
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
