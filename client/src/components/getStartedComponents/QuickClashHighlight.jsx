import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Grid,
  Badge,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Brain,
  Zap,
  Clock,
  Award,
  Users,
  BarChart3,
  History,
  UserPlus,
  CalendarDays,
  Trophy,
  LayoutGrid,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Constants - Using a unified, premium color palette similar to HeroV2
const COLORS = {
  bg: '#121223',
  primaryGlow: 'rgba(128, 90, 213, 0.25)',
  accent: '#FF4081', // Vibrant Pink for 1v1
  secondary: '#805AD5', // Purple for 4v4
  accentGlow: 'rgba(255, 64, 129, 0.4)',
  textPrimary: '#F0F0F5',
  textSecondary: 'rgba(240, 240, 245, 0.7)',
  cardBorder: 'rgba(255, 64, 129, 0.2)',
  secondaryCardBorder: 'rgba(128, 90, 213, 0.3)',
}

// Reusable Feature card component for 1v1
const VerticalFeatureCard = ({ icon, title, description, accentColor }) => {
  return (
    <Box
      as={motion.div}
      whileHover={{
        y: -5,
        boxShadow: `0 0 20px ${accentColor}44`,
      }}
      transition={{ type: 'spring', stiffness: 300 }}
      p={6}
      bg="rgba(10, 8, 30, 0.3)"
      backdropFilter="blur(5px)"
      borderRadius="xl"
      border="1px solid"
      borderColor={
        accentColor === COLORS.accent
          ? COLORS.cardBorder
          : COLORS.secondaryCardBorder
      }
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Flex
        w="44px"
        h="44px"
        bg={`${accentColor}22`}
        color={accentColor}
        borderRadius="lg"
        justifyContent="center"
        alignItems="center"
        mb={4}
      >
        <Icon as={icon} boxSize={5} />
      </Flex>
      <Heading size="sm" mb={2} color={COLORS.textPrimary}>
        {title}
      </Heading>
      <Text color={COLORS.textSecondary} fontSize="sm">
        {description}
      </Text>
    </Box>
  )
}

// UPDATED: Fully responsive card for 4v4 features
const TeamFeatureCard = ({ icon, title, description, accentColor }) => {
  // Define reusable parts to avoid repetition
  const IconComponent = (
    <Flex
      minW={{ base: '38px', md: '40px' }}
      h={{ base: '38px', md: '40px' }}
      bg={`${accentColor}22`}
      color={accentColor}
      borderRadius="md"
      justifyContent="center"
      alignItems="center"
      flexShrink={0}
    >
      <Icon as={icon} boxSize={5} />
    </Flex>
  )

  const TitleComponent = (
    <Heading
      size="sm"
      fontWeight="semibold"
      color={COLORS.textPrimary}
      textAlign="left"
    >
      {title}
    </Heading>
  )

  const DescriptionComponent = (
    <Text color={COLORS.textSecondary} fontSize="sm" textAlign="left">
      {description}
    </Text>
  )

  return (
    <Box
      as={motion.div}
      whileHover={{ y: -5, boxShadow: `0 0 20px ${accentColor}1A` }}
      transition={{ type: 'spring', stiffness: 300 }}
      p={{ base: 4, md: 5 }}
      bg="rgba(10, 8, 30, 0.3)"
      backdropFilter="blur(5px)"
      borderRadius="xl"
      border="1px solid"
      borderColor={COLORS.secondaryCardBorder}
      w="full"
      h="full"
    >
      {/* Mobile Layout: Icon and Title on top, description below */}
      <VStack
        display={{ base: 'flex', md: 'none' }}
        align="flex-start"
        spacing={3}
      >
        <HStack spacing={3}>
          {IconComponent}
          {TitleComponent}
        </HStack>
        {DescriptionComponent}
      </VStack>

      {/* Desktop Layout: Icon on left, Title/Description on right */}
      <HStack
        display={{ base: 'none', md: 'flex' }}
        align="flex-start"
        spacing={4}
      >
        {IconComponent}
        <VStack align="flex-start" spacing={1}>
          {TitleComponent}
          {DescriptionComponent}
        </VStack>
      </HStack>
    </Box>
  )
}

// How it Works Step component
const HowItWorksStep = ({ icon, text, accentColor }) => (
  <Grid templateColumns="auto 1fr" gap={5} alignItems="center" w="full">
    <Flex
      minW="40px"
      h="40px"
      bg={`${accentColor}22`}
      color={accentColor}
      borderRadius="full"
      justifyContent="center"
      alignItems="center"
    >
      <Icon as={icon} boxSize={5} />
    </Flex>
    <Text color={COLORS.textPrimary} textAlign="left" fontSize="md">
      {text}
    </Text>
  </Grid>
)

const QuickClashHighlight = () => {
  const { t } = useTranslation('GetStarted')
  const [activeMode, setActiveMode] = useState('oneVone')

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg={COLORS.bg}
      bgGradient={`radial-gradient(ellipse 80% 60% at 50% -10%, ${COLORS.primaryGlow}, ${COLORS.bg} 100%)`}
      borderRadius="2xl"
      boxShadow="0 20px 40px rgba(0,0,0,0.6)"
      p={{ base: 5, sm: 8, md: 10 }}
    >
      <Box maxW="container.xl" mx="auto" position="relative" zIndex="1">
        <Flex justify="center" mb={{ base: 10, md: 14 }}>
          <HStack
            p="1"
            bg="rgba(10, 8, 30, 0.7)"
            borderRadius="full"
            border="1px solid"
            borderColor={COLORS.secondaryCardBorder}
            spacing="1"
          >
            <Button
              onClick={() => setActiveMode('oneVone')}
              bg={activeMode === 'oneVone' ? COLORS.accent : 'transparent'}
              color="white"
              borderRadius="full"
              px={{ base: 5, md: 8 }}
              py={3}
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="semibold"
              transition="all 0.3s ease"
              _hover="none"
              _active="none"
            >
              {t('QuickClash.tabs.oneVone', '1v1 Quick Clash')}
            </Button>
            <Button
              onClick={() => setActiveMode('fourVfour')}
              bg={activeMode === 'fourVfour' ? COLORS.secondary : 'transparent'}
              color="white"
              borderRadius="full"
              px={{ base: 5, md: 8 }}
              py={3}
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="semibold"
              transition="all 0.3s ease"
              _hover="none"
              _active="none"
            >
              <HStack spacing={2}>
                <Text>{t('QuickClash.tabs.fourVfour', '4v4 Team Battle')}</Text>
              </HStack>
            </Button>
          </HStack>
        </Flex>

        <Box>
          {activeMode === 'oneVone' ? (
            <Flex
              direction={{ base: 'column', lg: 'row' }}
              justifyContent="space-between"
              alignItems={{ base: 'center', lg: 'stretch' }}
              gap={{ base: 10, md: 16 }}
            >
              <VStack
                align={{ base: 'center', lg: 'flex-start' }}
                spacing={6}
                w={{ base: '100%', lg: '50%' }}
                textAlign={{ base: 'center', lg: 'left' }}
              >
                <Heading
                  as="h2"
                  fontSize={{ base: '3xl', md: '4xl' }}
                  fontWeight="bold"
                  color={COLORS.textPrimary}
                >
                  {t('QuickClash.title', 'Quick Clash')}
                </Heading>
                <Text
                  fontSize={{ base: 'lg', md: 'xl' }}
                  color={COLORS.textSecondary}
                  fontWeight="medium"
                >
                  {t(
                    'QuickClash.subtitle',
                    'Competitive knowledge battles where you challenge others to quiz showdowns!',
                  )}
                </Text>
                <VStack
                  spacing={6}
                  align="flex-start"
                  w="full"
                  bg="rgba(0,0,0,0.2)"
                  p={{ base: 6, md: 8 }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={COLORS.cardBorder}
                >
                  <Heading size="lg" color={COLORS.textPrimary} w="full" mb={2}>
                    {t('QuickClash.howItWorks', 'How It Works')}
                  </Heading>
                  <HowItWorksStep
                    icon={Users}
                    text={t(
                      'QuickClash.steps.challenge',
                      'Challenge friends or find opponents through matchmaking',
                    )}
                    accentColor={COLORS.accent}
                  />
                  <HowItWorksStep
                    icon={Clock}
                    text={t(
                      'QuickClash.steps.read',
                      'Read an article for 2 minutes',
                    )}
                    accentColor={COLORS.accent}
                  />
                  <HowItWorksStep
                    icon={Zap}
                    text={t(
                      'QuickClash.steps.answer',
                      'Answer 5 questions in 50 seconds',
                    )}
                    accentColor={COLORS.accent}
                  />
                  <HowItWorksStep
                    icon={Award}
                    text={t(
                      'QuickClash.steps.compare',
                      'Compare results to determine winners',
                    )}
                    accentColor={COLORS.accent}
                  />
                  <HowItWorksStep
                    icon={BarChart3}
                    text={t(
                      'QuickClash.steps.analysis',
                      'Receive AI-powered performance feedback',
                    )}
                    accentColor={COLORS.accent}
                  />
                </VStack>
              </VStack>
              <Grid
                display={{ base: 'none', lg: 'grid' }}
                templateColumns={{ sm: 'repeat(2, 1fr)' }}
                gap={6}
                w={{ base: '100%', lg: '48%' }}
              >
                <VerticalFeatureCard
                  icon={Brain}
                  title={t('QuickClash.features.categories.title')}
                  description={t('QuickClash.features.categories.description')}
                  accentColor={COLORS.accent}
                />
                <VerticalFeatureCard
                  icon={Users}
                  title={t('QuickClash.features.bilingual.title')}
                  description={t('QuickClash.features.bilingual.description')}
                  accentColor={COLORS.accent}
                />
                <VerticalFeatureCard
                  icon={Zap}
                  title={t('QuickClash.features.matchmaking.title')}
                  description={t('QuickClash.features.matchmaking.description')}
                  accentColor={COLORS.accent}
                />
                <VerticalFeatureCard
                  icon={History}
                  title={t('QuickClash.features.history.title')}
                  description={t('QuickClash.features.history.description')}
                  accentColor={COLORS.accent}
                />
              </Grid>
            </Flex>
          ) : (
            // 4v4 MODE CONTENT with RESPONSIVE GRID and CARDS
            <VStack spacing={{ base: 8, md: 10 }} w="full">
              <VStack spacing={3} textAlign="center">
                <Heading
                  as="h2"
                  fontSize={{ base: '3xl', md: '4xl' }}
                  fontWeight="extrabold"
                  bgGradient={`linear(to-r, ${COLORS.secondary}, ${COLORS.accent})`}
                  bgClip="text"
                >
                  {t('QuickClash.teamBattle.title')}
                </Heading>
                <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  color={COLORS.textSecondary}
                  maxW="2xl"
                  mx="auto"
                >
                  {t('QuickClash.teamBattle.subtitle')}
                </Text>
              </VStack>

              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={{ base: 4, md: 6 }}
                w="full"
                maxW="5xl"
                mx="auto"
              >
                <TeamFeatureCard
                  icon={UserPlus}
                  title={t('QuickClash.teamBattle.features.squadUp.title')}
                  description={t(
                    'QuickClash.teamBattle.features.squadUp.description',
                  )}
                  accentColor={COLORS.secondary}
                />
                <TeamFeatureCard
                  icon={LayoutGrid}
                  title={t(
                    'QuickClash.teamBattle.features.categoryChoice.title',
                  )}
                  description={t(
                    'QuickClash.teamBattle.features.categoryChoice.description',
                  )}
                  accentColor={COLORS.secondary}
                />
                <TeamFeatureCard
                  icon={CalendarDays}
                  title={t(
                    'QuickClash.teamBattle.features.dailyShowdown.title',
                  )}
                  description={t(
                    'QuickClash.teamBattle.features.dailyShowdown.description',
                  )}
                  accentColor={COLORS.secondary}
                />
                <TeamFeatureCard
                  icon={Trophy}
                  title={t('QuickClash.teamBattle.features.teamVictory.title')}
                  description={t(
                    'QuickClash.teamBattle.features.teamVictory.description',
                  )}
                  accentColor={COLORS.secondary}
                />
              </Grid>
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default QuickClashHighlight
