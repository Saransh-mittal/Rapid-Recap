// components/gameHub/GameInstructionsModal.jsx
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  List,
  ListItem,
  ListIcon,
  Icon,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  FileText,
  FlipHorizontal2,
  Sparkles,
  Link2,
  Clock,
  Target,
  Play,
  CheckCircle,
  Star,
  Award,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const gameInstructions = {
  normal_quiz: {
    icon: FileText,
    title: 'Normal Quiz',
    color: 'blue',
    gradient: 'linear(to-br, blue.600, indigo.500)',
    time: '50 seconds',
    difficulty: 'Standard',
    description: 'Test your comprehension with multiple choice questions',
    instructions: [
      'Answer 5 multiple choice questions based on the article',
      'Each question has 4 options (A, B, C, D)',
      'Select the best answer for each question',
      'You can navigate between questions',
      'Click submit when you are ready',
    ],
    tips: [
      'Read each question carefully',
      'Eliminate obviously wrong answers first',
      'Use the article content to verify your answers',
    ],
  },
  true_false: {
    icon: FlipHorizontal2,
    title: 'True or False',
    color: 'purple',
    gradient: 'linear(to-br, purple.600, pink.500)',
    time: '35 seconds',
    difficulty: 'Quick',
    description: 'Evaluate statements for accuracy',
    instructions: [
      'Evaluate 7 statements based on the article content',
      'Determine if each statement is TRUE or FALSE',
      'Base your answers on information from the article',
      'Each statement appears one at a time',
      'Make your choice quickly but carefully',
    ],
    tips: [
      'Look for absolute terms like "always" or "never"',
      'Check if the statement matches the article facts',
      'Be careful with partially correct statements',
    ],
  },
  word_weaver: {
    icon: Sparkles,
    title: 'Word Weaver',
    color: 'green',
    gradient: 'linear(to-br, green.600, teal.500)',
    time: '100 seconds',
    difficulty: 'Challenge',
    description: 'Unscramble letters to complete sentences',
    instructions: [
      'Fill in 5 blanks by unscrambling letters',
      'Click on letters to build the correct word',
      'Use the context to guide your answers',
      'Click letters in the answer area to remove them',
      'Submit when you complete each word',
    ],
    tips: [
      'Read the context sentence carefully',
      'Think about what word fits logically',
      'Use the hint button if you get stuck',
    ],
  },
  connections: {
    icon: Link2,
    title: 'Connect Concepts',
    color: 'violet',
    gradient: 'linear(to-br, violet.600, indigo.500)',
    time: '80 seconds',
    difficulty: 'Expert',
    description: 'Find logical relationships between concepts',
    instructions: [
      'Connect related concepts from 6 given terms',
      'Click two concepts to create a connection',
      'Find all valid connections based on the article',
      'Click the red X to remove wrong connections',
      'Submit when you have found all connections',
    ],
    tips: [
      'Think about how concepts relate in the article',
      'Look for cause-effect relationships',
      'Consider thematic or categorical connections',
    ],
  },
}

const GameInstructionsModal = ({ isOpen, onClose, gameType, onStartGame }) => {
  const { t } = useTranslation()

  if (!gameType || !gameInstructions[gameType]) return null

  const game = gameInstructions[gameType]
  const IconComponent = game.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="gray.900" color="white" mx={4}>
        <ModalHeader pb={2}>
          <VStack spacing={3}>
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <Box
                p={4}
                borderRadius="xl"
                bgGradient={game.gradient}
                boxShadow="0 8px 25px rgba(0,0,0,0.3)"
              >
                <Icon as={IconComponent} boxSize={8} color="white" />
              </Box>
            </MotionBox>

            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                {game.title}
              </Text>
              <Text fontSize="md" color="gray.300" textAlign="center">
                {game.description}
              </Text>
            </VStack>

            <HStack spacing={4}>
              <Badge colorScheme={game.color} px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Clock size={14} />
                  <Text>{game.time}</Text>
                </HStack>
              </Badge>
              <Badge
                colorScheme={
                  game.difficulty === 'Expert'
                    ? 'red'
                    : game.difficulty === 'Challenge'
                    ? 'orange'
                    : game.difficulty === 'Quick'
                    ? 'green'
                    : 'blue'
                }
                px={3}
                py={1}
                borderRadius="full"
              >
                <HStack spacing={1}>
                  <Star size={14} />
                  <Text>{game.difficulty}</Text>
                </HStack>
              </Badge>
            </HStack>
          </VStack>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* How to Play */}
            <Box>
              <HStack mb={3}>
                <Icon as={Target} color={game.color + '.400'} />
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={game.color + '.400'}
                >
                  How to Play
                </Text>
              </HStack>
              <List spacing={2}>
                {game.instructions.map((instruction, index) => (
                  <ListItem key={index} display="flex" alignItems="flex-start">
                    <ListIcon
                      as={CheckCircle}
                      color={game.color + '.400'}
                      mt={0.5}
                    />
                    <Text fontSize="sm" color="gray.300" lineHeight="1.5">
                      {instruction}
                    </Text>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider borderColor="gray.700" />

            {/* Tips */}
            <Box>
              <HStack mb={3}>
                <Icon as={Award} color="yellow.400" />
                <Text fontSize="lg" fontWeight="bold" color="yellow.400">
                  Pro Tips
                </Text>
              </HStack>
              <List spacing={2}>
                {game.tips.map((tip, index) => (
                  <ListItem key={index} display="flex" alignItems="flex-start">
                    <ListIcon as={Star} color="yellow.400" mt={0.5} />
                    <Text fontSize="sm" color="gray.300" lineHeight="1.5">
                      {tip}
                    </Text>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Scoring Info */}
            <Box
              bg="gray.800"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.700"
            >
              <Text fontSize="sm" color="gray.400" textAlign="center" mb={2}>
                <Text as="span" fontWeight="bold" color={game.color + '.400'}>
                  Scoring:
                </Text>{' '}
                Your RQM score is calculated based on accuracy, speed, and
                question difficulty. All game types offer equivalent scoring
                potential.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter pt={2}>
          <HStack spacing={3} w="100%">
            <Button
              onClick={onClose}
              variant="outline"
              colorScheme="gray"
              flex="1"
              size="lg"
            >
              Back to Menu
            </Button>
            <Button
              onClick={onStartGame}
              colorScheme={game.color}
              leftIcon={<Play />}
              flex="2"
              size="lg"
              bgGradient={game.gradient}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              }}
              transition="all 0.3s"
            >
              Start Game
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GameInstructionsModal
