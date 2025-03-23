import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Grid,
  Badge,
  useBreakpointValue,
  Flex,
  Icon,
  AspectRatio,
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
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'

// Constants
const COLORS = {
  accent: '#ED64A6',
  secondary: '#805AD5',
  darkBg: 'rgba(28, 25, 63, 0.9)',
  cardBorder: 'rgba(237, 100, 166, 0.2)',
}

const shine = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`

const QuickClashHighlight = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { t } = useTranslation('GetStarted')

  return (
    <Box
      as="section"
      py={12}
      position="relative"
      overflow="hidden"
      bg="rgba(26, 21, 39, 0.9)"
      borderRadius="xl"
      borderTop={`3px solid ${COLORS.accent}`}
      boxShadow="0 10px 30px rgba(0,0,0,0.5)"
      my={12}
    >
      {/* Background elements */}
      <Box
        position="absolute"
        top="-50px"
        right="-50px"
        width="200px"
        height="200px"
        bgGradient={`radial(circle, ${COLORS.accent}33 0%, transparent 70%)`}
        borderRadius="full"
        opacity="0.6"
        zIndex="0"
      />

      <Box
        position="absolute"
        bottom="-30px"
        left="-30px"
        width="150px"
        height="150px"
        bgGradient={`radial(circle, ${COLORS.secondary}33 0%, transparent 70%)`}
        borderRadius="full"
        opacity="0.6"
        zIndex="0"
      />

      <Flex
        direction={{ base: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        maxW="container.xl"
        mx="auto"
        px={{ base: 4, md: 8 }}
        position="relative"
        zIndex="1"
      >
        {/* Left Section - Content */}
        <VStack
          align={{ base: 'center', lg: 'flex-start' }}
          spacing={6}
          maxW={{ base: '100%', lg: '50%' }}
          mb={{ base: 8, lg: 0 }}
        >
          {/* Title with animated badge */}
          <HStack>
            <Badge
              bg={`linear-gradient(45deg, ${COLORS.accent}, ${COLORS.secondary}, ${COLORS.accent})`}
              backgroundSize="200% auto"
              animation={`${shine} 3s linear infinite`}
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
              mr={2}
            >
              {t('QuickClash.newBadge', 'NEW')}
            </Badge>
            <Heading
              as="h2"
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="bold"
              bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
              bgClip="text"
              textAlign={{ base: 'center', lg: 'left' }}
            >
              {t('QuickClash.title', 'Quick Clash')}
            </Heading>
          </HStack>

          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color="whiteAlpha.900"
            textAlign={{ base: 'center', lg: 'left' }}
            fontWeight="medium"
          >
            {t(
              'QuickClash.subtitle',
              'Competitive knowledge battles where you challenge others to quiz showdowns!',
            )}
          </Text>

          {/* Core Flow Explanation */}
          <VStack
            spacing={4}
            align={{ base: 'center', lg: 'flex-start' }}
            w="full"
            bg="rgba(0,0,0,0.2)"
            p={5}
            borderRadius="lg"
            border="1px solid"
            borderColor={COLORS.cardBorder}
          >
            <Heading size="md" color="white">
              {t('QuickClash.howItWorks', 'How It Works')}
            </Heading>

            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={4}
              w="full"
            >
              <HStack spacing={3} align="flex-start">
                <Flex
                  minW="32px"
                  h="32px"
                  bg={`${COLORS.accent}22`}
                  color={COLORS.accent}
                  borderRadius="full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon as={Users} size={16} />
                </Flex>
                <Text color="whiteAlpha.800">
                  {t(
                    'QuickClash.steps.challenge',
                    'Challenge friends or find opponents through matchmaking',
                  )}
                </Text>
              </HStack>

              <HStack spacing={3} align="flex-start">
                <Flex
                  minW="32px"
                  h="32px"
                  bg={`${COLORS.accent}22`}
                  color={COLORS.accent}
                  borderRadius="full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon as={Clock} size={16} />
                </Flex>
                <Text color="whiteAlpha.800">
                  {t('QuickClash.steps.read', 'Read an article for 2 minutes')}
                </Text>
              </HStack>

              <HStack spacing={3} align="flex-start">
                <Flex
                  minW="32px"
                  h="32px"
                  bg={`${COLORS.accent}22`}
                  color={COLORS.accent}
                  borderRadius="full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon as={Zap} size={16} />
                </Flex>
                <Text color="whiteAlpha.800">
                  {t(
                    'QuickClash.steps.answer',
                    'Answer 5 questions in 50 seconds',
                  )}
                </Text>
              </HStack>

              <HStack spacing={3} align="flex-start">
                <Flex
                  minW="32px"
                  h="32px"
                  bg={`${COLORS.accent}22`}
                  color={COLORS.accent}
                  borderRadius="full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon as={Award} size={16} />
                </Flex>
                <Text color="whiteAlpha.800">
                  {t(
                    'QuickClash.steps.compare',
                    'Compare results to determine winners',
                  )}
                </Text>
              </HStack>

              <HStack spacing={3} align="flex-start">
                <Flex
                  minW="32px"
                  h="32px"
                  bg={`${COLORS.accent}22`}
                  color={COLORS.accent}
                  borderRadius="full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon as={BarChart3} size={16} />
                </Flex>
                <Text color="whiteAlpha.800">
                  {t(
                    'QuickClash.steps.analysis',
                    'Receive AI-powered performance analysis',
                  )}
                </Text>
              </HStack>
            </Grid>
          </VStack>
        </VStack>

        {/* Right Section - Feature Cards */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
          gap={4}
          maxW={{ base: '100%', lg: '45%' }}
        >
          <FeatureCard
            icon={Brain}
            title={t(
              'QuickClash.features.categories.title',
              'Category Challenges',
            )}
            description={t(
              'QuickClash.features.categories.description',
              'Compete in current affairs, history, and more specialized knowledge areas',
            )}
            COLORS={COLORS}
          />

          <FeatureCard
            icon={Users}
            title={t(
              'QuickClash.features.bilingual.title',
              'Bilingual Support',
            )}
            description={t(
              'QuickClash.features.bilingual.description',
              'Play in English or Hindi with full language support',
            )}
            COLORS={COLORS}
          />

          <FeatureCard
            icon={Zap}
            title={t(
              'QuickClash.features.matchmaking.title',
              'Real-time Matchmaking',
            )}
            description={t(
              'QuickClash.features.matchmaking.description',
              'Find opponents instantly with our smart matching system',
            )}
            COLORS={COLORS}
          />

          <FeatureCard
            icon={History}
            title={t('QuickClash.features.history.title', 'Challenge History')}
            description={t(
              'QuickClash.features.history.description',
              'Track your performance with detailed match history and leaderboards',
            )}
            COLORS={COLORS}
          />
        </Grid>
      </Flex>
    </Box>
  )
}

// Feature card component
const FeatureCard = ({ icon, title, description, COLORS }) => {
  return (
    <Box
      as={motion.div}
      whileHover={{
        y: -5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
      }}
      transition={{ duration: 0.2 }}
      p={5}
      bg="rgba(0,0,0,0.3)"
      borderRadius="lg"
      border="1px solid"
      borderColor={COLORS.cardBorder}
      h="100%"
      minH="150px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Flex
        w="40px"
        h="40px"
        bg={`${COLORS.accent}22`}
        color={COLORS.accent}
        borderRadius="lg"
        justifyContent="center"
        alignItems="center"
        mb={3}
      >
        <Icon as={icon} size={20} />
      </Flex>

      <Heading size="sm" mb={2} color="white">
        {title}
      </Heading>

      <Text color="whiteAlpha.700" fontSize="sm">
        {description}
      </Text>
    </Box>
  )
}

export default QuickClashHighlight
