import React, { useEffect, useState, useCallback } from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import useSound from '../../customHooks/useSound'
import { useSelector } from 'react-redux'
import {
  calculateTotalEffect,
  getCategoryFromBoost,
  isCategoryBoost,
} from '../../utils/helper.utils'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
const MotionBox = motion(Box)

const Countdown = ({ timer, submitted, isTournament = false }) => {
  const [offset, setOffset] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)
  const { articleData } = useSelector(state => state.articles)
  const category = articleData?.category
  const { activeAbilities } = useSelector(state => state.inventory)
  const filteredActiveAbilities = activeAbilities.filter(ability => {
    // Handle category boosts

    if (ability && ability?.name && isCategoryBoost(ability.name) && category) {
      const boostCategory = getCategoryFromBoost(ability.name)

      return boostCategory.toLowerCase() === category.toLowerCase()
    }
    // Include all other types of boosts
    return true
  })
  const timeDilationEffect = useMemo(
    () =>
      calculateTotalEffect(
        filteredActiveAbilities.filter(
          ability => ability?.name === 'TimeDilation',
        ),
        'POWER_UP',
      ),
    [activeAbilities],
  )
  const additionalTime = useMemo(
    () =>
      timeDilationEffect?.additionalTime
        ? timeDilationEffect?.additionalTime
        : 0,
    [timeDilationEffect],
  )
  const effects = useMemo(
    () => calculateTotalEffect(filteredActiveAbilities, 'BOOST'),
    [activeAbilities],
  )
  const multiplier = useMemo(
    () => (effects?.multiplier <= 1 ? null : `${effects?.multiplier}x`),
    [effects],
  )
  const initialTimer = useMemo(() => 50 + additionalTime, [timeDilationEffect])
  const { play30SecSound, play20SecSound, play10SecSound, playEndSound } =
    useSound()

  // Helper to switch between default and tournament colors
  const getColor = useCallback(() => {
    if (timer > 30) return isTournament ? '#FFD700' : '#9F7AEA' // Gold or Purple
    if (timer > 20) return isTournament ? '#FFEA70' : '#F6E05E' // Light Gold or Yellow
    if (timer > 10) return isTournament ? '#FFC107' : '#ED8936' // Amber or Orange
    return isTournament ? '#FF4500' : '#F56565' // Red for both
  }, [timer, isTournament])

  useEffect(() => {
    const percentage = (timer / initialTimer) * 100
    const newOffset = 283 - (283 * percentage) / 100
    setOffset(newOffset)

    if (!submitted) {
      if (timer === 30) {
        play30SecSound()
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 1000)
      } else if (timer === 20) {
        play20SecSound()
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 1000)
      } else if (timer <= 10 && timer > 0) {
        play10SecSound()
        setIsFlashing(true)
        setTimeout(() => setIsFlashing(false), 200)
      }
    }
  }, [
    timer,
    initialTimer,
    play30SecSound,
    play20SecSound,
    play10SecSound,
    playEndSound,
    submitted,
  ])

  return (
    <Box
      position="relative"
      width="80px"
      height="80px"
      mt={'1rem'}
      animation={isFlashing ? 'flash 0.5s' : 'none'}
      css={{
        '@keyframes flash': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeDasharray="283"
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <Text
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        fontSize={timer > 9 ? '24px' : '20px'}
        fontWeight="bold"
        color={getColor()}
      >
        {timer}
      </Text>
      <VStack position={'absolute'} top="0" right={'-3.75rem'}>
        {additionalTime && (
          <MotionBox
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            position="relative"
          >
            <Box
              bg="linear-gradient(135deg, #FF6B6B 0%, #9F67FF 100%)"
              px="3"
              py="1"
              borderRadius="full"
              boxShadow="0 4px 12px rgba(159, 103, 255, 0.4)"
              position="relative"
              overflow="hidden"
              w={'fit-content'}
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                animation: 'shine 2s infinite',
              }}
            >
              <HStack spacing="1" alignItems="center">
                <Text
                  color="white"
                  fontSize="xs"
                  fontWeight="extrabold"
                  textShadow="0 2px 4px rgba(0,0,0,0.2)"
                >
                  +{additionalTime}s
                </Text>
              </HStack>
            </Box>
          </MotionBox>
        )}
        {multiplier && (
          <MotionBox
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            position="relative"
          >
            <Box
              bg="linear-gradient(135deg, #FF6B6B 0%, #9F67FF 100%)"
              px="3"
              py="1"
              borderRadius="full"
              boxShadow="0 4px 12px rgba(159, 103, 255, 0.4)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                animation: 'shine 2s infinite',
              }}
            >
              <HStack spacing="1" alignItems="center">
                <Text
                  color="white"
                  fontSize="xs"
                  fontWeight="extrabold"
                  textShadow="0 2px 4px rgba(0,0,0,0.2)"
                >
                  {multiplier}
                </Text>
              </HStack>
            </Box>
          </MotionBox>
        )}
      </VStack>
    </Box>
  )
}

export default Countdown
