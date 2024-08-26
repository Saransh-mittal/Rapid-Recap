import React from 'react'
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
import ButtonFactory from './ButtonFactory'

import TrophySVG from '../../assets/svg/TrophySVG'

const MotionBox = motion(Box)

const NoteMessageSummary = ({ messages, onClose }) => {
  const dispatch = useDispatch()
  const { isOpen, onClose: closeDisclosure } = useDisclosure({
    defaultIsOpen: true,
  })
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  const handleMessageAction = createHandleMessageAction(dispatch, {
    setShowingSummaryForNoteMessages,
    removeNoteMessageWithId,
    setShowXpLevelModal,
    setIsNotifDrawerOpen,
    navigateToProfile: id => navigate(`/profile/${id}`),
  })

  const handleDismiss = id => {
    handleMessageAction('DISMISS', id)
  }

  const handleClose = () => {
    closeDisclosure()
    setTimeout(onClose, 500) // Delay to allow for exit animation
  }

  const handleAction = (actionType, messageId) => {
    handleMessageAction(actionType, messageId, user?.inGameName)
  }

  const renderMessageContent = message => {
    switch (message.messageType) {
      case 'xpAward':
        return (
          <HStack spacing={3}>
            <TrophySVG height={'40px'} width={'40px'} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">{message.title}</Text>
              <Text color="green.400">{message.xpAwarded} XP earned</Text>
            </VStack>
          </HStack>
        )
      default:
        return (
          <>
            <Text fontWeight="bold">{message.title}</Text>
            <Text>{message.content}</Text>
          </>
        )
    }
  }

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
