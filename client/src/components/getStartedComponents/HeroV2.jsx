import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Container,
  Input,
  InputGroup,
  InputRightElement,
  Flex,
  Grid,
  IconButton,
  Badge,
  Stack,
  Tooltip,
  useBreakpointValue,
  AspectRatio,
  Portal,
  SlideFade,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Search2Icon } from '@chakra-ui/icons'
import {
  Brain,
  Trophy,
  Target,
  Users,
  Star,
  BookOpen,
  Award,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { keyframes } from '@emotion/react'
import learner from '/images/learner.png'

// Constants for theme (same as before)
const COLORS = {
  accent: '#ED64A6',
  secondary: '#805AD5',
  darkBg: 'rgba(28, 25, 63, 0.7)',
  cardBorder: 'rgba(237, 100, 166, 0.2)',
}

// Existing animations and components remain the same
const shine = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`

// New floating animation for CTA
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

// Modified StatsCard with hover effect
const StatsCard = ({ icon: Icon, value, label }) => (
  <Box
    w={'100%'}
    bg={COLORS.darkBg}
    borderRadius="lg"
    p={4}
    border="1px solid"
    borderColor={COLORS.cardBorder}
    textAlign="center"
    transition="all 0.3s ease"
    _hover={{
      transform: 'translateY(-5px)',
      borderColor: COLORS.accent,
      boxShadow: `0 0 20px ${COLORS.accent}33`,
    }}
  >
    <VStack spacing={2}>
      <Icon size={20} color={COLORS.accent} />
      <Text fontSize="2xl" fontWeight="bold" color="white">
        {value}
      </Text>
      <Text fontSize="sm" color="whiteAlpha.800">
        {label}
      </Text>
    </VStack>
  </Box>
)

// Add this component definition in the same file, above the HeroV2 component
const TournamentBanner = () => (
  <Box
    as={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    bg="rgba(44, 41, 86, 0.8)"
    borderRadius="xl"
    overflow="hidden"
    position="relative"
    border="1px solid"
    borderColor={COLORS.cardBorder}
    _hover={{
      borderColor: COLORS.accent,
      transform: 'translateY(-2px)',
      transition: 'all 0.3s ease',
    }}
  >
    {/* Animated gradient border */}
    <Box
      bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
      position="absolute"
      top={0}
      left={0}
      right={0}
      h="4px"
      animation={`${shine} 3s linear infinite`}
      backgroundSize="200% auto"
    />

    <Stack
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align="center"
      p={6}
      spacing={4}
    >
      <HStack spacing={4}>
        <Box
          as={motion.div}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 1 }}
        >
          <Trophy color={COLORS.accent} size={30} />
        </Box>
        <VStack align="start" spacing={1}>
          <Text fontSize="xl" fontWeight="bold" color="white">
            Weekend Tournament Starting Soon
          </Text>
          <HStack spacing={4}>
            <Text color="whiteAlpha.800">Starts in 2 days</Text>
            <Badge
              bg="rgba(237, 100, 166, 0.1)"
              color={COLORS.accent}
              px={3}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Star size={12} />
              Elite Society Entry Badge
            </Badge>
          </HStack>
        </VStack>
      </HStack>

      <Button
        variant="outline"
        borderColor={COLORS.accent}
        color={COLORS.accent}
        _hover={{
          bg: 'rgba(237, 100, 166, 0.1)',
          transform: 'translateY(-2px)',
        }}
        leftIcon={<Star size={16} />}
        size={{ base: 'md', md: 'lg' }}
        px={6}
        transition="all 0.3s ease"
      >
        View Details
      </Button>
    </Stack>

    {/* Background particle effect */}
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      opacity={0.1}
      bg={`repeating-linear-gradient(
        45deg,
        ${COLORS.accent},
        ${COLORS.accent} 10px,
        transparent 10px,
        transparent 20px
      )`}
      zIndex={0}
      pointerEvents="none"
    />
  </Box>
)

// New component for floating CTA
const FloatingCTA = () => (
  <Portal>
    <SlideFade in={true} offsetY="20px">
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={1000}
        animation={`${float} 3s ease-in-out infinite`}
      >
        <Button
          size="lg"
          bg={COLORS.accent}
          color="white"
          px={8}
          py={6}
          fontSize="xl"
          rightIcon={<ArrowRight />}
          _hover={{
            bg: 'pink.500',
            transform: 'translateY(-2px) scale(1.05)',
          }}
        >
          Start Your Journey
        </Button>
      </Box>
    </SlideFade>
  </Portal>
)

const HeroV2 = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeUsers, setActiveUsers] = useState(37)
  const isMobile = useBreakpointValue({ base: true, md: false })

  // New scroll animation for stats
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      if (scrolled > 100) {
        setIsVisible(true)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Box minH="100vh" position="relative" py={8} mt={16}>
      <Container maxW="container.xl">
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={8}
          alignItems="center"
        >
          {/* Left Section - Modified for better hierarchy */}
          <VStack spacing={8} align="start">
            <VStack align="start" spacing={4} maxW="800px">
              <HStack
                bg="rgba(237, 100, 166, 0.1)"
                p={2}
                borderRadius="full"
                spacing={3}
              >
                <Badge
                  color={COLORS.accent}
                  bg="transparent"
                  px={2}
                  fontSize="sm"
                >
                  <HStack spacing={2}>
                    <Users size={14} />
                    <Text>{activeUsers} learners active now</Text>
                  </HStack>
                </Badge>
                <Badge
                  color="green.400"
                  bg="green.400"
                  opacity="0.2"
                  px={2}
                  borderRadius="full"
                >
                  Live
                </Badge>
              </HStack>

              <Heading
                fontSize={{ base: '2xl', md: '5xl' }}
                fontWeight="bold"
                bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
                bgClip="text"
                lineHeight="1.1"
                maxW={'600px'}
                w={{ base: 'full', md: '600px' }}
              >
                Turn News Into Knowledge
              </Heading>

              <Text
                fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                color="whiteAlpha.900"
              >
                Stay informed through friendly competition
              </Text>

              {/* Primary CTA moved up for better visibility */}
              <Button
                size="lg"
                bg={COLORS.accent}
                color="white"
                px={12}
                py={7}
                fontSize="xl"
                rightIcon={<ArrowRight />}
                _hover={{
                  bg: 'pink.500',
                  transform: 'translateY(-2px) scale(1.05)',
                }}
                boxShadow={`0 0 30px ${COLORS.accent}33`}
              >
                Start Your Journey
              </Button>

              <Text color="whiteAlpha.700" fontSize="sm">
                Free access to core features • No credit card required
              </Text>

              <InputGroup size="lg" maxW="500px" mt={4}>
                <Input
                  bg={COLORS.darkBg}
                  border="1px solid"
                  borderColor={COLORS.cardBorder}
                  _hover={{ borderColor: COLORS.accent }}
                  _focus={{
                    borderColor: COLORS.accent,
                    boxShadow: `0 0 0 1px ${COLORS.accent}`,
                  }}
                  placeholder="Search articles..."
                  size="lg"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <InputRightElement>
                  <IconButton
                    icon={<Search2Icon />}
                    variant="ghost"
                    color={COLORS.accent}
                    _hover={{ bg: 'transparent' }}
                  />
                </InputRightElement>
              </InputGroup>
            </VStack>

            {/* Stats Section with animation */}
            <Grid
              templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
              gap={4}
              w="full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5 }}
            >
              <StatsCard icon={BookOpen} value="5K+" label="Daily Quizzes" />
              <StatsCard icon={Users} value="1K+" label="Active Users" />
              <StatsCard icon={Award} value="500+" label="Elite Members" />
              <StatsCard icon={Trophy} value="50+" label="Tournaments" />
            </Grid>
          </VStack>

          {/* Right Section - Modified for better visual appeal */}
          {!isMobile && (
            <Box
              position="relative"
              w="90%"
              h="90%"
              display={{ base: 'none', lg: 'block' }}
            >
              <AspectRatio ratio={4 / 3}>
                <Box
                  as="img"
                  src={learner}
                  alt="Person using Rapid Recap"
                  objectFit="cover"
                  borderRadius="2xl"
                  // boxShadow={`0 0 40px ${COLORS.accent}33`}
                  filter="brightness(0.9)"
                  _hover={{
                    filter: 'brightness(1)',
                    transform: 'scale(1.02)',
                  }}
                  transition="all 0.3s ease"
                />
              </AspectRatio>

              {/* Floating elements around the image */}
              <Box
                position="absolute"
                top="10%"
                right="-5%"
                bg={COLORS.darkBg}
                p={4}
                borderRadius="xl"
                border="1px solid"
                borderColor={COLORS.cardBorder}
                animation={`${float} 3s ease-in-out infinite`}
              >
                <Trophy color={COLORS.accent} size={24} />
              </Box>

              <Box
                position="absolute"
                bottom="25%"
                left="-5%"
                bg={COLORS.darkBg}
                p={4}
                borderRadius="xl"
                border="1px solid"
                borderColor={COLORS.cardBorder}
                animation={`${float} 3s ease-in-out infinite 1s`}
              >
                <Brain color={COLORS.accent} size={24} />
              </Box>
            </Box>
          )}
        </Grid>

        {/* Tournament Banner - Enhanced with animation */}
        <Box mt={12}>
          <TournamentBanner />
        </Box>
      </Container>

      {/* Floating CTA for mobile */}
      {isMobile && <FloatingCTA />}
    </Box>
  )
}

export default HeroV2
