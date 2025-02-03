import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  Box,
  useToast,
  Progress,
} from '@chakra-ui/react'
import { Brain, CheckCircle2, MailCheck } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setVerifyEmail } from '../../redux/authSlice'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import throttle from 'lodash.throttle'
import { keyframes } from '@emotion/react'

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

const EmailVerify = ({ email, isOpen, onClose }) => {
  const { t } = useTranslation('EmailVerify')
  const toast = useToast()
  const dispatch = useDispatch()
  const { forgotPassword } = useSelector(state => state.auth)

  const [load, setLoad] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [otp, setOtp] = useState({
    i1: '',
    i2: '',
    i3: '',
    i4: '',
    i5: '',
    i6: '',
  })

  const refs = {
    i1: useRef(null),
    i2: useRef(null),
    i3: useRef(null),
    i4: useRef(null),
    i5: useRef(null),
    i6: useRef(null),
  }

  // Calculate progress based on OTP digits filled
  const calculateProgress = () => {
    const filledDigits = Object.values(otp).filter(value => value !== '').length
    return (filledDigits / 6) * 100
  }

  const handleChange = e => {
    const { name, value } = e.target
    if (value === '+' || (otp[name] !== '' && value !== '')) {
      return
    }
    if (/^\d*$/.test(value)) {
      setOtp({ ...otp, [name]: value })
      if (value !== '' && /^[0-9]$/.test(value)) {
        const nextInput =
          name === 'i6' ? null : refs[`i${parseInt(name[1], 10) + 1}`]
        nextInput?.current?.focus()
      }
    }
  }

  const showEmail = () => {
    const i = email.indexOf('@')
    return (
      email.slice(0, 2) + email.slice(2, i).replace(/./g, '*') + email.slice(i)
    )
  }

  const submitOTP = async () => {
    const otpValue = Object.values(otp).join('')
    setLoad(true)

    try {
      const response = await axios.post(
        `/api/user/verifyEmail?forgotPassword=${forgotPassword}`,
        { otp: otpValue, email },
      )

      if (response.status === 201) {
        toast({
          title: forgotPassword
            ? t('toastResetSuccess')
            : 'Email Verified Successfully!',
          description: forgotPassword
            ? undefined
            : 'You can now log in to your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        onClose()
        dispatch(setVerifyEmail(true))
      }
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error?.response?.data?.error || 'Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad(false)
    }
  }

  const resendOTP = async () => {
    setLoad(true)
    try {
      const response = await axios.post('/api/user/resendOTP', { email })
      if (response.status === 201) {
        setTimeLeft(60)
        toast({
          title: 'OTP Sent Successfully',
          description: 'Please check your email for the new code.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      toast({
        title: 'Failed to Send OTP',
        description: error.response?.data?.error || 'Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad(false)
    }
  }

  const handlePaste = e => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6)
    if (/^\d*$/.test(pastedData)) {
      setOtp({
        i1: pastedData[0] || '',
        i2: pastedData[1] || '',
        i3: pastedData[2] || '',
        i4: pastedData[3] || '',
        i5: pastedData[4] || '',
        i6: pastedData[5] || '',
      })
    }
  }

  const handleKeyDown = e => {
    const { name, value } = e.target
    if (e.code === 'Backspace' && value === '') {
      const prevInput =
        name === 'i1' ? null : refs[`i${parseInt(name[1], 10) - 1}`]
      prevInput?.current?.focus()
    } else if (e.key === 'Enter') {
      submitOTPThrottled()
    }
  }

  const submitOTPThrottled = useCallback(throttle(submitOTP, 1000), [otp])

  useEffect(() => {
    let timer
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    }
    return () => {
      clearInterval(timer)
      submitOTPThrottled.cancel()
    }
  }, [timeLeft, submitOTPThrottled])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'md' }}
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
                Verify Email
              </Text>
            </HStack>
            <Box as={MailCheck} size="48px" color="pink.400" />
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

            <VStack spacing={2}>
              <Text color="whiteAlpha.900" textAlign="center">
                We've sent a verification code to:
              </Text>
              <Text color="pink.400" fontWeight="bold" fontSize="lg">
                {showEmail()}
              </Text>
              <Text color="whiteAlpha.600" fontSize="sm">
                Enter the 6-digit code below
              </Text>
            </VStack>

            <HStack spacing={2} justify="center">
              {Object.keys(otp).map((key, index) => (
                <Input
                  key={index}
                  ref={refs[key]}
                  name={key}
                  value={otp[key]}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  type="number"
                  maxLength={1}
                  w={12}
                  h={12}
                  textAlign="center"
                  fontSize="xl"
                  p={0}
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ borderColor: 'pink.400' }}
                  _focus={{
                    borderColor: 'pink.500',
                    boxShadow: '0 0 0 1px #FF0080',
                  }}
                />
              ))}
            </HStack>

            <Button
              w="full"
              size="lg"
              onClick={submitOTPThrottled}
              isLoading={load}
              loadingText="Verifying..."
              leftIcon={<CheckCircle2 size={18} />}
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
              Verify Email
            </Button>

            <VStack spacing={1}>
              <Text color="whiteAlpha.600" fontSize="sm">
                Didn't receive the code?
              </Text>
              <Button
                variant="ghost"
                size="sm"
                color="pink.400"
                isDisabled={timeLeft > 0}
                onClick={resendOTP}
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend code'}
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default EmailVerify
