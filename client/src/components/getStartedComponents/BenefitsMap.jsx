import React from 'react'
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Container,
  Badge,
  Circle,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ParallaxProvider } from 'react-scroll-parallax'
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

const COLORS = {
  accent: '#ED64A6',
  secondary: '#805AD5',
  darkBg: 'rgba(28, 25, 63, 0.9)',
  cardBorder: 'rgba(237, 100, 166, 0.2)',
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

const BenefitCard = ({
  icon: Icon,
  title,
  description,
  isLarge = false,
  badge,
}) => {
  return (
    <MotionBox
      as="article"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      bg={COLORS.darkBg}
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor={COLORS.cardBorder}
      _hover={{
        borderColor: COLORS.accent,
        transform: 'translateY(-5px)',
        boxShadow: `0 0 20px ${COLORS.accent}33`,
      }}
      height="100%"
      width="100%"
      position="relative"
      overflow="hidden"
      transition="all 0.3s ease"
      itemScope
      itemType="https://schema.org/Service"
      role="article"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="4px"
        bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
        aria-hidden="true"
      />

      <VStack spacing={4} align="center">
        <Circle
          size={isLarge ? '80px' : '60px'}
          bg="rgba(237, 100, 166, 0.1)"
          color={COLORS.accent}
          position="relative"
          _hover={{
            animation: `${pulseAnimation} 2s infinite`,
          }}
          role="img"
          aria-label={`${title} icon`}
        >
          <Icon size={isLarge ? 32 : 24} aria-hidden="true" />
        </Circle>

        <Heading
          as="h3"
          size={isLarge ? 'lg' : 'md'}
          color="white"
          fontWeight="bold"
          textAlign="center"
          itemProp="name"
        >
          {title}
        </Heading>

        <Text
          color="whiteAlpha.800"
          fontSize={isLarge ? 'md' : 'sm'}
          textAlign="center"
          lineHeight="tall"
          itemProp="description"
        >
          {description}
        </Text>

        {isLarge && badge && (
          <Badge
            color={COLORS.accent}
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            bg="rgba(237, 100, 166, 0.1)"
            role="status"
          >
            {badge}
          </Badge>
        )}
      </VStack>
    </MotionBox>
  )
}

const MobileArrow = () => (
  <Box
    display={{ base: 'flex', md: 'none' }}
    justifyContent="center"
    alignItems="center"
    w="full"
    py={2}
    aria-hidden="true"
  >
    <Box
      as={motion.div}
      animation={`${bounceAnimation} 2s infinite ease-in-out`}
      color={COLORS.accent}
    >
      <ChevronDown size={32} strokeWidth={2.5} />
    </Box>
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
    aria-hidden="true"
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

const BenefitsMap = () => {
  const { t } = useTranslation('GetStarted')
  const ContentWrapper = ParallaxProvider

  const benefits = [
    {
      icon: Newspaper,
      title: t('BenefitsMap.benefits.curatedNews.title'),
      description: t('BenefitsMap.benefits.curatedNews.description'),
    },
    {
      icon: Brain,
      title: t('BenefitsMap.benefits.activeLearning.title'),
      description: t('BenefitsMap.benefits.activeLearning.description'),
    },
    {
      icon: BarChart,
      title: t('BenefitsMap.benefits.trackProgress.title'),
      description: t('BenefitsMap.benefits.trackProgress.description'),
    },
  ]

  const centralFeature = {
    icon: Trophy,
    title: t('BenefitsMap.benefits.infoRetention.title'),
    description: t('BenefitsMap.benefits.infoRetention.description'),
    badge: t('BenefitsMap.benefits.infoRetention.badge'),
  }

  const bottomBenefits = [
    {
      icon: Trophy,
      title: t('BenefitsMap.benefits.competitiveEdge.title'),
      description: t('BenefitsMap.benefits.competitiveEdge.description'),
    },
    {
      icon: Globe,
      title: t('BenefitsMap.benefits.informedCitizen.title'),
      description: t('BenefitsMap.benefits.informedCitizen.description'),
    },
    {
      icon: Rocket,
      title: t('BenefitsMap.benefits.personalGrowth.title'),
      description: t('BenefitsMap.benefits.personalGrowth.description'),
    },
  ]

  return (
    <ContentWrapper>
      <Box
        as="section"
        py={10}
        position="relative"
        aria-label="Benefits section"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <Container maxW="1400px" px={{ base: 4, md: 8 }}>
          <MotionBox
            as="header"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            mb={16}
            textAlign="center"
          >
            <Badge
              color={COLORS.accent}
              px={3}
              py={1}
              mb={4}
              fontSize="sm"
              borderRadius="full"
              bg="rgba(237, 100, 166, 0.1)"
              aria-label="Section highlight"
            >
              {t('BenefitsMap.yourLearningJourney')}
            </Badge>
            <Heading
              as="h2"
              size="2xl"
              bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
              bgClip="text"
              fontWeight="bold"
              letterSpacing="tight"
              itemProp="name"
            >
              {t('BenefitsMap.mainTitle')}
            </Heading>
          </MotionBox>

          <Flex
            as="section"
            direction={{ base: 'column', md: 'row' }}
            gap={6}
            mb={12}
            align="stretch"
            aria-label="Primary benefits"
          >
            {benefits.map((benefit, index) => (
              <React.Fragment key={benefit.title}>
                <Box
                  flex="1"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <meta itemProp="position" content={index + 1} />
                  <BenefitCard {...benefit} index={index} />
                </Box>
                {index < benefits.length - 1 && (
                  <>
                    <MobileArrow />
                    <ConnectingLine
                      direction={index % 2 === 0 ? 'right' : 'left'}
                    />
                  </>
                )}
              </React.Fragment>
            ))}
          </Flex>

          <Flex
            as="section"
            justify="center"
            mb={12}
            aria-label="Central feature"
          >
            <Box width={{ base: '100%', md: '80%' }}>
              <BenefitCard {...centralFeature} isLarge={true} index={3} />
            </Box>
          </Flex>

          <Flex
            as="section"
            direction={{ base: 'column', md: 'row' }}
            gap={6}
            align="stretch"
            aria-label="Additional benefits"
          >
            {bottomBenefits.map((benefit, index) => (
              <React.Fragment key={benefit.title}>
                <Box
                  flex="1"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <meta itemProp="position" content={index + 4} />
                  <BenefitCard {...benefit} index={index + 4} />
                </Box>
                {index < bottomBenefits.length - 1 && (
                  <>
                    <MobileArrow />
                    <ConnectingLine
                      direction={index % 2 === 0 ? 'right' : 'left'}
                    />
                  </>
                )}
              </React.Fragment>
            ))}
          </Flex>
        </Container>
      </Box>
    </ContentWrapper>
  )
}

export default BenefitsMap
