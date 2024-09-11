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
  VStack,
  Box,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const QuizConfirmationModal = ({ isOpen, onClose, onConfirm, category }) => {
  const { t } = useTranslation('InstructionModal')

  // Use color modes for light/dark theme switching
  const modalBg = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('black', 'white')
  const headerColor = useColorModeValue('gray.800', 'pink.300')
  const headingColor = useColorModeValue('purple.600', 'purple.200')

  const instructions = t('instructions', { returnObjects: true })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={modalBg} color={textColor}>
        <ModalHeader borderBottom="1px solid" borderColor={headerColor}>
          {t('quizInstructions')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="bold">
              Are you sure you want to start the quiz in the{' '}
              <Text as="span" color="pink.300">
                {category}
              </Text>{' '}
              category?
            </Text>

            <Text fontStyle="italic" fontWeight="bold" mb={4}>
              {t('readInstructions')}
            </Text>
            {Array.isArray(instructions) &&
              instructions.map((instruction, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Flex align="center">
                    <Box
                      as="span"
                      fontWeight="bold"
                      fontSize="lg"
                      color={headingColor}
                      mr={3}
                    >
                      {index + 1}.
                    </Box>
                    <Text
                      fontSize="lg"
                      fontWeight={'semibold'}
                      mb={0}
                      color={textColor}
                    >
                      {instruction}
                    </Text>
                  </Flex>
                </MotionBox>
              ))}
          </VStack>
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
