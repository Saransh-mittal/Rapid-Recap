// components/quickClashComponents/team/teamBattlePageComponents/teamsGrid/MemoizedAvatar.jsx
import React, { memo } from 'react'
import { Avatar, Tooltip, Box } from '@chakra-ui/react'

/**
 * Memoized Avatar component (Animations Removed)
 */
const MemoizedAvatar = memo(({ member, teamColor, userId, t }) => (
  <Tooltip
    label={`${member.user.name || member.user.inGameName}${
      member.completed
        ? ` (${member.score}pts)`
        : member.participated
        ? ` (${t('Playing')})`
        : ''
    }`}
    placement="top"
    bg="gray.800"
    color="white"
    borderRadius="lg"
    p={3}
    fontSize="sm"
    fontWeight="medium"
    hasArrow
    offset={[0, 10]}
  >
    <Box>
      <Avatar
        name={member.user.name || member.user.inGameName}
        src={member.user.pic}
        borderWidth="2px"
        borderColor={
          member.user._id === userId
            ? 'cyan.300'
            : member.completed
            ? 'green.400'
            : member.participated
            ? 'yellow.400'
            : 'gray.500'
        }
        bg="gray.700"
      />
    </Box>
  </Tooltip>
))

MemoizedAvatar.displayName = 'MemoizedAvatar'

export default MemoizedAvatar
