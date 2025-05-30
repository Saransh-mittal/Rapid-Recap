// components/quickClashComponents/team/teamBattlePageComponents/CategoriesSection.jsx
import React, { memo, useMemo } from 'react'
import {
  Box,
  Heading,
  Grid,
  GridItem,
  HStack,
  Icon,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Zap, Target } from 'lucide-react'

import CategoryCard from './categoriesSection/CategoryCard'

const MotionBox = motion(Box)
const MotionGridItem = motion(GridItem)

/**
 * Optimized Categories Section Component with better performance
 */
const CategoriesSection = memo(
  ({
    currentBattle,
    uncompletedCategories,
    userTeam,
    user,
    onSelectCategory,
    onViewReport,
    reportModalLoading,
    categorySelectionLoading,
    selectedCategoryId,
  }) => {
    const { t } = useTranslation('QuickClash')

    // Responsive values
    const sectionPadding = useBreakpointValue({ base: 4, sm: 5, md: 6, lg: 8 })
    const columns = useBreakpointValue({ base: 2, sm: 2, md: 3, lg: 4, xl: 5 })
    const gridSpacing = useBreakpointValue({ base: 3, sm: 4, md: 5, lg: 6 })
    const headerSize = useBreakpointValue({ base: 'lg', sm: 'xl', md: '2xl' })

    // Memoized user completed categories
    const userCompletedCategories = useMemo(() => {
      if (!currentBattle || !userTeam || !user) return []
      const teamMembers =
        userTeam === 'teamA'
          ? currentBattle.teamAMembers
          : currentBattle.teamBMembers
      const userMember = teamMembers.find(m => m.user._id === user._id)
      return userMember?.completed && userMember.category
        ? [userMember.category]
        : []
    }, [currentBattle, userTeam, user])

    // Memoized user participation status
    const hasUserParticipated = useMemo(() => {
      if (!currentBattle || !userTeam || !user) return false
      const teamMembers =
        userTeam === 'teamA'
          ? currentBattle.teamAMembers
          : currentBattle.teamBMembers
      const userMember = teamMembers.find(m => m.user._id === user._id)
      return !!userMember && (userMember.participated || userMember.completed)
    }, [currentBattle, userTeam, user])

    // Memoized teammates selected categories
    const teammatesSelectedCategories = useMemo(() => {
      if (!currentBattle || !userTeam || !user) return []
      const teamMembers = (
        userTeam === 'teamA'
          ? currentBattle.teamAMembers
          : currentBattle.teamBMembers
      ).filter(m => m.user._id !== user._id)
      return teamMembers
        .filter(m => m.category && !m.completed)
        .map(m => m.category)
    }, [currentBattle, userTeam, user])

    // Memoized enhanced category cards data
    const enhancedChallenges = useMemo(() => {
      if (!currentBattle || !userTeam || !user) return []

      return currentBattle.challenges.map(challenge => {
        const isAvailable =
          uncompletedCategories.some(c => c.category === challenge.category) &&
          !hasUserParticipated
        const isCompleted = userCompletedCategories.includes(challenge.category)
        const isSelectedByTeammate = teammatesSelectedCategories.includes(
          challenge.category,
        )

        const playerField = userTeam === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'
        const userScore =
          userTeam === 'teamA' ? challenge.teamAScore : challenge.teamBScore
        const opponentScore =
          userTeam === 'teamA' ? challenge.teamBScore : challenge.teamAScore
        const isUserAssigned = challenge[playerField] === user._id

        return {
          ...challenge,
          isAvailable,
          isCompleted,
          isSelectedByTeammate,
          isUserAssigned,
          userScore,
          opponentScore,
        }
      })
    }, [
      currentBattle,
      userTeam,
      user,
      uncompletedCategories,
      hasUserParticipated,
      userCompletedCategories,
      teammatesSelectedCategories,
    ])

    if (!currentBattle || !userTeam) return null

    return (
      <MotionBox
        mx={{ base: 3, sm: 4, md: 6, lg: 8 }}
        mb={{ base: 6, sm: 8, md: 10 }}
        position="relative"
        overflow="hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(15, 23, 42, 0.95)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          border="1px solid"
          borderColor="rgba(71, 85, 105, 0.3)"
          boxShadow="0 25px 50px rgba(0, 0, 0, 0.25)"
        />

        <Box position="relative" zIndex={1} p={sectionPadding}>
          <VStack spacing={{ base: 4, sm: 6, md: 8 }} w="100%">
            {/* Header Section */}
            <VStack spacing={{ base: 1.5, sm: 2, md: 3 }} textAlign="center">
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <HStack spacing={3} justify="center" align="center">
                  <Icon
                    as={Zap}
                    boxSize={{ base: 5, sm: 6, md: 7 }}
                    color="#3B82F6"
                  />
                  <Heading
                    size={headerSize}
                    color="white"
                    fontWeight="bold"
                    letterSpacing="-0.02em"
                    textAlign="center"
                  >
                    {t('Battle Arena')}
                  </Heading>
                  <Icon
                    as={Target}
                    boxSize={{ base: 5, sm: 6, md: 7 }}
                    color="#10B981"
                  />
                </HStack>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              >
                <Text
                  color="slate.400"
                  fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
                  fontWeight="medium"
                  textAlign="center"
                  lineHeight="1.5"
                  maxW="md"
                  mx="auto"
                >
                  {t('Choose your battlefield & prove your skills!')}
                </Text>
              </MotionBox>
            </VStack>

            {/* Categories Grid */}
            <Grid
              templateColumns={`repeat(${columns}, 1fr)`}
              gap={gridSpacing}
              w="100%"
              maxW="6xl"
              mx="auto"
            >
              {enhancedChallenges.map((challenge, index) => (
                <MotionGridItem
                  key={`${challenge.category}-${index}-${
                    challenge.challenge?._id || `fallback-${index}`
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                    ease: 'easeOut',
                  }}
                >
                  <CategoryCard
                    challenge={challenge}
                    isAvailable={challenge.isAvailable}
                    isCompleted={challenge.isCompleted}
                    isSelectedByTeammate={challenge.isSelectedByTeammate}
                    isUserAssigned={challenge.isUserAssigned}
                    userScore={challenge.userScore}
                    opponentScore={challenge.opponentScore}
                    onSelectCategory={onSelectCategory}
                    onViewReport={onViewReport}
                    reportModalLoading={reportModalLoading}
                    categorySelectionLoading={categorySelectionLoading}
                    selectedCategoryId={selectedCategoryId}
                    userTeam={userTeam}
                    user={user}
                  />
                </MotionGridItem>
              ))}
            </Grid>

            {/* User Participation Warning */}
            {hasUserParticipated && !userCompletedCategories.length && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                w="100%"
                maxW="md"
                mx="auto"
              >
                <Box
                  bg="rgba(245, 158, 11, 0.1)"
                  backdropFilter="blur(10px)"
                  borderRadius="xl"
                  p={{ base: 4, sm: 5 }}
                  border="1px solid"
                  borderColor="rgba(245, 158, 11, 0.3)"
                  boxShadow="0 10px 30px rgba(245, 158, 11, 0.1)"
                >
                  <HStack spacing={3} align="flex-start">
                    <Icon
                      as={AlertTriangle}
                      color="#F59E0B"
                      boxSize={{ base: 5, sm: 6 }}
                      flexShrink={0}
                      mt={0.5}
                    />
                    <VStack alignItems="flex-start" spacing={1} flex={1}>
                      <Text
                        color="#F59E0B"
                        fontWeight="bold"
                        fontSize={{ base: 'sm', sm: 'md' }}
                      >
                        {t('Challenge in Progress')}
                      </Text>
                      <Text
                        color="amber.200"
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        lineHeight="1.5"
                        opacity={0.9}
                      >
                        {t(
                          'You are currently participating in a challenge. Complete your current challenge before selecting another category.',
                        )}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </MotionBox>
            )}
          </VStack>
        </Box>
      </MotionBox>
    )
  },
)

CategoriesSection.displayName = 'CategoriesSection'

export default CategoriesSection
