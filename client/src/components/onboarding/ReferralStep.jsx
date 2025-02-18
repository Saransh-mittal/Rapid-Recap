import React, { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  useToast,
  Flex,
  Heading,
  Avatar,
  HStack,
  Divider,
  Skeleton,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import { Users, Sparkles } from 'lucide-react'
import { keyframes } from '@emotion/react'

const MotionBox = motion(Box)

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 10px rgba(128, 90, 213, 0.3) }
  50% { box-shadow: 0 0 20px rgba(128, 90, 213, 0.6) }
  100% { box-shadow: 0 0 10px rgba(128, 90, 213, 0.3) }
`

const ReferralStep = ({ onComplete }) => {
  const [referralCode, setReferralCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [referrer, setReferrer] = useState(null)
  const location = useLocation()
  const toast = useToast()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.hash.split('?')[1])
    const refCode = searchParams.get('ref') || localStorage.getItem('ref')
    if (refCode) {
      setReferralCode(refCode)
      checkReferralCode(refCode)
    }
  }, [])

  const checkReferralCode = async code => {
    if (!code) return

    setIsChecking(true)
    try {
      const response = await axios.get('/api/user/check-referral', {
        params: { referralCode: code },
      })
      setReferrer(response.data)
    } catch (error) {
      toast({
        title: 'Invalid Referral Code',
        description: error.response?.data?.error || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setReferralCode('')
      setReferrer(null)
    } finally {
      setIsChecking(false)
    }
  }

  const handleCodeChange = e => {
    const code = e.target.value.toUpperCase()
    setReferralCode(code)
    if (code.length === 8) {
      // Only check when code is complete
      checkReferralCode(code)
    } else {
      setReferrer(null)
    }
  }

  const handleReferralSubmit = async () => {
    if (!referralCode) {
      onComplete() // Skip if no code
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post('/api/user/apply-referral', { referralCode })
      toast({
        title: 'Referral Applied!',
        description: 'Welcome to Rapid Recap!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onComplete()
    } catch (error) {
      toast({
        title: 'Error Applying Referral',
        description: error.response?.data?.error || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      px={4}
      textAlign="center"
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        maxW="600px"
        w="100%"
      >
        <VStack spacing={8}>
          <Box>
            <Heading color="white" fontSize={{ base: '2xl', md: '4xl' }} mb={2}>
              Join the Knowledge Revolution
            </Heading>

            <Text
              color="whiteAlpha.900"
              fontSize={{ base: 'md', md: 'lg' }}
              maxW="500px"
            >
              If you have a referral code, enter it below to get started.
            </Text>
          </Box>

          <Box w="100%" maxW="400px">
            <Input
              placeholder="Enter referral code"
              value={referralCode}
              onChange={handleCodeChange}
              size="lg"
              bg="whiteAlpha.100"
              color="white"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: 'purple.400' }}
              _focus={{ borderColor: 'purple.500', boxShadow: 'outline' }}
              mb={4}
              maxLength={8}
            />

            {/* Referrer Details Card */}
            {(isChecking || referrer) && (
              <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                p={4}
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="purple.400"
                mb={4}
                animation={`${glowAnimation} 3s infinite`}
              >
                {isChecking ? (
                  <VStack spacing={3}>
                    <Skeleton height="50px" width="50px" borderRadius="full" />
                    <Skeleton height="20px" width="150px" />
                    <Skeleton height="16px" width="120px" />
                  </VStack>
                ) : (
                  referrer && (
                    <VStack spacing={3}>
                      <Avatar
                        size="lg"
                        src={referrer.pic}
                        name={referrer.name}
                        border="2px"
                        borderColor="purple.400"
                      />
                      <VStack spacing={1}>
                        <HStack spacing={2}>
                          <Users size={16} color="#E9D8FD" />
                          <Text color="white" fontWeight="bold">
                            Referred by
                          </Text>
                        </HStack>
                        <Text
                          color="purple.200"
                          fontSize="lg"
                          fontWeight="bold"
                        >
                          {referrer.inGameName}
                        </Text>
                        <HStack>
                          <Sparkles size={14} color="#B794F4" />
                          <Text color="purple.300" fontSize="sm">
                            {referrer.name}
                          </Text>
                          <Sparkles size={14} color="#B794F4" />
                        </HStack>
                      </VStack>
                    </VStack>
                  )
                )}
              </MotionBox>
            )}

            <Button
              onClick={handleReferralSubmit}
              colorScheme="purple"
              size="lg"
              width="100%"
              isLoading={isSubmitting}
              mb={4}
              isDisabled={referralCode && !referrer}
            >
              {referralCode
                ? referrer
                  ? 'Apply Code'
                  : isChecking
                  ? 'Verifying Code'
                  : 'Invalid Code'
                : 'Skip'}
            </Button>

            {!referralCode && (
              <Text color="whiteAlpha.600" fontSize="sm">
                You can also skip this step
              </Text>
            )}
          </Box>
        </VStack>
      </MotionBox>
    </Flex>
  )
}

export default ReferralStep
