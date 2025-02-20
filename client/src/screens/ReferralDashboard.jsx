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
  Input,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
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

  const FEATURES = [
    'Earn Rewards',
    'Build Knowledge',
    'Get Score Boosts',
    'Join Tournaments',
  ]

  if (!isAuthenticated) {
    return (
      <Container maxW="md" py={20} minH="100vh" bg="gray.900">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
        >
          <VStack spacing={8}>
            <MotionFlex
              justify="center"
              rounded="full"
              w="100px"
              h="100px"
              bg="purple.900"
              boxShadow="0 0 20px rgba(128, 90, 213, 0.4)"
              mb={4}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              <Users size={50} color="#E9D8FD" style={{ margin: 'auto' }} />
            </MotionFlex>

            <Heading
              size="2xl"
              bgGradient="linear(to-r, purple.300, pink.200)"
              bgClip="text"
              mb={2}
              fontWeight="extrabold"
            >
              Join Our Community
            </Heading>

            <Text color="whiteAlpha.900" maxW="md" fontSize="xl">
              Sign in to access your referral code and start earning rewards!
            </Text>

            <Button
              size="lg"
              colorScheme="purple"
              leftIcon={<Crown size={24} />}
              onClick={() => (window.location.hash = 'signin')}
              mt={4}
              px={8}
              py={6}
              fontSize="lg"
              bgGradient="linear(to-r, purple.500, pink.500)"
              _hover={{
                bgGradient: 'linear(to-r, purple.600, pink.600)',
                transform: 'translateY(-2px)',
                boxShadow: 'xl',
              }}
              transition="all 0.2s"
            >
              Sign In to Get Started
            </Button>

            <Box
              mt={12}
              p={8}
              bg="whiteAlpha.100"
              rounded="2xl"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <Text fontWeight="bold" color="purple.200" mb={6} fontSize="xl">
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
                    bg="whiteAlpha.200"
                    p={4}
                    rounded="xl"
                    minW="150px"
                  >
                    <Text color="purple.100" fontSize="md" fontWeight="medium">
                      {feature}
                    </Text>
                  </MotionBox>
                ))}
              </HStack>
            </Box>
          </VStack>
        </MotionBox>
      </Container>
    )
  }

  return (
    <Container maxW="md" p={4} pt="140px" bg="gray.900" minH="100vh">
      <VStack spacing={6} align="stretch" p={4}>
        {/* Header */}
        <Box
          position="relative"
          top={0}
          left={0}
          right={0}
          h="5px"
          // bg="rgba(26, 32, 44, 0.95)"
          backdropFilter="blur(10px)"
          borderBottom="1px solid"
          // borderColor="black"
          zIndex={10}
          px={4}
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          pb={4}
        >
          <Heading
            size="lg"
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
            textAlign="center"
            mb={1}
          >
            Invite Friends
          </Heading>
          <Text color="whiteAlpha.800" fontSize="sm" textAlign="center">
            Share the knowledge, earn rewards!
          </Text>
        </Box>

        {/* Referral Stats */}
        <MotionFlex
          justify="space-between"
          p={4}
          bg="whiteAlpha.100"
          rounded="xl"
          initial={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <HStack spacing={3}>
            <Users size={18} color="#E9D8FD" />
            <VStack align="flex-start" spacing={0}>
              <Text color="whiteAlpha.900" fontSize="sm">
                Total Referrals
              </Text>
              <Heading size="2xl" color="white">
                {stats?.referralCount || 0}
              </Heading>
            </VStack>
          </HStack>
          <Box>
            <Sparkles size={24} color="#E9D8FD" />
          </Box>
        </MotionFlex>

        {/* Referral Code */}
        <Box>
          <Text mb={2} color="whiteAlpha.800" fontSize="sm">
            Your Referral Code
          </Text>
          <InputGroup size="md">
            <Input
              value={referralCode}
              color="white"
              bg="whiteAlpha.100"
              border="1px"
              borderColor="purple.500"
              _hover={{ borderColor: 'purple.400' }}
              isReadOnly
            />
            <InputRightElement>
              <Tooltip label={hasCopied ? 'Copied!' : 'Copy code'}>
                <IconButton
                  icon={<Copy size={16} />}
                  variant="ghost"
                  colorScheme="purple"
                  size="sm"
                  onClick={onCopy}
                />
              </Tooltip>
            </InputRightElement>
          </InputGroup>
        </Box>

        {/* Share Button */}
        <Button
          leftIcon={<Share2 size={18} />}
          bgGradient="linear(to-r, purple.500, pink.500)"
          _hover={{
            bgGradient: 'linear(to-r, purple.600, pink.600)',
          }}
          onClick={() => handleShare()}
          size="md"
        >
          Share Referral Link
        </Button>

        {/* Social Icons */}
        <HStack justify="center" spacing={4}>
          {[
            { icon: BsWhatsapp, color: '#25D366', platform: 'whatsapp' },
            { icon: BsInstagram, color: '#E4405F', platform: 'instagram' },
            { icon: BsTwitterX, color: '#ffffff', platform: 'twitter' },
          ].map((social, index) => (
            <MotionBox
              key={index}
              initial={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton
                icon={<social.icon size={20} />}
                variant="ghost"
                color={social.color}
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => handleShare(social.platform)}
              />
            </MotionBox>
          ))}
        </HStack>

        {/* Rewards Section */}
        <Box mt={2}>
          <HStack mb={3}>
            <Gift size={18} color="#E9D8FD" />
            <Text color="white" fontWeight="medium">
              Referral Rewards
            </Text>
          </HStack>

          <VStack spacing={3}>
            <AnimatePresence>
              {REWARD_TIERS.map((tier, index) => (
                <MotionFlex
                  key={index}
                  w="100%"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.1 },
                  }}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                  p={3}
                  bg="whiteAlpha.50"
                  rounded="lg"
                  justify="space-between"
                  align="center"
                  border="1px solid"
                  borderColor="yellow"
                  cursor="pointer"
                  transition="all 0.2s"
                >
                  <HStack spacing={3}>
                    <Box
                      p={2}
                      bg="whiteAlpha.100"
                      rounded="lg"
                      color={tier.iconColor}
                    >
                      <Crown size={16} />
                    </Box>
                    <VStack align="flex-start" spacing={0}>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        {tier.count} Referrals
                      </Text>
                      <Text color="whiteAlpha.700" fontSize="xs">
                        {tier.reward}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge
                    variant="subtle"
                    colorScheme={
                      stats?.referralCount >= tier.count ? 'green' : 'gray'
                    }
                    px={2}
                    py={1}
                    rounded="full"
                    fontSize="xs"
                  >
                    {stats?.referralCount >= tier.count ? 'Unlocked' : 'Locked'}
                  </Badge>
                </MotionFlex>
              ))}
            </AnimatePresence>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

const REWARD_TIERS = [
  {
    count: 1,
    reward: '1.5x Score Boost (3 Quizzes)',
    iconColor: '#4299E1',
  },
  {
    count: 3,
    reward: 'Category Boost (3 days)',
    iconColor: '#805AD5',
  },
  {
    count: 5,
    reward: 'Radar + Category Boost (5 days)',
    iconColor: '#D69E2E',
  },
]

export default ReferralDashboard
