// components/tournamentComponents/TimeInfo.js
import { VStack, HStack, Box, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { formatDateLangTranslate } from '../../utils/helper.utils'

const MotionBox = motion(Box)

const TimeInfo = ({ tournamentData }) => {
  const startDate = formatDateLangTranslate(tournamentData.startDate)
  const endDate = formatDateLangTranslate(tournamentData.endDate)
  const startDateTime = new Date(tournamentData.startDate)
  const endDateTime = new Date(tournamentData.endDate)

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
              Starts
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {startDate}
            </Text>
            <Text fontSize="md">{startDateTime.toLocaleTimeString()}</Text>
          </VStack>
        </MotionBox>
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
            <Text fontSize="xl" fontWeight="bold">
              {endDate}
            </Text>
            <Text fontSize="md">{endDateTime.toLocaleTimeString()}</Text>
          </VStack>
        </MotionBox>
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
        >
          Join the epic quest for{' '}
          {Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60))} hours of
          glory!
        </Text>
      </MotionBox>
    </VStack>
  )
}

export default TimeInfo
