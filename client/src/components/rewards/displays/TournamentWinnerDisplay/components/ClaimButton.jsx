import React, { useMemo } from 'react'
import { Button, Box, Text, HStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Check, Sparkles } from 'lucide-react'
import {
  claimButtonAnimation,
  successMessageAnimation,
  glowAnimation,
  particleEffect,
  pulseAnimation,
} from '../constants/animations'
import { keyframes } from '@emotion/react'
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`

const ClaimButton = ({ onClick, claimed, variant }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        delay: i * 0.2,
        x: Math.random() * 40 - 20,
      })),
    [],
  )

  return (
    <AnimatePresence mode="wait">
      {!claimed ? (
        <Box
          as={motion.div}
          variants={claimButtonAnimation}
          initial="initial"
          animate="animate"
          exit="exit"
          whileHover="hover"
          whileTap="tap"
          width="full"
          position="relative"
        >
          {/* Glow effect */}
          <Box
            as={motion.div}
            position="absolute"
            inset={0}
            borderRadius="xl"
            bg={variant.glowColor}
            filter="blur(15px)"
            variants={glowAnimation}
            animate="animate"
          />

          <Button
            width="full"
            height="64px"
            onClick={onClick}
            position="relative"
            overflow="hidden"
            borderRadius="xl"
            bg={variant.buttonBg}
            borderWidth="1px"
            borderColor={variant.buttonBorderColor}
            _hover={{
              bg: variant.buttonBg,
              opacity: 0.8,
              transform: 'scale(1.02)',
            }}
            _active={{
              transform: 'scale(0.98)',
            }}
            transition="all 0.3s"
            boxShadow={`0 0 30px ${variant.glowColor}`}
          >
            {/* Shimmer effect */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient={`linear(to-r, transparent, ${variant.shimmerColor}, transparent)`}
              animation={`${shimmer} 2s infinite`}
              pointerEvents="none"
            />

            <HStack
              spacing={4}
              as={motion.div}
              variants={pulseAnimation}
              animate="animate"
            >
              <Gift
                size={24}
                color={`var(--chakra-colors-${variant.colorScheme}-400)`}
              />
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient={variant.buttonGradient}
                bgClip="text"
              >
                Claim Rewards
              </Text>
              <Sparkles
                size={24}
                color={`var(--chakra-colors-${variant.colorScheme}-400)`}
              />
            </HStack>
          </Button>

          {/* Particle effects */}
          {particles.map((particle, index) => (
            <Box
              key={`particle-${index}`}
              as={motion.div}
              position="absolute"
              width="8px"
              height="8px"
              borderRadius="full"
              bg={variant.particleColor}
              variants={particleEffect}
              initial="initial"
              animate="animate"
              custom={particle}
              style={{
                top: '50%',
                left: '50%',
                translateX: '-50%',
                translateY: '-50%',
              }}
            />
          ))}
        </Box>
      ) : (
        <Box
          as={motion.div}
          variants={successMessageAnimation}
          initial="initial"
          animate="animate"
          exit="exit"
          position="relative"
        >
          {/* Success glow */}
          <Box
            position="absolute"
            inset={0}
            borderRadius="xl"
            bg={variant.glowColor}
            filter="blur(20px)"
            as={motion.div}
            variants={glowAnimation}
            animate="animate"
          />

          <HStack
            spacing={4}
            justify="center"
            bg={variant.buttonBg}
            color={variant.buttonText}
            py={4}
            px={8}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={variant.buttonBorderColor}
            boxShadow="0 0 30px rgba(255, 215, 0, 0.2)"
          >
            <Check size={24} />
            <Text
              fontSize="xl"
              fontWeight="bold"
              bgGradient={variant.buttonGradient}
              bgClip="text"
            >
              Reward Claimed!
            </Text>
            <Sparkles size={24} />
          </HStack>
        </Box>
      )}
    </AnimatePresence>
  )
}

export default ClaimButton
