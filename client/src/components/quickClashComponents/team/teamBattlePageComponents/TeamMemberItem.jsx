// components/quickClashComponents/team/TeamMemberItem.jsx
import React from 'react'
import { Flex, HStack, Text, Badge, Avatar } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

/**
 * Component to display a single team member
 */
const TeamMemberItem = ({ member, userId, isCurrentUser }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Flex
      bg={isCurrentUser ? 'rgba(128, 90, 213, 0.1)' : 'transparent'}
      p={2}
      borderRadius="md"
      borderWidth={isCurrentUser ? '1px' : '0'}
      borderColor="purple.500"
      justify="space-between"
      align="center"
    >
      <HStack>
        <Avatar
          size="sm"
          name={member.user.name || member.user.inGameName}
          src={member.user.pic}
        />
        <Text
          color={isCurrentUser ? 'white' : 'whiteAlpha.800'}
          fontWeight={isCurrentUser ? 'bold' : 'normal'}
        >
          {member.user.name || member.user.inGameName}
        </Text>
      </HStack>

      <HStack>
        {member.category && (
          <Badge colorScheme="blue" variant="subtle">
            {member.category}
          </Badge>
        )}

        {member.completed ? (
          <Badge colorScheme="green">
            {member.score} {t('pts')}
          </Badge>
        ) : member.participated ? (
          <Badge colorScheme="yellow">{t('Playing')}</Badge>
        ) : (
          <Badge colorScheme="gray">{t('Waiting')}</Badge>
        )}
      </HStack>
    </Flex>
  )
}

export default TeamMemberItem
