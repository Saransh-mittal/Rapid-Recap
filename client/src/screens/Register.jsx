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
  useDisclosure,
  Divider,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet'
import FillEyeInvisible from '../assets/svg/FillEyeInvisible'
import FillEyeVisible from '../assets/svg/FillEyeVisible'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAuth } from '../redux/authSlice'
import {
  logoutApp,
  resetAllState,
  resetLoadingFlags,
  setIsSigninOpen,
} from '../redux/appSlice'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { useFeatureDetection } from '../utils/featureDetection'
import useSafeSound from '../customHooks/useSafeSound'

const EmailVerify = lazy(() =>
  import('../components/authComponents/EmailVerify'),
)

export default function Register({ isOpen, onClose, onOpenGuest }) {
  const { t } = useTranslation('Register')
  const { verifyEmail } = useSelector(state => state.auth)
  const { exportData } = useSelector(state => state.app)

  const toast = useToast()
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const dispatchRedux = useDispatch()
  const navigate = useNavigate()

  const {
    isOpen: isEmailVerifyOpen,
    onOpen: onEmailVerifyOpen,
    onClose: onEmailVerifyClose,
  } = useDisclosure()

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

  const handleLogout = useCallback(async () => {
    try {
      const response = await axios.post('/api/user/logout')
      if (response.status === 201) {
        localStorage.removeItem('token')
        exportData && localStorage.removeItem('guestUserId')
        await i18n.changeLanguage('en')
        navigate('/')
        dispatchRedux(logoutApp())
        dispatchRedux(logoutAuth())

        dispatchRedux(resetLoadingFlags())
        dispatchRedux(resetAllState())
      } else {
        throw new Error('Logout Failed')
      }
    } catch (error) {
      toast({
        title: 'Logout Failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error)
    }
  }, [dispatchRedux, navigate, toast, exportData, onOpenGuest])

  const handleSubmit = async e => {
    playClick()
    setLoad(true)
    e.preventDefault()
    try {
      const pic = await submitImage(data)
      const response = exportData
        ? await axios.post(`/api/user/exportGuestData`, {
            ...data,
            pic,
            guestId: exportData,
          })
        : await axios.post(`/api/user/register`, { ...data, pic })
      exportData && (await handleLogout())
      if (response.status === 201) {
        onEmailVerifyOpen()
        toast({
          title: t('register_success'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } else {
        throw new Error(t('logout_failed'))
      }
    } catch (error) {
      toast({
        title: t('logout_failed'),
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
    if (verifyEmail && isOpen) {
      onClose()
      dispatchRedux(setIsSigninOpen(true))
    }
  }, [verifyEmail, onClose])

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
      console.error(t('image_upload_failed'), error)
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
    <>
      <ChakraModal
        isOpen={isOpen}
        onClose={() => {
          onClose()
          !exportData && dispatchRedux(setIsSigninOpen(true))
          onOpenGuest && onOpenGuest()
        }}
        size={{ base: 'full', md: 'xl' }}
        closeOnOverlayClick={false}
        // scrollBehavior={'inside'}
      >
        <Helmet>
          <title>{t('register_title')}</title>
          <meta name="description" content={t('meta_description')} />
          <meta name="keywords" content={t('meta_keywords')} />
          <meta property="og:title" content={t('meta_og_title')} />
          <meta property="og:description" content={t('meta_og_description')} />
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
            borderRadius: '15px',
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
          }}
        >
          <ModalHeader
            color="white"
            display="flex"
            alignItems="center"
            fontSize={'1.75rem'}
          >
            {t('register_title')}
          </ModalHeader>
          <ModalCloseButton color="white" disabled={load} />
          <ModalBody h={'fit-content'}>
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
                    border="2px solid #2D3748"
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
                  {t('upload_profile_picture')}
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
                  {t('choose_file')}
                </Button>
              </Flex>
              <Input
                placeholder={t('enter_name')}
                name="name"
                value={data.name}
                onChange={inputHandler}
                mb="4"
                color="white"
                required
              />
              <Input
                placeholder={t('enter_in_game_name')}
                name="inGameName"
                value={data.inGameName}
                onChange={inputHandler}
                mb="4"
                color="white"
                required
              />
              <Input
                type="email"
                placeholder={t('enter_email')}
                name="email"
                value={data.email}
                onChange={inputHandler}
                mb="4"
                color="white"
                required
              />
              <InputGroup mb="4">
                <Input
                  type={data.showPassword ? 'text' : 'password'}
                  placeholder={t('enter_password')}
                  name="password"
                  value={data.password}
                  onChange={inputHandler}
                  color="white"
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Toggle Password Visibility"
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
                    onClick={() => togglePasswordVisibility('showPassword')}
                    variant="unstyled"
                    color="white"
                    _hover={{ color: 'gray.400' }}
                  />
                </InputRightElement>
              </InputGroup>
              <InputGroup mb="4">
                <Input
                  type={data.showCPassword ? 'text' : 'password'}
                  placeholder={t('confirm_password')}
                  name="cpassword"
                  value={data.cpassword}
                  onChange={inputHandler}
                  color="white"
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Toggle Confirm Password Visibility"
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
                    onClick={() => togglePasswordVisibility('showCPassword')}
                    variant="unstyled"
                    color="white"
                    _hover={{ color: 'gray.400' }}
                  />
                </InputRightElement>
              </InputGroup>
              <Divider mb="4" />
              <Button
                colorScheme="blue"
                size="lg"
                width="100%"
                type="submit"
                isLoading={load}
              >
                {t('register_button')}
              </Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              colorScheme="whiteAlpha"
              onClick={() => {
                onClose()
                !exportData && dispatchRedux(setIsSigninOpen(true))
                onOpenGuest && onOpenGuest()
              }}
            >
              {t('close_button')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ChakraModal>
      <Suspense fallback={<Spinner />}>
        <EmailVerify
          email={data.email}
          onClose={onEmailVerifyClose}
          isOpen={isEmailVerifyOpen}
        />
      </Suspense>
    </>
  )
}
