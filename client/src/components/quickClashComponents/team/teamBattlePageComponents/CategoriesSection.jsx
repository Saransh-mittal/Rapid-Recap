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
  useDisclosure,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Zap, Target } from 'lucide-react'

import CategoryCard from './categoriesSection/CategoryCard'
import QuickClashInstructionsModal from '../../QuickClashInstructionsModal'

/**
 * Categories Section Component with Loading States, Instructions Modal, and Participation Logic
 */
const CategoriesSection = memo(
  ({
    currentBattle,
    uncompletedCategories,
    userTeam,
    user,
    onSelectCategory,
    onDeselectCategory,
    onBeginChallenge,
    onViewReport,
    reportModalLoading,
    // New loading props
    categoryOperationLoading,
    categoryOperationType,
    categoryOperationError,
    selectedCategoryForOperation,
    // Legacy props for backward compatibility
    categorySelectionLoading,
    selectedCategoryId,
  }) => {
    const { t } = useTranslation('QuickClash')

    // Instructions modal state
    const {
      isOpen: isInstructionsOpen,
      onOpen: openInstructions,
      onClose: closeInstructions,
    } = useDisclosure()

    // Store the current challenge action to execute after instructions
    const [pendingChallengeAction, setPendingChallengeAction] =
      React.useState(null)

    // Responsive values
    const sectionPadding = useBreakpointValue({ base: 4, sm: 5, md: 6, lg: 8 })
    const columns = useBreakpointValue({ base: 2, sm: 2, md: 3, lg: 4, xl: 5 })
    const gridSpacing = useBreakpointValue({ base: 3, sm: 4, md: 5, lg: 6 })
    const headerSize = useBreakpointValue({ base: 'lg', sm: 'xl', md: '2xl' })

    // Memoized user participation status - UPDATED LOGIC
    const userParticipationStatus = useMemo(() => {
      if (!currentBattle || !userTeam || !user) {
        return {
          hasParticipated: false,
          participatedCategory: null,
          hasCompleted: false,
          hasExited: false,
        }
      }

      const teamMembers =
        userTeam === 'teamA'
          ? currentBattle.teamAMembers
          : currentBattle.teamBMembers

      const userMember = teamMembers.find(m => m.user._id === user._id)

      if (!userMember) {
        return {
          hasParticipated: false,
          participatedCategory: null,
          hasCompleted: false,
          hasExited: false,
        }
      }

      // Check if user has participated but not completed (exited)
      const hasExited = userMember.participated && !userMember.completed

      return {
        hasParticipated: userMember.participated || userMember.completed,
        participatedCategory: userMember.category,
        hasCompleted: userMember.completed,
        hasExited: hasExited,
      }
    }, [currentBattle, userTeam, user])

    // Update hasUserParticipated to use the new logic
    const hasUserParticipated = userParticipationStatus.hasParticipated

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

    // Memoized user's selected category and participation status
    const userChallengeStatus = useMemo(() => {
      if (!currentBattle || !userTeam || !user) return null
      const teamMembers =
        userTeam === 'teamA'
          ? currentBattle.teamAMembers
          : currentBattle.teamBMembers
      const userMember = teamMembers.find(m => m.user._id === user._id)

      if (!userMember) return null

      return {
        selectedCategory: userMember.category,
        hasParticipated: userMember.participated,
        hasCompleted: userMember.completed,
      }
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

    // Memoized enhanced category cards data with loading states and participation logic
    const enhancedChallenges = useMemo(() => {
      if (!currentBattle || !userTeam || !user) return []

      return currentBattle.challenges.map(challenge => {
        const playerField = userTeam === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'
        const userScore =
          userTeam === 'teamA' ? challenge.teamAScore : challenge.teamBScore
        const opponentScore =
          userTeam === 'teamA' ? challenge.teamBScore : challenge.teamAScore

        // Check if this challenge has been assigned to someone (started)
        const isAssignedToPlayer = challenge[playerField] !== null
        const isUserAssigned = challenge[playerField] === user._id

        // Get user's selection status from team members
        const teamMembers =
          userTeam === 'teamA'
            ? currentBattle.teamAMembers
            : currentBattle.teamBMembers
        const userMember = teamMembers.find(m => m.user._id === user._id)

        // CRITICAL FIX: Only check completion for THIS specific category
        const isSelectedByUser = userMember?.category === challenge.category
        const hasUserParticipatedInThisCategory =
          isUserAssigned && userMember?.participated
        const hasUserCompletedThisCategory =
          isUserAssigned && userMember?.completed

        // Check if selected by teammate (not assigned to player yet, but selected)
        const isSelectedByTeammate = teamMembers.some(
          m =>
            m.user._id !== user._id &&
            m.category === challenge.category &&
            !isAssignedToPlayer,
        )

        // CRITICAL UPDATE: Check if user has participated in ANY challenge
        const userHasParticipatedInAnyChallenge =
          userParticipationStatus.hasParticipated
        const userHasExitedAnyChallenge = userParticipationStatus.hasExited
        const isThisTheParticipatedCategory =
          challenge.category === userParticipationStatus.participatedCategory

        // FIXED: Determine states based on THIS SPECIFIC category only
        const isCompleted = hasUserCompletedThisCategory // Only true if THIS category is completed
        const isInProgress =
          isUserAssigned &&
          hasUserParticipatedInThisCategory &&
          !hasUserCompletedThisCategory
        const isStartedButExited =
          isUserAssigned &&
          hasUserParticipatedInThisCategory &&
          !hasUserCompletedThisCategory

        // FIXED: Check if user participated in this specific category but didn't complete it
        const userExitedThisSpecificCategory =
          isThisTheParticipatedCategory &&
          userParticipationStatus.hasParticipated &&
          !userParticipationStatus.hasCompleted

        const isSelectedButNotStarted =
          isSelectedByUser &&
          !isUserAssigned &&
          !hasUserParticipatedInThisCategory

        // UPDATED AVAILABILITY LOGIC
        const isAvailable =
          !isSelectedByUser &&
          !isSelectedByTeammate &&
          !isAssignedToPlayer &&
          !hasUserParticipatedInThisCategory &&
          !userHasParticipatedInAnyChallenge && // User hasn't participated in any challenge
          !userHasExitedAnyChallenge // User hasn't exited any challenge

        // FIXED: Lock logic - only lock if user exited ANY challenge AND this is NOT the participated category
        const isLockedDueToExit =
          userHasExitedAnyChallenge && !isThisTheParticipatedCategory

        // Loading states for this specific category
        const isThisCategoryLoading =
          categoryOperationLoading &&
          (selectedCategoryForOperation === challenge.category ||
            isSelectedByUser)

        const loadingType = isThisCategoryLoading ? categoryOperationType : null

        // Determine if buttons should be disabled
        const isAnyOperationLoading = categoryOperationLoading
        const isThisCategoryOperating = isThisCategoryLoading
        const shouldDisableButtons =
          isAnyOperationLoading && !isThisCategoryOperating

        return {
          ...challenge,
          isAvailable,
          isCompleted,
          isInProgress,
          isStartedButExited,
          isSelectedButNotStarted,
          isSelectedByTeammate,
          isUserAssigned,
          userScore,
          opponentScore,
          // Loading states
          isLoading: isThisCategoryLoading,
          loadingType,
          isDisabled: shouldDisableButtons,
          // Lock state due to user having exited another challenge
          isLockedDueToExit,
          isThisTheParticipatedCategory,
        }
      })
    }, [
      currentBattle,
      userTeam,
      user,
      categoryOperationLoading,
      categoryOperationType,
      selectedCategoryForOperation,
      userParticipationStatus,
    ])

    // Handle begin challenge with instructions modal
    const handleBeginChallengeWithInstructions = React.useCallback(() => {
      // Store the actual begin challenge function
      setPendingChallengeAction(() => onBeginChallenge)
      // Open instructions modal
      openInstructions()
    }, [onBeginChallenge, openInstructions])

    // Handle starting challenge after instructions
    const handleStartChallenge = React.useCallback(() => {
      if (pendingChallengeAction) {
        pendingChallengeAction()
        setPendingChallengeAction(null)
      }
    }, [pendingChallengeAction])

    // Handle modal close
    const handleCloseInstructions = React.useCallback(() => {
      closeInstructions()
      setPendingChallengeAction(null)
    }, [closeInstructions])

    if (!currentBattle || !userTeam) return null

    return (
      <>
        <Box
          mx={{ base: 3, sm: 4, md: 6, lg: 8 }}
          mb={{ base: 6, sm: 8, md: 10 }}
          position="relative"
          overflow="hidden"
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
            <VStack
              spacing={{ base: 4, sm: 6, md: 8 }}
              w="100%"
              alignItems="center" // Ensures the Grid block is centered by default
            >
              {/* Header Section */}
              <VStack
                spacing={{ base: 1.5, sm: 2, md: 3 }}
                textAlign="center"
                w="100%" // Ensures header content is centered within the full width
              >
                <Box>
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
                </Box>

                <Box>
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
                </Box>
              </VStack>

              {/* Categories Grid */}
              <Grid
                display="inline-grid" // Grid width fits its content
                templateColumns={`repeat(${columns}, 1fr)`}
                gap={gridSpacing}
                maxW="6xl" // Constrains the max width of the grid
                position="relative" // Added to allow offset
                left={{ base: '2rem', sm: '3rem', md: '4rem', lg: '5rem' }} // Added: Nudges the grid to the right
              >
                {enhancedChallenges.map((challenge, index) => (
                  <GridItem
                    key={`${challenge.category}-${index}-${
                      challenge.challenge?._id || `fallback-${index}`
                    }`}
                  >
                    <CategoryCard
                      challenge={challenge}
                      isAvailable={challenge.isAvailable}
                      isCompleted={challenge.isCompleted}
                      isInProgress={challenge.isInProgress}
                      isStartedButExited={challenge.isStartedButExited}
                      isSelectedButNotStarted={
                        challenge.isSelectedButNotStarted
                      }
                      isSelectedByTeammate={challenge.isSelectedByTeammate}
                      isUserAssigned={challenge.isUserAssigned}
                      userScore={challenge.userScore}
                      opponentScore={challenge.opponentScore}
                      // Loading states
                      isLoading={challenge.isLoading}
                      loadingType={challenge.loadingType}
                      isDisabled={challenge.isDisabled}
                      // NEW: Lock states
                      isLockedDueToExit={challenge.isLockedDueToExit}
                      isThisTheParticipatedCategory={
                        challenge.isThisTheParticipatedCategory
                      }
                      // Actions
                      onSelectCategory={onSelectCategory}
                      onDeselectCategory={onDeselectCategory}
                      onBeginChallenge={handleBeginChallengeWithInstructions}
                      onViewReport={onViewReport}
                      reportModalLoading={reportModalLoading}
                      // Legacy props for backward compatibility
                      categorySelectionLoading={categorySelectionLoading}
                      selectedCategoryId={selectedCategoryId}
                      userTeam={userTeam}
                      user={user}
                    />
                  </GridItem>
                ))}
              </Grid>

              {/* User Participation Warnings - These are already self-centering */}
              {userParticipationStatus.hasExited && (
                <Box w="100%" maxW="md" mx="auto">
                  <Box
                    bg="rgba(239, 68, 68, 0.1)"
                    backdropFilter="blur(10px)"
                    borderRadius="xl"
                    p={{ base: 4, sm: 5 }}
                    border="1px solid"
                    borderColor="rgba(239, 68, 68, 0.3)"
                    boxShadow="0 10px 30px rgba(239, 68, 68, 0.1)"
                  >
                    <HStack spacing={3} align="flex-start">
                      <Icon
                        as={AlertTriangle}
                        color="#EF4444"
                        boxSize={{ base: 5, sm: 6 }}
                        flexShrink={0}
                        mt={0.5}
                      />
                      <VStack alignItems="flex-start" spacing={1} flex={1}>
                        <Text
                          color="#EF4444"
                          fontWeight="bold"
                          fontSize={{ base: 'sm', sm: 'md' }}
                        >
                          {t('Challenge Participation Complete')}
                        </Text>
                        <Text
                          color="red.200"
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          lineHeight="1.5"
                          opacity={0.9}
                        >
                          {t(
                            'You have already participated in a challenge in this battle. You cannot select or start additional challenges.',
                          )}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </Box>
              )}

              {hasUserParticipated &&
                !userParticipationStatus.hasExited &&
                !userCompletedCategories.length && (
                  <Box w="100%" maxW="md" mx="auto">
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
                  </Box>
                )}
            </VStack>
          </Box>
        </Box>

        {/* Instructions Modal */}
        <QuickClashInstructionsModal
          isOpen={isInstructionsOpen}
          onClose={handleCloseInstructions}
          onStart={handleStartChallenge}
        />
      </>
    )
  },
)

CategoriesSection.displayName = 'CategoriesSection'

export default CategoriesSection
