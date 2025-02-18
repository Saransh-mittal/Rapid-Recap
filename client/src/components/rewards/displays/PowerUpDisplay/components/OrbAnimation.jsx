import React, { memo } from 'react'
import { Box, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

const OrbAnimation = ({ powerLevel = 1 }) => {
  const orbSize = useBreakpointValue({ base: 120, md: 140, lg: 160 })
  const shieldSize = useBreakpointValue({ base: 48, md: 56, lg: 64 })
  const containerHeight = useBreakpointValue({
    base: '140px',
    md: '160px',
    lg: '180px',
  })

  const glowIntensity = Math.min(0.3 + powerLevel * 0.1, 0.8)
  const pulseSpeed = 3 - powerLevel * 0.4 // Faster pulse for higher power levels

  return (
    <Box
      position="relative"
      h={containerHeight}
      maxW="full"
      mx="auto"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Energy Field */}
      <motion.div
        style={{
          position: 'absolute',
          width: orbSize,
          height: orbSize,
          borderRadius: '50%',
          background: `radial-gradient(circle,
            rgba(99,179,237,${glowIntensity}),
            rgba(56,178,172,${glowIntensity * 0.6}) 50%,
            transparent 70%
          )`,
          filter: 'blur(15px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Power Rings */}
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            width: orbSize - index * 10,
            height: orbSize - index * 10,
            borderRadius: '50%',
            border: '2px solid rgba(99,179,237,0.3)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: pulseSpeed + index,
            repeat: Infinity,
            ease: 'linear',
            delay: index * 0.2,
          }}
        />
      ))}

      {/* Central Shield Icon */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 2,
        }}
        animate={{
          scale: [1, 1.1, 1],
          filter: [
            'drop-shadow(0 0 10px rgba(99,179,237,0.4))',
            'drop-shadow(0 0 20px rgba(99,179,237,0.7))',
            'drop-shadow(0 0 10px rgba(99,179,237,0.4))',
          ],
        }}
        transition={{
          duration: pulseSpeed * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Shield
          size={shieldSize}
          strokeWidth={1.5}
          color="var(--chakra-colors-cyan-400)"
        />
      </motion.div>

      {/* Power Level Indicators */}
      {Array.from({ length: powerLevel }).map((_, index) => (
        <motion.div
          key={`power-${index}`}
          style={{
            position: 'absolute',
            width: 4,
            height: 20,
            backgroundColor: 'var(--chakra-colors-cyan-400)',
            borderRadius: 'full',
            transform: `rotate(${(360 / powerLevel) * index}deg) translateY(-${
              orbSize / 2 + 10
            }px)`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * (1.5 / powerLevel),
          }}
        />
      ))}
    </Box>
  )
}

export default memo(OrbAnimation)
