// components/quickClashComponents/user/TrophyDisplay.jsx
import React, { useEffect, useRef } from 'react'
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
} from '@chakra-ui/react'
import { motion, useAnimation } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown, BarChart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTrophyHistory } from '../../../redux/quickClashSlice'
import TrophyAnimation from '../animations/TrophyAnimation'

const MotionFlex = motion(Flex)
const MotionIcon = motion(Icon)
const MotionText = motion(Text)

/**
 * Premium trophy display component showing user's current trophy count
 * with animation and history popup
 */
const TrophyDisplay = () => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const trophyCountRef = useRef(null)
  const trophyControls = useAnimation()

  // Get trophy data from redux store
  const {
    userTrophies,
    userTrophiesLoading,
    trophyHistory,
    trophyHistoryLoading,
  } = useSelector(state => state.quickClash)

  // Previous trophy count to detect changes
  const prevTrophiesRef = useRef(userTrophies)

  // Handle trophy count changes with animation
  useEffect(() => {
    if (
      prevTrophiesRef.current !== undefined &&
      prevTrophiesRef.current !== userTrophies
    ) {
      // Play pulse animation on trophy count change
      trophyControls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 },
      })
    }

    prevTrophiesRef.current = userTrophies
  }, [userTrophies, trophyControls])

  // Fetch trophy history when popover opens
  const handlePopoverOpen = () => {
    dispatch(fetchTrophyHistory({ limit: 5 }))
  }

  // Show loading spinner if data is loading
  if (userTrophiesLoading && !userTrophies) {
    return (
      <Flex align="center" justify="center" h="32px">
        <Spinner size="sm" color="purple.300" />
      </Flex>
    )
  }

  return (
    <Popover placement="bottom-end" trigger="click" onOpen={handlePopoverOpen}>
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

          {/* Animated trophy icon */}
          <MotionIcon
            as={Trophy}
            color="#FFD700"
            boxSize={4}
            mr={2}
            animate={{
              rotate: [0, 5, 0, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 4,
            }}
            zIndex={1}
            filter="drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))"
          />

          {/* Trophy count with animation when value changes */}
          <MotionText
            ref={trophyCountRef}
            color="white"
            fontWeight="bold"
            fontSize="lg"
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
        width="340px"
        height="auto"
        p={0}
        overflow="hidden"
        borderRadius="xl"
        _focus={{ outline: 'none', boxShadow: 'none' }}
        sx={{
          '&:focus': { outline: 'none' },
          '&:focus-visible': { outline: 'none' },
        }}
      >
        <PopoverArrow bg="rgba(20, 20, 30, 0.95)" />
        <PopoverCloseButton color="whiteAlpha.700" zIndex={2} />
        <PopoverBody p={0}>
          {/* Top section with current trophies */}
          <Flex
            bg="rgba(30, 30, 45, 0.8)"
            p={4}
            borderBottomWidth="1px"
            borderColor="rgba(255, 215, 0, 0.2)"
            position="relative"
            overflow="hidden"
          >
            {/* Background glow effect */}
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

            {/* Trophy info */}
            <Flex align="center" width="100%">
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                bgGradient="linear(to-br, #FFD700, #FFA500)"
                align="center"
                justify="center"
                boxShadow="0 0 20px rgba(255, 215, 0, 0.4)"
                mr={4}
              >
                <Icon as={Trophy} color="white" boxSize={6} />
              </Flex>

              <VStack align="start" spacing={0} flex={1}>
                <Text color="white" fontWeight="bold" fontSize="md">
                  {t('Your Trophies')}
                </Text>
                <HStack spacing={3} mt={1}>
                  <Text color="#FFD700" fontWeight="bold" fontSize="xl">
                    {userTrophies}
                  </Text>

                  <Tooltip label={t('Trophies determine your rank')}>
                    <Text color="whiteAlpha.700" fontSize="xs">
                      {userTrophies < 1000
                        ? t('Bronze Tier')
                        : userTrophies < 1500
                        ? t('Silver Tier')
                        : t('Gold Tier')}
                    </Text>
                  </Tooltip>
                </HStack>
              </VStack>
            </Flex>
          </Flex>

          {/* Trophy history section */}
          <Box px={4} py={3}>
            <HStack justify="space-between" mb={2}>
              <Text color="white" fontSize="sm" fontWeight="bold">
                {t('Recent Trophy Changes')}
              </Text>
              <Icon as={BarChart} color="whiteAlpha.600" boxSize={4} />
            </HStack>

            {trophyHistoryLoading ? (
              <Flex justify="center" py={4}>
                <Spinner size="sm" color="yellow.400" />
              </Flex>
            ) : trophyHistory && trophyHistory.length > 0 ? (
              <VStack spacing={2} align="stretch">
                {trophyHistory.slice(0, 5).map((entry, index) => (
                  <Flex
                    key={index}
                    justify="space-between"
                    align="center"
                    p={2}
                    borderRadius="md"
                    bg={
                      index % 2 === 0 ? 'rgba(30, 30, 45, 0.6)' : 'transparent'
                    }
                  >
                    <HStack>
                      <Icon
                        as={
                          entry.result === 'win'
                            ? TrendingUp
                            : entry.result === 'loss'
                            ? TrendingDown
                            : Trophy
                        }
                        color={
                          entry.result === 'win'
                            ? 'green.400'
                            : entry.result === 'loss'
                            ? 'red.400'
                            : 'yellow.400'
                        }
                        boxSize={4}
                      />
                      <Text color="whiteAlpha.800" fontSize="xs">
                        {entry.result === 'win'
                          ? t('Victory vs')
                          : entry.result === 'loss'
                          ? t('Defeat vs')
                          : t('Tie vs')}{' '}
                        {entry.opponent?.inGameName ||
                          entry.opponent?.name ||
                          t('Unknown')}
                      </Text>
                    </HStack>
                    <Text
                      color={
                        entry.trophiesChange > 0
                          ? 'green.400'
                          : entry.trophiesChange < 0
                          ? 'red.400'
                          : 'whiteAlpha.600'
                      }
                      fontWeight="bold"
                      fontSize="xs"
                    >
                      {entry.trophiesChange > 0 ? '+' : ''}
                      {entry.trophiesChange}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            ) : (
              <Text
                color="whiteAlpha.600"
                fontSize="xs"
                textAlign="center"
                py={2}
              >
                {t('No recent trophy changes')}
              </Text>
            )}
          </Box>

          {/* Tip section */}
          <HStack
            spacing={3}
            px={4}
            py={3}
            align="center"
            bg="rgba(30, 30, 45, 0.4)"
            borderTop="1px solid"
            borderColor="rgba(255, 215, 0, 0.15)"
          >
            <MotionIcon
              as={Trophy}
              color="#FFD700"
              boxSize={5}
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))"
            />
            <VStack spacing={0} align="start">
              <Text color="white" fontWeight="bold" fontSize="xs">
                {t('Earn More Trophies')}
              </Text>
              <Text color="whiteAlpha.600" fontSize="2xs">
                {t('Win challenges to climb the Quick Clash leaderboard!')}
              </Text>
            </VStack>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default TrophyDisplay
