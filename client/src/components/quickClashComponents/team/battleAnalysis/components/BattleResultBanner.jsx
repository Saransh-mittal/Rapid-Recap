// components/quickClashComponents/team/battleAnalysis/components/BattleResultBanner.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  Badge,
  Button,
  HStack,
  VStack,
  Circle,
} from '@chakra-ui/react'
import { motion, useAnimationControls } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Share2, Trophy, Swords, Shield, Crown, Star } from 'lucide-react'
import confetti from 'canvas-confetti'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)

/**
 * Optimized Battle Result Banner with simplified animations for better performance
 */
const BattleResultBanner = ({ battle, userTeam, onShare }) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimationControls()
  const [showDetails, setShowDetails] = useState(false)

  // Memoized responsive configuration - static values for better performance
  const config = useMemo(
    () => ({
      isMobile: window.innerWidth < 768,
      scoreSize:
        window.innerWidth < 480
          ? '2xl'
          : window.innerWidth < 768
          ? '3xl'
          : '4xl',
      titleSize: window.innerWidth < 480 ? 'lg' : 'xl',
      subtitleSize: window.innerWidth < 480 ? 'sm' : 'md',
      containerH: window.innerWidth < 768 ? 'auto' : '300px',
      padding: window.innerWidth < 480 ? 4 : 6,
      circleSize: window.innerWidth < 480 ? '45px' : '55px',
      iconSize: window.innerWidth < 480 ? 5 : 7,
    }),
    [],
  )

  const isUserWinner = battle.winner === userTeam
  const isTie = battle.winner === 'tie'

  const getResultConfig = () => {
    if (isUserWinner) {
      return {
        title: t('VICTORY!'),
        subtitle: t('Great Performance!'),
        color: 'green',
        icon: Crown,
        primaryGradient: 'linear(45deg, green.500, green.700)',
        accentColor: 'green.400',
        glowColor: 'rgba(16, 185, 129, 0.3)',
      }
    } else if (isTie) {
      return {
        title: t('DRAW!'),
        subtitle: t('Well Fought!'),
        color: 'yellow',
        icon: Shield,
        primaryGradient: 'linear(45deg, yellow.500, yellow.700)',
        accentColor: 'yellow.400',
        glowColor: 'rgba(245, 158, 11, 0.3)',
      }
    } else {
      return {
        title: t('DEFEAT'),
        subtitle: t('Try Again!'),
        color: 'red',
        icon: Swords,
        primaryGradient: 'linear(45deg, red.500, red.700)',
        accentColor: 'red.400',
        glowColor: 'rgba(239, 68, 68, 0.3)',
      }
    }
  }

  const resultConfig = getResultConfig()

  useEffect(() => {
    const animateSequence = async () => {
      await controls.start({
        scale: [0.98, 1], // Reduced animation
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeOut' }, // Reduced duration
      })
      setTimeout(() => setShowDetails(true), 300) // Faster reveal
    }
    animateSequence()

    // Simplified confetti for winners - much less intensive and only on desktop
    if (isUserWinner && !config.isMobile) {
      setTimeout(() => {
        confetti({
          particleCount: 30, // Reduced from 80
          spread: 45, // Reduced spread
          origin: { y: 0.7 },
          colors: ['#16A34A', '#A855F7'],
          shapes: ['circle'],
          scalar: 0.6, // Reduced size
          gravity: 1, // Faster fall
        })
      }, 600) // Earlier trigger
    }
  }, [controls, isUserWinner, config.isMobile])

  return (
    <MotionBox
      h={config.containerH}
      minH="260px" // Reduced from 280px
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      bgGradient={resultConfig.primaryGradient}
      boxShadow={
        config.isMobile
          ? '0 6px 20px rgba(0,0,0,0.2)' // Reduced shadow
          : `0 10px 30px ${resultConfig.glowColor}` // Reduced shadow
      }
      animate={controls}
      p={config.padding}
      mb={8}
    >
      {/* Simplified background elements - only on desktop */}
      <Box position="absolute" inset={0} overflow="hidden" zIndex={0}>
        {!config.isMobile && (
          <>
            {/* Reduced from 4 to 2 floating particles */}
            {[...Array(2)].map((_, i) => (
              <MotionBox
                key={i}
                position="absolute"
                w={`${Math.random() * 2 + 1}px`} // Smaller particles
                h={`${Math.random() * 2 + 1}px`}
                bg="whiteAlpha.500" // Reduced opacity
                borderRadius="full"
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                }}
                animate={{
                  y: ['-5px', '-60px'], // Reduced movement
                  opacity: [0, 0.4, 0], // Reduced max opacity
                }}
                transition={{
                  duration: Math.random() * 3 + 3, // Slower animation
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
              />
            ))}
            {/* Single background glow */}
            <Box
              position="absolute"
              top="25%"
              left="50%"
              transform="translateX(-50%)"
              w="150px" // Reduced from 180px
              h="150px"
              bgGradient="radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)" // Reduced opacity
              borderRadius="full"
            />
          </>
        )}
      </Box>

      <Flex
        position="relative"
        zIndex={1}
        h="100%"
        direction="column"
        justify="space-between"
        color="white"
      >
        <VStack spacing={2} textAlign="center">
          {/* Simplified icon animation - only on desktop */}
          <MotionBox
            animate={
              !config.isMobile
                ? {
                    scale: [1, 1.01, 1], // Reduced animation
                  }
                : {}
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} // Slower
          >
            <Circle
              size={config.circleSize}
              bg="rgba(255,255,255,0.12)"
              backdropFilter={config.isMobile ? 'none' : 'blur(6px)'} // Reduced blur
              border="2px solid rgba(255,255,255,0.2)"
            >
              <Icon as={resultConfig.icon} boxSize={config.iconSize} />
            </Circle>
          </MotionBox>
          <VStack spacing={1}>
            <Heading
              fontSize={config.titleSize}
              fontWeight="bold"
              letterSpacing="wide"
              textShadow={
                config.isMobile ? 'none' : '0 2px 6px rgba(0,0,0,0.3)' // Reduced shadow
              }
            >
              {resultConfig.title}
            </Heading>
            <Text
              fontSize={config.subtitleSize}
              opacity={0.9}
              fontWeight="medium"
            >
              {resultConfig.subtitle}
            </Text>
          </VStack>
        </VStack>

        <MotionFlex
          justify="center"
          align="center"
          gap={{ base: 3, md: 4 }} // Reduced gap
          initial={{ opacity: 0, y: 8 }} // Reduced movement
          animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 8 }}
          transition={{ delay: 0.2, duration: 0.4 }} // Faster
          my={3} // Reduced margin
        >
          {[
            {
              team: 'teamA',
              score: battle.teamATotalScore,
              name: battle.teamA?.name || t('Team A'),
            },
            {
              team: 'teamB',
              score: battle.teamBTotalScore,
              name: battle.teamB?.name || t('Team B'),
            },
          ].map((item, index) => (
            <React.Fragment key={item.team}>
              {index === 1 && (
                <VStack spacing={1} display={{ base: 'none', md: 'flex' }}>
                  <Text fontSize="md" fontWeight="bold" opacity={0.7}>
                    VS
                  </Text>
                  <Box w="1px" h="30px" bg="rgba(255,255,255,0.3)" />{' '}
                  {/* Reduced height */}
                </VStack>
              )}
              <VStack spacing={2} flex={1} minW="100px">
                <Badge
                  bg="rgba(255,255,255,0.15)"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="semibold"
                  backdropFilter={
                    config.isMobile ? 'none' : 'blur(4px)' // Reduced blur
                  }
                >
                  {userTeam === item.team ? t('YOUR TEAM') : t('OPPONENT')}
                </Badge>
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                  {item.name}
                </Text>
                <MotionText
                  fontSize={config.scoreSize}
                  fontWeight="black"
                  lineHeight={1}
                  textShadow={
                    config.isMobile ? 'none' : '0 0 15px rgba(255,255,255,0.3)' // Reduced shadow
                  }
                  animate={
                    !config.isMobile
                      ? {
                          scale: [0.98, 1.01, 1], // Reduced animation
                        }
                      : {}
                  }
                  transition={{
                    delay: 0.4 + index * 0.1,
                    duration: 0.6, // Reduced duration
                    ease: 'easeOut',
                  }}
                >
                  {item.score}
                </MotionText>
              </VStack>
            </React.Fragment>
          ))}
        </MotionFlex>

        <MotionFlex
          justify="space-between"
          align="center"
          initial={{ opacity: 0 }}
          animate={{ opacity: showDetails ? 1 : 0 }}
          transition={{ delay: 0.6, duration: 0.3 }} // Faster
          direction={{ base: 'column', sm: 'row' }}
          gap={{ base: 2, sm: 0 }}
        >
          <HStack spacing={2} flexWrap="wrap">
            {[
              {
                value:
                  userTeam === 'teamA' ? battle.teamAWins : battle.teamBWins,
                label: t('W'),
                icon: Star,
                color: 'yellow.300',
              },
              {
                value:
                  userTeam === 'teamA' ? battle.teamBWins : battle.teamAWins,
                label: t('L'),
                icon: Swords,
                color: 'red.300',
              },
              ...(battle.ties > 0
                ? [
                    {
                      value: battle.ties,
                      label: t('T'),
                      icon: Shield,
                      color: 'gray.300',
                    },
                  ]
                : []),
            ].map(stat => (
              <Badge
                key={stat.label}
                bg="rgba(255,255,255,0.1)"
                color="whiteAlpha.900"
                px={2}
                py={1}
                borderRadius="lg"
                backdropFilter={
                  config.isMobile ? 'none' : 'blur(4px)' // Reduced blur
                }
                border="1px solid rgba(255,255,255,0.15)"
                fontSize="xs"
              >
                <Icon as={stat.icon} color={stat.color} boxSize={3} mr={1} />
                {stat.value} {stat.label}
              </Badge>
            ))}
          </HStack>
          <Button
            leftIcon={<Share2 size={14} />}
            bg="rgba(255,255,255,0.15)"
            color="white"
            backdropFilter={config.isMobile ? 'none' : 'blur(6px)'} // Reduced blur
            border="1px solid rgba(255,255,255,0.25)"
            borderRadius="lg"
            px={4}
            py={2}
            fontSize="sm"
            _hover={{
              bg: 'rgba(255,255,255,0.25)',
              transform: 'translateY(-1px)',
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.2s ease"
            onClick={onShare}
          >
            {t('Share')}
          </Button>
        </MotionFlex>
      </Flex>
    </MotionBox>
  )
}

export default BattleResultBanner
