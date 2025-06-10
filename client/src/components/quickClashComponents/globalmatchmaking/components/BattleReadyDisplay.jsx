// components/quickClashComponents/globalmatchmaking/components/BattleReadyDisplay.jsx
import React, { useMemo } from 'react'
import {
  VStack,
  Text,
  Box,
  HStack,
  Divider,
  Icon,
  Badge,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Zap, Users, User, UserPlus, Info } from 'lucide-react'

const MotionFlex = motion(Box)
const MotionBadge = motion(Badge)

// --- Optimization: Define constant animation objects outside the component ---
const flexAnimation = {
  scale: [1, 1.02, 1],
  boxShadow: [
    '0 0 8px rgba(72, 187, 120, 0.5)',
    '0 0 25px rgba(72, 187, 120, 0.9)',
    '0 0 8px rgba(72, 187, 120, 0.5)',
  ],
}
const flexTransition = {
  duration: 1.8,
  repeat: Infinity,
  repeatType: 'reverse',
}
const badgeAnimation = { y: [0, -3, 0] }
const badgeTransition = { duration: 2, repeat: Infinity, repeatType: 'reverse' }

// --- Optimization: Move helper function outside component for stable reference ---
const iconMap = { User, UserPlus, Users, Info }
const getIconComponent = iconName => iconMap[iconName] || Users

/**
 * Display component for when battle is ready
 */
const BattleReadyDisplay = React.memo(
  ({ battleReady, matchmakingTime, badgeInfo, formatMatchmakingTime }) => {
    const { t } = useTranslation('QuickClash')
    const IconComponent = useMemo(
      () => getIconComponent(badgeInfo.icon),
      [badgeInfo.icon],
    )

    return (
      <VStack spacing={4} align="center" w="100%">
        <MotionFlex
          display="flex"
          justifyContent="center"
          alignItems="center"
          w="120px"
          h="120px"
          borderRadius="full"
          bg="rgba(20, 25, 35, 0.6)"
          border="2px solid"
          borderColor="green.400"
          animate={flexAnimation}
          transition={flexTransition}
        >
          <Icon as={Zap} color="green.300" boxSize={16} />
        </MotionFlex>

        <VStack spacing={1} align="center" mt={2}>
          <Text
            color="green.300"
            fontSize="3xl"
            fontWeight="bold"
            letterSpacing="tight"
          >
            {t('Battle Ready!')}
          </Text>
          <Text
            color="whiteAlpha.800"
            fontSize="lg"
            textAlign="center"
            px={{ base: 2, md: 4 }}
          >
            {t('Your 4v4 team battle is ready to begin')}
          </Text>
        </VStack>

        <Tooltip label={badgeInfo.tooltip} hasArrow placement="top">
          <MotionBadge
            colorScheme={badgeInfo.color}
            px={4}
            py={2}
            borderRadius="full"
            fontSize="md"
            display="flex"
            alignItems="center"
            animate={badgeAnimation}
            transition={badgeTransition}
          >
            <Icon as={IconComponent} mr={2} boxSize={5} />
            {badgeInfo.text}
          </MotionBadge>
        </Tooltip>

        {battleReady && (
          <Box
            w={{ base: '95%', md: '90%' }}
            bg="rgba(15, 20, 30, 0.75)"
            borderRadius="lg"
            p={4}
            borderWidth="1px"
            borderColor="rgba(72, 187, 120, 0.4)"
            mt={3}
          >
            <VStack
              spacing={3}
              divider={<Divider borderColor="rgba(255,255,255,0.1)" />}
            >
              <HStack justify="space-between" w="100%">
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Total Time in Queue')}
                </Text>
                <Text
                  color="white"
                  fontWeight="bold"
                  fontFamily="mono"
                  fontSize="md"
                >
                  {formatMatchmakingTime(matchmakingTime)}
                </Text>
              </HStack>

              {battleReady.teamA && battleReady.teamB && (
                <VStack spacing={2} w="100%" pt={2}>
                  <Text
                    color="green.300"
                    fontWeight="bold"
                    fontSize="md"
                    mb={2}
                    textAlign="center"
                  >
                    {t('Match Details')}
                  </Text>
                  <HStack justify="space-around" w="100%" alignItems="center">
                    <VStack spacing={2} alignItems="center">
                      <Icon as={Users} color="blue.300" boxSize={5} />
                      <Text color="whiteAlpha.800" fontSize="sm">
                        {t('Your Team')}
                      </Text>
                    </VStack>
                    <Text
                      color="whiteAlpha.700"
                      fontSize="md"
                      fontWeight="medium"
                    >
                      vs
                    </Text>
                    <VStack spacing={2} alignItems="center">
                      <Icon as={Users} color="purple.300" boxSize={5} />
                      <Text color="whiteAlpha.800" fontSize="sm">
                        {t('Opponent Team')}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </Box>
        )}

        <Box w="100%" textAlign="center" pt={3} pb={1}>
          <Text color="whiteAlpha.600" fontSize="xs">
            {t(
              'Click "Enter Battle" to join your team and select your category',
            )}
          </Text>
        </Box>
      </VStack>
    )
  },
)

BattleReadyDisplay.displayName = 'BattleReadyDisplay'
export default BattleReadyDisplay
