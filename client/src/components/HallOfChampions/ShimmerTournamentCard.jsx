import React from 'react'
import { Box, Flex, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionFlex = motion(Flex)
const MotionBox = motion(Box)

const ShimmerEffect = () => (
  <MotionBox
    position="absolute"
    top="0"
    left="-200%"
    right="0"
    bottom="0"
    bgGradient="linear(to-r, transparent, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05), transparent)"
    animate={{
      left: ['0%', '200%'],
    }}
    transition={{
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    }}
  />
)

const ShimmerBlock = ({ width, height }) => (
  <Box
    position="relative"
    borderRadius="xl"
    overflow="hidden"
    bg="whiteAlpha.100"
    w={width}
    h={height}
  >
    <ShimmerEffect />
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bgGradient="radial(circle at top left, whiteAlpha.100, transparent 70%)"
    />
  </Box>
)

const GlowEffect = () => (
  <MotionBox
    position="absolute"
    top="-50%"
    left="-50%"
    width="200%"
    height="200%"
    bgGradient="radial(circle at center, rgba(255,255,255,0.05), transparent 70%)"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
)

const ShimmerTournamentCard = () => {
  return (
    <MotionFlex
      w="full"
      maxW="900px"
      mx="auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Flex
        w="full"
        minH={{ base: '180px', md: '80px' }}
        bgGradient="linear(to-r, rgba(44, 52, 87, 0.95), rgba(58, 66, 107, 0.95))"
        borderRadius="2xl"
        overflow="hidden"
        position="relative"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 4 }}
        direction={{ base: 'column', md: 'row' }}
        align={{ md: 'center' }}
        justify={{ md: 'space-between' }}
        gap={{ md: 4 }}
      >
        {/* Background Effects */}
        <GlowEffect />
        <ShimmerEffect />

        {/* Left Section: Rank and Name */}
        <Flex align="center" mb={{ base: 4, md: 0 }} flex={{ md: '0 0 auto' }}>
          <ShimmerBlock width="48px" height="48px" />
          <VStack spacing={2} align="start" ml={4}>
            <ShimmerBlock width="120px" height="24px" />
            <ShimmerBlock width="80px" height="16px" />
          </VStack>
        </Flex>

        {/* Center Section: Stats */}
        <Flex
          justify={{ base: 'space-between', md: 'center' }}
          mb={{ base: 4, md: 0 }}
          gap={{ base: 2, md: 4 }}
          flex={{ md: '0 0 auto' }}
        >
          <ShimmerBlock width="100px" height="40px" />
          <ShimmerBlock width="100px" height="40px" />
          <ShimmerBlock width="100px" height="40px" />
        </Flex>

        {/* Right Section: Categories */}
        <Flex
          flex={{ md: '1' }}
          justify={{ md: 'flex-end' }}
          maxW={{ md: '300px' }}
        >
          <HStack
            spacing={1}
            flexWrap="wrap"
            gap={1}
            justify={{ md: 'flex-end' }}
          >
            <ShimmerBlock width="60px" height="20px" />
            <ShimmerBlock width="80px" height="20px" />
            <ShimmerBlock width="70px" height="20px" />
          </HStack>
        </Flex>

        {/* Card Overlay Effects */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, rgba(255,255,255,0.05), transparent)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="radial(circle at top right, whiteAlpha.100, transparent 50%)"
          pointerEvents="none"
        />
      </Flex>
    </MotionFlex>
  )
}

export default ShimmerTournamentCard
