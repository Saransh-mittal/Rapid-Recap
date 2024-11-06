import React from 'react'
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Container,
  useBreakpointValue,
  Badge,
  Circle,
  useMediaQuery,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Parallax, ParallaxProvider } from 'react-scroll-parallax'
import { useTranslation } from 'react-i18next'
import {
  Newspaper,
  Brain,
  BarChart,
  Trophy,
  Globe,
  Rocket,
  ChevronDown,
} from 'lucide-react'
import { keyframes } from '@emotion/react'

const MotionBox = motion(Box)

// Define color scheme to match hero
const COLORS = {
  accent: '#ED64A6',
  secondary: '#805AD5',
  darkBg: 'rgba(28, 25, 63, 0.9)',
  cardBorder: 'rgba(237, 100, 166, 0.2)',
}

// Pulse animation for icons
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

// Floating animation
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const BenefitCard = ({
  icon: Icon,
  title,
  description,
  index,
  isLarge = false,
}) => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      bg={COLORS.darkBg}
      p={{ base: 4, md: 6 }}
      borderRadius="xl"
      border="1px solid"
      borderColor={COLORS.cardBorder}
      _hover={{
        borderColor: COLORS.accent,
        transform: 'translateY(-5px)',
        boxShadow: `0 0 20px ${COLORS.accent}33`,
      }}
      // transition="all 0.3s ease"
      height="100%"
      width="100%"
      position="relative"
      overflow="hidden"
    >
      {/* Gradient overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="4px"
        bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
      />

      <VStack spacing={4} align="center">
        <Circle
          size={{ base: '50px', md: isLarge ? '80px' : '60px' }}
          bg="rgba(237, 100, 166, 0.1)"
          color={COLORS.accent}
          position="relative"
          _hover={{
            animation: `${pulseAnimation} 2s infinite`,
          }}
        >
          <Icon size={isLargerThan768 ? (isLarge ? 32 : 24) : 20} />
        </Circle>

        <Heading
          size={{ base: 'sm', md: isLarge ? 'lg' : 'md' }}
          color="white"
          fontWeight="bold"
          textAlign="center"
        >
          {title}
        </Heading>

        <Text
          color="whiteAlpha.800"
          fontSize={{ base: 'xs', md: isLarge ? 'md' : 'sm' }}
          textAlign="center"
          lineHeight="tall"
        >
          {description}
        </Text>

        {isLarge && (
          <Badge
            colorScheme="pink"
            fontSize={{ base: 'xs', md: 'sm' }}
            px={3}
            py={1}
            borderRadius="full"
            bg="rgba(237, 100, 166, 0.1)"
          >
            Key Feature
          </Badge>
        )}
      </VStack>
    </MotionBox>
  )
}

const ConnectingArrow = () => (
  <Box textAlign="center" py={2} display={{ base: 'block', md: 'none' }}>
    <ChevronDown
      size={24}
      color={COLORS.accent}
      style={{
        animation: `${floatAnimation} 2s infinite`,
        margin: '0 auto',
      }}
    />
  </Box>
)

const ConnectingLine = ({ direction = 'right' }) => (
  <Flex
    justify="center"
    align="center"
    flex={1}
    px={4}
    position="relative"
    display={{ base: 'none', md: 'flex' }}
  >
    <Box
      h="2px"
      w="100%"
      bg={`linear-gradient(to ${direction}, ${COLORS.accent}, ${COLORS.secondary})`}
      position="relative"
    >
      <Circle
        size="12px"
        bg={COLORS.accent}
        position="absolute"
        right={direction === 'right' ? '-6px' : 'auto'}
        left={direction === 'left' ? '-6px' : 'auto'}
        top="-5px"
      />
    </Box>
  </Flex>
)

const BenefitsMap = ({ isWeakDevice }) => {
  const { t } = useTranslation('GetStarted')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const ContentWrapper = isWeakDevice ? Box : ParallaxProvider

  const benefits = [
    {
      icon: Newspaper,
      title: 'Curated News',
      description:
        'Access high-quality, tailored news content that matters to you',
    },
    {
      icon: Brain,
      title: 'Active Learning',
      description:
        'Engage with interactive quizzes to reinforce your understanding',
    },
    {
      icon: BarChart,
      title: 'Track Progress',
      description: 'Monitor your growth & information quotient (IQ)',
    },
  ]

  const centralFeature = {
    icon: Trophy,
    title: 'Information Retention Mastery',
    description:
      'Transform how you consume and retain information through our scientifically-backed approach combining active recall and spaced repetition.',
  }

  const bottomBenefits = [
    {
      icon: Trophy,
      title: 'Competitive Edge',
      description: 'Excel in your professional and academic pursuits',
    },
    {
      icon: Globe,
      title: 'Informed Citizen',
      description: 'Contribute meaningfully to societal discussions',
    },
    {
      icon: Rocket,
      title: 'Personal Growth',
      description: 'Continuously expand your knowledge and capabilities',
    },
  ]

  return (
    <ContentWrapper>
      <Box
        py={{ base: 10, md: 20 }}
        position="relative"
        // background="linear-gradient(180deg, rgba(28, 25, 63, 0.95) 0%, rgba(28, 25, 63, 0.98) 100%)"
      >
        <Container maxW="1400px" px={{ base: 4, md: 8 }}>
          {/* Main Title */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            mb={{ base: 10, md: 16 }}
            textAlign="center"
          >
            <Badge
              colorScheme="pink"
              px={3}
              py={1}
              mb={4}
              fontSize={{ base: 'xs', md: 'sm' }}
              borderRadius="full"
              bg="rgba(237, 100, 166, 0.1)"
            >
              Your Learning Journey
            </Badge>
            <Heading
              as="h2"
              fontSize={{ base: '2xl', md: '4xl', lg: '5xl' }}
              bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
              bgClip="text"
              fontWeight="bold"
              letterSpacing="tight"
              px={{ base: 4, md: 0 }}
            >
              Empowering Your Knowledge Journey
            </Heading>
          </MotionBox>

          {/* Top Benefits */}
          <VStack spacing={{ base: 4, md: 6 }} mb={{ base: 8, md: 12 }}>
            {benefits.map((benefit, index) => (
              <React.Fragment key={benefit.title}>
                <Box width="100%">
                  <BenefitCard {...benefit} index={index} />
                </Box>
                {index < benefits.length - 1 &&
                  (isMobile ? (
                    <ConnectingArrow />
                  ) : (
                    <ConnectingLine
                      direction={index % 2 === 0 ? 'right' : 'left'}
                    />
                  ))}
              </React.Fragment>
            ))}
          </VStack>

          {/* Central Feature */}
          <Box
            width="100%"
            mb={{ base: 8, md: 12 }}
            px={{ base: 0, md: 8, lg: 16 }}
          >
            <BenefitCard {...centralFeature} isLarge={true} index={3} />
          </Box>

          {/* Bottom Benefits */}
          <VStack spacing={{ base: 4, md: 6 }}>
            {bottomBenefits.map((benefit, index) => (
              <React.Fragment key={benefit.title}>
                <Box width="100%">
                  <BenefitCard {...benefit} index={index + 4} />
                </Box>
                {index < bottomBenefits.length - 1 &&
                  (isMobile ? (
                    <ConnectingArrow />
                  ) : (
                    <ConnectingLine
                      direction={index % 2 === 0 ? 'right' : 'left'}
                    />
                  ))}
              </React.Fragment>
            ))}
          </VStack>
        </Container>
      </Box>
    </ContentWrapper>
  )
}

export default BenefitsMap
