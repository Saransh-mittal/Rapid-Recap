// components/quickClashComponents/team/battleAnalysis/components/aiInsights/BattleRecap.jsx
import React, { useMemo } from 'react'
import {
  Box,
  VStack,
  Text,
  Heading,
  Icon,
  HStack,
  Badge,
  Flex,
  Circle,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  Zap,
  BookOpen,
  Target,
  Sparkles,
  Award,
  AlertTriangle,
} from 'lucide-react'

const MotionBox = motion(Box)

const moodConfigs = {
  victory: {
    gradient: 'linear(to-br, green.500, green.700)',
    icon: Trophy,
    color: 'green',
    bgOpacity: 0.15, // Reduced opacity
    borderColor: 'green.400',
    iconBg: 'green.500',
  },
  defeat: {
    gradient: 'linear(to-br, red.500, red.700)',
    icon: AlertTriangle,
    color: 'red',
    bgOpacity: 0.15, // Reduced opacity
    borderColor: 'red.400',
    iconBg: 'red.500',
  },
  epic: {
    gradient: 'linear(to-br, purple.500, pink.600)',
    icon: Zap,
    color: 'purple',
    bgOpacity: 0.18, // Reduced opacity
    borderColor: 'purple.400',
    iconBg: 'purple.500',
  },
  close_call: {
    gradient: 'linear(to-br, orange.500, yellow.600)',
    icon: Target,
    color: 'orange',
    bgOpacity: 0.15, // Reduced opacity
    borderColor: 'orange.400',
    iconBg: 'orange.500',
  },
  learning_moment: {
    gradient: 'linear(to-br, blue.500, teal.600)',
    icon: BookOpen,
    color: 'blue',
    bgOpacity: 0.15, // Reduced opacity
    borderColor: 'blue.400',
    iconBg: 'blue.500',
  },
  default_positive: {
    gradient: 'linear(to-br, teal.500, cyan.600)',
    icon: Award,
    color: 'teal',
    bgOpacity: 0.15, // Reduced opacity
    borderColor: 'teal.400',
    iconBg: 'teal.500',
  },
  default_neutral: {
    gradient: 'linear(to-br, gray.600, gray.700)',
    icon: Sparkles,
    color: 'gray',
    bgOpacity: 0.08, // Reduced opacity
    borderColor: 'gray.500',
    iconBg: 'gray.600',
  },
}

const BattleRecap = ({ recap, userStats }) => {
  const { t } = useTranslation('QuickClash')

  // Memoized responsive configuration - static values for performance
  const config = useMemo(
    () => ({
      isMobile: window.innerWidth < 768,
      titleSize: window.innerWidth < 768 ? 'md' : 'lg',
      contentFontSize: window.innerWidth < 768 ? 'sm' : 'md',
      recapIconSize: window.innerWidth < 768 ? 5 : 6,
    }),
    [],
  )

  let moodConfig = moodConfigs[recap.mood] || moodConfigs.default_neutral
  if (userStats && !moodConfigs[recap.mood]) {
    if (userStats.trophyChange > 0) moodConfig = moodConfigs.default_positive
    else if (userStats.trophyChange < 0) moodConfig = moodConfigs.defeat
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 15, scale: 0.98 }} // Reduced animation
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4, // Reduced duration
        type: 'spring',
        stiffness: 120, // Reduced stiffness
        damping: 15, // Adjusted damping
      }}
    >
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        bg={'rgba(25, 20, 45, 0.7)'}
        backdropFilter={config.isMobile ? 'none' : 'blur(8px)'} // Reduced blur, none on mobile
        border="1px solid"
        borderColor={moodConfig.borderColor}
        boxShadow={
          config.isMobile
            ? `0 8px 20px rgba(0,0,0,0.25), 0 0 15px ${moodConfig.color}.800`
            : `0 10px 25px rgba(0,0,0,0.3), 0 0 18px ${moodConfig.color}.800` // Reduced shadow
        }
      >
        <MotionBox
          position="absolute"
          inset={0}
          bgGradient={moodConfig.gradient}
          opacity={moodConfig.bgOpacity}
          animate={
            config.isMobile
              ? {}
              : {
                  opacity: [
                    moodConfig.bgOpacity * 0.7, // Reduced animation range
                    moodConfig.bgOpacity * 1.1,
                    moodConfig.bgOpacity * 0.7,
                  ],
                }
          }
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} // Slower animation
        />

        <VStack
          spacing={{ base: 3, md: 4 }} // Reduced spacing
          p={{ base: 4, md: 5 }}
          position="relative"
          zIndex={1}
        >
          <Flex align="center" w="100%" gap={{ base: 3, md: 4 }}>
            <Circle
              size={{ base: '40px', md: '48px' }} // Reduced sizes
              bg={moodConfig.iconBg}
              boxShadow={
                config.isMobile
                  ? `0 0 12px ${moodConfig.color}.500, inset 0 1px 2px rgba(255,255,255,0.2)`
                  : `0 0 15px ${moodConfig.color}.500, inset 0 1px 2px rgba(255,255,255,0.2)` // Reduced shadow
              }
              border="2px solid"
              borderColor={`${moodConfig.color}.400`}
            >
              <Icon
                as={moodConfig.icon}
                color="white"
                boxSize={config.recapIconSize}
              />
            </Circle>
            <VStack align="flex-start" spacing={0.5} flex={1}>
              <Heading
                size={config.titleSize}
                color="white"
                fontWeight="bold"
                letterSpacing="tight"
                noOfLines={1}
              >
                {recap.title}
              </Heading>
              <Badge
                bgGradient={`linear(to-r, ${moodConfig.color}.600, ${moodConfig.color}.800)`}
                color="white"
                px={2}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                boxShadow="0 2px 6px rgba(0,0,0,0.2)" // Reduced shadow
              >
                AI BATTLE RECAP
              </Badge>
            </VStack>
          </Flex>

          <Box
            bg="rgba(0, 0, 0, 0.2)" // Reduced opacity
            backdropFilter={config.isMobile ? 'none' : 'blur(6px)'} // Reduced blur, none on mobile
            borderRadius="lg"
            p={{ base: 3, md: 4 }}
            border="1px solid"
            borderColor="rgba(255,255,255,0.1)"
            w="100%"
          >
            <Text
              color="whiteAlpha.900"
              fontSize={config.contentFontSize}
              lineHeight="relaxed"
              fontWeight="regular"
            >
              {recap.content}
            </Text>
          </Box>

          {userStats && (
            <HStack
              spacing={{ base: 3, md: 4 }}
              justify="space-around"
              w="100%"
              flexWrap="wrap"
              pt={2.5} // Reduced padding
              mt={1}
              borderTop="1px dashed"
              borderColor="rgba(255,255,255,0.15)"
            >
              <StatItem
                label={t('Your Score')}
                value={userStats.score}
                baseColor={moodConfig.color}
              />
              <StatItem
                label={t('Trophy Change')}
                value={`${userStats.trophyChange >= 0 ? '+' : ''}${
                  userStats.trophyChange
                }`}
                baseColor={userStats.trophyChange >= 0 ? 'green' : 'red'}
              />
              <StatItem
                label={t('Contribution')}
                value={`${userStats.contribution}%`}
                baseColor={moodConfig.color}
              />
            </HStack>
          )}
        </VStack>
      </Box>
    </MotionBox>
  )
}

const StatItem = ({ label, value, baseColor }) => {
  // Memoized responsive configuration
  const config = useMemo(
    () => ({
      isMobile: window.innerWidth < 768,
    }),
    [],
  )

  return (
    <VStack
      spacing={0.5}
      bg="rgba(255,255,255,0.05)"
      p={{ base: 2, md: 2.5 }}
      borderRadius="lg"
      minW={{ base: '75px', md: '85px' }} // Reduced sizes
      textAlign="center"
      border="1px solid"
      borderColor="rgba(255,255,255,0.08)"
      boxShadow={
        config.isMobile
          ? '0 2px 4px rgba(0,0,0,0.1)'
          : '0 2px 5px rgba(0,0,0,0.15)' // Reduced shadow
      }
    >
      <Text
        fontSize={{ base: 'md', md: 'lg' }} // Reduced sizes
        fontWeight="bold"
        color={`${baseColor}.300`}
        lineHeight={1.1}
      >
        {value}
      </Text>
      <Text
        fontSize="xs"
        color="whiteAlpha.700"
        textTransform="uppercase"
        fontWeight="medium"
      >
        {label}
      </Text>
    </VStack>
  )
}

export default BattleRecap
