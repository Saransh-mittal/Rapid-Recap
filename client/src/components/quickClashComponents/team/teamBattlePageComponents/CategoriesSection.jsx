// components/quickClashComponents/team/teamBattlePageComponents/CategoriesSection.jsx
import React from 'react'
import {
  Box,
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
  Progress,
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
  Sparkles,
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
  Zap,
  Target,
  Sword,
  Shield,
  Crown,
  Flame,
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

  // Responsive values
  const sectionPadding = useBreakpointValue({ base: 4, sm: 5, md: 6, lg: 8 })
  const columns = useBreakpointValue({ base: 2, sm: 2, md: 3, lg: 4, xl: 5 })
  const gridSpacing = useBreakpointValue({ base: 3, sm: 4, md: 5, lg: 6 })
  const headerSize = useBreakpointValue({ base: 'lg', sm: 'xl', md: '2xl' })

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
    const userScore =
      userTeam === 'teamA' ? challenge.teamAScore : challenge.teamBScore
    const opponentScore =
      userTeam === 'teamA' ? challenge.teamBScore : challenge.teamAScore
    const isUserAssigned = challenge[playerField] === user._id

    const cardPadding = useBreakpointValue({ base: 3, sm: 4 })
    const iconSize = useBreakpointValue({
      base: '24px',
      sm: '28px',
      md: '30px',
    })
    const categoryFontSize = useBreakpointValue({ base: 'xs', sm: 'sm' })
    const badgeFontSize = useBreakpointValue({
      base: '9px',
      sm: '10px',
      md: '11px',
    })

    const smallButtonFontSize = useBreakpointValue({
      base: '10px',
      sm: '11px',
      md: '12px',
    })
    const buttonSize = useBreakpointValue({ base: 'sm', sm: 'md' })
    const cardHeight = useBreakpointValue({
      base: '170px',
      sm: '200px',
      md: '230px',
    })

    const getCategoryInfo = () => {
      const categoryLower = challenge.category.toLowerCase()
      const categoryStyles = {
        world: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          iconComponent: Globe2,
          battleIcon: Target,
        },
        politics: {
          primaryColor: '#EF4444',
          secondaryColor: '#B91C1C',
          iconComponent: Landmark,
          battleIcon: Crown,
        },
        business: {
          primaryColor: '#10B981',
          secondaryColor: '#047857',
          iconComponent: Briefcase,
          battleIcon: Sword,
        },
        technology: {
          primaryColor: '#8B5CF6',
          secondaryColor: '#5B21B6',
          iconComponent: Cpu,
          battleIcon: Zap,
        },
        sports: {
          primaryColor: '#F59E0B',
          secondaryColor: '#D97706',
          iconComponent: Trophy,
          battleIcon: Flame,
        },
        health: {
          primaryColor: '#EC4899',
          secondaryColor: '#BE185D',
          iconComponent: HeartPulse,
          battleIcon: Shield,
        },
        science: {
          primaryColor: '#06B6D4',
          secondaryColor: '#0891B2',
          iconComponent: FlaskConical,
          battleIcon: Star,
        },
        environment: {
          primaryColor: '#84CC16',
          secondaryColor: '#65A30D',
          iconComponent: Leaf,
          battleIcon: Target,
        },
        crime: {
          primaryColor: '#6B7280',
          secondaryColor: '#374151',
          iconComponent: Gavel,
          battleIcon: Sword,
        },
        education: {
          primaryColor: '#F97316',
          secondaryColor: '#C2410C',
          iconComponent: BookOpenText,
          battleIcon: Crown,
        },
        entertainment: {
          primaryColor: '#E11D48',
          secondaryColor: '#BE185D',
          iconComponent: Film,
          battleIcon: Star,
        },
        food: {
          primaryColor: '#F59E0B',
          secondaryColor: '#D97706',
          iconComponent: UtensilsCrossed,
          battleIcon: Flame,
        },
        lifestyle: {
          primaryColor: '#8B5CF6',
          secondaryColor: '#5B21B6',
          iconComponent: SmilePlus,
          battleIcon: Shield,
        },
        tourism: {
          primaryColor: '#0EA5E9',
          secondaryColor: '#0284C7',
          iconComponent: PlaneTakeoff,
          battleIcon: Target,
        },
      }
      return categoryStyles[categoryLower] || categoryStyles.world
    }
    const categoryInfo = getCategoryInfo()

    let cardBg = 'rgba(15, 23, 42, 0.9)'
    let borderColorValue = 'rgba(71, 85, 105, 0.3)'
    let shadowColor = 'rgba(0, 0, 0, 0.1)'

    if (isCompleted) {
      borderColorValue = '#10B981'
      shadowColor = 'rgba(16, 185, 129, 0.3)'
    } else if (isAvailable) {
      borderColorValue = categoryInfo.primaryColor
      shadowColor = `${categoryInfo.primaryColor}40`
    } else if (isSelectedByTeammate) {
      borderColorValue = '#F59E0B'
      shadowColor = 'rgba(245, 158, 11, 0.3)'
    }

    return (
      <MotionBox
        bg={cardBg}
        borderRadius="xl"
        p={cardPadding}
        position="relative"
        overflow="hidden"
        height={cardHeight}
        display="flex"
        flexDirection="column"
        border="2px solid"
        borderColor={borderColorValue}
        boxShadow={`0 8px 25px ${shadowColor}`}
        backdropFilter="blur(10px)"
        whileHover={{
          y: isAvailable ? -6 : -3,
          scale: isAvailable ? 1.03 : 1.01,
          boxShadow: `0 12px 35px ${shadowColor}`,
          transition: { duration: 0.3, ease: 'easeOut' },
        }}
        cursor={isAvailable ? 'pointer' : 'default'}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: `linear(135deg, ${categoryInfo.primaryColor}15, transparent 60%)`,
          opacity: 0.8,
          zIndex: 0,
        }}
      >
        <Icon
          as={categoryInfo.battleIcon}
          position="absolute"
          top="8px"
          right="8px"
          boxSize={{ base: '14px', sm: '16px' }}
          color={categoryInfo.primaryColor}
          opacity={0.4}
          zIndex={1}
        />

        {isCompleted && (
          <Icon
            as={CheckCircle}
            position="absolute"
            top="8px"
            left="8px"
            boxSize={{ base: '16px', sm: '18px' }}
            color="#10B981"
            opacity={0.9}
            zIndex={1}
          />
        )}

        {/* Main content VStack */}
        <VStack
          spacing={{ base: 1, sm: 1.5 }}
          alignItems="center"
          flex={1}
          position="relative"
          zIndex={2}
          justify="space-between"
          py={{ base: 1, sm: 1.5 }}
        >
          {/* Content Block - Different layout for completed vs non-completed */}
          {isCompleted ? (
            // Completed state layout with left-aligned scores
            <VStack
              w="full"
              spacing={{ base: 1, sm: 1.5 }}
              alignItems="flex-start"
              mt={{ base: 1, sm: 1.5 }} // Margin for top-left checkmark
            >
              {/* Icon and Category Name - centered within its own block */}
              <VStack
                spacing={{ base: 0.5, sm: 1 }}
                alignItems="center"
                w="full"
                alignSelf="center"
              >
                <MotionBox
                  bg={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
                  borderRadius="lg"
                  p={{ base: 1.5, sm: 2 }}
                  boxShadow={`0 4px 15px ${categoryInfo.primaryColor}40`}
                  whileHover={{
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.6, ease: 'easeInOut' },
                  }}
                >
                  <Icon
                    as={categoryInfo.iconComponent}
                    boxSize={iconSize}
                    color="white"
                  />
                </MotionBox>
                <Text
                  fontSize={categoryFontSize}
                  fontWeight="bold"
                  color="white"
                  textAlign="center"
                  lineHeight="1.2"
                  textTransform="capitalize"
                  letterSpacing="0.5px"
                >
                  {challenge.category}
                </Text>
              </VStack>

              {/* Score display */}
              <Box
                w="full"
                bg="rgba(15, 23, 42, 0.4)"
                borderRadius="md"
                p={{ base: 1.5, sm: 2 }}
                border="1px solid"
                borderColor="rgba(16, 185, 129, 0.15)"
                backdropFilter="blur(3px)"
              >
                <HStack
                  spacing={1.5}
                  alignItems="center"
                  justifyContent="flex-start"
                  w="full"
                >
                  <Text
                    color="gray.300"
                    fontWeight="medium"
                    fontSize={{ base: '11px', sm: '12px', md: '13px' }}
                    letterSpacing="0.3px"
                  >
                    RQM:
                  </Text>
                  <HStack spacing={1} alignItems="center">
                    <Text
                      color="#10B981"
                      fontWeight="bold"
                      fontSize={{ base: '13px', sm: '14px', md: '15px' }}
                      bg="rgba(16, 185, 129, 0.1)"
                      px={1.5}
                      py={0.5}
                      borderRadius="sm"
                      minW="20px"
                      textAlign="center"
                    >
                      {userScore !== undefined ? userScore : '-'}
                    </Text>
                    <Text
                      color="gray.400"
                      fontSize={{ base: '10px', sm: '11px', md: '12px' }}
                      fontWeight="medium"
                      mx={0.5}
                    >
                      VS
                    </Text>
                    <Text
                      color="#EF4444"
                      fontWeight="bold"
                      fontSize={{ base: '13px', sm: '14px', md: '15px' }}
                      bg="rgba(239, 68, 68, 0.1)"
                      px={1.5}
                      py={0.5}
                      borderRadius="sm"
                      minW="20px"
                      textAlign="center"
                    >
                      {opponentScore !== undefined ? opponentScore : '-'}
                    </Text>
                  </HStack>
                </HStack>
              </Box>
            </VStack>
          ) : (
            // Non-completed state layout with centered alignment
            <VStack
              w="full"
              spacing={{ base: 2, sm: 2.5 }}
              alignItems="center"
              justify="center"
              flex={1}
            >
              {/* Icon and Category Name */}
              <VStack spacing={{ base: 1, sm: 1.5 }} alignItems="center">
                <MotionBox
                  bg={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
                  borderRadius="lg"
                  p={{ base: 1.5, sm: 2 }}
                  boxShadow={`0 4px 15px ${categoryInfo.primaryColor}40`}
                  whileHover={{
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.6, ease: 'easeInOut' },
                  }}
                >
                  <Icon
                    as={categoryInfo.iconComponent}
                    boxSize={iconSize}
                    color="white"
                  />
                </MotionBox>
                <Text
                  fontSize={categoryFontSize}
                  fontWeight="bold"
                  color="white"
                  textAlign="center"
                  lineHeight="1.2"
                  textTransform="capitalize"
                  letterSpacing="0.5px"
                >
                  {challenge.category}
                </Text>
              </VStack>

              {/* Status Badge */}
              <Box textAlign="center">
                {isUserAssigned ? (
                  <VStack spacing={1.5}>
                    <Badge
                      bg="linear-gradient(135deg, #F59E0B, #D97706)"
                      color="white"
                      px={{ base: 2, sm: 3 }}
                      py={{ base: 1, sm: 1.5 }}
                      borderRadius="lg"
                      fontSize={badgeFontSize}
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      boxShadow="0 4px 15px rgba(245, 158, 11, 0.3)"
                    >
                      <Icon as={Clock} boxSize="12px" mr={1.5} />
                      {t('In Progress')}
                    </Badge>
                    <Progress
                      value={75}
                      size="sm"
                      colorScheme="orange"
                      borderRadius="full"
                      width={{ base: '60px', sm: '80px' }}
                      bg="rgba(245, 158, 11, 0.2)"
                    />
                  </VStack>
                ) : isSelectedByTeammate ? (
                  <Badge
                    bg="linear-gradient(135deg, #8B5CF6, #7C3AED)"
                    color="white"
                    px={{ base: 2, sm: 3 }}
                    py={{ base: 1, sm: 1.5 }}
                    borderRadius="lg"
                    fontSize={badgeFontSize}
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    boxShadow="0 4px 15px rgba(139, 92, 246, 0.3)"
                  >
                    <Icon as={Star} boxSize="12px" mr={1.5} />
                    {t('Teammate')}
                  </Badge>
                ) : !isAvailable ? (
                  <Badge
                    bg="rgba(71, 85, 105, 0.8)"
                    color="slate.300"
                    px={{ base: 2, sm: 3 }}
                    py={{ base: 1, sm: 1.5 }}
                    borderRadius="lg"
                    fontSize={badgeFontSize}
                    fontWeight="500"
                    backdropFilter="blur(5px)"
                  >
                    {t('Locked')}
                  </Badge>
                ) : (
                  <MotionBox
                    animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Badge
                      bg={`${categoryInfo.primaryColor}20`}
                      color={categoryInfo.primaryColor}
                      px={{ base: 2, sm: 3 }}
                      py={{ base: 1, sm: 1.5 }}
                      borderRadius="full"
                      fontSize={badgeFontSize}
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      border="2px solid"
                      borderColor={`${categoryInfo.primaryColor}60`}
                      boxShadow={`0 0 20px ${categoryInfo.primaryColor}30`}
                    >
                      <Icon as={Sparkles} boxSize="12px" mr={1.5} />
                      {t('Ready')}
                    </Badge>
                  </MotionBox>
                )}
              </Box>
            </VStack>
          )}

          {/* Action Button */}
          <Box w="100%">
            {isCompleted ? (
              <Button
                size={buttonSize}
                variant="outline"
                borderColor="#10B981"
                color="#10B981"
                bg="rgba(16, 185, 129, 0.08)"
                _hover={{
                  bg: 'rgba(16, 185, 129, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(16, 185, 129, 0.25)',
                }}
                leftIcon={
                  <Icon as={FileText} boxSize={{ base: '11px', sm: '13px' }} />
                }
                width="100%"
                onClick={e => {
                  e.stopPropagation()
                  onViewReport(challenge.challenge?._id)
                }}
                isLoading={reportModalLoading}
                borderRadius="lg"
                fontSize={smallButtonFontSize}
                fontWeight="semibold"
              >
                {t('View Report')}
              </Button>
            ) : isUserAssigned && !isCompleted ? (
              <Button
                size={buttonSize}
                bg={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
                color="white"
                _hover={{
                  filter: 'brightness(110%)',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${categoryInfo.primaryColor}50`,
                }}
                leftIcon={
                  <Icon as={Play} boxSize={{ base: '12px', sm: '14px' }} />
                }
                width="100%"
                onClick={e => {
                  e.stopPropagation()
                  navigate(`/quickclash/session/${challenge.challenge?._id}`)
                }}
                borderRadius="lg"
                fontSize={smallButtonFontSize}
                fontWeight="bold"
              >
                {t('Continue')}
              </Button>
            ) : (
              isAvailable && (
                <MotionBox
                  as={Button}
                  size={buttonSize}
                  bg={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
                  color="white"
                  leftIcon={
                    <Icon as={Play} boxSize={{ base: '12px', sm: '14px' }} />
                  }
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
                  fontSize={smallButtonFontSize}
                  fontWeight="bold"
                  boxShadow={`0 4px 15px ${categoryInfo.primaryColor}40`}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    boxShadow: `0 8px 25px ${categoryInfo.primaryColor}60`,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                  _hover={{}}
                  _active={{}}
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
        <VStack spacing={{ base: 4, sm: 6, md: 8 }} w="100%">
          <VStack spacing={{ base: 1.5, sm: 2, md: 3 }} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
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

          <Grid
            templateColumns={`repeat(${columns}, 1fr)`}
            gap={gridSpacing}
            w="100%"
            maxW="6xl"
            mx="auto"
          >
            {currentBattle.challenges.map((challenge, index) => (
              <MotionGridItem
                key={`${challenge.category}-${index}-${
                  challenge.challenge?._id || `fallback-${index}`
                }`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: index * 0.08,
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  duration: 0.8,
                }}
              >
                <EnhancedCategoryCard challenge={challenge} />
              </MotionGridItem>
            ))}
          </Grid>

          {hasUserParticipated && !userCompletedCategories.length && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
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
}

export default CategoriesSection
