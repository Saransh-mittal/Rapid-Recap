import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  VStack,
  Text,
  Flex,
  Box,
  Progress,
  IconButton,
  useToast,
  Spinner,
  useDisclosure,
  Badge,
  Divider,
  HStack,
} from '@chakra-ui/react'
import {
  Newspaper,
  Eye,
  EyeOff,
  Mail,
  MessageSquareQuote,
  Award,
  TrendingUp,
  KeyRound,
  UserPlus,
  Brain,
} from 'lucide-react'
import {
  setForgotPassword,
  setLoginCheckStatus,
  setUser,
  verifyAdminStatus,
} from '../redux/authSlice'
import { setIsRegisterOpen, setIsSigninOpen } from '../redux/appSlice'
import { dailyStreakCheckerAndUpdater } from '../utils/quiz.utils'
import { keyframes } from '@emotion/react'

// Lazy loaded components
const GuestLogin = lazy(() => import('../components/authComponents/GuestLogin'))
const ResetPassword = lazy(() =>
  import('../components/authComponents/ResetPassword'),
)
const EmailVerify = lazy(() =>
  import('../components/authComponents/EmailVerify'),
)

// Animation keyframes
const glowAnimation = keyframes`
  0% { text-shadow: 0 0 5px #FF0080; }
  50% { text-shadow: 0 0 20px #FF0080, 0 0 30px #FF0080; }
  100% { text-shadow: 0 0 5px #FF0080; }
`

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

export default function Signin({ isOpen, onClose, hamburgerOnClose }) {
  const { t } = useTranslation('Signin')
  const { t: guestLoginT } = useTranslation('GuestLogin')
  const toast = useToast()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const emailRef = useRef()
  const { forgotPassword, verifyEmail } = useSelector(state => state.auth)

  // States
  const [data, setData] = useState({
    emailOrInGameName: '',
    password: '',
    showPassword: false,
    credentialResponse: null,
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [load, setLoad] = useState({
    submitLoad: false,
    forgotLoad: false,
  })

  // Modal controls
  const {
    isOpen: isEmailVerifyOpen,
    onOpen: onEmailVerifyOpen,
    onClose: onEmailVerifyClose,
  } = useDisclosure()

  const {
    isOpen: isResetPasswordOpen,
    onOpen: onResetPasswordOpen,
    onClose: onResetPasswordClose,
  } = useDisclosure()

  // Get reporter rank based on level
  const getRank = level => {
    if (level === 0) return 'News Scout'
    if (level === 1) return 'Breaking News Reporter'
    if (level === 2) return 'Rapid Analyst'
    if (level === 3) return 'Story Hunter'
    if (level === 4) return 'News Maven'
    return 'Recap Master'
  }

  // Calculate progress
  const calculateProgress = () => {
    let progress = 0
    if (data.emailOrInGameName) progress += 50
    if (data.password) progress += 50
    return progress
  }

  // Input handler
  const handleInput = e => {
    const { name, value } = e.target
    console.log('Input Changed:', name, value)
    setData(prev => ({ ...prev, [name]: value }))
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
    const progress = calculateProgress()
    setCurrentLevel(Math.floor(progress / 20))
  }

  // Submit handler
  const handleSubmit = async e => {
    e?.preventDefault()
    setIsAnimating(true)
    dispatch(setLoginCheckStatus('pending'))

    try {
      setLoad({ submitLoad: true, forgotLoad: false })
      const response = await axios.post('/api/user/login', { data })

      if (!response.data.user.verified) {
        const otpResponse = await axios.post('/api/user/resendOTP', {
          email: response.data.user.email,
        })

        if (otpResponse.status === 201) {
          onEmailVerifyOpen()
          toast({
            title: 'Verification Required',
            description: 'Check your inbox to verify your credentials.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      } else if (response.status === 201 && response.data.user.verified) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('role', response.data.user.role)
        dispatch(setIsSigninOpen(false))
        dispatch(setUser(response.data.user))
        dispatch(verifyAdminStatus())
        dailyStreakCheckerAndUpdater(dispatch)

        toast({
          title: 'Access Granted!',
          description: 'Welcome to Rapid Recap.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })

        location.pathname === '/' && navigate('/home/all')
      }
    } catch (error) {
      toast({
        title: 'Access Denied',
        description: error.response?.data?.error || 'Invalid credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error)
    } finally {
      dispatch(setLoginCheckStatus('fulfilled'))
      setLoad({ submitLoad: false, forgotLoad: false })
      setIsAnimating(false)
    }
  }

  // Password reset handler
  const handleForgotPassword = async () => {
    // Check the current state value before proceeding
    if (!data.emailOrInGameName) {
      emailRef.current?.focus()
      toast({
        title: 'Error',
        description: 'Please enter your email/username.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    try {
      setLoad({ submitLoad: false, forgotLoad: true })
      const response = await axios.post('/api/user/resendOTP', {
        email: data.emailOrInGameName, // Ensure the correct state is passed here
      })

      if (response.status === 201) {
        const starredEmail = data.emailOrInGameName.replace(
          /(?<=.{2}).(?=.*@)/g,
          '*',
        )
        dispatch(setForgotPassword(true))
        onEmailVerifyOpen()
        toast({
          title: 'Recovery Email Sent',
          description: `Check ${starredEmail}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      emailRef.current?.focus()
      toast({
        title: 'Recovery Failed',
        description: error.response?.data?.error || 'Please verify your email.',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad({ submitLoad: false, forgotLoad: false })
    }
  }

  // Throttled password reset
  const handleForgotPasswordThrottled = useCallback(
    useCallback(handleForgotPassword, 1000),
    [data.emailOrInGameName],
  )

  // Key press handler
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  // Effects
  useEffect(() => {
    document.title = 'Rapid Recap - Sign In'
  }, [])

  useEffect(() => {
    if (
      !isEmailVerifyOpen &&
      forgotPassword &&
      verifyEmail &&
      !isResetPasswordOpen
    ) {
      onResetPasswordOpen()
    }
  }, [isEmailVerifyOpen, forgotPassword, verifyEmail, isResetPasswordOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl' }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent
        bg="#0f0d15"
        backgroundImage="linear-gradient(to bottom, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        boxShadow="0 0 20px rgba(255, 0, 128, 0.2)"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="4px"
          bgGradient="linear(to-r, pink.500, purple.500)"
        />

        <ModalHeader pt={8}>
          <VStack spacing={4}>
            <HStack spacing={2}>
              <Box
                as={Brain}
                size="30px"
                color="pink.400"
                animation={`${floatAnimation} 3s infinite`}
              />
              <Text
                fontSize="3xl"
                fontWeight="bold"
                bgGradient="linear(to-r, pink.400, purple.400)"
                bgClip="text"
                animation={`${glowAnimation} 2s infinite`}
              >
                Rapid Recap
              </Text>
            </HStack>

            {/* <Badge
              colorScheme="pink"
              variant="solid"
              px={3}
              py={1}
              borderRadius="full"
            >
              {getRank(currentLevel)}
            </Badge> */}

            <Text fontSize="sm" color="whiteAlpha.600" fontStyle="italic">
              "Stay ahead of everyone"
            </Text>
          </VStack>
        </ModalHeader>

        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <VStack spacing={6}>
            <Box w="full">
              <Progress
                value={calculateProgress()}
                size="sm"
                colorScheme="pink"
                hasStripe
                isAnimated
                borderRadius="full"
              />
            </Box>

            <VStack w="full" spacing={4}>
              <InputGroup>
                <InputLeftElement>
                  <Box as={MessageSquareQuote} color="pink.400" size={18} />
                </InputLeftElement>
                <Input
                  name="emailOrInGameName"
                  placeholder="Email/Username"
                  value={data.emailOrInGameName} // Correct binding
                  onChange={handleInput}
                  onKeyPress={handleKeyPress}
                  ref={emailRef}
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ borderColor: 'pink.400' }}
                  _focus={{
                    borderColor: 'pink.500',
                    boxShadow: '0 0 0 1px #FF0080',
                  }}
                  _placeholder={{ color: 'whiteAlpha.400' }}
                />
              </InputGroup>

              <InputGroup>
                <InputLeftElement>
                  <Box as={KeyRound} color="pink.400" size={18} />
                </InputLeftElement>
                <Input
                  name="password"
                  type={data.showPassword ? 'text' : 'password'}
                  placeholder="Access Code"
                  value={data.password}
                  onChange={handleInput}
                  onKeyPress={handleKeyPress}
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ borderColor: 'pink.400' }}
                  _focus={{
                    borderColor: 'pink.500',
                    boxShadow: '0 0 0 1px #FF0080',
                  }}
                  _placeholder={{ color: 'whiteAlpha.400' }}
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    color="pink.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    icon={
                      data.showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )
                    }
                    onClick={() =>
                      setData(prev => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                  />
                </InputRightElement>
              </InputGroup>
            </VStack>

            <Button
              w="full"
              size="lg"
              onClick={handleSubmit}
              isLoading={load.submitLoad}
              loadingText="Accessing Rapid Recap..."
              leftIcon={<TrendingUp size={18} />}
              bgGradient="linear(to-r, pink.500, purple.500)"
              color="white"
              _hover={{
                bgGradient: 'linear(to-r, pink.600, purple.600)',
                transform: 'translateY(-2px)',
              }}
              _active={{
                bgGradient: 'linear(to-r, pink.700, purple.700)',
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              Enter Rapid Recap
            </Button>

            <Flex w="full" justify="space-between">
              <Button
                variant="ghost"
                color="pink.400"
                size="sm"
                onClick={handleForgotPasswordThrottled}
                isLoading={load.forgotLoad}
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                Forgot Password?
              </Button>
              <Button
                variant="ghost"
                color="pink.400"
                size="sm"
                onClick={() => {
                  dispatch(setIsRegisterOpen(true))
                  onClose()
                }}
                leftIcon={<UserPlus size={14} />}
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                Register
              </Button>
            </Flex>

            <Divider borderColor="whiteAlpha.200" />

            <Button
              leftIcon={<Mail size={18} />}
              w="full"
              variant="outline"
              borderColor="pink.500"
              color="white"
              _hover={{ bg: 'whiteAlpha.100' }}
            >
              Continue with Google
            </Button>

            <Suspense fallback={<Spinner color="pink.400" />}>
              <GuestLogin t={guestLoginT} hamburgerOnClose={hamburgerOnClose} />
            </Suspense>
          </VStack>
        </ModalBody>
      </ModalContent>

      <Suspense
        fallback={
          <Flex justify="center" align="center" h="100vh">
            <Spinner
              color="pink.400"
              size="xl"
              thickness="4px"
              speed="0.65s"
              emptyColor="whiteAlpha.200"
            />
          </Flex>
        }
      >
        {isResetPasswordOpen && forgotPassword && (
          <ResetPassword
            email={data.emailOrInGameName}
            onClose={() => {
              onResetPasswordClose()
              dispatch(setForgotPassword(false))
            }}
            isOpen={isResetPasswordOpen}
            theme={{
              bg: '#0f0d15',
              gradient: 'linear(to-r, pink.500, purple.500)',
              color: 'white',
              borderColor: 'whiteAlpha.100',
            }}
          />
        )}
      </Suspense>

      <Suspense
        fallback={
          <Flex justify="center" align="center" h="100vh">
            <Spinner
              color="pink.400"
              size="xl"
              thickness="4px"
              speed="0.65s"
              emptyColor="whiteAlpha.200"
            />
          </Flex>
        }
      >
        <EmailVerify
          email={data.emailOrInGameName}
          onClose={onEmailVerifyClose}
          isOpen={isEmailVerifyOpen}
          theme={{
            bg: '#0f0d15',
            gradient: 'linear(to-r, pink.500, purple.500)',
            color: 'white',
            borderColor: 'whiteAlpha.100',
          }}
        />
      </Suspense>
    </Modal>
  )
}
