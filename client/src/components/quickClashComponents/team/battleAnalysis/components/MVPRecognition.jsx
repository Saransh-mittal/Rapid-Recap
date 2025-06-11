// components/quickClashComponents/team/battleAnalysis/components/MVPRecognition.jsx

import React, { useEffect, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  Heading,
  Icon,
  Badge,
  HStack,
  VStack,
  Avatar,
  Collapse,
  Grid,
  GridItem,
  Circle,
  Tooltip,
} from '@chakra-ui/react'
import { motion, useAnimationControls } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Crown,
  Trophy,
  Zap,
  ChevronDown,
  Star,
  Award,
  Users,
  CheckCircle,
  Target,
} from 'lucide-react'
import confetti from 'canvas-confetti'

const MotionBox = motion(Box)

const MVP_CONFIGS = {
  matchMVP: {
    title: 'Match MVP',
    icon: Crown,
    color: 'purple',
    gradient: 'linear(135deg, #A855F7, #8B5CF6)',
    bgGradient: 'linear(to-br, purple.600, purple.800)',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: 'purple.400',
    tier: 'S+',
    celebrationColor: '#A855F7',
    criteria: ['Winner Team', 'Won Category', 'Highest Score'],
  },
  teamMVP: {
    title: 'Team MVP',
    icon: Trophy,
    color: 'green',
    gradient: 'linear(135deg, #22C55E, #10B981)',
    bgGradient: 'linear(to-br, green.600, green.800)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: 'green.400',
    tier: 'S',
    celebrationColor: '#22C55E',
    criteria: ['Losing Team', 'Won Category', 'Highest Score'],
  },
  pivotalPlayer: {
    title: 'Pivotal Player',
    icon: Zap,
    color: 'orange',
    gradient: 'linear(135deg, #F59E0B, #D97706)',
    bgGradient: 'linear(to-br, orange.600, orange.800)',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    borderColor: 'orange.400',
    tier: 'A+',
    celebrationColor: '#F59E0B',
    criteria: ['Biggest Impact', 'Category Winner', 'Point Difference'],
  },
}

const MVPRecognition = ({ mvpAwards, userTeam, isExpanded, onToggle }) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimationControls()

  // Memoized responsive configuration
  const config = useMemo(
    () => ({
      isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
      padding: { base: 3, md: 5 },
      headerIconSize: { base: 5, md: 6 },
      headingSize: { base: 'md', md: 'lg' },
      avatarSize:
        typeof window !== 'undefined' && window.innerWidth < 768 ? 'md' : 'lg',
    }),
    [],
  )

  // Filter awards to only show user's team members
  const filteredAwards = useMemo(() => {
    const filtered = {
      matchMVP: null,
      teamMVP: null,
      pivotalPlayer: null,
      performanceRecognitions: [],
    }

    // Only show Match MVP if they're on user's team
    if (mvpAwards.matchMVP && mvpAwards.matchMVP.team === userTeam) {
      filtered.matchMVP = mvpAwards.matchMVP
    }

    // Only show Team MVP if they're on user's team
    if (mvpAwards.teamMVP && mvpAwards.teamMVP.team === userTeam) {
      filtered.teamMVP = mvpAwards.teamMVP
    }

    // Only show Pivotal Player if they're on user's team
    if (mvpAwards.pivotalPlayer && mvpAwards.pivotalPlayer.team === userTeam) {
      filtered.pivotalPlayer = mvpAwards.pivotalPlayer
    }

    // Only show performance recognitions for user's team
    filtered.performanceRecognitions = (
      mvpAwards.performanceRecognitions || []
    ).filter(recognition => recognition.team === userTeam)

    return filtered
  }, [mvpAwards, userTeam])

  // Count available awards for layout optimization
  const availableAwards = [
    filteredAwards.matchMVP,
    filteredAwards.teamMVP,
    filteredAwards.pivotalPlayer,
  ].filter(Boolean)

  const hasAnyAward = availableAwards.length > 0
  const legendaryPerformers =
    filteredAwards.performanceRecognitions?.filter(
      p => p.level === 'legendary',
    ) || []

  // Dynamic grid columns based on number of awards
  const gridColumns = config.isMobile ? 1 : availableAwards.length === 1 ? 1 : 2

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    })

    // Celebration effect for MVP awards
    if (hasAnyAward && !config.isMobile) {
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#A855F7', '#22C55E', '#F59E0B'],
          shapes: ['star'],
          scalar: 0.8,
        })
      }, 800)
    }
  }, [controls, hasAnyAward, config.isMobile])

  // Don't render if no awards for user's team
  if (!hasAnyAward && legendaryPerformers.length === 0) {
    return null
  }

  const renderMVPCard = (award, type) => {
    if (!award) return null

    const mvpConfig = MVP_CONFIGS[type]

    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        whileHover={
          config.isMobile
            ? {}
            : { y: -3, boxShadow: `0 12px 25px ${mvpConfig.glowColor}` }
        }
        h="100%"
      >
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="xl"
          bg="rgba(10, 5, 20, 0.9)"
          backdropFilter={config.isMobile ? 'none' : 'blur(15px)'}
          border="2px solid"
          borderColor={mvpConfig.borderColor}
          p={4}
          boxShadow={`0 8px 20px ${mvpConfig.glowColor}`}
          h="100%"
          display="flex"
          flexDirection="column"
        >
          {/* Enhanced animated background */}
          {!config.isMobile && (
            <MotionBox
              position="absolute"
              inset={0}
              bgGradient={mvpConfig.bgGradient}
              opacity={0.15}
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Tier badge */}
          <Badge
            position="absolute"
            top={2}
            right={2}
            bgGradient={mvpConfig.gradient}
            color="white"
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
          >
            {mvpConfig.tier}
          </Badge>

          {/* Team badge with enhanced styling */}
          <Badge
            position="absolute"
            top={2}
            left={2}
            colorScheme="blue"
            variant="solid"
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="full"
          >
            <HStack spacing={1}>
              <Icon as={Users} boxSize={2.5} />
              <span>{t('Your Team')}</span>
            </HStack>
          </Badge>

          <VStack
            spacing={3}
            position="relative"
            zIndex={1}
            pt={6}
            flex={1}
            justify="space-between"
          >
            {/* Header Section */}
            <VStack spacing={2}>
              <Circle
                size="60px"
                bgGradient={mvpConfig.gradient}
                boxShadow={`0 0 25px ${mvpConfig.glowColor}`}
              >
                <Icon as={mvpConfig.icon} color="white" boxSize={7} />
              </Circle>
              <Text
                color={`${mvpConfig.color}.300`}
                fontSize="md"
                fontWeight="bold"
                textAlign="center"
                noOfLines={1}
              >
                {t(mvpConfig.title)}
              </Text>
            </VStack>

            {/* Player Info Section */}
            <VStack spacing={3} w="100%">
              <Avatar
                size={config.avatarSize}
                name={award.user.name || award.user.inGameName}
                src={award.user.pic}
                border="3px solid"
                borderColor={mvpConfig.borderColor}
                boxShadow={`0 0 15px ${mvpConfig.glowColor}`}
              />
              <Text
                color="white"
                fontSize="md"
                fontWeight="bold"
                textAlign="center"
                noOfLines={1}
                w="100%"
              >
                {award.user.name || award.user.inGameName}
              </Text>
            </VStack>

            {/* Enhanced Stats Section */}
            <VStack spacing={2.5} w="100%" minH="120px" justify="center">
              <HStack justify="space-between" w="100%">
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Score')}
                </Text>
                <HStack spacing={1}>
                  <Text
                    color={`${mvpConfig.color}.300`}
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    {award.score}
                  </Text>
                  <Icon
                    as={Star}
                    color={`${mvpConfig.color}.400`}
                    boxSize={4}
                  />
                </HStack>
              </HStack>

              <HStack justify="space-between" w="100%">
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Category')}
                </Text>
                <HStack spacing={1}>
                  <Text
                    color="whiteAlpha.900"
                    fontSize="sm"
                    fontWeight="medium"
                    noOfLines={1}
                  >
                    {award.category?.toUpperCase() || 'N/A'}
                  </Text>
                  {(award.wonCategory || award.challengeWinner) && (
                    <Icon as={CheckCircle} color="green.400" boxSize={3} />
                  )}
                </HStack>
              </HStack>

              {award.difference && (
                <HStack justify="space-between" w="100%">
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {t('Margin')}
                  </Text>
                  <HStack spacing={1}>
                    <Text color="orange.300" fontSize="sm" fontWeight="bold">
                      +{award.difference}
                    </Text>
                    <Icon as={Target} color="orange.400" boxSize={3} />
                  </HStack>
                </HStack>
              )}
            </VStack>

            {/* Enhanced Description Section */}
            <Box
              bg="rgba(255,255,255,0.06)"
              borderRadius="md"
              p={3}
              w="100%"
              border="1px solid"
              borderColor="rgba(255,255,255,0.1)"
              minH="60px"
              display="flex"
              alignItems="center"
            >
              <Text
                color="whiteAlpha.800"
                fontSize="xs"
                textAlign="center"
                lineHeight="tall"
                noOfLines={3}
                w="100%"
              >
                {award.description}
              </Text>
            </Box>
          </VStack>
        </Box>
      </MotionBox>
    )
  }

  return (
    <MotionBox
      bg="rgba(20, 15, 35, 0.9)"
      backdropFilter={config.isMobile ? 'none' : 'blur(15px)'}
      borderRadius="2xl"
      boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
      overflow="hidden"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.15)"
      initial={{ opacity: 0, y: 15 }}
      animate={controls}
    >
      <Flex
        px={config.padding}
        py={4}
        justify="space-between"
        align="center"
        cursor="pointer"
        onClick={onToggle}
        borderBottom="1px solid"
        borderColor="rgba(255,255,255,0.1)"
        _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
        transition="all 0.2s ease"
      >
        <HStack spacing={4}>
          <MotionBox
            p={3}
            borderRadius="lg"
            bgGradient="linear(to-br, purple.600, pink.600)"
            boxShadow="0 0 20px rgba(168, 85, 247, 0.4)"
            animate={{
              boxShadow: [
                '0 0 20px rgba(168, 85, 247, 0.4)',
                '0 0 30px rgba(168, 85, 247, 0.6)',
                '0 0 20px rgba(168, 85, 247, 0.4)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon as={Award} color="white" boxSize={config.headerIconSize} />
          </MotionBox>
          <VStack align="flex-start" spacing={1}>
            <Heading size={config.headingSize} color="white" fontWeight="bold">
              {t('Team Recognition')}
            </Heading>
            <HStack spacing={3} wrap="wrap">
              <Badge
                colorScheme="blue"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
              >
                <HStack spacing={1}>
                  <Icon as={Users} boxSize={3} />
                  <span>{t('Your Team')}</span>
                </HStack>
              </Badge>
              {hasAnyAward && (
                <Badge
                  colorScheme="purple"
                  variant="solid"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                >
                  <HStack spacing={1}>
                    <Icon as={Trophy} boxSize={3} />
                    <span>
                      {availableAwards.length}{' '}
                      {t('MVP Award', { count: availableAwards.length })}
                    </span>
                  </HStack>
                </Badge>
              )}
              {legendaryPerformers.length > 0 && (
                <Badge
                  colorScheme="yellow"
                  variant="solid"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                >
                  <HStack spacing={1}>
                    <Icon as={Crown} boxSize={3} />
                    <span>
                      {legendaryPerformers.length} {t('Legendary')}
                    </span>
                  </HStack>
                </Badge>
              )}
            </HStack>
          </VStack>
        </HStack>
        <MotionBox
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Icon as={ChevronDown} color="whiteAlpha.700" boxSize={5} />
        </MotionBox>
      </Flex>

      <Collapse in={isExpanded} animateOpacity>
        <Box p={config.padding}>
          <VStack spacing={6} align="stretch">
            {/* MVP Awards Section */}
            {hasAnyAward && (
              <VStack spacing={5} align="stretch">
                <Box>
                  <HStack spacing={3} mb={4}>
                    <Icon as={Award} color="purple.300" boxSize={5} />
                    <Text color="white" fontSize="lg" fontWeight="bold">
                      {t('Team MVP Awards')}
                    </Text>
                  </HStack>
                </Box>

                {/* MVP Cards Grid */}
                <Box>
                  {availableAwards.length === 1 ? (
                    <Flex justify="center">
                      <Box maxW="400px" w="100%">
                        {filteredAwards.matchMVP &&
                          renderMVPCard(filteredAwards.matchMVP, 'matchMVP')}
                        {filteredAwards.teamMVP &&
                          renderMVPCard(filteredAwards.teamMVP, 'teamMVP')}
                        {filteredAwards.pivotalPlayer &&
                          renderMVPCard(
                            filteredAwards.pivotalPlayer,
                            'pivotalPlayer',
                          )}
                      </Box>
                    </Flex>
                  ) : (
                    <Grid
                      templateColumns={`repeat(${gridColumns}, 1fr)`}
                      gap={4}
                    >
                      {filteredAwards.matchMVP && (
                        <GridItem>
                          {renderMVPCard(filteredAwards.matchMVP, 'matchMVP')}
                        </GridItem>
                      )}
                      {filteredAwards.teamMVP && (
                        <GridItem>
                          {renderMVPCard(filteredAwards.teamMVP, 'teamMVP')}
                        </GridItem>
                      )}
                      {filteredAwards.pivotalPlayer && (
                        <GridItem>
                          {renderMVPCard(
                            filteredAwards.pivotalPlayer,
                            'pivotalPlayer',
                          )}
                        </GridItem>
                      )}
                    </Grid>
                  )}
                </Box>
              </VStack>
            )}

            {/* Legendary Performances Section */}
            {legendaryPerformers.length > 0 && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={2} align="center" w="100%">
                  <Icon as={Crown} color="purple.400" boxSize={5} />
                  <Text
                    color="white"
                    fontSize="lg"
                    fontWeight="bold"
                    noOfLines={1}
                  >
                    {t('Legendary Performances')}
                  </Text>
                  <Badge
                    colorScheme="purple"
                    variant="outline"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    ml="auto"
                  >
                    100+ {t('Points')}
                  </Badge>
                </HStack>

                <Box
                  bg="rgba(168, 85, 247, 0.15)"
                  borderRadius="xl"
                  p={4}
                  border="1px solid"
                  borderColor="purple.500"
                >
                  <VStack spacing={3}>
                    {legendaryPerformers.map((performer, index) => (
                      <MotionBox
                        key={performer.user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        w="100%"
                      >
                        <HStack
                          spacing={4}
                          bg="rgba(255,255,255,0.08)"
                          p={3}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="rgba(255,255,255,0.15)"
                          w="100%"
                        >
                          <Avatar
                            size="md"
                            name={
                              performer.user.name || performer.user.inGameName
                            }
                            src={performer.user.pic}
                            border="2px solid"
                            borderColor="purple.400"
                          />
                          <VStack
                            align="flex-start"
                            spacing={1}
                            flex={1}
                            minW="0"
                          >
                            <HStack w="100%" justify="space-between">
                              <Text
                                color="white"
                                fontWeight="bold"
                                fontSize="md"
                                noOfLines={1}
                                title={
                                  performer.user.name ||
                                  performer.user.inGameName
                                }
                              >
                                {performer.user.name ||
                                  performer.user.inGameName}
                              </Text>
                              {performer.wonCategory && (
                                <Tooltip label={t('Won their category')}>
                                  <Icon
                                    as={CheckCircle}
                                    color="green.400"
                                    boxSize={4}
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                            <HStack w="100%" justify="space-between">
                              <Text
                                color="whiteAlpha.700"
                                fontSize="sm"
                                noOfLines={1}
                                title={`${performer.category} • ${
                                  performer.score
                                } ${t('points')}`}
                              >
                                {performer.category} • {performer.score}{' '}
                                {t('points')}
                              </Text>
                              <Badge
                                bgGradient="linear(to-r, purple.500, pink.500)"
                                color="white"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                              >
                                <HStack spacing={1}>
                                  <Icon as={Crown} boxSize={3} />
                                  <span>LEGENDARY</span>
                                </HStack>
                              </Badge>
                            </HStack>
                          </VStack>
                        </HStack>
                      </MotionBox>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            )}

            {/* Enhanced Recognition Summary */}
            <Box
              mt={3}
              p={4}
              bg="rgba(255,255,255,0.03)"
              borderRadius="xl"
              border="1px solid"
              borderColor="rgba(255,255,255,0.1)"
            >
              <VStack spacing={3}>
                <HStack
                  justify="space-between"
                  w="100%"
                  wrap="wrap"
                  spacing={4}
                >
                  <VStack align="flex-start" spacing={1}>
                    <Text
                      color="whiteAlpha.900"
                      fontWeight="medium"
                      fontSize="md"
                    >
                      {t('Enhanced MVP Recognition System')}
                    </Text>
                    <Text color="whiteAlpha.600" fontSize="sm">
                      {t(
                        'Based on strict criteria: team role, category victory, and performance',
                      )}
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={2} wrap="wrap" justify="center" w="100%">
                  <Badge colorScheme="purple" variant="outline" fontSize="xs">
                    100+ = Legendary
                  </Badge>
                  <Badge colorScheme="green" variant="outline" fontSize="xs">
                    75+ = Excellent
                  </Badge>
                  <Badge colorScheme="blue" variant="outline" fontSize="xs">
                    50+ = Good
                  </Badge>
                  <Badge colorScheme="yellow" variant="outline" fontSize="xs">
                    40+ = Average
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Collapse>
    </MotionBox>
  )
}

export default MVPRecognition
