import React, { memo } from 'react'
import { Box, Text, HStack, useMediaQuery } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useCounter } from '../../../hooks/useCounter'

const ScoreDisplay = ({ prevScore, newScore }) => {
  const animatedScore = useCounter(newScore, prevScore)
  const isScreenSmallerThan768px = useMediaQuery('(max-width: 768px)')[0]
  return (
    <HStack spacing={8} justify="center" align="center">
      {/* Previous Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <Box position="relative">
          {/* Glow effect */}
          <motion.div
            style={{
              position: 'absolute',
              inset: '-20px',
              background:
                'radial-gradient(circle, rgba(99, 179, 237, 0.15), transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(10px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            animate={{
              y: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Text
              fontSize={{ base: '5xl', md: '8xl' }}
              fontWeight="extrabold"
              color="whiteAlpha.700"
              textShadow="0 0 20px rgba(255,255,255,0.3)"
              style={{
                display: 'block',
                position: 'relative',
              }}
            >
              {prevScore}
            </Text>
          </motion.div>
        </Box>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [-4, 4, -4],
          rotate: [-12, 12, -12],
        }}
        transition={{
          scale: { duration: 0.5, delay: 0.1 },
          opacity: { duration: 0.5, delay: 0.1 },
          y: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        <motion.div
          animate={{
            filter: [
              'drop-shadow(0 0 10px rgba(66,153,225,0.4))',
              'drop-shadow(0 0 20px rgba(66,153,225,0.6))',
              'drop-shadow(0 0 10px rgba(66,153,225,0.4))',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUp
            size={isScreenSmallerThan768px ? 48 : 64}
            color="var(--chakra-colors-blue-400)"
          />
        </motion.div>
      </motion.div>

      {/* New Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box position="relative">
          <motion.div
            style={{
              position: 'absolute',
              inset: '-20px',
              background:
                'radial-gradient(circle, rgba(66,153,225,0.3), transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(15px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            style={{
              position: 'absolute',
              inset: '-15px',
              background:
                'radial-gradient(circle, rgba(99,179,237,0.4), transparent 60%)',
              borderRadius: '50%',
              filter: 'blur(10px)',
            }}
            animate={{
              scale: [1.1, 1.4, 1.1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />

          <motion.div
            animate={{
              y: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.1,
            }}
          >
            <Text
              fontSize={{ base: '5xl', md: '8xl' }}
              fontWeight="extrabold"
              bgGradient="linear(to-r, blue.300, blue.500)"
              bgClip="text"
              textShadow="0 0 30px rgba(66,153,225,0.5)"
              style={{
                display: 'block',
                position: 'relative',
              }}
            >
              {animatedScore}
            </Text>
          </motion.div>
        </Box>
      </motion.div>
    </HStack>
  )
}

export default memo(ScoreDisplay)
