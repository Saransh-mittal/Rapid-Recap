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
  Text,
  VStack,
  Box,
  Flex,
  useTheme,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const QuizConfirmationModal = ({ isOpen, onClose, onConfirm, category }) => {
  const { t } = useTranslation('InstructionModal')
  const theme = useTheme()

  const instructions = t('instructions', { returnObjects: true })

  const modalBg = `linear(to-br, ${theme.colors.gray[900]}, ${theme.colors.purple[900]})`
  const textColor = 'white'
  const headerColor = 'pink.300'
  const headingColor = 'purple.200'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />
      <ModalContent
        as={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        bgGradient={modalBg}
        color={textColor}
        borderRadius="3xl"
        overflow="hidden"
        boxShadow="0 0 40px rgba(255, 0, 234, 0.3)"
        p={0}
      >
        <ModalHeader
          borderBottom="1px solid"
          borderColor={headerColor}
          textAlign="center"
          color={headerColor}
          fontWeight="bold"
          py={3}
        >
          <Text fontSize="4xl" color={headerColor}>
            {t('quizInstructions')}
          </Text>
        </ModalHeader>
        <ModalCloseButton color={textColor} />
        <ModalBody p={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              Are you sure you want to start the quiz in the{' '}
              <Text as="span" color="pink.300">
                {category}
              </Text>{' '}
              category?
            </Text>

            <Text
              fontStyle="italic"
              fontWeight="bold"
              mb={4}
              textAlign="center"
            >
              {t('readInstructions')}
            </Text>

            {Array.isArray(instructions) &&
              instructions.map((instruction, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  bg="rgba(255, 255, 255, 0.05)"
                  p={3}
                  borderRadius="xl"
                  boxShadow="inner"
                >
                  <Flex align="center">
                    <Box
                      as="span"
                      fontWeight="bold"
                      fontSize="md"
                      color={headingColor}
                      mr={3}
                    >
                      {index + 1}.
                    </Box>
                    <Text
                      fontSize="md"
                      fontWeight={'semibold'}
                      color={textColor}
                    >
                      {instruction}
                    </Text>
                  </Flex>
                </MotionBox>
              ))}
          </VStack>
        </ModalBody>

        <ModalFooter
          bg="rgba(0, 0, 0, 0.3)"
          justifyContent="space-between"
          p={6}
        >
          <Button
            onClick={onClose}
            bg="rgba(255, 255, 255, 0.1)"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
          >
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
