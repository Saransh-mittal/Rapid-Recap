// NoteMessageSummary.jsx
import React, { Suspense } from 'react'
import {
  Box,
  CloseButton,
  Button,
  VStack,
  Divider,
  useDisclosure,
  Text,
  Flex,
  Heading,
  Icon,
  Badge,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useTranslation } from 'react-i18next'
import { useNoteMessageSummary } from '../../customHooks/useNoteMessageSummary'
import { BellIcon, CheckIcon } from '@chakra-ui/icons'
import { Bell } from 'lucide-react'

// Lazy load components for better performance
const MessageContent = React.lazy(() =>
  import('./noteMessageSummaryComponents/MessageContent'),
)
const MessageActions = React.lazy(() =>
  import('./noteMessageSummaryComponents/MessageActions'),
)

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)

const NoteMessageSummary = ({ messages, onClose }) => {
  const { t } = useTranslation('NoteMessageSummary')
  const { isOpen, onClose: closeDisclosure } = useDisclosure({
    defaultIsOpen: true,
  })
  const { showConfetti, handleClose, handleDismiss, handleAction } =
    useNoteMessageSummary(messages, closeDisclosure, onClose)

  // Animation variants
  const containerVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 120,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 150,
      },
    },
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 120,
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
          width="350px"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          zIndex={1001}
        >
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={200}
              gravity={0.2}
              tweenDuration={6000}
              colors={['#9F7AEA', '#4299E1', '#48BB78', '#ED8936', '#ED64A6']}
            />
          )}
          <Box
            bg="rgba(26, 21, 39, 0.94)"
            backdropFilter="blur(10px)"
            color="gray.100"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="0 5px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08) inset"
            borderWidth="1px"
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            {/* Gradient border effect */}
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

            <Flex
              bg="rgba(255, 255, 255, 0.05)"
              px={5}
              py={3}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottomWidth="1px"
              borderColor="rgba(255, 255, 255, 0.08)"
            >
              <Flex align="center">
                <Icon as={Bell} boxSize="1.2em" color="purple.300" mr={2} />
                <Heading
                  size="sm"
                  fontWeight="600"
                  letterSpacing="wide"
                  textShadow="0 1px 2px rgba(0,0,0,0.2)"
                >
                  {t('allMessages')}
                </Heading>
                <MotionBadge
                  ml={2}
                  bg="purple.500"
                  color="white"
                  borderRadius="full"
                  px={2}
                  fontSize="0.7rem"
                  fontWeight="bold"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  {messages.length}
                </MotionBadge>
              </Flex>
              <CloseButton
                size="sm"
                onClick={handleClose}
                color="whiteAlpha.800"
                _hover={{
                  color: 'white',
                  bg: 'rgba(255, 255, 255, 0.08)',
                }}
              />
            </Flex>
            <VStack
              spacing={3}
              align="stretch"
              p={4}
              maxHeight="70vh"
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
              {messages.map((message, index) => (
                <MotionFlex
                  key={index}
                  direction="column"
                  bg="rgba(255, 255, 255, 0.04)"
                  p={3}
                  borderRadius="md"
                  borderLeft="3px solid"
                  borderLeftColor={
                    message.messageType === 'xpAward'
                      ? 'yellow.400'
                      : message.messageType === 'streak'
                      ? 'orange.400'
                      : message.messageType === 'tournament'
                      ? 'purple.400'
                      : message.messageType === 'quickClash'
                      ? 'blue.400'
                      : 'green.400'
                  }
                  variants={messageVariants}
                  whileHover={{
                    x: 2,
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
                    borderLeftWidth: '4px',
                    transition: { duration: 0.2 },
                  }}
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.07)',
                  }}
                >
                  <Suspense
                    fallback={
                      <Box
                        p={2}
                        bg="rgba(255, 255, 255, 0.03)"
                        borderRadius="md"
                      >
                        <Text>Loading...</Text>
                      </Box>
                    }
                  >
                    <MessageContent message={message} />
                  </Suspense>
                  <Suspense fallback={null}>
                    <MessageActions
                      message={message}
                      handleAction={handleAction}
                      handleDismiss={handleDismiss}
                    />
                  </Suspense>
                </MotionFlex>
              ))}
            </VStack>
            <Divider borderColor="rgba(255, 255, 255, 0.06)" />
            <Box p={4} bg="rgba(255, 255, 255, 0.02)">
              <Button
                width="100%"
                onClick={handleClose}
                colorScheme="purple"
                borderRadius="md"
                fontWeight="600"
                bg="rgba(159, 122, 234, 0.2)"
                _hover={{
                  bg: 'rgba(159, 122, 234, 0.3)',
                }}
                leftIcon={<CheckIcon />}
                transition="all 0.2s"
              >
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
