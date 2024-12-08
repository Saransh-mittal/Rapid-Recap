import React from 'react'
import { Flex, Icon, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const MotionFlex = motion(Flex)

export const FinalIncrement = React.memo(
  ({ boostedIncrement, boostMultiplier }) => (
    <MotionFlex
      position="absolute"
      bottom="-28px"
      right={0}
      justifyContent="center"
      alignItems="center"
      gap={2}
      w={boostMultiplier > 1 ? 'auto' : '200px'}
      left={boostMultiplier > 1 ? 0 : '-68%'}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Icon as={Sparkles} color="yellow.400" boxSize={4} />
      <Text
        fontSize="md"
        fontWeight="bold"
        bgGradient="linear(to-r, yellow.400, orange.400)"
        bgClip="text"
      >
        +{boostedIncrement} points
      </Text>
    </MotionFlex>
  ),
)
