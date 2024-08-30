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

const MotionBox = motion(Box)

const SoundSettings = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const toast = useToast()
  const soundSettings = useSelector(state => state.app.soundSettings)
  const [isLoading, setIsLoading] = useState(false)

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
        <ModalBody w={'90%'}>
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
                  <Text color="white" fontWeight="medium" fontSize={'lg'}>
                    {formatSoundType(soundType)}
                  </Text>
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
  )
}

export default SoundSettings
