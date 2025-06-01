// components/quickClashComponents/team/battleAnalysis/components/TeamContributionSection.jsx
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Box, Collapse, Grid, Center, Spinner } from '@chakra-ui/react'
import { useAnimationControls } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Crown as CrownIcon,
  Trophy as TrophyIcon,
  Star as StarIcon,
  Target as TargetIcon,
  ArrowDown as ArrowDownIcon,
} from 'lucide-react'

// Import new child components
import TeamContributionHeader from './teamContributionSection/TeamContributionHeader'
import TeamOverviewStats from './teamContributionSection/TeamOverviewStats'
import TeamMemberList from './teamContributionSection/TeamMemberList'
import BattleSummaryMetrics from './teamContributionSection/BattleSummaryMetrics'

// UPDATED: Performance levels configuration with proper grade system
const PERFORMANCE_LEVELS = {
  legendary: {
    levelKey: 'Legendary',
    color: 'purple',
    icon: CrownIcon,
    gradient: 'linear(135deg, #A855F7, #8B5CF6)',
    threshold: 100,
    tier: 'S+', // Grade
    description: 'Outstanding performance - 100+ points',
  },
  excellent: {
    levelKey: 'Excellent',
    color: 'green',
    icon: TrophyIcon,
    gradient: 'linear(135deg, #22C55E, #10B981)',
    threshold: 75,
    tier: 'S', // Grade
    description: 'Excellent performance - 75+ points',
  },
  good: {
    levelKey: 'Good',
    color: 'blue',
    icon: StarIcon,
    gradient: 'linear(135deg, #3B82F6, #2563EB)',
    threshold: 50,
    tier: 'A', // Grade
    description: 'Good performance - 50+ points',
  },
  average: {
    levelKey: 'Average',
    color: 'yellow',
    icon: TargetIcon,
    gradient: 'linear(135deg, #F59E0B, #D97706)',
    threshold: 40,
    tier: 'B', // Grade
    description: 'Average performance - 40+ points',
  },
  needs_improvement: {
    levelKey: 'Needs Improvement',
    color: 'red',
    icon: ArrowDownIcon,
    gradient: 'linear(135deg, #EF4444, #DC2626)',
    threshold: 0,
    tier: 'C', // Grade
    description: 'Needs improvement - Below 40 points',
  },
}

// UPDATED: Performance level calculator with enhanced logic
const getMemberPerformanceLevel = (member, teamAvg, enhancedData) => {
  // If enhanced data is available, use it
  if (enhancedData && member.enhancedPerformance) {
    return member.enhancedPerformance
  }

  const score = member.score || 0

  // Determine performance level based on score thresholds
  if (score >= 100) return PERFORMANCE_LEVELS.legendary
  if (score >= 75) return PERFORMANCE_LEVELS.excellent
  if (score >= 50) return PERFORMANCE_LEVELS.good
  if (score >= 40) return PERFORMANCE_LEVELS.average
  return PERFORMANCE_LEVELS.needs_improvement
}

// Enhanced team stats calculator
const calculateTeamStats = (members, totalScore) => {
  if (!members || members.length === 0) {
    return {
      avgScore: 0,
      completionCount: 0,
      rating: 0,
      teamwork: 0,
      consistency: 0,
    }
  }

  const sumScore = members.reduce((sum, m) => sum + (m.score || 0), 0)
  const avgScore = sumScore / members.length
  const completionCount = members.filter(m => m.completed).length
  const scores = members.map(m => m.score || 0)
  const maxScore = Math.max(...scores, 0)
  const minScore = Math.min(...scores, scores.length > 0 ? scores[0] : 0)
  const consistency =
    maxScore > 0 ? 100 - ((maxScore - minScore) / maxScore) * 100 : 0

  return {
    avgScore,
    completionCount,
    rating:
      totalScore > 0 ? Math.min(100, (sumScore / totalScore) * 50 + 50) : 50,
    teamwork: (completionCount / members.length) * 100,
    consistency: Math.max(0, consistency),
  }
}

const TeamContributionSection = React.memo(
  ({
    battle,
    userTeam,
    userId,
    isExpanded,
    onToggle,
    enhancedMemberPerformance = false,
    mvpAwards = {},
  }) => {
    const { t } = useTranslation('QuickClash')
    const controls = useAnimationControls()
    const [selectedMember, setSelectedMember] = useState(null)
    const [animationPhase, setAnimationPhase] = useState(0)

    const config = useMemo(
      () => ({
        isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
        padding: { base: 3, md: 5 },
        headerIconSize: { base: 5, md: 6 },
        headingSize: { base: 'md', md: 'lg' },
      }),
      [],
    )

    const teamData = useMemo(() => {
      const userTeamMembers =
        (userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers) || []
      const opponentTeamMembers =
        (userTeam === 'teamA' ? battle.teamBMembers : battle.teamAMembers) || []
      const userTeamTotalScore =
        userTeam === 'teamA' ? battle.teamATotalScore : battle.teamBTotalScore
      const opponentTeamTotalScore =
        userTeam === 'teamA' ? battle.teamBTotalScore : battle.teamATotalScore

      const userTeamStats = calculateTeamStats(
        userTeamMembers,
        userTeamTotalScore,
      )
      const opponentTeamStats = calculateTeamStats(
        opponentTeamMembers,
        opponentTeamTotalScore,
      )

      // UPDATED: Prepare members with MVP flags and performance levels
      const augmentMembersWithMVP = (members, teamType) => {
        return members.map(member => {
          const memberId = member.user?._id
          let isMatchMVP = false
          let isTeamMVP = false
          let isPivotalPlayer = false

          if (mvpAwards.matchMVP?.user?._id === memberId) {
            isMatchMVP = true
          }
          if (
            teamType === userTeam &&
            mvpAwards.teamMVP?.user?._id === memberId
          ) {
            isTeamMVP = true
          }
          if (mvpAwards.pivotalPlayer?.user?._id === memberId) {
            isPivotalPlayer = true
          }

          // Calculate performance level for this member
          const performanceLevel = getMemberPerformanceLevel(
            member,
            userTeamStats.avgScore,
            enhancedMemberPerformance,
          )

          return {
            ...member,
            isMatchMVP,
            isTeamMVP,
            isPivotalPlayer,
            performanceLevel,
          }
        })
      }

      return {
        userTeamMembers: augmentMembersWithMVP(userTeamMembers, userTeam),
        opponentTeamMembers: augmentMembersWithMVP(
          opponentTeamMembers,
          userTeam === 'teamA' ? 'teamB' : 'teamA',
        ),
        userTeamTotalScore,
        opponentTeamTotalScore,
        userTeamWins:
          userTeam === 'teamA' ? battle.teamAWins : battle.teamBWins,
        opponentTeamWins:
          userTeam === 'teamA' ? battle.teamBWins : battle.teamAWins,
        userTeamStats,
        opponentTeamStats,
        userTeamName:
          battle[userTeam]?.name ||
          (userTeam === 'teamA' ? t('Team A') : t('Team B')),
        opponentTeamName:
          battle[userTeam === 'teamA' ? 'teamB' : 'teamA']?.name ||
          (userTeam === 'teamA' ? t('Team B') : t('Team A')),
      }
    }, [battle, userTeam, t, mvpAwards, enhancedMemberPerformance])

    useEffect(() => {
      if (isExpanded) {
        controls
          .start({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.4, ease: 'easeOut' },
          })
          .then(() => {
            setAnimationPhase(1)
          })
      } else {
        setAnimationPhase(0)
      }
    }, [controls, isExpanded])

    const handleMemberClick = useCallback(memberId => {
      setSelectedMember(prev => (prev === memberId ? null : memberId))
    }, [])

    if (!battle) {
      return (
        <Center p={5}>
          <Spinner color="purple.300" />
        </Center>
      )
    }

    const memberListSections = [
      {
        titleKey: 'Your Team',
        members: teamData.userTeamMembers,
        teamColor: 'blue',
        isUserTeam: true,
        totalScore: teamData.userTeamTotalScore,
      },
      {
        titleKey: 'Opponent Team',
        members: teamData.opponentTeamMembers,
        teamColor: 'red',
        isUserTeam: false,
        totalScore: teamData.opponentTeamTotalScore,
      },
    ].filter(section => section.members && section.members.length > 0)

    return (
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="2xl"
        bg="rgba(20, 15, 35, 0.7)"
        backdropFilter={config.isMobile ? 'none' : 'blur(10px)'}
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow={
          config.isMobile
            ? '0 6px 20px rgba(0, 0, 0, 0.2)'
            : '0 8px 25px rgba(0, 0, 0, 0.25)'
        }
      >
        <TeamContributionHeader
          isExpanded={isExpanded}
          onToggle={onToggle}
          config={config}
          t={t}
        />

        <TeamOverviewStats
          teamData={teamData}
          isExpanded={isExpanded}
          config={config}
          t={t}
        />

        <Collapse in={isExpanded} animateOpacity>
          <Box p={config.padding}>
            <Grid
              templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
              gap={config.padding}
            >
              {memberListSections.map(section => (
                <TeamMemberList
                  key={section.titleKey}
                  {...section}
                  userId={userId}
                  enhancedMemberPerformance={enhancedMemberPerformance}
                  mvpAwards={mvpAwards}
                  selectedMember={selectedMember}
                  onMemberClick={handleMemberClick}
                  animationPhase={animationPhase}
                  isMobile={config.isMobile}
                  t={t}
                  getMemberPerformanceLevel={getMemberPerformanceLevel}
                />
              ))}
            </Grid>

            {battle.status === 'completed' &&
              teamData.userTeamMembers.length > 0 && (
                <BattleSummaryMetrics
                  userTeamStats={teamData.userTeamStats}
                  t={t}
                />
              )}
          </Box>
        </Collapse>
      </Box>
    )
  },
)

TeamContributionSection.displayName = 'TeamContributionSection'
export default TeamContributionSection
