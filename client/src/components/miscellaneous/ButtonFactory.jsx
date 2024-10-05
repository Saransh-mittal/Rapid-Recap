import React from 'react'
import GetStarted from '../Header-Footer/navbarComponents/GetStarted'
import { Button as ChakraButton } from '@chakra-ui/react'
import GuestLogin from '../authComponents/GuestLogin'
import SecureYourProgress from './SecureYourProgress'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../LanguageSwitcher'

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

const ButtonFactory = ({
  actionType,
  onClick,
  innerText,
  GuestLoginTranslate,
  ...props
}) => {
  const { t } = useTranslation('ButtonFactory')

  switch (actionType) {
    case 'SIGN_IN':
      return (
        <GetStarted
          width={'150px'}
          innerText={innerText || t('SIGN_IN')}
          onClick={onClick}
        />
      )
    case 'LANGUAGE':
      return <LanguageSwitcher />
    case 'GUEST':
      return (
        <GuestLogin width={'150px'} onClick={onClick} t={GuestLoginTranslate} />
      )
    case 'VIEW_PROFILE':
      return (
        <ElegantButton onClick={onClick} {...props}>
          {t('VIEW_PROFILE')}
        </ElegantButton>
      )
    case 'REGISTER_TOURNAMENT':
      return (
        <ElegantButton onClick={onClick} {...props}>
          {t('REGISTER_TOURNAMENT')}
        </ElegantButton>
      )
    case 'VIEW_TOURNAMENT':
      return (
        <ElegantButton onClick={onClick} {...props}>
          {t('VIEW_TOURNAMENT')}
        </ElegantButton>
      )
    case 'SWITCH_TO_WEAK_MODE':
      return (
        <ElegantButton onClick={onClick} innerText {...props}>
          {innerText}
        </ElegantButton>
      )
    case 'STAY_IN_NORMAL_MODE':
      return (
        <ElegantButton onClick={onClick} innerText {...props}>
          {innerText}
        </ElegantButton>
      )
    case 'VIEW_EXPERIENCE':
      return (
        <ElegantButton onClick={onClick} {...props}>
          {t('VIEW_EXPERIENCE')}
        </ElegantButton>
      )
    case 'SUBMIT_STORY_FEEDBACK':
      return (
        <ElegantButton onClick={onClick} {...props}>
          {t('SUBMIT_FEEDBACK')}
        </ElegantButton>
      )
    case 'SUBMIT_QUIZ_FEEDBACK':
      return (
        <ElegantButton onClick={onClick} {...props}>
          {t('SUBMIT_QUIZ_FEEDBACK')}
        </ElegantButton>
      )
    case 'INBOX':
      return (
        <ElegantButton onClick={onClick} {...props}>
          {t('INBOX')}
        </ElegantButton>
      )
    case 'SECURE_YOUR_PROGRESS':
      return <SecureYourProgress padding={0} />
    case 'CONFIRM':
      return (
        <ChakraButton colorScheme="green" onClick={onClick} {...props}>
          {t('CONFIRM')}
        </ChakraButton>
      )
    case 'CANCEL':
      return (
        <ChakraButton colorScheme="red" onClick={onClick} {...props}>
          {t('CANCEL')}
        </ChakraButton>
      )
    case 'VIEW_ALL':
      return (
        <ChakraButton colorScheme="blue" onClick={onClick} {...props}>
          {t('VIEW_ALL')}
        </ChakraButton>
      )
    case 'DISMISS':
      return (
        <ChakraButton colorScheme="gray" onClick={onClick} {...props}>
          {t('DISMISS')}
        </ChakraButton>
      )
    case 'VIEW_REPORT':
      return (
        <ChakraButton colorScheme="blue" onClick={onClick} {...props}>
          {t('VIEW_REPORT')}
        </ChakraButton>
      )
    default:
      return null
  }
}

export default ButtonFactory
