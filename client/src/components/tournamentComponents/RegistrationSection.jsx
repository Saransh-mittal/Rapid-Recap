import React from 'react'
import {
  VStack,
  Alert,
  AlertIcon,
  Heading,
  Text,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import RegistrationForm from './RegistrationForm'
import RegisteredUsersCount from './RegisteredUsersCount'

const MotionBox = motion(Box)

const RegistrationSection = ({
  tournamentData,
  registrationStatus,
  handleRegister,
  userDetails,
  registerLoading,
  isAuthenticated,
  userRole,
}) => {
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.08)',
    'rgba(0, 0, 0, 0.3)',
  )
  const borderColor = useColorModeValue('pink.200', 'pink.700')

  const renderContent = () => {
    if (!isAuthenticated || userRole === 'guest') {
      return (
        <Box
          bg={bgColor}
          borderRadius="lg"
          p={6}
          borderWidth={2}
          borderColor={borderColor}
          boxShadow="0px 4px 10px rgba(237, 100, 166, 0.3)"
        >
          <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="lg"
            p={4}
            bg="blue.800"
            color="white"
          >
            <AlertIcon boxSize="40px" mr={0} color="blue.300" />
            <Text fontWeight="bold" fontSize="xl" mt={4} mb={2}>
              Exclusive Tournament Access
            </Text>
            <Text>
              To participate in this epic battle of wits, you need to be logged
              in with a verified email account.
            </Text>
            <Text mt={2}>
              Join our community of knowledge warriors and prove your mettle!
            </Text>
          </Alert>
        </Box>
      )
    }

    return registrationStatus === 'not-registered' ? (
      <RegistrationForm
        onRegister={handleRegister}
        registerLoading={registerLoading}
      />
    ) : (
      <VStack spacing={4} align="stretch">
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          p={4}
          bg="green.800"
          color="white"
        >
          <AlertIcon boxSize="40px" mr={0} color="green.300" />
          <Text fontWeight="bold" fontSize="xl" mt={4} mb={2}>
            Registration Successful!
          </Text>
          <Text>Prepare for an epic battle of wits!</Text>
        </Alert>
        <Box
          bg={bgColor}
          borderRadius="lg"
          p={4}
          borderWidth={2}
          borderColor={borderColor}
        >
          <Text fontWeight="semibold" mb={2}>
            Your Tournament Details:
          </Text>
          <Text>In-Game-Name: {userDetails?.inGameName}</Text>
          <Text textTransform={'capitalize'}>
            Selected Categories: {userDetails?.categories?.join(', ')}
          </Text>
        </Box>
      </VStack>
    )
  }

  return (
    <>
      {tournamentData?.status === 'registration' && (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={6} align="stretch">
            <Heading size={{ base: 'md', md: 'lg' }} mt={4} color="pink.400">
              Tournament Registration
            </Heading>
            <RegisteredUsersCount count={tournamentData.registeredCount} />
            {renderContent()}
          </VStack>
        </MotionBox>
      )}
    </>
  )
}

export default RegistrationSection
