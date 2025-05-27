// components/quickClashComponents/team/teamBattlePageComponents/CategoriesSection.jsx
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
  VStack,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Play,
  FileText,
  CheckCircle,
  Clock,
  Star,
  Target,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionGridItem = motion(GridItem)

/**
 * Enhanced component to display the categories section in team battle
 */
const CategoriesSection = ({
  currentBattle,
  uncompletedCategories,
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
  const navigate = useNavigate()

  // Responsive values
  const padding = useBreakpointValue({ base: 4, md: 6 })
  const columns = useBreakpointValue({ base: 1, sm: 2, lg: 4 })
  const spacing = useBreakpointValue({ base: 3, md: 4 })

  // Get user's completed categories
  const userCompletedCategories = React.useMemo(() => {
    if (!currentBattle || !userTeam || !user) return []
    const teamMembers =
      userTeam === 'teamA'
        ? currentBattle.teamAMembers
        : currentBattle.teamBMembers
    const userMember = teamMembers.find(m => m.user._id === user._id)
    if (userMember && userMember.completed && userMember.category) {
      return [userMember.category]
    }
    return []
  }, [currentBattle, userTeam, user])

  // Check if the current user has already participated
  const hasUserParticipated = React.useMemo(() => {
    if (!currentBattle || !userTeam || !user) return false
    const teamMembers =
      userTeam === 'teamA'
        ? currentBattle.teamAMembers
        : currentBattle.teamBMembers
    const userMember = teamMembers.find(m => m.user._id === user._id)
    return userMember && (userMember.participated || userMember.completed)
  }, [currentBattle, userTeam, user])

  // Get categories selected by teammates
  const teammatesSelectedCategories = React.useMemo(() => {
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

  // Enhanced CategoryCard component
  const EnhancedCategoryCard = ({ challenge }) => {
    const isAvailable =
      uncompletedCategories.some(c => c.category === challenge.category) &&
      !hasUserParticipated
    const isCompleted = userCompletedCategories.includes(challenge.category)
    const isSelectedByTeammate = teammatesSelectedCategories.includes(
      challenge.category,
    )

    const teamField = userTeam === 'teamA' ? 'teamACompleted' : 'teamBCompleted'
    const playerField = userTeam === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'
    const opponentCompleted =
      userTeam === 'teamA' ? challenge.teamBCompleted : challenge.teamACompleted
    const userScore =
      userTeam === 'teamA' ? challenge.teamAScore : challenge.teamBScore
    const opponentScore =
      userTeam === 'teamA' ? challenge.teamBScore : challenge.teamAScore

    const isUserAssigned = challenge[playerField] === user._id

    // Get category icon and specific colors based on category name
    const getCategoryInfo = () => {
      const categoryLower = challenge.category.toLowerCase()
      const defaultTextColor = 'white' // Most badges will have white text

      if (categoryLower === 'world') {
        return { icon: '🌍', bgColor: '#3182CE', textColor: defaultTextColor } // Blue
      } else if (categoryLower === 'politics') {
        return { icon: '🏛️', bgColor: '#718096', textColor: defaultTextColor } // Gray
      } else if (categoryLower === 'business') {
        return { icon: '💼', bgColor: '#38A169', textColor: defaultTextColor } // Green
      } else if (categoryLower === 'technology') {
        return { icon: '💻', bgColor: '#00A3C4', textColor: defaultTextColor } // Cyan/Teal
      } else if (categoryLower === 'sports') {
        return { icon: '⚽', bgColor: '#E53E3E', textColor: defaultTextColor } // Red
      } else if (categoryLower === 'health') {
        return { icon: '⚕️', bgColor: '#D53F8C', textColor: defaultTextColor } // Pink
      } else if (categoryLower === 'science') {
        return { icon: '🔬', bgColor: '#319795', textColor: defaultTextColor } // Teal
      } else if (categoryLower === 'environment') {
        return { icon: '🌳', bgColor: '#2F855A', textColor: defaultTextColor } // Dark Green
      } else if (categoryLower === 'crime') {
        return { icon: '⚖️', bgColor: '#2D3748', textColor: defaultTextColor } // Very Dark Gray
      } else if (categoryLower === 'education') {
        return { icon: '📚', bgColor: '#DD6B20', textColor: defaultTextColor } // Orange
      } else if (categoryLower === 'entertainment') {
        return { icon: '🎬', bgColor: '#805AD5', textColor: defaultTextColor } // Purple
      } else if (categoryLower === 'food') {
        // Using a yellow that might need dark text, or pick a darker yellow/amber.
        // Let's use a darker yellow that works with white text.
        return { icon: '🍔', bgColor: '#B7791F', textColor: defaultTextColor } // Dark Yellow/Brownish
      } else if (categoryLower === 'lifestyle') {
        return { icon: '💃', bgColor: '#ED64A6', textColor: defaultTextColor } // Brighter Pink/Magenta
      } else if (categoryLower === 'tourism') {
        return { icon: '✈️', bgColor: '#4299E1', textColor: defaultTextColor } // Lighter Blue
      }
      // Default fallback
      else {
        return { icon: '🎯', bgColor: '#A0AEC0', textColor: defaultTextColor } // Fallback Gray
      }
    }

    const categoryInfo = getCategoryInfo()

    return (
      <MotionBox
        bg={
          isAvailable
            ? 'rgba(72, 187, 120, 0.1)'
            : isCompleted
            ? 'rgba(128, 90, 213, 0.1)'
            : isSelectedByTeammate
            ? 'rgba(237, 137, 54, 0.1)'
            : 'rgba(160, 174, 192, 0.1)'
        }
        borderWidth="2px"
        borderColor={
          isAvailable
            ? 'green.500'
            : isCompleted
            ? 'purple.500'
            : isSelectedByTeammate
            ? 'orange.500'
            : 'gray.600'
        }
        borderRadius="xl"
        p={padding}
        position="relative"
        overflow="hidden"
        whileHover={
          isAvailable
            ? {
                y: -8,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
                borderColor: 'green.400',
              }
            : {}
        }
        whileTap={isAvailable ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        cursor={isAvailable ? 'pointer' : 'default'}
        onClick={() => isAvailable && onSelectCategory(challenge.category)}
        height="fit-content"
        minHeight="200px"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={`linear(135deg, transparent 0%, rgba(${
            isAvailable
              ? '72, 187, 120'
              : isCompleted
              ? '128, 90, 213'
              : isSelectedByTeammate
              ? '237, 137, 54'
              : '160, 174, 192'
          }, 0.05) 100%)`}
          opacity={0.8}
        />

        {isAvailable && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="4px"
            bgGradient="linear(to-r, green.400, teal.400)"
            borderTopRadius="xl"
          />
        )}

        <Box position="absolute" top={4} right={4} fontSize="2xl" opacity={0.3}>
          {categoryInfo.icon}
        </Box>

        <VStack spacing={4} align="stretch" position="relative" zIndex={1}>
          <VStack spacing={2} align="flex-start">
            <Badge
              // Instead of colorScheme, we now use bg and color directly
              bg={categoryInfo.bgColor}
              color={categoryInfo.textColor}
              variant="solid" // Ensure variant is solid for these direct bg/color to work as expected
              px={3}
              py={1}
              borderRadius="full"
              fontSize="md"
              fontWeight="bold"
            >
              {challenge.category}
            </Badge>

            {isAvailable && (
              <Badge
                colorScheme="green" // This badge can still use colorScheme
                variant="subtle"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                <Icon as={Target} boxSize={3} mr={1} />
                {t('Available')}
              </Badge>
            )}
          </VStack>

          <VStack spacing={2} align="stretch">
            {isCompleted ? (
              <HStack justify="space-between">
                <Badge colorScheme="green" variant="outline">
                  <Icon as={CheckCircle} boxSize={3} mr={1} />
                  {t('Completed')}
                </Badge>
                <Badge colorScheme="purple" variant="solid">
                  {userScore} {t('pts')}
                </Badge>
              </HStack>
            ) : isUserAssigned && !isCompleted ? (
              <HStack justify="space-between">
                <Badge colorScheme="yellow" variant="outline">
                  <Icon as={Clock} boxSize={3} mr={1} />
                  {t('In Progress')}
                </Badge>
                <Badge colorScheme="blue" variant="subtle">
                  {t('Continue')}
                </Badge>
              </HStack>
            ) : isSelectedByTeammate ? (
              <Badge colorScheme="orange" variant="outline">
                <Icon as={Star} boxSize={3} mr={1} />
                {t('Selected by Teammate')}
              </Badge>
            ) : isAvailable ? (
              <Badge colorScheme="green" variant="outline">
                <Icon as={Play} boxSize={3} mr={1} />
                {t('Ready to Start')}
              </Badge>
            ) : (
              <Badge colorScheme="gray" variant="outline">
                {t('Unavailable')}
              </Badge>
            )}

            {isCompleted && opponentCompleted && (
              <HStack justify="space-between" pt={2}>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {t('Result')}:
                </Text>
                {userScore > opponentScore ? (
                  <Badge colorScheme="green" fontSize="sm">
                    {t('Victory!')}
                  </Badge>
                ) : userScore < opponentScore ? (
                  <Badge colorScheme="red" fontSize="sm">
                    {t('Defeat')}
                  </Badge>
                ) : (
                  <Badge colorScheme="yellow" fontSize="sm">
                    {t('Draw')}
                  </Badge>
                )}
              </HStack>
            )}
          </VStack>

          <Box pt={2}>
            {isCompleted ? (
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<Icon as={FileText} />}
                width="100%"
                onClick={e => {
                  e.stopPropagation()
                  onViewReport(challenge.challenge?._id)
                }}
                isLoading={reportModalLoading}
                borderRadius="lg"
              >
                {t('View Report')}
              </Button>
            ) : isUserAssigned && !isCompleted ? (
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Icon as={Play} />}
                width="100%"
                onClick={e => {
                  e.stopPropagation()
                  navigate(`/quickclash/session/${challenge.challenge?._id}`)
                }}
                borderRadius="lg"
              >
                {t('Continue Challenge')}
              </Button>
            ) : (
              isAvailable && (
                <Button
                  size="sm"
                  colorScheme="green"
                  leftIcon={<Icon as={Play} />}
                  width="100%"
                  isLoading={
                    categorySelectionLoading &&
                    selectedCategoryId === challenge.challenge?._id
                  }
                  loadingText={t('Starting...')}
                  borderRadius="lg"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s"
                >
                  {t('Start Challenge')}
                </Button>
              )
            )}
          </Box>
        </VStack>
      </MotionBox>
    )
  }

  if (!currentBattle || !userTeam) return null

  return (
    <MotionBox
      variants={variants}
      mx={{ base: 4, md: 6 }}
      mb={8}
      bg="rgba(26, 32, 44, 0.6)"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      p={padding}
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        width="200px"
        height="200px"
        bgGradient="radial(circle, rgba(128, 90, 213, 0.1) 0%, transparent 70%)"
        transform="translate(50%, -50%)"
      />

      <VStack spacing={spacing} position="relative" zIndex={1}>
        <Flex justify="space-between" align="center" w="100%">
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg" color="white">
              {t('Categories')}
            </Heading>
            <Text color="whiteAlpha.700" fontSize="sm">
              {t('Choose a category to battle in')}
            </Text>
          </VStack>

          {uncompletedCategories.length > 0 && !hasUserParticipated ? (
            <Badge
              colorScheme="green"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="md"
            >
              {uncompletedCategories.length} {t('Available')}
            </Badge>
          ) : userCompletedCategories.length > 0 ? (
            <Badge
              colorScheme="purple"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="md"
            >
              {t('You selected')}: {userCompletedCategories[0]}
            </Badge>
          ) : (
            <Badge
              colorScheme="yellow"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="md"
            >
              {t('All categories selected')}
            </Badge>
          )}
        </Flex>

        <Grid
          templateColumns={`repeat(${columns}, 1fr)`}
          gap={spacing}
          w="100%"
        >
          {currentBattle.challenges.map((challenge, index) => (
            <MotionGridItem
              key={`${challenge.category}-${index}-${
                challenge.challenge?._id || index
              }`} // More robust key
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EnhancedCategoryCard challenge={challenge} />
            </MotionGridItem>
          ))}
        </Grid>

        {hasUserParticipated && !userCompletedCategories.length && (
          <Box
            mt={4}
            p={4}
            bg="rgba(237, 137, 54, 0.1)"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="orange.500"
          >
            <HStack spacing={3}>
              <Icon as={AlertTriangle} color="orange.400" boxSize={6} />
              <VStack align="flex-start" spacing={1}>
                <Text color="white" fontWeight="bold">
                  {t('Challenge in Progress')}
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t(
                    'You are already participating in a challenge. Complete your current challenge before selecting another.',
                  )}
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </VStack>
    </MotionBox>
  )
}

export default CategoriesSection
