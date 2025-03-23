// components/quickClashComponents/dailyTasks/TaskLevelBadge.jsx
import React from 'react'
import { Badge, HStack, Text, Icon, Tooltip, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBadge = motion(Badge)
const MotionIcon = motion(Icon)

/**
 * Displays a badge indicating the difficulty level of a task
 * Can be configured with different animations and styles
 */
const TaskLevelBadge = ({
  level,
  showText = true,
  size = 'md',
  showTooltip = true,
  animated = false,
  variant = 'default',
}) => {
  const { t } = useTranslation('QuickClash')

  // Determine color based on difficulty level
  const getColorScheme = () => {
    switch (level) {
      case 1:
        return 'green'
      case 2:
        return 'blue'
      case 3:
        return 'purple'
      case 4:
        return 'orange'
      case 5:
        return 'red'
      default:
        return 'gray'
    }
  }

  // Get difficulty level text
  const getDifficultyText = () => {
    switch (level) {
      case 1:
        return t('Easy')
      case 2:
        return t('Medium')
      case 3:
        return t('Moderate')
      case 4:
        return t('Hard')
      case 5:
        return t('Expert')
      default:
        return t('Unknown')
    }
  }

  // Get tooltip text
  const getTooltipText = () => {
    const baseText = `${t('Level')} ${level}: ${getDifficultyText()}`

    switch (level) {
      case 1:
        return `${baseText} - ${t('Great for beginners')}`
      case 2:
        return `${baseText} - ${t('A gentle challenge')}`
      case 3:
        return `${baseText} - ${t('A good balance of difficulty')}`
      case 4:
        return `${baseText} - ${t('Challenging, requires focus')}`
      case 5:
        return `${baseText} - ${t('Expert level, real brain teaser!')}`
      default:
        return baseText
    }
  }

  // Size mappings
  const sizeMap = {
    sm: {
      px: 2,
      py: 1,
      fontSize: 'xs',
      iconSize: 3,
    },
    md: {
      px: 2,
      py: 1,
      fontSize: 'sm',
      iconSize: 3.5,
    },
    lg: {
      px: 3,
      py: 1.5,
      fontSize: 'sm',
      iconSize: 4,
    },
  }

  // Get settings based on size
  const settings = sizeMap[size] || sizeMap.md
  const colorScheme = getColorScheme()

  // Badge style variants
  const badgeStyles = {
    default: {
      bg: `${colorScheme}.500`,
      color: 'white',
    },
    outline: {
      bg: 'transparent',
      color: `${colorScheme}.400`,
      borderWidth: '1px',
      borderColor: `${colorScheme}.500`,
    },
    subtle: {
      bg: `${colorScheme}.100`,
      color: `${colorScheme}.800`,
    },
    gradient: {
      bgGradient: `linear(to-r, ${colorScheme}.500, ${colorScheme}.400)`,
      color: 'white',
    },
    glass: {
      bg: `rgba(var(--chakra-colors-${colorScheme}-500-raw), 0.2)`,
      backdropFilter: 'blur(8px)',
      color: 'white',
      borderWidth: '1px',
      borderColor: `rgba(var(--chakra-colors-${colorScheme}-500-raw), 0.4)`,
    },
  }

  // Current style based on variant
  const currentStyle = badgeStyles[variant] || badgeStyles.default

  // Animation variants
  const iconAnimation = animated
    ? {
        rotate: [-5, 5],
        scale: [1, 1.2, 1],
        transition: { repeat: Infinity, repeatType: 'reverse', duration: 1.5 },
      }
    : {}

  // Create stars array
  const stars = Array.from({ length: level }, (_, i) => (
    <MotionIcon
      key={i}
      as={Star}
      boxSize={settings.iconSize}
      fill="currentColor"
      animate={
        animated
          ? {
              rotate: [-5, 5],
              scale: [1, 1.1, 1],
              transition: {
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 1.2,
                delay: i * 0.2,
              },
            }
          : {}
      }
    />
  ))

  const badge = (
    <MotionBadge
      {...currentStyle}
      px={settings.px}
      py={settings.py}
      borderRadius="full"
      fontSize={settings.fontSize}
      fontWeight="medium"
      whileHover={animated ? { scale: 1.05 } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
    >
      <HStack spacing={1}>
        {stars}
        {showText && (
          <Text fontSize={settings.fontSize}>{`${t('Lvl')} ${level}`}</Text>
        )}
      </HStack>
    </MotionBadge>
  )

  // If tooltip is enabled, wrap in tooltip component
  if (showTooltip) {
    return (
      <Tooltip label={getTooltipText()} hasArrow placement="top" bg="gray.800">
        {badge}
      </Tooltip>
    )
  }

  return badge
}

export default TaskLevelBadge
