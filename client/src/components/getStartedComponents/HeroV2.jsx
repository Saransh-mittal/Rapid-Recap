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
  Icon,
  Link,
  Image,
  Flex,
} from '@chakra-ui/react'
import {
  Languages,
  TrendingUp,
  Check,
  Users,
  Clock,
  Trophy,
  BookOpen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import useSafeSound from '../../customHooks/useSafeSound'
import { useFeatureDetection } from '../../utils/featureDetection'
import robo from '/images/landingPage/robo.png'
import StatsCard from './StatsCard'

// A refined, more premium color palette
const COLORS = {
  bg: '#121223',
  primaryGlow: 'rgba(128, 90, 213, 0.25)',
  accent: '#FF4081',
  accentHover: '#F50057',
  accentGlow: 'rgba(255, 64, 129, 0.4)',
  accentGlowHover: 'rgba(245, 0, 87, 0.6)',
  textPrimary: '#F0F0F5',
  textSecondary: 'rgba(240, 240, 245, 0.7)',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
}

const HeroV2 = ({ inViewFooter }) => {
  const { t, i18n } = useTranslation('GetStarted')
  const dispatch = useDispatch()
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })

  const featureList = [
    {
      key: 'freeAccess',
      text: t('Header.badges.freeAccess', 'Free Access to Mind Battles'),
    },
    {
      key: 'dailyChallenges',
      text: t('Header.badges.dailyArticles', '120+ Fresh Challenges Every Day'),
    },
    {
      key: 'weeklyShowdowns',
      text: t(
        'Header.badges.weeklyTournaments',
        'Weekly Showdowns for the Crown',
      ),
    },
  ]

  const handleLanguageSwitch = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <Box
      as="section"
      position="relative"
      aria-label="Hero section"
      overflow="hidden"
      bg={COLORS.bg}
      bgGradient={`radial-gradient(ellipse 80% 60% at 50% -10%, ${COLORS.primaryGlow}, ${COLORS.bg} 100%)`}
    >
      <Container
        maxW="container.xl"
        px={4}
        pt={{ base: '80px', md: '100px' }}
        pb={{ base: 8, md: 24 }}
      >
        <Grid
          templateColumns={{ base: '1fr', lg: '60% 40%' }}
          gap={{ base: 12, lg: 8 }}
          alignItems={{ lg: 'center' }}
        >
          {/* Column 1: All Content */}
          <VStack
            spacing={{ base: 6, md: 6 }}
            alignItems={{ base: 'center', lg: 'flex-start' }}
            textAlign={{ base: 'center', lg: 'left' }}
            w="full"
          >
            {/* INTERACTIVE LANGUAGE SWITCH BUTTON */}
            <Flex
              w="full"
              justifyContent={{ base: 'center', lg: 'flex-start' }}
            >
              <Button
                onClick={handleLanguageSwitch}
                leftIcon={<Icon as={Languages} w={5} h={5} />}
                rightIcon={
                  <Box
                    w="8px"
                    h="8px"
                    bg={COLORS.accent}
                    borderRadius="full"
                    boxShadow={`0 0 10px ${COLORS.accent}`}
                  />
                }
                bg={COLORS.glassBg}
                border="1px solid"
                borderColor={COLORS.glassBorder}
                borderRadius="full"
                color="whiteAlpha.900"
                fontWeight="medium"
                fontSize="sm"
                px={5}
                py={2}
                sx={{ backdropFilter: 'blur(8px)' }}
                transition="all 0.3s ease-out"
                _hover={{
                  borderColor: COLORS.accent,
                  color: 'white',
                  boxShadow: `0 0 20px -5px ${COLORS.accentGlow}`,
                }}
              >
                {i18n.language === 'en' ? 'English' : 'हिंदी'}
              </Button>
            </Flex>

            {/* Text Block */}
            <VStack
              spacing={4}
              alignItems={{ base: 'center', lg: 'flex-start' }}
            >
              <Heading
                as="h1"
                fontSize={{ base: '4xl', sm: '5xl', lg: '6xl' }}
                fontWeight="extrabold"
                color={COLORS.textPrimary}
                lineHeight={1.15}
              >
                {t('Header.heading.line1', 'Level Up Your Knowledge &')}
                <Text
                  as="span"
                  display="block"
                  bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.accentHover})`}
                  bgClip="text"
                  style={{ textShadow: `0 0 15px ${COLORS.accentGlow}` }}
                >
                  {t('Header.heading.line2', 'Dominate the Leaderboards!')}
                </Text>
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color={COLORS.textSecondary}
                maxW={{ base: '85%', md: '550px' }}
              >
                {t(
                  'Header.activeLearners',
                  'Join 1000+ monthly challengers sharpening their minds in epic quiz battles!',
                )}
              </Text>
            </VStack>

            {/* CTA Button */}
            <Box pt={4}>
              <Link
                href="/#signin"
                _hover={{ textDecoration: 'none' }}
                onClick={e => {
                  e.preventDefault()
                  playClick()
                  dispatch(setIsSigninOpen(true))
                }}
              >
                <Button
                  bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.accentHover})`}
                  color="white"
                  size="lg"
                  px={10}
                  py={7}
                  fontSize="lg"
                  fontWeight="bold"
                  rightIcon={<TrendingUp size={24} />}
                  borderRadius="xl"
                  transition="all 0.3s ease-out"
                  boxShadow={`0 10px 30px -10px ${COLORS.accentGlow}`}
                  _hover={{
                    bgGradient: `linear(to-r, ${COLORS.accentHover}, ${COLORS.accent})`,
                    boxShadow: `0 15px 35px -10px ${COLORS.accentGlowHover}`,
                    transform: 'translateY(-4px)',
                  }}
                  aria-label={t('Header.getStartedButton', 'Enter the Arena!')}
                >
                  {t('Header.getStartedButton', 'Enter the Arena!')}
                </Button>
              </Link>
            </Box>

            {/* Feature List */}
            <VStack
              pt={{ base: 6, lg: 8 }}
              spacing={3}
              w="full"
              maxW={{ base: '420px', lg: '100%' }}
            >
              {featureList.map(feature => (
                <HStack
                  key={feature.key}
                  bg={COLORS.glassBg}
                  border="1px solid"
                  borderColor={COLORS.glassBorder}
                  borderRadius="lg"
                  p={3}
                  w="full"
                  spacing={4}
                  transition="all 0.2s ease-in-out"
                  sx={{ backdropFilter: 'blur(8px)' }}
                  _hover={{
                    transform: 'scale(1.03)',
                    borderColor: COLORS.accent,
                    boxShadow: `0 0 20px ${COLORS.accentGlow}`,
                  }}
                >
                  <Icon
                    as={Check}
                    color={COLORS.accent}
                    w={5}
                    h={5}
                    flexShrink={0}
                  />
                  <Text
                    fontSize="sm"
                    color={COLORS.textPrimary}
                    fontWeight="medium"
                    flex="1"
                    textAlign="left"
                  >
                    {feature.text}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>

          {/* Column 2: Robot Image */}
          <Box
            display={{ base: 'none', lg: 'flex' }}
            alignItems="center"
            justifyContent="center"
            h="full"
            position="relative"
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              w="110%"
              h="110%"
              bgGradient={`radial-gradient(circle at center, ${COLORS.accentGlow} 0%, transparent 60%)`}
              transform="translate(-50%, -50%)"
              filter="blur(60px)"
              opacity={0.9}
              zIndex={0}
            />
            <Image
              src={robo}
              alt={t(
                'Header.imageAlt',
                'Cute robot playing a quiz on a smartphone',
              )}
              objectFit="contain"
              maxH={{ lg: '550px', xl: '600px' }}
              loading="eager"
              position="relative"
              zIndex={1}
              filter={`drop-shadow(0 25px 25px ${COLORS.bg})`}
            />
          </Box>
        </Grid>

        {/* Stats Grid */}
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          gap={{ base: 4, md: 6 }}
          w="full"
          mt={{ base: 12, md: 24 }}
        >
          {/* StatsCard components */}
        </Grid>
      </Container>
    </Box>
  )
}

export default HeroV2
