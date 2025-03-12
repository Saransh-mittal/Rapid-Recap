import React from 'react'
import { Flex, Badge, HStack, Text, Icon, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Flame, AlertCircle } from 'lucide-react'

const MotionFlex = motion(Flex)
const MotionBox = motion(Box)

/**
 * Banner showing the result of a completed challenge
 */
const ResultBanner = ({ isWinner, isTie, isDefeat, expiresAt, category }) => {
  const { t } = useTranslation('QuickClash')
  const isExpired = new Date(expiresAt) < new Date()

  // Adjust the condition to always show the banner for completed challenges
  if (isExpired && !isWinner && !isTie && !isDefeat) return null

  const getCategoryStyle = category => {
    const categoryColors = {
      World: 'blue',
      Politics: 'red',
      Business: 'green',
      Technology: 'cyan',
      Sports: 'orange',
      Health: 'teal',
      Science: 'purple',
      Environment: 'green',
    }
    return categoryColors[category] || 'purple'
  }

  const bgGradient = isWinner
    ? 'linear(to-r, purple.600, blue.500)'
    : isTie
    ? 'linear(to-r, yellow.600, orange.500)'
    : 'linear(to-r, red.700, red.600)'

  const icon = isWinner ? Trophy : isTie ? Flame : AlertCircle

  const iconAnimation = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  }

  return (
    <MotionFlex
      py={2}
      px={4}
      bgGradient={bgGradient}
      borderBottomRadius="lg"
      alignItems="center"
      justifyContent="space-between"
      color="white"
      fontWeight="bold"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <HStack>
        <MotionBox {...iconAnimation} display="flex" alignItems="center">
          <Icon
            as={icon}
            color={isWinner ? 'yellow.300' : isTie ? 'yellow.200' : 'red.300'}
            mr={2}
          />
        </MotionBox>
        <Text textTransform="uppercase" letterSpacing="wide">
          {isWinner ? t('Victory!') : isTie ? t('Tie!') : t('Defeat!')}
        </Text>
      </HStack>

      {/* Category badge in the banner */}
      <Badge
        colorScheme={getCategoryStyle(category)}
        fontSize="xs"
        borderRadius="full"
        px={2}
      >
        {category}
      </Badge>
    </MotionFlex>
  )
}

export default ResultBanner
