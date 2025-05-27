// components/quickClashComponents/team/battleAnalysis/components/BattleResultBanner.jsx
import React, { useEffect, useState } from 'react'
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
  useBreakpointValue,
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

  // Optimized responsive values
  const responsiveConfig = useBreakpointValue({
    base: {
      scoreSize: '2xl',
      titleSize: 'lg',
      subtitleSize: 'sm',
      containerH: 'auto',
      padding: 4,
      circleSize: '50px',
      iconSize: 6,
      isMobile: true,
    },
    md: {
      scoreSize: '4xl',
      titleSize: 'xl',
      subtitleSize: 'md',
      containerH: '320px',
      padding: 6,
      circleSize: '60px',
      iconSize: 8,
      isMobile: false,
    },
    lg: {
      scoreSize: '5xl',
      titleSize: '2xl',
      subtitleSize: 'lg',
      containerH: '360px',
      padding: 8,
      circleSize: '70px',
      iconSize: 9,
      isMobile: false,
    },
  })

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
        scale: [0.95, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeOut' },
      })
      setTimeout(() => setShowDetails(true), 400)
    }
    animateSequence()

    // Simplified confetti for winners - less intensive
    if (isUserWinner && !responsiveConfig?.isMobile) {
      setTimeout(() => {
        confetti({
          particleCount: responsiveConfig?.isMobile ? 30 : 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#16A34A', '#A855F7', '#F59E0B'],
          shapes: ['circle'],
          scalar: 0.8,
          gravity: 0.8,
        })
      }, 800)
    }
  }, [controls, isUserWinner, responsiveConfig?.isMobile])

  return (
    <MotionBox
      h={responsiveConfig?.containerH}
      minH="280px"
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      bgGradient={resultConfig.primaryGradient}
      boxShadow={
        responsiveConfig?.isMobile
          ? '0 8px 25px rgba(0,0,0,0.2)'
          : `0 12px 35px ${resultConfig.glowColor}`
      }
      animate={controls}
      p={responsiveConfig?.padding}
    >
      {/* Simplified background elements */}
      <Box position="absolute" inset={0} overflow="hidden" zIndex={0}>
        {!responsiveConfig?.isMobile && (
          <>
            {[...Array(4)].map((_, i) => (
              <MotionBox
                key={i}
                position="absolute"
                w={`${Math.random() * 3 + 1}px`}
                h={`${Math.random() * 3 + 1}px`}
                bg="whiteAlpha.600"
                borderRadius="full"
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                }}
                animate={{
                  y: ['-5px', '-80px'],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
              />
            ))}
            <Box
              position="absolute"
              top="20%"
              left="50%"
              transform="translateX(-50%)"
              w="180px"
              h="180px"
              bgGradient="radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)"
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
          <MotionBox
            animate={
              !responsiveConfig?.isMobile
                ? {
                    scale: [1, 1.02, 1],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Circle
              size={responsiveConfig?.circleSize}
              bg="rgba(255,255,255,0.12)"
              backdropFilter={responsiveConfig?.isMobile ? 'none' : 'blur(8px)'}
              border="2px solid rgba(255,255,255,0.2)"
            >
              <Icon
                as={resultConfig.icon}
                boxSize={responsiveConfig?.iconSize}
              />
            </Circle>
          </MotionBox>
          <VStack spacing={1}>
            <Heading
              fontSize={responsiveConfig?.titleSize}
              fontWeight="bold"
              letterSpacing="wide"
              textShadow={
                responsiveConfig?.isMobile
                  ? 'none'
                  : '0 2px 8px rgba(0,0,0,0.3)'
              }
            >
              {resultConfig.title}
            </Heading>
            <Text
              fontSize={responsiveConfig?.subtitleSize}
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
          gap={{ base: 3, md: 5 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 10 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          my={4}
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
                  <Text fontSize="lg" fontWeight="bold" opacity={0.7}>
                    VS
                  </Text>
                  <Box w="1px" h="40px" bg="rgba(255,255,255,0.3)" />
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
                    responsiveConfig?.isMobile ? 'none' : 'blur(5px)'
                  }
                >
                  {userTeam === item.team ? t('YOUR TEAM') : t('OPPONENT')}
                </Badge>
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                  {item.name}
                </Text>
                <MotionText
                  fontSize={responsiveConfig?.scoreSize}
                  fontWeight="black"
                  lineHeight={1}
                  textShadow={
                    responsiveConfig?.isMobile
                      ? 'none'
                      : '0 0 20px rgba(255,255,255,0.4)'
                  }
                  animate={
                    !responsiveConfig?.isMobile
                      ? {
                          scale: [0.95, 1.02, 1],
                        }
                      : {}
                  }
                  transition={{
                    delay: 0.6 + index * 0.1,
                    duration: 0.8,
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
          transition={{ delay: 0.8, duration: 0.4 }}
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
                  responsiveConfig?.isMobile ? 'none' : 'blur(5px)'
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
            backdropFilter={responsiveConfig?.isMobile ? 'none' : 'blur(8px)'}
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
