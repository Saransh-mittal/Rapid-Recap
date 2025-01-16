// BadgeCard.jsx
import React, { useMemo } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import PowerUpText from './PowerUpText'

// Memoized particle configurations
const PARTICLE_ANIMATION = {
  opacity: [0, 0.8, 0],
  scale: [0, 1, 0],
  y: [-15, 15, -15],
}

const PARTICLE_TRANSITION = {
  repeatType: 'loop',
  ease: 'easeInOut',
}

// Memoized floating particle component
const FloatingParticle = React.memo(({ x, y, size, duration, delay }) => {
  const particleStyles = useMemo(
    () => ({
      position: 'absolute',
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '50%',
      zIndex: 5,
      pointerEvents: 'none',
      willChange: 'transform, opacity',
    }),
    [x, y, size],
  )

  return (
    <motion.div
      style={particleStyles}
      initial={{ opacity: 0, scale: 0 }}
      animate={PARTICLE_ANIMATION}
      transition={{
        ...PARTICLE_TRANSITION,
        duration,
        delay,
        repeat: Infinity,
      }}
    />
  )
})

FloatingParticle.displayName = 'FloatingParticle'

// Memoized particles container
const ParticlesContainer = React.memo(({ count, isHighlighted }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: isHighlighted ? 6 : 4,
      duration: Math.random() * 2.5 + 2,
      delay: Math.random() * 1.5,
    }))
  }, [count, isHighlighted])

  return (
    <Box
      position="absolute"
      inset={0}
      overflow="hidden"
      zIndex={3}
      pointerEvents="none"
      userSelect="none"
    >
      {particles.map(particle => (
        <FloatingParticle key={particle.id} {...particle} />
      ))}
    </Box>
  )
})

ParticlesContainer.displayName = 'ParticlesContainer'

// Memoized badge image component
const BadgeImage = React.memo(({ badge, isHighlighted }) => {
  const sizeProps = useMemo(
    () => ({
      w: {
        base: isHighlighted ? '140px' : '120px',
        md: isHighlighted ? '160px' : '140px',
      },
      h: {
        base: isHighlighted ? '140px' : '120px',
        md: isHighlighted ? '160px' : '140px',
      },
    }),
    [isHighlighted],
  )

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: [-8, 8, -8],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      <Box
        as="img"
        src={badge.image}
        alt={badge.title || 'badge'}
        {...sizeProps}
        objectFit="contain"
        position="relative"
        _groupHover={{
          transform: 'scale(1.05)',
          filter: `${badge.style.boxShadow} brightness(1.4)`,
        }}
        transition="all 0.3s"
      />
    </motion.div>
  )
})

BadgeImage.displayName = 'BadgeImage'

// Main BadgeCard component
const BadgeCard = React.memo(
  ({ badge, powerups = [], delay = 0, isHighlighted = false }) => {
    const particleCount = isHighlighted ? 24 : 16

    const backgroundStyle = useMemo(
      () => ({
        position: 'absolute',
        inset: 0,
        bgGradient: badge.style.background,
        opacity: 0.15,
        zIndex: 2,
      }),
      [badge.style.background],
    )

    const containerStyles = useMemo(
      () => ({
        position: 'relative',
        borderRadius: '2xl',
        overflow: 'hidden',
        minH: isHighlighted ? '280px' : '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        p: 6,
        role: 'group',
      }),
      [isHighlighted],
    )

    const contentStyles = useMemo(
      () => ({
        position: 'relative',
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        w: 'full',
      }),
      [],
    )

    const glowStyles = useMemo(
      () => ({
        position: 'absolute',
        inset: -16,
        background: badge.style.background,
        filter: 'blur(20px)',
        opacity: isHighlighted ? 0.4 : 0.3,
        borderRadius: '100%',
        willChange: 'transform, opacity',
      }),
      [badge.style.background, isHighlighted],
    )

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.5 }}
          style={{ willChange: 'transform' }}
        >
          <Box {...containerStyles}>
            {/* Background layers */}
            <Box
              position="absolute"
              inset={0}
              bgGradient="linear(to-b, rgba(0,0,0,0.8), rgba(0,0,0,0.6))"
              zIndex={1}
            />

            <Box
              {...backgroundStyle}
              as={motion.div}
              animate={{
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <ParticlesContainer
              count={particleCount}
              isHighlighted={isHighlighted}
            />

            <Box {...contentStyles}>
              <Box position="relative" mb={6}>
                <motion.div
                  style={glowStyles}
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.2, 1],
                    rotate: [0, 2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'easeInOut',
                  }}
                />

                <BadgeImage badge={badge} isHighlighted={isHighlighted} />
              </Box>

              {powerups.length > 0 && (
                <VStack spacing={3} w="full">
                  {powerups.map((powerup, index) => (
                    <PowerUpText
                      key={index}
                      text={powerup}
                      style={badge.style}
                      isHighlighted={isHighlighted}
                    />
                  ))}
                </VStack>
              )}
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
      prevProps.badge.type === nextProps.badge.type &&
      prevProps.isHighlighted === nextProps.isHighlighted &&
      prevProps.delay === nextProps.delay &&
      prevProps.powerups.length === nextProps.powerups.length &&
      prevProps.powerups.every(
        (powerup, index) => powerup === nextProps.powerups[index],
      )
    )
  },
)

BadgeCard.displayName = 'BadgeCard'

export default BadgeCard
