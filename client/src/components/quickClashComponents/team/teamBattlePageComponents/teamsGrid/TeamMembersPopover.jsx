// components/quickClashComponents/team/teamBattlePageComponents/teamsGrid/TeamMembersPopover.jsx
import React, { memo } from 'react'
import {
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
} from '@chakra-ui/react'
import { Users, CheckCircle, Zap, Clock } from 'lucide-react'

/**
 * Team Members Popover Component (Animations Removed)
 */
const TeamMembersPopover = memo(({ team, teamColorForStyling, userId, t }) => {
  return (
    <Popover
      placement="bottom"
      isLazy
      arrowShadowColor={`${teamColorForStyling}.500`}
      gutter={12}
    >
      <PopoverTrigger>
        <Flex
          as="button"
          align="center"
          justifyContent="center"
          px={3}
          py={1.5}
          mt={1}
          position="relative"
          color="white"
          borderRadius="md"
          fontWeight="bold"
          fontSize="xs"
          letterSpacing="0.5px"
          textTransform="uppercase"
          cursor="pointer"
          bg={`${teamColorForStyling}.600`}
          _hover={{
            bg: `${teamColorForStyling}.500`,
          }}
          transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
          zIndex="1"
        >
          {t('SQUAD')}
        </Flex>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          bg="gray.800"
          border="1px solid"
          borderColor={team.isUserTeam ? 'cyan.400' : 'purple.400'}
          borderRadius="xl"
          boxShadow="xl"
          color="white"
          width={{ base: '300px', md: '360px' }}
          zIndex="popover"
        >
          <PopoverArrow bg="gray.800" />
          <PopoverCloseButton />
          <PopoverHeader
            fontWeight="bold"
            borderBottom="1px solid"
            borderBottomColor="gray.600"
            pb={3}
            pt={1}
            mb={1}
            textAlign="center"
            fontSize={{ base: 'lg', md: 'xl' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={Users} mr={2} boxSize={5} />
            {team.data?.name ||
              (team.type === 'teamA' ? t('Team A') : t('Team B'))}{' '}
            {t('Members')}
          </PopoverHeader>
          <PopoverBody p={3} maxHeight="300px" overflowY="auto">
            {team.members?.length > 0 ? (
              <VStack align="stretch" spacing={2.5}>
                {team.members.map(member => (
                  <TeamMemberRow
                    key={member.user._id}
                    member={member}
                    userId={userId}
                    t={t}
                  />
                ))}
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                {t('No members in this team.')}
              </Text>
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
})

/**
 * Individual Team Member Row Component
 */
const TeamMemberRow = memo(({ member, userId, t }) => (
  <Flex
    justify="space-between"
    align="center"
    p={2.5}
    borderRadius="lg"
    bg={member.user._id === userId ? 'rgba(0, 210, 255, 0.1)' : 'whiteAlpha.50'}
    _hover={{
      bg: 'whiteAlpha.100',
    }}
  >
    <HStack spacing={3}>
      <Avatar
        size="sm"
        name={member.user.name || member.user.inGameName}
        src={member.user.pic}
        bg="gray.700"
      />
      <VStack align="flex-start" spacing={0}>
        <Text fontSize="sm" fontWeight="medium" color="white">
          {member.user.name || member.user.inGameName || t('Unnamed Player')}
        </Text>
        {member.user._id === userId && (
          <Badge
            fontSize="2xs"
            px={2}
            py={0.5}
            borderRadius="full"
            bg="cyan.600"
            color="white"
            variant="solid"
            mt="1px"
          >
            {t('YOU')}
          </Badge>
        )}
      </VStack>
    </HStack>
    <Badge
      px={2.5}
      py={1}
      borderRadius="full"
      fontSize="xs"
      colorScheme={
        member.completed ? 'green' : member.participated ? 'yellow' : 'gray'
      }
    >
      <Icon
        as={member.completed ? CheckCircle : member.participated ? Zap : Clock}
        boxSize={3.5}
        mr={1.5}
      />
      {member.completed
        ? `${member.score} ${t('pts')}`
        : member.participated
        ? t('Playing')
        : t('Waiting')}
    </Badge>
  </Flex>
))

TeamMemberRow.displayName = 'TeamMemberRow'
TeamMembersPopover.displayName = 'TeamMembersPopover'

export default TeamMembersPopover
