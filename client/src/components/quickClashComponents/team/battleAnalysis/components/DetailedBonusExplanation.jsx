// components/quickClashComponents/team/battleAnalysis/components/DetailedBonusExplanation.jsx
import React, { useEffect, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  Collapse,
  Divider,
} from '@chakra-ui/react'
import { motion, useAnimationControls } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Award,
  ChevronDown,
  Calendar,
  Shield,
  Zap,
  Trophy,
  Info,
  Star,
  Gift,
} from 'lucide-react'

const MotionBox = motion(Box)

const BONUS_EXPLANATIONS = {
  firstDaily: {
    icon: Calendar,
    titleKey: 'First Daily Battle',
    explanationKey:
      'A special bonus awarded for completing your first team battle of the day. Encourages daily participation.',
    color: 'blue',
  },
  strongerTeam: {
    icon: Shield,
    titleKey: 'Stronger Team Bonus',
    explanationKey:
      'Awarded when your team defeats an opponent with significantly higher trophies. A true underdog victory!',
    color: 'purple',
  },
  comebackWin: {
    icon: Zap,
    titleKey: 'Comeback Bonus',
    explanationKey:
      'Your team was behind in the early stages of the battle but managed to turn things around for a win!',
    color: 'orange',
  },
  allWins: {
    icon: Trophy,
    titleKey: 'All Categories Won',
    explanationKey:
      'Your team dominated every category in this battle. A perfect performance deserves extra rewards!',
    color: 'green',
  },
  default: {
    icon: Gift,
    titleKey: 'Special Bonus',
    explanationKey:
      'An additional bonus awarded for special circumstances or achievements.',
    color: 'pink',
  },
}

const DetailedBonusExplanation = ({ trophyExchange, isExpanded, onToggle }) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimationControls()

  // Memoized responsive configuration - static values for performance
  const config = useMemo(
    () => ({
      isMobile: window.innerWidth < 768,
      padding: { base: 3, md: 5 }, // Reduced padding
      headerIconSize: { base: 5, md: 6 },
      itemIconSize: { base: 4, md: 5 },
      headingSize: { base: 'md', md: 'lg' },
      fontSize: { base: 'sm', md: 'md' },
    }),
    [],
  )

  const activeBonuses = Object.entries(trophyExchange?.bonuses || {})
    .filter(([_, bonus]) => bonus && bonus.applied)
    .map(([key, bonusData]) => ({
      key,
      ...bonusData,
      ...(BONUS_EXPLANATIONS[key] || BONUS_EXPLANATIONS.default),
    }))

  const activeBonusCount = activeBonuses.length
  const totalBonusAmount = activeBonuses.reduce(
    (sum, bonus) => sum + bonus.amount,
    0,
  )

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }, // Reduced duration
    })
  }, [controls, isExpanded])

  if (activeBonusCount === 0) {
    return null
  }

  return (
    <MotionBox
      bg="rgba(15, 23, 42, 0.3)"
      backdropFilter={config.isMobile ? 'none' : 'blur(12px)'}
      borderRadius="xl"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
      overflow="hidden"
      borderWidth="1px"
      borderColor="rgba(6, 182, 212, 0.4)"
      initial={{ opacity: 0, y: 15 }}
      animate={controls}
    >
      <Flex
        bg="transparent"
        px={config.padding}
        py={4}
        justify="space-between"
        align="center"
        cursor="pointer"
        onClick={onToggle}
        borderBottom="1px solid"
        borderColor="rgba(226, 175, 50, 0.3)"
        _hover={{ bg: 'rgba(226, 175, 50, 0.05)' }}
      >
        <HStack spacing={3}>
          <Icon as={Award} color="yellow.400" boxSize={config.headerIconSize} />
          <Heading
            size={config.headingSize}
            color="white"
            fontWeight="semibold"
          >
            {t('Trophy Bonuses')}
          </Heading>
        </HStack>
        <MotionBox
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Icon as={ChevronDown} color="whiteAlpha.700" boxSize={5} />
        </MotionBox>
      </Flex>

      <Flex
        px={config.padding}
        py={isExpanded ? 3 : 4}
        justify="space-between"
        align="center"
        borderBottomWidth={isExpanded ? '1px' : '0'}
        borderColor="rgba(226, 175, 50, 0.2)"
        transition="padding 0.3s ease-out"
      >
        <HStack spacing={2}>
          <Icon as={Star} color="yellow.400" boxSize={4} />
          <Text color="white" fontSize={config.fontSize}>
            {activeBonusCount} {t('Active Bonus', { count: activeBonusCount })}
          </Text>
        </HStack>
        <Text color="yellow.300" fontWeight="bold" fontSize={config.fontSize}>
          +{totalBonusAmount} {t('Extra Trophies')}
        </Text>
      </Flex>

      <Collapse in={isExpanded} animateOpacity>
        <Box px={config.padding} py={4}>
          <VStack spacing={4} align="stretch">
            {' '}
            {/* Reduced spacing */}
            <HStack alignItems="center">
              <Icon
                as={Trophy}
                color="blue.400"
                boxSize={config.itemIconSize}
              />
              <VStack align="flex-start" spacing={0} flex={1}>
                <Text
                  fontWeight="medium"
                  color="white"
                  fontSize={config.fontSize}
                >
                  {t('Base Trophy Exchange')}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {t('Standard amount before bonuses.')}
                </Text>
              </VStack>
              <Text
                ml="auto"
                color="blue.300"
                fontWeight="bold"
                fontSize={config.fontSize}
              >
                {trophyExchange.baseAmount > 0
                  ? `+${trophyExchange.baseAmount}`
                  : trophyExchange.baseAmount}{' '}
                {t('trophies')}
              </Text>
            </HStack>
            <Divider borderColor="whiteAlpha.100" />
            {activeBonuses.map((bonus, index) => (
              <MotionBox
                key={bonus.key}
                initial={{ opacity: 0, x: -10 }} // Reduced movement
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05, duration: 0.3 }} // Faster
              >
                <HStack alignItems="center">
                  <Icon
                    as={bonus.icon}
                    color={`${bonus.color}.400`}
                    boxSize={config.itemIconSize}
                  />
                  <VStack align="flex-start" spacing={0} flex={1}>
                    <Text
                      fontWeight="medium"
                      color="white"
                      fontSize={config.fontSize}
                    >
                      {t(bonus.titleKey)}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.700" noOfLines={2}>
                      {t(bonus.explanationKey)}
                    </Text>
                  </VStack>
                  <Text
                    ml="auto"
                    color={`${bonus.color}.300`}
                    fontWeight="bold"
                    fontSize={config.fontSize}
                  >
                    +{bonus.amount} {t('trophies')}
                  </Text>
                </HStack>
              </MotionBox>
            ))}
            <Divider borderColor="whiteAlpha.100" />
            <HStack alignItems="center">
              <Icon
                as={Award}
                color="yellow.400"
                boxSize={config.itemIconSize}
              />
              <VStack align="flex-start" spacing={0} flex={1}>
                <Text
                  fontWeight="bold"
                  color="white"
                  fontSize={config.fontSize}
                >
                  {t('Final Trophy Exchange')}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {t('Total including all bonuses.')}
                </Text>
              </VStack>
              <Text
                ml="auto"
                color="yellow.300"
                fontWeight="extrabold"
                fontSize={config.headingSize}
              >
                {trophyExchange.finalAmount > 0
                  ? `+${trophyExchange.finalAmount}`
                  : trophyExchange.finalAmount}{' '}
                {t('trophies')}
              </Text>
            </HStack>
            <Box
              mt={2}
              p={3}
              bg="rgba(255, 215, 0, 0.05)"
              borderRadius="lg"
              borderWidth="1px"
              borderStyle="dashed"
              borderColor="yellow.600"
            >
              <HStack spacing={2}>
                <Icon as={Info} color="yellow.500" boxSize={4} />
                <Text fontSize="xs" color="whiteAlpha.800">
                  {t(
                    'Individual trophy shares are based on performance and contribution within the team.',
                  )}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Collapse>
    </MotionBox>
  )
}

export default DetailedBonusExplanation
