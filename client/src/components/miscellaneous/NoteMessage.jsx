// NoteMessage.jsx
import React, { useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import {
  Box,
  Heading,
  CloseButton,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  removeNoteMessageWithId,
  setIsNotifDrawerOpen,
  setShowingSummaryForNoteMessages,
  setShowXpLevelModal,
  setSelectedNotificationId,
  setWeakMode,
} from '../../redux/appSlice'
import { useNavigate } from 'react-router-dom'
import { createHandleMessageAction } from '../../utils/messageActionHandlers'
import { useTranslation } from 'react-i18next'
import {
  handleQuizFeedback,
  handleSubmitFeedback,
  handleTournamentFeedback,
} from '../../utils/helper.utils'

// Lazy load utilities and components
const ButtonFactory = lazy(() => import('./ButtonFactory'))

const MotionBox = motion(Box)

const NoteMessage = ({
  messageId,
  title,
  content,
  onClose,
  duration = 7000,
  width = '320px',
  actions = [],
  customContent,
  customHeader,
  feedbackContent,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { t: GuestLoginTranslate } = useTranslation('GuestLogin')

  // Memoize handleMessageAction to prevent unnecessary re-renders
  const handleMessageAction = useMemo(
    () =>
      createHandleMessageAction(dispatch, {
        setShowingSummaryForNoteMessages,
        removeNoteMessageWithId,
        setShowXpLevelModal,
        setIsNotifDrawerOpen,
        setSelectedNotificationId,
        navigateToProfile: id => navigate(`/profile/${id}`),
        navigateToTournament: () => navigate(`/tournament`),
        handleSubmitFeedback: () =>
          handleSubmitFeedback(
            feedbackContent?.rating,
            feedbackContent?.feedback,
            feedbackContent?.feedbackId,
          ),
        handleQuizFeedback: () =>
          handleQuizFeedback(
            feedbackContent?.rating,
            feedbackContent?.feedback,
            feedbackContent?.feedbackId,
          ),
        handleTournamentFeedback: () =>
          handleTournamentFeedback(
            feedbackContent?.rating,
            feedbackContent?.feedback,
            feedbackContent?.feedbackId,
          ),
      }),
    [dispatch, navigate, feedbackContent],
  )

  // Memoize handleAction to avoid recreating the function on every render
  const handleAction = useCallback(
    (actionType, payload) => {
      if (actionType === 'SWITCH_TO_WEAK_MODE') {
        dispatch(setWeakMode(true))
        console.log('Switching to weak mode')
      } else if (actionType === 'STAY_IN_NORMAL_MODE') {
        dispatch(setWeakMode(false))
        console.log('Staying in normal mode')
      } else {
        handleMessageAction(actionType, messageId, user?.inGameName, payload)
      }
      actionType !== 'VIEW_ALL' && handleClose()
    },
    [handleMessageAction, messageId, user?.inGameName, dispatch],
  )

  const { isOpen, onClose: closeDisclosure } = useDisclosure({
    defaultIsOpen: true,
  })

  useEffect(() => {
    if (duration !== null) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = useCallback(() => {
    closeDisclosure()
    setTimeout(() => {
      onClose && onClose()
      dispatch(removeNoteMessageWithId(messageId))
    }, 500)
  }, [closeDisclosure, onClose, dispatch, messageId])

  // Enhanced animation variants
  const slideInVariants = {
    hidden: { x: '110%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 18,
        mass: 1.1,
      },
    },
    exit: {
      x: '110%',
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
      },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionBox
          position="fixed"
          top="20px"
          right="5px"
          width={width}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideInVariants}
          zIndex={1001}
        >
          <Box
            position="relative"
            bg="rgba(26, 21, 39, 0.94)"
            backdropFilter="blur(10px)"
            color="gray.100"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="0 5px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08) inset"
            borderWidth="1px"
            borderColor="rgba(255, 255, 255, 0.1)"
            height="auto"
            maxHeight="80vh"
            transition="transform 0.2s, box-shadow 0.2s"
            _hover={{
              boxShadow:
                '0 7px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              transform: 'translateY(-1px)',
            }}
          >
            {/* Subtle gradient border effect */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              height="2px"
              bgGradient="linear(to-r, purple.500, blue.400, teal.300)"
              borderTopLeftRadius="lg"
              borderTopRightRadius="lg"
            />

            {/* Render custom header if provided, otherwise use default header */}
            {customHeader ? (
              customHeader
            ) : (
              <Box
                px={4}
                py={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottomWidth="1px"
                borderColor="rgba(255, 255, 255, 0.08)"
              >
                <Heading
                  as="h3"
                  size="xs"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  color="white"
                  fontSize="0.9rem"
                  fontWeight="600"
                  textShadow="0 1px 2px rgba(0,0,0,0.2)"
                >
                  {title}
                </Heading>
                <CloseButton
                  size="sm"
                  onClick={handleClose}
                  color="whiteAlpha.800"
                  _hover={{
                    color: 'white',
                    bg: 'rgba(255, 255, 255, 0.08)',
                  }}
                />
              </Box>
            )}

            <Flex
              direction="column"
              p={3}
              spacing={2}
              maxHeight="60vh"
              overflowY="auto"
              sx={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '4px',
                  background: 'rgba(0,0,0,0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '24px',
                },
              }}
            >
              {customContent ? (
                customContent
              ) : (
                <Text
                  color="whiteAlpha.900"
                  fontSize="0.95rem"
                  lineHeight="1.5"
                >
                  {content}
                </Text>
              )}

              {actions.length > 0 && (
                <HStack spacing={2} justify="center" pt={3} pb={1}>
                  <Suspense fallback={null}>
                    {actions.map((action, index) => (
                      <ButtonFactory
                        key={index}
                        actionType={action.actionType}
                        onClick={() =>
                          handleAction(action.actionType, action?.payload)
                        }
                        path={action?.path}
                        size="sm"
                        innerText={action.text}
                        GuestLoginTranslate={GuestLoginTranslate}
                      >
                        {action.text}
                      </ButtonFactory>
                    ))}
                  </Suspense>
                </HStack>
              )}
            </Flex>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default NoteMessage
