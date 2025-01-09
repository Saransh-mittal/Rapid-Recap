import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Box,
  Flex,
  Progress,
  Button,
  VStack,
  Badge,
  useMediaQuery,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Star, Clock, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

const StreakSurgeModal = ({ isOpen, onClose, isStreakBoosted }) => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const { streak: currentStreak } = useSelector(state => state.app)
  const getNextStreakThreshold = count => Math.floor(count / 7) * 7 + 7
  const nextStreak = getNextStreakThreshold(currentStreak)
  const daysRemaining = nextStreak - currentStreak
  // Update progress calculation to show full bar when streak surge is active
  const progress = isStreakBoosted ? 100 : ((currentStreak % 7) / 7) * 100

  const isStreakSurgeActivated = currentStreak > 0 && currentStreak % 7 === 0

  const MotionBox = motion(Box)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isLargerThan768 ? '2xl' : 'full'}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(8px)" />
      <ModalContent
        bg="linear-gradient(135deg, #000000 0%, #1a1a1a 100%)"
        color="white"
        mx={4}
        borderRadius="xl"
        boxShadow="0 0 20px rgba(255, 255, 255, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.1)"
      >
        <ModalCloseButton />
        <ModalHeader>
          <Flex
            direction="column"
            align="center"
            pb={6}
            borderBottom="2px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            <Flex align="center" gap={3}>
              <Zap size={28} color="#4F46E5" />
              <Text
                fontSize={['3xl', '4xl']}
                fontWeight="bold"
                bgGradient="linear(to-r, #4F46E5, #7C3AED)"
                bgClip="text"
                letterSpacing="wide"
              >
                Streak Surge
              </Text>
              <Zap size={28} color="#4F46E5" />
            </Flex>
            <Text
              color="gray.400"
              fontSize="lg"
              fontStyle="italic"
              mt={3}
              textAlign="center"
            >
              {isStreakSurgeActivated || isStreakBoosted
                ? 'Surge Activated!'
                : 'Keep Your Streak Alive'}
            </Text>
          </Flex>
        </ModalHeader>

        <ModalBody py={8}>
          <VStack spacing={8}>
            <MotionBox
              w="full"
              bg={
                isStreakSurgeActivated || isStreakBoosted
                  ? 'rgba(79, 70, 229, 0.1)'
                  : 'rgba(255, 255, 255, 0.05)'
              }
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor={
                isStreakSurgeActivated || isStreakBoosted
                  ? 'rgba(79, 70, 229, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)'
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg:
                  isStreakSurgeActivated || isStreakBoosted
                    ? 'rgba(79, 70, 229, 0.15)'
                    : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Clock size={24} color="#4F46E5" />
                <Text fontSize="xl" fontWeight="bold">
                  {isStreakSurgeActivated || isStreakBoosted
                    ? 'Streak Surge Activated'
                    : 'Streak Surge Inactive'}
                </Text>
              </Flex>

              <Box mb={4}>
                <Flex justify="space-between" mb={2}>
                  <Text color="gray.300">Current Streak: {currentStreak}</Text>
                  <Badge
                    bg="rgba(79, 70, 229, 0.2)"
                    color="#4F46E5"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {isStreakSurgeActivated || isStreakBoosted
                      ? 'Surge Active'
                      : `Next Surge: ${nextStreak}`}
                  </Badge>
                </Flex>
                <Progress
                  value={progress}
                  size="lg"
                  borderRadius="full"
                  colorScheme="purple"
                  bg="whiteAlpha.200"
                  sx={{
                    '& > div': {
                      background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                    },
                  }}
                />
              </Box>

              <Text color="gray.400" fontSize="md" textAlign="center">
                {isStreakSurgeActivated || isStreakBoosted
                  ? 'Your Streak Surge is now active!'
                  : daysRemaining > 0
                  ? `${daysRemaining} days until next Streak Surge`
                  : 'Surge ready!'}
              </Text>
            </MotionBox>

            <MotionBox
              w="full"
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Zap size={24} color="#4F46E5" />
                <Text fontSize="xl" fontWeight="bold">
                  Power Up Your Progress
                </Text>
              </Flex>
              <Text color="gray.400">
                Maintain your daily streak to unlock powerful multipliers and
                rewards!
              </Text>
            </MotionBox>

            <MotionBox
              w="full"
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Clock size={24} color="#4F46E5" />
                <Text fontSize="xl" fontWeight="bold">
                  Surge Pattern
                </Text>
              </Flex>
              <Text color="gray.400">
                Complete daily activities to maintain your streak. Surge
                activates every 7 days of consistent progress!
              </Text>
            </MotionBox>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTop="2px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          pt={6}
        >
          <Button
            w="full"
            size="lg"
            bg="linear-gradient(90deg, #4F46E5, #7C3AED)"
            color="white"
            _hover={{
              bg: 'linear-gradient(90deg, #7C3AED, #6D28D9)',
              transform: 'translateY(-2px)',
            }}
            onClick={onClose}
            fontWeight="bold"
            letterSpacing="wide"
          >
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StreakSurgeModal
