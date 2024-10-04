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
const Footer = React.lazy(() => import('../Header-Footer/Footer'))

const MotionBox = motion(Box)

const FeatureItem = ({ Icon, title, description, delay }) => (
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
        {title}
      </Heading>
      <Text fontSize="sm">{description}</Text>
    </Box>
  </MotionBox>
)

const UISection = ({
  imageSrc,
  altText,
  title,
  description,
  reverseLayout,
}) => {
  const shouldReduceMotion = useReducedMotion()

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
            {title}
          </Heading>
          <Text fontSize={{ base: 'md', lg: 'lg' }}>{description}</Text>
        </Parallax>
      </Box>
      <Box width="100%" maxWidth={{ lg: '50%' }}>
        <Parallax
          translateY={shouldReduceMotion ? [0, 0] : [-15, 15]}
          speed={2}
        >
          <Image
            src={imageSrc}
            alt={altText}
            maxWidth="100%"
            maxHeight={{ base: '500px', lg: '100%' }}
            borderRadius="lg"
            boxShadow="2xl"
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
              Discover the Power of Rapid Recap
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
              title="Curated News"
              description="Stay updated with carefully selected news articles from trusted sources."
              delay={0.2}
            />
            <FeatureItem
              Icon={QuestionIcon}
              title="Interactive Quizzes"
              description="Test your knowledge with engaging quizzes based on the latest news."
              delay={0.4}
            />
            <FeatureItem
              Icon={Trophy}
              title="Compete & Learn"
              description="Challenge friends and climb the leaderboard while expanding your knowledge."
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
              title="Curated News"
              description="Stay updated with carefully selected news articles from trusted sources."
              delay={0.2}
            />
            <FeatureItem
              Icon={QuestionIcon}
              title="Interactive Quizzes"
              description="Test your knowledge with engaging quizzes based on the latest news."
              delay={0.4}
            />
            <FeatureItem
              Icon={Trophy}
              title="Compete & Learn"
              description="Challenge friends and climb the leaderboard while expanding your knowledge."
              delay={0.6}
            />
          </VStack>

          <UISection
            imageSrc="/images/landingPage/homeUI.webp"
            altText="Home Page Interface"
            title="Personalized News Feed"
            description="Our intelligent algorithm curates a personalized news feed tailored to your interests and reading habits. Stay informed on topics that matter most to you."
            reverseLayout={false}
          />

          <UISection
            imageSrc="/images/landingPage/articleUI.webp"
            altText="Article Page Interface"
            title="Immersive Reading Experience"
            description="Dive deep into articles with our clean, distraction-free reading interface. Enjoy a seamless experience that lets you focus on the content."
            reverseLayout={true}
          />

          <UISection
            imageSrc="/images/landingPage/quizUI.webp"
            altText="Quiz Interface"
            title="Engaging Quizzes"
            description="Test your knowledge with our interactive quizzes. Each quiz is designed to reinforce your learning and help you retain information from the articles you've read."
            reverseLayout={false}
          />

          <UISection
            imageSrc="/images/landingPage/tournamentUI.webp"
            altText="Tournament Interface"
            title="Competitive Learning"
            description="Join our weekend tournaments to compete with friends and other users. Climb the leaderboard, earn badges, and showcase your knowledge while having fun!"
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
