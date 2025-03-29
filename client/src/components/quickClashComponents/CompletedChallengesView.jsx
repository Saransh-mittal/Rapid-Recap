// components/quickClashComponents/CompletedChallengesView.jsx
import React, { useMemo } from 'react'
import {
  Box,
  VStack,
  Text,
  Flex,
  Grid,
  GridItem,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  groupChallengesByDate,
  sortDateKeys,
} from '../../utils/dateGroupingUtils'
import DateGroupHeader from './DateGroupHeader'
import FlippableChallengeItem from './FlippableChallengeItem'

const MotionBox = motion(Box)

/**
 * Enhanced view for completed challenges with date grouping
 */
const CompletedChallengesView = ({
  challenges,
  userId,
  handlers,
  revengeLoading,
  isLoading = false,
}) => {
  const { t } = useTranslation('QuickClash')

  // Get handlers for challenges
  const { onViewReport, onRevenge } = handlers

  // Container animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Group challenges by date
  const dateGroupedChallenges = useMemo(() => {
    if (!challenges || challenges.length === 0) return {}
    return groupChallengesByDate(challenges, t)
  }, [challenges, t])

  // Get sorted date keys
  const sortedDateKeys = useMemo(() => {
    if (!dateGroupedChallenges) return []
    return sortDateKeys(Object.keys(dateGroupedChallenges), t)
  }, [dateGroupedChallenges, t])

  // Render loading state if needed
  if (isLoading) {
    return (
      <Center py={6}>
        <Spinner size="lg" color="purple.500" thickness="4px" />
      </Center>
    )
  }

  // If no challenges, show a message
  if (challenges.length === 0) {
    return (
      <Box textAlign="center" p={6} borderRadius="md" bg="whiteAlpha.100">
        <Text color="whiteAlpha.700">{t('No completed challenges yet.')}</Text>
      </Box>
    )
  }

  return (
    <MotionBox variants={containerVariants} initial="hidden" animate="visible">
      {/* Challenge grid with date grouping */}
      <VStack align="stretch" spacing={6}>
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
                    onViewReport={onViewReport}
                    onRevenge={onRevenge}
                    revengeLoading={revengeLoading}
                    index={index}
                  />
                </GridItem>
              ))}
            </Grid>
          </Box>
        ))}
      </VStack>
    </MotionBox>
  )
}

export default CompletedChallengesView
