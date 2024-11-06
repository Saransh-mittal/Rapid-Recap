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
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('GetStarted')
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
        align={{ base: 'center', lg: 'flex-start' }}
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
          {t('Features.premiumFeature')}
        </Badge>
        <Heading
          fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
          bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
          bgClip="text"
          textAlign={{ base: 'center', lg: 'left' }}
        >
          {title}
        </Heading>
        <Text
          color="whiteAlpha.800"
          fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
          textAlign={{ base: 'center', lg: 'left' }}
          px={{ base: 4, md: 0 }}
        >
          {description}
        </Text>
      </VStack>
    </Stack>
  )
}

const Features = () => {
  const { t } = useTranslation('GetStarted')

  const features = useMemo(
    () => [
      {
        icon: Newspaper,
        title: t('Features.features.curatedNews.title'),
        description: t('Features.features.curatedNews.description'),
      },
      {
        icon: Brain,
        title: t('Features.features.interactiveLearning.title'),
        description: t('Features.features.interactiveLearning.description'),
      },
      {
        icon: Trophy,
        title: t('Features.features.competitiveEdge.title'),
        description: t('Features.features.competitiveEdge.description'),
      },
      {
        icon: Award,
        title: t('Features.features.skillMastery.title'),
        description: t('Features.features.skillMastery.description'),
      },
    ],
    [t],
  )

  const uiSections = useMemo(
    () => [
      {
        image: '/images/landingPage/homeUI.webp',
        title: t('Features.uiSections.newsFeed.title'),
        description: t('Features.uiSections.newsFeed.description'),
        isImageLeft: true,
      },
      {
        image: '/images/landingPage/articleUI.webp',
        title: t('Features.uiSections.reading.title'),
        description: t('Features.uiSections.reading.description'),
        isImageLeft: false,
      },
      {
        image: '/images/landingPage/quizUI.webp',
        title: t('Features.uiSections.quiz.title'),
        description: t('Features.uiSections.quiz.description'),
        isImageLeft: true,
      },
      {
        image: '/images/landingPage/tournamentUI.webp',
        title: t('Features.uiSections.tournament.title'),
        description: t('Features.uiSections.tournament.description'),
        isImageLeft: false,
      },
      {
        image: '/images/landingPage/smartReading.jpg',
        title: t('Features.uiSections.smartReading.title'),
        description: t('Features.uiSections.smartReading.description'),
        isImageLeft: true,
        features: [
          {
            icon: Sparkles,
            text: t('Features.uiSections.smartReading.features.highlighting'),
          },
          {
            icon: BookOpenCheck,
            text: t('Features.uiSections.smartReading.features.dictionary'),
          },
        ],
      },
    ],
    [t],
  )

  return (
    <Box py={{ base: 10, md: 20 }} position="relative" overflow="hidden">
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 10, md: 16 }}>
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
              {t('Features.discoverFeatures')}
            </Badge>
            <Heading
              fontSize={{ base: '2xl', md: '4xl', lg: '5xl' }}
              bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
              bgClip="text"
              textAlign="center"
              px={{ base: 4, md: 0 }}
            >
              {t('Features.mainTitle')}
            </Heading>
            <Text
              fontSize={{ base: 'sm', md: 'lg', lg: 'xl' }}
              color="whiteAlpha.900"
              maxW="800px"
              textAlign="center"
              px={{ base: 4, md: 0 }}
            >
              {t('Features.subtitle')}
            </Text>
          </VStack>

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

          <VStack spacing={{ base: 12, md: 20 }} w="full">
            {uiSections.map((section, index) => (
              <UISection key={index} {...section} />
            ))}
          </VStack>
        </VStack>
      </Container>

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
