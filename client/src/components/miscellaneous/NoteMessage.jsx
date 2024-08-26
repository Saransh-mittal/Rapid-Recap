import React, { useEffect } from 'react'
import {
  Box,
  Heading,
  CloseButton,
  useDisclosure,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  removeNoteMessageWithId,
  setShowingSummaryForNoteMessages,
  setShowXpLevelModal,
} from '../../redux/appSlice'
import { createHandleMessageAction } from '../../utils/messageActionHandlers'
import ButtonFactory from './ButtonFactory'
import { useNavigate } from 'react-router-dom'

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
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const handleMessageAction = createHandleMessageAction(dispatch, {
    setShowingSummaryForNoteMessages,
    removeNoteMessageWithId,
    setShowXpLevelModal,
    navigateToProfile: id => navigate(`/profile/${id}`),
  })

  const handleAction = actionType => {
    handleMessageAction(actionType, messageId, user?.inGameName)
    actionType !== 'VIEW_ALL' && handleClose()
  }

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

  const handleClose = () => {
    closeDisclosure()
    setTimeout(() => {
      onClose && onClose()
      dispatch(removeNoteMessageWithId(messageId))
    }, 500)
  }

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
              {customContent ? customContent : content}
              {actions.length > 0 && (
                <HStack spacing={2} justify="center" pt={2}>
                  {actions.map((action, index) => (
                    <ButtonFactory
                      key={index}
                      actionType={action.actionType}
                      onClick={() => handleAction(action.actionType)}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      innerText={action.text}
                    >
                      {action.text}
                    </ButtonFactory>
                  ))}
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
