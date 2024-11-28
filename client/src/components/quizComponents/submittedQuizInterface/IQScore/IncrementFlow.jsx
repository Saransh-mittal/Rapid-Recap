import React from 'react'
import { Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionFlex = motion(Flex)

export const IncrementFlow = React.memo(
  ({ originalIncrement, additionalIncrement }) => (
    <MotionFlex
      alignItems="center"
      gap={3}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      justifyContent={'center'}
    >
      <Text fontSize="sm" color="gray.300">
        +{originalIncrement}
      </Text>

      <MotionFlex
        alignItems="center"
        gap={2}
        animate={{
          x: [0, 4, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        and
      </MotionFlex>

      <Text
        fontSize="sm"
        color="gray.300"
        bgGradient="linear(to-r, gray.300, yellow.400)"
        bgClip="text"
      >
        +{additionalIncrement} more
      </Text>
    </MotionFlex>
  ),
)
