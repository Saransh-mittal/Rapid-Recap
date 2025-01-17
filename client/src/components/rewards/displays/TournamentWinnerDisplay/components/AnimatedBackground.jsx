import React, { memo, useMemo, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { motion, useAnimationControls, animate } from 'framer-motion'
import { REWARD_VARIANTS } from '../../../constants/rewardTypes'

const AnimatedBackground = ({ type }) => {
  const controls = useAnimationControls()

  // Configuration for animations
  const config = useMemo(
    () => ({
      orbs: Array.from({ length: 3 }, () => ({
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
        duration: Math.random() * 5 + 15,
        top: Math.random() * 60 + 20,
        left: Math.random() * 60 + 20,
        scale: Math.random() * 0.2 + 1,
        opacity: Math.random() * 0.1 + 0.2,
      })),
      particles: Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 5,
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 3,
      })),
    }),
    [],
  )

  // Start base animation on mount
  useEffect(() => {
    // Start base gradient animation
    controls.start({
      opacity: [0.9, 0.95, 0.9],
      scale: [1, 1.02, 1],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'linear',
      },
    })

    // Cleanup
    return () => {
      controls.stop()
    }
  }, [controls])

  const orbVariants = {
    animate: custom => ({
      x: [-custom.x, custom.x],
      y: [-custom.y, custom.y],
      scale: [1, custom.scale],
      opacity: [custom.opacity, custom.opacity + 0.1],
      transition: {
        duration: custom.duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'linear',
      },
    }),
  }

  const particleVariants = {
    animate: custom => ({
      y: [-30, 30],
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      transition: {
        duration: custom.duration,
        repeat: Infinity,
        repeatType: 'loop',
        delay: custom.delay,
        ease: 'linear',
      },
    }),
  }

  return (
    <Box
      position="absolute"
      inset={0}
      overflow="hidden"
      role="presentation"
      sx={{
        isolation: 'isolate',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Base gradient layer */}
      <Box
        as={motion.div}
        position="absolute"
        inset={0}
        // bgGradient="linear(to-b, purple.900, purple.800)"
        bgGradient={REWARD_VARIANTS[type].bgGradient}
        initial={{ opacity: 0.9 }}
        animate={controls}
      />

      {/* Orbs */}
      {config.orbs.map((orb, index) => (
        <Box
          key={`orb-${index}`}
          as={motion.div}
          position="absolute"
          width={{ base: '300px', md: '500px' }}
          height={{ base: '300px', md: '500px' }}
          borderRadius="full"
          filter="blur(80px)"
          bgGradient="radial(circle, rgba(124, 58, 237, 0.3), transparent)"
          style={{
            top: `${orb.top}%`,
            left: `${orb.left}%`,
            willChange: 'transform, opacity',
          }}
          initial={{ opacity: orb.opacity, scale: 1 }}
          variants={orbVariants}
          animate="animate"
          custom={orb}
        />
      ))}

      {/* Particles */}
      {config.particles.map((particle, index) => (
        <Box
          key={`particle-${index}`}
          as={motion.div}
          position="absolute"
          width={`${particle.size}px`}
          height={`${particle.size}px`}
          bg="whiteAlpha.700"
          borderRadius="full"
          filter="blur(1px)"
          style={{
            top: `${particle.y}%`,
            left: `${particle.x}%`,
            willChange: 'transform, opacity',
          }}
          initial={{ opacity: 0, scale: 0 }}
          variants={particleVariants}
          animate="animate"
          custom={particle}
        />
      ))}

      {/* Radial pulse */}
      <Box
        as={motion.div}
        position="absolute"
        inset={0}
        bgGradient="radial(circle at center, purple.500 0%, transparent 70%)"
        initial={{ opacity: 0.2, scale: 1 }}
        animate={{
          opacity: [0.2, 0.3, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'linear',
        }}
      />
    </Box>
  )
}

AnimatedBackground.displayName = 'AnimatedBackground'

export default memo(AnimatedBackground)
