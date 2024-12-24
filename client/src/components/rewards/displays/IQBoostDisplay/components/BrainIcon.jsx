import React, { memo } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const BrainIcon = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 1,
      y: [0, -20, 0],
      rotate: [-5, 5, -5],
    }}
    transition={{
      y: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
      rotate: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    }}
  >
    <Box position="relative">
      {/* Primary glow */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-30px',
          background:
            'radial-gradient(circle, rgba(66,153,225,0.3), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Brain icon with glow */}
      <Box
        position="relative"
        width={{ base: '120px', md: '160px' }}
        height={{ base: '120px', md: '160px' }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          animate={{
            filter: [
              'drop-shadow(0 0 15px rgba(66,153,225,0.4))',
              'drop-shadow(0 0 25px rgba(66,153,225,0.6))',
              'drop-shadow(0 0 15px rgba(66,153,225,0.4))',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Box
            as="svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--chakra-colors-blue-400)"
            strokeWidth="1.5"
          >
            <motion.path
              d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
              }}
            />
            <motion.circle
              cx="12"
              cy="9"
              r="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                delay: 0.5,
                ease: 'easeInOut',
              }}
            />
          </Box>
        </motion.div>
      </Box>
    </Box>
  </motion.div>
)

export default memo(BrainIcon)
