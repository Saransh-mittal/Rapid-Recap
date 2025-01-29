import React from 'react'
import { Box, VStack, Text, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Crown, Trophy, Star } from 'lucide-react'

const MotionBox = motion(Box)
const MotionText = motion(Text)

const HallOfChampionsHeader = () => {
  const titleSize = useBreakpointValue({ base: '3xl', md: '4xl', lg: '5xl' })
  const subtitleSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-2, 2],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  }

  return (
    <Box position="relative" overflow="hidden" py={6} bg="transparent">
      <MotionBox
        as={VStack}
        spacing={3}
        maxW="1200px"
        mx="auto"
        px={4}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Main Title */}
        <MotionText
          variants={itemVariants}
          fontSize={titleSize}
          fontWeight="bold"
          textAlign="center"
          color="#F4A7D0"
          letterSpacing="wide"
          lineHeight="1.2"
        >
          Hall of Champions
        </MotionText>

        {/* Subtitle */}
        <MotionText
          variants={itemVariants}
          fontSize={subtitleSize}
          color="#B49AF0"
          fontWeight="medium"
          textAlign="center"
          letterSpacing="0.2em"
          textTransform="uppercase"
          opacity={0.9}
          mb={2}
        >
          Where Legends Rise
        </MotionText>

        {/* Icons */}
        <MotionBox variants={itemVariants} display="flex" gap={6} mt={1}>
          {[
            { Icon: Star, color: '#B49AF0' },
            { Icon: Trophy, color: '#F4A7D0' },
            { Icon: Crown, color: '#B49AF0' },
          ].map(({ Icon, color }, index) => (
            <MotionBox
              key={index}
              variants={floatingVariants}
              animate="animate"
            >
              <Icon size={24} color={color} />
            </MotionBox>
          ))}
        </MotionBox>

        {/* Subtle stars in background */}
        {[...Array(10)].map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            top={`${Math.random() * 100}%`}
            left={`${Math.random() * 100}%`}
            width="2px"
            height="2px"
            borderRadius="full"
            bg="white"
            opacity={0.2}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </MotionBox>
    </Box>
  )
}

export default HallOfChampionsHeader
