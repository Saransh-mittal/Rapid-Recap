// File: src/components/Settings/SoundSettings.js
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSound } from '../../../../redux/appSlice'
import { SOUND_TYPES } from '../../../../models/soundSettings'
import axios from 'axios'
import {
  VStack,
  Box,
  Text,
  useToast,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { formatSoundType } from '../../../../utils/helper.utils'
import { InfoOutlineIcon } from '@chakra-ui/icons'

const MotionBox = motion(Box)

const SoundSettings = () => {
  const { t } = useTranslation(['Settings'])
  const dispatch = useDispatch()
  const toast = useToast()
  const soundSettings = useSelector(state => state.app.soundSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSoundType, setSelectedSoundType] = useState(null)

  const descriptions = {
    [SOUND_TYPES.NOTE_MESSAGE]: t('inAppNotifications'),
    [SOUND_TYPES.MILESTONE]: t('milestoneSounds'),
    [SOUND_TYPES.CLICK]: t('clickSounds'),
    [SOUND_TYPES.QUIZ_SOUNDS]: t('quizSoundEffects'),
  }

  const detailedDescriptions = {
    [SOUND_TYPES.NOTE_MESSAGE]: t('detailedInAppNotifications'),
    [SOUND_TYPES.MILESTONE]: t('detailedMilestoneSounds'),
    [SOUND_TYPES.CLICK]: t('detailedClickSounds'),
    [SOUND_TYPES.QUIZ_SOUNDS]: t('detailedQuizSoundEffects'),
  }

  const handleInfoClick = soundType => {
    setSelectedSoundType(soundType)
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
        title: t('settingsUpdated'),
        description: t('soundToggle', {
          soundType: descriptions[soundType],
          status: newSettings[soundType] ? t('enabled') : t('disabled'),
        }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Failed to update sound settings:', error)
      toast({
        title: t('updateFailed'),
        description: t('updateFailedDescription'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      dispatch(toggleSound(soundType)) // Revert the change
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <VStack align="stretch" spacing={4}>
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
              <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Switch
                  isChecked={soundSettings[soundType]}
                  onChange={() => handleToggle(soundType)}
                  colorScheme="teal"
                  size="lg"
                  isDisabled={isLoading}
                />
              </MotionBox>
            </Box>
          </MotionBox>
        ))}
      </VStack>

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
              {formatSoundType(selectedSoundType)} {t('sound')}
            </ModalHeader>
            <ModalBody>{detailedDescriptions[selectedSoundType]}</ModalBody>
            <ModalFooter>
              <Button
                colorScheme="teal"
                onClick={() => setSelectedSoundType(null)}
              >
                {t('close')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default SoundSettings
