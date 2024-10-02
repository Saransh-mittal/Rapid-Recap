import React from 'react'
import {
  Box,
  VStack,
  Text,
  Flex,
  Avatar,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)
const MotionText = motion(Text)

const TournamentOngoingMessage = ({ t, tournamentNumber }) => {
  console.log(tournamentNumber)
  const { isAuthenticated } = useSelector(state => state.auth)
  const { isRegistered, userStanding } = useSelector(state => state.tournament)

  const getMessage = () => {
    if (!isAuthenticated) {
      return t(
        'Embark on an epic journey! Join the tournament and rise to greatness.',
      )
    }
    if (isRegistered) {
      if (userStanding && userStanding.score > 0) {
        return t(
          'Your quest continues! Push forward and claim your place among legends.',
        )
      } else {
        return t(
          'Your adventure awaits! Begin your first challenge and carve your path to glory.',
        )
      }
    }
    return t(
      'A grand stage is set! Step into the arena and showcase your prowess.',
    )
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg="rgba(0, 0, 0, 0.6)"
      borderRadius="lg"
      p={4}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
    >
      <VStack align="stretch" spacing={4}>
        <Flex justifyContent="center" alignItems="center">
          <Badge colorScheme="purple" fontSize="md" px={2} py={1}>
            {t('Tournament')} {tournamentNumber}
          </Badge>
        </Flex>

        {userStanding && (
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Flex
              alignItems="center"
              justifyContent="space-between"
              bg="rgba(255, 255, 255, 0.1)"
              p={3}
              borderRadius="md"
            >
              <Flex alignItems="center">
                <Avatar
                  size="sm"
                  name={userStanding.name}
                  src={userStanding.pic}
                  mr={3}
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{userStanding.inGameName}</Text>
                  <Text fontSize="sm" color="gray.300">
                    {t('Rank')} #{userStanding.rank}
                  </Text>
                </VStack>
              </Flex>
              <Badge colorScheme="yellow" fontSize="lg">
                {userStanding.score}
              </Badge>
            </Flex>
          </MotionBox>
        )}

        <Divider borderColor="gray.600" />

        <MotionText
          fontStyle="italic"
          textAlign="center"
          color="gray.300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {getMessage()}
        </MotionText>
      </VStack>
    </MotionBox>
  )
}

export default TournamentOngoingMessage
