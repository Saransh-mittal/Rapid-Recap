// components/quickClashComponents/stats/Stat.jsx
import React from 'react'
import {
  Box,
  Text,
  Tooltip,
  Flex,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const Stat = ({ icon: Icon, label, value, color, isLoading, tooltip }) => {
  // Use custom colors for better contrast
  const bgGradient = `linear(to-br, ${color.replace(
    '.400',
    '.500',
  )}, ${color.replace('.400', '.700')})`
  const iconBg = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')

  return (
    <Tooltip label={tooltip} placement="top" hasArrow>
      <MotionBox
        whileHover={{ y: -3, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        borderRadius="lg"
        overflow="hidden"
        p={0}
        minW={['120px', '150px']}
        maxW="200px"
        flex="1"
        position="relative"
      >
        {/* Background gradient with opacity */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={bgGradient}
          opacity={0.15}
          borderRadius="lg"
        />

        <Box p={4} position="relative">
          <Flex direction="column" align="center" gap={2}>
            {/* Icon with circle background */}
            <Flex
              align="center"
              justify="center"
              bg={iconBg}
              borderRadius="full"
              p={2}
              mb={1}
              w="40px"
              h="40px"
            >
              <Icon size={20} color={color} strokeWidth={2} />
            </Flex>

            {/* Label */}
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="whiteAlpha.700"
              textAlign="center"
            >
              {label}
            </Text>

            {/* Value with skeleton loading state */}
            <Skeleton
              isLoaded={!isLoading}
              borderRadius="md"
              w="100%"
              h={isLoading ? '32px' : 'auto'}
            >
              <Text
                fontSize={['xl', '2xl']}
                fontWeight="bold"
                color="white"
                textAlign="center"
                lineHeight="1"
              >
                {value}
              </Text>
            </Skeleton>
          </Flex>
        </Box>
      </MotionBox>
    </Tooltip>
  )
}

export default Stat
