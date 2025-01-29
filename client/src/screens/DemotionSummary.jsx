import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  SimpleGrid,
  useToken,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { hideDemotionSummary } from '../redux/demotionSummarySlice'
import { Crown, Award, Star, Target, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { keyframes } from '@emotion/react'

const MotionBox = motion(Box)

// Enhanced animations
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-8px) scale(1.02); }
`

const glowPulse = keyframes`
  0%, 100% { opacity: 0.5; filter: blur(8px); }
  50% { opacity: 0.8; filter: blur(12px); }
`

const shimmerAnimation = keyframes`
  0% { left: -100%; }
  100% { left: 200%; }
`

const StatCard = ({ label, value, prevValue, icon: Icon, color, delay }) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  const getDiffColor = () => {
    if (!prevValue || value === prevValue) return 'whiteAlpha.600'
    return value > prevValue ? 'green.400' : 'red.400'
  }

  const getDiffText = () => {
    if (
      !prevValue ||
      value === prevValue ||
      typeof value != 'number' ||
      typeof prevValue != 'number'
    )
      return ''
    const diff = Math.abs(value - prevValue)
    return `${value > prevValue ? '↑' : '↓'} ${diff.toFixed(1)}`
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      position="relative"
      w="full"
      maxW="280px"
      minH="180px"
    >
      {/* Card background */}
      <Box
        position="absolute"
        inset={0}
        bg="rgba(20, 20, 40, 0.6)"
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        overflow="hidden"
        transition="all 0.3s"
        _hover={{
          borderColor: 'pink.400',
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px -6px rgba(236, 72, 153, 0.4)',
        }}
      />

      {/* Shimmer effect */}
      <Box
        position="absolute"
        top="0"
        height="100%"
        width="50%"
        background="linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
        animation={`${shimmerAnimation} 2.5s infinite ease-in-out`}
        pointerEvents="none"
        zIndex={1}
        overflow="hidden"
        style={{ willChange: 'left' }}
      />

      {/* Content */}
      <VStack
        position="relative"
        spacing={4}
        p={6}
        align="center"
        justify="center"
        h="full"
      >
        <Box
          position="relative"
          p={3}
          borderRadius="full"
          bg="rgba(236, 72, 153, 0.1)"
          animation={`${floatAnimation} 3s infinite ease-in-out`}
        >
          <Icon size={isMobile ? 32 : 36} color={color || '#EC4899'} />
          <Box
            as={Sparkles}
            position="absolute"
            top={-1}
            right={-1}
            size={14}
            color={color || '#EC4899'}
            animation={`${glowPulse} 2s infinite ease-in-out`}
          />
        </Box>

        <Text
          color="whiteAlpha.800"
          fontSize={{ base: 'sm', md: 'md' }}
          fontWeight="medium"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {label}
        </Text>

        <VStack spacing={1}>
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, pink.300, purple.400)"
            bgClip="text"
            letterSpacing="wide"
          >
            {value || '-'}
          </Text>

          {getDiffText() && (
            <Text
              fontSize="sm"
              color={getDiffColor()}
              fontWeight="semibold"
              animation={`${floatAnimation} 2s infinite ease-in-out`}
            >
              {getDiffText()}
            </Text>
          )}
        </VStack>
      </VStack>
    </MotionBox>
  )
}

const DemotionSummary = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { summary } = useSelector(state => state.demotionSummary)
  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleContinue = () => {
    dispatch(hideDemotionSummary())
    navigate('/home')
  }

  return (
    <Box
      minH="100vh"
      py={{ base: 10, md: 16 }}
      px={4}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <MotionBox
        maxW="6xl"
        w="full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <VStack spacing={{ base: 10, md: 16 }}>
          {/* Title Section */}
          <VStack spacing={6} textAlign="center">
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              <Box
                position="relative"
                animation={`${floatAnimation} 3s infinite ease-in-out`}
              >
                <Crown
                  size={isMobile ? 70 : 90}
                  color="#FFD700"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
                  }}
                />
                <Box
                  as={Sparkles}
                  position="absolute"
                  top={-2}
                  right={-2}
                  size={24}
                  color="#FFD700"
                />
              </Box>
            </MotionBox>

            <Box maxW="800px">
              <Text
                fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                fontWeight="bold"
                bgGradient="linear(to-r, pink.300, purple.500, pink.300)"
                bgClip="text"
                letterSpacing="wider"
                lineHeight="shorter"
                mb={4}
              >
                Monthly Leaderboard Reset
              </Text>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="whiteAlpha.900"
                letterSpacing="wide"
                lineHeight="tall"
              >
                A new chapter begins in your intellectual journey. Your previous
                achievements have been honored, and now a fresh path awaits your
                excellence.
              </Text>
            </Box>
          </VStack>

          {/* Stats Grid */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 6, md: 8 }}
            w="full"
            justifyItems="center"
          >
            <StatCard
              label="IQ Score"
              value={summary?.newIQ}
              prevValue={summary?.prevIQ}
              icon={Target}
              color="#FC8181"
              delay={0.3}
            />
            <StatCard
              label="Society"
              value={summary?.newSociety}
              prevValue={summary?.prevSociety}
              icon={Crown}
              color="#FFD700"
              delay={0.4}
            />
            <StatCard
              label="Circle"
              value={summary?.newCircle}
              prevValue={summary?.prevCircle}
              icon={Star}
              color="#48BB78"
              delay={0.5}
            />
          </SimpleGrid>

          {/* Continue Button */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={handleContinue}
              height={{ base: '56px', md: '64px' }}
              px={{ base: 12, md: 16 }}
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="bold"
              color="white"
              bg="rgba(236, 72, 153, 0.1)"
              borderWidth="2px"
              borderColor="pink.400"
              borderRadius="full"
              letterSpacing="wider"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'pink.500',
                boxShadow: '0 5px 20px rgba(236, 72, 153, 0.4)',
              }}
              _active={{ transform: 'translateY(0)' }}
            >
              Continue Your Journey
            </Button>
          </MotionBox>
        </VStack>
      </MotionBox>
    </Box>
  )
}

export default DemotionSummary
