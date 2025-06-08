// components/quickClashComponents/ui/AnalysisLoadingState.jsx
import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Skeleton,
  Text,
  Icon,
  Circle,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BarChart3, Brain, Zap, TrendingUp, MessageCircle } from 'lucide-react'

const MotionBox = motion(Box)
const MotionCircle = motion(Circle)
const MotionIcon = motion(Icon)

/**
 * Comprehensive loading state for analysis card that fills the entire space
 * with animated skeleton elements and engaging visual effects
 */
const AnalysisLoadingState = ({ height = '100%' }) => {
  const { t } = useTranslation('QuickClash')
  const padding = useBreakpointValue({ base: 3, md: 4 })
  const spacing = useBreakpointValue({ base: 2, md: 3 })

  return (
    <Box
      height={height}
      bg="rgba(26, 32, 44, 0.95)"
      position="relative"
      overflow="hidden"
      borderRadius="lg"
    >
      {/* Animated background gradient */}
      <MotionBox
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at 50% 50%, rgba(124, 58, 237, 0.1), transparent 70%)"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Floating particles animation */}
      {Array.from({ length: 8 }).map((_, i) => (
        <MotionCircle
          key={i}
          position="absolute"
          size="4px"
          bg="purple.400"
          opacity={0.4}
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
          }}
          animate={{
            y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
            x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      <VStack
        spacing={spacing}
        p={padding}
        position="relative"
        zIndex={1}
        height="100%"
      >
        {/* Header section with animated icon */}
        <Flex justify="center" align="center" mb={2}>
          <MotionBox
            bg="rgba(124, 58, 237, 0.2)"
            borderRadius="full"
            p={3}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity, repeatType: 'reverse' },
            }}
          >
            <MotionIcon
              as={Brain}
              color="purple.400"
              boxSize={6}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </MotionBox>
        </Flex>

        {/* Loading text with typewriter effect */}
        <MotionBox
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Text
            color="white"
            textAlign="center"
            fontWeight="medium"
            fontSize={{ base: 'sm', md: 'md' }}
            mb={4}
          >
            {t('Analyzing challenge data')}
            <MotionBox
              as="span"
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              ...
            </MotionBox>
          </Text>
        </MotionBox>

        {/* Stats section skeleton */}
        <Box width="100%" mb={4}>
          <HStack justify="space-between" mb={3}>
            <Skeleton height="20px" width="80px" borderRadius="md" />
            <Skeleton height="24px" width="40px" borderRadius="full" />
          </HStack>

          <VStack spacing={2} align="stretch">
            {/* Trophy and score skeletons */}
            <HStack justify="space-between">
              <Skeleton height="32px" width="100px" borderRadius="lg" />
              <Skeleton height="32px" width="60px" borderRadius="lg" />
            </HStack>

            {/* Performance metrics skeletons */}
            <VStack spacing={2} align="stretch" mt={3}>
              {Array.from({ length: 2 }).map((_, i) => (
                <Box key={i}>
                  <HStack justify="space-between" mb={1}>
                    <Skeleton height="16px" width="120px" borderRadius="md" />
                    <Skeleton height="16px" width="40px" borderRadius="md" />
                  </HStack>
                  <MotionBox
                    height="6px"
                    bg="rgba(124, 58, 237, 0.2)"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <MotionBox
                      height="100%"
                      bg="purple.400"
                      borderRadius="full"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  </MotionBox>
                </Box>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* AI Message section skeleton */}
        <Box
          width="100%"
          bg="rgba(45, 55, 72, 0.4)"
          borderRadius="lg"
          p={3}
          borderLeft="3px solid"
          borderColor="green.400"
          position="relative"
          overflow="hidden"
        >
          {/* Shimmer effect */}
          <MotionBox
            position="absolute"
            top="0"
            left="-100%"
            width="100%"
            height="100%"
            bgGradient="linear(to-r, transparent, rgba(255,255,255,0.1), transparent)"
            animate={{
              x: ['0%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <HStack spacing={2} mb={2} position="relative" zIndex={1}>
            <MotionIcon
              as={MessageCircle}
              color="green.400"
              boxSize={4}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
            <Skeleton height="16px" width="100px" borderRadius="md" />
          </HStack>

          <VStack spacing={1.5} align="stretch" position="relative" zIndex={1}>
            <Skeleton height="14px" width="100%" borderRadius="md" />
            <Skeleton height="14px" width="85%" borderRadius="md" />
            <Skeleton height="14px" width="90%" borderRadius="md" />
          </VStack>
        </Box>

        {/* Progress indicators */}
        <HStack spacing={3} mt="auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <MotionCircle
              key={i}
              size="8px"
              bg="purple.400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </HStack>

        {/* Bottom action area skeleton */}
        <Box width="100%" mt={2}>
          <Skeleton height="36px" width="100%" borderRadius="lg" />
        </Box>
      </VStack>

      {/* Scanning line effect */}
      <MotionBox
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="2px"
        bgGradient="linear(to-r, transparent, purple.400, transparent)"
        animate={{
          y: [0, 300, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </Box>
  )
}

export default AnalysisLoadingState
