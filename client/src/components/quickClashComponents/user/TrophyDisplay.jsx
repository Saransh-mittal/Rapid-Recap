// components/quickClashComponents/user/TrophyDisplay.jsx
import React, { useEffect, useRef, useCallback, useMemo, memo } from 'react'
import {
  Flex,
  Icon,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  HStack,
  VStack,
  Box,
  Tooltip,
  Spinner,
  Badge,
  useBreakpointValue,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  BarChart,
  Zap,
  Users,
  Shield,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCombinedTrophyHistory } from '../../../redux/quickClashSlice'
import TrophyAnimation from '../animations/TrophyAnimation'

const MotionFlex = motion(Flex)
const MotionIcon = motion(Icon)
const MotionText = motion(Text)

// Memoized sub-components for better performance
const TrophyIcon = memo(({ shouldReduceMotion, iconSize, iconColor }) => {
  const baseAnimation = shouldReduceMotion
    ? {}
    : {
        rotate: [0, 5, 0, -5, 0],
        scale: [1, 1.1, 1],
      }

  const baseTransition = shouldReduceMotion
    ? {}
    : {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 4,
      }

  return (
    <MotionIcon
      as={Trophy}
      color={iconColor}
      boxSize={iconSize}
      mr={{ base: 1, md: 2 }}
      animate={baseAnimation}
      transition={baseTransition}
      zIndex={1}
      filter="drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))"
    />
  )
})

TrophyIcon.displayName = 'TrophyIcon'

const TrophyHistoryItem = memo(({ entry, index, t, isMobile }) => {
  // Memoized calculations
  const getBattleModeIcon = useCallback(entry => {
    if (entry.type === 'team') return Users
    if (entry.result === 'win') return TrendingUp
    if (entry.result === 'loss') return TrendingDown
    return Trophy
  }, [])

  const getResultColor = useCallback(entry => {
    if (entry.result === 'win') return 'green.400'
    if (entry.result === 'loss') return 'red.400'
    return 'yellow.400'
  }, [])

  const getOpponentDisplayName = useCallback(
    entry => {
      if (entry.type === 'team') {
        return entry.opponent?.name || t('Unknown Team')
      }
      return entry.opponent?.inGameName || entry.opponent?.name || t('Unknown')
    },
    [t],
  )

  const getBattleDescription = useCallback(
    entry => {
      const opponentName = getOpponentDisplayName(entry)

      if (entry.type === 'team') {
        if (entry.result === 'win')
          return `${t('Team Victory vs')} ${opponentName}`
        if (entry.result === 'loss')
          return `${t('Team Defeat vs')} ${opponentName}`
        return `${t('Team Tie vs')} ${opponentName}`
      }

      if (entry.result === 'win') return `${t('Victory vs')} ${opponentName}`
      if (entry.result === 'loss') return `${t('Defeat vs')} ${opponentName}`
      return `${t('Tie vs')} ${opponentName}`
    },
    [getOpponentDisplayName, t],
  )

  const battleModeIcon = useMemo(
    () => getBattleModeIcon(entry),
    [entry, getBattleModeIcon],
  )
  const resultColor = useMemo(
    () => getResultColor(entry),
    [entry, getResultColor],
  )
  const battleDescription = useMemo(
    () => getBattleDescription(entry),
    [entry, getBattleDescription],
  )

  return (
    <Flex
      justify="space-between"
      align="center"
      p={{ base: 2, md: 2 }}
      borderRadius="md"
      bg={index % 2 === 0 ? 'rgba(30, 30, 45, 0.6)' : 'transparent'}
      position="relative"
      minH={{ base: '44px', md: 'auto' }} // Larger touch targets on mobile
    >
      <HStack spacing={{ base: 1, md: 2 }} flex={1}>
        {/* Battle mode badge */}
        <Badge
          colorScheme={entry.type === 'team' ? 'blue' : 'purple'}
          fontSize={{ base: '2xs', md: '2xs' }}
          px={{ base: 1, md: 1 }}
          py={0.5}
          borderRadius="sm"
        >
          {entry.mode}
        </Badge>

        {/* Result icon */}
        <Icon
          as={battleModeIcon}
          color={resultColor}
          boxSize={{ base: 3, md: 4 }}
        />

        {/* Battle description */}
        <VStack spacing={0} align="start" flex={1}>
          <Text
            color="whiteAlpha.800"
            fontSize={{ base: '2xs', md: 'xs' }}
            lineHeight="1.2"
            noOfLines={{ base: 2, md: 1 }}
          >
            {battleDescription}
          </Text>

          {/* Additional info for team battles - simplified on mobile */}
          {entry.type === 'team' && !isMobile && (
            <HStack spacing={1}>
              {entry.bonusesApplied?.strongerTeam && (
                <Tooltip label={t('Stronger Team Bonus')}>
                  <Icon as={TrendingUp} color="green.400" boxSize={2} />
                </Tooltip>
              )}
              {entry.bonusesApplied?.allWins && (
                <Tooltip label={t('All Wins Bonus')}>
                  <Icon as={Trophy} color="yellow.400" boxSize={2} />
                </Tooltip>
              )}
              {entry.protectionUsed && (
                <Tooltip label={t('Protection Applied')}>
                  <Icon as={Shield} color="blue.400" boxSize={2} />
                </Tooltip>
              )}
            </HStack>
          )}
        </VStack>
      </HStack>

      {/* Trophy change */}
      <Text
        color={
          entry.trophiesChange > 0
            ? 'green.400'
            : entry.trophiesChange < 0
            ? 'red.400'
            : 'whiteAlpha.600'
        }
        fontWeight="bold"
        fontSize={{ base: '2xs', md: 'xs' }}
        minW={{ base: '30px', md: '40px' }}
        textAlign="right"
      >
        {entry.trophiesChange > 0 ? '+' : ''}
        {entry.trophiesChange}
      </Text>
    </Flex>
  )
})

TrophyHistoryItem.displayName = 'TrophyHistoryItem'

/**
 * Premium responsive trophy display component showing user's current trophy count
 * with optimized animations and combined history popup (both 1v1 and 4v4 modes)
 */
const TrophyDisplay = memo(() => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const trophyCountRef = useRef(null)
  const trophyControls = useAnimation()

  // Responsive breakpoints
  const [isMobile] = useMediaQuery('(max-width: 48em)')
  const [isTablet] = useMediaQuery('(max-width: 62em)')
  const shouldReduceMotion = useReducedMotion()

  // Responsive values
  const responsiveConfig = useMemo(
    () => ({
      popoverWidth: isMobile ? '95vw' : isTablet ? '360px' : '380px',
      popoverMaxWidth: isMobile ? '350px' : 'none',
      trophyIconSize: isMobile ? 3 : 4,
      fontSize: isMobile ? 'md' : 'lg',
      padding: isMobile ? 2 : 3,
      headerPadding: isMobile ? 3 : 4,
      historyLimit: isMobile ? 4 : 6,
      iconColor: '#FFD700',
    }),
    [isMobile, isTablet],
  )

  // Get trophy data from redux store
  const {
    userTrophies,
    userTrophiesLoading,
    combinedTrophyHistory,
    combinedTrophyHistoryLoading,
  } = useSelector(state => state.quickClash)

  // Previous trophy count to detect changes
  const prevTrophiesRef = useRef(userTrophies)

  // Memoized trophy tier calculation
  const trophyTier = useMemo(() => {
    if (userTrophies < 1000) return t('Bronze Tier')
    if (userTrophies < 1500) return t('Silver Tier')
    return t('Gold Tier')
  }, [userTrophies, t])

  // Handle trophy count changes with optimized animation
  useEffect(() => {
    if (
      prevTrophiesRef.current !== undefined &&
      prevTrophiesRef.current !== userTrophies &&
      !shouldReduceMotion
    ) {
      // Play pulse animation on trophy count change
      trophyControls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 },
      })
    }

    prevTrophiesRef.current = userTrophies
  }, [userTrophies, trophyControls, shouldReduceMotion])

  // Optimized popover open handler
  const handlePopoverOpen = useCallback(() => {
    dispatch(fetchCombinedTrophyHistory({ limit: 10 }))
  }, [dispatch])

  // Optimized hover animation
  const hoverAnimation = useMemo(() => {
    if (shouldReduceMotion) return {}
    return {
      scale: 1.05,
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
    }
  }, [shouldReduceMotion])

  // Show loading spinner if data is loading
  if (userTrophiesLoading && !userTrophies) {
    return (
      <Flex align="center" justify="center" h="32px">
        <Spinner size="sm" color="purple.300" />
      </Flex>
    )
  }

  return (
    <Popover
      placement={isMobile ? 'bottom' : 'bottom-end'}
      trigger="click"
      onOpen={handlePopoverOpen}
      closeOnBlur={true}
      closeOnEsc={true}
    >
      <PopoverTrigger>
        <MotionFlex
          align="center"
          justify="center"
          py={1.5}
          px={3}
          borderRadius="full"
          bg="rgba(26, 32, 44, 0.4)"
          backdropFilter="blur(8px)"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
          cursor="pointer"
          transition="all 0.2s"
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
          }}
          whileTap={{ scale: 0.95 }}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor="rgba(255, 215, 0, 0.3)"
          _focusVisible={{ outline: 'none' }}
          sx={{
            // Remove focus outline/rectangle across browsers
            '&:focus': { outline: 'none', boxShadow: 'none' },
            '&:focus-visible': { outline: 'none', boxShadow: 'none' },
            '&:active': { outline: 'none' },
            '&::selection': { background: 'transparent' },
          }}
        >
          {/* Trophy animation appears below and merges into trophy count */}
          <TrophyAnimation />

          {/* Premium gradient background */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient="linear(to-br, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.1))"
            opacity={0.7}
            zIndex={0}
          />

          {/* Optimized trophy icon */}
          <TrophyIcon
            shouldReduceMotion={shouldReduceMotion}
            iconSize={responsiveConfig.trophyIconSize}
            iconColor={responsiveConfig.iconColor}
          />

          {/* Trophy count with responsive animation */}
          <MotionText
            ref={trophyCountRef}
            color="white"
            fontWeight="bold"
            fontSize={responsiveConfig.fontSize}
            zIndex={1}
            animate={trophyControls}
          >
            {userTrophies}
          </MotionText>
        </MotionFlex>
      </PopoverTrigger>

      <PopoverContent
        bg="rgba(20, 20, 30, 0.95)"
        backdropFilter="blur(16px)"
        borderColor="rgba(255, 215, 0, 0.4)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.3)"
        width={responsiveConfig.popoverWidth}
        maxWidth={responsiveConfig.popoverMaxWidth}
        height="auto"
        p={0}
        overflow="hidden"
        borderRadius="xl"
        mx={isMobile ? 2 : 0}
        _focus={{ outline: 'none', boxShadow: 'none' }}
        sx={{
          '&:focus': { outline: 'none' },
          '&:focus-visible': { outline: 'none' },
        }}
      >
        <PopoverArrow bg="rgba(20, 20, 30, 0.95)" />
        <PopoverCloseButton
          color="whiteAlpha.700"
          zIndex={2}
          size={isMobile ? 'md' : 'sm'}
          top={isMobile ? 3 : 2}
          right={isMobile ? 3 : 2}
        />
        <PopoverBody p={0}>
          {/* Top section with current trophies */}
          <Flex
            bg="rgba(30, 30, 45, 0.8)"
            p={responsiveConfig.headerPadding}
            borderBottomWidth="1px"
            borderColor="rgba(255, 215, 0, 0.2)"
            position="relative"
            overflow="hidden"
          >
            {/* Background glow effect - reduced on mobile */}
            {!isMobile && (
              <Box
                position="absolute"
                top="-20px"
                left="-20px"
                width="80px"
                height="80px"
                borderRadius="full"
                bgGradient="radial(circle, rgba(255, 215, 0, 0.3), transparent 70%)"
                filter="blur(10px)"
              />
            )}

            {/* Trophy info */}
            <Flex align="center" width="100%">
              <Flex
                w={{ base: '48px', md: '56px' }}
                h={{ base: '48px', md: '56px' }}
                borderRadius="full"
                bgGradient="linear(to-br, #FFD700, #FFA500)"
                align="center"
                justify="center"
                boxShadow="0 0 20px rgba(255, 215, 0, 0.4)"
                mr={{ base: 3, md: 4 }}
              >
                <Icon as={Trophy} color="white" boxSize={{ base: 5, md: 6 }} />
              </Flex>

              <VStack align="start" spacing={0} flex={1}>
                <Text
                  color="white"
                  fontWeight="bold"
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  {t('Your Trophies')}
                </Text>
                <HStack spacing={{ base: 2, md: 3 }} mt={1}>
                  <Text
                    color="#FFD700"
                    fontWeight="bold"
                    fontSize={{ base: 'lg', md: 'xl' }}
                  >
                    {userTrophies}
                  </Text>

                  {!isMobile ? (
                    <Tooltip label={t('Trophies determine your rank')}>
                      <Text color="whiteAlpha.700" fontSize="xs">
                        {trophyTier}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text
                      color="whiteAlpha.700"
                      fontSize={{ base: '2xs', md: 'xs' }}
                    >
                      {trophyTier}
                    </Text>
                  )}
                </HStack>
              </VStack>
            </Flex>
          </Flex>

          {/* Trophy history section */}
          <Box px={responsiveConfig.padding} py={responsiveConfig.padding}>
            <HStack justify="space-between" mb={2}>
              <Text
                color="white"
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight="bold"
              >
                {t('Recent Trophy Changes')}
              </Text>
              {!isMobile && (
                <HStack spacing={1}>
                  <Icon as={Zap} color="purple.400" boxSize={3} />
                  <Icon as={Users} color="blue.400" boxSize={3} />
                  <Icon as={BarChart} color="whiteAlpha.600" boxSize={4} />
                </HStack>
              )}
            </HStack>

            {combinedTrophyHistoryLoading ? (
              <Flex justify="center" py={4}>
                <Spinner size="sm" color="yellow.400" />
              </Flex>
            ) : combinedTrophyHistory && combinedTrophyHistory.length > 0 ? (
              <VStack spacing={{ base: 1, md: 2 }} align="stretch">
                {combinedTrophyHistory
                  .slice(0, responsiveConfig.historyLimit)
                  .map((entry, index) => (
                    <TrophyHistoryItem
                      key={entry._id}
                      entry={entry}
                      index={index}
                      t={t}
                      isMobile={isMobile}
                    />
                  ))}
              </VStack>
            ) : (
              <Text
                color="whiteAlpha.600"
                fontSize={{ base: '2xs', md: 'xs' }}
                textAlign="center"
                py={2}
              >
                {t('No recent trophy changes')}
              </Text>
            )}
          </Box>

          {/* Tip section */}
          <HStack
            spacing={{ base: 2, md: 3 }}
            px={responsiveConfig.padding}
            py={responsiveConfig.padding}
            align="center"
            bg="rgba(30, 30, 45, 0.4)"
            borderTop="1px solid"
            borderColor="rgba(255, 215, 0, 0.15)"
          >
            <MotionIcon
              as={Trophy}
              color="#FFD700"
              boxSize={{ base: 4, md: 5 }}
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      rotate: [0, 10, 0, -10, 0],
                      scale: [1, 1.1, 1, 1.1, 1],
                    }
              }
              transition={
                shouldReduceMotion
                  ? {}
                  : {
                      duration: 5,
                      repeat: Infinity,
                    }
              }
              filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))"
            />
            <VStack spacing={0} align="start">
              <Text
                color="white"
                fontWeight="bold"
                fontSize={{ base: '2xs', md: 'xs' }}
              >
                {t('Earn More Trophies')}
              </Text>
              <Text
                color="whiteAlpha.600"
                fontSize={{ base: '3xs', md: '2xs' }}
                lineHeight="1.2"
              >
                {t(
                  'Win challenges in both 1v1 and 4v4 modes to climb the leaderboard!',
                )}
              </Text>
            </VStack>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
})

TrophyDisplay.displayName = 'TrophyDisplay'

export default TrophyDisplay
