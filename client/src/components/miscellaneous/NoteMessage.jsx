import React, { useEffect } from 'react'
import {
  Box,
  Heading,
  CloseButton,
  useDisclosure,
  Text,
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
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          zIndex={1001}
        >
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
              <Heading as="h3" size="sm" textTransform={'uppercase'}>
                {title}
              </Heading>
              <CloseButton size="sm" onClick={handleClose} />
            </Box>
            <VStack align="stretch" p={4} spacing={3}>
              {customContent ? customContent : <Text>{content}</Text>}
              {actions.length > 0 && (
                <HStack spacing={4} justify="center">
                  {actions.map((action, index) => (
                    <ButtonFactory
                      key={index}
                      actionType={action.actionType}
                      onClick={() => handleAction(action.actionType)}
                      size="sm"
                      innerText={action.text}
                    >
                      {!action.actionType === 'SIGN_IN' && action.text}
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
