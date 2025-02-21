import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import Bubbles from '../miscellaneous/Bubbles'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  calculateTotalEffect,
  getCategoryFromBoost,
  isCategoryBoost,
} from '../../utils/helper.utils'
import { motion } from 'framer-motion'
const MotionBox = motion(Box)

const TakeQuizButton = ({ onClick, category }) => {
  const { t } = useTranslation('TakeQuizButton')
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
  const effects = useMemo(
    () => calculateTotalEffect(filteredActiveAbilities, 'BOOST'),
    [activeAbilities],
  )
  const multiplier = useMemo(
    () => (effects?.multiplier <= 1 ? null : `${effects?.multiplier}x`),
    [effects],
  )

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
        ? `+${timeDilationEffect?.additionalTime}s`
        : null,
    [timeDilationEffect],
  )

  return (
    <Box m={4} width="100%">
      <Button
        onClick={onClick}
        width="100%"
        height="auto"
        py={3}
        px={6}
        borderRadius="full"
        border={effects?.multiplier > 1 ? 'yellow solid 3px' : 'none'}
        bgGradient="linear(to-r, rgba(253, 226, 243, 1), rgba(229, 190, 236, 1))"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.3s ease, box-shadow 2s ease-in-out"
        position="relative"
        overflow="hidden"
        animation={
          effects?.multiplier > 1 ? 'shine 1s infinite alternate' : 'none'
        }
      >
        {(effects?.multiplier > 1 || additionalTime) && <Bubbles />}
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="rgba(42, 47, 79, 1)"
          textAlign="center"
          width="100%"
          m={0}
          py={2}
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        >
          {t('takeQuiz')}
        </Text>
        <VStack gap={2}>
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
                    {additionalTime}
                  </Text>
                </HStack>
              </Box>
            </MotionBox>
          )}
        </VStack>
      </Button>
    </Box>
  )
}

export default TakeQuizButton
