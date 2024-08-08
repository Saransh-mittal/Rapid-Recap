import React, { useState, useEffect } from 'react'
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
} from '@chakra-ui/react'
import axios from 'axios'
import useSound from '../../customHooks/useSound'

const EditProfileModal = ({
  isOpen,
  onClose,
  profileData,
  setProfileData,
  onSubmit,
  leftProfileView,
  user,
}) => {
  const { playClick } = useSound()
  const [formData, setFormData] = useState(profileData)
  // console.log(profileData)
  // cs
  const [imageLoading, setImageLoading] = useState(false)
  const [picDisplay, setPicDisplay] = useState(profileData.pic)
  const [load, setLoad] = useState(false)
  const [isInGameNameDisabled, setIsInGameNameDisabled] = useState(false)
  const [remainingDays, setRemainingDays] = useState(0)
  const toast = useToast()

  useEffect(() => {
    checkInGameNameChangeEligibility()
  }, [profileData])

  const checkInGameNameChangeEligibility = () => {
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
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    playClick()
    e.preventDefault()
    setLoad(true)
    try {
      const newData = formData
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
      console.log(newData)
      onSubmit(newData)
      onClose()
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.response.data.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      //console.log(error);
    } finally {
      setLoad(false)
    }
  }

  const submitImage = async dataForPic => {
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
      // setFormData({ ...formData, pic });
      return pic
    } catch (e) {
      console.log(e)
    }
  }
  const handleImageChange = async e => {
    playClick()
    setImageLoading(true)
    try {
      const img = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        // reader.result contains the data URL representing the file
        setPicDisplay(reader.result)
        setFormData({ ...formData, pic: img })
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
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setProfileData({
          name: leftProfileView.name,
          pic: leftProfileView.pic
            ? leftProfileView.pic
            : 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
          bio: leftProfileView.bio,
          inGameName: leftProfileView.inGameName || '',
          lastInGameNameChange: leftProfileView.lastInGameNameChange,
        })
      }}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent style={{ backgroundColor: '#0f0d15', color: 'white' }}>
        <ModalHeader fontSize="3xl">Edit Profile</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody width={'80%'}>
          <Box display="flex" justifyContent="center" mb={4}>
            <Image
              src={picDisplay}
              alt="Profile Picture"
              boxSize="150px"
              borderRadius="full"
              mb={4}
            />
          </Box>

          <FormControl mb={4}>
            <Box display="flex" justifyContent="center">
              <FormLabel htmlFor="profile-pic" color="white" fontWeight="bold">
                Upload Profile Picture
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
            <Flex w={'100%'} justifyContent={'center'}>
              <label htmlFor="profile-pic">
                <Button as="span" colorScheme="blue" size="sm">
                  Choose File
                </Button>
              </label>
            </Flex>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>InGameName</FormLabel>
            <Input
              type="text"
              name="inGameName"
              value={formData.inGameName}
              onChange={handleInputChange}
              isDisabled={isInGameNameDisabled}
            />
            {isInGameNameDisabled && (
              <Text fontSize="sm" color="red.500" mt={1}>
                You can change your in-game name again in {remainingDays}{' '}
                day(s).
              </Text>
            )}
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Bio</FormLabel>
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
            Save Changes
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditProfileModal
