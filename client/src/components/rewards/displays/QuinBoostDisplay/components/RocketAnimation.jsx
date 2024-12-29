//src/components/rewards/displays/RQMBoostDisplay/components/RocketAnimation.jsx
import React, { memo } from 'react'
import { Box, Text, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Rocket, Flame } from 'lucide-react'

const RocketAnimation = ({ multiplier = 1.5 }) => {
  // Use breakpoint values for icon sizes
  const rocketSize = useBreakpointValue({ base: 52, md: 60, lg: 68 })
  const flameSize = useBreakpointValue({ base: 28, md: 32, lg: 36 })
  const containerHeight = useBreakpointValue({
    base: '80px',
    md: '100px',
    lg: '120px',
  })
  const containerWidth = useBreakpointValue({
    base: '320px',
    md: '400px',
    lg: '480px',
  })
  const fontSize = useBreakpointValue({ base: '4xl', md: '5xl', lg: '6xl' })

  return (
    <Box
      position="relative"
      h={containerHeight}
      maxW={containerWidth}
      mx="auto"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Enhanced Background Glow */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(circle, rgba(168,85,247,0.15), rgba(236,72,153,0.1))',
          borderRadius: '50%',
          filter: 'blur(24px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Content Container */}
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 1,
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Rocket Container */}
        <Box position="relative">
          {/* Rocket Icon with Glow */}
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 10px rgba(168,85,247,0.4))',
                'drop-shadow(0 0 15px rgba(168,85,247,0.6))',
                'drop-shadow(0 0 10px rgba(168,85,247,0.4))',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Rocket
              size={rocketSize}
              strokeWidth={1.5}
              color="var(--chakra-colors-purple-400)"
            />
          </motion.div>

          {/* Flame Effect */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '-24px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Flame
              size={flameSize}
              color="var(--chakra-colors-orange-500)"
              style={{
                filter: 'drop-shadow(0 0 8px var(--chakra-colors-orange-500))',
              }}
            />
          </motion.div>
        </Box>

        {/* Enhanced Multiplier Display */}
        <Box position="relative">
          {/* Background Glow for Multiplier */}
          <motion.div
            style={{
              position: 'absolute',
              inset: '-20px',
              background:
                'radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(10px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              type: 'spring',
              stiffness: 200,
              delay: 0.2,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                filter: [
                  'drop-shadow(0 0 12px rgba(168,85,247,0.5))',
                  'drop-shadow(0 0 20px rgba(168,85,247,0.7))',
                  'drop-shadow(0 0 12px rgba(168,85,247,0.5))',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Text
                fontSize={fontSize}
                fontWeight="extrabold"
                bgGradient="linear(to-br, purple.300, pink.300)"
                bgClip="text"
                letterSpacing="tight"
                textShadow="0 0 20px rgba(168,85,247,0.3)"
                ml={2}
              >
                {multiplier}x
              </Text>
            </motion.div>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  )
}

export default memo(RocketAnimation)
