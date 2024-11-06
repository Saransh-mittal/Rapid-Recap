import React, { useMemo } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  AspectRatio,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Brain,
  Trophy,
  BookOpen,
  Star,
  TrendingUp,
  Newspaper,
  Award,
  Sparkles,
  BookOpenCheck,
} from 'lucide-react'

// Constants remain the same
const COLORS = {
  accent: '#ED64A6',
  secondary: '#805AD5',
  darkBg: 'rgba(28, 25, 63, 0.9)',
  cardBorder: 'rgba(237, 100, 166, 0.2)',
}

const MotionBox = motion(Box)

// FeatureCard component remains the same
const FeatureCard = ({ icon: Icon, title, description, delay, index }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay }}
    bg={COLORS.darkBg}
    borderRadius="xl"
    p={6}
    border="1px solid"
    borderColor={COLORS.cardBorder}
    _hover={{
      transform: 'translateY(-5px)',
      borderColor: COLORS.accent,
      boxShadow: `0 0 20px ${COLORS.accent}33`,
    }}
    // transition="all 0.3s ease"
    height="100%"
  >
    <VStack spacing={4} align="flex-start">
      <Box
        bg={`rgba(237, 100, 166, 0.1)`}
        p={3}
        borderRadius="lg"
        color={COLORS.accent}
      >
        <Icon size={24} />
      </Box>
      <Heading size="md" color="white">
        {title}
      </Heading>
      <Text color="whiteAlpha.800" fontSize="sm">
        {description}
      </Text>
    </VStack>
  </MotionBox>
)

// Updated UISection component with proper alternating layout
const UISection = ({ image, title, description, isImageLeft, delay }) => (
  <MotionBox
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay }}
    mb={20}
  >
    <Grid
      templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
      gap={12}
      alignItems="center"
    >
      {/* Image Section */}
      <Box
        position="relative"
        borderRadius="2xl"
        overflow="hidden"
        order={{
          base: 0,
          lg: isImageLeft ? 0 : 1,
        }}
      >
        <AspectRatio ratio={16 / 9}>
          <Box
            as="img"
            src={image}
            alt={title}
            objectFit="cover"
            w="100%"
            h="100%"
            transition="transform 0.3s ease"
            _hover={{ transform: 'scale(1.05)' }}
          />
        </AspectRatio>
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)"
          opacity={0.5}
        />
      </Box>

      {/* Text Section */}
      <VStack
        align={isImageLeft ? 'flex-end' : 'flex-start'}
        spacing={6}
        order={{
          base: 1,
          lg: isImageLeft ? 1 : 0,
        }}
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
        >
          <Star size={12} />
          Premium Feature
        </Badge>
        <Heading
          fontSize={{ base: '2xl', md: '3xl' }}
          bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
          bgClip="text"
          textAlign={{ base: 'center', lg: isImageLeft ? 'right' : 'left' }}
        >
          {title}
        </Heading>
        <Text
          color="whiteAlpha.800"
          fontSize={{ base: 'md', lg: 'lg' }}
          textAlign={{ base: 'center', lg: isImageLeft ? 'right' : 'left' }}
        >
          {description}
        </Text>
      </VStack>
    </Grid>
  </MotionBox>
)

const Features = ({ isWeakDevice = false }) => {
  // Features array remains the same
  const features = useMemo(
    () => [
      {
        icon: Newspaper,
        title: 'Curated Daily News',
        description:
          'Hand-picked articles covering the most important topics across multiple domains.',
        delay: 0.2,
      },
      {
        icon: Brain,
        title: 'Interactive Learning',
        description:
          'Engage with content through quizzes and challenges designed to enhance retention.',
        delay: 0.3,
      },
      {
        icon: Trophy,
        title: 'Competitive Edge',
        description:
          'Participate in tournaments and climb the leaderboard while learning.',
        delay: 0.4,
      },
      {
        icon: Award,
        title: 'Skill Mastery',
        description:
          'Track your progress and earn badges as you develop expertise in various topics.',
        delay: 0.5,
      },
    ],
    [],
  )

  // Updated uiSections with isImageLeft property
  const uiSections = useMemo(
    () => [
      {
        image: '/images/landingPage/homeUI.webp',
        title: 'Personalized News Feed',
        description:
          'Get news tailored to your interests and learning goals, all in one place.',
        isImageLeft: true,
        delay: 0.3,
      },
      {
        image: '/images/landingPage/articleUI.webp',
        title: 'Immersive Reading Experience',
        description:
          'Enjoy a clean, distraction-free interface designed for maximum comprehension.',
        isImageLeft: false,
        delay: 0.4,
      },
      {
        image: '/images/landingPage/quizUI.webp',
        title: 'Engaging Quiz Interface',
        description:
          'Challenge yourself with interactive quizzes that make learning fun and effective.',
        isImageLeft: true,
        delay: 0.5,
      },
      {
        image: '/images/landingPage/tournamentUI.webp',
        title: 'Tournament System',
        description:
          'Compete with others in weekly tournaments and showcase your knowledge.',
        isImageLeft: false,
        delay: 0.6,
      },
      {
        image: '/images/landingPage/smartReading.jpg',
        title: 'Smart Reading Assistant',
        description:
          'Experience enhanced comprehension with AI-powered highlighting of key points and instant access to word definitions. Yellow highlights emphasize crucial information while purple-shaded words provide instant dictionary definitions on hover.',
        isImageLeft: true,
        delay: 0.7,
        // features: [
        //   {
        //     icon: Sparkles,
        //     text: 'AI-powered highlighting of important sentences',
        //   },
        //   {
        //     icon: BookOpenCheck,
        //     text: 'Interactive dictionary with contextual definitions',
        //   },
        // ],
      },
    ],
    [],
  )

  return (
    <Box py={20} position="relative" overflow="hidden">
      <Container maxW="container.xl">
        <VStack spacing={16}>
          {/* Header Section */}
          <VStack spacing={4} textAlign="center">
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
              <TrendingUp size={12} />
              Discover Our Features
            </Badge>
            <Heading
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
              bgClip="text"
              mb={4}
            >
              Everything You Need to Excel
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="whiteAlpha.900"
              maxW="800px"
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
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={8}
            w="full"
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </Grid>

          {/* UI Sections with alternating layout */}
          <VStack spacing={20} w="full">
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
