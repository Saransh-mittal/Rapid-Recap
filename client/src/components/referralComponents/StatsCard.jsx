import React from 'react'
import { Box, Heading, Text, VStack, HStack, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const MotionFlex = motion(Flex)

// Stats Card Component with enhanced aesthetics
const StatsCard = ({ icon: Icon, title, value, color = '#E9D8FD' }) => (
  <MotionFlex
    justify="space-between"
    p={7}
    bg="rgba(255,255,255,0.03)"
    backdropFilter="blur(10px)"
    rounded="xl"
    border="1px solid"
    borderColor="rgba(255,255,255,0.1)"
    initial={{ scale: 0.97, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{
      scale: 1.02,
      borderColor: 'rgba(139, 92, 246, 0.5)',
      transition: { duration: 0.2 },
    }}
    transition={{ duration: 0.3 }}
  >
    <HStack spacing={4}>
      <Icon size={24} color={color} />
      <VStack align="flex-start" spacing={0}>
        <Text color="whiteAlpha.900" fontSize="md">
          {title}
        </Text>
        <Heading
          size="3xl"
          bgGradient="linear(to-r, purple.400, pink.400)"
          bgClip="text"
        >
          {value}
        </Heading>
      </VStack>
    </HStack>
    <Box>
      <Sparkles size={32} color={color} />
    </Box>
  </MotionFlex>
)

export default StatsCard
