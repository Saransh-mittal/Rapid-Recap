// components/quickClashComponents/team/battleAnalysis/components/TrophyExchangeSummary.jsx

import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  Heading,
  Icon,
  Badge,
  HStack,
  VStack,
  useBreakpointValue,
  Collapse,
  Progress,
  Divider,
} from '@chakra-ui/react'
import { motion, useAnimationControls } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  Calendar,
  Award,
  Zap,
  ChevronDown,
  Info,
  Shield,
  Coins,
  Sparkles,
  Gift,
  Users,
  Target,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)

const BONUS_ICON_MAP = {
  firstDaily: Calendar,
  strongerTeam: Shield,
  comebackWin: Zap,
  allWins: Trophy,
  default: Gift,
}

const BONUS_COLOR_MAP = {
  firstDaily: 'blue',
  strongerTeam: 'purple',
  comebackWin: 'orange',
  allWins: 'green',
  default: 'pink',
}

// Helper to generate a readable default title from a camelCase key
const generateDefaultBonusTitle = key => {
  return (
    key
      .replace(/([A-Z])/g, ' $1') // Add space before capitals
      .replace(/^./, str => str.toUpperCase()) + ' Bonus'
  ) // Capitalize first letter
}

const TrophyExchangeSummary = ({
  battle,
  userTeam,
  userMemberData,
  isExpanded,
  onToggle,
  simplifiedTrophyData, // NEW PROP
}) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimationControls()
  const [countedTrophies, setCountedTrophies] = useState(0)
  const [showBreakdownElements, setShowBreakdownElements] = useState(false)

  const padding = useBreakpointValue({ base: 4, md: 6 })
  const trophyFontSize = useBreakpointValue({
    base: '3xl',
    sm: '3xl',
    md: '4xl',
    lg: '5xl',
  })
  const headerIconSize = useBreakpointValue({ base: 5, sm: 6, md: 7 })
  const bonusIconSize = useBreakpointValue({ base: 3, md: 4 })
  const headingSize = useBreakpointValue({ base: 'md', sm: 'lg', md: 'lg' })
  const isMobileView = useBreakpointValue({ base: true, md: false })

  const trophiesLabelFontSize = useBreakpointValue({
    base: 'md',
    sm: 'lg',
    md: 'xl',
  })
  const impactLabelFontSize = useBreakpointValue({ base: 'xs', sm: 'sm' })
  const impactValueFontSize = useBreakpointValue({ base: 'xs', sm: 'sm' })
  const appliedBonusesLabelFontSize = useBreakpointValue({
    base: 'sm',
    md: 'md',
  })
  const smallBonusBadgeFontSize = useBreakpointValue({ base: 'xs', sm: 'sm' })
  const headerSubBadgeFontSize = useBreakpointValue({ base: 'xs', sm: 'sm' })
  const collapsedLabelFontSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const collapsedValueFontSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const finalShareLabelFontSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const finalShareValueFontSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const infoTextFontSize = useBreakpointValue({ base: 'xs', sm: 'sm' })

  const getTrophyData = () => {
    // Use simplified trophy data if provided
    if (
      simplifiedTrophyData &&
      simplifiedTrophyData.userTrophyChange !== undefined
    ) {
      return {
        trophyChange: simplifiedTrophyData.userTrophyChange,
        isPositive: simplifiedTrophyData.userTrophyChange >= 0,
        bonuses: simplifiedTrophyData.activeBonuses.reduce((acc, bonus) => {
          acc[bonus.key] = { applied: true, amount: bonus.amount }
          return acc
        }, {}),
        percentage: 0, // We'll calculate this differently for simplified data
      }
    }

    // Fallback to original calculation
    if (!battle || !battle.trophyExchange || !userMemberData) {
      return { trophyChange: 0, isPositive: false, bonuses: {}, percentage: 0 }
    }

    const trophyChange = userMemberData.trophyChange || 0
    const isPositive = trophyChange >= 0
    const previousTrophies =
      userMemberData.previousTrophies ||
      (trophyChange > 0 ? trophyChange * 5 : 1000)
    const percentage =
      previousTrophies > 0
        ? Math.abs((trophyChange / previousTrophies) * 100)
        : 0
    return {
      trophyChange,
      isPositive,
      bonuses: battle.trophyExchange.bonuses || {},
      percentage: Math.min(percentage, 100),
    }
  }

  const { trophyChange, isPositive, bonuses, percentage } = getTrophyData()
  const activeBonuses = Object.entries(bonuses)
    .filter(([_, bonusData]) => bonusData && bonusData.applied)
    .map(([key, data]) => ({ key, ...data }))
  const activeBonusCount = activeBonuses.length

  const getTrophyStyle = () => {
    if (trophyChange > 0)
      return {
        color: 'green.400',
        bgColor: 'rgba(72, 187, 120, 0.1)',
        borderColor: 'green.500',
        icon: TrendingUp,
        glow: 'rgba(72, 187, 120, 0.3)',
        gradient: 'linear(135deg, green.500, green.700)',
      }
    if (trophyChange < 0)
      return {
        color: 'red.400',
        bgColor: 'rgba(245, 101, 101, 0.1)',
        borderColor: 'red.500',
        icon: TrendingDown,
        glow: 'rgba(245, 101, 101, 0.3)',
        gradient: 'linear(135deg, red.500, red.700)',
      }
    return {
      color: 'yellow.400',
      bgColor: 'rgba(236, 201, 75, 0.1)',
      borderColor: 'yellow.500',
      icon: Star,
      glow: 'rgba(236, 201, 75, 0.3)',
      gradient: 'linear(135deg, yellow.500, yellow.700)',
    }
  }
  const trophyStyle = getTrophyStyle()

  useEffect(() => {
    controls
      .start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, ease: 'easeOut' },
      })
      .then(() => {
        const duration = 1500
        const frameDuration = 1000 / 60
        const totalFrames = Math.round(duration / frameDuration)
        const easeOutExpo = tParam =>
          tParam === 1 ? 1 : 1 - Math.pow(2, -10 * tParam)
        let frame = 0
        const countTo = trophyChange
        const startVal = 0

        const counter = setInterval(() => {
          frame++
          const progress = easeOutExpo(frame / totalFrames)
          const currentCount = Math.round(
            startVal + (countTo - startVal) * progress,
          )
          setCountedTrophies(currentCount)
          if (frame === totalFrames) {
            clearInterval(counter)
            setShowBreakdownElements(true)
          }
        }, frameDuration)
        return () => clearInterval(counter)
      })
  }, [controls, trophyChange])

  return (
    <Box
      position="relative"
      overflow="hidden"
      bg="rgba(20, 15, 35, 0.7)"
      backdropFilter="blur(15px)"
      borderRadius="2xl"
      boxShadow="0 8px 30px rgba(0, 0, 0, 0.25)"
      border="1px solid"
      borderColor="rgba(255,255,255,0.1)"
    >
      <Flex
        px={padding}
        py={4}
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        onClick={onToggle}
        borderBottom="1px solid"
        borderColor="rgba(255,255,255,0.08)"
        _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
        position="relative"
      >
        <HStack spacing={3.5} zIndex={1}>
          <MotionBox
            p={2.5}
            borderRadius="lg"
            bgGradient={trophyStyle.gradient}
            boxShadow={`0 2px 10px ${trophyStyle.glow}`}
          >
            <Icon
              as={trophyStyle.icon}
              color="white"
              boxSize={headerIconSize - 1}
            />
          </MotionBox>
          <VStack align="flex-start" spacing={0}>
            <Heading size={headingSize} color="white" fontWeight="semibold">
              {t('Trophy Exchange')}
            </Heading>
            <HStack spacing={1.5}>
              <Badge
                colorScheme={trophyStyle.color.split('.')[0]}
                variant="subtle"
                fontSize={headerSubBadgeFontSize}
                px={1.5}
                borderRadius="sm"
              >
                {isPositive
                  ? t('GAINED')
                  : trophyChange === 0
                  ? t('NO CHANGE')
                  : t('LOST')}
              </Badge>
              {activeBonusCount > 0 && (
                <Badge
                  colorScheme="purple"
                  variant="solid"
                  fontSize={headerSubBadgeFontSize}
                  px={1.5}
                  borderRadius="sm"
                >
                  <HStack spacing={0.5}>
                    <Icon
                      as={Sparkles}
                      boxSize={headerSubBadgeFontSize === 'xs' ? 2.5 : 3}
                    />
                    <span>
                      {activeBonusCount}{' '}
                      {t('BONUS', { count: activeBonusCount })}
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
          zIndex={1}
        >
          <Icon as={ChevronDown} color="whiteAlpha.700" boxSize={5} />
        </MotionBox>
      </Flex>

      <Box
        p={padding}
        borderBottom={isExpanded ? '1px solid' : '0'}
        borderColor="rgba(255,255,255,0.08)"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          gap={{ base: 4, md: 6 }}
        >
          <VStack
            spacing={3}
            flex={1}
            alignItems={{ base: 'center', md: 'flex-start' }}
          >
            <HStack spacing={2.5} align="baseline">
              <MotionText
                fontSize={trophyFontSize}
                fontWeight="black"
                color={trophyStyle.color}
                textShadow={`0 0 15px ${trophyStyle.glow}`}
              >
                {countedTrophies >= 0 ? `+${countedTrophies}` : countedTrophies}
              </MotionText>
              <Text
                fontSize={trophiesLabelFontSize}
                color="whiteAlpha.800"
                fontWeight="medium"
                pb={1}
              >
                {t('Trophies')}
              </Text>
            </HStack>
            {showBreakdownElements && percentage > 0 && (
              <MotionBox
                w="full"
                maxW="280px"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Progress
                  value={percentage}
                  size="xs"
                  colorScheme={trophyStyle.color.split('.')[0]}
                  borderRadius="full"
                  bg="whiteAlpha.200"
                  sx={{ '& > div': { background: trophyStyle.gradient } }}
                />
                <HStack justify="space-between" mt={1}>
                  <Text fontSize={impactLabelFontSize} color="whiteAlpha.600">
                    {t('Previous Trophies Impact')}
                  </Text>
                  <Text
                    fontSize={impactValueFontSize}
                    color={trophyStyle.color}
                    fontWeight="semibold"
                  >
                    {percentage.toFixed(1)}%
                  </Text>
                </HStack>
              </MotionBox>
            )}
          </VStack>

          {showBreakdownElements && activeBonusCount > 0 && (
            <VStack
              spacing={2}
              align={{ base: 'center', md: 'flex-end' }}
              minW={{ base: 'full', md: '220px' }}
            >
              <Text
                fontSize={appliedBonusesLabelFontSize}
                color="whiteAlpha.700"
                fontWeight="medium"
              >
                {t('Applied Bonuses')}:
              </Text>
              <HStack
                spacing={2}
                wrap="wrap"
                justifyContent={{ base: 'center', md: 'flex-end' }}
              >
                {activeBonuses.slice(0, isMobileView ? 2 : 3).map(bonus => (
                  <MotionBadge
                    key={bonus.key}
                    bg={`rgba(${(() => {
                      const colorName =
                        BONUS_COLOR_MAP[bonus.key] || BONUS_COLOR_MAP.default
                      if (colorName === 'blue') return '59,130,246'
                      if (colorName === 'purple') return '139,92,246'
                      if (colorName === 'orange') return '249,115,22'
                      if (colorName === 'green') return '16,185,129'
                      if (colorName === 'pink') return '236,72,153'
                      return '107,114,128'
                    })()},0.8)`}
                    color="white"
                    py={1}
                    px={2}
                    borderRadius="md"
                    fontSize={smallBonusBadgeFontSize}
                    fontWeight="semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + Math.random() * 0.3 }}
                  >
                    <HStack spacing={1}>
                      <Icon
                        as={BONUS_ICON_MAP[bonus.key] || BONUS_ICON_MAP.default}
                        boxSize={bonusIconSize - 1}
                      />
                      <span>+{bonus.amount}</span>
                    </HStack>
                  </MotionBadge>
                ))}
                {activeBonuses.length > (isMobileView ? 2 : 3) && (
                  <Badge
                    colorScheme="gray"
                    variant="outline"
                    fontSize={smallBonusBadgeFontSize}
                    px={1.5}
                    py={0.5}
                  >
                    +{activeBonuses.length - (isMobileView ? 2 : 3)} more
                  </Badge>
                )}
              </HStack>
            </VStack>
          )}
        </Flex>
      </Box>

      <Collapse in={isExpanded} animateOpacity>
        <Box p={padding} bg="rgba(255,255,255,0.01)" backdropFilter="blur(5px)">
          <VStack spacing={4} align="stretch">
            <VStack
              spacing={3}
              align="stretch"
              bg="whiteAlpha.50"
              borderRadius="lg"
              p={3}
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              {/* Only show bonuses if they exist */}
              {activeBonuses.length > 0 && (
                <>
                  <Text
                    fontSize="md"
                    color="whiteAlpha.900"
                    fontWeight="bold"
                    textAlign="center"
                    mb={2}
                  >
                    {t('Applied Bonuses')}
                  </Text>
                  {activeBonuses.map(bonusDetail => {
                    const iconToUse =
                      BONUS_ICON_MAP[bonusDetail.key] || BONUS_ICON_MAP.default
                    const colorScheme =
                      BONUS_COLOR_MAP[bonusDetail.key] ||
                      BONUS_COLOR_MAP.default
                    const titleText = t(`bonusTitle.${bonusDetail.key}`, {
                      defaultValue: generateDefaultBonusTitle(bonusDetail.key),
                    })

                    return (
                      <Flex
                        key={bonusDetail.key}
                        justify="space-between"
                        align="center"
                        bg={`rgba(${(() => {
                          const colorName = colorScheme
                          if (colorName === 'blue') return '59,130,246'
                          if (colorName === 'purple') return '139,92,246'
                          if (colorName === 'orange') return '249,115,22'
                          if (colorName === 'green') return '16,185,129'
                          if (colorName === 'pink') return '236,72,153'
                          return '107,114,128'
                        })()},0.1)`}
                        p={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={`${colorScheme}.600`}
                      >
                        <HStack spacing={3}>
                          <Icon
                            as={iconToUse}
                            color={`${colorScheme}.400`}
                            boxSize={5}
                          />
                          <VStack align="flex-start" spacing={0.5}>
                            <Text
                              fontSize={collapsedLabelFontSize}
                              color="white"
                              fontWeight="medium"
                            >
                              {titleText}
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.700">
                              {t(`bonusDescription.${bonusDetail.key}`, {
                                defaultValue: t('Special performance bonus'),
                              })}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge
                          colorScheme={colorScheme}
                          variant="solid"
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontWeight="bold"
                        >
                          +{bonusDetail.amount} {t('trophies')}
                        </Badge>
                      </Flex>
                    )
                  })}
                  <Divider borderColor="whiteAlpha.200" my={2} />
                </>
              )}

              {/* Team Trophy Distribution */}
              <VStack spacing={3} align="stretch">
                <Text
                  fontSize="md"
                  color="whiteAlpha.900"
                  fontWeight="bold"
                  textAlign="center"
                >
                  {t('Team Trophy Distribution')}
                </Text>

                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Icon as={Users} color="blue.400" boxSize={4.5} />
                    <Text
                      fontSize={finalShareLabelFontSize}
                      color="white"
                      fontWeight="medium"
                    >
                      {t('Total Team Exchange')}
                    </Text>
                  </HStack>
                  <Text
                    fontSize={finalShareValueFontSize}
                    color="blue.300"
                    fontWeight="bold"
                  >
                    {battle.trophyExchange?.finalAmount >= 0
                      ? `+${battle.trophyExchange?.finalAmount}`
                      : battle.trophyExchange?.finalAmount || 0}{' '}
                    {t('trophies')}
                  </Text>
                </Flex>

                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Icon as={Trophy} color={trophyStyle.color} boxSize={4.5} />
                    <Text
                      fontSize={finalShareLabelFontSize}
                      color="white"
                      fontWeight="bold"
                    >
                      {t('Your Share')}
                    </Text>
                  </HStack>
                  <Text
                    fontSize={finalShareValueFontSize}
                    color={trophyStyle.color}
                    fontWeight="bold"
                    textShadow={`0 0 8px ${trophyStyle.glow}`}
                  >
                    {trophyChange >= 0 ? `+${trophyChange}` : trophyChange}{' '}
                    {t('trophies')}
                  </Text>
                </Flex>

                {battle.trophyExchange?.perPlayerAmount &&
                  battle.trophyExchange.perPlayerAmount !== trophyChange && (
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Icon as={Target} color="yellow.400" boxSize={4} />
                        <Text fontSize="sm" color="whiteAlpha.800">
                          {t('Base Per Player')}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        color="yellow.300"
                        fontWeight="medium"
                      >
                        {battle.trophyExchange.perPlayerAmount >= 0
                          ? `+${battle.trophyExchange.perPlayerAmount}`
                          : battle.trophyExchange.perPlayerAmount}{' '}
                        {t('trophies')}
                      </Text>
                    </Flex>
                  )}
              </VStack>
            </VStack>

            <Box
              bg="rgba(139, 92, 246, 0.05)"
              border="1px dashed"
              borderColor="purple.500"
              borderRadius="lg"
              p={3}
            >
              <HStack spacing={2.5}>
                <Icon as={Info} color="purple.400" boxSize={4} />
                <Text fontSize={infoTextFontSize} color="whiteAlpha.700">
                  {activeBonuses.length > 0
                    ? t(
                        'Your trophy change includes performance bonuses and team contribution adjustments.',
                      )
                    : t(
                        'Your trophy change is based on team performance and individual contribution.',
                      )}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  )
}

export default TrophyExchangeSummary
