import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSound, setSoundSettings } from '../../redux/appSlice'
import { SOUND_TYPES } from '../../models/soundSettings'
import axios from 'axios'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Box,
  Text,
  useToast,
  Switch,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { formatSoundType } from '../../utils/helper.utils'
import { InfoOutlineIcon } from '@chakra-ui/icons'

const MotionBox = motion(Box)

const SoundSettings = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const toast = useToast()
  const soundSettings = useSelector(state => state.app.soundSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSoundType, setSelectedSoundType] = useState(null)

  const handleInfoClick = soundType => {
    setSelectedSoundType(soundType)
  }
  const descriptions = {
    [SOUND_TYPES.NOTE_MESSAGE]: 'In-app Notifications',
    [SOUND_TYPES.MILESTONE]: 'Sounds for Milestones',
    [SOUND_TYPES.CLICK]: 'Click Sounds',
    [SOUND_TYPES.QUIZ_SOUNDS]: 'Quiz sound effects',
  }

  const detailedDescriptions = {
    [SOUND_TYPES.NOTE_MESSAGE]:
      'Sound notifications for in-app messages that appear from the top right, including both regular updates and milestone achievements.',
    [SOUND_TYPES.MILESTONE]:
      'Special sound effects that play when you achieve significant milestones or accomplishments in the app.',
    [SOUND_TYPES.CLICK]:
      'Audible feedback for clicks and button interactions throughout the application.',
    [SOUND_TYPES.QUIZ_SOUNDS]:
      'Sound effects specifically designed to enhance your quiz-taking experience.',
  }
  const handleToggle = async soundType => {
    const newSettings = {
      ...soundSettings,
      [soundType]: !soundSettings[soundType],
    }
    dispatch(toggleSound(soundType))

    try {
      setIsLoading(true)
      await axios.post('/api/user/soundController', { sound: newSettings })
      toast({
        title: 'Settings updated',
        description: `${soundType} sounds ${
          newSettings[soundType] ? 'enabled' : 'disabled'
        }`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Failed to update sound settings:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to save sound settings. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      // Revert the local state
      dispatch(setSoundSettings({ ...soundSettings }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          bg="rgba(15, 13, 21, 0.8)"
          borderRadius="xl"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          border="1px solid rgba(255, 255, 255, 0.18)"
        >
          <ModalHeader color="white" fontSize="2xl">
            Sound Settings
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody w={'100%'}>
            <VStack align="stretch" spacing={6}>
              {Object.entries(SOUND_TYPES).map(([key, soundType]) => (
                <MotionBox
                  key={soundType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    bg="whiteAlpha.100"
                    p={4}
                    borderRadius="md"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    transition="background 0.2s"
                  >
                    <Box display="flex" alignItems="center">
                      <Text color="white" fontWeight="medium" fontSize={'lg'}>
                        {descriptions[soundType]}
                      </Text>
                      <InfoOutlineIcon
                        color="teal.300"
                        ml={2}
                        cursor="pointer"
                        onClick={() => handleInfoClick(soundType)}
                      />
                    </Box>
                    <MotionBox
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Switch
                        isChecked={soundSettings[soundType]}
                        onChange={() => handleToggle(soundType)}
                        colorScheme="teal"
                        size="lg"
                      />
                    </MotionBox>
                  </Box>
                </MotionBox>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={onClose}
              colorScheme="teal"
              variant="outline"
              _hover={{ bg: 'teal.800' }}
              isLoading={isLoading}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Detailed Info Modal */}
      {selectedSoundType && (
        <Modal
          isOpen={!!selectedSoundType}
          onClose={() => setSelectedSoundType(null)}
        >
          <ModalOverlay />
          <ModalContent
            bg="rgba(15, 13, 21, 1)"
            borderRadius="xl"
            boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            border="1px solid rgba(255, 255, 255, 0.18)"
            color={'white'}
          >
            <ModalHeader>
              {formatSoundType(selectedSoundType)} Sound
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>{detailedDescriptions[selectedSoundType]}</ModalBody>
            <ModalFooter>
              <Button
                colorScheme="teal"
                onClick={() => setSelectedSoundType(null)}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default SoundSettings
