// components/quickClashComponents/team/CategoriesSection.jsx
import React from 'react'
import {
  Box,
  Flex,
  Heading,
  Badge,
  Grid,
  GridItem,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

import CategoryCard from './CategoryCard'

const MotionBox = motion(Box)

/**
 * Component to display the categories section in team battle
 */
const CategoriesSection = ({
  currentBattle,
  uncompletedCategories,
  userCompletedCategories,
  hasUserParticipated,
  teammatesSelectedCategories,
  userTeam,
  user,
  onSelectCategory,
  onViewReport,
  reportModalLoading,
  categorySelectionLoading,
  selectedCategoryId,
  variants,
}) => {
  const { t } = useTranslation('QuickClash')

  // If no battle or user is not part of it, don't render
  if (!currentBattle || !userTeam) return null

  return (
    <MotionBox
      variants={variants}
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="lg"
      p={4}
      mb={6}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="white">
          {t('Categories')}
        </Heading>

        {uncompletedCategories.length > 0 && !hasUserParticipated ? (
          <Badge colorScheme="green">
            {uncompletedCategories.length} {t('Available')}
          </Badge>
        ) : userCompletedCategories.length > 0 ? (
          <Badge colorScheme="purple">
            {t('You selected')}: {userCompletedCategories[0]}
          </Badge>
        ) : (
          <Badge colorScheme="yellow">{t('All categories selected')}</Badge>
        )}
      </Flex>

      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={4}
      >
        {currentBattle.challenges.map(challenge => {
          // Determine if this challenge is currently available to the user
          const isAvailable =
            uncompletedCategories.some(
              c => c.category === challenge.category,
            ) && !hasUserParticipated // User hasn't participated in any challenge yet

          // Check if the user has already completed this category
          const isCompleted = userCompletedCategories.includes(
            challenge.category,
          )

          // Check if another teammate has selected this category
          const isSelectedByTeammate = teammatesSelectedCategories.includes(
            challenge.category,
          )

          // Get the challenge associated with this category
          const teamField =
            userTeam === 'teamA' ? 'teamACompleted' : 'teamBCompleted'
          const playerField =
            userTeam === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'
          const opponentCompleted =
            userTeam === 'teamA'
              ? challenge.teamBCompleted
              : challenge.teamACompleted
          const userScore =
            userTeam === 'teamA' ? challenge.teamAScore : challenge.teamBScore
          const opponentScore =
            userTeam === 'teamA' ? challenge.teamBScore : challenge.teamAScore

          // Determine if the user is the assigned player for this challenge
          const isUserAssigned = challenge[playerField] === user._id

          return (
            <GridItem key={challenge.category}>
              <CategoryCard
                challenge={challenge}
                isAvailable={isAvailable}
                isCompleted={isCompleted}
                isSelectedByTeammate={isSelectedByTeammate}
                isUserAssigned={isUserAssigned}
                userScore={userScore}
                opponentScore={opponentScore}
                opponentCompleted={opponentCompleted}
                onSelect={onSelectCategory}
                onViewReport={onViewReport}
                reportModalLoading={reportModalLoading}
                categorySelectionLoading={categorySelectionLoading}
                selectedCategoryId={selectedCategoryId}
              />
            </GridItem>
          )
        })}
      </Grid>

      {/* Display message when user already participated */}
      {hasUserParticipated && !userCompletedCategories.length && (
        <Box
          mt={4}
          p={4}
          bg="rgba(237, 137, 54, 0.1)"
          borderRadius="md"
          borderWidth="1px"
          borderColor="orange.500"
        >
          <HStack spacing={2}>
            <Icon as={AlertTriangle} color="orange.400" boxSize={5} />
            <Text color="white">
              {t(
                'You are already participating in a challenge. Complete your current challenge before selecting another.',
              )}
            </Text>
          </HStack>
        </Box>
      )}
    </MotionBox>
  )
}

export default CategoriesSection
