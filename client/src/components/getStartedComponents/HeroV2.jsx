import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Container,
  Grid,
  Badge,
  useBreakpointValue,
  AspectRatio,
} from '@chakra-ui/react'
import {
  Brain,
  Trophy,
  Users,
  BookOpen,
  Languages,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { keyframes } from '@emotion/react'
import learner from '/images/learner.png'
import StatsCard from './StatsCard'
import TournamentBanner from './TournamentBanner'
import SmartCTA from './SmartCTA'
import FloatingAchievementBadge from './FloatingAchievementBadge'
import ArticleSearch from './ArticleSearch'
import { useInView } from 'react-intersection-observer'
import useSafeSound from '../../customHooks/useSafeSound'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import { useFeatureDetection } from '../../utils/featureDetection'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LanguageSwitchButton from './LanguageSwitchButton'

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

const HeroV2 = () => {
  const { t } = useTranslation('GetStarted')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: '-100px',
  })
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const dispatch = useDispatch()

  return (
    <Box minH="100vh" position="relative" py={8} mt={16}>
      <Container maxW="container.xl">
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={8}
          alignItems="center"
        >
          {/* Left Section */}
          <VStack
            align="start"
            spacing={4}
            alignItems={{ base: 'center', lg: 'flex-start' }}
            w={'100%'}
          >
            {/* Language Badge */}
            <HStack
              spacing={4}
              w="full"
              justify={{ base: 'center', lg: 'flex-start' }}
            >
              <HStack
                bg="rgba(237, 100, 166, 0.1)"
                p={2}
                borderRadius="full"
                spacing={3}
              >
                <Badge
                  color={COLORS.accent}
                  bg="transparent"
                  px={2}
                  fontSize="sm"
                >
                  <HStack spacing={2}>
                    <Languages size={14} />
                    <Text>{t('Header.languageBadge')}</Text>
                  </HStack>
                </Badge>
                <Badge color="green.400" px={2} borderRadius="full">
                  Live
                </Badge>
              </HStack>
              <LanguageSwitchButton COLORS={COLORS} />
            </HStack>
            {/* Main Heading with Social Proof */}
            <Box>
              <Heading
                fontSize={{ base: '4xl', md: '4xl', lg: '5xl' }}
                fontWeight="bold"
                bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
                bgClip="text"
                lineHeight="1.1"
                mb={4}
                textAlign={{ base: 'center', lg: 'left' }}
              >
                {t('Header.title')}
              </Heading>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="whiteAlpha.900"
                maxW="600px"
                textAlign={{ base: 'center', lg: 'left' }}
              >
                {t('Header.activeLearners')}
              </Text>
            </Box>
            {/* CTA Section */}
            <VStack
              align="start"
              spacing={4}
              w="100%"
              mt={4}
              alignItems={{
                base: 'center',
                lg: 'flex-start',
              }}
            >
              <Box ref={ref}>
                <Button
                  size="lg"
                  bg={COLORS.accent}
                  color="white"
                  px={12}
                  py={7}
                  fontSize="xl"
                  rightIcon={<TrendingUp />}
                  _hover={{
                    bg: 'pink.500',
                    transform: 'translateY(-2px) scale(1.05)',
                  }}
                  boxShadow={`0 0 30px ${COLORS.accent}33`}
                  onClick={() => {
                    playClick()
                    dispatch(setIsSigninOpen(true))
                  }}
                >
                  {t('Header.getStartedButton')}
                </Button>
              </Box>

              <HStack spacing={4} wrap="wrap">
                <Badge variant="outline" colorScheme="pink">
                  {t('Header.badges.freeAccess')}
                </Badge>
                <Badge variant="outline" colorScheme="pink">
                  {t('Header.badges.dailyArticles')}
                </Badge>
                <Badge variant="outline" colorScheme="pink">
                  {t('Header.badges.weeklyTournaments')}
                </Badge>
              </HStack>
            </VStack>
            {/* Search Bar */}
            <ArticleSearch COLORS={COLORS} />
          </VStack>

          {/* Right Section - Hero Image */}
          {!isMobile && (
            <Box
              position="relative"
              w="90%"
              h="100%"
              display={{ base: 'none', lg: 'block' }}
            >
              <AspectRatio ratio={4 / 3}>
                <Box
                  as={motion.div}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <Box
                    as="img"
                    src={learner}
                    alt={t('Header.title')}
                    objectFit="cover"
                    borderRadius="2xl"
                    filter="brightness(0.9)"
                    _hover={{
                      filter: 'brightness(1)',
                      transform: 'scale(1.02)',
                    }}
                    transition="all 0.3s ease"
                  />

                  <Box
                    position="absolute"
                    top="-10%"
                    right="-5%"
                    width="100px"
                    height="100px"
                    bgGradient="radial(circle, rgba(237,100,166,0.5) 0%, rgba(237,100,166,0) 70%)"
                    borderRadius="full"
                    animation="pulse 2s infinite"
                  />

                  <Box
                    position="absolute"
                    bottom="-5%"
                    left="-5%"
                    width="150px"
                    height="150px"
                    bgGradient="radial(circle, rgba(128,90,213,0.5) 0%, rgba(128,90,213,0) 70%)"
                    borderRadius="full"
                    animation="pulse 2s infinite"
                    style={{ animationDelay: '1s' }}
                  />
                </Box>
              </AspectRatio>

              {/* Floating Achievement Badges */}
              <FloatingAchievementBadge
                icon={Trophy}
                position={{ top: '10%', right: '-5%' }}
                COLORS={COLORS}
              />

              <FloatingAchievementBadge
                icon={Brain}
                position={{ bottom: '25%', left: '-5%' }}
                delay={1.5}
                COLORS={COLORS}
              />
            </Box>
          )}
        </Grid>
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          gap={4}
          w="full"
          mt={8}
        >
          <StatsCard
            icon={Users}
            value={t('Header.stats.monthlyUsers.value')}
            label={t('Header.stats.monthlyUsers.label')}
            subtext={t('Header.stats.monthlyUsers.subtext')}
            COLORS={COLORS}
          />
          <StatsCard
            icon={Clock}
            value={t('Header.stats.dailyMinutes.value')}
            label={t('Header.stats.dailyMinutes.label')}
            subtext={t('Header.stats.dailyMinutes.subtext')}
            COLORS={COLORS}
          />
          <StatsCard
            icon={Trophy}
            value={t('Header.stats.tournamentPlayers.value')}
            label={t('Header.stats.tournamentPlayers.label')}
            subtext={t('Header.stats.tournamentPlayers.subtext')}
            COLORS={COLORS}
          />
          <StatsCard
            icon={BookOpen}
            value={t('Header.stats.dailyArticles.value')}
            label={t('Header.stats.dailyArticles.label')}
            subtext={t('Header.stats.dailyArticles.subtext')}
            COLORS={COLORS}
          />
        </Grid>
        <TournamentBanner COLORS={COLORS} shine={shine} />
        <SmartCTA isMainButtonVisible={!inView} COLORS={COLORS} />
      </Container>
    </Box>
  )
}

export default HeroV2
