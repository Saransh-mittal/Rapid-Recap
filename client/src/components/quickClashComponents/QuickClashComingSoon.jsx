// components/quickClashComponents/QuickClashComingSoon.jsx - PERFORMANCE OPTIMIZED VERSION
import React, { memo, useMemo } from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Badge,
  Icon,
  HStack,
  Circle,
  SimpleGrid,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Zap,
  Target,
  Trophy,
  BarChart3,
  Gift,
  Users,
  Sparkles,
  Sword,
  Shield,
  Gamepad2,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionVStack = motion(VStack)
const MotionText = motion(Text)

// Memoized floating particle component
const FloatingParticle = memo(({ delay = 0 }) => (
  <MotionBox
    position="absolute"
    w="3px"
    h="3px"
    bg="purple.400"
    borderRadius="full"
    opacity={0.4}
    initial={{ y: 100, x: Math.random() * 300, opacity: 0 }}
    animate={{
      y: -100,
      opacity: [0, 0.4, 0],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
))
FloatingParticle.displayName = 'FloatingParticle'

// Memoized background orb component
const BackgroundOrb = memo(({ position, color }) => (
  <MotionBox
    position="absolute"
    {...position}
    w="200px"
    h="200px"
    bg={`radial-gradient(circle, ${color}.400 0%, transparent 70%)`}
    borderRadius="full"
    opacity={0.1}
    animate={{
      scale: [1, 1.1, 1],
      opacity: [0.1, 0.2, 0.1],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
))
BackgroundOrb.displayName = 'BackgroundOrb'

// Memoized feature card component with optimized animations
const FeatureCard = memo(({ feature, icon, delay = 0 }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    whileHover={{
      y: -4,
      transition: { duration: 0.2 },
    }}
  >
    <Box
      p={6}
      bg="rgba(255, 255, 255, 0.03)"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      backdropFilter="blur(10px)"
      cursor="pointer"
      transition="all 0.3s ease"
      _hover={{
        borderColor: 'purple.400',
        bg: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <VStack spacing={3}>
        <Circle size="50px" bg="whiteAlpha.100" color="purple.300">
          <Icon as={icon} w={6} h={6} />
        </Circle>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="whiteAlpha.800"
          textAlign="center"
          lineHeight="short"
        >
          {feature.replace(/^[🎯⚡🏆📊🎁👥]\s*/, '')}
        </Text>
      </VStack>
    </Box>
  </MotionBox>
))
FeatureCard.displayName = 'FeatureCard'

// Memoized particles array to prevent recreation
const ParticlesArray = memo(() => (
  <>
    {[...Array(5)].map((_, i) => (
      <FloatingParticle key={i} delay={i * 2} />
    ))}
  </>
))
ParticlesArray.displayName = 'ParticlesArray'

// Static feature icons mapping (moved outside component to prevent recreation)
const FEATURE_ICONS = {
  '⚡ Lightning-fast battles': Zap,
  '🎯 Skill-based matchmaking': Target,
  '🏆 Tournament modes': Trophy,
  '📊 Advanced analytics': BarChart3,
  '🎁 Daily rewards': Gift,
  '👥ҡ Team challenges': Users,
}

// Static animation variants to prevent recreation
const ANIMATION_VARIANTS = {
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 1 },
  },
  logo: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  title: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.3, duration: 0.6 },
  },
  badge: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { delay: 0.5, duration: 0.5 },
  },
  description: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: 0.7, duration: 0.6 },
  },
  features: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 1, duration: 0.8 },
  },
  userInfo: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: 1.8, duration: 0.6 },
  },
}

const QuickClashComingSoon = memo(
  ({
    comingSoonData = {
      title: 'QuickClash',
      message: 'The ultimate competitive reading experience is coming soon.',
      description:
        'Get ready for intense battles, skill-based matchmaking, and competitive tournaments.',
      features: [
        '⚡ Lightning-fast battles',
        '🎯 Skill-based matchmaking',
        '🏆 Tournament modes',
        '📊 Advanced analytics',
        '🎁 Daily rewards',
        '👥 Team challenges',
      ],
      userInfo: {
        userId: 'Player',
        isEarlyAccess: false,
        isAdmin: false,
      },
    },
  }) => {
    // Memoize feature cards to prevent unnecessary re-renders
    const featureCards = useMemo(
      () =>
        comingSoonData.features.map((feature, index) => {
          const IconComponent = FEATURE_ICONS[feature] || Sparkles
          return (
            <FeatureCard
              key={feature} // Use feature as key since it's unique and stable
              feature={feature}
              icon={IconComponent}
              delay={1.2 + index * 0.1}
            />
          )
        }),
      [comingSoonData.features],
    )

    // Memoize user info section
    const userInfoSection = useMemo(() => {
      if (!comingSoonData.userInfo) return null

      return (
        <MotionBox {...ANIMATION_VARIANTS.userInfo}>
          <Box
            p={5}
            bg="rgba(255, 255, 255, 0.03)"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            backdropFilter="blur(10px)"
            maxW="sm"
          >
            <VStack spacing={3}>
              <HStack spacing={2}>
                <Icon as={Gamepad2} color="purple.400" w={4} h={4} />
                <Text color="whiteAlpha.700" fontSize="sm">
                  Welcome
                </Text>
              </HStack>
              <Text color="purple.300" fontWeight="semibold">
                {comingSoonData.userInfo.isAdmin ? 'Admin' : 'Player'}
              </Text>
              <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
                You'll be notified when QuickClash launches!
              </Text>
            </VStack>
          </Box>
        </MotionBox>
      )
    }, [comingSoonData.userInfo])

    return (
      <Box
        minH="100vh"
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #0f0f23 0%, #1a1b3a 50%, #000000 100%)"
      >
        {/* Static background elements */}
        <BackgroundOrb position={{ top: '10%', right: '10%' }} color="purple" />
        <BackgroundOrb position={{ bottom: '20%', left: '15%' }} color="blue" />

        {/* Memoized particles */}
        <ParticlesArray />

        <Container maxW="container.lg" py={20} position="relative" zIndex={10}>
          <MotionVStack
            spacing={16}
            textAlign="center"
            {...ANIMATION_VARIANTS.container}
          >
            {/* Hero Section */}
            <MotionVStack spacing={8}>
              {/* Logo */}
              <MotionBox {...ANIMATION_VARIANTS.logo}>
                <Box position="relative">
                  <Circle
                    size="80px"
                    bg="linear-gradient(135deg, purple.500, blue.500)"
                    boxShadow="0 0 40px rgba(139, 92, 246, 0.3)"
                  >
                    <Icon as={Sword} w={10} h={10} color="white" />
                  </Circle>

                  {/* Simplified orbiting shield with CSS animation for better performance */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    sx={{
                      animation: 'spin 20s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  >
                    <Icon
                      as={Shield}
                      position="absolute"
                      top="-5px"
                      right="-5px"
                      w={5}
                      h={5}
                      color="blue.400"
                    />
                  </Box>
                </Box>
              </MotionBox>

              {/* Title */}
              <VStack spacing={4}>
                <MotionText
                  fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                  fontWeight="bold"
                  bgGradient="linear(to-r, purple.400, blue.400)"
                  bgClip="text"
                  letterSpacing="tight"
                  {...ANIMATION_VARIANTS.title}
                >
                  {comingSoonData.title}
                </MotionText>

                {/* Status badge */}
                <MotionBox {...ANIMATION_VARIANTS.badge}>
                  <Badge
                    colorScheme="purple"
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="semibold"
                  >
                    Coming Soon
                  </Badge>
                </MotionBox>
              </VStack>

              {/* Description */}
              <MotionVStack
                spacing={4}
                maxW="2xl"
                {...ANIMATION_VARIANTS.description}
              >
                <Text
                  fontSize={{ base: 'lg', md: 'xl' }}
                  color="whiteAlpha.900"
                  lineHeight="relaxed"
                  fontWeight="medium"
                >
                  {comingSoonData.message}
                </Text>

                <Text
                  fontSize="md"
                  color="whiteAlpha.700"
                  lineHeight="relaxed"
                  maxW="xl"
                >
                  {comingSoonData.description}
                </Text>
              </MotionVStack>
            </MotionVStack>

            {/* Features Section */}
            <MotionBox w="100%" {...ANIMATION_VARIANTS.features}>
              <VStack spacing={8}>
                <HStack spacing={2}>
                  <Icon as={Sparkles} color="yellow.400" w={5} h={5} />
                  <Heading size="md" color="whiteAlpha.900">
                    What's Coming
                  </Heading>
                  <Icon as={Sparkles} color="yellow.400" w={5} h={5} />
                </HStack>

                {/* Memoized Feature Grid */}
                <SimpleGrid
                  columns={{ base: 2, md: 3 }}
                  spacing={4}
                  w="100%"
                  maxW="3xl"
                >
                  {featureCards}
                </SimpleGrid>
              </VStack>
            </MotionBox>

            {/* Memoized User Info */}
            {userInfoSection}
          </MotionVStack>
        </Container>
      </Box>
    )
  },
)

QuickClashComingSoon.displayName = 'QuickClashComingSoon'

export default QuickClashComingSoon
