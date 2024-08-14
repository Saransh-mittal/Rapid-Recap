import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import './Register.css'
import axios from 'axios'
import throttle from 'lodash.throttle'
import {
  Button,
  useToast,
  Input,
  Image,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton,
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import useSound from '../customHooks/useSound'
import FillEyeInvisible from '../assets/svg/FillEyeInvisible'
import FillEyeVisible from '../assets/svg/FillEyeVisible'

// Lazy load components
const Modal = lazy(() => import('./Modal'))
const EmailVerify = lazy(() =>
  import('../components/authComponents/EmailVerify'),
)

export default function Register({ isOpen, onClose, signinOnOpen }) {
  const [emailVerified, setEmailVerified] = useState(false)
  const toast = useToast()
  const { playClick } = useSound()
  const dispatch = useDispatch()
  const { modal } = useSelector(state => state.ui)

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

  const inputHandler = e => {
    const { name, value } = e.target
    setData(prevData => ({ ...prevData, [name]: value }))
  }

  const togglePasswordVisibility = field => {
    playClick()
    setData(prevData => ({
      ...prevData,
      [field]: !prevData[field],
    }))
  }

  const handleSubmit = async e => {
    playClick()
    setLoad(true)
    e.preventDefault()
    try {
      const pic = await submitImage(data)
      const response = await axios.post(`/api/user/register`, { ...data, pic })
      if (response.status === 201) {
        dispatch(setModal(true))
        toast({
          title: 'Registered Successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } else {
        throw new Error('Registration Failed')
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

  const handleSubmitThrottled = useCallback(throttle(handleSubmit, 1000), [
    data,
  ])

  useEffect(() => {
    document.title = 'Register - Rapid Recap'
    return () => handleSubmitThrottled.cancel()
  }, [handleSubmitThrottled])

  useEffect(() => {
    if (emailVerified) {
      onClose()
      signinOnOpen()
    }
  }, [emailVerified, onClose, signinOnOpen])

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSubmitThrottled(e)
    }
  }

  const submitImage = async ({ pic }) => {
    playClick()
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

  const handleImageChange = async e => {
    playClick()
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
      console.error(error)
    } finally {
      setImageLoading(false)
    }
  }

  return (
    <ChakraModal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        signinOnOpen()
      }}
      size={{ base: 'full', md: 'xl' }}
      scrollBehavior={'inside'}
    >
      <Helmet>
        <title>Register - Rapid Recap</title>
        <meta
          name="description"
          content="Join Rapid Recap today! Register now to stay updated with the latest news and articles, and participate in engaging quizzes to track your Information Quotient (IQ) score."
        />
        <meta
          name="keywords"
          content="Register, Rapid Recap, news, articles, quizzes, IQ score, leaderboard"
        />
        <meta property="og:title" content="Register - Rapid Recap" />
        <meta
          property="og:description"
          content="Join Rapid Recap today! Register now to stay updated with the latest news and articles, and participate in engaging quizzes to track your Information Quotient (IQ) score."
        />
      </Helmet>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent
        sx={{
          backgroundColor: '#0f0d15',
          backgroundImage:
            'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
          padding: '20px',
        }}
      >
        <ModalHeader color="white">Register</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <Suspense fallback={<Spinner size="lg" color="white" />}>
            {modal && (
              <Modal onClose={() => dispatch(setModal(false))}>
                <EmailVerify
                  email={data.email}
                  setEmailVerified={setEmailVerified}
                />
              </Modal>
            )}
          </Suspense>
          <form onSubmit={handleSubmitThrottled} onKeyDown={handleKeyPress}>
            <Flex direction="column" align="center" mb="4">
              {imageLoading ? (
                <Spinner size="lg" color="white" />
              ) : (
                <Image
                  src={picDisplay}
                  alt="Profile Picture"
                  w="100px"
                  h="100px"
                  borderRadius="50%"
                  mb="4"
                />
              )}
              <label
                htmlFor="profile-pic"
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                }}
              >
                Upload Profile Picture
              </label>
              <Input
                id="profile-pic"
                type="file"
                name="pic"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <Button
                as="span"
                colorScheme="blue"
                size="sm"
                onClick={() => document.getElementById('profile-pic').click()}
              >
                Choose File
              </Button>
            </Flex>
            <Flex direction="column" gap="4" mb="4">
              <Input
                name="email"
                onChange={inputHandler}
                required
                value={data.email}
                type="email"
                placeholder="Email ID"
                color="white"
              />
              <Input
                name="name"
                onChange={inputHandler}
                required
                value={data.name}
                type="text"
                placeholder="Name"
                color="white"
              />
              <Input
                name="inGameName"
                onChange={inputHandler}
                required
                value={data.inGameName}
                type="text"
                placeholder="In Game Name"
                color="white"
              />
              <InputGroup>
                <Input
                  name="password"
                  onChange={inputHandler}
                  required
                  value={data.password}
                  type={data.showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  minLength={8}
                  color="white"
                />
                <InputRightElement width="4.5rem">
                  <IconButton
                    style={{ backgroundColor: 'transparent', color: 'white' }}
                    onClick={() => togglePasswordVisibility('showPassword')}
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
              <InputGroup>
                <Input
                  name="cpassword"
                  onChange={inputHandler}
                  required
                  value={data.cpassword}
                  type={data.showCPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  minLength={8}
                  color="white"
                />
                <InputRightElement width="4.5rem">
                  <IconButton
                    style={{ backgroundColor: 'transparent', color: 'white' }}
                    onClick={() => togglePasswordVisibility('showCPassword')}
                    icon={
                      data.showCPassword ? (
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
            </Flex>
            <Button
              isLoading={load}
              loadingText="Submitting"
              colorScheme="teal"
              variant="outline"
              type="submit"
              size="lg"
              w="100%"
              mb="4"
            >
              Submit
            </Button>
          </form>
        </ModalBody>
        <ModalFooter>
          <Flex direction="column" align="center" w="100%">
            <h6 style={{ color: 'white', marginBottom: '10px' }}>
              Already a Member?
            </h6>
            <Button
              variant="solid"
              colorScheme="green"
              onClick={() => {
                onClose()
                signinOnOpen()
              }}
            >
              Login Here
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  )
}
