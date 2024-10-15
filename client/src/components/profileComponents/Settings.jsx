// File: src/components/Settings/Settings.js
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Divider,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import SoundSettings from './settingsComponents/SoundSettings'
import LanguageSettings from './settingsComponents/LanguageSettings'
import NotificationSettings from './settingsComponents/NotificationSettings'
import ProfileVisibilitySettings from './settingsComponents/ProfileVisibilitySettings'

const Settings = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['Settings'])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
                <SoundSettings />
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
                <LanguageSettings />
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
                <NotificationSettings />
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
                  {t('profileVisibility.toggleVisibility', {
                    ns: 'ToggleProfileVisibility',
                  })}
                </Box>
                <AccordionIcon color="white" />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <ProfileVisibilitySettings />
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
          >
            {t('close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default Settings
