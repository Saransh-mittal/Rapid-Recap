import React from 'react'
import GetStarted from '../Header-Footer/navbarComponents/GetStarted'
import { Button as ChakraButton } from '@chakra-ui/react'
import GuestLogin from '../authComponents/GuestLogin'
import Button from './ButtonComponent'
import SecureYourProgress from './SecureYourProgress'

const ElegantButton = ({ onClick, children }) => (
  <ChakraButton
    onClick={onClick}
    bg="linear-gradient(135deg, #4a5568 0%, #2d3748 100%)"
    color="white"
    fontWeight="semibold"
    letterSpacing="wide"
    borderRadius="full"
    px={6}
    py={3}
    _hover={{
      bg: 'linear-gradient(135deg, #4a5568 0%, #3a4a5e 100%)',
      boxShadow: '0 0 15px rgba(74, 85, 104, 0.4)',
      transform: 'translateY(-2px)',
    }}
    _active={{
      bg: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
      boxShadow: 'inset 0 3px 5px rgba(0, 0, 0, 0.2)',
      transform: 'translateY(0)',
    }}
    transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    textTransform="uppercase"
    fontSize="sm"
    border="1px solid"
    borderColor="gray.600"
    boxShadow="0 0 10px rgba(74, 85, 104, 0.2)"
  >
    {children}
  </ChakraButton>
)

const ButtonFactory = ({ actionType, onClick, innerText, ...props }) => {
  switch (actionType) {
    case 'SIGN_IN':
      return (
        <GetStarted width={'150px'} innerText={innerText} onClick={onClick} />
      )
    case 'GUEST':
      return <GuestLogin width={'150px'} onClick={onClick} />
    case 'VIEW_PROFILE':
      return (
        <ElegantButton onClick={onClick} {...props}>
          View Profile
        </ElegantButton>
      )
    case 'VIEW_EXPERIENCE':
      return (
        <ElegantButton onClick={onClick} {...props}>
          View Experience
        </ElegantButton>
      )
    case 'INBOX':
      return (
        <ElegantButton onClick={onClick} {...props}>
          Inbox
        </ElegantButton>
      )
    case 'SECURE_YOUR_PROGRESS':
      return <SecureYourProgress padding={0} />
    case 'CONFIRM':
      return (
        <ChakraButton colorScheme="green" onClick={onClick} {...props}>
          Confirm
        </ChakraButton>
      )
    case 'CANCEL':
      return (
        <ChakraButton colorScheme="red" onClick={onClick} {...props}>
          Cancel
        </ChakraButton>
      )
    case 'VIEW_ALL':
      return (
        <ChakraButton colorScheme="blue" onClick={onClick} {...props}>
          View All
        </ChakraButton>
      )
    case 'DISMISS':
      return (
        <ChakraButton colorScheme="gray" onClick={onClick} {...props}>
          Dismiss
        </ChakraButton>
      )
    default:
      return null
  }
}

export default ButtonFactory
