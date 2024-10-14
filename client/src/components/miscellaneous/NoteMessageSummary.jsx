import React, { Suspense } from 'react'
import {
  Box,
  CloseButton,
  Button,
  VStack,
  Divider,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useTranslation } from 'react-i18next'
import { useNoteMessageSummary } from '../../customHooks/useNoteMessageSummary'
import MessageContent from './noteMessageSummaryComponents/MessageContent'
import MessageActions from './noteMessageSummaryComponents/MessageActions'

const MotionBox = motion(Box)

const NoteMessageSummary = ({ messages, onClose }) => {
  const { t } = useTranslation('NoteMessageSummary')
  const { isOpen, onClose: closeDisclosure } = useDisclosure({
    defaultIsOpen: true,
  })
  const { showConfetti, handleClose, handleDismiss, handleAction } =
    useNoteMessageSummary(messages, closeDisclosure, onClose)

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
              <Text fontWeight="bold">{t('allMessages')}</Text>
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
                  <Suspense fallback={<Box>Loading...</Box>}>
                    <MessageContent message={message} />
                  </Suspense>
                  <Suspense fallback={<Box>Loading...</Box>}>
                    <MessageActions
                      message={message}
                      handleAction={handleAction}
                      handleDismiss={handleDismiss}
                    />
                  </Suspense>
                </Box>
              ))}
            </VStack>
            <Divider />
            <Box p={4}>
              <Button width="100%" onClick={handleClose}>
                {t('dismissAll')}
              </Button>
            </Box>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default NoteMessageSummary
