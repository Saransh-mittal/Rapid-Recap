// src/components/rewards/displays/IQBoostDisplay/components/NeuronEffect.jsx
import React, { memo, useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const NeuronEffect = ({ theme }) => {
  const particleColor = theme?.particleColor || 'blue.400'

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 4,
        duration: Math.random() * 2.5 + 2,
        delay: Math.random() * 1.5,
      })),
    [],
  )

  return (
    <Box
      position="fixed"
      inset={0}
      pointerEvents="none"
      overflow="hidden"
      zIndex={1}
    >
      {particles.map((particle, index) => (
        <motion.div
          key={`particle-${index}-${particle.x}-${particle.y}-${Math.random()}`}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: `var(--chakra-colors-${particleColor
              .split('.')
              .join('-')})`,
            borderRadius: '50%',
            filter: 'blur(1px)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}
    </Box>
  )
}

export default memo(NeuronEffect)
