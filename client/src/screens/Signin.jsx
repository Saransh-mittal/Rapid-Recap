import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
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
  Link,
} from '@chakra-ui/react'
import {
  Brain,
  Eye,
  EyeOff,
  MessageSquareQuote,
  KeyRound,
  TrendingUp,
  UserPlus,
  Mail,
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
import throttle from 'lodash.throttle'

// Lazy loaded components
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
  const toast = useToast()
  const dispatch = useDispatch()
  const emailRef = useRef()
  const { forgotPassword, verifyEmail } = useSelector(state => state.auth)

  // States
  const [data, setData] = useState({
    emailOrInGameName: '',
    password: '',
    showPassword: false,
    credentialResponse: null,
  })
  const [enterInGameName, setEnterInGameName] = useState(false)
  const [inGameName, setInGameName] = useState('')
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

  // Google Login Response Handler
  const handleGoogleResponse = async response => {
    if (response.status === 201) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('role', response.data.user.role)
      dispatch(setIsSigninOpen(false))
      dispatch(setUser(response.data.user))
      dispatch(verifyAdminStatus())
      dailyStreakCheckerAndUpdater(dispatch)
      toast({
        title: 'Login Successful',
        description: 'Welcome to Rapid Recap!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  // In-game name submission handler
  const handleInGameNameSubmit = async () => {
    try {
      setLoad({ submitLoad: true, forgotLoad: false })
      const response = await axios.post('/api/user/handleGoogleLogin', {
        credentialResponse: data.credentialResponse,
        inGameName,
      })
      handleGoogleResponse(response)
    } catch (error) {
      console.error(error.response?.data?.error)
      toast({
        title: 'Login Failed',
        description: error.response?.data?.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad({ submitLoad: false, forgotLoad: false })
    }
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
        email: data.emailOrInGameName,
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

  const handleForgotPasswordThrottled = useCallback(
    throttle(handleForgotPassword, 1000),
    [data.emailOrInGameName],
  )

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

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
            <Text fontSize="sm" color="whiteAlpha.600" fontStyle="italic">
              "Stay ahead of everyone"
            </Text>
          </VStack>
        </ModalHeader>

        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <VStack spacing={6}>
            {enterInGameName ? (
              <>
                <InputGroup>
                  <InputLeftElement>
                    <Box as={MessageSquareQuote} color="pink.400" size={18} />
                  </InputLeftElement>
                  <Input
                    name="inGameName"
                    placeholder="Enter your in-game name"
                    value={inGameName}
                    onChange={e => setInGameName(e.target.value)}
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
                <Button
                  w="full"
                  size="lg"
                  onClick={handleInGameNameSubmit}
                  isLoading={load.submitLoad}
                  loadingText="Setting up your account..."
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
                  Complete Setup
                </Button>
              </>
            ) : (
              <>
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
                      value={data.emailOrInGameName}
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
                  <Link
                    href="/#register"
                    onClick={() => {
                      onClose()
                      dispatch(setIsRegisterOpen(true))
                    }}
                  >
                    <Button
                      variant="ghost"
                      color="pink.400"
                      size="sm"
                      leftIcon={<UserPlus size={14} />}
                      _hover={{ bg: 'whiteAlpha.100' }}
                    >
                      Register
                    </Button>
                  </Link>
                </Flex>

                <Divider borderColor="whiteAlpha.200" />

                <Button
                  position="relative"
                  leftIcon={<Mail size={18} />}
                  w="full"
                  variant="outline"
                  borderColor="pink.500"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.100' }}
                >
                  Continue with Google
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    opacity={0}
                  >
                    <GoogleOAuthProvider clientId="492859619634-m81f6tnro73fg6sflkuj0nemm1g6aecb.apps.googleusercontent.com">
                      <GoogleLogin
                        onSuccess={async credentialResponse => {
                          setData(prevData => ({
                            ...prevData,
                            credentialResponse,
                          }))
                          dispatch(setLoginCheckStatus('pending'))
                          try {
                            const response = await axios.post(
                              '/api/user/handleGoogleLogin',
                              { credentialResponse },
                            )
                            if (response.data.EnterInGameName) {
                              toast({
                                title: 'One More Step',
                                description: 'Please enter your in-game name',
                                status: 'info',
                                duration: 5000,
                                isClosable: true,
                                position: 'top',
                              })
                              setEnterInGameName(true)
                            } else {
                              handleGoogleResponse(response)
                            }
                          } catch (error) {
                            console.error(error.response?.data?.error)
                            if (error.response?.data?.EnterInGameName)
                              setEnterInGameName(true)
                            toast({
                              title: 'Login Failed',
                              description: error.response?.data?.error,
                              status: 'error',
                              duration: 5000,
                              isClosable: true,
                              position: 'top',
                            })
                          } finally {
                            dispatch(setLoginCheckStatus('fulfilled'))
                          }
                        }}
                        onError={() => {
                          console.log('Login Failed')
                          toast({
                            title: 'Login Failed',
                            description: 'Google sign-in was unsuccessful',
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                            position: 'top',
                          })
                        }}
                      />
                    </GoogleOAuthProvider>
                  </Box>
                </Button>
              </>
            )}
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
