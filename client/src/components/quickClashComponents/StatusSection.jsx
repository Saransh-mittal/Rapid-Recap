import React from 'react'
import { Box, Heading, HStack, Icon, Grid, GridItem } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import ChallengeItem from './ChallengeItem'
import FlippableChallengeItem from './FlippableChallengeItem'

const MotionBox = motion(Box)

/**
 * Groups challenges by their status and displays them in a section
 */
const StatusSection = ({
  title,
  icon,
  challenges,
  userId,
  handlers,
  animationDelay = 0,
}) => {
  // If no challenges in this section, don't render anything
  if (!challenges || challenges.length === 0) return null

  const { onAccept, onDecline, onStart, onViewReport, onRevenge } = handlers

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: animationDelay,
          duration: 0.4,
          type: 'spring',
          stiffness: 100,
          damping: 15,
        },
      }}
    >
      <HStack mb={3} spacing={2}>
        <Icon as={icon} color="purple.400" boxSize={5} />
        <Heading size="sm" color="white">
          {title} ({challenges.length})
        </Heading>
      </HStack>

      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={4}
      >
        {challenges.map((challenge, index) => (
          <GridItem key={challenge._id}>
            {/* Use FlippableChallengeItem for completed challenges where both users attempted */}
            {challenge.status === 'completed' &&
            challenge.challengerAttempted &&
            challenge.opponentAttempted ? (
              <FlippableChallengeItem
                challenge={challenge}
                userId={userId}
                onAccept={onAccept}
                onDecline={onDecline}
                onStart={onStart}
                onViewReport={onViewReport}
                onRevenge={onRevenge}
                index={index}
              />
            ) : (
              <ChallengeItem
                challenge={challenge}
                userId={userId}
                onAccept={onAccept}
                onDecline={onDecline}
                onStart={onStart}
                onViewReport={onViewReport}
                onRevenge={onRevenge}
                index={index}
              />
            )}
          </GridItem>
        ))}
      </Grid>
    </MotionBox>
  )
}

export default StatusSection
