import React, { useMemo } from 'react'
import { VStack, HStack, Box, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  formatDateLangTranslate,
  formatLocalDateTime,
} from '../../utils/helper.utils'

const MotionBox = motion(Box)

const TimeInfo = ({ tournamentData }) => {
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
    () => formatDateLangTranslate(dateMapStart[tournamentData?.status]),
    [dateMapStart, tournamentData?.status],
  )
  const endDate = useMemo(
    () => formatDateLangTranslate(dateMapEnd[tournamentData?.status]),
    [dateMapEnd, tournamentData?.status],
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
      registration: 'Starts',
      upcoming: 'Starts At',
      ongoing: 'Starts', // Adjust as needed
      completed: '', // Adjust as needed
    }),
    [],
  )

  const statusText = useMemo(
    () => statusTextMap[tournamentData?.status] || 'Starts At',
    [statusTextMap, tournamentData?.status],
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
                Ends
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
          Join the epic quest for 48 hrs of glory!
        </Text>
      </MotionBox>
    </VStack>
  )
}

export default TimeInfo
