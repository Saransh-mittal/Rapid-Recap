// components/quickClashComponents/matchmaking/SearchModal.jsx - Clean Modal UI
import React, { memo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Badge,
  Spinner,
  Box,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, X, Clock, AlertTriangle } from 'lucide-react'

const MotionFlex = motion.div
const MotionBadge = motion(Badge)

// Timer component
const Timer = memo(({ seconds }) => {
  const formatTime = secs => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
  }

  return (
    <HStack
      p={2}
      borderRadius="md"
      bg="whiteAlpha.100"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Icon as={Clock} color="blue.300" boxSize={4} />
      <Text color="white" fontWeight="bold" fontFamily="mono">
        {formatTime(seconds)}
      </Text>
    </HStack>
  )
})

/**
 * Clean search modal component - UI only, no business logic
 * All state and actions are passed from parent
 */
const SearchModal = memo(
  ({
    isOpen,
    onClose,
    onLeave,
    socketConnected = true,
    searchTime = 0,
    isJoining = false,
    isLeaving = false,
  }) => {
    const { t } = useTranslation('QuickClash')

    if (!isOpen) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />
        <ModalContent
          bg="rgba(26, 21, 39, 0.95)"
          borderWidth="1px"
          borderColor="blue.400"
          borderRadius="xl"
          boxShadow="0 0 20px rgba(66, 153, 225, 0.4)"
          className="quick-clash-search-modal"
        >
          <ModalHeader color="white" display="flex" alignItems="center" gap={2}>
            <Icon as={Users} color="blue.400" />
            {t('Finding Opponents')}
            {socketConnected ? (
              <Badge colorScheme="green" size="sm" ml={2}>
                {t('Connected')}
              </Badge>
            ) : (
              <Badge colorScheme="orange" size="sm" ml={2}>
                <Icon as={AlertTriangle} boxSize={3} mr={1} />
                {t('Reconnecting')}
              </Badge>
            )}
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody py={6}>
            <VStack spacing={6} align="center">
              {/* Animated Search Indicator */}
              <MotionFlex
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'rgba(66, 153, 225, 0.1)',
                  border: '2px solid rgb(66, 153, 225)',
                  position: 'relative',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <Spinner
                  size="xl"
                  thickness="4px"
                  speed="0.8s"
                  color="blue.400"
                />
              </MotionFlex>

              {/* Search Status */}
              <VStack spacing={2} align="center">
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {isJoining
                    ? t('Joining Queue...')
                    : t('Searching for Opponents')}
                </Text>
                <Text color="whiteAlpha.700" fontSize="md" textAlign="center">
                  {isJoining
                    ? t('Please wait while we add you to the queue...')
                    : t('Finding the perfect match for your skill level...')}
                </Text>
              </VStack>

              <Divider borderColor="whiteAlpha.300" />

              {/* Search Statistics */}
              <HStack spacing={8} justify="center">
                <VStack spacing={1}>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {t('Time in Queue')}
                  </Text>
                  <Timer seconds={searchTime} />
                </VStack>

                <VStack spacing={1}>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {t('Status')}
                  </Text>
                  <MotionBadge
                    colorScheme={isJoining ? 'orange' : 'blue'}
                    px={3}
                    py={1}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  >
                    {isJoining ? t('Joining...') : t('Searching')}
                  </MotionBadge>
                </VStack>
              </HStack>

              {/* Information Text */}
              <Box w="100%" pt={2}>
                <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
                  {t(
                    "You can minimize this and continue browsing. We'll notify you when a match is found.",
                  )}
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={onLeave}
              leftIcon={<Icon as={X} />}
              _hover={{ bg: 'red.900' }}
              isLoading={isLeaving}
              loadingText={t('Leaving...')}
              isDisabled={isJoining}
            >
              {isJoining ? t('Please Wait') : t('Leave Queue')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  },
)

Timer.displayName = 'Timer'
SearchModal.displayName = 'SearchModal'

export default SearchModal
