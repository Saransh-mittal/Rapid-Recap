// ButtonFactory.jsx
import React from 'react'
import { Button as ChakraButton, Text, Flex, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ArrowForwardIcon,
  CheckIcon,
  InfoIcon,
  StarIcon,
  ViewIcon,
} from '@chakra-ui/icons'
import {
  Trophy,
  Calendar,
  Sword,
  Target,
  RefreshCw,
  MessageCircle,
} from 'lucide-react'

// Create motion button with Chakra
const MotionButton = motion(ChakraButton)

// Game-style button with animated hover effect
const GameButton = ({
  onClick,
  children,
  colorScheme = 'blue',
  leftIcon,
  rightIcon,
  ...props
}) => (
  <MotionButton
    onClick={onClick}
    bg={
      colorScheme === 'blue'
        ? 'linear-gradient(135deg, rgba(66, 153, 225, 0.9) 0%, rgba(49, 130, 206, 0.9) 100%)'
        : colorScheme === 'green'
        ? 'linear-gradient(135deg, rgba(72, 187, 120, 0.9) 0%, rgba(56, 161, 105, 0.9) 100%)'
        : colorScheme === 'purple'
        ? 'linear-gradient(135deg, rgba(159, 122, 234, 0.9) 0%, rgba(128, 90, 213, 0.9) 100%)'
        : colorScheme === 'orange'
        ? 'linear-gradient(135deg, rgba(237, 137, 54, 0.9) 0%, rgba(221, 107, 32, 0.9) 100%)'
        : 'linear-gradient(135deg, rgba(74, 85, 104, 0.9) 0%, rgba(45, 55, 72, 0.9) 100%)'
    }
    color="white"
    fontWeight="semibold"
    letterSpacing="wide"
    borderRadius="full"
    px={4}
    py={2}
    height="auto"
    fontSize="0.85rem"
    leftIcon={leftIcon}
    rightIcon={rightIcon}
    borderWidth="1px"
    borderColor="rgba(255, 255, 255, 0.15)"
    boxShadow="0 3px 8px rgba(0, 0, 0, 0.25)"
    textShadow="0 1px 2px rgba(0,0,0,0.2)"
    whileHover={{
      y: -2,
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.2 },
    }}
    whileTap={{
      y: 0,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      transition: { duration: 0.1 },
    }}
    _hover={{
      bg:
        colorScheme === 'blue'
          ? 'linear-gradient(135deg, rgba(66, 153, 225, 1) 0%, rgba(49, 130, 206, 1) 100%)'
          : colorScheme === 'green'
          ? 'linear-gradient(135deg, rgba(72, 187, 120, 1) 0%, rgba(56, 161, 105, 1) 100%)'
          : colorScheme === 'purple'
          ? 'linear-gradient(135deg, rgba(159, 122, 234, 1) 0%, rgba(128, 90, 213, 1) 100%)'
          : colorScheme === 'orange'
          ? 'linear-gradient(135deg, rgba(237, 137, 54, 1) 0%, rgba(221, 107, 32, 1) 100%)'
          : 'linear-gradient(135deg, rgba(74, 85, 104, 1) 0%, rgba(45, 55, 72, 1) 100%)',
    }}
    transition="all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    {...props}
  >
    {children}
  </MotionButton>
)

const ButtonFactory = ({
  actionType,
  path,
  onClick,
  innerText,
  GuestLoginTranslate,
  size = 'md',
  ...props
}) => {
  const { t } = useTranslation('ButtonFactory')
  const navigate = useNavigate()

  // Helper function to get button styling based on action type
  const getButtonProps = () => {
    switch (actionType) {
      case 'REGISTER_TOURNAMENT':
      case 'VIEW_TOURNAMENT':
        return {
          colorScheme: 'purple',
          leftIcon: <Icon as={Trophy} boxSize="1em" />,
        }

      case 'VIEW_EXPERIENCE':
        return {
          colorScheme: 'yellow',
          leftIcon: <StarIcon />,
        }

      case 'SUBMIT_STORY_FEEDBACK':
      case 'SUBMIT_QUIZ_FEEDBACK':
      case 'SUBMIT_TOURNAMENT_FEEDBACK':
        return {
          colorScheme: 'green',
          leftIcon: <CheckIcon />,
        }

      case 'VIEW_PROFILE':
        return {
          colorScheme: 'blue',
          leftIcon: <ViewIcon />,
        }

      case 'NAVIGATE':
        return {
          colorScheme: 'blue',
          rightIcon: <ArrowForwardIcon />,
        }

      case 'INBOX':
        return {
          colorScheme: 'blue',
          leftIcon: <Icon as={MessageCircle} boxSize="1em" />,
        }

      default:
        return {
          colorScheme: 'blue',
        }
    }
  }

  switch (actionType) {
    case 'NAVIGATE':
      return (
        <GameButton
          onClick={() => {
            navigate(path)
            onClick()
          }}
          size={size}
          {...getButtonProps()}
          {...props}
        >
          {innerText}
        </GameButton>
      )

    case 'SIGN_IN':
      return (
        <GameButton
          colorScheme="purple"
          size={size}
          onClick={onClick}
          {...props}
        >
          {innerText || t('SIGN_IN')}
        </GameButton>
      )

    case 'GUEST':
      return (
        <GameButton colorScheme="gray" size={size} onClick={onClick} {...props}>
          {innerText || t('LOGIN_AS_GUEST')}
        </GameButton>
      )

    case 'VIEW_ALL':
      return (
        <GameButton
          colorScheme="blue"
          onClick={onClick}
          size={size}
          leftIcon={<InfoIcon />}
          {...props}
        >
          {innerText || t('VIEW_ALL')}
        </GameButton>
      )

    case 'DISMISS':
      return (
        <GameButton colorScheme="gray" onClick={onClick} size={size} {...props}>
          {innerText || t('DISMISS')}
        </GameButton>
      )

    // Handle all other action types
    default:
      return (
        <GameButton
          onClick={onClick}
          innerText={innerText}
          size={size}
          {...getButtonProps()}
          {...props}
        >
          {innerText || t(actionType) || actionType}
        </GameButton>
      )
  }
}

export default ButtonFactory
