// components/quickClashComponents/ui/EnhancedTrophyDisplay.jsx
import React, { useEffect } from 'react'
import { Box, Flex, Icon, Text, HStack } from '@chakra-ui/react'
import { motion, useAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)

/**
 * Enhanced component to display trophy changes with animations
 */
const EnhancedTrophyChangeDisplay = ({
  trophyChange,
  showAnimation = false,
}) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimation()

  useEffect(() => {
    if (showAnimation) {
      controls.start({
        scale: [1, 1.2, 1],
        transition: {
          duration: 0.8,
          repeat: 3,
          repeatType: 'reverse',
        },
      })
    }
  }, [showAnimation, controls])

  if (trophyChange === undefined) return null

  // Zero change display
  if (trophyChange === 0) {
    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <HStack
          spacing={1}
          bg="rgba(200, 200, 200, 0.1)"
          px={2}
          py={1}
          borderRadius="full"
          borderWidth="1px"
          borderColor="rgba(200, 200, 200, 0.3)"
        >
          <Icon as={Trophy} color="yellow.400" boxSize={4} />
          <Text color="whiteAlpha.800" fontWeight="bold" fontSize="sm">
            ±0
          </Text>
        </HStack>
      </MotionBox>
    )
  }

  // Positive change
  if (trophyChange > 0) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 5 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 15,
          },
        }}
      >
        <HStack
          spacing={1}
          bg="rgba(72, 187, 120, 0.15)"
          px={2.5}
          py={1}
          borderRadius="full"
          borderWidth="1px"
          borderColor="rgba(72, 187, 120, 0.4)"
          boxShadow="0 0 10px rgba(72, 187, 120, 0.2)"
        >
          <MotionIcon
            as={Trophy}
            color="yellow.400"
            boxSize={4}
            animate={controls}
          />
          <MotionFlex align="center">
            <MotionText
              color="green.400"
              fontWeight="bold"
              fontSize="sm"
              animate={controls}
            >
              +{trophyChange}
            </MotionText>
            <MotionIcon
              as={ChevronUp}
              color="green.400"
              boxSize={4}
              ml={0.5}
              animate={
                showAnimation
                  ? {
                      y: [0, -2, 0],
                      opacity: [1, 0.8, 1],
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      },
                    }
                  : {}
              }
            />
          </MotionFlex>
        </HStack>
      </MotionBox>
    )
  }

  // Negative change
  return (
    <MotionBox
      initial={{ opacity: 0, y: 5 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 15,
        },
      }}
    >
      <HStack
        spacing={1}
        bg="rgba(245, 101, 101, 0.15)"
        px={2.5}
        py={1}
        borderRadius="full"
        borderWidth="1px"
        borderColor="rgba(245, 101, 101, 0.4)"
        boxShadow="0 0 10px rgba(245, 101, 101, 0.2)"
      >
        <MotionIcon
          as={Trophy}
          color="yellow.400"
          boxSize={4}
          animate={controls}
        />
        <MotionFlex align="center">
          <MotionText
            color="red.400"
            fontWeight="bold"
            fontSize="sm"
            animate={controls}
          >
            {trophyChange}
          </MotionText>
          <MotionIcon
            as={ChevronDown}
            color="red.400"
            boxSize={4}
            ml={0.5}
            animate={
              showAnimation
                ? {
                    y: [0, 2, 0],
                    opacity: [1, 0.8, 1],
                    transition: {
                      duration: 1,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    },
                  }
                : {}
            }
          />
        </MotionFlex>
      </HStack>
    </MotionBox>
  )
}

export default EnhancedTrophyChangeDisplay
