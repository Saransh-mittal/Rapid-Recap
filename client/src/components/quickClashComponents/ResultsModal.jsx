// components/quickClashComponents/ResultsModal.jsx
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
  VStack,
  Text,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, ArrowLeft } from 'lucide-react'

const MotionBox = motion(Box)

const ResultsModal = ({ isOpen, onClose, score, navigateToList }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
      motionPreset="scale"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="rgba(26, 21, 39, 0.95)"
        borderWidth="1px"
        borderColor="purple.500"
        borderRadius="xl"
        boxShadow="0 4px 20px rgba(138, 43, 226, 0.3)"
      >
        <ModalHeader color="white">
          <HStack>
            <Icon as={Trophy} color="yellow.400" />
            <Text>{t('Challenge Complete!')}</Text>
          </HStack>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              <Icon as={Trophy} boxSize="80px" color="yellow.400" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <VStack spacing={2} mt={4}>
                  <Text fontSize="lg" color="whiteAlpha.900">
                    {t('Your Score')}
                  </Text>
                  <Text
                    fontSize="5xl"
                    fontWeight="bold"
                    color="white"
                    bgGradient="linear(to-r, yellow.300, orange.400)"
                    bgClip="text"
                  >
                    {score}
                  </Text>
                </VStack>
              </motion.div>
            </MotionBox>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Alert
                status="info"
                variant="subtle"
                borderRadius="md"
                bg="rgba(66, 153, 225, 0.15)"
                borderLeftWidth="4px"
                borderLeftColor="blue.400"
              >
                <AlertIcon color="blue.400" />
                <Box>
                  <AlertTitle color="blue.200">
                    {t('Score Recorded!')}
                  </AlertTitle>
                  <AlertDescription color="whiteAlpha.900">
                    {t(
                      'Check back later to see the final results once your opponent completes the challenge.',
                    )}
                  </AlertDescription>
                </Box>
              </Alert>
            </motion.div>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            as={motion.button}
            onClick={navigateToList}
            bgGradient="linear(to-r, purple.500, purple.700)"
            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
            rightIcon={<ArrowLeft />}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('Return to Challenges')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ResultsModal
