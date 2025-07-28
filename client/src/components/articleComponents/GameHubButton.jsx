// Mobile-Optimized GameHubButton.jsx with perfect responsive design
// Location: client/src/components/articleComponents/GameHubButton.jsx

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
  useMediaQuery,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Gamepad2, Crown, Zap, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setIsSigninOpen } from '../../redux/appSlice'
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
  onClick,
  userQuizScore = null,
  totalQuizQuestions = 0,
  hasCompletedInlineQuiz = false,
}) => {
  const { t } = useTranslation('GameHub')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Media queries for responsive design
  const [isMobile] = useMediaQuery('(max-width: 480px)')
  const [isTablet] = useMediaQuery('(max-width: 768px)')

  // Redux state
  const { activeAbilities } = useSelector(state => state.inventory)
  const { isAuthenticated, user } = useSelector(state => state.auth)

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

  // Optimized click handler
  const handleClick = () => {
    if (disabled || loading) return

    if (onClick) {
      onClick()
      return
    }

    if (!isAuthenticated) {
      dispatch(setIsSigninOpen(true))
      return
    }

    navigate(`/gamehub/${articleId}`)
  }

  return (
    <Box
      width="100%"
      maxW={{ base: '100%', sm: '380px', md: '400px' }}
      mx="auto"
    >
      <Tooltip
        label={
          !isAuthenticated
            ? 'Sign in to join the competition!'
            : disabled
            ? t('tooltips.completePrevious')
            : t('tooltips.chooseGameMode')
        }
        placement="top"
        hasArrow
        bg="purple.800"
        color="white"
        fontSize="sm"
        px={3}
        py={2}
        borderRadius="lg"
        isDisabled={isMobile} // Disable tooltip on mobile for better UX
      >
        <MotionButton
          onClick={handleClick}
          isLoading={loading}
          isDisabled={disabled}
          whileHover={
            !disabled
              ? {
                  scale: isMobile ? 1.01 : 1.02, // Reduced scale on mobile
                  y: isMobile ? -1 : -2,
                }
              : {}
          }
          whileTap={!disabled ? { scale: 0.98 } : {}}
          width="100%"
          height="auto"
          py={{ base: 4, sm: 5, md: 6 }}
          px={{ base: 4, sm: 6, md: 8 }}
          borderRadius={{ base: 'lg', md: 'xl' }}
          border="2px solid"
          borderColor={
            hasActiveBoosts
              ? 'yellow.400'
              : !isAuthenticated
              ? 'purple.400'
              : 'purple.600'
          }
          bgGradient={
            !isAuthenticated
              ? 'linear(135deg, purple.600 0%, pink.600 50%, orange.500 100%)'
              : hasActiveBoosts
              ? 'linear(135deg, purple.600 0%, blue.600 50%, yellow.500 100%)'
              : 'linear(135deg, purple.600 0%, blue.600 100%)'
          }
          color="white"
          fontWeight="bold"
          fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
          position="relative"
          overflow="hidden"
          boxShadow={{
            base: !isAuthenticated
              ? '0 6px 20px rgba(138, 43, 226, 0.4)'
              : hasActiveBoosts
              ? '0 6px 20px rgba(255, 255, 0, 0.3)'
              : '0 6px 20px rgba(138, 43, 226, 0.3)',
            md: !isAuthenticated
              ? '0 8px 25px rgba(138, 43, 226, 0.4)'
              : hasActiveBoosts
              ? '0 8px 25px rgba(255, 255, 0, 0.3)'
              : '0 8px 25px rgba(138, 43, 226, 0.3)',
          }}
          transition="all 0.3s ease"
          _hover={{
            bgGradient: !disabled
              ? !isAuthenticated
                ? 'linear(135deg, purple.700 0%, pink.700 50%, orange.600 100%)'
                : hasActiveBoosts
                ? 'linear(135deg, purple.700 0%, blue.700 50%, yellow.600 100%)'
                : 'linear(135deg, purple.700 0%, blue.700 100%)'
              : undefined,
            borderColor: !disabled
              ? hasActiveBoosts
                ? 'yellow.300'
                : !isAuthenticated
                ? 'purple.300'
                : 'purple.500'
              : undefined,
            boxShadow: !disabled
              ? {
                  base: !isAuthenticated
                    ? '0 8px 25px rgba(138, 43, 226, 0.5)'
                    : hasActiveBoosts
                    ? '0 8px 25px rgba(255, 255, 0, 0.4)'
                    : '0 8px 25px rgba(138, 43, 226, 0.4)',
                  md: !isAuthenticated
                    ? '0 12px 35px rgba(138, 43, 226, 0.5)'
                    : hasActiveBoosts
                    ? '0 12px 35px rgba(255, 255, 0, 0.4)'
                    : '0 12px 35px rgba(138, 43, 226, 0.4)',
                }
              : undefined,
          }}
          // Reduced animation on mobile for better performance
          animation={
            !isAuthenticated && !isMobile
              ? 'gentle-glow 4s ease-in-out infinite'
              : 'none'
          }
          sx={{
            willChange: 'transform, box-shadow',
            '@keyframes gentle-glow': {
              '0%, 100%': {
                boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4)',
              },
              '50%': {
                boxShadow:
                  '0 12px 35px rgba(138, 43, 226, 0.6), 0 0 20px rgba(219, 39, 119, 0.3)',
              },
            },
          }}
        >
          {/* Shimmer effect - reduced on mobile */}
          {!isAuthenticated && !isMobile && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)"
              transform="translateX(-100%)"
              animation="shimmer 3s ease-in-out infinite"
              sx={{
                willChange: 'transform',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(200%)' },
                },
              }}
            />
          )}

          <VStack
            spacing={{ base: 2, sm: 2.5, md: 3 }}
            position="relative"
            zIndex={1}
          >
            {/* Header Section - Mobile Optimized */}
            <VStack spacing={{ base: 1, md: 2 }} align="center">
              {/* Icon and Title Row */}
              <HStack
                spacing={{ base: 2, sm: 3 }}
                align="center"
                justify="center"
                flexWrap="wrap"
              >
                <Icon
                  as={!isAuthenticated ? Crown : Gamepad2}
                  boxSize={{ base: 5, sm: 6, md: 7 }}
                  color="white"
                />

                <Text
                  fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                  fontWeight="900"
                  color="white"
                  letterSpacing="wide"
                  textAlign="center"
                  lineHeight="1.1"
                >
                  {!isAuthenticated ? 'Unlock GameHub' : t('headers.gameHub')}
                </Text>
              </HStack>

              {/* Badges Row - Mobile Optimized */}
              {!isAuthenticated && (
                <HStack
                  spacing={{ base: 1, sm: 2 }}
                  justify="center"
                  flexWrap="wrap"
                >
                  <Badge
                    colorScheme="orange"
                    variant="solid"
                    fontSize={{ base: '2xs', sm: 'xs' }}
                    px={{ base: 2, sm: 3 }}
                    py={{ base: 0.5, sm: 1 }}
                    borderRadius="full"
                  >
                    PREMIUM
                  </Badge>
                  <Badge
                    colorScheme="yellow"
                    variant="solid"
                    fontSize={{ base: '2xs', sm: 'xs' }}
                    px={{ base: 2, sm: 3 }}
                    py={{ base: 0.5, sm: 1 }}
                    borderRadius="full"
                  >
                    HOT 🔥
                  </Badge>
                </HStack>
              )}
            </VStack>

            {/* Description - Mobile Optimized */}
            <Text
              fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
              color="whiteAlpha.950"
              textAlign="center"
              fontWeight="600"
              lineHeight={{ base: '1.3', md: '1.3' }}
              maxW={{ base: '280px', sm: '320px', md: '350px' }}
              px={{ base: 1, sm: 0 }}
            >
              {!isAuthenticated
                ? 'Join 1,000+ players in competitive quizzes'
                : t('descriptions.chooseGameMode')}
            </Text>

            {/* Score Display - Mobile Optimized */}
            {!isAuthenticated && hasCompletedInlineQuiz && (
              <Box w="100%" display="flex" justifyContent="center">
                <Badge
                  colorScheme="green"
                  variant="solid"
                  fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                  px={{ base: 2, sm: 3, md: 4 }}
                  py={{ base: 1, md: 1.5 }}
                  borderRadius="full"
                  maxW="100%"
                >
                  <HStack spacing={1} align="center">
                    <Icon as={Trophy} boxSize={{ base: 3, md: 4 }} />
                    <Text isTruncated>YOUR SCORE: {userQuizScore} • ✨</Text>
                  </HStack>
                </Badge>
              </Box>
            )}

            {/* Active Boosts - Mobile Optimized */}
            {isAuthenticated && hasActiveBoosts && (
              <HStack
                spacing={{ base: 1, sm: 2 }}
                justify="center"
                flexWrap="wrap"
                w="100%"
              >
                {multiplier && (
                  <Badge
                    colorScheme="yellow"
                    variant="solid"
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    px={{ base: 2, sm: 3 }}
                    py={1}
                    borderRadius="full"
                  >
                    <HStack spacing={1}>
                      <Icon as={Zap} boxSize={3} />
                      <Text>
                        {multiplier} {t('stats.rqmUnit')}
                      </Text>
                    </HStack>
                  </Badge>
                )}
                {additionalTime && (
                  <Badge
                    colorScheme="blue"
                    variant="solid"
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    px={{ base: 2, sm: 3 }}
                    py={1}
                    borderRadius="full"
                  >
                    {additionalTime}
                  </Badge>
                )}
              </HStack>
            )}

            {/* Call-to-Action - Mobile Optimized */}
            {!isAuthenticated && (
              <Text
                fontSize={{ base: 'xs', sm: 'sm' }}
                color="yellow.200"
                textAlign="center"
                fontWeight="700"
                letterSpacing="wide"
                textTransform="uppercase"
                px={{ base: 2, sm: 0 }}
              >
                CLICK TO JOIN THE ELITE!
              </Text>
            )}
          </VStack>
        </MotionButton>
      </Tooltip>
    </Box>
  )
}

export default GameHubButton
