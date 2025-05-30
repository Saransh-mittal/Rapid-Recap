// components/quickClashComponents/team/battleAnalysis/components/TeamMemberList.jsx
import React, { Suspense } from 'react'
import {
  Box,
  Text,
  Heading,
  Badge,
  HStack,
  VStack,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import OptimizedMemberCard from './OptimizedMemberCard' // Assuming it's in the same folder
import MemberCardLoader from './MemberCardLoader' // Assuming it's in the same folder

const TeamMemberList = React.memo(
  ({
    titleKey,
    members,
    teamColor,
    isUserTeam,
    totalScore,
    userId,
    enhancedMemberPerformance,
    mvpAwards,
    selectedMember,
    onMemberClick,
    animationPhase,
    isMobile,
    t,
    getMemberPerformanceLevel, // Pass this function
  }) => {
    if (!members || members.length === 0) {
      return null
    }

    return (
      <GridItem w="full">
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Heading size={{ base: 'sm', md: 'md' }} color={`${teamColor}.300`}>
              {t(titleKey)}
            </Heading>
            <Badge
              colorScheme={teamColor}
              variant="outline"
              fontSize="xs"
              px={2}
              py={0.5}
            >
              {members.length} {t('Members')}
            </Badge>
          </HStack>
          <Grid templateColumns="1fr" gap={3}>
            {members.map((member, index) => (
              <GridItem key={member.user?._id || index} w="full">
                <Suspense fallback={<MemberCardLoader />}>
                  <OptimizedMemberCard
                    member={member}
                    isUserTeam={isUserTeam}
                    index={index}
                    userId={userId}
                    performance={getMemberPerformanceLevel(
                      member,
                      0, // teamAvg - not used in current logic, pass 0 or calculate if needed
                      enhancedMemberPerformance,
                    )}
                    teamTotalScore={totalScore}
                    mvpAwards={mvpAwards}
                    onMemberClick={onMemberClick}
                    isSelected={selectedMember === member.user?._id}
                    animationPhase={animationPhase}
                    isMobile={isMobile}
                  />
                </Suspense>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </GridItem>
    )
  },
)

TeamMemberList.displayName = 'TeamMemberList'
export default TeamMemberList
