import React, { useMemo, useCallback } from 'react'
import { Box, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Target, Zap } from 'lucide-react'

// Memoized power-up configurations
const POWER_UP_CONFIGS = {
  radar: {
    icon: Target,
    gradient: 'linear-gradient(135deg, #4ade80, #16a34a)',
    glow: '#4ade80',
  },
  default: {
    icon: Zap,
    gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    glow: '#60a5fa',
  },
}

// Memoized animation variants
const SHIMMER_ANIMATION = {
  x: ['-200%', '200%'],
}

const SHIMMER_TRANSITION = {
  duration: 2,
  repeat: Infinity,
  ease: 'linear',
  repeatDelay: 0.5,
}

const ICON_ANIMATION = {
  scale: [1, 1.2, 1],
}

const ICON_TRANSITION = {
  duration: 2,
  repeat: Infinity,
  ease: 'easeInOut',
}

const BORDER_ANIMATION = {
  opacity: [0.4, 0.6, 0.4],
}

const BORDER_TRANSITION = {
  duration: 2,
  repeat: Infinity,
  ease: 'easeInOut',
}

// Memoized icon component
const PowerUpIcon = React.memo(({ Icon, glow }) => (
  <Box
    as={motion.div}
    position="relative"
    animate={ICON_ANIMATION}
    transition={ICON_TRANSITION}
  >
    <Icon
      size={16}
      style={{
        color: glow,
        filter: `drop-shadow(0 0 4px ${glow})`,
      }}
    />
  </Box>
))

PowerUpIcon.displayName = 'PowerUpIcon'

// Memoized background components
const BackgroundEffects = React.memo(({ gradient, glow }) => (
  <>
    <Box position="absolute" inset={0} bg={gradient} opacity={0.1} />
    <Box position="absolute" inset={0} bg="rgba(0, 0, 0, 0.3)" />
    <Box
      as={motion.div}
      position="absolute"
      inset={0}
      bgGradient={`linear(to-r, transparent, ${glow}20, transparent)`}
      animate={SHIMMER_ANIMATION}
      transition={SHIMMER_TRANSITION}
    />
    <Box
      position="absolute"
      inset={0}
      border="1px solid"
      borderColor={`${glow}40`}
      borderRadius="lg"
      as={motion.div}
      animate={BORDER_ANIMATION}
      transition={BORDER_TRANSITION}
    />
  </>
))

BackgroundEffects.displayName = 'BackgroundEffects'

const PowerUpText = React.memo(({ text, style }) => {
  // Memoized configuration lookup
  const config = useMemo(() => {
    return text.toLowerCase().includes('radar')
      ? POWER_UP_CONFIGS.radar
      : POWER_UP_CONFIGS.default
  }, [text])

  const { icon: Icon, gradient, glow } = config

  // Memoized text styles
  const textStyles = useMemo(
    () => ({
      color: 'white',
      fontSize: 'sm',
      fontWeight: 'semibold',
      letterSpacing: 'wide',
      position: 'relative',
      textShadow: `0 2px 4px rgba(0, 0, 0, 0.3)`,
      flex: 1,
    }),
    [],
  )

  // Memoized container styles
  const containerStyles = useMemo(
    () => ({
      spacing: 3,
      py: 2.5,
      px: 4,
      borderRadius: 'lg',
      align: 'center',
      position: 'relative',
      overflow: 'hidden',
    }),
    [],
  )

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      w="full"
    >
      <HStack {...containerStyles}>
        <BackgroundEffects gradient={gradient} glow={glow} />
        <PowerUpIcon Icon={Icon} glow={glow} />
        <Text {...textStyles}>{text}</Text>
      </HStack>
    </Box>
  )
})

PowerUpText.displayName = 'PowerUpText'

export default PowerUpText
