import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { Text, VStack, Box, Flex, Divider } from '@chakra-ui/react'
import NoteMessage from '../NoteMessage'
import { getMilestoneInfo } from './milestones'

// Lazy load components and assets
const TrophySVG = lazy(() => import('../../../assets/svg/TrophySVG'))
const Confetti = lazy(() => import('react-confetti'))

const XPAwardNoteMessage = ({
  messageId,
  xpAwarded,
  xpSource,
  milestoneName,
  isMilestone,
  milestoneContent,
  title,
  onClose,
  duration,
  width = '320px',
}) => {
  const [showConfetti, setShowConfetti] = useState(
    isMilestone || !!milestoneName,
  )
  const milestoneInfo = milestoneName ? getMilestoneInfo(milestoneName) : null
  const totalXp = xpAwarded + (milestoneInfo?.xpReward || 0)

  useEffect(() => {
    if (isMilestone || milestoneName) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000) // Run confetti for 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isMilestone, milestoneName])

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
            bg={isMilestone || milestoneName ? 'yellow.500' : 'yellow.400'}
            borderRadius="full"
            p={2}
            mb={3}
            boxShadow={
              isMilestone || milestoneName
                ? '0 0 20px rgba(255, 255, 0, 0.5)'
                : '0 0 15px rgba(255, 255, 0, 0.3)'
            }
          >
            <TrophySVG height="40px" width="40px" />
          </Box>
        </Suspense>
        <VStack spacing={1} align="center" w="100%">
          <Text fontSize="md" fontWeight="medium" color="gray.300">
            {isMilestone || milestoneName
              ? 'Milestone Achieved!'
              : `${xpSource} Completed`}
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
            bg={isMilestone && !milestoneName ? 'orange.500' : 'green.500'}
            px={4}
            py={1}
            borderRadius="full"
            boxShadow={
              isMilestone && !milestoneName
                ? '0 0 10px rgba(237, 137, 54, 0.5)'
                : '0 0 10px rgba(72, 187, 120, 0.5)'
            }
          >
            <Text fontSize="xl" fontWeight="bold" color="white">
              +{xpAwarded} XP
            </Text>
          </Box>
          {milestoneInfo && (
            <>
              <Divider my={2} />
              <Text fontSize="md" fontWeight="medium" color="purple.300">
                {milestoneInfo.name} Milestone Bonus
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {milestoneInfo.description}
              </Text>
              <Box
                mt={1}
                bg="purple.500"
                px={4}
                py={1}
                borderRadius="full"
                boxShadow="0 0 15px rgba(128, 90, 213, 0.7)"
              >
                <Text fontSize="lg" fontWeight="bold" color="white">
                  +{milestoneInfo.xpReward} XP
                </Text>
              </Box>
            </>
          )}
          {isMilestone && !milestoneName && milestoneContent && (
            <>
              <Divider my={2} />
              <Text fontSize="md" fontWeight="medium" color="blue.300">
                Milestone Content
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {milestoneContent}
              </Text>
            </>
          )}
          {isMilestone && milestoneName && (
            <Box mt={3} bg="blue.500" px={4} py={1} borderRadius="full">
              <Text fontSize="2xl" fontWeight="bold" color="white">
                Total: +{totalXp} XP
              </Text>
            </Box>
          )}
        </VStack>
      </Flex>
    ),
    [
      showConfetti,
      isMilestone,
      milestoneName,
      title,
      xpAwarded,
      xpSource,
      milestoneInfo,
      totalXp,
      milestoneContent,
    ],
  )

  return (
    <NoteMessage
      messageId={messageId}
      title={
        isMilestone || milestoneName
          ? 'Major Achievement Unlocked!'
          : 'Achievement Unlocked'
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
