import React from 'react'
import {
  VStack,
  Alert,
  AlertIcon,
  Heading,
  Text,
  Button,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
}) => {
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.08)',
    'rgba(0, 0, 0, 0.3)',
  )
  const borderColor = useColorModeValue('pink.200', 'pink.700')

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
            {registrationStatus === 'not-registered' ? (
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
            )}
          </VStack>
        </MotionBox>
      )}
    </>
  )
}

export default RegistrationSection
