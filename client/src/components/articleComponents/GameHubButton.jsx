// components/articleComponents/GameHubButton.jsx
import React, { useMemo } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Gamepad2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  calculateTotalEffect,
  getCategoryFromBoost,
  isCategoryBoost,
} from '../../utils/helper.utils'

const MotionButton = motion(Button)

const GameHubButton = ({
  category,
  articleId,
  disabled = false,
  loading = false,
}) => {
  const { t } = useTranslation('GameHub')
  const navigate = useNavigate()
  const { activeAbilities } = useSelector(state => state.inventory)

  const filteredActiveAbilities =
    activeAbilities?.filter(ability => {
      if (
        ability &&
        ability?.name &&
        isCategoryBoost(ability.name) &&
        category
      ) {
        const boostCategory = getCategoryFromBoost(ability.name)
        return boostCategory.toLowerCase() === category.toLowerCase()
      }
      return true
    }) || []

  const effects = useMemo(
    () => calculateTotalEffect(filteredActiveAbilities, 'BOOST'),
    [filteredActiveAbilities],
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
    [filteredActiveAbilities],
  )

  const additionalTime = useMemo(
    () =>
      timeDilationEffect?.additionalTime
        ? `+${timeDilationEffect?.additionalTime}s`
        : null,
    [timeDilationEffect],
  )

  const hasActiveBoosts = multiplier || additionalTime

  const handleClick = () => {
    if (disabled || loading) return
    navigate(`/gamehub/${articleId}`)
  }

  return (
    <Box m={4} width="100%">
      <Tooltip
        label={
          disabled
            ? t('tooltips.completePrevious')
            : t('tooltips.chooseGameMode')
        }
        placement="top"
      >
        <MotionButton
          onClick={handleClick}
          isLoading={loading}
          isDisabled={disabled}
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          width="100%"
          height="auto"
          py={4}
          px={6}
          borderRadius="xl"
          border={hasActiveBoosts ? '2px solid' : 'none'}
          borderColor={hasActiveBoosts ? 'yellow.400' : 'transparent'}
          bgGradient="linear(to-r, purple.600, blue.600)"
          _hover={{
            bgGradient: !disabled
              ? 'linear(to-r, purple.700, blue.700)'
              : undefined,
            transform: !disabled ? 'translateY(-2px)' : undefined,
            boxShadow: !disabled ? '0 8px 25px rgba(0, 0, 0, 0.2)' : undefined,
          }}
          _active={{
            transform: !disabled ? 'translateY(0)' : undefined,
          }}
          transition="all 0.3s ease"
          position="relative"
          overflow="hidden"
          animation={hasActiveBoosts ? 'shine 2s infinite alternate' : 'none'}
        >
          {/* Animated background effect for active boosts */}
          {hasActiveBoosts && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)"
              transform="translateX(-100%)"
              animation="shimmer 2s infinite"
            />
          )}

          <VStack spacing={2} position="relative">
            <HStack spacing={2} align="center">
              <Icon as={Gamepad2} boxSize={6} />
              <Text fontSize="xl" fontWeight="bold" color="white">
                {t('headers.gameHub')}
              </Text>
            </HStack>

            <Text fontSize="sm" color="whiteAlpha.900" textAlign="center">
              {t('descriptions.chooseGameMode')}
            </Text>

            {/* Active boosts display */}
            {hasActiveBoosts && (
              <HStack spacing={2} mt={2}>
                {multiplier && (
                  <Badge
                    colorScheme="yellow"
                    variant="solid"
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {multiplier} {t('stats.rqmUnit')}
                  </Badge>
                )}
                {additionalTime && (
                  <Badge
                    colorScheme="blue"
                    variant="solid"
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {additionalTime}
                  </Badge>
                )}
              </HStack>
            )}
          </VStack>
        </MotionButton>
      </Tooltip>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes shine {
          0% {
            box-shadow: 0 0 5px rgba(255, 255, 0, 0.5);
          }
          100% {
            box-shadow: 0 0 20px rgba(255, 255, 0, 0.8),
              0 0 30px rgba(255, 255, 0, 0.6);
          }
        }
      `}</style>
    </Box>
  )
}

export default GameHubButton
