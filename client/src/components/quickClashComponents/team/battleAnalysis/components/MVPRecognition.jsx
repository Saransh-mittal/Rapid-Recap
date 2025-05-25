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
  useBreakpointValue,
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
  Target,
  TrendingUp,
  Sparkles,
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
    glowColor: 'rgba(168, 85, 247, 0.4)',
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
    glowColor: 'rgba(34, 197, 94, 0.4)',
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
    glowColor: 'rgba(245, 158, 11, 0.4)',
    borderColor: 'orange.400',
    tier: 'A+',
    celebrationColor: '#F59E0B',
  },
}

const MVPRecognition = ({ mvpAwards, userTeam, isExpanded, onToggle }) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimationControls()

  const padding = useBreakpointValue({ base: 4, md: 6 })
  const headerIconSize = useBreakpointValue({ base: 6, md: 7 })
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const avatarSize = useBreakpointValue({ base: 'lg', md: 'xl' })

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
  const gridColumns = useBreakpointValue({
    base: 1,
    md: availableAwards.length === 1 ? 1 : 2,
  })

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    })

    // Celebration effect for legendary performances
    if (legendaryPerformers.length > 0) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#A855F7', '#EC4899', '#FBBF24'],
          shapes: ['star'],
          scalar: 0.8,
        })
      }, 1000)
    }
  }, [controls, legendaryPerformers.length])

  // Don't render if no awards for user's team
  if (!hasAnyAward && legendaryPerformers.length === 0) {
    return null
  }

  const renderMVPCard = (award, type) => {
    if (!award) return null

    const config = MVP_CONFIGS[type]

    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        whileHover={{ y: -4, boxShadow: `0 10px 25px ${config.glowColor}` }}
        h="100%" // Ensure full height
      >
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="xl"
          bg="rgba(10, 5, 20, 0.8)"
          backdropFilter="blur(15px)"
          border="2px solid"
          borderColor={config.borderColor}
          p={5}
          boxShadow={`0 8px 20px ${config.glowColor}`}
          h="100%" // Full height
          display="flex"
          flexDirection="column"
        >
          {/* Animated background */}
          <MotionBox
            position="absolute"
            inset={0}
            bgGradient={config.bgGradient}
            opacity={0.15}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Tier badge */}
          <Badge
            position="absolute"
            top={3}
            right={3}
            bgGradient={config.gradient}
            color="white"
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
          >
            {config.tier}
          </Badge>

          {/* Team badge */}
          <Badge
            position="absolute"
            top={3}
            left={3}
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
            spacing={4}
            position="relative"
            zIndex={1}
            pt={4}
            flex={1}
            justify="space-between"
          >
            {/* Header Section */}
            <VStack spacing={2}>
              <Circle
                size="60px"
                bgGradient={config.gradient}
                boxShadow={`0 0 20px ${config.glowColor}`}
              >
                <Icon as={config.icon} color="white" boxSize={7} />
              </Circle>
              <Text
                color={`${config.color}.300`}
                fontSize="lg"
                fontWeight="bold"
                textAlign="center"
                noOfLines={1}
              >
                {t(config.title)}
              </Text>
            </VStack>

            {/* Player Info Section */}
            <VStack spacing={3} w="100%">
              <Avatar
                size={avatarSize}
                name={award.user.name || award.user.inGameName}
                src={award.user.pic}
                border="3px solid"
                borderColor={config.borderColor}
                boxShadow={`0 0 15px ${config.glowColor}`}
              />

              <Text
                color="white"
                fontSize="lg"
                fontWeight="bold"
                textAlign="center"
                noOfLines={1}
                w="100%"
              >
                {award.user.name || award.user.inGameName}
              </Text>
            </VStack>

            {/* Stats Section - Fixed Height */}
            <VStack spacing={2} w="100%" minH="120px" justify="center">
              <HStack justify="space-between" w="100%">
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Score')}
                </Text>
                <Text
                  color={`${config.color}.300`}
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
                  {award.category || 'N/A'}
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
      bg="rgba(20, 15, 35, 0.8)"
      backdropFilter="blur(15px)"
      borderRadius="2xl"
      boxShadow="0 8px 30px rgba(0, 0, 0, 0.25)"
      overflow="hidden"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.1)"
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
    >
      <Flex
        px={padding}
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
            boxShadow="0 0 20px rgba(168, 85, 247, 0.4)"
            animate={{
              boxShadow: [
                '0 0 20px rgba(168, 85, 247, 0.4)',
                '0 0 30px rgba(168, 85, 247, 0.6)',
                '0 0 20px rgba(168, 85, 247, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon as={Award} color="white" boxSize={headerIconSize} />
          </MotionBox>
          <VStack align="flex-start" spacing={0.5}>
            <Heading size={headingSize} color="white" fontWeight="bold">
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
        <Box p={padding}>
          <VStack spacing={6} align="stretch">
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
                    // Multiple cards - grid
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

            {/* Legendary Performances - Compact */}
            {legendaryPerformers.length > 0 && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={2}>
                  <Icon as={Crown} color="purple.400" boxSize={5} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {t('Legendary Performances')}
                  </Text>
                  <Badge colorScheme="purple" variant="outline" fontSize="xs">
                    100+ {t('Points')}
                  </Badge>
                </HStack>
                <Box
                  bg="rgba(168, 85, 247, 0.1)"
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
                          bg="rgba(255,255,255,0.05)"
                          p={3}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="rgba(255,255,255,0.1)"
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
                          <VStack align="flex-start" spacing={0.5} flex={1}>
                            <Text color="white" fontWeight="bold" fontSize="md">
                              {performer.user.name || performer.user.inGameName}
                            </Text>
                            <Text color="whiteAlpha.700" fontSize="sm">
                              {performer.category} • {performer.score}{' '}
                              {t('points')}
                            </Text>
                          </VStack>
                          <Badge
                            bgGradient="linear(to-r, purple.500, pink.500)"
                            color="white"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            <HStack spacing={1}>
                              <Icon as={Crown} boxSize={3} />
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
              mt={4}
              p={4}
              bg="rgba(255,255,255,0.02)"
              borderRadius="xl"
              border="1px solid"
              borderColor="rgba(255,255,255,0.1)"
            >
              <HStack justify="space-between" wrap="wrap" spacing={4}>
                <VStack align="flex-start" spacing={1}>
                  <Text color="whiteAlpha.900" fontWeight="medium">
                    {t('Team Recognition System')}
                  </Text>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {t('Showing awards for your team members only')}
                  </Text>
                </VStack>
                <HStack spacing={3} wrap="wrap">
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
