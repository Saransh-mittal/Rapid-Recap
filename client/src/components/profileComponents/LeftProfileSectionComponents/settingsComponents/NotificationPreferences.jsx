import React, { useState, useEffect } from 'react'
import {
  VStack,
  Box,
  Text,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Switch,
  Flex,
  Spacer,
  Button,
  useToast,
  HStack,
  Divider,
  Select,
  Badge,
  Tooltip,
  Icon,
  ScaleFade,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  RiBellLine,
  RiGamepadLine,
  RiTrophyLine,
  RiFireLine,
  RiNewspaperLine,
} from 'react-icons/ri'

const MotionBox = motion(Box)

const NotificationPreferences = () => {
  const { t } = useTranslation('Settings')
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState({
    newsNotifications: {
      enabled: true,
      frequency: 5,
    },
    quickClashNotifications: {
      enabled: true,
      frequency: 'all',
    },
    tournamentNotifications: {
      enabled: true,
      frequency: 'all',
    },
    dailyStreakReminders: {
      enabled: true,
    },
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true)
        const { data } = await axios.get('/api/notify/preferences')
        setPreferences(data)
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error)
        toast({
          title: t('error', 'Error'),
          description: t(
            'failedToFetchPreferences',
            'Failed to fetch your notification preferences',
          ),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
  }, [toast, t])

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true)
      await axios.put('/api/notify/preferences', preferences)
      toast({
        title: t('success', 'Success'),
        description: t(
          'preferencesUpdated',
          'Your notification preferences have been updated',
        ),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      toast({
        title: t('error', 'Error'),
        description: t(
          'failedToUpdatePreferences',
          'Failed to update your notification preferences',
        ),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewsFrequencyChange = value => {
    setPreferences(prev => ({
      ...prev,
      newsNotifications: {
        ...prev.newsNotifications,
        frequency: value,
      },
    }))
  }

  const handleSwitchToggle = category => {
    setPreferences(prev => {
      const updatedPreferences = { ...prev }

      if (category === 'news') {
        updatedPreferences.newsNotifications.enabled =
          !prev.newsNotifications.enabled
      } else if (category === 'quickClash') {
        updatedPreferences.quickClashNotifications.enabled =
          !prev.quickClashNotifications.enabled
      } else if (category === 'tournament') {
        updatedPreferences.tournamentNotifications.enabled =
          !prev.tournamentNotifications.enabled
      } else if (category === 'dailyStreak') {
        updatedPreferences.dailyStreakReminders.enabled =
          !prev.dailyStreakReminders.enabled
      }

      return updatedPreferences
    })
  }

  const handleSelectChange = (category, value) => {
    setPreferences(prev => {
      const updatedPreferences = { ...prev }

      if (category === 'quickClash') {
        updatedPreferences.quickClashNotifications.frequency = value
      } else if (category === 'tournament') {
        updatedPreferences.tournamentNotifications.frequency = value
      }

      return updatedPreferences
    })
  }

  const getFrequencyBadge = category => {
    if (category === 'news') {
      const frequency = preferences.newsNotifications.frequency
      return (
        <Badge
          colorScheme={
            frequency < 3 ? 'green' : frequency < 7 ? 'blue' : 'purple'
          }
        >
          {frequency} {t('perDay', 'per day')}
        </Badge>
      )
    } else {
      const frequency =
        category === 'quickClash'
          ? preferences.quickClashNotifications.frequency
          : preferences.tournamentNotifications.frequency

      let colorScheme
      if (frequency === 'all') colorScheme = 'purple'
      else if (frequency === 'important') colorScheme = 'blue'
      else colorScheme = 'green'

      return <Badge colorScheme={colorScheme}>{t(frequency, frequency)}</Badge>
    }
  }

  if (isLoading) {
    return (
      <VStack spacing={6} align="center" my={8}>
        <Text color="white">{t('loading', 'Loading your preferences...')}</Text>
        <Box className="loader"></Box>
      </VStack>
    )
  }

  return (
    <VStack spacing={6} align="stretch" width="100%">
      {/* News Notifications */}
      <ScaleFade in={!isLoading} initialScale={0.9}>
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            bg="whiteAlpha.100"
            p={5}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="blue.400"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            transition="all 0.3s"
            _hover={{ boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)' }}
          >
            <Flex align="center" mb={3}>
              <Flex align="center">
                <Icon
                  as={RiNewspaperLine}
                  boxSize={5}
                  color="blue.400"
                  mr={2}
                />
                <Heading size="md" color="white">
                  {t('newsNotifications', 'News Notifications')}
                </Heading>
              </Flex>
              <Spacer />
              <Tooltip
                label={
                  preferences.newsNotifications.enabled
                    ? t('enabled', 'Enabled')
                    : t('disabled', 'Disabled')
                }
              >
                <Switch
                  isChecked={preferences.newsNotifications.enabled}
                  onChange={() => handleSwitchToggle('news')}
                  colorScheme="blue"
                  size="lg"
                />
              </Tooltip>
            </Flex>

            <Divider mb={4} />

            <Text color="gray.300" mb={3}>
              {t(
                'newsNotificationsDescription',
                'Control how many daily news and article recommendations you receive.',
              )}
            </Text>

            <Flex align="center" mb={1}>
              <Text color="white" fontWeight="medium">
                {t('frequency', 'Frequency')}
              </Text>
              <Spacer />
              {getFrequencyBadge('news')}
            </Flex>

            <Box pt={6} pb={2}>
              <Slider
                aria-label="news-frequency-slider"
                value={preferences.newsNotifications.frequency}
                min={0}
                max={10}
                step={1}
                onChange={handleNewsFrequencyChange}
                isDisabled={!preferences.newsNotifications.enabled}
                colorScheme="blue"
              >
                <SliderMark
                  value={0}
                  mt={2}
                  ml={-2}
                  fontSize="sm"
                  color="gray.400"
                >
                  0
                </SliderMark>
                <SliderMark
                  value={5}
                  mt={2}
                  ml={-2}
                  fontSize="sm"
                  color="gray.400"
                >
                  5
                </SliderMark>
                <SliderMark
                  value={10}
                  mt={2}
                  ml={-2}
                  fontSize="sm"
                  color="gray.400"
                >
                  10
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6} />
              </Slider>
            </Box>

            <Text color="gray.400" fontSize="sm" mt={2}>
              {t('currentlyReceiving', 'You currently receive')}{' '}
              {preferences.newsNotifications.frequency}{' '}
              {t('newsNotificationsPerDay', 'news notifications per day')}
            </Text>
          </Box>
        </MotionBox>
      </ScaleFade>

      {/* Quick Clash Notifications */}
      <ScaleFade in={!isLoading} initialScale={0.9} delay={0.1}>
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box
            bg="whiteAlpha.100"
            p={5}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="purple.400"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            transition="all 0.3s"
            _hover={{ boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)' }}
          >
            <Flex align="center" mb={3}>
              <Flex align="center">
                <Icon
                  as={RiGamepadLine}
                  boxSize={5}
                  color="purple.400"
                  mr={2}
                />
                <Heading size="md" color="white">
                  {t('quickClashNotifications', 'Quick Clash Notifications')}
                </Heading>
              </Flex>
              <Spacer />
              <Tooltip
                label={
                  preferences.quickClashNotifications.enabled
                    ? t('enabled', 'Enabled')
                    : t('disabled', 'Disabled')
                }
              >
                <Switch
                  isChecked={preferences.quickClashNotifications.enabled}
                  onChange={() => handleSwitchToggle('quickClash')}
                  colorScheme="purple"
                  size="lg"
                />
              </Tooltip>
            </Flex>

            <Divider mb={4} />

            <Text color="gray.300" mb={3}>
              {t(
                'quickClashNotificationsDescription',
                'Manage notifications about challenges, matches, and results from Quick Clash games.',
              )}
            </Text>

            <Flex align="center" mb={3}>
              <Text color="white" fontWeight="medium">
                {t('notificationLevel', 'Notification Level')}
              </Text>
              <Spacer />
              {getFrequencyBadge('quickClash')}
            </Flex>

            <Select
              value={preferences.quickClashNotifications.frequency}
              onChange={e => handleSelectChange('quickClash', e.target.value)}
              isDisabled={!preferences.quickClashNotifications.enabled}
              bg="whiteAlpha.200"
              borderColor="whiteAlpha.300"
              color="white"
            >
              <option value="all">{t('all', 'All Notifications')}</option>
              <option value="important">
                {t('important', 'Important Only')}
              </option>
              <option value="none">{t('none', 'None')}</option>
            </Select>

            <Text color="gray.400" fontSize="sm" mt={2}>
              {preferences.quickClashNotifications.frequency === 'all' &&
                t(
                  'quickClashAllDescription',
                  'You will receive all Quick Clash notifications including new challenges, updates, and results.',
                )}
              {preferences.quickClashNotifications.frequency === 'important' &&
                t(
                  'quickClashImportantDescription',
                  'You will only receive notifications about match results and time-sensitive updates.',
                )}
              {preferences.quickClashNotifications.frequency === 'none' &&
                t(
                  'quickClashNoneDescription',
                  'You will not receive any Quick Clash notifications.',
                )}
            </Text>
          </Box>
        </MotionBox>
      </ScaleFade>

      {/* Tournament Notifications */}
      <ScaleFade in={!isLoading} initialScale={0.9} delay={0.2}>
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box
            bg="whiteAlpha.100"
            p={5}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="teal.400"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            transition="all 0.3s"
            _hover={{ boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)' }}
          >
            <Flex align="center" mb={3}>
              <Flex align="center">
                <Icon as={RiTrophyLine} boxSize={5} color="teal.400" mr={2} />
                <Heading size="md" color="white">
                  {t('tournamentNotifications', 'Tournament Notifications')}
                </Heading>
              </Flex>
              <Spacer />
              <Tooltip
                label={
                  preferences.tournamentNotifications.enabled
                    ? t('enabled', 'Enabled')
                    : t('disabled', 'Disabled')
                }
              >
                <Switch
                  isChecked={preferences.tournamentNotifications.enabled}
                  onChange={() => handleSwitchToggle('tournament')}
                  colorScheme="teal"
                  size="lg"
                />
              </Tooltip>
            </Flex>

            <Divider mb={4} />

            <Text color="gray.300" mb={3}>
              {t(
                'tournamentNotificationsDescription',
                'Control notifications about tournament registrations, starts, and results.',
              )}
            </Text>

            <Flex align="center" mb={3}>
              <Text color="white" fontWeight="medium">
                {t('notificationLevel', 'Notification Level')}
              </Text>
              <Spacer />
              {getFrequencyBadge('tournament')}
            </Flex>

            <Select
              value={preferences.tournamentNotifications.frequency}
              onChange={e => handleSelectChange('tournament', e.target.value)}
              isDisabled={!preferences.tournamentNotifications.enabled}
              bg="whiteAlpha.200"
              borderColor="whiteAlpha.300"
              color="white"
            >
              <option value="all">{t('all', 'All Notifications')}</option>
              <option value="important">
                {t('important', 'Important Only')}
              </option>
              <option value="none">{t('none', 'None')}</option>
            </Select>

            <Text color="gray.400" fontSize="sm" mt={2}>
              {preferences.tournamentNotifications.frequency === 'all' &&
                t(
                  'tournamentAllDescription',
                  'You will receive all tournament-related notifications including registration reminders, start times, and results.',
                )}
              {preferences.tournamentNotifications.frequency === 'important' &&
                t(
                  'tournamentImportantDescription',
                  'You will only receive notifications about tournament starts, ends, and your results.',
                )}
              {preferences.tournamentNotifications.frequency === 'none' &&
                t(
                  'tournamentNoneDescription',
                  'You will not receive any tournament notifications.',
                )}
            </Text>
          </Box>
        </MotionBox>
      </ScaleFade>

      {/* Daily Streak Reminders */}
      <ScaleFade in={!isLoading} initialScale={0.9} delay={0.3}>
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Box
            bg="whiteAlpha.100"
            p={5}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="orange.400"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            transition="all 0.3s"
            _hover={{ boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)' }}
          >
            <Flex align="center" mb={3}>
              <HStack>
                <Icon as={RiFireLine} boxSize={5} color="orange.400" mr={2} />
                <Heading size="md" color="white">
                  {t('dailyStreakReminders', 'Daily Streak Reminders')}
                </Heading>
                <Tooltip
                  label={t(
                    'dailyStreakRemindersTooltip',
                    'These reminders help you maintain your daily streak by nudging you to complete quizzes.',
                  )}
                >
                  <InfoIcon color="orange.300" />
                </Tooltip>
              </HStack>
              <Spacer />
              <Switch
                isChecked={preferences.dailyStreakReminders.enabled}
                onChange={() => handleSwitchToggle('dailyStreak')}
                colorScheme="orange"
                size="lg"
              />
            </Flex>

            <Divider mb={4} />

            <Text color="gray.300">
              {t(
                'dailyStreakRemindersDescription',
                'Get reminders to maintain your daily streak and avoid losing your progress.',
              )}
            </Text>
          </Box>
        </MotionBox>
      </ScaleFade>

      <Button
        colorScheme="teal"
        size="lg"
        isLoading={isSaving}
        onClick={handleSavePreferences}
        mt={4}
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
        }}
        _active={{
          transform: 'translateY(0)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        transition="all 0.2s"
      >
        {t('savePreferences', 'Save Preferences')}
      </Button>
    </VStack>
  )
}

export default NotificationPreferences
