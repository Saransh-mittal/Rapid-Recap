// components/quickClashComponents/team/teamBattlePageComponents/battleResultsSection/CelebrationParticles.jsx
import React, { memo, useMemo } from 'react'
import { useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion.div

/**
 * Responsive Celebration Particles Component
 * Shows optimized particle effects for victory celebrations across all screen sizes
 */
const CelebrationParticles = memo(() => {
  // Responsive particle configuration
  const particleCount = useBreakpointValue({
    base: 6, // Mobile - minimal for performance
    md: 10, // Tablet - moderate
    lg: 15, // Desktop - more particles
    xl: 20, // Large desktop - full effect
  })

  const particleSize = useBreakpointValue({
    base: '14px', // Mobile - smaller
    md: '16px', // Tablet - medium
    lg: '18px', // Desktop - larger
    xl: '20px', // Large desktop - largest
  })

  const animationDuration = useBreakpointValue({
    base: 1.2, // Mobile - faster for performance
    md: 1.5, // Tablet - standard
    lg: 1.8, // Desktop - slower, more elegant
    xl: 2.0, // Large desktop - longest
  })

  const spreadRadius = useBreakpointValue({
    base: 80, // Mobile - smaller spread
    md: 100, // Tablet - medium spread
    lg: 120, // Desktop - larger spread
    xl: 150, // Large desktop - maximum spread
  })

  // Memoized particles array
  const particles = useMemo(() => ['⭐', '🏆', '✨', '🎉', '💫'], [])

  // Generate particle elements
  const particleElements = useMemo(() => {
    if (!particleCount) return []

    return [...Array(particleCount)].map((_, i) => (
      <MotionBox
        key={i}
        style={{
          position: 'absolute',
          fontSize: particleSize,
          color: 'gold',
          pointerEvents: 'none',
          zIndex: 10,
        }}
        initial={{
          x: '50%',
          y: '30%',
          scale: 0,
          rotate: 0,
        }}
        animate={{
          x: `${50 + (Math.random() - 0.5) * spreadRadius}%`,
          y: `${Math.random() * 50}%`,
          scale: [0, 1, 0],
          rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        }}
        transition={{
          duration: animationDuration,
          delay: i * 0.1,
          ease: 'easeOut',
        }}
      >
        {particles[Math.floor(Math.random() * particles.length)]}
      </MotionBox>
    ))
  }, [particleCount, particleSize, animationDuration, spreadRadius, particles])

  return <>{particleElements}</>
})

CelebrationParticles.displayName = 'CelebrationParticles'

export default CelebrationParticles
