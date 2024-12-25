// src/components/rewards/displays/RQMBoostDisplay/components/FloatingParticles.jsx
import React, { memo } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const FloatingParticles = () => {
  const particles = React.useMemo(
    () =>
      Array(15)
        .fill(null)
        .map((_, i) => ({
          id: i,
          size: Math.random() * 4 + 2,
          delay: Math.random() * 2,
          duration: Math.random() * 2 + 2,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })),
    [],
  )

  return (
    <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            borderRadius: '50%',
            background:
              'linear-gradient(to right, var(--chakra-colors-purple-400), var(--chakra-colors-pink-400))',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
            y: [0, -50],
            x: [0, particle.x > 50 ? 20 : -20],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}
    </Box>
  )
}

export default memo(FloatingParticles)
