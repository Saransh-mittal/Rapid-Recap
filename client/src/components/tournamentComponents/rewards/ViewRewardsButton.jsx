import React, { useState } from 'react'
import { Box, HStack, Text } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star } from 'lucide-react'

const ViewRewardsButton = ({ onClick }) => {
  const [isClicked, setIsClicked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    setTimeout(() => {
      onClick?.()
      setTimeout(() => setIsClicked(false), 500)
    }, 300)
  }

  return (
    <AnimatePresence>
      {!isClicked && (
        <Box
          as={motion.button}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          w="full"
          maxW="lg"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.3, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{
            scale: 0.95,
            transition: { duration: 0.1 },
          }}
          position="relative"
          overflow="hidden"
        >
          {/* Main background with premium gradient */}
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-r, rgba(88, 28, 135, 0.8), rgba(45, 55, 72, 0.8))"
            borderRadius="lg"
            border="1px solid"
            borderColor="purple.500"
            transition="all 0.3s"
          />

          {/* Animated border glow */}
          <Box
            as={motion.div}
            position="absolute"
            inset={-1}
            borderRadius="lg"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHovered ? [0.4, 0.6, 0.4] : 0,
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            bgGradient="linear(to-r, purple.500, blue.500, purple.500)"
            style={{ filter: 'blur(2px)' }}
          />

          {/* Shimmering overlay */}
          <Box
            as={motion.div}
            position="absolute"
            inset={0}
            overflow="hidden"
            borderRadius="lg"
          >
            <Box
              as={motion.div}
              position="absolute"
              top="-50%"
              left="-50%"
              width="200%"
              height="200%"
              bgGradient="linear(45deg, transparent, rgba(255,255,255,0.1), transparent)"
              animate={{
                transform: ['translateX(-100%)', 'translateX(100%)'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 1,
              }}
            />
          </Box>

          {/* Content */}
          <HStack
            as={motion.div}
            spacing={4}
            justify="center"
            align="center"
            py={4}
            px={6}
            position="relative"
          >
            <motion.div
              animate={
                isHovered
                  ? {
                      rotate: [0, -10, 0],
                      transition: { duration: 0.5 },
                    }
                  : {}
              }
            >
              <Trophy
                size={24}
                style={{
                  color: '#FFD700',
                  filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.5))',
                }}
              />
            </motion.div>

            <Text
              color="white"
              fontSize="lg"
              fontWeight="600"
              letterSpacing="wide"
              textShadow="0 0 10px rgba(255,255,255,0.3)"
            >
              View Tournament Rewards
            </Text>

            <motion.div
              animate={
                isHovered
                  ? {
                      rotate: [0, 10, 0],
                      scale: [1, 1.1, 1],
                      transition: { duration: 0.5 },
                    }
                  : {}
              }
            >
              <Star
                size={24}
                style={{
                  color: '#FFD700',
                  filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.5))',
                }}
              />
            </motion.div>
          </HStack>

          {/* Click ripple effect */}
          {isClicked && (
            <Box
              as={motion.div}
              position="absolute"
              top="50%"
              left="50%"
              initial={{
                width: '10px',
                height: '10px',
                opacity: 0.8,
                x: '-50%',
                y: '-50%',
              }}
              animate={{
                width: '400px',
                height: '400px',
                opacity: 0,
              }}
              transition={{ duration: 0.5 }}
              style={{
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0) 70%)',
              }}
            />
          )}
        </Box>
      )}
    </AnimatePresence>
  )
}

export default ViewRewardsButton
