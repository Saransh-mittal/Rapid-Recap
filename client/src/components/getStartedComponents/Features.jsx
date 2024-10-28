import React, { useMemo } from 'react'
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
import { motion } from 'framer-motion'
import { ParallaxProvider, Parallax } from 'react-scroll-parallax'
import Newspaper from '../../assets/svg/Newspaper'
import { QuestionIcon } from '@chakra-ui/icons'
import Trophy from '../../assets/svg/Trophy'
import { useTranslation } from 'react-i18next'
// const Footer = React.lazy(() => import('../Header-Footer/Footer'))
import Footer from '../Header-Footer/Footer'
const MotionBox = motion(Box)

const FeatureItem = ({
  Icon,
  titleKey,
  descriptionKey,
  delay,
  isWeakDevice,
}) => {
  const { t } = useTranslation('GetStarted')
  const ItemWrapper = isWeakDevice ? Box : MotionBox

  return (
    <ItemWrapper
      bg="rgba(26, 32, 44, 0.8)"
      p={6}
      borderRadius="lg"
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems="center"
      justifyContent="flex-start"
      textAlign={{ base: 'center', md: 'left' }}
      width="100%"
      height="100%"
      {...(isWeakDevice
        ? {}
        : {
            initial: { y: 20, opacity: 0 },
            whileInView: { y: 0, opacity: 1 },
            viewport: { once: true, margin: '-50px' },
            transition: { duration: 0.5, delay },
          })}
    >
      <Flex
        w={{ base: '100%', md: 16 }}
        h={{ base: 16, md: 16 }}
        mr={{ base: 0, md: 3 }}
        mb={{ base: 4, md: 0 }}
        justifyContent="center"
        alignItems="center"
      >
        <Icon color="#4ecdc4" size="28px" fontSize="28px" fill="#4ecdc4" />
      </Flex>
      <Box>
        <Heading size="md" mb={2}>
          {t(titleKey)}
        </Heading>
        <Text fontSize="sm">{t(descriptionKey)}</Text>
      </Box>
    </ItemWrapper>
  )
}

const UISection = ({
  imageSrc,
  altTextKey,
  titleKey,
  descriptionKey,
  reverseLayout,
  isWeakDevice,
}) => {
  const { t } = useTranslation('GetStarted')
  const ContentWrapper = isWeakDevice ? Box : Parallax

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
      mx={'5%'}
    >
      <Box width="100%" mb={{ base: 8, lg: 0 }} maxWidth={{ lg: '45%' }}>
        <ContentWrapper
          {...(isWeakDevice
            ? {}
            : {
                translateY: [-10, 10],
                speed: -2,
              })}
        >
          <Heading as="h3" size="lg" mb={4} color="brand.500">
            {t(titleKey)}
          </Heading>
          <Text fontSize={{ base: 'md', lg: 'lg' }}>{t(descriptionKey)}</Text>
        </ContentWrapper>
      </Box>

      <Box maxWidth={{ lg: '50%' }}>
        <ContentWrapper
          {...(isWeakDevice
            ? {}
            : {
                translateY: [-15, 15],
                speed: 2,
              })}
        >
          <Image
            src={imageSrc}
            alt={t(altTextKey)}
            maxWidth="100%"
            maxHeight={{ base: '500px', lg: '575px' }}
            borderRadius="lg"
            loading="lazy"
            mx="auto"
          />
        </ContentWrapper>
      </Box>
    </Flex>
  )
}

const Features = ({ isWeakDevice }) => {
  const { t } = useTranslation('GetStarted')

  const featuresData = useMemo(
    () => [
      {
        Icon: Newspaper,
        titleKey: 'Features.curatedNews.title',
        descriptionKey: 'Features.curatedNews.description',
        delay: 0.2,
      },
      {
        Icon: QuestionIcon,
        titleKey: 'Features.interactiveQuizzes.title',
        descriptionKey: 'Features.interactiveQuizzes.description',
        delay: 0.4,
      },
      {
        Icon: Trophy,
        titleKey: 'Features.competeAndLearn.title',
        descriptionKey: 'Features.competeAndLearn.description',
        delay: 0.6,
      },
    ],
    [],
  )

  const uiSectionsData = useMemo(
    () => [
      {
        imageSrc: '/images/landingPage/homeUI.webp',
        altTextKey: 'Features.personalizedNewsFeed.altText',
        titleKey: 'Features.personalizedNewsFeed.title',
        descriptionKey: 'Features.personalizedNewsFeed.description',
        reverseLayout: false,
      },
      {
        imageSrc: '/images/landingPage/articleUI.webp',
        altTextKey: 'Features.immersiveReading.altText',
        titleKey: 'Features.immersiveReading.title',
        descriptionKey: 'Features.immersiveReading.description',
        reverseLayout: true,
      },
      {
        imageSrc: '/images/landingPage/quizUI.webp',
        altTextKey: 'Features.engagingQuizzes.altText',
        titleKey: 'Features.engagingQuizzes.title',
        descriptionKey: 'Features.engagingQuizzes.description',
        reverseLayout: false,
      },
      {
        imageSrc: '/images/landingPage/tournamentUI.webp',
        altTextKey: 'Features.competitiveLearning.altText',
        titleKey: 'Features.competitiveLearning.title',
        descriptionKey: 'Features.competitiveLearning.description',
        reverseLayout: true,
      },
    ],
    [],
  )

  const ContentWrapper = isWeakDevice ? Box : ParallaxProvider

  return (
    <ContentWrapper>
      <Box py={{ base: 10, md: 20 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.7)"
        />
        <Container
          maxWidth="1400px"
          position="relative"
          zIndex={1}
          px={{ base: 4, md: 6 }}
        >
          <Box mb={{ base: 10, md: 16 }}>
            {isWeakDevice ? (
              <Heading
                as="h2"
                textAlign="center"
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="bold"
                color="brand.500"
              >
                {t('Features.mainTitle')}
              </Heading>
            ) : (
              <Parallax translateY={[-10, 10]} speed={-2}>
                <Heading
                  as="h2"
                  textAlign="center"
                  fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                  fontWeight="bold"
                  color="brand.500"
                >
                  {t('Features.mainTitle')}
                </Heading>
              </Parallax>
            )}
          </Box>

          <Box mb={{ base: 16, md: 32 }}>
            <HStack
              display={{ base: 'none', md: 'flex' }}
              spacing={4}
              alignItems="stretch"
            >
              {featuresData.map((feature, index) => (
                <Box key={index} flex="1">
                  <FeatureItem {...feature} isWeakDevice={isWeakDevice} />
                </Box>
              ))}
            </HStack>

            <VStack display={{ base: 'flex', md: 'none' }} spacing={6}>
              {featuresData.map((feature, index) => (
                <FeatureItem
                  key={index}
                  {...feature}
                  isWeakDevice={isWeakDevice}
                />
              ))}
            </VStack>
          </Box>

          {uiSectionsData.map((section, index) => (
            <UISection key={index} {...section} isWeakDevice={isWeakDevice} />
          ))}
        </Container>

        <Flex position="absolute" bottom={0} w="100%">
          <Footer />
        </Flex>
      </Box>
    </ContentWrapper>
  )
}

export default Features
