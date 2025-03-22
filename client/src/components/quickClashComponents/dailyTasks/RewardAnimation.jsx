// components/quickClashComponents/dailyTasks/RewardAnimation.jsx
import React, { useEffect } from 'react'
import { Box, Text, HStack, Center, Flex } from '@chakra-ui/react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { Award } from 'lucide-react'
import confetti from 'canvas-confetti'

const MotionBox = motion(Box)
const MotionText = motion(Text)

const RewardAnimation = ({ xp, onComplete }) => {
  const controls = useAnimation()

  // Run the animation sequence
  useEffect(() => {
    const runAnimation = async () => {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
      })

      // Run the animation sequence
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 1 },
      })

      // Float and fade out
      await controls.start({
        y: -30,
        opacity: 0,
        transition: { duration: 0.8, delay: 1 },
      })

      // Notify parent when animation is complete
      if (onComplete) {
        onComplete()
      }
    }

    runAnimation()
  }, [controls, onComplete])

  return (
    <AnimatePresence>
      <Center
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={10}
        bg="rgba(0, 0, 0, 0.7)"
        backdropFilter="blur(3px)"
        overflow="hidden"
      >
        <Flex direction="column" align="center" justify="center">
          {/* XP Animation */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={controls}
            mb={4}
          >
            <HStack
              bg="yellow.500"
              p={3}
              borderRadius="lg"
              boxShadow="0 0 20px rgba(236, 201, 75, 0.7)"
            >
              <Award size={24} color="white" />
              <MotionText
                color="white"
                fontWeight="bold"
                fontSize="2xl"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                +{xp} XP
              </MotionText>
            </HStack>
          </MotionBox>

          {/* Congratulation Text */}
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            mt={4}
          >
            <Text fontSize="lg" color="white" fontWeight="bold">
              Task Completed!
            </Text>
          </MotionBox>
        </Flex>
      </Center>
    </AnimatePresence>
  )
}

export default RewardAnimation
