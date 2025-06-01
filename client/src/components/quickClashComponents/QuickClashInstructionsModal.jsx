// components/quickClashComponents/QuickClashInstructionsModal.jsx
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  Button,
  Icon,
  HStack,
  Flex,
  useBreakpointValue,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  BrainCog,
  Clock,
  Award,
  Star,
  Lightbulb,
  ArrowRight,
  Book,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const QuickClashInstructionsModal = ({ isOpen, onClose, onStart }) => {
  const { t } = useTranslation('QuickClash')
  const isSmallScreen = useBreakpointValue({ base: true, md: false })

  const handleStart = () => {
    onClose()
    onStart()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      closeOnOverlayClick={false}
      closeOnEsc={true}
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent
        bg="rgba(26, 32, 44, 0.95)"
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor="purple.500"
        borderRadius="xl"
        maxH="90vh"
        overflow="hidden"
      >
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={BrainCog} color="yellow.400" boxSize={6} />
            <Text
              bgGradient="linear(to-r, yellow.400, orange.300)"
              bgClip="text"
              fontWeight="bold"
              fontSize={{ base: 'lg', md: 'xl' }}
            >
              {t('Quick Clash Challenge Instructions')}
            </Text>
          </HStack>
        </ModalHeader>

        <ModalCloseButton
          color="whiteAlpha.700"
          _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
        />

        <ModalBody pb={6} overflowY="auto">
          <VStack spacing={6} align="stretch">
            <Text
              color="gray.300"
              fontSize={{ base: 'sm', md: 'md' }}
              textAlign="center"
            >
              {t(
                'This challenge has two phases: Reading and Quiz. Master both to win!',
              )}
            </Text>

            {/* Reading Phase Section */}
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <HStack mb={3}>
                <Icon as={Book} color="blue.400" boxSize={5} />
                <Heading size="md" color="blue.300">
                  {t('Phase 1: Reading')}
                </Heading>
              </HStack>

              <Flex wrap="wrap" justifyContent="space-between" gap={3} mb={4}>
                <Box
                  bg="rgba(66, 153, 225, 0.1)"
                  p={3}
                  borderRadius="md"
                  flex="1"
                  minW={{ base: '45%', md: '140px' }}
                  border="1px solid"
                  borderColor="blue.700"
                  textAlign="center"
                >
                  <VStack spacing={2}>
                    <Icon as={Clock} color="blue.400" boxSize={6} />
                    <Text fontWeight="medium" color="white" fontSize="sm">
                      {t('Time Limit')}
                    </Text>
                    <Text color="blue.300" fontSize="lg" fontWeight="bold">
                      2 {t('minutes')}
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="rgba(66, 153, 225, 0.1)"
                  p={3}
                  borderRadius="md"
                  flex="1"
                  minW={{ base: '45%', md: '140px' }}
                  border="1px solid"
                  borderColor="blue.700"
                  textAlign="center"
                >
                  <VStack spacing={2}>
                    <Icon as={Book} color="blue.400" boxSize={6} />
                    <Text fontWeight="medium" color="white" fontSize="sm">
                      {t('Task')}
                    </Text>
                    <Text color="blue.300" fontSize="lg" fontWeight="bold">
                      {t('Read & Understand')}
                    </Text>
                  </VStack>
                </Box>
              </Flex>

              <Box
                bg="rgba(66, 153, 225, 0.05)"
                borderRadius="lg"
                p={4}
                borderLeft="4px solid"
                borderColor="blue.400"
              >
                <HStack align="flex-start" spacing={3}>
                  <Icon as={Lightbulb} color="blue.400" boxSize={4} mt={1} />
                  <Box>
                    <Text
                      fontWeight="medium"
                      color="blue.200"
                      mb={2}
                      fontSize="sm"
                    >
                      {t('Reading Tips')}:
                    </Text>
                    <UnorderedList
                      color="gray.300"
                      spacing={1}
                      pl={2}
                      fontSize="sm"
                    >
                      <ListItem>
                        {t('Pay attention to key facts and details')}
                      </ListItem>
                      <ListItem>
                        {t('Note important concepts for questions')}
                      </ListItem>
                      <ListItem>{t('You can finish early if ready')}</ListItem>
                    </UnorderedList>
                  </Box>
                </HStack>
              </Box>
            </MotionBox>

            <Divider borderColor="whiteAlpha.300" />

            {/* Quiz Phase Section */}
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <HStack mb={3}>
                <Icon as={Award} color="yellow.400" boxSize={5} />
                <Heading size="md" color="yellow.300">
                  {t('Phase 2: Quiz')}
                </Heading>
              </HStack>

              <Flex wrap="wrap" justifyContent="space-between" gap={2} mb={4}>
                <Box
                  bg="rgba(255, 255, 255, 0.05)"
                  p={3}
                  borderRadius="md"
                  flex="1"
                  minW={{ base: '30%', md: '100px' }}
                  border="1px solid"
                  borderColor="yellow.700"
                  textAlign="center"
                >
                  <VStack spacing={1}>
                    <Icon as={Clock} color="yellow.400" boxSize={5} />
                    <Text fontWeight="medium" color="white" fontSize="xs">
                      {t('Time')}
                    </Text>
                    <Text color="yellow.300" fontSize="md" fontWeight="bold">
                      50s
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="rgba(255, 255, 255, 0.05)"
                  p={3}
                  borderRadius="md"
                  flex="1"
                  minW={{ base: '30%', md: '100px' }}
                  border="1px solid"
                  borderColor="yellow.700"
                  textAlign="center"
                >
                  <VStack spacing={1}>
                    <Icon as={Award} color="yellow.400" boxSize={5} />
                    <Text fontWeight="medium" color="white" fontSize="xs">
                      {t('Questions')}
                    </Text>
                    <Text color="yellow.300" fontSize="md" fontWeight="bold">
                      5
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="rgba(255, 255, 255, 0.05)"
                  p={3}
                  borderRadius="md"
                  flex="1"
                  minW={{ base: '30%', md: '100px' }}
                  border="1px solid"
                  borderColor="yellow.700"
                  textAlign="center"
                >
                  <VStack spacing={1}>
                    <Icon as={Star} color="yellow.400" boxSize={5} />
                    <Text fontWeight="medium" color="white" fontSize="xs">
                      {t('Scoring')}
                    </Text>
                    <Text color="yellow.300" fontSize="xs" textAlign="center">
                      {t('Speed + Accuracy')}
                    </Text>
                  </VStack>
                </Box>
              </Flex>

              <Box
                bg="rgba(255, 255, 255, 0.03)"
                borderRadius="lg"
                p={4}
                borderLeft="4px solid"
                borderColor="yellow.400"
              >
                <HStack align="flex-start" spacing={3}>
                  <Icon as={Lightbulb} color="yellow.400" boxSize={4} mt={1} />
                  <Box>
                    <Text
                      fontWeight="medium"
                      color="yellow.200"
                      mb={2}
                      fontSize="sm"
                    >
                      {t('Quiz Tips')}:
                    </Text>
                    <UnorderedList
                      color="gray.300"
                      spacing={1}
                      pl={2}
                      fontSize="sm"
                    >
                      <ListItem>{t('Read each question carefully')}</ListItem>
                      <ListItem>
                        {t('Use navigation to move between questions')}
                      </ListItem>
                      <ListItem>
                        {t('You can review answers before submitting')}
                      </ListItem>
                    </UnorderedList>
                  </Box>
                </HStack>
              </Box>
            </MotionBox>

            {/* Action Buttons */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <HStack spacing={3} justify="center" pt={2}>
                <Button
                  variant="ghost"
                  colorScheme="whiteAlpha"
                  onClick={onClose}
                  size="md"
                >
                  {t('Cancel')}
                </Button>

                <MotionButton
                  colorScheme="yellow"
                  size="md"
                  onClick={handleStart}
                  px={8}
                  rightIcon={<ArrowRight size={18} />}
                  whileHover={{ transform: 'translateY(-1px)' }}
                  whileTap={{ transform: 'translateY(0)' }}
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  _hover={{ bgGradient: 'linear(to-r, blue.500, purple.600)' }}
                  _active={{ bgGradient: 'linear(to-r, blue.600, purple.700)' }}
                  boxShadow="0 4px 15px rgba(66, 153, 225, 0.4)"
                >
                  {t('Start Challenge')}
                </MotionButton>
              </HStack>
            </MotionBox>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default QuickClashInstructionsModal
