//src/components/rewards/displays/IQBoostDisplay/components/ScoreDisplay.jsx
import React, { memo } from 'react'
import { Box, Text, HStack, useMediaQuery } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useCounter } from '../../../hooks/useCounter'
import { formatNumber } from '../../../../../utils/helper.utils'

const ScoreDisplay = ({ prevScore, newScore, theme }) => {
  const animatedScore = useCounter(newScore, prevScore)
  const isScreenSmallerThan768px = useMediaQuery('(max-width: 768px)')[0]
  const glowColor = theme?.glowColor || 'rgba(66,153,225,0.3)'
  const textGradient =
    theme?.titleGradient || 'linear(to-r, blue.300, blue.500)'
  const iconColor = theme?.iconColor || 'blue.400'

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
              background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
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
              fontSize={{ base: '4xl', md: '7xl' }}
              fontWeight="extrabold"
              color="whiteAlpha.700"
              textShadow={`0 0 20px ${glowColor}`}
              style={{
                display: 'block',
                position: 'relative',
              }}
            >
              {formatNumber(prevScore)}
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
              `drop-shadow(0 0 10px ${glowColor})`,
              `drop-shadow(0 0 20px ${glowColor})`,
              `drop-shadow(0 0 10px ${glowColor})`,
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
            color={`var(--chakra-colors-${iconColor.split('.').join('-')})`}
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
          {/* Primary glow effect */}
          <motion.div
            style={{
              position: 'absolute',
              inset: '-20px',
              background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
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

          {/* Secondary glow effect */}
          <motion.div
            style={{
              position: 'absolute',
              inset: '-15px',
              background: `radial-gradient(circle, ${glowColor}, transparent 60%)`,
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
              fontSize={{ base: '4xl', md: '7xl' }}
              fontWeight="extrabold"
              bgGradient={textGradient}
              bgClip="text"
              textShadow={`0 0 30px ${glowColor}`}
              style={{
                display: 'block',
                position: 'relative',
              }}
            >
              {formatNumber(animatedScore)}
            </Text>
          </motion.div>
        </Box>
      </motion.div>
    </HStack>
  )
}

export default memo(ScoreDisplay)
