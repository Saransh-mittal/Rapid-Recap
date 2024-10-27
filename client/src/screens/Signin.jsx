import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import throttle from 'lodash.throttle'
import { useDispatch, useSelector } from 'react-redux'
import {
  useToast,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import FillEyeInvisible from '../assets/svg/FillEyeInvisible'
import FillEyeVisible from '../assets/svg/FillEyeVisible'
import {
  setForgotPassword,
  setUser,
  verifyAdminStatus,
} from '../redux/authSlice'

import { dailyStreakCheckerAndUpdater } from '../utils/quiz.utils'

import { setIsRegisterOpen, setIsSigninOpen } from '../redux/appSlice'
const GuestLogin = lazy(() => import('../components/authComponents/GuestLogin'))
import { useTranslation } from 'react-i18next'
import { useFeatureDetection } from '../utils/featureDetection'
import useSafeSound from '../customHooks/useSafeSound'

// const Modal = lazy(() => import('./Modal'))
const ResetPassword = lazy(() =>
  import('../components/authComponents/ResetPassword'),
)
const EmailVerify = lazy(() =>
  import('../components/authComponents/EmailVerify'),
)

export default function Signin({ isOpen, onOpen, onClose, hamburgerOnClose }) {
  const { t } = useTranslation('Signin')
  const { t: GuestLoginTranslate } = useTranslation('GuestLogin')
  const toast = useToast()
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })

  const { forgotPassword, verifyEmail } = useSelector(state => state.auth)
  const dispatchRedux = useDispatch()
  const [data, setData] = useState({
    emailOrInGameName: '',
    password: '',
    showPassword: false,
  })

  const emailOrInGameNameRef = useRef()
  const [enterInGameName, setEnterInGameName] = useState(false)
  const [inGameName, setInGameName] = useState('')
  const [load, setLoad] = useState({
    submitLoad: false,
    forgotLoad: false,
  })
  const navigate = useNavigate()

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

  const inGameNameHandler = e => {
    setInGameName(e.target.value)
  }

  const inputHandler = e => {
    const { name, value } = e.target
    setData({ ...data, [name]: value })
  }

  const handleInGameNameSubmit = async () => {
    playClick()
    try {
      setLoad({ submitLoad: true, forgotLoad: false })
      const response = await axios.post('/api/user/handleGoogleLogin', {
        credentialResponse: data.credentialResponse,
        inGameName,
      })
      handleGoogleResponse(response)
    } catch (error) {
      console.error(error.response.data.error)
      toast({
        title: t('login_failed'),
        description: error.response.data.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad({ submitLoad: false, forgotLoad: false })
    }
  }

  const handleGoogleResponse = async response => {
    if (response.status === 201) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('role', response.data.user.role)
      dispatchRedux(setIsSigninOpen(false))
      dispatchRedux(setUser(response.data.user))
      dispatchRedux(verifyAdminStatus())
      dailyStreakCheckerAndUpdater(dispatchRedux)
      toast({
        title: t('login_success'),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })

      location.pathname === '/' && navigate('/home/all')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    playClick()
    try {
      setLoad({ submitLoad: true, forgotLoad: false })
      const response = await axios.post(`/api/user/login`, {
        data,
      })
      if (response.data.user.verified === false) {
        const responseOfResendOTP = await axios.post(`/api/user/resendOTP`, {
          email: response.data.user.email,
        })

        if (responseOfResendOTP.status === 201) {
          onEmailVerifyOpen()
          toast({
            title: t('email_not_verified'),
            description: t('verify_email_message'),
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      } else if (
        response.status === 201 &&
        response.data.user.verified === true
      ) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('role', response.data.user.role)
        dispatchRedux(setIsSigninOpen(false))
        dispatchRedux(setUser(response.data.user))
        dispatchRedux(verifyAdminStatus())

        dailyStreakCheckerAndUpdater(dispatchRedux)

        toast({
          title: 'Login-Successful',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        location.pathname === '/' && navigate('/home/all')
      } else {
        throw new Error(t('login_failed'))
      }
    } catch (error) {
      toast({
        title: error.response.data.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error)
      console.log(error.response.data.error)
    } finally {
      setLoad({ submitLoad: false, forgotLoad: false })
    }
  }

  const doForgotPassword = async () => {
    playClick()
    try {
      setLoad({ submitLoad: false, forgotLoad: true })
      const response = await axios.post(`/api/user/resendOTP`, {
        email: data.emailOrInGameName,
      })
      if (response.status === 201) {
        let i = data.emailOrInGameName.indexOf('@')

        const starredEmail =
          data.emailOrInGameName.slice(0, 2) +
          data.emailOrInGameName.slice(2, i).replace(/./g, '*') +
          data.emailOrInGameName.slice(i)
        dispatchRedux(setForgotPassword(true))
        onEmailVerifyOpen()
        toast({
          title: t('otp_sent'),
          description: starredEmail,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      emailOrInGameNameRef.current.focus()
      toast({
        description:
          error.response?.data?.error ||
          'Enter a valid Email or try again later',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
      console.log(error)
      console.error(error.response.data.error)
    } finally {
      setLoad({ submitLoad: false, forgotLoad: false })
    }
  }

  useEffect(() => {
    document.title = 'Signin page'
  }, [])

  const handleForgotPasswordThrottled = useCallback(
    throttle(doForgotPassword, 1000),
    [data.emailOrInGameName],
  )

  useEffect(() => {
    return () => handleForgotPasswordThrottled.cancel()
  }, [handleForgotPasswordThrottled])

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (
      !isEmailVerifyOpen &&
      forgotPassword &&
      verifyEmail &&
      !isResetPasswordOpen
    ) {
      console.log('Opening Reset Password')
      onResetPasswordOpen()
    }
  }, [
    isEmailVerifyOpen,
    forgotPassword,
    verifyEmail,
    onResetPasswordOpen,
    isResetPasswordOpen,
  ])

  return (
    <>
      <ChakraModal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: 'full', md: 'xl' }}
      >
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent
          sx={{
            backgroundColor: '#0f0d15',
            backgroundImage:
              'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
          }}
          borderRadius={'xl'}
        >
          <ModalHeader
            color="white"
            fontSize={'3xl'}
            textTransform={'uppercase'}
          >
            {t('signin_title')}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody w={'70%'} py={'20px'}>
            <Suspense fallback={<Spinner />}>
              {!enterInGameName ? (
                <>
                  <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                    <InputGroup>
                      <Input
                        ref={emailOrInGameNameRef}
                        onChange={inputHandler}
                        name="emailOrInGameName"
                        value={data.emailOrInGameName}
                        type="text"
                        placeholder={t('email_or_in_game_name_placeholder')}
                        color="white"
                      />
                    </InputGroup>
                    <InputGroup mt={4}>
                      <Input
                        onChange={inputHandler}
                        name="password"
                        value={data.password}
                        type={data.showPassword ? 'text' : 'password'}
                        placeholder={t('enter_password')}
                        color="white"
                      />
                      <InputRightElement width="4.5rem">
                        <IconButton
                          style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                          }}
                          onClick={() =>
                            setData(prevData => ({
                              ...prevData,
                              showPassword: !prevData.showPassword,
                            }))
                          }
                          icon={
                            data.showPassword ? (
                              <FillEyeInvisible
                                width="20px"
                                height="20px"
                                fill="white"
                              />
                            ) : (
                              <FillEyeVisible
                                width="20px"
                                height="20px"
                                fill="white"
                              />
                            )
                          }
                        />
                      </InputRightElement>
                    </InputGroup>
                    <Button
                      isLoading={load.submitLoad}
                      loadingText="Submitting"
                      colorScheme="teal"
                      variant="outline"
                      type="submit"
                      size="lg"
                      w={'100%'}
                      mt={4}
                    >
                      {t('submit_button')}
                    </Button>
                  </form>
                  <Flex
                    justifyContent="space-between"
                    mt={4}
                    flexDirection={{ base: 'column', md: 'row' }}
                    gap={4}
                  >
                    <Button
                      variant="solid"
                      colorScheme="green"
                      onClick={() => {
                        onClose()
                        dispatchRedux(setIsRegisterOpen(true))
                      }}
                    >
                      {t('create_account_button')}
                    </Button>
                    <Button
                      isLoading={load.forgotLoad}
                      variant="solid"
                      colorScheme="red"
                      onClick={handleForgotPasswordThrottled}
                    >
                      {t('forgot_password_button')}
                    </Button>
                  </Flex>
                  <Flex w={'100%'} justifyContent={'center'}>
                    <Button my={4} p={0}>
                      <GoogleOAuthProvider clientId="492859619634-m81f6tnro73fg6sflkuj0nemm1g6aecb.apps.googleusercontent.com">
                        <GoogleLogin
                          onSuccess={async credentialResponse => {
                            setData(prevData => ({
                              ...prevData,
                              credentialResponse,
                            }))
                            try {
                              const response = await axios.post(
                                '/api/user/handleGoogleLogin',
                                { credentialResponse },
                              )
                              if (response.data.EnterInGameName) {
                                toast({
                                  title: t('enter_in_game_name'),
                                  description: t('enter_in_game_name_message'),
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
                              console.error(error.response.data.error)
                              if (error.response.data.EnterInGameName)
                                setEnterInGameName(true)
                              toast({
                                title: t('login_failed'),
                                description: error.response.data.error,
                                status: 'error',
                                duration: 5000,
                                isClosable: true,
                                position: 'top',
                              })
                            }
                          }}
                          onError={() => {
                            console.log(t('login_failed'))
                          }}
                        />
                      </GoogleOAuthProvider>
                    </Button>
                  </Flex>
                  <Flex w={'100%'} justifyContent={'center'} mb={4}>
                    <Text color={'gray.400'} fontWeight={'bold'}>
                      {t('or_text')}
                    </Text>
                  </Flex>
                  <Suspense fallback={<Spinner />}>
                    <Flex w={'100%'} justifyContent={'center'}>
                      <GuestLogin
                        hamburgerOnClose={hamburgerOnClose}
                        t={GuestLoginTranslate}
                      />
                    </Flex>
                  </Suspense>
                </>
              ) : (
                <>
                  <InputGroup mt={4}>
                    <Input
                      onChange={inGameNameHandler}
                      name="inGameName"
                      value={inGameName}
                      type="text"
                      placeholder={t('enter_in_game_name')}
                      color="white"
                    />
                  </InputGroup>
                  <Button
                    isLoading={load.submitLoad}
                    loadingText="Submitting"
                    colorScheme="teal"
                    variant="outline"
                    onClick={handleInGameNameSubmit}
                    size="lg"
                    w={'100%'}
                    mt={4}
                  >
                    {t('submit_button')}
                  </Button>
                </>
              )}
            </Suspense>
          </ModalBody>
        </ModalContent>
      </ChakraModal>
      <Suspense fallback={<Spinner />}>
        {isResetPasswordOpen && forgotPassword && (
          <ResetPassword
            email={data.emailOrInGameName}
            onClose={() => {
              onResetPasswordClose()
              dispatchRedux(setForgotPassword(false))
            }}
            isOpen={isResetPasswordOpen}
          />
        )}
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <EmailVerify
          email={data.emailOrInGameName}
          onClose={onEmailVerifyClose}
          isOpen={isEmailVerifyOpen}
        />
      </Suspense>
    </>
  )
}
