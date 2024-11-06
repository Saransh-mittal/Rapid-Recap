import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Stack,
  useBreakpointValue,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Star,
  Clock,
  Users,
  Award,
  CheckCircle,
  Bell,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSafeSound from '../../customHooks/useSafeSound'
import { useFeatureDetection } from '../../utils/featureDetection'
import { useSelector } from 'react-redux'
import CountdownDisplay from './CountdownDisplay'
import { parseTimeString } from '../../utils/time.utils'
import { useTranslation } from 'react-i18next'

const MobileCountdown = ({ countdown, color }) => {
  const { t } = useTranslation('GetStarted')
  return (
    <VStack spacing={2} width="100%">
      <HStack spacing={4} justify="center" width="100%">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color={color}>
            {countdown.days.toString().padStart(2, '0')}
          </Text>
          <Text fontSize="xs" color={color} opacity={0.8}>
            {t('Tournament.countdown.days')}
          </Text>
        </Box>
        <Text color={color} fontSize="xl">
          :
        </Text>
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color={color}>
            {countdown.hours.toString().padStart(2, '0')}
          </Text>
          <Text fontSize="xs" color={color} opacity={0.8}>
            {t('Tournament.countdown.hours')}
          </Text>
        </Box>
        <Text color={color} fontSize="xl">
          :
        </Text>
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color={color}>
            {countdown.minutes.toString().padStart(2, '0')}
          </Text>
          <Text fontSize="xs" color={color} opacity={0.8}>
            {t('Tournament.countdown.minutes')}
          </Text>
        </Box>
      </HStack>
    </VStack>
  )
}

const StatusContent = ({ status, countDownToShow, isMobile, COLORS }) => {
  const { t } = useTranslation('GetStarted')

  switch (status) {
    case 'upcoming':
      return (
        <HStack spacing={2}>
          <Clock size={16} color={COLORS.accent} />
          <Text color="whiteAlpha.800">
            {t('Tournament.statuses.startingSoon')}
          </Text>
        </HStack>
      )

    case 'registration':
      return isMobile ? (
        <MobileCountdown countdown={countDownToShow} color="whiteAlpha.800" />
      ) : (
        <CountdownDisplay countdown={countDownToShow} color="whiteAlpha.800" />
      )

    case 'ongoing':
      return (
        <HStack spacing={2}>
          <Users size={16} color={COLORS.accent} />
          <Text color="whiteAlpha.800">
            {t('Tournament.statuses.inProgress')}
          </Text>
          <Badge
            colorScheme="green"
            variant="solid"
            fontSize="xs"
            borderRadius="full"
          >
            Live
          </Badge>
        </HStack>
      )

    case 'completed':
      return (
        <HStack spacing={2}>
          <CheckCircle size={16} color={COLORS.accent} />
          <Text color="whiteAlpha.800">
            {t('Tournament.statuses.completed')}
          </Text>
        </HStack>
      )

    default:
      return null
  }
}

const getButtonConfig = status => {
  const { t } = useTranslation('GetStarted')
  switch (status) {
    case 'upcoming':
      return {
        text: t('Tournament.buttons.viewDetails'),
        icon: Bell,
      }
    case 'registration':
      return {
        text: t('Tournament.buttons.register'),
        icon: Users,
      }
    case 'ongoing':
      return {
        text: t('Tournament.buttons.viewTournament'),
        icon: Trophy,
      }
    case 'completed':
      return {
        text: t('Tournament.buttons.viewResults'),
        icon: Award,
      }
    default:
      return {
        text: t('Tournament.buttons.viewDetails'),
        icon: Star,
      }
  }
}

const TournamentBanner = ({ COLORS, shine }) => {
  const { t } = useTranslation('GetStarted')
  const navigate = useNavigate()
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const { tournamentStartTime, status } = useSelector(state => state.tournament)
  const countDownToShow = parseTimeString(tournamentStartTime)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const buttonConfig = getButtonConfig(status)

  if (!countDownToShow && status === 'registration') return null

  return (
    <Box
      mt={8}
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg="rgba(44, 41, 86, 0.8)"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor={COLORS.cardBorder}
      _hover={{
        borderColor: COLORS.accent,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease',
      }}
    >
      <Box
        bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        animation={`${shine} 3s linear infinite`}
        backgroundSize="200% auto"
      />

      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align="center"
        p={{ base: 4, md: 6 }}
        spacing={{ base: 3, md: 4 }}
      >
        <VStack
          spacing={{ base: 2, md: 4 }}
          align={{ base: 'center', md: 'start' }}
          width="100%"
        >
          <HStack
            spacing={4}
            width="100%"
            justify={{ base: 'center', md: 'flex-start' }}
          >
            <Box
              as={motion.div}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
            >
              <Trophy color={COLORS.accent} size={isMobile ? 24 : 30} />
            </Box>
            <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="bold"
                color="white"
                textAlign={{ base: 'center', md: 'left' }}
              >
                {t('Tournament.title')}{' '}
                {status === 'ongoing'
                  ? t('Tournament.statuses.inProgress')
                  : status === 'completed'
                  ? t('Tournament.statuses.completed')
                  : t('Tournament.statuses.startingSoon')}
              </Text>
            </VStack>
          </HStack>

          <StatusContent
            status={status}
            countDownToShow={countDownToShow}
            isMobile={isMobile}
            COLORS={COLORS}
          />

          {status !== 'completed' && (
            <Badge
              bg="rgba(237, 100, 166, 0.1)"
              color={COLORS.accent}
              px={3}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Star size={12} />
              {status === 'ongoing'
                ? t('Tournament.badges.watchLive')
                : t('Tournament.badges.earnBadges')}
            </Badge>
          )}
        </VStack>

        {isMobile && <Divider borderColor={COLORS.cardBorder} />}

        <Button
          variant="outline"
          borderColor={COLORS.accent}
          color={COLORS.accent}
          _hover={{
            bg: 'rgba(237, 100, 166, 0.1)',
            transform: 'translateY(-2px)',
          }}
          leftIcon={<buttonConfig.icon size={16} />}
          size={{ base: 'md', md: 'lg' }}
          px={6}
          width={{ base: '100%', md: 'auto' }}
          transition="all 0.3s ease"
          onClick={() => {
            playClick()
            navigate('/tournament')
          }}
        >
          {buttonConfig.text}
        </Button>
      </Stack>

      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        bg={`repeating-linear-gradient(
          45deg,
          ${COLORS.accent},
          ${COLORS.accent} 10px,
          transparent 10px,
          transparent 20px
        )`}
        zIndex={0}
        pointerEvents="none"
      />
    </Box>
  )
}

export default TournamentBanner
