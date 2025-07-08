// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryLoadingOverlay.jsx
import React, { memo, useMemo } from 'react'
import { Box, VStack, Text, Icon, useBreakpointValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  RotateCcw,
  Play,
  Sparkles,
  Zap,
  Target,
  Star,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionIcon = motion(Icon)

/**
 * Enhanced Category Loading Overlay with Beautiful Animations
 */
const CategoryLoadingOverlay = memo(
  ({ isLoading, loadingType, categoryInfo, getLoadingText }) => {
    // Responsive values
    const overlayPadding = useBreakpointValue({ base: 2, sm: 3, md: 4 })
    const iconSize = useBreakpointValue({
      base: '28px',
      sm: '32px',
      md: '36px',
    })
    const fontSize = useBreakpointValue({
      base: '2xs',
      sm: 'xs',
      md: 'sm',
    })

    // Animation configurations for different loading types
    const animationConfig = useMemo(() => {
      const configs = {
        selecting: {
          icon: CheckCircle,
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          particles: 6,
          text: 'Selecting Category...',
          iconAnimation: {
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          },
          particleAnimation: {
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 360],
          },
        },
        deselecting: {
          icon: RotateCcw,
          primaryColor: '#F59E0B',
          secondaryColor: '#D97706',
          particles: 4,
          text: 'Changing Selection...',
          iconAnimation: {
            rotate: [0, -360, 0],
            scale: [1, 0.8, 1],
          },
          particleAnimation: {
            scale: [1, 0, 1],
            opacity: [1, 0, 1],
            rotate: [0, -180],
          },
        },
        beginning: {
          icon: Play,
          primaryColor: '#10B981',
          secondaryColor: '#047857',
          particles: 8,
          text: 'Starting Challenge...',
          iconAnimation: {
            scale: [1, 1.3, 1],
            x: [0, 3, 0],
          },
          particleAnimation: {
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
            y: [0, -20, 0],
          },
        },
        default: {
          icon: Sparkles,
          primaryColor: categoryInfo?.primaryColor || '#8B5CF6',
          secondaryColor: categoryInfo?.secondaryColor || '#5B21B6',
          particles: 5,
          text: 'Processing...',
          iconAnimation: {
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          },
          particleAnimation: {
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
          },
        },
      }

      return configs[loadingType] || configs.default
    }, [loadingType, categoryInfo])

    // Particle positions for different particle counts
    const getParticlePositions = count => {
      const positions = []
      const angleStep = 360 / count
      const radius = 45

      for (let i = 0; i < count; i++) {
        const angle = (angleStep * i * Math.PI) / 180
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        positions.push({ x, y, delay: i * 0.1 })
      }

      return positions
    }

    const particlePositions = useMemo(
      () => getParticlePositions(animationConfig.particles),
      [animationConfig.particles],
    )

    // Main overlay animations
    const overlayVariants = {
      initial: { opacity: 0, scale: 0.8 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        transition: {
          duration: 0.2,
          ease: 'easeIn',
        },
      },
    }

    // Background pulse animation
    const backgroundVariants = {
      animate: {
        background: [
          `radial-gradient(circle, ${animationConfig.primaryColor}20 0%, transparent 70%)`,
          `radial-gradient(circle, ${animationConfig.secondaryColor}30 0%, transparent 70%)`,
          `radial-gradient(circle, ${animationConfig.primaryColor}20 0%, transparent 70%)`,
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    }

    // Ripple effect animation
    const rippleVariants = {
      animate: {
        scale: [1, 2.5, 1],
        opacity: [0.5, 0, 0.5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        },
      },
    }

    if (!isLoading) return null

    return (
      <AnimatePresence>
        <MotionBox
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.85)"
          borderRadius={{ base: 'lg', sm: 'xl' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10}
          backdropFilter="blur(8px)"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Animated Background */}
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            borderRadius={{ base: 'lg', sm: 'xl' }}
            variants={backgroundVariants}
            animate="animate"
          />

          {/* Ripple Effects */}
          {[...Array(3)].map((_, i) => (
            <MotionBox
              key={`ripple-${i}`}
              position="absolute"
              top="50%"
              left="50%"
              w="60px"
              h="60px"
              borderRadius="50%"
              border="2px solid"
              borderColor={animationConfig.primaryColor}
              variants={rippleVariants}
              animate="animate"
              style={{
                x: '-50%',
                y: '-50%',
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}

          {/* Main Content Container */}
          <VStack spacing={3} position="relative" zIndex={2}>
            {/* Central Icon with Animation */}
            <Box
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* Floating Particles */}
              {particlePositions.map((pos, index) => (
                <MotionBox
                  key={`particle-${index}`}
                  position="absolute"
                  w="6px"
                  h="6px"
                  borderRadius="50%"
                  bg={`linear-gradient(135deg, ${animationConfig.primaryColor}, ${animationConfig.secondaryColor})`}
                  boxShadow={`0 0 10px ${animationConfig.primaryColor}`}
                  animate={{
                    ...animationConfig.particleAnimation,
                    x: [0, pos.x, 0],
                    y: [0, pos.y, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: pos.delay,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* Central Icon */}
              <Box
                bg={`linear-gradient(135deg, ${animationConfig.primaryColor}, ${animationConfig.secondaryColor})`}
                borderRadius="full"
                p={overlayPadding}
                boxShadow={`0 0 30px ${animationConfig.primaryColor}60`}
                position="relative"
                zIndex={3}
              >
                <MotionIcon
                  as={animationConfig.icon}
                  boxSize={iconSize}
                  color="white"
                  animate={animationConfig.iconAnimation}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </Box>

              {/* Orbital Elements */}
              {loadingType === 'beginning' && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <MotionBox
                      key={`orbital-${i}`}
                      position="absolute"
                      w="3px"
                      h="3px"
                      borderRadius="50%"
                      bg={animationConfig.primaryColor}
                      animate={{
                        rotate: [0, 360],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'linear',
                      }}
                      style={{
                        x: '25px',
                        y: '0px',
                        transformOrigin: '-25px center',
                      }}
                    />
                  ))}
                </>
              )}
            </Box>

            {/* Loading Text with Typing Animation */}
            <MotionBox
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius="full"
              px={4}
              py={2}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.2)"
              animate={{
                boxShadow: [
                  `0 0 10px ${animationConfig.primaryColor}40`,
                  `0 0 20px ${animationConfig.primaryColor}60`,
                  `0 0 10px ${animationConfig.primaryColor}40`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Text
                color="white"
                fontSize={fontSize}
                fontWeight="bold"
                textAlign="center"
                letterSpacing="0.5px"
                textShadow={`0 0 10px ${animationConfig.primaryColor}`}
              >
                {getLoadingText(loadingType)}
              </Text>
            </MotionBox>

            {/* Progress Indicator */}
            <MotionBox
              w="60px"
              h="2px"
              bg="rgba(255, 255, 255, 0.2)"
              borderRadius="full"
              overflow="hidden"
            >
              <MotionBox
                h="100%"
                bg={`linear-gradient(90deg, ${animationConfig.primaryColor}, ${animationConfig.secondaryColor})`}
                borderRadius="full"
                animate={{
                  x: ['-100%', '100%'],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </MotionBox>

            {/* Success/Action Icons for specific operations */}
            {loadingType === 'selecting' && (
              <MotionBox
                position="absolute"
                top="-10px"
                right="-10px"
                animate={{
                  scale: [0, 1, 1.1, 1],
                  rotate: [0, 0, 10, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                }}
              >
                <Icon
                  as={Star}
                  boxSize="16px"
                  color={animationConfig.primaryColor}
                  filter={`drop-shadow(0 0 5px ${animationConfig.primaryColor})`}
                />
              </MotionBox>
            )}

            {loadingType === 'beginning' && (
              <MotionBox
                position="absolute"
                bottom="-15px"
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Icon
                  as={Target}
                  boxSize="20px"
                  color={animationConfig.secondaryColor}
                  filter={`drop-shadow(0 0 8px ${animationConfig.secondaryColor})`}
                />
              </MotionBox>
            )}
          </VStack>

          {/* Corner Sparkles */}
          {[...Array(4)].map((_, i) => (
            <MotionBox
              key={`sparkle-${i}`}
              position="absolute"
              {...(i === 0 && { top: '10px', left: '10px' })}
              {...(i === 1 && { top: '10px', right: '10px' })}
              {...(i === 2 && { bottom: '10px', left: '10px' })}
              {...(i === 3 && { bottom: '10px', right: '10px' })}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            >
              <Icon
                as={Sparkles}
                boxSize="12px"
                color={animationConfig.primaryColor}
                filter={`drop-shadow(0 0 3px ${animationConfig.primaryColor})`}
              />
            </MotionBox>
          ))}
        </MotionBox>
      </AnimatePresence>
    )
  },
)

CategoryLoadingOverlay.displayName = 'CategoryLoadingOverlay'

export default CategoryLoadingOverlay
