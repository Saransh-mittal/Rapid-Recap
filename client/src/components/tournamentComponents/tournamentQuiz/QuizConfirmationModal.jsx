import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useColorModeValue,
  Text,
} from '@chakra-ui/react'

const QuizConfirmationModal = ({ isOpen, onClose, onConfirm, category }) => {
  // Use color modes for light/dark theme switching
  const modalBg = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('black', 'white')
  const headerColor = useColorModeValue('gray.800', 'pink.300')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={modalBg} color={textColor}>
        <ModalHeader borderBottom="1px solid" borderColor={headerColor}>
          Confirm Quiz Start
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Are you sure you want to start the quiz in the{' '}
            <Text as="span" fontWeight="bold" color="pink.300">
              {category}
            </Text>{' '}
            category?
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="gray" variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="pink" onClick={onConfirm}>
            Start Quiz
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default QuizConfirmationModal
