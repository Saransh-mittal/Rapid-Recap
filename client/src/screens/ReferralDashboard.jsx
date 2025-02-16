import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  useToast,
  VStack,
  HStack,
  useClipboard,
  Flex,
  IconButton,
  Badge,
  Divider,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Share2, Copy, Users, Gift, Crown, Sparkles } from 'lucide-react'
import { BsWhatsapp, BsInstagram, BsTwitterX } from 'react-icons/bs'
import axios from 'axios'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const ReferralDashboard = () => {
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useSelector(state => state.auth)
  const toast = useToast()
  const { onCopy, hasCopied } = useClipboard(referralLink)

  const fetchReferralData = useCallback(async () => {
    try {
      const [codeResponse, statsResponse] = await Promise.all([
        axios.get('/api/user/referral-code'),
        axios.get('/api/user/referral-stats'),
      ])

      setReferralCode(codeResponse.data.referralCode)
      setReferralLink(codeResponse.data.referralLink)
      setStats(statsResponse.data)
    } catch (error) {
      toast({
        title: 'Error fetching referral data',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchReferralData()
  }, [fetchReferralData])

  const handleShare = async (platform = 'default') => {
    const message =
      'Join me on Rapid Recap - the best way to stay informed and grow smarter! Use my referral code:'

    const shareData = {
      title: 'Join Rapid Recap',
      text: `${message} ${referralCode}`,
      url: referralLink,
    }

    switch (platform) {
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${message} ${referralLink}`,
          )}`,
        )
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `${message} ${referralLink}`,
          )}`,
        )
        break
      case 'instagram':
        // Since Instagram doesn't have a direct share API, copy to clipboard
        await navigator.clipboard.writeText(`${message} ${referralLink}`)
        toast({
          title: 'Link copied!',
          description: 'Share this on Instagram',
          status: 'success',
          duration: 3000,
        })
        break
      default:
        if (navigator.share) {
          try {
            await navigator.share(shareData)
          } catch (err) {
            if (err.name !== 'AbortError') {
              onCopy()
            }
          }
        } else {
          onCopy()
        }
    }
  }
  // Add this constant at the top with other constants
  const FEATURES = [
    'Earn Rewards',
    'Build Knowledge',
    'Get Score Boosts',
    'Join Tournaments',
  ]
  if (!isAuthenticated) {
    return (
      <Container maxW="md" py={20}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
        >
          <VStack spacing={6}>
            <MotionFlex
              justify="center"
              rounded="full"
              w="80px"
              h="80px"
              bg="purple.50"
              mb={4}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              <Users size={40} color="#805AD5" style={{ margin: 'auto' }} />
            </MotionFlex>

            <Heading
              size="lg"
              bgGradient="linear(to-r, purple.400, pink.400)"
              bgClip="text"
              mb={2}
            >
              Join Our Community
            </Heading>

            <Text color="gray.600" maxW="md" fontSize="lg">
              Sign in to access your referral code and start earning rewards by
              inviting friends!
            </Text>

            <MotionBox
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="lg"
                colorScheme="purple"
                leftIcon={<Crown size={20} />}
                onClick={() => (window.location.hash = 'signin')}
                mt={4}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
              >
                Sign In to Get Started
              </Button>
            </MotionBox>

            <MotionFlex
              mt={8}
              p={6}
              bg="purple.50"
              rounded="xl"
              direction="column"
              align="center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Text fontWeight="bold" color="purple.700" mb={3}>
                Why Join Rapid Recap?
              </Text>
              <HStack spacing={6} wrap="wrap" justify="center">
                {FEATURES.map((feature, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    textAlign="center"
                  >
                    <Text color="purple.600" fontSize="sm">
                      {feature}
                    </Text>
                  </MotionBox>
                ))}
              </HStack>
            </MotionFlex>
          </VStack>
        </MotionBox>
      </Container>
    )
  }

  return (
    <Container maxW="md" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Box textAlign="center">
            <Heading
              size="lg"
              mb={2}
              bgGradient="linear(to-r, purple.400, pink.400)"
              bgClip="text"
            >
              Invite Friends
            </Heading>
            <Text color="gray.600">Share the knowledge, earn rewards!</Text>
          </Box>

          {/* Referral Stats */}
          <MotionFlex
            justify="space-between"
            p={6}
            bg="purple.50"
            rounded="xl"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <VStack align="flex-start">
              <HStack>
                <Users size={20} color="#805AD5" />
                <Text fontWeight="bold" color="purple.700">
                  Total Referrals
                </Text>
              </HStack>
              <Heading size="xl" color="purple.600">
                {stats?.referralCount || 0}
              </Heading>
            </VStack>
            <Sparkles size={40} color="#805AD5" />
          </MotionFlex>

          {/* Referral Code Section */}
          <Box>
            <Text mb={2} fontWeight="medium" color="gray.700">
              Your Referral Code
            </Text>
            <InputGroup size="lg">
              <Input
                value={referralCode}
                isReadOnly
                bg="white"
                border="2px"
                borderColor="purple.200"
                _hover={{ borderColor: 'purple.300' }}
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  icon={<Copy size={18} />}
                  onClick={onCopy}
                  colorScheme="purple"
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
          </Box>

          {/* Share Buttons */}
          <VStack spacing={4}>
            <Button
              leftIcon={<Share2 size={20} />}
              colorScheme="purple"
              w="100%"
              onClick={() => handleShare()}
            >
              Share Referral Link
            </Button>

            <HStack spacing={4} justify="center" w="100%">
              <IconButton
                icon={<BsWhatsapp size={22} />}
                colorScheme="green"
                variant="outline"
                rounded="full"
                onClick={() => handleShare('whatsapp')}
                _hover={{
                  transform: 'scale(1.05)',
                  bg: 'green.100',
                }}
              />
              <IconButton
                icon={<BsInstagram size={22} />}
                colorScheme="pink"
                variant="outline"
                rounded="full"
                onClick={() => handleShare('instagram')}
                _hover={{
                  transform: 'scale(1.05)',
                  bg: 'pink.100',
                }}
              />
              <IconButton
                icon={<BsTwitterX size={22} />}
                colorScheme="white"
                variant="outline"
                rounded="full"
                onClick={() => handleShare('twitter')}
                _hover={{
                  transform: 'scale(1.05)',
                  bg: 'whiteAlpha.400',
                }}
              />
            </HStack>
          </VStack>

          {/* Rewards Section */}
          <Box>
            <HStack mb={4}>
              <Gift size={20} color="#805AD5" />
              <Heading size="md" color="gray.700">
                Referral Rewards
              </Heading>
            </HStack>

            <VStack spacing={4} align="stretch">
              {REWARD_TIERS.map((tier, index) => (
                <MotionFlex
                  key={index}
                  p={4}
                  bg="white"
                  border="1px"
                  borderColor="purple.100"
                  rounded="lg"
                  justify="space-between"
                  align="center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <HStack>
                    <Crown size={20} color={tier.iconColor} />
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="bold" color="gray.700">
                        {tier.count} Referrals
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {tier.reward}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge
                    colorScheme={
                      stats?.referralCount >= tier.count ? 'green' : 'gray'
                    }
                  >
                    {stats?.referralCount >= tier.count ? 'Unlocked' : 'Locked'}
                  </Badge>
                </MotionFlex>
              ))}
            </VStack>
          </Box>
        </VStack>
      </MotionBox>
    </Container>
  )
}

const REWARD_TIERS = [
  {
    count: 3,
    reward: '100 XP + 1.5x Score Boost (1 day)',
    iconColor: '#4299E1',
  },
  {
    count: 5,
    reward: '500 XP + Influencer Badge',
    iconColor: '#805AD5',
  },
  {
    count: 10,
    reward: '1000 XP + Community Builder Badge',
    iconColor: '#D69E2E',
  },
]

export default ReferralDashboard
