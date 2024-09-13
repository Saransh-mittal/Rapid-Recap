import React, { useMemo } from 'react'
import { VStack, HStack, Box, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { formatDate, formatLocalDateTime } from '../../utils/helper.utils'
import i18n from 'i18next'

const MotionBox = motion(Box)

const TimeInfo = ({ tournamentData }) => {
  const { t } = useTranslation('TimeInfo') // Translation hook for this component
  const lang = i18n.language // Get the current language from i18n

  // Memoize date and time computations to avoid recalculations
  const dateMapStart = useMemo(
    () => ({
      registration: tournamentData?.registrationStartDate,
      upcoming: tournamentData?.startDate,
      ongoing: tournamentData?.startDate, // Adjust this to the correct date field
      completed: null, // Adjust this to the correct date field
    }),
    [tournamentData],
  )

  const dateMapEnd = useMemo(
    () => ({
      registration: tournamentData?.registrationEndDate,
      upcoming: null,
      ongoing: tournamentData?.endDate, // Adjust this to the correct date field
      completed: null, // Adjust this to the correct date field
    }),
    [tournamentData],
  )

  const startDate = useMemo(
    () => formatDate(dateMapStart[tournamentData?.status], lang),
    [dateMapStart, tournamentData?.status, lang],
  )
  const endDate = useMemo(
    () => formatDate(dateMapEnd[tournamentData?.status], lang),
    [dateMapEnd, tournamentData?.status, lang],
  )

  const startDateTime = useMemo(
    () => formatLocalDateTime(dateMapStart[tournamentData?.status]),
    [dateMapStart, tournamentData?.status],
  )
  const endDateTime = useMemo(
    () => formatLocalDateTime(dateMapEnd[tournamentData?.status]),
    [dateMapEnd, tournamentData?.status],
  )

  const statusTextMap = useMemo(
    () => ({
      registration: t('starts'),
      upcoming: t('startsAt'),
      ongoing: t('starts'), // Adjust as needed
      completed: '', // Adjust as needed
    }),
    [t],
  )

  const statusText = useMemo(
    () => statusTextMap[tournamentData?.status] || t('startsAt'),
    [statusTextMap, tournamentData?.status, t],
  )

  if (tournamentData?.status === 'completed') return null

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={4} justify="center">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VStack
            bg="rgba(237, 100, 166, 0.1)"
            p={4}
            rounded="lg"
            shadow="md"
            borderWidth={1}
            borderColor="pink.400"
          >
            <Text fontSize="sm" fontWeight="bold" color="pink.400">
              {statusText}
            </Text>
            <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold">
              {startDate}
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }}>{startDateTime}</Text>
          </VStack>
        </MotionBox>

        {tournamentData?.status !== 'upcoming' && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <VStack
              bg="rgba(237, 100, 166, 0.1)"
              p={4}
              rounded="lg"
              shadow="md"
              borderWidth={1}
              borderColor="pink.400"
            >
              <Text fontSize="sm" fontWeight="bold" color="pink.400">
                {t('ends')}
              </Text>
              <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold">
                {endDate}
              </Text>
              <Text fontSize={{ base: 'sm', md: 'md' }}>{endDateTime}</Text>
            </VStack>
          </MotionBox>
        )}
      </HStack>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Text
          fontSize="lg"
          textAlign="center"
          fontStyle="italic"
          color="gray.300"
          py={4}
        >
          {t('questDescription')}
        </Text>
      </MotionBox>
    </VStack>
  )
}

export default TimeInfo
