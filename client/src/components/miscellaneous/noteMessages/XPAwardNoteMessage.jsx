import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { Text, VStack, Box, Flex } from '@chakra-ui/react'
import NoteMessage from '../NoteMessage'

// Lazy load components and assets
const TrophySVG = lazy(() => import('../../../assets/svg/TrophySVG'))
const Confetti = lazy(() => import('react-confetti'))

const XPAwardNoteMessage = ({
  messageId,
  xpAwarded,
  title,
  onClose,
  duration,
  width = '320px',
  isMilestone = false,
}) => {
  const [showConfetti, setShowConfetti] = useState(isMilestone)

  useEffect(() => {
    if (isMilestone) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000) // Run confetti for 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isMilestone])

  const customContent = useMemo(
    () => (
      <Flex direction="column" align="center" w="100%" position="relative">
        {showConfetti && (
          <Suspense fallback={null}>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={400}
              gravity={0.2}
            />
          </Suspense>
        )}
        <Suspense fallback={null}>
          <Box
            bg={isMilestone ? 'yellow.500' : 'yellow.400'}
            borderRadius="full"
            p={2}
            mb={3}
            boxShadow={
              isMilestone
                ? '0 0 20px rgba(255, 255, 0, 0.5)'
                : '0 0 15px rgba(255, 255, 0, 0.3)'
            }
          >
            <TrophySVG height="40px" width="40px" />
          </Box>
        </Suspense>
        <VStack spacing={1} align="center" w="100%">
          <Text fontSize="md" fontWeight="medium" color="gray.300">
            {isMilestone ? 'Milestone Achieved!' : 'Quiz Completed'}
          </Text>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="white"
            noOfLines={2}
            textAlign="center"
          >
            {title}
          </Text>
          <Box
            mt={2}
            bg={isMilestone ? 'purple.500' : 'green.500'}
            px={4}
            py={1}
            borderRadius="full"
            boxShadow={
              isMilestone
                ? '0 0 15px rgba(128, 90, 213, 0.7)'
                : '0 0 10px rgba(72, 187, 120, 0.5)'
            }
          >
            <Text fontSize="xl" fontWeight="bold" color="white">
              +{xpAwarded} XP
            </Text>
          </Box>
        </VStack>
      </Flex>
    ),
    [showConfetti, isMilestone, title, xpAwarded],
  )

  return (
    <NoteMessage
      messageId={messageId}
      title={
        isMilestone ? 'Major Achievement Unlocked!' : 'Achievement Unlocked'
      }
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={[
        {
          text: 'View Experience',
          actionType: 'VIEW_EXPERIENCE',
        },
      ]}
    />
  )
}

export default XPAwardNoteMessage
