import { useState, useRef, useEffect, useCallback } from 'react'
import './EmailVerify.css'
import axios from 'axios'
import { Otptimer } from 'otp-timer-ts'
import Loading from '../miscellaneous/Loading'
import {
  Modal as ChakraModal,
  Box,
  Button,
  HStack,
  Input,
  Text,
  VStack,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import throttle from 'lodash.throttle'
import { useDispatch, useSelector } from 'react-redux'

import useSafeSound from '../../customHooks/useSafeSound'
import { setVerifyEmail } from '../../redux/authSlice'
import { useTranslation } from 'react-i18next'
import { useFeatureDetection } from '../../utils/featureDetection'

const EmailVerify = ({ email, isOpen, onClose }) => {
  const { t } = useTranslation('EmailVerify')
  const toast = useToast()
  const dispatch = useDispatch()
  const { forgotPassword, user } = useSelector(state => state.auth)
  const [load, setLoad] = useState(false) //for loading spinner
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
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

  const handleChange = e => {
    const { name, value } = e.target
    if (value === '+') {
      return
    }
    if (otp[name] !== '' && value !== '') {
      return
    }
    if (/^\d*$/.test(value)) {
      // Update the state if it's a whole number
      setOtp({ ...otp, [name]: value })
      if (value !== '' && /^[0-9]$/.test(value)) {
        const nextInput =
          name === 'i6' ? null : refs[`i${parseInt(name[1], 10) + 1}`]
        nextInput && nextInput.current.focus()
      }
    }
  }

  const submitOTP = async e => {
    const otpValue = `${otp.i1}${otp.i2}${otp.i3}${otp.i4}${otp.i5}${otp.i6}`
    const data = { otp: otpValue, email: email }
    setLoad(true)
    try {
      const response = await axios.post(
        `/api/user/verifyEmail?forgotPassword=${forgotPassword}`,
        data,
      )

      if (response.status === 201) {
        if (forgotPassword) {
          toast({
            title: t('toastResetSuccess'),
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'top',
          })
        } else {
          toast({
            title: 'Email Verified now you can login',
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'top',
          })
        }
        onClose()
        dispatch(setVerifyEmail(true))
      } else {
        throw new Error(t('toastVerifyFailed'))
      }
      return
    } catch (error) {
      toast({
        title: t('toastVerifyFailed'),
        description: error?.response?.data?.error,
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
      console.log(error)
    } finally {
      setLoad(false)
    }
  }

  const showEmail = () => {
    let i = email.indexOf('@')

    const starredEmail =
      email.slice(0, 2) + email.slice(2, i).replace(/./g, '*') + email.slice(i)
    return starredEmail
  }

  const resendOTP = async e => {
    setLoad(true)
    try {
      const response = await axios.post(`/api/user/resendOTP`, {
        email: email,
      })
      if (response.status === 201) {
        toast({
          title: t('toastOTPSent'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      toast({
        title: t('toastOTPFail'),
        description: error.response.data.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })

      console.log(error.response.data.error)
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
    const isBackspace = e.code === 'Backspace'
    if (isBackspace) {
      // If backspace is pressed and the current input is empty, move focus to the previous input
      if (value === '') {
        const prevInput =
          name === 'i1' ? null : refs[`i${parseInt(name[1], 10) - 1}`]
        prevInput && prevInput.current.focus()
      }
    } else if (e.key === 'Enter') {
      submitOTPThrottled()
    }
  }

  const submitOTPThrottled = useCallback(throttle(submitOTP, 1000), [otp])

  useEffect(() => {
    return () => submitOTPThrottled.cancel()
  }, [submitOTPThrottled])

  return (
    <ChakraModal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        sx={{
          borderRadius: 'xl',
          backgroundColor: '#0f0d15',
          backgroundImage:
            'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
          padding: '20px',
        }}
      >
        <ModalCloseButton color={'white'} />
        <ModalBody>
          <VStack spacing={4} align="stretch" color={'white'}>
            <Text fontSize="2xl" fontWeight="bold" textAlign="center">
              {t('heading')}
            </Text>
            <Text textAlign="center">
              {t('otpSent')}
              {showEmail()}
            </Text>
            <Text textAlign="center">{t('enterOTP')}</Text>
            <HStack justifyContent="center">
              {Object.keys(otp).map((key, index) => (
                <Input
                  key={index}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  name={key}
                  value={otp[key]}
                  type="number"
                  maxLength={1}
                  ref={refs[key]}
                  onKeyDown={handleKeyDown}
                  width="40px"
                  height="40px"
                  textAlign="center"
                  p={0}
                />
              ))}
            </HStack>
            <Button
              onClick={() => {
                playClick()
                submitOTPThrottled()
              }}
              isLoading={load}
              loadingText={t('verifying')}
              colorScheme="blue"
            >
              {t('verifyButton')}
            </Button>
            <Text textAlign="center">{t('didntReceiveCode')}</Text>
            <Box textAlign="center">
              <Otptimer
                buttonText={t('resendOTP')}
                buttonContainerClass="btn btn-danger"
                minutes={0}
                seconds={60}
                onResend={resendOTP}
                textStyle={{ color: 'white' }}
                timerStyle={{ color: 'white' }}
              />
            </Box>
            {load && <Loading />}
          </VStack>
        </ModalBody>
      </ModalContent>
    </ChakraModal>
  )
}

export default EmailVerify
