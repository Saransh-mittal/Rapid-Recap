import React, { useEffect } from 'react'
import {
  Box,
  Heading,
  CloseButton,
  useDisclosure,
  Text,
  Button,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'

import {
  removeNoteMessageWithId,
  setShowingSummaryForNoteMessages,
} from '../../redux/appSlice'
import { createHandleMessageAction } from '../../utils/messageActionHandlers'

const MotionBox = motion(Box)

const NoteMessage = ({
  messageId,
  title,
  content,
  onClose,
  duration = 7000,
  width = '320px',
  actions = [],
}) => {
  const dispatch = useDispatch()

  const handleMessageAction = createHandleMessageAction(dispatch, {
    setShowingSummaryForNoteMessages,
  })

  const handleAction = actionType => {
    handleMessageAction(actionType)
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
    }, 500) // Delay to allow for exit animation
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
              <Text>{content}</Text>
              {actions.length > 0 && (
                <HStack spacing={2} justify="flex-end">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      colorScheme={action.colorScheme || 'blue'}
                      onClick={() => handleAction(action.actionType)}
                    >
                      {action.text}
                    </Button>
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
