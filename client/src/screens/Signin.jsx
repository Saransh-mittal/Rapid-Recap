import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import './Signin.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../contextAPI/appContext'
import EmailVerify from '../components/authComponents/EmailVerify'
import Modal from './Modal'
import ResetPassword from '../components/authComponents/ResetPassword'
import { throttle } from 'lodash'
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
  //useMediaQuery,
} from '@chakra-ui/react'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import Register from './Register'
import { dailyStreakCheckerAndUpdater } from '../utils/quiz.utils'
import { useDispatch, useSelector } from 'react-redux'
import { setForgotPassword, setUser, setVerifyEmail } from '../redux/authSlice'
import { setModal } from '../redux/uiSlice'

export default function Signin({ isOpen, onOpen, onClose, hamburgerOnClose }) {
  //const isScreenSmallerThan992 = useMediaQuery("(max-width: 992px)")[0];

  const toast = useToast()
  const { playClick } = useContext(AppContext)
  const { modal } = useSelector(state => state.ui)
  const { forgotPassword, verifyEmail } = useSelector(state => state.auth)
  const dispatchRedux = useDispatch()
  const [data, setData] = useState({
    emailOrInGameName: '',
    password: '',
    showPassword: false,
  })
  const emailOrInGameNameRef = useRef()
  //const [inGameName, setInGameName] = useState("");
  const [enterInGameName, setEnterInGameName] = useState(false)
  const [inGameName, setInGameName] = useState('')
  const [load, setLoad] = useState({
    submitLoad: false,
    forgotLoad: false,
  })
  const navigate = useNavigate()
  const {
    isOpen: isRegisterOpen,
    onOpen: onRegisterOpen,
    onClose: onRegisterClose,
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
        title: 'Login Failed',
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
      hamburgerOnClose && hamburgerOnClose()
      dispatchRedux(setUser(response.data.user))
      dailyStreakCheckerAndUpdater(dispatchRedux)
      toast({
        title: 'Login Successful',
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
          dispatchRedux(setVerifyEmail(true))
          dispatchRedux(setModal(true))
          toast({
            title: 'Email not verified',
            description: 'Please verify your email before continuing',
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
        dispatchRedux(setUser(response.data.user))
        hamburgerOnClose && hamburgerOnClose()
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
        throw new Error('Login Failed')
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
        dispatchRedux(setVerifyEmail(true))
        toast({
          title: 'OTP sent to your email',
          description: starredEmail,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
      dispatchRedux(setModal(true))
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
        >
          <ModalHeader color="white">Sign In</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody w={'65%'} p={'20px'}>
            {modal && forgotPassword && !verifyEmail && (
              <Modal onClose={() => dispatchRedux(setModal(false))}>
                <ResetPassword email={data.emailOrInGameName} />
              </Modal>
            )}
            {modal && verifyEmail && (
              <Modal onClose={() => dispatchRedux(setModal(false))}>
                <EmailVerify email={data.emailOrInGameName} />
              </Modal>
            )}
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
                      placeholder="Email / In-Game-Name"
                      color="white"
                    />
                  </InputGroup>
                  <InputGroup mt={4}>
                    <Input
                      onChange={inputHandler}
                      name="password"
                      value={data.password}
                      type={data.showPassword ? 'text' : 'password'}
                      placeholder="Password"
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
                            <AiFillEyeInvisible />
                          ) : (
                            <AiFillEye />
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
                    Submit
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
                      onRegisterOpen()
                    }}
                  >
                    Create an account
                  </Button>
                  <Button
                    isLoading={load.forgotLoad}
                    variant="solid"
                    colorScheme="red"
                    onClick={handleForgotPasswordThrottled}
                  >
                    Forgot Password?
                  </Button>
                </Flex>
                <Flex w={'100%'} justifyContent={'center'}>
                  <Button mt={4} p={0}>
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
                            // Store role in localStorage
                            if (response.data.EnterInGameName) {
                              toast({
                                title: 'Enter In-Game-Name',
                                description:
                                  'Please enter your In-Game-Name to continue',
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
                              title: 'Login Failed',
                              description: error.response.data.error,
                              status: 'error',
                              duration: 5000,
                              isClosable: true,
                              position: 'top',
                            })
                          }
                        }}
                        onError={() => {
                          console.log('Login Failed')
                        }}
                      />
                    </GoogleOAuthProvider>
                  </Button>
                </Flex>
              </>
            ) : (
              <>
                <InputGroup mt={4}>
                  <Input
                    onChange={e => setInGameName(e.target.value)}
                    name="inGameName"
                    value={inGameName}
                    type="text"
                    placeholder="Enter In-Game-Name"
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
                  Submit
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </ChakraModal>
      <Register
        isOpen={isRegisterOpen}
        onClose={onRegisterClose}
        signinOnOpen={onOpen}
      />
    </>
  )
}
