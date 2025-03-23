// components/quickClashComponents/dailyTasks/TaskCompletionAnimation.jsx
import React, { useEffect, useRef } from 'react'
import { Box, Text, Center, Flex, Icon, HStack, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  CheckCircle,
  Star,
  Sparkles,
  Zap,
  Award,
  Trophy,
  ThumbsUp,
  Flame,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionIcon = motion(Icon)

/**
 * An enhanced animation component that shows when a task is completed
 * Uses confetti and particle effects for a more celebratory experience
 * Optimized for longer visibility and better performance
 */
const TaskCompletionAnimation = ({ taskTitle, onComplete, level }) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimation()
  const containerRef = useRef(null)

  // Get color based on task difficulty level
  const getColorScheme = () => {
    switch (level) {
      case 1:
        return {
          main: 'green',
          gradient: 'linear(to-r, green.500, teal.400)',
          gradientAlt: 'linear(to-br, green.400, teal.300, cyan.400)',
        }
      case 2:
        return {
          main: 'blue',
          gradient: 'linear(to-r, blue.500, cyan.400)',
          gradientAlt: 'linear(to-br, blue.400, cyan.300, indigo.400)',
        }
      case 3:
        return {
          main: 'purple',
          gradient: 'linear(to-r, purple.500, pink.400)',
          gradientAlt: 'linear(to-br, purple.400, pink.300, violet.400)',
        }
      case 4:
        return {
          main: 'orange',
          gradient: 'linear(to-r, orange.500, yellow.400)',
          gradientAlt: 'linear(to-br, orange.400, yellow.300, red.400)',
        }
      case 5:
        return {
          main: 'red',
          gradient: 'linear(to-r, red.500, orange.400)',
          gradientAlt: 'linear(to-br, red.400, orange.300, pink.400)',
        }
      default:
        return {
          main: 'purple',
          gradient: 'linear(to-r, purple.500, pink.400)',
          gradientAlt: 'linear(to-br, purple.400, pink.300, violet.400)',
        }
    }
  }

  const colorScheme = getColorScheme()

  // Enhanced icons based on difficulty
  const getTaskIcon = () => {
    switch (level) {
      case 1:
        return CheckCircle
      case 2:
        return ThumbsUp
      case 3:
        return Trophy
      case 4:
        return Award
      case 5:
        return Flame
      default:
        return CheckCircle
    }
  }

  const TaskIcon = getTaskIcon()

  // Generate particles for the animation - optimized for performance
  const particles = React.useMemo(() => {
    // Create fewer particles for better performance but with more varied timing
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      icon:
        i % 4 === 0
          ? Star
          : i % 4 === 1
          ? Sparkles
          : i % 4 === 2
          ? Zap
          : Trophy,
      x: Math.random() * 240 - 120,
      y: Math.random() * 240 - 120,
      size: Math.random() * 1.5 + 1,
      // More varied delay for a longer-lasting effect
      delay: Math.random() * 1.5 + (i % 4) * 0.5,
      // Longer duration for particles
      duration: Math.random() * 1.8 + 2,
      scale: Math.random() * 0.6 + 0.4,
      rotation: Math.random() * 360,
    }))
  }, [])

  // Set up enhanced animation sequence with longer timing
  useEffect(() => {
    const runAnimation = async () => {
      // Trigger confetti with staggered timing for longer visual effect
      if (typeof confetti === 'function') {
        // First burst of confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6, x: 0.5 },
          colors: ['#805AD5', '#D53F8C', '#38B2AC', '#DD6B20', '#4299E1'],
          zIndex: 9999,
          gravity: 0.7, // Slightly lower gravity for slower falling
          scalar: 1.2,
        })

        // Second delayed burst - staggered for longer effect
        setTimeout(() => {
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0.25, y: 0.65 },
            gravity: 0.7,
          })
        }, 700)

        // Third delayed burst from other side
        setTimeout(() => {
          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 0.75, y: 0.65 },
            gravity: 0.7,
          })
        }, 1400)

        // Final small burst to extend the celebration
        setTimeout(() => {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.55, x: 0.5 },
            startVelocity: 25,
            gravity: 0.65,
            scalar: 0.9,
          })
        }, 2100)
      }

      // Initial animation - appear with spring - slightly slower for better visibility
      await controls.start({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.8, // Increased from 0.6
          type: 'spring',
          damping: 12,
          stiffness: 180, // Reduced from 200 for a slightly slower spring
        },
      })

      // Pulse effect - extended for longer visibility
      await controls.start({
        scale: [1, 1.05, 0.98, 1.02, 1],
        transition: { duration: 1.5, times: [0, 0.3, 0.6, 0.8, 1] }, // Increased from 1.2
      })

      // Hold longer - significantly increased for better visibility
      await new Promise(resolve => setTimeout(resolve, 3500)) // Increased from 1500ms to 3500ms

      // Gentle pulse reminder before fade-out
      await controls.start({
        scale: [1, 1.03, 1],
        transition: { duration: 1, times: [0, 0.5, 1] },
      })

      // Additional hold before fade-out
      await new Promise(resolve => setTimeout(resolve, 800))

      // Fade out - slowed down for smoother exit
      await controls.start({
        opacity: 0,
        y: -40,
        scale: 0.9,
        transition: { duration: 0.8 }, // Increased from 0.6
      })

      // Call onComplete after animation is done
      if (onComplete) {
        onComplete()
      }
    }

    runAnimation()
  }, [controls, onComplete])

  return (
    <AnimatePresence>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={9999} // Extremely high z-index to appear above modals
        pointerEvents="none"
        ref={containerRef}
      >
        <Center h="100%" w="100%">
          {/* Main completion notification */}
          <MotionBox
            position="relative"
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={controls}
            maxW="90vw"
            w="340px"
            zIndex={9999} // Ensure this is also high
          >
            <Flex
              bg="rgba(16, 16, 32, 0.95)"
              bgGradient={`linear(to-b, rgba(40, 40, 70, 0.97), rgba(16, 16, 32, 0.97))`}
              borderRadius="2xl"
              px={5}
              py={6}
              direction="column"
              align="center"
              borderWidth="2px"
              borderColor={`${colorScheme.main}.500`}
              boxShadow={`0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(var(--chakra-colors-${colorScheme.main}-500-raw), 0.4)`}
              position="relative"
              overflow="hidden"
            >
              {/* Background glow effects */}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bgGradient={colorScheme.gradient}
                opacity="0.1"
                borderRadius="2xl"
              />

              <Box
                position="absolute"
                top="-30%"
                left="-30%"
                width="60%"
                height="60%"
                borderRadius="full"
                bgGradient={colorScheme.gradientAlt}
                opacity="0.1"
                filter="blur(30px)"
              />

              <Box
                position="absolute"
                bottom="-20%"
                right="-20%"
                width="50%"
                height="50%"
                borderRadius="full"
                bgGradient={colorScheme.gradientAlt}
                opacity="0.1"
                filter="blur(25px)"
              />

              {/* Animated completion icon */}
              <MotionFlex
                width="70px"
                height="70px"
                borderRadius="full"
                bgGradient={colorScheme.gradient}
                color="white"
                justify="center"
                align="center"
                mb={4}
                boxShadow={`0 0 20px rgba(var(--chakra-colors-${colorScheme.main}-500-raw), 0.5)`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: [-20, 10, 0],
                  boxShadow: [
                    `0 0 0 rgba(var(--chakra-colors-${colorScheme.main}-500-raw), 0)`,
                    `0 0 30px rgba(var(--chakra-colors-${colorScheme.main}-500-raw), 0.8)`,
                    `0 0 15px rgba(var(--chakra-colors-${colorScheme.main}-500-raw), 0.5)`,
                  ],
                }}
                transition={{
                  duration: 1, // Increased from 0.8
                  times: [0, 0.6, 1],
                }}
              >
                <MotionIcon
                  as={TaskIcon}
                  boxSize={8}
                  animate={{
                    scale: [1, 1.2, 1],
                    transition: {
                      repeat: 3, // Increased from 2 for more visibility
                      repeatType: 'reverse',
                      duration: 1.2, // Slightly increased from 1
                      repeatDelay: 0.3, // Added delay between repeats
                    },
                  }}
                />
              </MotionFlex>

              {/* Success text with animation */}
              <MotionText
                color="white"
                fontWeight="bold"
                fontSize="xl"
                textAlign="center"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  textShadow: [
                    '0 0 0px rgba(255,255,255,0)',
                    '0 0 8px rgba(255,255,255,0.5)',
                    '0 0 0px rgba(255,255,255,0)',
                  ],
                }}
                transition={{
                  delay: 0.3, // Increased from 0.2
                  textShadow: {
                    repeat: 3, // Increased from 2
                    duration: 1.5, // Increased from 1.2
                    repeatDelay: 0.8, // Added delay between repeats
                  },
                }}
                bgGradient={colorScheme.gradient}
                bgClip="text"
              >
                {t('Task Completed!')}
              </MotionText>

              {/* Task title */}
              <MotionText
                color="whiteAlpha.900"
                fontSize="md"
                fontWeight="medium"
                textAlign="center"
                mt={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }} // Increased from 0.4
                maxW="280px"
                noOfLines={2}
              >
                {taskTitle}
              </MotionText>

              {/* Level indicator */}
              <MotionText
                color={`${colorScheme.main}.300`}
                fontSize="sm"
                mt={3}
                fontWeight="bold"
                textAlign="center"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }} // Increased from 0.6
              >
                <HStack spacing={1} justify="center">
                  {Array.from({ length: level }).map((_, i) => (
                    <MotionIcon
                      key={i}
                      as={Star}
                      color={`${colorScheme.main}.300`}
                      boxSize={4}
                      initial={{ scale: 0 }}
                      animate={{
                        scale: 1,
                        // Add a subtle pulse effect that lasts throughout the animation
                        ...(i === Math.floor(level / 2) && {
                          filter: [
                            'drop-shadow(0 0 1px rgba(255,255,255,0.1))',
                            'drop-shadow(0 0 3px rgba(255,255,255,0.6))',
                            'drop-shadow(0 0 1px rgba(255,255,255,0.1))',
                          ],
                        }),
                      }}
                      transition={{
                        delay: 0.8 + i * 0.15, // Increased delay spacing between stars
                        filter: {
                          repeat: Infinity,
                          repeatType: 'reverse',
                          duration: 2,
                          repeatDelay: 0.5,
                        },
                      }}
                    />
                  ))}
                </HStack>
              </MotionText>

              {/* Star particles animation with enhanced effects - optimized for performance */}
              {particles.map(particle => (
                <MotionBox
                  key={particle.id}
                  position="absolute"
                  top="50%"
                  left="50%"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                    rotate: 0,
                  }}
                  animate={{
                    x: particle.x,
                    y: particle.y,
                    opacity: [0, 0.9, 0],
                    scale: [0, particle.scale, 0],
                    rotate: [0, particle.rotation],
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: 'easeOut',
                  }}
                >
                  <Icon
                    as={particle.icon}
                    color={`${colorScheme.main}.${
                      particle.id % 2 ? '400' : '300'
                    }`}
                    boxSize={particle.size * 3}
                    filter={`drop-shadow(0 0 2px ${
                      particle.id % 2
                        ? 'rgba(255,255,255,0.5)'
                        : `var(--chakra-colors-${colorScheme.main}-300)`
                    })`}
                  />
                </MotionBox>
              ))}
            </Flex>
          </MotionBox>
        </Center>
      </Box>
    </AnimatePresence>
  )
}

export default TaskCompletionAnimation
