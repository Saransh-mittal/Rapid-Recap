// components/quickClashComponents/DateGroupHeader.jsx
import React from 'react'
import { Box, Flex, Text, Divider, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

const MotionFlex = motion(Flex)

/**
 * Displays a stylized date header for grouped challenges
 * @param {Object} props - Component properties
 * @param {String} props.date - Date string to display
 * @param {Number} props.index - Index for staggered animation
 */
const DateGroupHeader = ({ date, index = 0 }) => {
  // Animation variants for staggered entrance
  const animations = {
    hidden: { opacity: 0, y: 10 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  }

  return (
    <MotionFlex
      align="center"
      py={2}
      my={4}
      initial="hidden"
      animate="visible"
      custom={index}
      variants={animations}
    >
      <Box
        bg="rgba(128, 90, 213, 0.2)"
        px={3}
        py={1}
        borderRadius="full"
        display="flex"
        alignItems="center"
        boxShadow="0 0 10px rgba(128, 90, 213, 0.1)"
        borderWidth="1px"
        borderColor="purple.800"
      >
        <Icon as={Calendar} color="purple.300" mr={2} />
        <Text fontSize="sm" fontWeight="medium" color="purple.200">
          {date}
        </Text>
      </Box>

      <Divider flex={1} ml={3} borderColor="whiteAlpha.300" opacity={0.5} />
    </MotionFlex>
  )
}

export default DateGroupHeader
