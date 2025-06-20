// Replace the entire EarlyAdopterStep.jsx file with this clean version

import React, { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  useToast,
  Container,
  HStack,
  Icon,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import {
  Crown,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Gift,
  Star,
} from 'lucide-react'
import { keyframes } from '@emotion/react'
import confetti from 'canvas-confetti'

const MotionBox = motion(Box)
const MotionText = motion(Text)

// Simple animations
const bounceIn = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
`

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`

const EarlyAdopterStep = ({ onComplete }) => {
  const [eocCode, setEocCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const location = useLocation()
  const toast = useToast()

  useEffect(() => {
    // Check for EOC parameter in URL
    const searchParams = new URLSearchParams(location.hash.split('?')[1])
    const eocParam = searchParams.get('EOC') || localStorage.getItem('EOC')
    if (eocParam) {
      setEocCode(eocParam)
      verifyEOCCode(eocParam)
    }
  }, [])

  const verifyEOCCode = async code => {
    if (!code || code.length < 6) {
      setIsValid(false)
      return
    }

    setIsVerifying(true)
    try {
      const response = await axios.get('/api/user/verify-early-adopter', {
        params: { eocCode: code },
      })

      if (response.data.isValid) {
        setIsValid(true)
        localStorage.setItem('EOC', code)
      } else {
        setIsValid(false)
      }
    } catch (error) {
      setIsValid(false)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCodeChange = e => {
    const code = e.target.value.toUpperCase()
    setEocCode(code)
    setIsValid(false)

    if (code.length >= 6) {
      verifyEOCCode(code)
    }
  }

  const triggerSuccessAnimation = () => {
    // Simple confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347'],
    })
  }

  const handleEOCSubmit = async () => {
    if (!eocCode) {
      onComplete({ skipReferral: false })
      return
    }

    if (!isValid) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter your Early Adopter Code',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post('/api/user/apply-early-adopter', { eocCode })

      triggerSuccessAnimation()
      setShowSuccess(true)

      setTimeout(() => {
        onComplete({
          skipReferral: true,
          earlyAdopterCode: eocCode,
        })
      }, 3500)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container
      maxW="lg"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <MotionBox
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            textAlign="center"
            w="100%"
            maxW="400px"
          >
            <VStack spacing={8}>
              {/* Success Crown */}
              <MotionBox
                bg="rgba(255, 215, 0, 0.15)"
                borderRadius="full"
                p={8}
                border="3px solid"
                borderColor="yellow.400"
                animation={`${bounceIn} 0.6s ease-out`}
              >
                <Crown size={80} color="#FFD700" />
              </MotionBox>

              {/* Success Message */}
              <VStack spacing={4}>
                <MotionText
                  fontSize="3xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, yellow.400, orange.400)"
                  bgClip="text"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  🎉 Hurray! 🎉
                </MotionText>

                <MotionText
                  fontSize="xl"
                  color="white"
                  fontWeight="semibold"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  You're an Early Adopter!
                </MotionText>

                <MotionText
                  color="whiteAlpha.800"
                  fontSize="md"
                  maxW="350px"
                  lineHeight="tall"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Welcome to our exclusive community! You now have access to
                  special features and benefits.
                </MotionText>
              </VStack>

              {/* Success Badge */}
              <MotionBox
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Badge
                  bg="rgba(72, 187, 120, 0.2)"
                  color="green.300"
                  px={6}
                  py={3}
                  borderRadius="full"
                  border="1px solid"
                  borderColor="green.400"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  <HStack spacing={2}>
                    <Star size={16} />
                    <Text>Early Adopter Status Activated</Text>
                  </HStack>
                </Badge>
              </MotionBox>
            </VStack>
          </MotionBox>
        ) : (
          <MotionBox
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            w="100%"
            maxW="400px"
          >
            <VStack spacing={8}>
              {/* Header */}
              <VStack spacing={4} textAlign="center">
                <Box>
                  <Crown
                    size={48}
                    color="#FFD700"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.3))',
                    }}
                  />
                </Box>
                <VStack spacing={2}>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    bgGradient="linear(to-r, yellow.400, orange.400)"
                    bgClip="text"
                  >
                    Early Access
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="md">
                    Enter your exclusive access code
                  </Text>
                </VStack>
              </VStack>

              {/* Main Card */}
              <Box
                bg="rgba(26, 21, 39, 0.6)"
                borderRadius="2xl"
                p={8}
                backdropFilter="blur(12px)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                w="100%"
              >
                <VStack spacing={6}>
                  {/* Input Section */}
                  <VStack spacing={3} w="100%">
                    <Text color="white" fontWeight="semibold" fontSize="sm">
                      Access Code
                    </Text>
                    <Input
                      placeholder="Please enter your code"
                      value={eocCode}
                      onChange={handleCodeChange}
                      size="lg"
                      bg="rgba(0, 0, 0, 0.3)"
                      color="white"
                      borderColor={
                        isValid
                          ? 'green.400'
                          : eocCode && !isValid && !isVerifying
                          ? 'red.400'
                          : 'whiteAlpha.400'
                      }
                      borderWidth="2px"
                      _hover={{
                        borderColor: isValid ? 'green.500' : 'purple.400',
                      }}
                      _focus={{
                        borderColor: isValid ? 'green.500' : 'purple.500',
                        boxShadow: 'none',
                      }}
                      textAlign="center"
                      fontWeight="bold"
                      letterSpacing="wide"
                      maxLength={10}
                      fontSize="lg"
                    />

                    {/* Status Messages */}
                    <AnimatePresence>
                      {isVerifying && (
                        <MotionBox
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <HStack spacing={2}>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            >
                              <Sparkles size={14} color="#9F7AEA" />
                            </motion.div>
                            <Text color="purple.300" fontSize="sm">
                              Verifying code...
                            </Text>
                          </HStack>
                        </MotionBox>
                      )}

                      {isValid && !isVerifying && (
                        <MotionBox
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <HStack spacing={2} color="green.400">
                            <CheckCircle size={16} />
                            <Text fontSize="sm" fontWeight="medium">
                              Valid code! Ready to activate
                            </Text>
                          </HStack>
                        </MotionBox>
                      )}

                      {eocCode && !isValid && !isVerifying && (
                        <MotionBox
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Text color="red.400" fontSize="sm">
                            Invalid code. Try RRCORE or RR2025
                          </Text>
                        </MotionBox>
                      )}
                    </AnimatePresence>
                  </VStack>

                  {/* Benefits Preview */}
                  {isValid && (
                    <MotionBox
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      w="100%"
                    >
                      <Divider borderColor="whiteAlpha.300" />
                      <VStack spacing={3} pt={4}>
                        <HStack spacing={2}>
                          <Gift size={16} color="#48BB78" />
                          <Text
                            color="green.300"
                            fontSize="sm"
                            fontWeight="semibold"
                          >
                            You'll Get Access To
                          </Text>
                        </HStack>
                        <VStack spacing={1}>
                          <Text color="whiteAlpha.800" fontSize="xs">
                            • Early access to new features
                          </Text>
                          <Text color="whiteAlpha.800" fontSize="xs">
                            • Priority customer support
                          </Text>
                          <Text color="whiteAlpha.800" fontSize="xs">
                            • Exclusive early adopter badge
                          </Text>
                        </VStack>
                      </VStack>
                    </MotionBox>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={handleEOCSubmit}
                    size="lg"
                    w="100%"
                    h="50px"
                    bg={
                      isValid ? 'green.500' : eocCode ? 'red.500' : 'purple.600'
                    }
                    color="white"
                    _hover={{
                      bg: isValid
                        ? 'green.600'
                        : eocCode
                        ? 'red.600'
                        : 'purple.700',
                      transform: 'translateY(-1px)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    isLoading={isSubmitting}
                    loadingText="Activating..."
                    rightIcon={
                      !isSubmitting ? <ArrowRight size={16} /> : undefined
                    }
                    borderRadius="xl"
                    fontWeight="bold"
                    fontSize="md"
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
                  >
                    {isValid
                      ? 'Activate Early Access'
                      : eocCode
                      ? 'Invalid Code'
                      : 'Continue Without Code'}
                  </Button>
                </VStack>
              </Box>

              {/* Skip Message */}
              {!eocCode && (
                <Text color="whiteAlpha.500" fontSize="sm" textAlign="center">
                  Don't have a code? No problem, continue to explore Rapid Recap
                </Text>
              )}
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </Container>
  )
}

export default EarlyAdopterStep
