// components/quickClashComponents/team/TeamBattleProgress.jsx
import React from 'react'
import { Box, Flex, Text, Badge, Progress } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

/**
 * Component for displaying the progress bar of a team battle
 */
const TeamBattleProgress = ({ battleStatus, variants }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      variants={variants}
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="lg"
      p={4}
      mb={6}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="sm" fontWeight="bold" color="white">
          {t('Battle Progress')}
        </Text>
        <Badge colorScheme={battleStatus.statusColor} variant="subtle">
          {battleStatus.completedChallenges} / {battleStatus.totalChallenges}{' '}
          {t('Categories')}
        </Badge>
      </Flex>

      <Progress
        value={battleStatus.completionPercentage}
        size="md"
        colorScheme={battleStatus.statusColor}
        borderRadius="full"
        hasStripe
        isAnimated={battleStatus.status === 'active'}
      />
    </MotionBox>
  )
}

export default TeamBattleProgress
