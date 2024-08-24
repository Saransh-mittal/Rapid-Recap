import React from 'react'
import GetStarted from '../Header-Footer/navbarComponents/GetStarted'
import { Button as ChakraButton } from '@chakra-ui/react'
import GuestLogin from '../authComponents/GuestLogin'
import Button from './ButtonComponent'
import SecureYourProgress from './SecureYourProgress'

const ButtonFactory = ({ actionType, onClick, innerText, ...props }) => {
  switch (actionType) {
    case 'SIGN_IN':
      return <GetStarted width={'150px'} innerText={innerText} />
    case 'GUEST':
      return <GuestLogin width={'150px'} />
    case 'VIEW_PROFILE':
      return (
        <Button onClick={onClick} {...props}>
          View Profile
        </Button>
      )
    case 'SECURE_YOUR_PROGRESS':
      return <SecureYourProgress />
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
      return (
        <ChakraButton onClick={onClick} {...props}>
          Default
        </ChakraButton>
      )
  }
}

export default ButtonFactory
