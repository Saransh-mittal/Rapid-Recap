// components/quickClashComponents/ConfirmationDialog.jsx
import React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Icon,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const MotionIcon = motion(Icon)

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Leave',
  cancelText = 'Stay',
  isDangerous = true,
}) => {
  const { t } = useTranslation('QuickClash')
  const cancelRef = React.useRef()

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
      motionPreset="scale"
    >
      <AlertDialogOverlay>
        <AlertDialogContent
          bg="rgba(26, 21, 39, 0.95)"
          borderWidth="1px"
          borderColor={isDangerous ? 'red.500' : 'purple.500'}
          borderRadius="xl"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.25)"
        >
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            color="white"
            borderBottomWidth="1px"
            borderBottomColor="whiteAlpha.200"
            pb={4}
          >
            <HStack>
              <MotionIcon
                as={AlertTriangle}
                color={isDangerous ? 'red.300' : 'yellow.400'}
                initial={{ rotate: -5 }}
                animate={{ rotate: 5 }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 0.5,
                }}
              />
              <Text>{title || t('Confirm Action')}</Text>
            </HStack>
          </AlertDialogHeader>

          <AlertDialogBody py={6}>
            <VStack align="start" spacing={4}>
              <Text color="whiteAlpha.900">{message}</Text>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="outline"
              _hover={{ bg: 'whiteAlpha.100' }}
              mr={3}
              color={'white'}
              fontSize={{ base: 'sm', md: 'md' }}
            >
              {cancelText}
            </Button>
            <Button
              colorScheme={isDangerous ? 'red' : 'purple'}
              onClick={() => {
                onConfirm()
                onClose()
              }}
              ml={3}
              fontSize={{ base: 'sm', md: 'md' }}
            >
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default ConfirmationDialog
