import React, { useMemo } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Grid,
  Badge,
  AspectRatio,
  useBreakpointValue,
  Stack,
} from '@chakra-ui/react'
import {
  Brain,
  Trophy,
  Star,
  TrendingUp,
  Newspaper,
  Award,
  BookOpen,
  Sparkles,
  BookOpenCheck,
} from 'lucide-react'

const COLORS = {
  accent: '#ED64A6',
  secondary: '#805AD5',
  darkBg: 'rgba(28, 25, 63, 0.9)',
  cardBorder: 'rgba(237, 100, 166, 0.2)',
}

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Box
    bg={COLORS.darkBg}
    borderRadius="xl"
    p={{ base: 4, md: 6 }}
    border="1px solid"
    borderColor={COLORS.cardBorder}
    _hover={{
      transform: 'translateY(-5px)',
      borderColor: COLORS.accent,
      boxShadow: `0 0 20px ${COLORS.accent}33`,
    }}
    transition="all 0.3s ease"
    height="100%"
  >
    <VStack spacing={{ base: 3, md: 4 }} align="center">
      <Box
        bg={`rgba(237, 100, 166, 0.1)`}
        p={3}
        borderRadius="lg"
        color={COLORS.accent}
      >
        <Icon size={24} />
      </Box>
      <Heading size={{ base: 'sm', md: 'md' }} color="white" textAlign="center">
        {title}
      </Heading>
      <Text
        color="whiteAlpha.800"
        fontSize={{ base: 'xs', md: 'sm' }}
        textAlign="center"
      >
        {description}
      </Text>
    </VStack>
  </Box>
)

const UISection = ({ image, title, description, isImageLeft }) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      spacing={{ base: 6, lg: 12 }}
      align="center"
      w="full"
      position="relative"
      pb={{ base: 12, md: 20 }}
      _after={{
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: { base: '80%', md: '60%' },
        height: '1px',
        background: `linear-gradient(90deg,
          transparent 0%,
          ${COLORS.accent}33 15%,
          ${COLORS.accent} 50%,
          ${COLORS.accent}33 85%,
          transparent 100%
        )`,
        opacity: 0.5,
      }}
      _last={{
        pb: 0,
        _after: {
          display: 'none',
        },
      }}
    >
      <Box
        w={{ base: 'full', lg: '50%' }}
        order={isMobile ? 0 : isImageLeft ? 0 : 1}
      >
        <AspectRatio ratio={16 / 9}>
          <Box
            as="img"
            src={image}
            alt={title}
            objectFit="cover"
            w="100%"
            h="100%"
            borderRadius="2xl"
            transition="transform 0.3s ease"
            _hover={{ transform: 'scale(1.05)' }}
          />
        </AspectRatio>
      </Box>

      <VStack
        w={{ base: 'full', lg: '50%' }}
        align={{ base: 'center', lg: isImageLeft ? 'flex-start' : 'flex-end' }}
        spacing={{ base: 4, md: 6 }}
        order={isMobile ? 1 : isImageLeft ? 1 : 0}
      >
        <Badge
          bg="rgba(237, 100, 166, 0.1)"
          color={COLORS.accent}
          px={3}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={2}
          boxShadow={`0 0 10px ${COLORS.accent}33`}
        >
          <Star size={12} />
          Premium Feature
        </Badge>
        <Heading
          fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
          bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
          bgClip="text"
          textAlign={{ base: 'center', lg: isImageLeft ? 'left' : 'right' }}
        >
          {title}
        </Heading>
        <Text
          color="whiteAlpha.800"
          fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
          textAlign={{ base: 'center', lg: isImageLeft ? 'left' : 'right' }}
          px={{ base: 4, md: 0 }}
        >
          {description}
        </Text>
      </VStack>
    </Stack>
  )
}

const Features = () => {
  const features = useMemo(
    () => [
      {
        icon: Newspaper,
        title: 'Curated Daily News',
        description:
          'Hand-picked articles covering the most important topics across multiple domains.',
      },
      {
        icon: Brain,
        title: 'Interactive Learning',
        description:
          'Engage with content through quizzes and challenges designed to enhance retention.',
      },
      {
        icon: Trophy,
        title: 'Competitive Edge',
        description:
          'Participate in tournaments and climb the leaderboard while learning.',
      },
      {
        icon: Award,
        title: 'Skill Mastery',
        description:
          'Track your progress and earn badges as you develop expertise in various topics.',
      },
    ],
    [],
  )

  const uiSections = useMemo(
    () => [
      {
        image: '/images/landingPage/homeUI.webp',
        title: 'Personalized News Feed',
        description:
          'Get news tailored to your interests and learning goals, all in one place.',
        isImageLeft: true,
      },
      {
        image: '/images/landingPage/articleUI.webp',
        title: 'Immersive Reading Experience',
        description:
          'Enjoy a clean, distraction-free interface designed for maximum comprehension.',
        isImageLeft: false,
      },
      {
        image: '/images/landingPage/quizUI.webp',
        title: 'Engaging Quiz Interface',
        description:
          'Challenge yourself with interactive quizzes that make learning fun and effective.',
        isImageLeft: true,
      },
      {
        image: '/images/landingPage/tournamentUI.webp',
        title: 'Tournament System',
        description:
          'Compete with others in weekly tournaments and showcase your knowledge.',
        isImageLeft: false,
      },
      {
        image: '/images/landingPage/smartReading.jpg',
        title: 'Smart Reading Assistant',
        description:
          'Experience enhanced comprehension with AI-powered highlighting of key points and instant access to word definitions. Yellow highlights emphasize crucial information while purple-shaded words provide instant dictionary definitions on hover.',
        isImageLeft: true,
        features: [
          {
            icon: Sparkles,
            text: 'AI-powered highlighting of important sentences',
          },
          {
            icon: BookOpenCheck,
            text: 'Interactive dictionary with contextual definitions',
          },
        ],
      },
    ],
    [],
  )

  return (
    <Box py={{ base: 10, md: 20 }} position="relative" overflow="hidden">
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 10, md: 16 }}>
          {/* Header Section */}
          <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
            <Badge
              bg="rgba(237, 100, 166, 0.1)"
              color={COLORS.accent}
              px={3}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={2}
              fontSize="sm"
            >
              <TrendingUp size={12} />
              Discover Our Features
            </Badge>
            <Heading
              fontSize={{ base: '2xl', md: '4xl', lg: '5xl' }}
              bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
              bgClip="text"
              textAlign="center"
              px={{ base: 4, md: 0 }}
            >
              Everything You Need to Excel
            </Heading>
            <Text
              fontSize={{ base: 'sm', md: 'lg', lg: 'xl' }}
              color="whiteAlpha.900"
              maxW="800px"
              textAlign="center"
              px={{ base: 4, md: 0 }}
            >
              Transform your learning journey with our comprehensive suite of
              features designed to make knowledge acquisition engaging and
              effective.
            </Text>
          </VStack>

          {/* Features Grid */}
          <Grid
            templateColumns={{
              base: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={{ base: 4, md: 8 }}
            w="full"
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </Grid>

          {/* UI Sections */}
          <VStack spacing={{ base: 12, md: 20 }} w="full">
            {uiSections.map((section, index) => (
              <UISection key={index} {...section} />
            ))}
          </VStack>
        </VStack>
      </Container>

      {/* Background Element */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={`radial(circle at 50% 50%, ${COLORS.accent}11 0%, transparent 70%)`}
        zIndex="-1"
      />
    </Box>
  )
}

export default Features
