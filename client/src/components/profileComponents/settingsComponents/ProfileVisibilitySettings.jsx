// File: src/components/Settings/ProfileVisibilitySettings.js
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../../../redux/authSlice'
import axios from 'axios'
import {
  VStack,
  Box,
  Text,
  Button,
  useToast,
  Switch,
  Flex,
  Spacer,
  Tooltip,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { InfoOutlineIcon } from '@chakra-ui/icons'

const MotionBox = motion(Box)

const ProfileVisibilitySettings = () => {
  const { t } = useTranslation(['ToggleProfileVisibility'])
  const dispatch = useDispatch()
  const toast = useToast()
  const { user } = useSelector(state => state.auth)
  const isGuest = user.role === 'guest'

  const [profileVisibility, setProfileVisibility] = useState({
    fullProfile: user.profilePrivacy ? user.profilePrivacy.fullProfile : false,
    lineGraph: user.profilePrivacy ? user.profilePrivacy.lineGraph : false,
    barGraph: user.profilePrivacy ? user.profilePrivacy.barGraph : false,
    solvedQuizzes: user.profilePrivacy
      ? user.profilePrivacy.solvedQuizzes
      : false,
    society: user.profilePrivacy ? user.profilePrivacy.society : false,
    seasonAnalytics: user.profilePrivacy
      ? user.profilePrivacy.seasonAnalytics
      : false,
    tournamentAnalytics: user.profilePrivacy
      ? user.profilePrivacy.tournamentAnalytics
      : false,
  })

  const [isLoading, setIsLoading] = useState(false)

  const bgColor = useColorModeValue('whiteAlpha.200', 'blackAlpha.300')
  const hoverBgColor = useColorModeValue('whiteAlpha.300', 'blackAlpha.400')

  const handleToggleVisibility = key => {
    if (key === 'fullProfile') {
      const isFullProfileVisible = !profileVisibility[key]
      setProfileVisibility(prev => ({
        ...prev,
        fullProfile: isFullProfileVisible,
        lineGraph: isFullProfileVisible,
        barGraph: isFullProfileVisible,
        solvedQuizzes: isFullProfileVisible,
        society: isFullProfileVisible,
        seasonAnalytics: isFullProfileVisible,
        tournamentAnalytics: isFullProfileVisible,
      }))
    } else {
      setProfileVisibility(prev => ({
        ...prev,
        [key]: !prev[key],
      }))
    }
  }

  const handleSaveProfileVisibility = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        '/api/user/profilePrivacy',
        profileVisibility,
      )
      if (response.status === 200) {
        toast({
          title: t('success'),
          description: t('profileVisibility.savedSuccessfully'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
        dispatch(setUser({ ...user, profilePrivacy: profileVisibility }))
      }
    } catch (error) {
      console.error(error)
      toast({
        title: t('error'),
        description: t('profileVisibility.errorSaving'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box
        maxH={{ base: '60vh', md: '50vh' }}
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
          },
        }}
      >
        <VStack spacing={4}>
          {Object.entries(profileVisibility)
            .filter(
              ([key]) =>
                !isGuest || ['fullProfile', 'solvedQuizzes'].includes(key),
            )
            .map(([key, value]) => (
              <MotionBox
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                w="100%"
              >
                <Flex
                  align="center"
                  bg={bgColor}
                  p={4}
                  borderRadius="md"
                  _hover={{ bg: hoverBgColor }}
                  transition="background 0.2s"
                >
                  <Box>
                    <Text color="white" fontWeight="medium" fontSize="lg">
                      {t(`profileVisibility.${key}`)}
                    </Text>
                  </Box>
                  <Spacer />
                  <Flex align="center">
                    <Tooltip
                      label={value ? t('visible') : t('hidden')}
                      placement="top"
                    >
                      <Switch
                        isChecked={value}
                        onChange={() => handleToggleVisibility(key)}
                        colorScheme="teal"
                        size="lg"
                      />
                    </Tooltip>
                  </Flex>
                </Flex>
              </MotionBox>
            ))}
        </VStack>
      </Box>
      <Button
        onClick={handleSaveProfileVisibility}
        isLoading={isLoading}
        colorScheme="teal"
        size="lg"
        w="100%"
        mt={4}
      >
        {t('save')}
      </Button>
    </VStack>
  )
}

export default ProfileVisibilitySettings
