import React, { useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import {
  Box,
  Heading,
  CloseButton,
  useDisclosure,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  removeNoteMessageWithId,
  setIsNotifDrawerOpen,
  setShowingSummaryForNoteMessages,
  setShowXpLevelModal,
} from '../../redux/appSlice'
import { useNavigate } from 'react-router-dom'
import { createHandleMessageAction } from '../../utils/messageActionHandlers'
import { useTranslation } from 'react-i18next'
import { handleSubmitFeedback } from '../../utils/helper.utils'

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
        navigateToProfile: id => navigate(`/profile/${id}`),
        navigateToTournament: () => navigate(`/tournament`),
        handleSubmitFeedback: () =>
          handleSubmitFeedback(
            feedbackContent.rating,
            feedbackContent.feedback,
            feedbackContent.storyId,
          ),
      }),
    [dispatch, navigate, feedbackContent],
  )

  // Memoize handleAction to avoid recreating the function on every render
  const handleAction = useCallback(
    actionType => {
      handleMessageAction(actionType, messageId, user?.inGameName)
      actionType !== 'VIEW_ALL' && handleClose()
    },
    [handleMessageAction, messageId, user?.inGameName],
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

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionBox
          position="fixed"
          top="20px"
          right="20px"
          width={width}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          zIndex={1001}
        >
          <Box
            bg="gray.800"
            color="gray.100"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Box
              bg="gray.700"
              px={4}
              py={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Heading
                as="h3"
                size="xs"
                textTransform="uppercase"
                letterSpacing="wide"
                color="white"
              >
                {title}
              </Heading>
              <CloseButton size="sm" onClick={handleClose} color="white" />
            </Box>
            <VStack align="stretch" p={3} spacing={2}>
              {customContent ? customContent : <Text>{content}</Text>}
              {actions.length > 0 && (
                <HStack spacing={2} justify="center" pt={2}>
                  <Suspense fallback={null}>
                    {actions.map((action, index) => (
                      <ButtonFactory
                        key={index}
                        actionType={action.actionType}
                        onClick={() => handleAction(action.actionType)}
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        innerText={action.text}
                        GuestLoginTranslate={GuestLoginTranslate}
                      >
                        {action.text}
                      </ButtonFactory>
                    ))}
                  </Suspense>
                </HStack>
              )}
            </VStack>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default NoteMessage
