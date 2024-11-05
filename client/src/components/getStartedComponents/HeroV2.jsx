import React, { useState, useEffect, useRef } from 'react'
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
  Stat,
  StatNumber,
  StatLabel,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
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
  Languages,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { keyframes } from '@emotion/react'
import learner from '/images/learner.png'

// Constants
const COLORS = {
  accent: '#ED64A6',
  secondary: '#805AD5',
  darkBg: 'rgba(28, 25, 63, 0.9)',
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

// Enhanced StatsCard with animation and better visual hierarchy
const StatsCard = ({ icon: Icon, value, label, subtext }) => (
  <Box
    as={motion.div}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    w="100%"
    bg={COLORS.darkBg}
    borderRadius="xl"
    p={3}
    border="1px solid"
    borderColor={COLORS.cardBorder}
    _hover={{
      transform: 'translateY(-5px)',
      borderColor: COLORS.accent,
      boxShadow: `0 0 20px ${COLORS.accent}33`,
    }}
  >
    <VStack spacing={2}>
      <Icon size={24} color={COLORS.accent} />
      <Stat textAlign="center">
        <StatNumber fontSize="2xl" fontWeight="bold" color="white">
          {value}
        </StatNumber>
        <StatLabel fontSize={'sm'} color="whiteAlpha.800">
          {label}
        </StatLabel>
      </Stat>
      {subtext && (
        <Text mt={-3} fontSize="xs" color="whiteAlpha.600">
          {subtext}
        </Text>
      )}
    </VStack>
  </Box>
)

// Add this component definition in the same file, above the HeroV2 component
const TournamentBanner = () => (
  <Box
    mt={8}
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

// Enhanced Smart CTA Component
const SmartCTA = ({ isMainButtonVisible }) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <AnimatePresence>
      {!isMainButtonVisible && (
        <Portal>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <Box
              position="fixed"
              bottom={4}
              right={4}
              zIndex={1000}
              bg="rgba(28, 25, 63, 0.95)"
              borderRadius="xl"
              p={2}
              backdropFilter="blur(8px)"
              border="1px solid"
              borderColor="rgba(237, 100, 166, 0.2)"
              boxShadow="lg"
            >
              <Button
                size="lg"
                bg={COLORS.accent}
                color="white"
                px={8}
                py={6}
                fontSize={isMobile ? 'md' : 'xl'}
                rightIcon={<TrendingUp />}
                _hover={{
                  bg: 'pink.500',
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: `0 0 20px ${COLORS.accent}33`,
                }}
                transition="all 0.3s ease"
              >
                Start Learning Free
              </Button>
            </Box>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  )
}

const HeroV2 = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMainButtonVisible, setIsMainButtonVisible] = useState(true)
  const mainButtonRef = useRef(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainButtonVisible(entry.isIntersecting)
      },
      {
        threshold: 0.5,
        rootMargin: '-100px',
      },
    )

    if (mainButtonRef.current) {
      observer.observe(mainButtonRef.current)
    }

    return () => observer.disconnect()
  }, [])
  return (
    <Box minH="100vh" position="relative" py={8} mt={16}>
      <Container maxW="container.xl">
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={8}
          alignItems="center"
        >
          {/* Left Section */}

          <VStack
            align="start"
            spacing={4}
            alignItems={{ base: 'center', lg: 'flex-start' }}
            w={'100%'}
          >
            {/* Language Badge */}
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
                  <Languages size={14} />
                  <Text>Available in English & हिंदी</Text>
                </HStack>
              </Badge>
              <Badge color="green" px={2} borderRadius="full">
                Live
              </Badge>
            </HStack>

            {/* Main Heading with Social Proof */}
            <Box>
              <Heading
                fontSize={{ base: '4xl', md: '4xl', lg: '5xl' }}
                fontWeight="bold"
                bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
                bgClip="text"
                lineHeight="1.1"
                mb={4}
                textAlign={{ base: 'center', lg: 'left' }}
              >
                Turn News into Knowledge
              </Heading>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="whiteAlpha.900"
                maxW="600px"
                textAlign={{ base: 'center', lg: 'left' }}
              >
                Join 1000+ monthly active learners who stay ahead through
                interactive news quizzes and competitive learning
              </Text>
            </Box>

            {/* CTA Section */}
            <VStack
              align="start"
              spacing={4}
              w="100%"
              mt={4}
              alignItems={{
                base: 'center',
                lg: 'flex-start',
              }}
            >
              <Box ref={mainButtonRef}>
                <Button
                  size="lg"
                  bg={COLORS.accent}
                  color="white"
                  px={12}
                  py={7}
                  fontSize="xl"
                  rightIcon={<TrendingUp />}
                  _hover={{
                    bg: 'pink.500',
                    transform: 'translateY(-2px) scale(1.05)',
                  }}
                  boxShadow={`0 0 30px ${COLORS.accent}33`}
                >
                  Start Learning Free
                </Button>
              </Box>

              <HStack spacing={4} wrap="wrap">
                <Badge variant="outline" colorScheme="pink">
                  ✓ No credit card
                </Badge>
                <Badge variant="outline" colorScheme="pink">
                  ✓ 120+ daily articles
                </Badge>
                <Badge variant="outline" colorScheme="pink">
                  ✓ Weekly tournaments
                </Badge>
              </HStack>
            </VStack>

            {/* Search Bar */}
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
                placeholder="Search from 120+ daily articles..."
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

          {/* Right Section - Hero Image */}
          {!isMobile && (
            <Box
              position="relative"
              w="90%"
              h="100%"
              display={{ base: 'none', lg: 'block' }}
            >
              <AspectRatio ratio={4 / 3}>
                <Box
                  as="img"
                  src={learner}
                  alt="Student using Rapid Recap for daily learning"
                  objectFit="cover"
                  borderRadius="2xl"
                  filter="brightness(0.9)"
                  _hover={{
                    filter: 'brightness(1)',
                    transform: 'scale(1.02)',
                  }}
                  transition="all 0.3s ease"
                />
              </AspectRatio>

              {/* Floating Achievement Badges */}
              <Box
                position="absolute"
                top="10%"
                right="-5%"
                bg={COLORS.darkBg}
                p={4}
                borderRadius="xl"
                border="1px solid"
                borderColor={COLORS.cardBorder}
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
              >
                <Brain color={COLORS.accent} size={24} />
              </Box>
            </Box>
          )}
        </Grid>
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          gap={4}
          w="full"
          mt={8}
        >
          <StatsCard
            icon={Users}
            value="1000+"
            label="Monthly Users"
            subtext="Growing community"
          />
          <StatsCard
            icon={Clock}
            value="2500+"
            label="Minutes Daily"
            subtext="Learning time"
          />
          <StatsCard
            icon={Trophy}
            value="300+"
            label="Tournament Players"
            subtext="Monthly participants"
          />
          <StatsCard
            icon={BookOpen}
            value="120+"
            label="Daily Articles"
            subtext="Fresh content daily"
          />
        </Grid>
        <TournamentBanner />
        <SmartCTA isMainButtonVisible={isMainButtonVisible} />
      </Container>
    </Box>
  )
}

export default HeroV2
