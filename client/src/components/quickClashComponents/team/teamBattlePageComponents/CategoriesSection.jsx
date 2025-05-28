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
  Sparkles, // Using Sparkles for "Available" aesthetic
  Globe2,
  Landmark,
  Briefcase,
  Cpu,
  Trophy,
  HeartPulse,
  FlaskConical,
  Leaf,
  Gavel,
  BookOpenText,
  Film,
  UtensilsCrossed,
  SmilePlus,
  PlaneTakeoff,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionGridItem = motion(GridItem)

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

  const sectionPadding = useBreakpointValue({ base: 3, sm: 4, md: 5 })
  const columns = useBreakpointValue({ base: 2, sm: 2, md: 3, lg: 4 })
  const gridSpacing = useBreakpointValue({ base: 3, sm: 4, md: 4 })

  const userCompletedCategories = React.useMemo(() => {
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

  const hasUserParticipated = React.useMemo(() => {
    if (!currentBattle || !userTeam || !user) return false
    const teamMembers =
      userTeam === 'teamA'
        ? currentBattle.teamAMembers
        : currentBattle.teamBMembers
    const userMember = teamMembers.find(m => m.user._id === user._id)
    return !!userMember && (userMember.participated || userMember.completed)
  }, [currentBattle, userTeam, user])

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

  const EnhancedCategoryCard = ({ challenge }) => {
    const isAvailable =
      uncompletedCategories.some(c => c.category === challenge.category) &&
      !hasUserParticipated
    const isCompleted = userCompletedCategories.includes(challenge.category)
    const isSelectedByTeammate = teammatesSelectedCategories.includes(
      challenge.category,
    )

    const playerField = userTeam === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'
    const opponentCompleted =
      userTeam === 'teamA' ? challenge.teamBCompleted : challenge.teamACompleted
    const userScore =
      userTeam === 'teamA' ? challenge.teamAScore : challenge.teamBScore
    const opponentScore =
      userTeam === 'teamA' ? challenge.teamBScore : challenge.teamAScore
    const isUserAssigned = challenge[playerField] === user._id

    const cardPadding = useBreakpointValue({ base: 3, sm: 3.5, md: 4 })
    const iconContainerSize = useBreakpointValue({
      base: '48px',
      sm: '52px',
      md: '56px',
    })
    const iconSize = useBreakpointValue({
      base: '24px',
      sm: '26px',
      md: '28px',
    })

    const categoryNameFontSize = useBreakpointValue({
      base: '10px',
      sm: '11px',
      md: 'xs',
    })
    const categoryNamePaddingX = useBreakpointValue({ base: 2.5, sm: 3 })
    const categoryNamePaddingY = useBreakpointValue({ base: 1, sm: 1.25 })

    const availableBadgeFontSize = useBreakpointValue({
      base: '9px',
      sm: '10px',
    })
    const availableBadgeIconSize = useBreakpointValue({
      base: '10px',
      sm: '12px',
    })
    const availableBadgePaddingX = useBreakpointValue({ base: 2, sm: 2.5 })
    const availableBadgePaddingY = useBreakpointValue({ base: 0.5, sm: 1 })

    const statusBadgeFontSize = useBreakpointValue({
      base: '10px',
      sm: '10px',
      md: '11px',
    })
    const statusBadgePaddingX = useBreakpointValue({ base: 2, sm: 2.5 })
    const statusBadgePaddingY = useBreakpointValue({ base: 1, sm: 1.2 })
    const statusIconSize = useBreakpointValue({ base: '12px', sm: '13px' })

    const secondaryStatusBadgeFontSize = useBreakpointValue({
      base: '9px',
      sm: '10px',
    })
    const secondaryStatusBadgePaddingX = useBreakpointValue({
      base: 2.5,
      sm: 3,
    })
    const secondaryStatusBadgePaddingY = useBreakpointValue({
      base: 1.25,
      sm: 1.5,
    })

    const buttonSize = 'sm'
    const buttonFontSize = useBreakpointValue({ base: '11px', sm: 'xs' })
    const buttonIconSize = useBreakpointValue({ base: '12px', sm: '14px' })
    const buttonPaddingY = useBreakpointValue({ base: 3, sm: 3.5 })

    const internalCardMainSpacing = useBreakpointValue({ base: 2.5, sm: 3 })
    const topGroupInternalSpacing = useBreakpointValue({ base: 2, sm: 2.5 })

    const getCategoryInfo = () => {
      const categoryLower = challenge.category.toLowerCase()
      const defaultTextColor = 'white'
      const categoryMap = {
        world: {
          iconComponent: Globe2,
          bgColor: '#3182CE',
          textColor: defaultTextColor,
          gradientFrom: '#63B3ED',
          gradientTo: '#3182CE',
          availableShade: 'blue.300',
        },
        politics: {
          iconComponent: Landmark,
          bgColor: '#718096',
          textColor: defaultTextColor,
          gradientFrom: '#A0AEC0',
          gradientTo: '#718096',
          availableShade: 'gray.400',
        },
        business: {
          iconComponent: Briefcase,
          bgColor: '#38A169',
          textColor: defaultTextColor,
          gradientFrom: '#68D391',
          gradientTo: '#38A169',
          availableShade: 'green.300',
        },
        technology: {
          iconComponent: Cpu,
          bgColor: '#00A3C4',
          textColor: defaultTextColor,
          gradientFrom: '#4FD1C5',
          gradientTo: '#00A3C4',
          availableShade: 'cyan.300',
        },
        sports: {
          iconComponent: Trophy,
          bgColor: '#E53E3E',
          textColor: defaultTextColor,
          gradientFrom: '#FC8181',
          gradientTo: '#E53E3E',
          availableShade: 'red.300',
        },
        health: {
          iconComponent: HeartPulse,
          bgColor: '#D53F8C',
          textColor: defaultTextColor,
          gradientFrom: '#F687B3',
          gradientTo: '#D53F8C',
          availableShade: 'pink.300',
        },
        science: {
          iconComponent: FlaskConical,
          bgColor: '#319795',
          textColor: defaultTextColor,
          gradientFrom: '#4FD1C5',
          gradientTo: '#319795',
          availableShade: 'teal.300',
        },
        environment: {
          iconComponent: Leaf,
          bgColor: '#2F855A',
          textColor: defaultTextColor,
          gradientFrom: '#68D391',
          gradientTo: '#2F855A',
          availableShade: 'green.300',
        },
        crime: {
          iconComponent: Gavel,
          bgColor: '#2D3748',
          textColor: defaultTextColor,
          gradientFrom: '#4A5568',
          gradientTo: '#2D3748',
          availableShade: 'gray.500',
        },
        education: {
          iconComponent: BookOpenText,
          bgColor: '#DD6B20',
          textColor: defaultTextColor,
          gradientFrom: '#F6AD55',
          gradientTo: '#DD6B20',
          availableShade: 'orange.300',
        },
        entertainment: {
          iconComponent: Film,
          bgColor: '#805AD5',
          textColor: defaultTextColor,
          gradientFrom: '#B794F4',
          gradientTo: '#805AD5',
          availableShade: 'purple.300',
        },
        food: {
          iconComponent: UtensilsCrossed,
          bgColor: '#B7791F',
          textColor: defaultTextColor,
          gradientFrom: '#D69E2E',
          gradientTo: '#B7791F',
          availableShade: 'yellow.400',
        },
        lifestyle: {
          iconComponent: SmilePlus,
          bgColor: '#ED64A6',
          textColor: defaultTextColor,
          gradientFrom: '#FBB6CE',
          gradientTo: '#ED64A6',
          availableShade: 'pink.300',
        },
        tourism: {
          iconComponent: PlaneTakeoff,
          bgColor: '#4299E1',
          textColor: defaultTextColor,
          gradientFrom: '#63B3ED',
          gradientTo: '#3182CE',
          availableShade: 'blue.300',
        },
      }
      return (
        categoryMap[categoryLower] || {
          iconComponent: Globe2,
          bgColor: 'gray.500',
          textColor: 'white',
          gradientFrom: 'gray.400',
          gradientTo: 'gray.600',
          availableShade: 'gray.400',
        }
      )
    }
    const categoryInfo = getCategoryInfo()
    const cardBg = 'rgba(30, 35, 48, 0.85)'

    let borderColor = isCompleted
      ? 'purple.500'
      : isSelectedByTeammate
      ? 'orange.500'
      : isAvailable
      ? categoryInfo.bgColor
      : 'gray.700'

    const cardHoverVariants = isAvailable
      ? {
          y: -5,
          scale: 1.03,
          boxShadow: `0 0 30px 0px ${borderColor}B3, 0 0 0 2px ${borderColor}`,
          transition: { duration: 0.25, ease: 'circOut' },
        }
      : {}

    return (
      <MotionBox
        bg={cardBg}
        backdropFilter="blur(10px)"
        borderWidth="2px"
        borderColor={borderColor}
        borderRadius="xl"
        p={cardPadding}
        position="relative"
        overflow="hidden"
        minHeight={{ base: '185px', sm: '200px', md: '215px' }}
        display="flex"
        flexDirection="column"
        boxShadow={`0 5px 15px rgba(0,0,0,0.2), 0 0 0 1.5px ${borderColor}50`}
        whileHover={cardHoverVariants}
        cursor={isAvailable ? 'pointer' : 'default'}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={`linear-gradient(155deg, ${categoryInfo.bgColor}26 0%, transparent 50%)`}
          opacity={0.9}
          zIndex={0}
        />

        <VStack
          spacing={internalCardMainSpacing}
          alignItems="stretch"
          flex={1}
          position="relative"
          zIndex={1}
        >
          <VStack
            spacing={topGroupInternalSpacing}
            alignItems="center"
            flexShrink={0}
            mt={{ base: 1.5, sm: 2 }}
          >
            <Flex
              w={iconContainerSize}
              h={iconContainerSize}
              borderRadius="lg"
              bg={categoryInfo.bgColor}
              alignItems="center"
              justifyContent="center"
              boxShadow={`0 4px 12px ${categoryInfo.bgColor}7A`}
            >
              <Icon
                as={categoryInfo.iconComponent}
                boxSize={iconSize}
                color={categoryInfo.textColor}
              />
            </Flex>
            <Badge
              bg={`${categoryInfo.bgColor}E6`}
              color={categoryInfo.textColor}
              px={categoryNamePaddingX}
              py={categoryNamePaddingY}
              borderRadius="full"
              fontSize={categoryNameFontSize}
              fontWeight="600"
              textTransform="uppercase" // CHANGED HERE
              letterSpacing="0.1px"
              boxShadow={`0 1px 3px ${categoryInfo.bgColor}4D`}
            >
              {challenge.category}
            </Badge>
          </VStack>

          <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            py={1}
          >
            {isCompleted ? (
              <VStack spacing={2}>
                <HStack spacing={2} justifyContent="center" w="full">
                  <Badge
                    bg="green.400"
                    color="white"
                    px={statusBadgePaddingX}
                    py={statusBadgePaddingY}
                    borderRadius="md"
                    fontSize={statusBadgeFontSize}
                    fontWeight="bold"
                    textTransform="uppercase"
                    display="flex"
                    alignItems="center"
                    boxShadow="0 3px 10px rgba(72, 187, 120, 0.5)"
                  >
                    <Icon as={CheckCircle} boxSize={statusIconSize} mr={1.5} />
                    {t('Completed')}
                  </Badge>
                  <Badge
                    bg="purple.500"
                    color="white"
                    px={statusBadgePaddingX}
                    py={statusBadgePaddingY}
                    borderRadius="md"
                    fontSize={statusBadgeFontSize}
                    fontWeight="bold"
                    boxShadow="0 3px 10px rgba(128, 90, 213, 0.5)"
                  >
                    {userScore} {t('PTS')}
                  </Badge>
                </HStack>
              </VStack>
            ) : isUserAssigned && !isCompleted ? (
              <Badge
                bg="yellow.500"
                color="white"
                px={secondaryStatusBadgePaddingX}
                py={secondaryStatusBadgePaddingY}
                borderRadius="lg"
                fontSize={secondaryStatusBadgeFontSize}
                fontWeight="600"
                display="flex"
                alignItems="center"
                boxShadow="0 3px 10px rgba(237, 137, 54, 0.4)"
              >
                <Icon as={Clock} boxSize={statusIconSize} mr={1.5} />
                {t('In Progress')}
              </Badge>
            ) : isSelectedByTeammate ? (
              <Badge
                bg="orange.500"
                color="white"
                px={secondaryStatusBadgePaddingX}
                py={secondaryStatusBadgePaddingY}
                borderRadius="lg"
                fontSize={secondaryStatusBadgeFontSize}
                fontWeight="600"
                display="flex"
                alignItems="center"
                boxShadow="0 3px 10px rgba(237, 137, 54, 0.4)"
              >
                <Icon as={Star} boxSize={statusIconSize} mr={1.5} />
                {t('Teammate')}
              </Badge>
            ) : !isAvailable ? (
              <Badge
                bg="gray.600"
                color="whiteAlpha.800"
                px={secondaryStatusBadgePaddingX}
                py={secondaryStatusBadgePaddingY}
                borderRadius="lg"
                fontSize={secondaryStatusBadgeFontSize}
                fontWeight="600"
                textTransform="uppercase"
                boxShadow="0 3px 8px rgba(113, 128, 150, 0.4)"
              >
                {t('Unavailable')}
              </Badge>
            ) : (
              <Badge
                bg={`${categoryInfo.availableShade}33`}
                color={categoryInfo.availableShade}
                px={availableBadgePaddingX}
                py={availableBadgePaddingY}
                borderRadius="full"
                fontSize={availableBadgeFontSize}
                fontWeight="600"
                textTransform="uppercase"
                letterSpacing="0.5px"
                display="inline-flex"
                alignItems="center"
                border="1px solid"
                borderColor={`${categoryInfo.availableShade}80`}
                boxShadow={`0 1px 5px ${categoryInfo.availableShade}33`}
              >
                <Icon as={Sparkles} boxSize={availableBadgeIconSize} mr={1} />
                {t('Available')}
              </Badge>
            )}
          </Box>

          <Box
            flexShrink={0}
            w="100%"
            mt={
              isAvailable &&
              !isCompleted &&
              !(isUserAssigned && !isCompleted) &&
              !isSelectedByTeammate
                ? 'auto'
                : undefined
            }
          >
            {isCompleted ? (
              <Button
                size={buttonSize}
                variant="outline"
                borderColor="purple.400"
                color="purple.300"
                bg="rgba(128, 90, 213, 0.2)"
                _hover={{
                  bg: 'rgba(128, 90, 213, 0.3)',
                  borderColor: 'purple.300',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(128,90,213,0.35)',
                }}
                leftIcon={<Icon as={FileText} boxSize={buttonIconSize} />}
                width="100%"
                onClick={e => {
                  e.stopPropagation()
                  onViewReport(challenge.challenge?._id)
                }}
                isLoading={reportModalLoading}
                borderRadius="lg"
                py={buttonPaddingY}
                fontSize={buttonFontSize}
                fontWeight="600"
              >
                {t('View Report')}
              </Button>
            ) : isUserAssigned && !isCompleted ? (
              <Button
                size={buttonSize}
                bgGradient={`linear(135deg, blue.500, blue.700)`}
                color="white"
                _hover={{
                  bgGradient: `linear(135deg, blue.600, blue.800)`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 7px 18px rgba(49,130,206,0.45)',
                }}
                leftIcon={<Icon as={Play} boxSize={buttonIconSize} />}
                width="100%"
                onClick={e => {
                  e.stopPropagation()
                  navigate(`/quickclash/session/${challenge.challenge?._id}`)
                }}
                borderRadius="lg"
                py={buttonPaddingY}
                fontSize={buttonFontSize}
                fontWeight="600"
              >
                {t('Continue Challenge')}
              </Button>
            ) : (
              isAvailable && (
                <MotionBox
                  as={Button}
                  size={buttonSize}
                  bg={categoryInfo.bgColor}
                  color={categoryInfo.textColor}
                  leftIcon={<Icon as={Play} boxSize={buttonIconSize} />}
                  width="100%"
                  onClick={e => {
                    e.stopPropagation()
                    onSelectCategory(
                      challenge.category,
                      challenge.challenge?._id,
                    )
                  }}
                  isLoading={
                    categorySelectionLoading &&
                    selectedCategoryId === challenge.challenge?._id
                  }
                  loadingText={t('Starting...')}
                  borderRadius="lg"
                  py={buttonPaddingY}
                  fontSize={buttonFontSize}
                  fontWeight="600"
                  letterSpacing="0.2px"
                  boxShadow={`0 4px 15px -3px ${categoryInfo.bgColor}99`}
                  whileHover={{
                    scale: 1.03,
                    y: -2.5,
                    filter: 'brightness(115%)',
                    boxShadow: `0 7px 20px -3px ${categoryInfo.bgColor}77`,
                  }}
                  _hover={{}}
                  _active={{
                    transform: 'scale(0.97)',
                    filter: 'brightness(0.9)',
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {t('Start Challenge')}
                </MotionBox>
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
      mx={{ base: 2, sm: 3, md: 4 }}
      mb={5}
      bg="gray.900"
      borderRadius="2xl"
      p={sectionPadding}
      border="1px solid rgba(255, 255, 255, 0.05)"
      position="relative"
      overflow="hidden"
      boxShadow="0 15px 50px rgba(0, 0, 0, 0.3)"
    >
      <VStack spacing={{ base: 4, sm: 5 }} position="relative" zIndex={1}>
        <VStack spacing={1.5} w="100%" textAlign="center">
          <Heading
            size={useBreakpointValue({ base: 'md', sm: 'lg' })}
            color="white"
            fontWeight="bold"
            letterSpacing="-0.5px"
          >
            {t('Categories')}
          </Heading>
          <Text
            color="whiteAlpha.700"
            fontSize={{ base: 'sm', sm: 'md' }}
            fontWeight="normal"
          >
            {t('Choose a category to battle in')}
          </Text>
        </VStack>

        <Grid
          templateColumns={`repeat(${columns}, 1fr)`}
          gap={gridSpacing}
          w="100%"
        >
          {currentBattle.challenges.map((challenge, index) => (
            <MotionGridItem
              key={`${challenge.category}-${index}-${
                challenge.challenge?._id || index
              }`}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.07,
                type: 'spring',
                stiffness: 100,
                damping: 12,
              }}
            >
              <EnhancedCategoryCard challenge={challenge} />
            </MotionGridItem>
          ))}
        </Grid>

        {hasUserParticipated && !userCompletedCategories.length && (
          <Box
            mt={4}
            p={3.5}
            bg="rgba(237, 137, 54, 0.15)"
            backdropFilter="blur(8px)"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="rgba(237, 137, 54, 0.25)"
          >
            <HStack spacing={2.5}>
              <Icon as={AlertTriangle} color="orange.300" boxSize={4.5} />
              <VStack alignItems="flex-start" spacing={0.5}>
                <Text
                  color="orange.200"
                  fontWeight="semibold"
                  fontSize={{ base: 'xs', sm: 'sm' }}
                >
                  {t('Challenge in Progress')}
                </Text>
                <Text
                  color="orange.300"
                  fontSize={{ base: '10px', sm: 'xs' }}
                  opacity={0.9}
                  lineHeight="1.35"
                >
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
