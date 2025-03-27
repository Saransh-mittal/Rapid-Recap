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
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  RiSoundModuleLine,
  RiTranslate2,
  RiBellLine,
  RiEyeLine,
  RiNotification3Line,
} from 'react-icons/ri'

import SoundSettings from './settingsComponents/SoundSettings'
import LanguageSettings from './settingsComponents/LanguageSettings'
import NotificationSettings from './settingsComponents/NotificationSettings'
import ProfileVisibilitySettings from './settingsComponents/ProfileVisibilitySettings'
import NotificationPreferences from './settingsComponents/NotificationPreferences'

const MotionBox = motion(Box)

const Settings = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['Settings'])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl', lg: '2xl', xl: '4xl' }}
      motionPreset="slideInBottom"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(15, 13, 21, 0.9)"
        borderRadius="xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        maxH={{ base: '100vh', md: '90vh' }}
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader
          color="white"
          fontSize="2xl"
          borderBottom="1px solid rgba(255, 255, 255, 0.1)"
          py={4}
          px={6}
          bg="rgba(0, 0, 0, 0.2)"
        >
          {t('Settings')}
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              background: 'rgba(0, 0, 0, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
            },
          }}
          py={4}
          px={3}
        >
          <Accordion allowToggle defaultIndex={[3]} allowMultiple>
            <SettingsAccordionItem
              title={t('soundSettings')}
              icon={RiSoundModuleLine}
              color="pink.400"
              description={t(
                'soundSettingsDescription',
                'Customize sound effects throughout the app',
              )}
            >
              <SoundSettings />
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t('languageSettings')}
              icon={RiTranslate2}
              color="blue.400"
              description={t(
                'languageSettingsDescription',
                'Change the language of the application',
              )}
            >
              <LanguageSettings />
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t('notificationSettings')}
              icon={RiBellLine}
              color="purple.400"
              description={t(
                'notificationSettingsDescription',
                'Enable or disable browser notifications',
              )}
            >
              <NotificationSettings />
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t('notificationPreferences', 'Notification Preferences')}
              icon={RiNotification3Line}
              color="teal.400"
              description={t(
                'notificationPreferencesDescription',
                'Control which notifications you receive and how often',
              )}
            >
              <NotificationPreferences />
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t('profileVisibility.toggleVisibility', {
                ns: 'ToggleProfileVisibility',
              })}
              icon={RiEyeLine}
              color="orange.400"
              description={t(
                'profileVisibilityDescription',
                'Control what information is visible on your profile',
              )}
            >
              <ProfileVisibilitySettings />
            </SettingsAccordionItem>
          </Accordion>
        </ModalBody>

        <ModalFooter
          bg="rgba(0,0,0,0.2)"
          borderTop="1px solid rgba(255, 255, 255, 0.1)"
          justifyContent="center"
        >
          <Button
            onClick={onClose}
            size="lg"
            bg="rgba(49, 151, 149, 0.2)"
            color="teal.300"
            border="1px solid"
            borderColor="teal.500"
            _hover={{ bg: 'rgba(49, 151, 149, 0.3)' }}
            _active={{ bg: 'rgba(49, 151, 149, 0.4)' }}
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            transition="all 0.2s"
          >
            {t('close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const SettingsAccordionItem = ({
  title,
  icon,
  color,
  description,
  children,
}) => {
  return (
    <AccordionItem border="none" my={2}>
      {({ isExpanded }) => (
        <>
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
          >
            <AccordionButton
              bg={
                isExpanded
                  ? `rgba(255, 255, 255, 0.15)`
                  : 'rgba(255, 255, 255, 0.05)'
              }
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              p={4}
              borderRadius="md"
              transition="all 0.2s"
              borderLeft="4px solid"
              borderColor={isExpanded ? color : 'transparent'}
              boxShadow={isExpanded ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'}
            >
              <Flex w="100%" align="center">
                <Icon as={icon} color={color} boxSize={6} mr={3} />
                <Box textAlign="left">
                  <Text
                    color="white"
                    fontSize="lg"
                    fontWeight={isExpanded ? 'bold' : 'medium'}
                    transition="all 0.2s"
                  >
                    {title}
                  </Text>
                  {description && !isExpanded && (
                    <Text
                      color="whiteAlpha.700"
                      fontSize="sm"
                      mt={1}
                      display={{ base: 'none', md: 'block' }}
                    >
                      {description}
                    </Text>
                  )}
                </Box>
                <Box ml="auto">
                  <AccordionIcon color="white" boxSize={5} />
                </Box>
              </Flex>
            </AccordionButton>
          </MotionBox>

          <AccordionPanel
            pb={6}
            pt={4}
            px={{ base: 2, md: 4 }}
            bg="rgba(0, 0, 0, 0.2)"
            borderRadius="md"
            mt={1}
            borderLeft="2px solid"
            borderColor={color}
            boxShadow="inset 0 2px 4px rgba(0, 0, 0, 0.1)"
          >
            {children}
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  )
}

export default Settings
