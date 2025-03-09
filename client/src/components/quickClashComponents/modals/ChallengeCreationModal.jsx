import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  Text,
  Avatar,
  HStack,
  Box,
  Flex,
  Badge,
  Icon,
  ModalHeader,
  ModalCloseButton,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Swords, ScrollText, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionIcon = motion(Icon)

const ChallengeCreationModal = ({
  isOpen,
  opponent,
  categories,
  onClose,
  error = null,
}) => {
  const { t } = useTranslation('QuickClash')

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent
          bg="linear-gradient(to bottom, #2d1b54, #1a1527)"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="red.500"
          p={4}
          maxW="450px"
        >
          <ModalHeader>
            <ModalCloseButton color="white" />
          </ModalHeader>
          <ModalBody>
            <VStack spacing={6} py={4}>
              <Icon as={AlertCircle} boxSize={16} color="red.400" />

              <Text
                fontSize="xl"
                fontWeight="bold"
                color="white"
                textAlign="center"
              >
                {t('Challenge Creation Failed')}
              </Text>

              <Text color="whiteAlpha.800" textAlign="center">
                {error}
              </Text>

              <Button colorScheme="purple" onClick={onClose}>
                {t('Back to Matchmaking')}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="linear-gradient(to bottom, #2d1b54, #1a1527)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="purple.500"
        p={4}
        maxW="450px"
      >
        <ModalHeader>
          <ModalCloseButton color="white" />
        </ModalHeader>
        <ModalBody>
          <VStack spacing={6} py={4}>
            {/* Header with swords animation */}
            <MotionIcon
              as={Swords}
              boxSize={16}
              color="purple.400"
              animate={{
                rotate: [0, 10, -10, 0],
                transition: { repeat: Infinity, duration: 4 },
              }}
            />

            <Text
              fontSize="xl"
              fontWeight="bold"
              color="white"
              textAlign="center"
            >
              {t('Creating Your Challenge')}
            </Text>

            {/* Opponent info */}
            {opponent && (
              <HStack
                p={4}
                bg="whiteAlpha.100"
                borderRadius="lg"
                spacing={4}
                w="full"
              >
                <Avatar name={opponent.name} src={opponent.pic} size="md" />
                <Box>
                  <Text fontWeight="bold" color="white">
                    {opponent.inGameName || opponent.name}
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    {t('Your opponent')}
                  </Text>
                </Box>
              </HStack>
            )}

            {/* Categories */}
            <Flex wrap="wrap" justify="center" gap={2}>
              {categories &&
                categories.map(category => (
                  <Badge
                    key={category}
                    colorScheme="purple"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {category}
                  </Badge>
                ))}
            </Flex>

            {/* Status details */}
            <Box p={4} bg="whiteAlpha.100" borderRadius="lg" w="full">
              <VStack align="start" spacing={3}>
                <HStack spacing={3}>
                  <Icon as={ScrollText} color="green.400" />
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t('Creating article for your challenge')}
                  </Text>
                </HStack>

                <HStack spacing={3}>
                  <Icon as={Sparkles} color="yellow.400" />
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t('Generating questions for both players')}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Text fontSize="sm" color="whiteAlpha.600" textAlign="center">
              {t("You'll be notified when the challenge is ready")}
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ChallengeCreationModal
