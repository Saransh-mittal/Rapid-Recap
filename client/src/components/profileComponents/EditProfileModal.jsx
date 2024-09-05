import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  Image,
  Box,
  Flex,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import useSound from '../../customHooks/useSound'

const EditProfileModal = ({ isOpen, onClose, profileData, onSubmit }) => {
  const { t } = useTranslation('EditProfileModal') // Hook for translation
  const { playClick } = useSound()
  const [formData, setFormData] = useState(profileData)
  const [imageLoading, setImageLoading] = useState(false)
  const [picDisplay, setPicDisplay] = useState(profileData.pic)
  const [load, setLoad] = useState(false)
  const [isInGameNameDisabled, setIsInGameNameDisabled] = useState(false)
  const [remainingDays, setRemainingDays] = useState(0)
  const toast = useToast()

  useEffect(() => {
    checkInGameNameChangeEligibility()
  }, [profileData])

  const checkInGameNameChangeEligibility = useCallback(() => {
    const lastChangeDate = new Date(profileData.lastInGameNameChange || 0)
    const currentDate = new Date()
    const daysSinceLastChange = Math.floor(
      (currentDate - lastChangeDate) / (1000 * 60 * 60 * 24),
    )
    if (daysSinceLastChange < 15) {
      setIsInGameNameDisabled(true)
      setRemainingDays(15 - daysSinceLastChange)
    } else {
      setIsInGameNameDisabled(false)
      setRemainingDays(0)
    }
  }, [profileData.lastInGameNameChange])

  const handleInputChange = useCallback(e => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }, [])

  const handleSubmit = useCallback(
    async e => {
      playClick()
      e.preventDefault()
      setLoad(true)
      try {
        const newData = { ...formData }
        const pic = await submitImage(formData)
        newData.pic = pic
        if (
          newData.inGameName !== profileData.inGameName &&
          !isInGameNameDisabled
        ) {
          newData.lastInGameNameChange = new Date().toISOString()
        } else {
          newData.lastInGameNameChange = profileData.lastInGameNameChange
        }

        onSubmit(newData)
        onClose()
      } catch (error) {
        toast({
          title: t('updateFailed'),
          description: error.response?.data?.error || t('somethingWentWrong'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setLoad(false)
      }
    },
    [
      playClick,
      formData,
      isInGameNameDisabled,
      onClose,
      onSubmit,
      profileData,
      toast,
      t,
    ],
  )

  const submitImage = useCallback(
    async dataForPic => {
      playClick()
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
        console.error(e)
      }
    },
    [playClick],
  )

  const handleImageChange = useCallback(
    async e => {
      playClick()
      setImageLoading(true)
      try {
        const img = e.target.files[0]
        const reader = new FileReader()
        reader.onloadend = () => {
          setPicDisplay(reader.result)
          setFormData({ ...formData, pic: img })
        }
        reader.readAsDataURL(img)
      } catch (error) {
        toast({
          title: t('imageUploadFailed'),
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setImageLoading(false)
      }
    },
    [playClick, toast],
  )

  return (
    <Suspense fallback={<Spinner />}>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent
          bg="rgba(15, 13, 21, 0.8)"
          borderRadius="xl"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          border="1px solid rgba(255, 255, 255, 0.18)"
          color={'white'}
        >
          <ModalHeader fontSize="3xl" color={'white'}>
            {t('editProfile')}</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody width={'80%'}>
            <Box display="flex" justifyContent="center" mb={4}>
              <Image
                src={picDisplay}
                alt={t('profilePicture')}
                boxSize="150px"
                borderRadius="full"
                mb={4}
              />
            </Box>

            <FormControl mb={4}>
              <Box display="flex" justifyContent="center">
                <FormLabel
                  htmlFor="profile-pic"
                  color="white"
                  fontWeight="bold"
                >
                  {t('uploadProfilePicture')}
                </FormLabel>
              </Box>
              <Input
                id="profile-pic"
                type="file"
                name="pic"
                accept="image/*"
                onChange={handleImageChange}
                display="none"
              />
              {imageLoading ? (
                <Spinner />
              ) : (
                <Flex w={'100%'} justifyContent={'center'}>
                  <label htmlFor="profile-pic">
                    <Button as="span" colorScheme="blue" size="sm">
                      {t('chooseFile')}
                    </Button>
                  </label>
                </Flex>
              )}
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>{t('name')}</FormLabel>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>{t('inGameName')}</FormLabel>
              <Input
                type="text"
                name="inGameName"
                value={formData.inGameName}
                onChange={handleInputChange}
                isDisabled={isInGameNameDisabled}
              />
              {isInGameNameDisabled && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {t('inGameNameChangeMessage', { remainingDays })}
                </Text>
              )}
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>{t('bio')}</FormLabel>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
              isLoading={load}
            >
              {t('saveChanges')}
            </Button>
            <Button onClick={onClose}>{t('cancel')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Suspense>
  )
}

export default EditProfileModal
