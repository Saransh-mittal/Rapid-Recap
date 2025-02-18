import React, { memo } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const ParticleField = () => {
  const particles = React.useMemo(
    () =>
      Array(20)
        .fill(null)
        .map((_, i) => ({
          id: i,
          size: Math.random() * 3 + 2,
          delay: Math.random() * 3,
          duration: Math.random() * 3 + 2,
          x: Math.random() * 100,
          y: Math.random() * 100,
          path: Math.random() > 0.5,
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
            background: particle.path
              ? 'linear-gradient(to right, var(--chakra-colors-cyan-400), var(--chakra-colors-blue-400))'
              : 'linear-gradient(to right, var(--chakra-colors-blue-400), var(--chakra-colors-teal-400))',
            boxShadow: '0 0 8px rgba(99,179,237,0.3)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.7, 0],
            y: [0, particle.path ? -60 : -40],
            x: [0, particle.path ? 30 : -30],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}

      {/* Energy Field Wave Effect */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background:
            'linear-gradient(to top, rgba(99,179,237,0.05), transparent)',
          filter: 'blur(20px)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </Box>
  )
}

export default memo(ParticleField)
