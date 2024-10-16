import React from 'react'
import { Box, Text, VStack, HStack, Flex, Icon } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { getMilestoneInfo } from '../noteMessages/milestones'
import TrophySVG from '../../../assets/svg/TrophySVG'
import { ArrowRightIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'

const XpAwardContent = ({ message }) => {
  const { t } = useTranslation('NoteMessageSummary')
  const { user } = useSelector(state => state.auth)
  const milestoneInfo = message.milestoneName
    ? getMilestoneInfo(message.milestoneName)
    : null
  const totalXp = message.xpAwarded + (milestoneInfo?.xpReward || 0)

  return (
    <HStack spacing={3} align="start">
      <Box
        bg={
          message.isLevelUp
            ? 'blue.500'
            : message.isMilestone || message.milestoneName
            ? 'yellow.500'
            : 'yellow.400'
        }
        borderRadius="full"
        p={2}
        boxShadow={
          message.isLevelUp
            ? '0 0 20px rgba(66, 153, 225, 0.8)'
            : message.isMilestone || message.milestoneName
            ? '0 0 20px rgba(255, 255, 0, 0.5)'
            : '0 0 15px rgba(255, 255, 0, 0.3)'
        }
      >
        <TrophySVG height={'40px'} width={'40px'} />
      </Box>
      <VStack align="start" spacing={1}>
        <Text
          fontWeight="bold"
          color={message.isLevelUp ? 'blue.300' : 'white'}
        >
          {message.isLevelUp
            ? t('epicLevelUp')
            : message.isMilestone || message.milestoneName
            ? t('milestoneAchieved')
            : t('xpAward')}
        </Text>
        {message.isLevelUp && (
          <Flex
            align="center"
            bg="rgba(66, 153, 225, 0.1)"
            p={2}
            borderRadius="md"
          >
            <Text fontSize="lg" fontWeight="bold" color="yellow.400" mr={2}>
              {user.level}-1
            </Text>
            <Icon as={ArrowRightIcon} color="blue.300" w={4} h={4} mx={1} />
            <Text fontSize="xl" fontWeight="bold" color="yellow.400">
              {user.level}
            </Text>
          </Flex>
        )}
        <Text
          color={
            message.isLevelUp
              ? 'blue.300'
              : message.isMilestone || message.milestoneName
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
