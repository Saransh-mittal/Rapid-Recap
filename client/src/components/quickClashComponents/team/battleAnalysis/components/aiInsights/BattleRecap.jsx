// components/quickClashComponents/team/battleAnalysis/components/aiInsights/BattleRecap.jsx
import React from 'react'
import {
  Box,
  VStack,
  Text,
  Heading,
  Icon,
  HStack,
  Badge,
  useBreakpointValue,
  Flex,
  Circle, // Added Circle
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  Zap,
  // TrendingDown, // Replaced by AlertTriangle for defeat
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
    bgOpacity: 0.2, // Slightly more prominent
    borderColor: 'green.400',
    iconBg: 'green.500',
  },
  defeat: {
    gradient: 'linear(to-br, red.500, red.700)',
    icon: AlertTriangle,
    color: 'red',
    bgOpacity: 0.2,
    borderColor: 'red.400',
    iconBg: 'red.500',
  },
  epic: {
    gradient: 'linear(to-br, purple.500, pink.600)',
    icon: Zap,
    color: 'purple',
    bgOpacity: 0.25, // More for epic
    borderColor: 'purple.400',
    iconBg: 'purple.500',
  },
  close_call: {
    gradient: 'linear(to-br, orange.500, yellow.600)',
    icon: Target,
    color: 'orange',
    bgOpacity: 0.2,
    borderColor: 'orange.400',
    iconBg: 'orange.500',
  },
  learning_moment: {
    gradient: 'linear(to-br, blue.500, teal.600)',
    icon: BookOpen,
    color: 'blue',
    bgOpacity: 0.2,
    borderColor: 'blue.400',
    iconBg: 'blue.500',
  },
  default_positive: {
    gradient: 'linear(to-br, teal.500, cyan.600)',
    icon: Award,
    color: 'teal',
    bgOpacity: 0.2,
    borderColor: 'teal.400',
    iconBg: 'teal.500',
  },
  default_neutral: {
    gradient: 'linear(to-br, gray.600, gray.700)',
    icon: Sparkles, // More generic AI sparkle
    color: 'gray',
    bgOpacity: 0.1, // Less prominent for neutral
    borderColor: 'gray.500',
    iconBg: 'gray.600',
  },
}

const BattleRecap = ({ recap, userStats }) => {
  const { t } = useTranslation('QuickClash')
  const titleSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const contentFontSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const recapIconSize = useBreakpointValue({ base: 5, md: 6 })
  // const recapCircleSize = useBreakpointValue({ base: '40px', md: '50px' }) // No longer used, replaced by Circle with padding

  let moodConfig = moodConfigs[recap.mood] || moodConfigs.default_neutral
  if (userStats && !moodConfigs[recap.mood]) {
    if (userStats.trophyChange > 0) moodConfig = moodConfigs.default_positive
    else if (userStats.trophyChange < 0) moodConfig = moodConfigs.defeat
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20, scale: 0.97 }} // Slightly more pronounced entry
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }} // Smoother spring
    >
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="xl" // Consistent rounding, slightly less than 2xl for a tighter feel
        bg={'rgba(25, 20, 45, 0.7)'} // Darker purple-ish base
        backdropFilter="blur(12px)" // Increased blur
        border="1px solid"
        borderColor={moodConfig.borderColor} // Use mood-specific border color
        boxShadow={`0 12px 35px rgba(0,0,0,0.35), 0 0 20px ${moodConfig.color}.800`} // Enhanced shadow with mood color hint
      >
        <MotionBox
          position="absolute"
          inset={0}
          bgGradient={moodConfig.gradient}
          opacity={moodConfig.bgOpacity}
          animate={{
            opacity: [
              moodConfig.bgOpacity * 0.6,
              moodConfig.bgOpacity * 1.2,
              moodConfig.bgOpacity * 0.6,
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} // Slower, more ambient pulse
        />

        <VStack
          spacing={{ base: 3.5, md: 4.5 }} // Adjusted spacing
          p={{ base: 4, md: 5 }}
          position="relative"
          zIndex={1}
        >
          <Flex align="center" w="100%" gap={{ base: 3, md: 4 }}>
            {' '}
            {/* Increased gap */}
            <Circle // Replaced Box with Circle for icon container
              size={{ base: '44px', md: '54px' }} // Responsive size
              bg={moodConfig.iconBg}
              boxShadow={`0 0 18px ${moodConfig.color}.500, inset 0 1px 2px rgba(255,255,255,0.2)`} // Enhanced shadow and inner highlight
              border="2px solid"
              borderColor={`${moodConfig.color}.400`}
            >
              <Icon
                as={moodConfig.icon}
                color="white"
                boxSize={recapIconSize}
              />
            </Circle>
            <VStack align="flex-start" spacing={0.5} flex={1}>
              {' '}
              {/* Adjusted spacing */}
              <Heading
                size={titleSize}
                color="white"
                fontWeight="bold" // Bolder
                letterSpacing="tight"
                noOfLines={1}
              >
                {recap.title}
              </Heading>
              <Badge
                bgGradient={`linear(to-r, ${moodConfig.color}.600, ${moodConfig.color}.800)`} // Gradient badge
                color="white"
                px={2.5} // More padding
                py={1}
                borderRadius="full"
                fontSize="xs" // Standardized from 3xs
                fontWeight="bold"
                textTransform="uppercase"
                boxShadow="0 3px 8px rgba(0,0,0,0.25)" // Added shadow
              >
                AI BATTLE RECAP
              </Badge>
            </VStack>
          </Flex>

          <Box
            bg="rgba(0, 0, 0, 0.25)" // Darker, more contrast
            backdropFilter="blur(8px)" // Slight blur for depth
            borderRadius="lg" // Consistent rounding
            p={{ base: 3.5, md: 4.5 }} // More padding
            border="1px solid"
            borderColor="rgba(255,255,255,0.1)" // Subtle border
            w="100%"
          >
            <Text
              color="whiteAlpha.900" // Brighter text
              fontSize={contentFontSize}
              lineHeight="relaxed"
              fontWeight="regular"
            >
              {recap.content}
            </Text>
          </Box>

          {userStats && (
            <HStack
              spacing={{ base: 3, md: 4 }} // Adjusted spacing
              justify="space-around"
              w="100%"
              flexWrap="wrap"
              pt={3} // Adjusted padding
              mt={1} // Margin top for separation
              borderTop="1px dashed"
              borderColor="rgba(255,255,255,0.15)" // More subtle border
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

const StatItem = ({ label, value, baseColor }) => (
  <VStack
    spacing={0.5} // Adjusted spacing
    bg="rgba(255,255,255,0.05)" // More subtle background
    p={{ base: 2, md: 2.5 }} // Responsive padding
    borderRadius="lg" // Softer radius
    minW={{ base: '85px', md: '95px' }} // Responsive min-width
    textAlign="center"
    border="1px solid"
    borderColor="rgba(255,255,255,0.08)" // Subtle border
    boxShadow="0 2px 5px rgba(0,0,0,0.15)" // Soft shadow
  >
    <Text
      fontSize={{ base: 'lg', md: 'xl' }} // Larger value
      fontWeight="bold"
      color={`${baseColor}.300`} // Use the baseColor for vibrancy
      lineHeight={1.1} // Adjusted line height
    >
      {value}
    </Text>
    <Text
      fontSize="xs"
      color="whiteAlpha.700"
      textTransform="uppercase"
      fontWeight="medium"
    >
      {' '}
      {/* Standardized from 3xs, brighter */}
      {label}
    </Text>
  </VStack>
)

export default BattleRecap
