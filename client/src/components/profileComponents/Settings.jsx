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
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { formatSoundType } from '../../utils/helper.utils'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import LanguageSwitcher from '../../LanguageSwitcher'
import NotificationSubscription from './NotificationSubscription'

const MotionBox = motion(Box)

const Settings = ({ isOpen, onClose }) => {
  const { t } = useTranslation('Settings')
  const dispatch = useDispatch()
  const toast = useToast()
  const soundSettings = useSelector(state => state.app.soundSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSoundType, setSelectedSoundType] = useState(null)

  const handleInfoClick = soundType => {
    setSelectedSoundType(soundType)
  }

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
            {t('Settings')}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody w={'100%'}>
            <Accordion allowToggle allowMultiple>
              <AccordionItem border="none">
                <AccordionButton
                  _expanded={{ bg: 'whiteAlpha.200' }}
                  p={4}
                  borderRadius="md"
                >
                  <Box
                    flex="1"
                    textAlign="left"
                    color="white"
                    fontSize="xl"
                    fontWeight="bold"
                  >
                    {t('soundSettings')}
                  </Box>
                  <AccordionIcon color="white" />
                </AccordionButton>
                <AccordionPanel pb={4}>
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
                            <Text
                              color="white"
                              fontWeight="medium"
                              fontSize={'lg'}
                            >
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
                </AccordionPanel>
              </AccordionItem>

              <Divider my={4} borderColor="whiteAlpha.400" />

              <AccordionItem border="none">
                <AccordionButton
                  _expanded={{ bg: 'whiteAlpha.200' }}
                  p={4}
                  borderRadius="md"
                >
                  <Box
                    flex="1"
                    textAlign="left"
                    color="white"
                    fontSize="xl"
                    fontWeight="bold"
                  >
                    {t('languageSettings')}
                  </Box>
                  <AccordionIcon color="white" />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <LanguageSwitcher />
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <Divider my={4} borderColor="whiteAlpha.400" />

              <AccordionItem border="none">
                <AccordionButton
                  _expanded={{ bg: 'whiteAlpha.200' }}
                  p={4}
                  borderRadius="md"
                >
                  <Box
                    flex="1"
                    textAlign="left"
                    color="white"
                    fontSize="xl"
                    fontWeight="bold"
                  >
                    {t('notificationSettings')}
                  </Box>
                  <AccordionIcon color="white" />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <NotificationSubscription />
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={onClose}
              colorScheme="teal"
              variant="outline"
              _hover={{ bg: 'teal.800' }}
              isLoading={isLoading}
            >
              {t('close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
            <ModalCloseButton />
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

export default Settings
