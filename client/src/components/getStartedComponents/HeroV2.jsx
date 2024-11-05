import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Container,
  Grid,
  Badge,
  useBreakpointValue,
  AspectRatio,
} from '@chakra-ui/react'
import {
  Brain,
  Trophy,
  Users,
  BookOpen,
  Languages,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { keyframes } from '@emotion/react'
import learner from '/images/learner.png'
import StatsCard from './StatsCard'
import TournamentBanner from './TournamentBanner'
import SmartCTA from './SmartCTA'
import FloatingAchievementBadge from './FloatingAchievementBadge'
import ArticleSearch from './ArticleSearch'
import { useInView } from 'react-intersection-observer'
import useSafeSound from '../../customHooks/useSafeSound'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import { useFeatureDetection } from '../../utils/featureDetection'

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

const HeroV2 = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: '-100px',
  })
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const dispatch = useDispatch()
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
              <Box ref={ref}>
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
                  onClick={() => {
                    playClick()
                    dispatch(setIsSigninOpen(true))
                  }}
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
            <ArticleSearch COLORS={COLORS} />
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
              <FloatingAchievementBadge
                icon={Trophy}
                position={{ top: '10%', right: '-5%' }}
                COLORS={COLORS}
              />

              <FloatingAchievementBadge
                icon={Brain}
                position={{ bottom: '25%', left: '-5%' }}
                delay={1.5} // Add delay for staggered animation
                COLORS={COLORS}
              />
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
            COLORS={COLORS}
          />
          <StatsCard
            icon={Clock}
            value="2500+"
            label="Minutes Daily"
            subtext="Learning time"
            COLORS={COLORS}
          />
          <StatsCard
            icon={Trophy}
            value="300+"
            label="Tournament Players"
            COLORS={COLORS}
            subtext="Monthly participants"
          />
          <StatsCard
            icon={BookOpen}
            value="120+"
            label="Daily Articles"
            COLORS={COLORS}
            subtext="Fresh content daily"
          />
        </Grid>
        <TournamentBanner COLORS={COLORS} shine={shine} />
        <SmartCTA isMainButtonVisible={!inView} COLORS={COLORS} />
      </Container>
    </Box>
  )
}

export default HeroV2
