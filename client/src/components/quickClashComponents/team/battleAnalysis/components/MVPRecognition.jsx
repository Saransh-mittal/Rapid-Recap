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
    glowColor: 'rgba(168, 85, 247, 0.3)', // Reduced opacity
    borderColor: 'purple.400',
    tier: 'S+',
    celebrationColor: '#A855F7',
  },
  teamMVP: {
    title: 'Team MVP',
    icon: Trophy,
    color: 'green',
    gradient: 'linear(135deg, #22C55E, #10B981)',
    bgGradient: 'linear(to-br, green.600, green.800)',
    glowColor: 'rgba(34, 197, 94, 0.3)', // Reduced opacity
    borderColor: 'green.400',
    tier: 'S',
    celebrationColor: '#22C55E',
  },
  pivotalPlayer: {
    title: 'Pivotal Player',
    icon: Zap,
    color: 'orange',
    gradient: 'linear(135deg, #F59E0B, #D97706)',
    bgGradient: 'linear(to-br, orange.600, orange.800)',
    glowColor: 'rgba(245, 158, 11, 0.3)', // Reduced opacity
    borderColor: 'orange.400',
    tier: 'A+',
    celebrationColor: '#F59E0B',
  },
}

const MVPRecognition = ({ mvpAwards, userTeam, isExpanded, onToggle }) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimationControls()

  // Memoized responsive configuration - static values for performance
  const config = useMemo(
    () => ({
      isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
      padding: { base: 3, md: 5 }, // Reduced padding
      headerIconSize: { base: 5, md: 6 }, // Reduced sizes
      headingSize: { base: 'md', md: 'lg' }, // Reduced sizes
      avatarSize:
        typeof window !== 'undefined' && window.innerWidth < 768 ? 'md' : 'lg',
    }),
    [],
  )

  // FILTER AWARDS TO ONLY SHOW USER'S TEAM MEMBERS
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

    // Only show Team MVP if they're on user's team (this would be rare since Team MVP is usually opponent team)
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

  // Dynamic grid columns based on number of awards (max 2)
  const gridColumns = config.isMobile ? 1 : availableAwards.length === 1 ? 1 : 2

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }, // Reduced duration
    })

    // Simplified celebration effect for legendary performances - only on desktop
    if (legendaryPerformers.length > 0 && !config.isMobile) {
      setTimeout(() => {
        confetti({
          particleCount: 25, // Reduced from 50
          spread: 45, // Reduced spread
          origin: { y: 0.8 },
          colors: ['#A855F7', '#EC4899', '#FBBF24'],
          shapes: ['star'],
          scalar: 0.6, // Reduced size
        })
      }, 800) // Faster trigger
    }
  }, [controls, legendaryPerformers.length, config.isMobile])

  // Don't render if no awards for user's team
  if (!hasAnyAward && legendaryPerformers.length === 0) {
    return null
  }

  const renderMVPCard = (award, type) => {
    if (!award) return null

    const mvpConfig = MVP_CONFIGS[type]

    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.95, y: 15 }} // Reduced animation
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 120 }} // Simplified spring
        whileHover={
          config.isMobile
            ? {}
            : { y: -2, boxShadow: `0 8px 20px ${mvpConfig.glowColor}` }
        } // Reduced hover effect
        h="100%" // Ensure full height
      >
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="xl"
          bg="rgba(10, 5, 20, 0.8)"
          backdropFilter={config.isMobile ? 'none' : 'blur(10px)'} // No blur on mobile
          border="2px solid"
          borderColor={mvpConfig.borderColor}
          p={4} // Reduced padding
          boxShadow={
            config.isMobile
              ? `0 6px 15px ${mvpConfig.glowColor}`
              : `0 8px 20px ${mvpConfig.glowColor}` // Reduced shadow
          }
          h="100%" // Full height
          display="flex"
          flexDirection="column"
        >
          {/* Simplified animated background - only on desktop */}
          {!config.isMobile && (
            <MotionBox
              position="absolute"
              inset={0}
              bgGradient={mvpConfig.bgGradient}
              opacity={0.12} // Reduced opacity
              animate={{ opacity: [0.1, 0.15, 0.1] }} // Reduced animation
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} // Slower
            />
          )}

          {/* Tier badge */}
          <Badge
            position="absolute"
            top={2} // Reduced position
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

          {/* Team badge */}
          <Badge
            position="absolute"
            top={2} // Reduced position
            left={2}
            colorScheme="blue"
            variant="solid"
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="full"
          >
            {t('Your Team')}
          </Badge>

          <VStack
            spacing={3} // Reduced spacing
            position="relative"
            zIndex={1}
            pt={3} // Reduced padding
            flex={1}
            justify="space-between"
          >
            {/* Header Section */}
            <VStack spacing={2}>
              <Circle
                size="50px" // Reduced from 60px
                bgGradient={mvpConfig.gradient}
                boxShadow={
                  config.isMobile
                    ? `0 0 15px ${mvpConfig.glowColor}`
                    : `0 0 20px ${mvpConfig.glowColor}` // Reduced shadow
                }
              >
                <Icon as={mvpConfig.icon} color="white" boxSize={6} />{' '}
                {/* Reduced size */}
              </Circle>
              <Text
                color={`${mvpConfig.color}.300`}
                fontSize="md" // Reduced from lg
                fontWeight="bold"
                textAlign="center"
                noOfLines={1}
              >
                {t(mvpConfig.title)}
              </Text>
            </VStack>

            {/* Player Info Section */}
            <VStack spacing={2.5} w="100%">
              {' '}
              {/* Reduced spacing */}
              <Avatar
                size={config.avatarSize}
                name={award.user.name || award.user.inGameName}
                src={award.user.pic}
                border="3px solid"
                borderColor={mvpConfig.borderColor}
                boxShadow={
                  config.isMobile
                    ? `0 0 12px ${mvpConfig.glowColor}`
                    : `0 0 15px ${mvpConfig.glowColor}` // Reduced shadow
                }
              />
              <Text
                color="white"
                fontSize="md" // Reduced from lg
                fontWeight="bold"
                textAlign="center"
                noOfLines={1}
                w="100%"
              >
                {award.user.name || award.user.inGameName}
              </Text>
            </VStack>

            {/* Stats Section - Fixed Height */}
            <VStack spacing={2} w="100%" minH="100px" justify="center">
              {' '}
              {/* Reduced spacing and height */}
              <HStack justify="space-between" w="100%">
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Score')}
                </Text>
                <Text
                  color={`${mvpConfig.color}.300`}
                  fontSize="lg"
                  fontWeight="bold"
                >
                  {award.score}
                </Text>
              </HStack>
              <HStack justify="space-between" w="100%">
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Category')}
                </Text>
                <Text
                  color="whiteAlpha.900"
                  fontSize="sm"
                  fontWeight="medium"
                  noOfLines={1}
                >
                  {award.category.toUpperCase() || 'N/A'}
                </Text>
              </HStack>
              {award.difference && (
                <HStack justify="space-between" w="100%">
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {t('Margin')}
                  </Text>
                  <Text color="orange.300" fontSize="sm" fontWeight="bold">
                    +{award.difference}
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Description Section - Fixed Height */}
            <Box
              bg="rgba(255,255,255,0.05)"
              borderRadius="md"
              p={3}
              w="100%"
              border="1px solid"
              borderColor="rgba(255,255,255,0.1)"
              minH="55px" // Reduced height
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
      bg="rgba(20, 15, 35, 0.8)"
      backdropFilter={config.isMobile ? 'none' : 'blur(10px)'} // No blur on mobile
      borderRadius="2xl"
      boxShadow={
        config.isMobile
          ? '0 6px 20px rgba(0, 0, 0, 0.2)'
          : '0 8px 25px rgba(0, 0, 0, 0.25)' // Reduced shadow
      }
      overflow="hidden"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.1)"
      initial={{ opacity: 0, y: 15 }} // Reduced movement
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
        borderColor="rgba(255,255,255,0.08)"
        _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
      >
        <HStack spacing={3.5}>
          <MotionBox
            p={2.5}
            borderRadius="lg"
            bgGradient="linear(to-br, purple.600, pink.600)"
            boxShadow={
              config.isMobile
                ? '0 0 15px rgba(168, 85, 247, 0.3)'
                : '0 0 20px rgba(168, 85, 247, 0.4)' // Reduced shadow
            }
            animate={
              config.isMobile
                ? {}
                : {
                    boxShadow: [
                      '0 0 20px rgba(168, 85, 247, 0.4)',
                      '0 0 25px rgba(168, 85, 247, 0.5)', // Reduced max glow
                      '0 0 20px rgba(168, 85, 247, 0.4)',
                    ],
                  }
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} // Slower
          >
            <Icon as={Award} color="white" boxSize={config.headerIconSize} />
          </MotionBox>
          <VStack align="flex-start" spacing={0.5}>
            <Heading size={config.headingSize} color="white" fontWeight="bold">
              {t('Team Recognition')}
            </Heading>
            <HStack spacing={2}>
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
          <VStack spacing={config.isMobile ? 4 : 5} align="stretch">
            {' '}
            {/* Adjusted spacing */}
            {/* MVP Awards Section */}
            {hasAnyAward && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={2}>
                  <Icon as={Award} color="purple.300" boxSize={5} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {t('Team MVP Awards')}
                  </Text>
                </HStack>

                {/* Optimized Grid for 1-2 cards */}
                <Box>
                  {availableAwards.length === 1 ? (
                    // Single card - centered
                    <Flex justify="center">
                      <Box maxW="350px" w="100%">
                        {' '}
                        {/* Reduced max width */}
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
                    // Multiple cards - grid
                    <Grid
                      templateColumns={`repeat(${gridColumns}, 1fr)`}
                      gap={3} // Reduced gap
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
            {/* Legendary Performances - Compact */}
            {legendaryPerformers.length > 0 && (
              <VStack spacing={config.isMobile ? 3 : 4} align="stretch">
                {' '}
                {/* Adjusted spacing */}
                <HStack
                  spacing={config.isMobile ? 1.5 : 2}
                  align="center"
                  w="100%"
                >
                  <Icon
                    as={Crown}
                    color="purple.400"
                    boxSize={config.isMobile ? 4 : 5}
                  />
                  <Text
                    color="white"
                    fontSize={config.isMobile ? 'md' : 'lg'}
                    fontWeight="bold"
                    noOfLines={1}
                  >
                    {t('Legendary Performances')}
                  </Text>
                  <Badge
                    colorScheme="purple"
                    variant="outline"
                    fontSize="xs"
                    px={config.isMobile ? 1.5 : 2}
                    py={config.isMobile ? 0.5 : 'auto'}
                    ml="auto"
                  >
                    100+ {config.isMobile ? t('Pts') : t('Points')}
                  </Badge>
                </HStack>
                <Box
                  bg="rgba(168, 85, 247, 0.1)"
                  borderRadius="xl"
                  p={config.isMobile ? 3 : 4} // Adjusted padding
                  border="1px solid"
                  borderColor="purple.500"
                >
                  <VStack spacing={config.isMobile ? 2 : 3}>
                    {' '}
                    {/* Adjusted spacing */}
                    {legendaryPerformers.map((performer, index) => (
                      <MotionBox
                        key={performer.user._id}
                        initial={{ opacity: 0, x: -15 }} // Reduced movement
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }} // Faster
                        w="100%"
                      >
                        <HStack
                          spacing={config.isMobile ? 2 : 4} // Adjusted spacing
                          bg="rgba(255,255,255,0.05)"
                          p={config.isMobile ? 2 : 3} // Adjusted padding
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="rgba(255,255,255,0.1)"
                          w="100%"
                        >
                          <Avatar
                            size={config.isMobile ? 'sm' : 'md'} // Adjusted size
                            name={
                              performer.user.name || performer.user.inGameName
                            }
                            src={performer.user.pic}
                            border="2px solid"
                            borderColor="purple.400"
                          />
                          <VStack
                            align="flex-start"
                            spacing={0.5}
                            flex={1}
                            minW="0"
                          >
                            {' '}
                            {/* Added minW="0" */}
                            <Text
                              color="white"
                              fontWeight="bold"
                              fontSize={config.isMobile ? 'sm' : 'md'} // Adjusted size
                              noOfLines={1}
                              title={
                                performer.user.name || performer.user.inGameName
                              }
                            >
                              {performer.user.name || performer.user.inGameName}
                            </Text>
                            <Text
                              color="whiteAlpha.700"
                              fontSize={config.isMobile ? 'xs' : 'sm'} // Adjusted size
                              noOfLines={1}
                              title={`${performer.category} • ${
                                performer.score
                              } ${t('points')}`}
                            >
                              {performer.category} • {performer.score}{' '}
                              {t('points')}
                            </Text>
                          </VStack>
                          <Badge
                            bgGradient="linear(to-r, purple.500, pink.500)"
                            color="white"
                            px={config.isMobile ? 2 : 3} // Adjusted padding
                            py={1}
                            borderRadius="full"
                            fontSize={config.isMobile ? 'xs' : 'sm'} // Adjusted size
                            fontWeight="bold"
                          >
                            <HStack spacing={1}>
                              <Icon
                                as={Crown}
                                boxSize={config.isMobile ? 2.5 : 3}
                              />{' '}
                              {/* Adjusted size */}
                              <span>LEGENDARY</span>
                            </HStack>
                          </Badge>
                        </HStack>
                      </MotionBox>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            )}
            {/* Recognition Summary */}
            <Box
              mt={config.isMobile ? 2 : 3} // Adjusted margin
              p={config.isMobile ? 3 : 4} // Adjusted padding
              bg="rgba(255,255,255,0.02)"
              borderRadius="xl"
              border="1px solid"
              borderColor="rgba(255,255,255,0.1)"
            >
              <HStack
                justify="space-between"
                wrap="wrap"
                spacing={config.isMobile ? 2 : 4}
                rowGap={config.isMobile ? 3 : 'auto'}
              >
                <VStack align="flex-start" spacing={config.isMobile ? 0.5 : 1}>
                  <Text
                    color="whiteAlpha.900"
                    fontWeight="medium"
                    fontSize={config.isMobile ? 'sm' : 'md'}
                  >
                    {t('Team Recognition System')}
                  </Text>
                  <Text
                    color="whiteAlpha.600"
                    fontSize={config.isMobile ? 'xs' : 'sm'}
                  >
                    {t('Showing awards for your team members only')}
                  </Text>
                </VStack>
                <HStack
                  spacing={config.isMobile ? 1.5 : 2}
                  wrap="wrap"
                  rowGap={config.isMobile ? 1.5 : 'auto'}
                  justify={config.isMobile ? 'flex-start' : 'flex-end'}
                >
                  {' '}
                  {/* Reduced spacing */}
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
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Collapse>
    </MotionBox>
  )
}

export default MVPRecognition
