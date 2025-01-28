import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react'
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
  HStack,
  Image,
  Divider,
} from '@chakra-ui/react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import {
  Brain,
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  UserPlus,
  User,
  AtSign,
  Camera,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { setIsSigninOpen } from '../redux/appSlice'
import { keyframes } from '@emotion/react'
import { setUser, verifyAdminStatus } from '../redux/authSlice'
import { dailyStreakCheckerAndUpdater } from '../utils/quiz.utils'

// Lazy loaded components
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

export default function Register({ isOpen, onClose }) {
  const { t } = useTranslation('Register')
  const toast = useToast()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { verifyEmail } = useSelector(state => state.auth)

  const [data, setData] = useState({
    name: '',
    inGameName: '',
    email: '',
    password: '',
    cpassword: '',
    pic: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    showPassword: false,
    showCPassword: false,
  })
  const [load, setLoad] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [picDisplay, setPicDisplay] = useState(
    'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
  )
  const [showGoogleInGameName, setShowGoogleInGameName] = useState(false)

  const {
    isOpen: isEmailVerifyOpen,
    onOpen: onEmailVerifyOpen,
    onClose: onEmailVerifyClose,
  } = useDisclosure()

  // Calculate progress
  const calculateProgress = () => {
    let progress = 0
    if (data.name) progress += 20
    if (data.inGameName) progress += 20
    if (data.email) progress += 20
    if (data.password) progress += 20
    if (data.cpassword) progress += 20
    return progress
  }

  const handleInput = e => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async e => {
    setImageLoading(true)
    try {
      const img = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setPicDisplay(reader.result)
        setData(prevData => ({ ...prevData, pic: img }))
      }
      reader.readAsDataURL(img)
    } catch (error) {
      toast({
        title: 'Image upload Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setImageLoading(false)
    }
  }

  const submitImage = async ({ pic }) => {
    try {
      const data = new FormData()
      data.append('file', pic)
      data.append('upload_preset', 'ProfilePics')
      data.append('cloud_name', 'dxstsrnbs')
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dxstsrnbs/image/upload',
        data,
      )
      return response.data.url
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }

  const handleSubmit = async e => {
    e?.preventDefault()
    setLoad(true)
    try {
      const pic = await submitImage(data)
      const response = await axios.post('/api/user/register', { ...data, pic })

      if (response.status === 201) {
        onEmailVerifyOpen()
        toast({
          title: 'Registered Successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad(false)
    }
  }

  const handleGoogleSignup = async (credentialResponse, inGameName = null) => {
    try {
      setLoad(true)
      const response = await axios.post('/api/user/handleGoogleLogin', {
        credentialResponse,
        inGameName,
      })

      if (response.data.EnterInGameName) {
        setShowGoogleInGameName(true)
        setData(prev => ({ ...prev, credentialResponse }))
        toast({
          title: 'One More Step',
          description:
            'Please enter your username/ingamename to complete registration',
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } else {
        // Handle successful registration and login
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('role', response.data.user.role)
        dispatch(setUser(response.data.user))
        dispatch(verifyAdminStatus())
        dailyStreakCheckerAndUpdater(dispatch)

        toast({
          title: 'Welcome to Rapid Recap!',
          description: 'Account created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })

        onClose()
        location.pathname === '/' && navigate('/home/all')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad(false)
    }
  }

  const handleGoogleInGameNameSubmit = async () => {
    if (!data.inGameName.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username to continue',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    await handleGoogleSignup(data.credentialResponse, data.inGameName)
  }

  useEffect(() => {
    if (verifyEmail && isOpen) {
      onClose()
      dispatch(setIsSigninOpen(true))
    }
  }, [verifyEmail, onClose, dispatch])

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
        {/* Header content remains the same */}
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
                Join Rapid Recap
              </Text>
            </HStack>
            <Text fontSize="sm" color="whiteAlpha.600" fontStyle="italic">
              "Your journey begins here"
            </Text>
          </VStack>
        </ModalHeader>

        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <VStack spacing={6}>
            {showGoogleInGameName ? (
              <>
                <InputGroup>
                  <InputLeftElement>
                    <Box as={UserPlus} color="pink.400" size={18} />
                  </InputLeftElement>
                  <Input
                    name="inGameName"
                    placeholder="Choose your username"
                    value={data.inGameName}
                    onChange={e =>
                      setData(prev => ({ ...prev, inGameName: e.target.value }))
                    }
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
                  onClick={handleGoogleInGameNameSubmit}
                  isLoading={load}
                  loadingText="Creating Account..."
                  leftIcon={<UserPlus size={18} />}
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
                  Complete Registration
                </Button>
              </>
            ) : (
              <>
                {/* Regular registration form content */}
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

                <Flex direction="column" align="center" mb="4">
                  {imageLoading ? (
                    <Spinner size="lg" color="pink.400" />
                  ) : (
                    <Box position="relative">
                      <Image
                        src={picDisplay}
                        alt="Profile Picture"
                        w="100px"
                        h="100px"
                        borderRadius="full"
                        border="2px solid"
                        borderColor="pink.400"
                      />
                      <IconButton
                        icon={<Camera size={16} />}
                        size="sm"
                        colorScheme="pink"
                        position="absolute"
                        bottom="0"
                        right="0"
                        borderRadius="full"
                        onClick={() =>
                          document.getElementById('profile-pic').click()
                        }
                      />
                    </Box>
                  )}
                  <Input
                    id="profile-pic"
                    type="file"
                    name="pic"
                    accept="image/*"
                    onChange={handleImageChange}
                    display="none"
                  />
                </Flex>

                <VStack w="full" spacing={4}>
                  <InputGroup>
                    <InputLeftElement>
                      <Box as={User} color="pink.400" size={18} />
                    </InputLeftElement>
                    <Input
                      name="name"
                      placeholder="Full Name"
                      value={data.name}
                      onChange={handleInput}
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
                      <Box as={UserPlus} color="pink.400" size={18} />
                    </InputLeftElement>
                    <Input
                      name="inGameName"
                      placeholder="Username"
                      value={data.inGameName}
                      onChange={handleInput}
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
                      <Box as={AtSign} color="pink.400" size={18} />
                    </InputLeftElement>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={data.email}
                      onChange={handleInput}
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
                      placeholder="Password"
                      value={data.password}
                      onChange={handleInput}
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

                  <InputGroup>
                    <InputLeftElement>
                      <Box as={KeyRound} color="pink.400" size={18} />
                    </InputLeftElement>
                    <Input
                      name="cpassword"
                      type={data.showCPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={data.cpassword}
                      onChange={handleInput}
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
                          data.showCPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )
                        }
                        onClick={() =>
                          setData(prev => ({
                            ...prev,
                            showCPassword: !prev.showCPassword,
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
                  isLoading={load}
                  loadingText="Creating Account..."
                  leftIcon={<UserPlus size={18} />}
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
                  Create Account
                </Button>

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
                  Sign up with Google
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
                        onSuccess={credentialResponse =>
                          handleGoogleSignup(credentialResponse)
                        }
                        onError={() => {
                          toast({
                            title: 'Registration Failed',
                            description: 'Google sign-up was unsuccessful',
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

                <Flex w="full" justify="center">
                  <Button
                    variant="ghost"
                    color="pink.400"
                    size="sm"
                    onClick={() => {
                      onClose()
                      dispatch(setIsSigninOpen(true))
                    }}
                    _hover={{ bg: 'whiteAlpha.100' }}
                  >
                    Already have an account? Sign in
                  </Button>
                </Flex>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>

      {/* Email verification modal */}
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
          email={data.email}
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
