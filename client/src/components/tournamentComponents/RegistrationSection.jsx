import React from 'react'
import {
  VStack,
  Alert,
  AlertIcon,
  Heading,
  Text,
  Box,
  useColorModeValue,
  Flex,
  Badge,
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
  const textColor = useColorModeValue('gray.800', 'white')
  const headingColor = useColorModeValue('cyan.300', 'cyan.200')
  const labelColor = useColorModeValue('pink.300', 'pink.200')
  const valueColor = useColorModeValue('yellow.300', 'yellow.200')

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
                  p={6}
                  borderWidth={2}
                  borderColor={borderColor}
                  boxShadow="md"
                >
                  <Heading size="md" mb={4} color={headingColor}>
                    Your Tournament Details:
                  </Heading>
                  <VStack align="start" spacing={3}>
                    <Flex align="center">
                      <Text fontWeight="semibold" mr={2} color={labelColor}>
                        In-Game-Name:
                      </Text>
                      <Text color={valueColor}>{userDetails?.inGameName}</Text>
                    </Flex>
                    <Box>
                      <Text fontWeight="semibold" mb={2} color={labelColor}>
                        Selected Categories:
                      </Text>
                      <Flex flexWrap="wrap" gap={2}>
                        {userDetails?.categories?.map((category, index) => (
                          <Badge
                            key={index}
                            colorScheme="purple"
                            variant="solid"
                            fontSize="sm"
                            textTransform="capitalize"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {category}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  </VStack>
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
