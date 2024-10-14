import React from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { getMilestoneInfo } from '../noteMessages/milestones'
import TrophySVG from '../../../assets/svg/TrophySVG'

const XpAwardContent = ({ message }) => {
  const { t } = useTranslation('NoteMessageSummary')
  const milestoneInfo = message.milestoneName
    ? getMilestoneInfo(message.milestoneName)
    : null
  const totalXp = message.xpAwarded + (milestoneInfo?.xpReward || 0)

  return (
    <HStack spacing={3}>
      <Box
        bg={
          message.isMilestone || message.milestoneName
            ? 'yellow.500'
            : 'yellow.400'
        }
        borderRadius="full"
        p={2}
        boxShadow={
          message.isMilestone || message.milestoneName
            ? '0 0 20px rgba(255, 255, 0, 0.5)'
            : '0 0 15px rgba(255, 255, 0, 0.3)'
        }
      >
        <TrophySVG height={'40px'} width={'40px'} />
      </Box>
      <VStack align="start" spacing={0}>
        <Text fontWeight="bold">
          {message.isMilestone || message.milestoneName
            ? t('milestoneAchieved')
            : t('milestone')}
        </Text>
        <Text
          color={
            message.isMilestone || message.milestoneName
              ? 'purple.400'
              : 'green.400'
          }
        >
          {t('xpEarned', { totalXp })}
        </Text>
        {message.xpSource && (
          <Text color="gray.400" fontSize="sm">
            {message.xpSource}
          </Text>
        )}
        {message.milestoneName && (
          <>
            <Text color="blue.300" fontSize="sm">
              {t('milestone')} {message.milestoneName}
            </Text>
            {milestoneInfo && (
              <Text color="gray.400" fontSize="xs">
                {t('milestoneDescription', {
                  description: milestoneInfo.description,
                })}
              </Text>
            )}
          </>
        )}
        {message.isMilestone &&
          !message.milestoneName &&
          message.milestoneContent && (
            <Text color="gray.400" fontSize="xs">
              {t('milestoneContent', { content: message.milestoneContent })}
            </Text>
          )}
      </VStack>
    </HStack>
  )
}

export default XpAwardContent
