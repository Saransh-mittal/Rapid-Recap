// components/tournamentComponents/RegistrationSection.js
import {
  VStack,
  Alert,
  AlertIcon,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react'
import RegistrationForm from './RegistrationForm'

const RegistrationSection = ({
  tournamentData,
  registrationStatus,
  handleRegister,
  userDetails,
}) => {
  return (
    <>
      {tournamentData?.status === 'registration' && (
        <>
          <Heading size="lg" mb={4}>
            Registration Open
          </Heading>
          {registrationStatus === 'not-registered' ? (
            <RegistrationForm onRegister={handleRegister} />
          ) : (
            <VStack spacing={4} align="stretch">
              <Alert status="success" color="black">
                <AlertIcon />
                Successfully registered! The tournament will begin soon.
              </Alert>
              <Text>Username: {userDetails?.username}</Text>
              <Text>
                Selected Categories: {userDetails?.categories.join(', ')}
              </Text>
            </VStack>
          )}
        </>
      )}
    </>
  )
}

export default RegistrationSection
