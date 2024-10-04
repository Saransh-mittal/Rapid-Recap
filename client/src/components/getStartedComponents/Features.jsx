import React, { Suspense } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Image,
  Container,
} from '@chakra-ui/react'
import { motion, useReducedMotion } from 'framer-motion'
import { ParallaxProvider, Parallax } from 'react-scroll-parallax'
import Newspaper from '../../assets/svg/Newspaper'
import { QuestionIcon } from '@chakra-ui/icons'
import Trophy from '../../assets/svg/Trophy'
import { useTranslation } from 'react-i18next'
const Footer = React.lazy(() => import('../Header-Footer/Footer'))

const MotionBox = motion(Box)

const FeatureItem = ({ Icon, titleKey, descriptionKey, delay }) => {
  const { t } = useTranslation('GetStarted')
  return (
    <MotionBox
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      bg="rgba(26, 32, 44, 0.8)"
      p={6}
      borderRadius="lg"
      backdropFilter="blur(10px)"
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems="center"
      justifyContent="flex-start"
      textAlign={{ base: 'center', md: 'left' }}
      width="100%"
    >
      <Flex
        w={{ base: '100%', md: 16 }}
        h={{ base: '100%', md: 16 }}
        mr={3}
        mb={{ base: 4, md: 0 }}
        justifyContent={'center'}
        alignItems={'flex-start'}
      >
        <Icon color="#4ecdc4" size={'28px'} fontSize={'28px'} fill="#4ecdc4" />
      </Flex>
      <Box>
        <Heading size="md" mb={2}>
          {t(titleKey)}
        </Heading>
        <Text fontSize="sm">{t(descriptionKey)}</Text>
      </Box>
    </MotionBox>
  )
}

const UISection = ({
  imageSrc,
  altTextKey,
  titleKey,
  descriptionKey,
  reverseLayout,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const { t } = useTranslation('GetStarted')

  return (
    <Flex
      flexDirection={{
        base: 'column',
        lg: reverseLayout ? 'row-reverse' : 'row',
      }}
      alignItems="center"
      justifyContent="space-between"
      mb={{ base: 16, lg: 32 }}
      px={4}
    >
      <Box width="100%" mb={{ base: 8, lg: 0 }} maxWidth={{ lg: '45%' }}>
        <Parallax
          translateY={shouldReduceMotion ? [0, 0] : [-10, 10]}
          speed={-2}
        >
          <Heading as="h3" size="lg" mb={4} color="brand.500">
            {t(titleKey)}
          </Heading>
          <Text fontSize={{ base: 'md', lg: 'lg' }}>{t(descriptionKey)}</Text>
        </Parallax>
      </Box>
      <Box width="100%" maxWidth={{ lg: '50%' }}>
        <Parallax
          translateY={shouldReduceMotion ? [0, 0] : [-15, 15]}
          speed={2}
        >
          <Image
            src={imageSrc}
            alt={t(altTextKey)}
            maxWidth="100%"
            maxHeight={{ base: '500px', lg: '100%' }}
            borderRadius="lg"
            loading="lazy"
            mx={'auto'}
          />
        </Parallax>
      </Box>
    </Flex>
  )
}

const Features = () => {
  const shouldReduceMotion = useReducedMotion()
  const { t } = useTranslation('GetStarted')

  return (
    <ParallaxProvider>
      <Box py={{ base: 10, md: 20 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.7)"
          backdropFilter="blur(5px)"
        />
        <Container
          maxWidth="1400px"
          position="relative"
          zIndex={1}
          px={{ base: 4, md: 6 }}
        >
          <Parallax
            translateY={shouldReduceMotion ? [0, 0] : [-10, 10]}
            speed={-2}
          >
            <Heading
              as="h2"
              textAlign="center"
              mb={{ base: 10, md: 16 }}
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="bold"
              color="brand.500"
            >
              {t('Features.mainTitle')}
            </Heading>
          </Parallax>

          <HStack
            display={{ base: 'none', md: 'flex' }}
            spacing={4}
            mb={{ base: 16, md: 32 }}
            alignItems="stretch"
          >
            <FeatureItem
              Icon={Newspaper}
              titleKey="Features.curatedNews.title"
              descriptionKey="Features.curatedNews.description"
              delay={0.2}
            />
            <FeatureItem
              Icon={QuestionIcon}
              titleKey="Features.interactiveQuizzes.title"
              descriptionKey="Features.interactiveQuizzes.description"
              delay={0.4}
            />
            <FeatureItem
              Icon={Trophy}
              titleKey="Features.competeAndLearn.title"
              descriptionKey="Features.competeAndLearn.description"
              delay={0.6}
            />
          </HStack>

          <VStack
            display={{ base: 'flex', md: 'none' }}
            spacing={6}
            mb={{ base: 16, md: 32 }}
          >
            <FeatureItem
              Icon={Newspaper}
              titleKey="Features.curatedNews.title"
              descriptionKey="Features.curatedNews.description"
              delay={0.2}
            />
            <FeatureItem
              Icon={QuestionIcon}
              titleKey="Features.interactiveQuizzes.title"
              descriptionKey="Features.interactiveQuizzes.description"
              delay={0.4}
            />
            <FeatureItem
              Icon={Trophy}
              titleKey="Features.competeAndLearn.title"
              descriptionKey="Features.competeAndLearn.description"
              delay={0.6}
            />
          </VStack>

          <UISection
            imageSrc="/images/landingPage/homeUI.webp"
            altTextKey="Features.personalizedNewsFeed.altText"
            titleKey="Features.personalizedNewsFeed.title"
            descriptionKey="Features.personalizedNewsFeed.description"
            reverseLayout={false}
          />

          <UISection
            imageSrc="/images/landingPage/articleUI.webp"
            altTextKey="Features.immersiveReading.altText"
            titleKey="Features.immersiveReading.title"
            descriptionKey="Features.immersiveReading.description"
            reverseLayout={true}
          />

          <UISection
            imageSrc="/images/landingPage/quizUI.webp"
            altTextKey="Features.engagingQuizzes.altText"
            titleKey="Features.engagingQuizzes.title"
            descriptionKey="Features.engagingQuizzes.description"
            reverseLayout={false}
          />

          <UISection
            imageSrc="/images/landingPage/tournamentUI.webp"
            altTextKey="Features.competitiveLearning.altText"
            titleKey="Features.competitiveLearning.title"
            descriptionKey="Features.competitiveLearning.description"
            reverseLayout={true}
          />
        </Container>
        <Suspense fallback={null}>
          <Flex position={'absolute'} bottom={0} w={'100%'}>
            <Footer />
          </Flex>
        </Suspense>
      </Box>
    </ParallaxProvider>
  )
}

export default Features
