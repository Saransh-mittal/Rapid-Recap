import React from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  useMediaQuery,
  Badge,
} from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const MobileFeatureCard = ({
  icon,
  title,
  badge,
  description,
  stats,
  index,
}) => (
  <MotionBox
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    bg="rgba(255, 255, 255, 0.03)"
    borderRadius="2xl"
    p={4}
    w={'100%'}
    position="relative"
    mb={2}
    overflow="hidden"
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bg: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      zIndex: 0,
    }}
  >
    <Badge
      position="absolute"
      top={3}
      right={3}
      px={3}
      py={1}
      borderRadius="full"
      bg={
        badge === 'POPULAR' || badge === 'लोकप्रिय'
          ? 'rgba(251, 191, 36, 0.2)'
          : badge === 'NEW' || badge === 'नया'
          ? 'rgba(52, 211, 153, 0.2)'
          : 'rgba(167, 139, 250, 0.2)'
      }
      color={
        badge === 'POPULAR' || badge === 'लोकप्रिय'
          ? 'yellow.200'
          : badge === 'NEW' || badge === 'नया'
          ? 'green.200'
          : 'purple.200'
      }
      textTransform="none"
      fontSize="xs"
      fontWeight="medium"
      boxShadow={
        badge === 'POPULAR' || badge === 'लोकप्रिय'
          ? '0 0 20px rgba(251, 191, 36, 0.2)'
          : badge === 'NEW' || badge === 'नया'
          ? '0 0 20px rgba(52, 211, 153, 0.2)'
          : '0 0 20px rgba(167, 139, 250, 0.2)'
      }
    >
      {badge}
    </Badge>

    <HStack spacing={4} position="relative">
      <Box p={3} bg="whiteAlpha.100" borderRadius="xl" boxShadow="inner">
        <Text fontSize="2xl">{icon}</Text>
      </Box>

      <VStack align="start" spacing={1} flex={1}>
        <Text color="white" fontWeight="600" fontSize={'lg'}>
          {title}
        </Text>
        <Text fontSize="sm" color="whiteAlpha.700">
          {description}
        </Text>
        <HStack spacing={2} mt={1}>
          <Icon as={StarIcon} w={3} h={3} color="yellow.400" />
          <Text fontSize="xs" color="whiteAlpha.700">
            {stats}
          </Text>
        </HStack>
      </VStack>
    </HStack>
  </MotionBox>
)

const DesktopFeatureCard = ({ icon, title, badge, description, stats }) => (
  <Box
    bg="rgba(255, 255, 255, 0.03)"
    borderRadius="lg"
    p={4}
    flex="1"
    position="relative"
    transition="all 0.2s"
    _hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
  >
    <VStack align="start" spacing={2}>
      <HStack justify="space-between" width="100%">
        <Text fontSize="xl">{icon}</Text>
        <Box
          px={2}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
          bg={
            badge === 'POPULAR' || badge === 'लोकप्रिय'
              ? 'rgba(251, 191, 36, 0.3)'
              : badge === 'NEW' || badge === 'नया'
              ? 'rgba(52, 211, 153, 0.3)'
              : 'rgba(167, 139, 250, 0.3)'
          }
          color={
            badge === 'POPULAR' || badge === 'लोकप्रिय'
              ? 'yellow.200'
              : badge === 'NEW' || badge === 'नया'
              ? 'green.200'
              : 'purple.200'
          }
        >
          {badge}
        </Box>
      </HStack>
      <Text color="white" fontWeight="600" fontSize="lg">
        {title}
      </Text>
      <Text fontSize="sm" color="whiteAlpha.700">
        {description}
      </Text>
      <HStack spacing={1}>
        <Icon as={StarIcon} w={3} h={3} color="yellow.400" />
        <Text fontSize="xs" color="whiteAlpha.600">
          {stats}
        </Text>
      </HStack>
    </VStack>
  </Box>
)

const PremiumValueBanner = () => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const { t } = useTranslation('GetStarted')

  const features = [
    {
      icon: '🎯',
      title: t('premiumValue.features.iqSystem.title'),
      description: t('premiumValue.features.iqSystem.description'),
      stats: t('premiumValue.features.iqSystem.stats'),
      badge: t('premiumValue.features.iqSystem.badge'),
    },
    {
      icon: '🏆',
      title: t('premiumValue.features.tournaments.title'),
      description: t('premiumValue.features.tournaments.description'),
      stats: t('premiumValue.features.tournaments.stats'),
      badge: t('premiumValue.features.tournaments.badge'),
    },
    {
      icon: '📊',
      title: t('premiumValue.features.analytics.title'),
      description: t('premiumValue.features.analytics.description'),
      stats: t('premiumValue.features.analytics.stats'),
      badge: t('premiumValue.features.analytics.badge'),
    },
  ]

  if (!isLargerThan768) {
    return (
      <Box
        px={2}
        py={3}
        bg="rgba(67, 56, 202, 0.05)"
        borderRadius="3xl"
        mx={2}
        mb={4}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-50%"
          left="-20%"
          width="140%"
          height="200%"
          bg="radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)"
          pointerEvents="none"
        />

        <VStack spacing={3} position="relative">
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="white"
            textAlign="center"
            mb={2}
            bgGradient="linear(to-r, yellow.200, purple.200)"
            bgClip="text"
          >
            {t('premiumValue.title')}
          </Text>

          {features.map((feature, index) => (
            <MobileFeatureCard key={index} {...feature} index={index} />
          ))}
        </VStack>
      </Box>
    )
  }

  return (
    <Box px={4} py={3}>
      <HStack
        spacing={4}
        bg="rgba(67, 56, 202, 0.1)"
        borderRadius="xl"
        p={4}
        border="1px solid"
        borderColor="whiteAlpha.200"
      >
        {features.map((feature, index) => (
          <DesktopFeatureCard key={index} {...feature} />
        ))}
      </HStack>
    </Box>
  )
}

export default PremiumValueBanner
