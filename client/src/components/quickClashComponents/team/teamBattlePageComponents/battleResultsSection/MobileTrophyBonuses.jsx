// components/quickClashComponents/team/teamBattlePageComponents/battleResultsSection/MobileTrophyBonuses.jsx
import React, { memo, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Grid,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Sparkles, Star, TrendingUp, Award, Trophy } from 'lucide-react'

import { getApplicableBonuses } from './battleResultsUtils'

const MotionBox = motion(Box)

/**
 * Responsive Trophy Bonuses Component
 */
const MobileTrophyBonuses = memo(({ trophyExchange }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const containerPadding = useBreakpointValue({
    base: 3,
    md: 4,
    lg: 6,
  })

  const spacing = useBreakpointValue({
    base: 3,
    md: 4,
    lg: 5,
  })

  const headerIconSize = useBreakpointValue({
    base: 4,
    md: 5,
    lg: 6,
  })

  const headerFontSize = useBreakpointValue({
    base: 'sm',
    md: 'md',
    lg: 'lg',
  })

  const bonusItemPadding = useBreakpointValue({
    base: 2,
    md: 3,
    lg: 4,
  })

  const bonusIconSize = useBreakpointValue({
    base: 4,
    md: 5,
    lg: 6,
  })

  const bonusLabelFontSize = useBreakpointValue({
    base: 'xs',
    md: 'sm',
    lg: 'sm',
  })

  const bonusValueFontSize = useBreakpointValue({
    base: 'sm',
    md: 'md',
    lg: 'lg',
  })

  // Grid columns based on screen size and number of bonuses
  const gridColumns = useBreakpointValue({
    base: 2,
    sm: 2,
    md: 4,
    lg: 4,
  })

  // Memoized bonus calculations
  const applicableBonuses = useMemo(
    () => getApplicableBonuses(trophyExchange, t),
    [trophyExchange, t],
  )

  // Early return if no bonuses
  if (applicableBonuses.length === 0) {
    return null
  }

  // Map bonus keys to icons
  const getBonusIcon = key => {
    const iconMap = {
      firstDaily: Star,
      strongerTeam: TrendingUp,
      comebackWin: Award,
      allWins: Trophy,
    }
    return iconMap[key] || Star
  }

  return (
    <MotionBox
      bg="rgba(255, 215, 0, 0.05)"
      borderRadius={{ base: 'lg', md: 'xl' }}
      p={containerPadding}
      border="1px solid"
      borderColor="yellow.500"
      boxShadow="0 0 20px rgba(255, 215, 0, 0.15)"
      maxW={{ base: '100%', md: '600px', lg: '800px' }}
      mx="auto"
    >
      <VStack spacing={spacing}>
        {/* Header */}
        <HStack spacing={2}>
          <Icon as={Sparkles} color="yellow.400" boxSize={headerIconSize} />
          <Text
            color="yellow.400"
            fontWeight="bold"
            fontSize={headerFontSize}
            fontFamily="'Orbitron', sans-serif"
          >
            {t('🏆 BONUS TROPHIES')}
          </Text>
        </HStack>

        {/* Responsive Bonuses Layout */}
        {/* Mobile Layout - 2 columns */}
        <HStack
          justify="space-around"
          w="100%"
          spacing={2}
          display={{ base: 'flex', md: 'none' }}
        >
          {applicableBonuses.map((bonus, index) => (
            <MobileBonusItem
              key={bonus.key}
              bonus={bonus}
              icon={getBonusIcon(bonus.key)}
              index={index}
              padding={bonusItemPadding}
              iconSize={bonusIconSize}
              labelFontSize={bonusLabelFontSize}
              valueFontSize={bonusValueFontSize}
              isMobile={true}
            />
          ))}
        </HStack>

        {/* Desktop/Tablet Layout - Grid */}
        <Grid
          templateColumns={`repeat(${Math.min(
            applicableBonuses.length,
            gridColumns,
          )}, 1fr)`}
          gap={4}
          w="100%"
          display={{ base: 'none', md: 'grid' }}
        >
          {applicableBonuses.map((bonus, index) => (
            <DesktopBonusItem
              key={bonus.key}
              bonus={bonus}
              icon={getBonusIcon(bonus.key)}
              index={index}
              padding={bonusItemPadding}
              iconSize={bonusIconSize}
              labelFontSize={bonusLabelFontSize}
              valueFontSize={bonusValueFontSize}
            />
          ))}
        </Grid>
      </VStack>
    </MotionBox>
  )
})

/**
 * Mobile Bonus Item Component - Compact layout
 */
const MobileBonusItem = memo(
  ({
    bonus,
    icon,
    index,
    padding,
    iconSize,
    labelFontSize,
    valueFontSize,
    isMobile,
  }) => (
    <MotionBox
      bg="rgba(0, 0, 0, 0.3)"
      p={padding}
      borderRadius="md"
      border="1px solid"
      borderColor="yellow.600"
      flex={1}
      maxW="80px"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <VStack spacing={1}>
        <Icon as={icon} color="yellow.400" boxSize={iconSize} />
        <Text
          color="white"
          fontSize={labelFontSize}
          fontWeight="bold"
          textAlign="center"
          lineHeight="1"
          noOfLines={2}
        >
          {bonus.label}
        </Text>
        <Text
          color="yellow.400"
          fontSize={valueFontSize}
          fontWeight="bold"
          textAlign="center"
          fontFamily="'Orbitron', sans-serif"
        >
          +{bonus.amount}
        </Text>
      </VStack>
    </MotionBox>
  ),
)

/**
 * Desktop Bonus Item Component - Expanded layout
 */
const DesktopBonusItem = memo(
  ({ bonus, icon, index, padding, iconSize, labelFontSize, valueFontSize }) => (
    <MotionBox
      bg="rgba(0, 0, 0, 0.3)"
      p={padding}
      borderRadius="lg"
      border="1px solid"
      borderColor="yellow.600"
      whileHover={{
        scale: 1.03,
        y: -3,
        boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <VStack spacing={3}>
        <MotionBox
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Icon as={icon} color="yellow.400" boxSize={iconSize} />
        </MotionBox>
        <Text
          color="white"
          fontSize={labelFontSize}
          fontWeight="bold"
          textAlign="center"
          lineHeight="1.2"
        >
          {bonus.fullLabel || bonus.label}
        </Text>
        <MotionBox
          animate={{
            scale: [1, 1.1, 1],
            textShadow: [
              '0 0 5px rgba(245, 158, 11, 0.5)',
              '0 0 15px rgba(245, 158, 11, 0.8)',
              '0 0 5px rgba(245, 158, 11, 0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Text
            color="yellow.400"
            fontSize={valueFontSize}
            fontWeight="black"
            textAlign="center"
            fontFamily="'Orbitron', sans-serif"
          >
            +{bonus.amount}
          </Text>
        </MotionBox>
      </VStack>
    </MotionBox>
  ),
)

MobileBonusItem.displayName = 'MobileBonusItem'
DesktopBonusItem.displayName = 'DesktopBonusItem'
MobileTrophyBonuses.displayName = 'MobileTrophyBonuses'

export default MobileTrophyBonuses
