// components/quickClashComponents/team/TeamSection.jsx
import React from 'react'
import { Box, Flex, HStack, Text, Badge, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import TeamMemberItem from './TeamMemberItem'

const MotionBox = motion(Box)

/**
 * Component to display a team section (either Team A or Team B)
 */
const TeamSection = ({
  team,
  teamName,
  teamType,
  members,
  wins,
  userTeam,
  userId,
  variants,
}) => {
  const { t } = useTranslation('QuickClash')
  const isUserTeam = userTeam === teamType
  const badgeColor = teamType === 'teamA' ? 'blue' : 'red'

  return (
    <MotionBox
      variants={variants}
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="lg"
      p={4}
      borderWidth="1px"
      borderColor={isUserTeam ? 'purple.500' : 'whiteAlpha.200'}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <HStack>
          <Badge colorScheme={badgeColor} p={1} borderRadius="md">
            {teamType === 'teamA' ? t('Team A') : t('Team B')}
          </Badge>
          <Text fontWeight="bold" color="white">
            {teamName || (teamType === 'teamA' ? t('Team A') : t('Team B'))}
          </Text>
          {isUserTeam && (
            <Badge colorScheme="purple" fontSize="xs">
              {t('Your Team')}
            </Badge>
          )}
        </HStack>
        <Badge colorScheme="green" variant="outline">
          {wins || 0} {t('Wins')}
        </Badge>
      </Flex>

      <VStack align="stretch" spacing={2}>
        {members.map(member => (
          <TeamMemberItem
            key={member.user._id}
            member={member}
            userId={userId}
            isCurrentUser={member.user._id === userId}
          />
        ))}
      </VStack>
    </MotionBox>
  )
}

export default TeamSection
