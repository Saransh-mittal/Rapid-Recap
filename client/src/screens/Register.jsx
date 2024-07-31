import React, { useState, useContext, useEffect, useCallback } from 'react'
import './Register.css'
import axios from 'axios'
import Modal from './Modal'
import EmailVerify from '../components/authComponents/EmailVerify'
import { AppContext } from '../contextAPI/appContext'
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
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import _ from 'lodash'

import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export default function Register({ isOpen, onClose, signinOnOpen }) {
  const [emailVerified, setEmailVerified] = useState(false)
  const toast = useToast()
  const { state, dispatch } = useContext(AppContext)
  const navigate = useNavigate()
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
    setData({ ...data, [name]: value })
  }

  const togglePasswordVisibility = field => {
    setData({
      ...data,
      [field]: !data[field],
    })
  }

  const handleSubmit = async e => {
    setLoad(true)
    e.preventDefault()
    try {
      const newData = data
      const pic = await submitImage(data)
      newData.pic = pic
      const response = await axios.post(`/api/user/register`, newData)
      if (response.status === 201) {
        await dispatch({ type: 'showModal', payloadModal: true })
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
        description: error.response.data.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad(false)
    }
  }

  useEffect(() => {
    document.title = 'Register - Rapid Recap'
  }, [])

  const handleSubmitThrottled = useCallback(_.throttle(handleSubmit, 1000), [
    data,
  ])

  useEffect(() => {
    if (emailVerified) {
      onClose()
      signinOnOpen()
    }
  }, [emailVerified])

  useEffect(() => {
    return () => handleSubmitThrottled.cancel()
  }, [handleSubmitThrottled])

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSubmitThrottled(e)
    }
  }

  const submitImage = async dataForPic => {
    try {
      const img = dataForPic.pic
      const data = new FormData()
      data.append('file', img)
      data.append('upload_preset', 'ProfilePics')
      data.append('cloud_name', 'dxstsrnbs')
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dxstsrnbs/image/upload',
        data,
      )
      const pic = response.data.url
      return pic
    } catch (e) {
      console.log(e)
    }
  }

  const handleImageChange = async e => {
    setImageLoading(true)
    try {
      const img = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setPicDisplay(reader.result)
        setData({ ...data, pic: img })
      }
      reader.readAsDataURL(img)
    } catch (error) {
      toast({
        title: 'Image upload Failed',
        description: error,
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
      onClose={onClose}
      size={{ base: 'full', md: 'xl' }}
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
          {state.modal && (
            <Modal
              onClose={() =>
                dispatch({ type: 'showModal', payloadModal: false })
              }
            >
              <EmailVerify
                email={data.email}
                setEmailVerified={setEmailVerified}
              />
            </Modal>
          )}
          <form onSubmit={handleSubmitThrottled} onKeyDown={handleKeyPress}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '25px',
              }}
            >
              {imageLoading ? (
                <Spinner size="lg" />
              ) : (
                <Image
                  loading={'eager'}
                  src={picDisplay}
                  alt="Profile Picture"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    marginBottom: '10px',
                  }}
                />
              )}
              <div>
                <label
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  Upload Profile Picture
                </label>
              </div>
              <Input
                id="profile-pic"
                type="file"
                name="pic"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-pic">
                <Button as="span" colorScheme="blue" style={{ size: 'sm' }}>
                  Choose File
                </Button>
              </label>
            </div>
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
                      data.showPassword ? <AiFillEyeInvisible /> : <AiFillEye />
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
                        <AiFillEyeInvisible />
                      ) : (
                        <AiFillEye />
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
              type="button"
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
