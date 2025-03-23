// components/quickClashComponents/dailyTasks/RewardAnimation.jsx
import React, { useEffect, useRef } from 'react'
import { Box, Text, HStack, Center, Flex, Icon } from '@chakra-ui/react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { Award, Star, Trophy, Sparkles, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)

const RewardAnimation = ({ xp, onComplete }) => {
  const controls = useAnimation()
  const { t } = useTranslation('QuickClash')
  const particleRef = useRef([])

  // Generate random particles
  useEffect(() => {
    particleRef.current = Array.from({ length: 15 }, () => ({
      x: Math.random() * 80 - 40,
      y: Math.random() * 80 - 40,
      scale: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5,
      duration: Math.random() * 1 + 1,
    }))
  }, [])

  // Run the animation sequence
  useEffect(() => {
    const runAnimation = async () => {
      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5, x: 0.5 },
        colors: ['#805AD5', '#D53F8C', '#38B2AC', '#DD6B20', '#4299E1'],
        gravity: 0.7,
        scalar: 1.2,
        shapes: ['circle', 'square'],
      })

      // After a short delay, fire another burst for more impact
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5, x: 0.5 },
          colors: ['#FFDD33', '#FF3366', '#90CDF4'],
          drift: 1,
          ticks: 200,
        })
      }, 300)

      // Run the animation sequence
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.8,
          type: 'spring',
          stiffness: 300,
          damping: 15,
        },
      })

      // Pulse and glow
      await controls.start({
        scale: [1, 1.1, 1],
        boxShadow: [
          '0 0 20px rgba(128, 90, 213, 0.7)',
          '0 0 40px rgba(128, 90, 213, 0.9)',
          '0 0 20px rgba(128, 90, 213, 0.7)',
        ],
        transition: { duration: 1.5, times: [0, 0.5, 1] },
      })

      // Show for a longer duration before fading
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Float and fade out
      await controls.start({
        y: -40,
        opacity: 0,
        transition: { duration: 0.8 },
      })

      // Notify parent when animation is complete
      if (onComplete) {
        onComplete()
      }
    }

    runAnimation()
  }, [controls, onComplete])

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={9999}
      bg="rgba(0, 0, 0, 0.75)"
      backdropFilter="blur(6px)"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Radial gradient background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="transparent"
        bgGradient="radial(circle at center, rgba(128, 90, 213, 0.3), transparent 70%)"
        zIndex={0}
        pointerEvents="none"
      />

      {/* Animated stars/particles in background */}
      {particleRef.current.map((particle, index) => (
        <MotionBox
          key={index}
          position="absolute"
          left="50%"
          top="50%"
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: particle.x + 'vw',
            y: particle.y + 'vh',
            opacity: [0, 0.8, 0],
            scale: [0, particle.scale, 0],
            rotate: [0, particle.rotation],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          zIndex={1}
        >
          <Icon
            as={index % 3 === 0 ? Star : index % 3 === 1 ? Sparkles : Zap}
            color={
              index % 4 === 0
                ? 'purple.400'
                : index % 4 === 1
                ? 'yellow.400'
                : index % 4 === 2
                ? 'blue.400'
                : 'pink.400'
            }
            boxSize={(index % 5) + 3}
          />
        </MotionBox>
      ))}

      <Flex
        direction="column"
        align="center"
        justify="center"
        zIndex={5}
        position="relative"
      >
        {/* XP Animation */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.5, y: 20, rotate: -5 }}
          animate={controls}
          mb={4}
          position="relative"
        >
          <Flex
            bg="rgba(26, 32, 44, 0.9)"
            p={5}
            borderRadius="2xl"
            boxShadow="0 0 30px rgba(128, 90, 213, 0.5)"
            border="2px solid"
            borderColor="yellow.400"
            direction="column"
            align="center"
            position="relative"
            overflow="hidden"
          >
            {/* Background glow effect */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(to-b, rgba(236, 201, 75, 0.2), rgba(236, 201, 75, 0))"
              zIndex={0}
            />

            {/* Reward icon with animation */}
            <MotionBox
              mb={3}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{
                scale: [0.8, 1.2, 1],
                rotate: [-10, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              zIndex={1}
            >
              <Award size={40} color="#F6E05E" />
            </MotionBox>

            <MotionText
              color="white"
              fontWeight="extrabold"
              fontSize="4xl"
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                textShadow: [
                  '0 0 5px rgba(236, 201, 75, 0.5)',
                  '0 0 15px rgba(236, 201, 75, 0.8)',
                  '0 0 5px rgba(236, 201, 75, 0.5)',
                ],
              }}
              transition={{
                delay: 0.2,
                duration: 0.4,
                textShadow: {
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 1.5,
                },
              }}
              textAlign="center"
              bgGradient="linear(to-b, yellow.400, yellow.300)"
              bgClip="text"
              zIndex={1}
            >
              +{xp} XP
            </MotionText>
          </Flex>

          {/* Small decorative elements around the main box */}
          <MotionBox
            position="absolute"
            top="-15px"
            right="-15px"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 5 },
              scale: { repeat: Infinity, repeatType: 'reverse', duration: 2 },
            }}
          >
            <Star size={20} color="#F6E05E" fill="#F6E05E" />
          </MotionBox>

          <MotionBox
            position="absolute"
            bottom="-10px"
            left="-10px"
            animate={{
              rotate: [0, -360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 7 },
              scale: {
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 1.5,
              },
            }}
          >
            <Sparkles size={20} color="#63B3ED" />
          </MotionBox>
        </MotionBox>

        {/* Congratulation Text */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [1, 1.05, 1],
          }}
          transition={{
            delay: 0.5,
            duration: 0.4,
            scale: {
              delay: 1,
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 1.5,
            },
          }}
          mt={4}
          textAlign="center"
        >
          <HStack spacing={2} justify="center">
            <MotionIcon
              as={Trophy}
              color="yellow.400"
              boxSize={5}
              animate={{
                rotate: [-10, 10],
                y: [0, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 1.5,
              }}
            />
            <Text
              fontSize="xl"
              color="white"
              fontWeight="bold"
              textShadow="0 0 10px rgba(128, 90, 213, 0.8)"
            >
              {t('Task Completed!')}
            </Text>
            <MotionIcon
              as={Trophy}
              color="yellow.400"
              boxSize={5}
              animate={{
                rotate: [10, -10],
                y: [0, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 1.5,
                delay: 0.2,
              }}
            />
          </HStack>
          <Text fontSize="sm" color="whiteAlpha.800" mt={1} fontWeight="medium">
            {t('Keep up the great work!')}
          </Text>
        </MotionBox>
      </Flex>
    </Box>
  )
}

export default RewardAnimation
