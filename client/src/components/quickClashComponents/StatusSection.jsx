import React from 'react'
import {
  Box,
  Heading,
  HStack,
  Icon,
  Grid,
  GridItem,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import ChallengeItem from './ChallengeItem'
import FlippableChallengeItem from './FlippableChallengeItem'
import DateGroupHeader from './DateGroupHeader'
import {
  groupChallengesByDate,
  sortDateKeys,
} from '../../utils/dateGroupingUtils'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

/**
 * Groups challenges by their status and displays them in a section
 * For completed challenges, additionally groups them by date
 */
const StatusSection = ({
  title,
  icon,
  challenges,
  userId,
  handlers,
  animationDelay = 0,
}) => {
  const { t } = useTranslation('QuickClash')

  // If no challenges in this section, don't render anything
  if (!challenges || challenges.length === 0) return null

  const { onAccept, onDecline, onStart, onViewReport, onRevenge } = handlers

  // Group completed challenges by date
  const isCompletedSection = title === t('Completed')
  const dateGroupedChallenges = isCompletedSection
    ? groupChallengesByDate(challenges, t)
    : null
  const sortedDateKeys = isCompletedSection
    ? sortDateKeys(Object.keys(dateGroupedChallenges), t)
    : null

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

      {isCompletedSection ? (
        // Render completed challenges grouped by date
        <VStack align="stretch" spacing={3}>
          {sortedDateKeys.map((dateKey, dateIndex) => (
            <Box key={dateKey}>
              <DateGroupHeader date={dateKey} index={dateIndex} />

              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                }}
                gap={4}
                mt={2}
              >
                {dateGroupedChallenges[dateKey].map((challenge, index) => (
                  <GridItem key={challenge._id}>
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
                  </GridItem>
                ))}
              </Grid>
            </Box>
          ))}
        </VStack>
      ) : (
        // Render non-completed challenges as before
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
      )}
    </MotionBox>
  )
}

export default StatusSection
