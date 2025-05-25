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
 * Ultra Premium Battle Result Banner with innovative design
 */
const BattleResultBanner = ({ battle, userTeam, onShare }) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimationControls()
  const [showDetails, setShowDetails] = useState(false)

  const isMobile = useBreakpointValue({ base: true, md: false })
  const scoreSize = useBreakpointValue({ base: '3xl', md: '5xl', lg: '6xl' })
  const titleSize = useBreakpointValue({ base: 'xl', md: '2xl', lg: '3xl' })
  const subtitleSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const containerH = useBreakpointValue({
    base: 'auto',
    md: '380px',
    lg: '420px',
  })
  const padding = useBreakpointValue({ base: 5, md: 8 })
  const circleSize = useBreakpointValue({
    base: '60px',
    md: '70px',
    lg: '80px',
  })
  const iconInCircleSize = useBreakpointValue({ base: 8, md: 9, lg: 10 })

  const isUserWinner = battle.winner === userTeam
  const isTie = battle.winner === 'tie'

  const getResultConfig = () => {
    if (isUserWinner) {
      return {
        title: t('LEGENDARY VICTORY'),
        subtitle: t('Epic Performance Achieved'),
        color: 'green',
        icon: Crown,
        primaryGradient: 'linear(45deg, green.600, green.800)',
        secondaryGradient: 'linear(135deg, green.500, purple.500)',
        accentColor: 'green.400',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        particlesColor: 'green.300',
      }
    } else if (isTie) {
      return {
        title: t('HONORABLE DRAW'),
        subtitle: t('Perfectly Balanced Match'),
        color: 'yellow',
        icon: Shield,
        primaryGradient: 'linear(45deg, yellow.600, yellow.800)',
        secondaryGradient: 'linear(135deg, yellow.500, orange.500)',
        accentColor: 'yellow.400',
        glowColor: 'rgba(245, 158, 11, 0.5)',
        particlesColor: 'yellow.300',
      }
    } else {
      return {
        title: t('VALIANT EFFORT'),
        subtitle: t('Learn and Conquer Next Time'),
        color: 'red',
        icon: Swords,
        primaryGradient: 'linear(45deg, red.600, red.800)',
        secondaryGradient: 'linear(135deg, red.500, pink.500)',
        accentColor: 'red.400',
        glowColor: 'rgba(239, 68, 68, 0.5)',
        particlesColor: 'red.300',
      }
    }
  }

  const resultConfig = getResultConfig()

  useEffect(() => {
    const animateSequence = async () => {
      await controls.start({
        scale: [0.9, 1.03, 1],
        opacity: [0, 1],
        rotateX: [10, 0],
        transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }, // Smooth ease
      })
      setTimeout(() => setShowDetails(true), 600)
    }
    animateSequence()

    if (isUserWinner) {
      setTimeout(() => {
        const particleColors = [
          resultConfig.particlesColor,
          '#A855F7',
          '#FBBF24',
          '#EC4899',
        ]
        confetti({
          particleCount: isMobile ? 80 : 150,
          spread: isMobile ? 70 : 100,
          origin: { y: 0.5 },
          colors: particleColors,
          shapes: ['star', 'circle'],
          scalar: 1.2,
          gravity: 0.7,
        })
        setTimeout(() => {
          confetti({
            particleCount: isMobile ? 50 : 100,
            angle: 60,
            spread: isMobile ? 50 : 70,
            origin: { x: 0, y: 0.6 },
            colors: particleColors,
          })
          confetti({
            particleCount: isMobile ? 50 : 100,
            angle: 120,
            spread: isMobile ? 50 : 70,
            origin: { x: 1, y: 0.6 },
            colors: particleColors,
          })
        }, 300)
      }, 800)
    }
  }, [controls, isUserWinner, resultConfig.particlesColor, isMobile])

  return (
    <MotionBox
      h={containerH}
      minH={isMobile ? '320px' : undefined} // Ensure minimum height on mobile
      position="relative"
      overflow="hidden"
      borderRadius="3xl" // Slightly larger radius
      bgGradient={resultConfig.primaryGradient}
      boxShadow={`0 15px 50px -10px ${resultConfig.glowColor}`}
      animate={controls}
      p={padding}
    >
      <Box position="absolute" inset={0} overflow="hidden" zIndex={0}>
        {[...Array(isMobile ? 6 : 10)].map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            w={`${Math.random() * (isMobile ? 3 : 5) + 1}px`}
            h={`${Math.random() * (isMobile ? 3 : 5) + 1}px`}
            bg={resultConfig.particlesColor}
            borderRadius="full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0,
            }}
            animate={{
              y: ['-10px', '-100px'],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2.5,
              repeat: Infinity,
              delay: Math.random() * 2.5,
              ease: 'easeOut',
            }}
          />
        ))}
        <Box
          position="absolute"
          inset={0}
          bgGradient={resultConfig.secondaryGradient}
          opacity={0.3}
          mixBlendMode="hard-light" // Softer blend
        />
        <Box
          position="absolute"
          top="15%"
          left="50%"
          transform="translateX(-50%)"
          w={{ base: '200px', md: '250px' }}
          h={{ base: '200px', md: '250px' }}
          bgGradient={`radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)`}
          borderRadius="full"
        />
      </Box>

      <Flex
        position="relative"
        zIndex={1}
        h="100%"
        direction="column"
        justify="space-between"
        color="white"
      >
        <VStack spacing={{ base: 2, md: 3 }} textAlign="center">
          <MotionBox
            animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Circle
              size={circleSize}
              bg="rgba(255,255,255,0.15)"
              backdropFilter="blur(8px)"
              border="2px solid rgba(255,255,255,0.2)"
            >
              <Icon as={resultConfig.icon} boxSize={iconInCircleSize} />
            </Circle>
          </MotionBox>
          <VStack spacing={{ base: 1, md: 1.5 }}>
            <Heading
              fontSize={titleSize}
              fontWeight="extrabold" // Bolder
              letterSpacing="wide"
              textShadow="0 3px 15px rgba(0,0,0,0.4)"
            >
              {resultConfig.title}
            </Heading>
            <Text
              fontSize={subtitleSize}
              opacity={0.85}
              fontWeight="medium"
              letterSpacing="tight"
            >
              {resultConfig.subtitle}
            </Text>
          </VStack>
        </VStack>

        <MotionFlex
          justify="center"
          align="center"
          gap={{ base: 4, md: 6, lg: 8 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: showDetails ? 1 : 0, y: showDetails ? 0 : 15 }}
          transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
          my={{ base: 4, md: 0 }} // Margin for mobile
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
                <VStack spacing={1.5} display={{ base: 'none', md: 'flex' }}>
                  <Text fontSize="xl" fontWeight="bold" opacity={0.7}>
                    VS
                  </Text>
                  <Box w="1.5px" h="50px" bg="rgba(255,255,255,0.25)" />
                </VStack>
              )}
              <VStack spacing={{ base: 1.5, md: 2.5 }} flex={1} minW="120px">
                <Badge
                  bg="rgba(255,255,255,0.15)"
                  color="white"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="semibold"
                  backdropFilter="blur(5px)"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {userTeam === item.team ? t('YOUR TEAM') : t('OPPONENT')}
                </Badge>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="semibold"
                  noOfLines={1}
                >
                  {item.name}
                </Text>
                <MotionText
                  fontSize={scoreSize}
                  fontWeight="black"
                  lineHeight={1}
                  textShadow="0 0 25px rgba(255,255,255,0.4)"
                  animate={{
                    scale: [0.9, 1.1, 1],
                    textShadow: [
                      '0 0 15px rgba(255,255,255,0.25)',
                      '0 0 35px rgba(255,255,255,0.6)',
                      '0 0 25px rgba(255,255,255,0.4)',
                    ],
                  }}
                  transition={{
                    delay: 0.8 + index * 0.15,
                    duration: 1.2,
                    ease: 'elastic.out(1, 0.5)',
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
          transition={{ delay: 1.2, duration: 0.6 }}
          direction={{ base: 'column', sm: 'row' }} // Stack on very small screens
          gap={{ base: 3, sm: 0 }}
        >
          <HStack spacing={{ base: 2, md: 3 }}>
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
                px={{ base: 2, md: 2.5 }}
                py={1.5}
                borderRadius="lg"
                backdropFilter="blur(5px)"
                border="1px solid rgba(255,255,255,0.15)"
                fontSize="xs"
              >
                <Icon as={stat.icon} color={stat.color} boxSize={3} mr={1} />
                {stat.value} {stat.label}
              </Badge>
            ))}
          </HStack>
          <Button
            leftIcon={<Share2 size={16} />}
            bg="rgba(255,255,255,0.15)"
            color="white"
            backdropFilter="blur(8px)"
            border="1px solid rgba(255,255,255,0.25)"
            borderRadius="xl"
            px={{ base: 5, md: 6 }}
            py={3} // Adjusted padding
            fontSize={{ base: 'sm', md: 'sm' }}
            _hover={{
              bg: 'rgba(255,255,255,0.25)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.25s"
            onClick={onShare}
          >
            {t('Share Analysis')} {/* Changed from Share Victory */}
          </Button>
        </MotionFlex>
      </Flex>
    </MotionBox>
  )
}

export default BattleResultBanner
