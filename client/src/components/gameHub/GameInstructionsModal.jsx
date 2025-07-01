// components/gameHub/GameInstructionsModal.jsx - Optimized High-Performance Version
import React, { memo, useMemo, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  Icon,
  Grid,
  Container,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  FlipHorizontal2,
  Sparkles,
  Link2,
  Clock,
  Target,
  Award,
  Zap,
  Trophy,
  Brain,
  Shield,
  Gem,
  Rocket,
  X,
  Star,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

// Move static data outside component to prevent recreation on every render
const GAME_INSTRUCTIONS = {
  normal_quiz: {
    icon: FileText,
    title: 'Knowledge Quest',
    subtitle: 'Multiple Choice Mastery',
    time: '50 seconds',
    difficulty: 'Balanced',
    emoji: '🧠',
    description:
      'Navigate through strategic multiple-choice challenges that test your comprehension',
    colors: {
      primary: '#EC4899',
      secondary: '#F472B6',
      background: 'linear(135deg, #ec4899 0%, #be185d 100%)',
      light: 'rgba(236, 72, 153, 0.2)',
      border: 'rgba(236, 72, 153, 0.4)',
      text: '#F9A8D4',
    },
    instructions: [
      'Answer 5 carefully crafted multiple choice questions',
      'Each question offers 4 strategic options (A, B, C, D)',
      'Navigate freely between questions to review answers',
      'Submit when confident in your responses',
    ],
    tips: [
      'Read each question thoroughly before examining options',
      'Eliminate obviously incorrect answers first',
      'Reference article details to verify selections',
      'Trust your first instinct when confident',
    ],
    features: ['Adaptive Difficulty', 'Smart Navigation', 'Instant Validation'],
  },
  true_false: {
    icon: FlipHorizontal2,
    title: 'Truth Detector',
    subtitle: 'Lightning Decision Engine',
    time: '35 seconds',
    difficulty: 'Swift',
    emoji: '⚡',
    description:
      'Rapid-fire accuracy challenge with binary decisions that test attention to detail',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: 'linear(135deg, #8b5cf6 0%, #7c3aed 100%)',
      light: 'rgba(139, 92, 246, 0.2)',
      border: 'rgba(139, 92, 246, 0.4)',
      text: '#C4B5FD',
    },
    instructions: [
      'Evaluate 7 precisely crafted statements from the article',
      'Determine TRUE or FALSE for each statement quickly',
      'Base decisions solely on article information',
      'Speed and accuracy both contribute to your score',
    ],
    tips: [
      'Watch for absolute terms like "always," "never," or "all"',
      'Verify statements against specific article facts',
      'Be cautious with partially correct statements',
      'Quick decisions often yield better time bonuses',
    ],
    features: ['Speed Bonus', 'Binary Simplicity', 'Fact Verification'],
  },
  word_weaver: {
    icon: Sparkles,
    title: 'Word Architect',
    subtitle: 'Letter Puzzle Mastery',
    time: '100 seconds',
    difficulty: 'Creative',
    emoji: '🔤',
    description:
      'Construct words from scrambled letters using contextual clues and creative thinking',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      background: 'linear(135deg, #10b981 0%, #059669 100%)',
      light: 'rgba(16, 185, 129, 0.2)',
      border: 'rgba(16, 185, 129, 0.4)',
      text: '#6EE7B7',
    },
    instructions: [
      'Complete 5 fill-in-the-blank puzzles by unscrambling letters',
      'Click letters to build words that fit the given context',
      'Use sentence context as your primary guidance tool',
      'Remove letters by clicking them in your answer area',
    ],
    tips: [
      'Analyze the sentence context for logical word fits',
      'Think about word length and letter frequency',
      'Use the shuffle feature to see letters differently',
      'Consider word variations and common endings',
    ],
    features: ['Context Clues', 'Letter Shuffling', 'Progressive Difficulty'],
  },
  connections: {
    icon: Link2,
    title: 'Mind Mapper',
    subtitle: 'Concept Relationship Matrix',
    time: '100 seconds',
    difficulty: 'Strategic',
    emoji: '🔗',
    description:
      'Create perfect concept pairs by connecting all 8 strategic concepts from the article',
    colors: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      background: 'linear(135deg, #f59e0b 0%, #d97706 100%)',
      light: 'rgba(245, 158, 11, 0.2)',
      border: 'rgba(245, 158, 11, 0.4)',
      text: '#FCD34D',
    },
    instructions: [
      'Connect all 8 strategically chosen concepts in perfect pairs',
      'Click two concepts to create logical connections (4 total)',
      'Each concept must be used exactly once in the network',
      'Remove incorrect connections using the red X buttons',
    ],
    tips: [
      'Look for cause-effect relationships in the article',
      'Consider thematic and categorical connections',
      'Think about how concepts interact or relate',
      'All concepts must be paired - no orphaned nodes allowed',
    ],
    features: [
      'Perfect Pairing',
      'Strategic Thinking',
      'Complete Network Mapping',
    ],
  },
}

// Memoized animation variants
const ANIMATION_VARIANTS = {
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 },
  },
  content: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
}

// Memoized subcomponents for better performance
const GameIcon = memo(({ game }) => (
  <Box
    position="relative"
    p={4}
    borderRadius="xl"
    bg={game.colors.background}
    boxShadow={`0 15px 30px ${game.colors.light}`}
    border="2px solid"
    borderColor="rgba(255, 255, 255, 0.2)"
  >
    <Icon as={game.icon} boxSize={7} color="white" />
    <Box
      position="absolute"
      top="-8px"
      right="-8px"
      fontSize="lg"
      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
    >
      {game.emoji}
    </Box>
  </Box>
))

const QuickStats = memo(({ game }) => (
  <Grid templateColumns="repeat(3, 1fr)" gap={4} w="100%" maxW="300px">
    <VStack spacing={1}>
      <Clock size={18} color={game.colors.primary} />
      <Text fontSize="xs" color="gray.300" textAlign="center" fontWeight="600">
        {game.time}
      </Text>
    </VStack>
    <VStack spacing={1}>
      <Target size={18} color={game.colors.primary} />
      <Text fontSize="xs" color="gray.300" textAlign="center" fontWeight="600">
        RQM Score
      </Text>
    </VStack>
    <VStack spacing={1}>
      <Trophy size={18} color={game.colors.primary} />
      <Text fontSize="xs" color="gray.300" textAlign="center" fontWeight="600">
        Compete
      </Text>
    </VStack>
  </Grid>
))

const InstructionsList = memo(({ instructions, colors }) => (
  <VStack spacing={2} align="stretch">
    {instructions.map((instruction, index) => (
      <HStack
        key={index}
        align="flex-start"
        spacing={3}
        bg="rgba(255, 255, 255, 0.05)"
        borderRadius="lg"
        p={3}
      >
        <Box
          bg={colors.primary}
          borderRadius="full"
          minW="5"
          h="5"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mt={0.5}
        >
          <Text fontSize="xs" fontWeight="bold" color="white">
            {index + 1}
          </Text>
        </Box>
        <Text fontSize="sm" color="gray.200" lineHeight="1.4" flex="1">
          {instruction}
        </Text>
      </HStack>
    ))}
  </VStack>
))

const FeaturesList = memo(({ features, colors }) => (
  <VStack spacing={1.5} align="stretch">
    {features.map((feature, index) => (
      <HStack
        key={index}
        bg="rgba(255, 255, 255, 0.05)"
        borderRadius="md"
        p={2}
        spacing={2}
      >
        <Gem size={12} color={colors.primary} />
        <Text fontSize="xs" color="gray.200" fontWeight="500">
          {feature}
        </Text>
      </HStack>
    ))}
  </VStack>
))

const TipsList = memo(({ tips }) => (
  <VStack spacing={1.5} align="stretch">
    {tips.slice(0, 2).map((tip, index) => (
      <HStack
        key={index}
        align="flex-start"
        spacing={2}
        bg="rgba(255, 255, 255, 0.05)"
        borderRadius="md"
        p={2}
      >
        <Star size={10} color="#10B981" mt={0.5} />
        <Text fontSize="xs" color="gray.200" lineHeight="1.3">
          {tip}
        </Text>
      </HStack>
    ))}
  </VStack>
))

const RQMScoringSection = memo(() => (
  <Box
    bg="linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.05))"
    border="1px solid"
    borderColor="rgba(255, 215, 0, 0.3)"
    borderRadius="lg"
    p={3}
  >
    <HStack mb={2} spacing={2} justify="center">
      <Box
        bg="linear-gradient(45deg, #FFD700, #FFA000)"
        borderRadius="md"
        p={1.5}
      >
        <Award size={16} color="white" />
      </Box>
      <Text fontSize="sm" fontWeight="bold" color="#FCD34D">
        RQM Scoring System
      </Text>
    </HStack>

    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
      <VStack spacing={1}>
        <Box
          bg="linear-gradient(45deg, #3B82F6, #1E40AF)"
          borderRadius="md"
          p={1.5}
        >
          <Shield size={14} color="white" />
        </Box>
        <Text
          fontSize="2xs"
          color="#93C5FD"
          fontWeight="bold"
          textAlign="center"
        >
          ACCURACY
        </Text>
      </VStack>
      <VStack spacing={1}>
        <Box
          bg="linear-gradient(45deg, #F59E0B, #D97706)"
          borderRadius="md"
          p={1.5}
        >
          <Zap size={14} color="white" />
        </Box>
        <Text
          fontSize="2xs"
          color="#FCD34D"
          fontWeight="bold"
          textAlign="center"
        >
          SPEED
        </Text>
      </VStack>
      <VStack spacing={1}>
        <Box
          bg="linear-gradient(45deg, #EF4444, #DC2626)"
          borderRadius="md"
          p={1.5}
        >
          <Target size={14} color="white" />
        </Box>
        <Text
          fontSize="2xs"
          color="#FCA5A5"
          fontWeight="bold"
          textAlign="center"
        >
          DIFFICULTY
        </Text>
      </VStack>
    </Grid>
  </Box>
))

const GameInstructionsModal = memo(
  ({ isOpen, onClose, gameType, onStartGame }) => {
    const { t } = useTranslation()

    // Memoize game data to prevent recalculation
    const game = useMemo(() => {
      if (!gameType || !GAME_INSTRUCTIONS[gameType]) return null
      return GAME_INSTRUCTIONS[gameType]
    }, [gameType])

    // Memoize event handlers
    const handleClose = useCallback(() => {
      onClose()
    }, [onClose])

    const handleStartGame = useCallback(() => {
      onStartGame()
    }, [onStartGame])

    // Early return if no valid game type
    if (!game) return null

    return (
      <AnimatePresence mode="wait">
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size={{ base: 'full', md: '4xl' }}
            closeOnOverlayClick={false}
            motionPreset="slideInBottom"
          >
            <ModalOverlay
              bg="blackAlpha.900"
              backdropFilter="blur(10px)"
              style={{ zIndex: 1400 }}
            />

            <MotionBox
              as={ModalContent}
              {...ANIMATION_VARIANTS.modal}
              bg="gray.900"
              color="white"
              mx={{ base: 0, md: 4 }}
              my={{ base: 0, md: 4 }}
              borderRadius={{ base: 'none', md: '3xl' }}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.6)"
              maxH={{ base: '100vh', md: '85vh' }}
              h={{ base: '100vh', md: 'auto' }}
              overflow="hidden"
              position="relative"
              display="flex"
              flexDirection="column"
              style={{ zIndex: 1401 }}
            >
              {/* Dynamic Background Gradient - Optimized */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient={`radial(circle at 30% 20%, ${game.colors.light}, transparent 70%)`}
                opacity={0.3}
                zIndex={0}
                pointerEvents="none"
              />

              {/* Custom Close Button - Optimized positioning */}
              <Box
                position="absolute"
                top={{ base: 4, md: 6 }}
                right={{ base: 4, md: 6 }}
                zIndex={20}
              >
                <MotionBox
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    onClick={handleClose}
                    size="lg"
                    borderRadius="full"
                    bg="rgba(0, 0, 0, 0.6)"
                    color="white"
                    border="2px solid"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    minW="auto"
                    w="48px"
                    h="48px"
                    p={0}
                    _hover={{
                      bg: 'rgba(0, 0, 0, 0.8)',
                      borderColor: game.colors.primary,
                    }}
                    transition="all 0.2s ease"
                  >
                    <X size={20} />
                  </Button>
                </MotionBox>
              </Box>

              {/* Header - Fixed */}
              <ModalHeader
                pt={{ base: 8, md: 8 }}
                pb={4}
                px={{ base: 6, md: 8 }}
                position="relative"
                zIndex={1}
                flexShrink={0}
              >
                <MotionBox
                  {...ANIMATION_VARIANTS.content}
                  transition={{ duration: 0.5 }}
                >
                  <VStack spacing={6} align="center">
                    <VStack spacing={4} align="center">
                      <GameIcon game={game} />

                      <VStack spacing={2} align="center">
                        <Text
                          fontSize={{ base: '2xl', md: '3xl' }}
                          fontWeight="900"
                          color="white"
                          textAlign="center"
                          letterSpacing="tight"
                        >
                          {game.title}
                        </Text>

                        <HStack spacing={2} align="center">
                          <Badge
                            bg={game.colors.light}
                            color={game.colors.text}
                            border="1px solid"
                            borderColor={game.colors.border}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            {game.difficulty}
                          </Badge>

                          <Text fontSize="md" color="gray.300" fontWeight="600">
                            {game.subtitle}
                          </Text>
                        </HStack>
                      </VStack>

                      <QuickStats game={game} />
                    </VStack>
                  </VStack>
                </MotionBox>
              </ModalHeader>

              {/* Body - Scrollable */}
              <ModalBody
                py={0}
                px={{ base: 6, md: 8 }}
                position="relative"
                zIndex={1}
                overflow="auto"
                flex="1"
                css={{
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: game.colors.primary,
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: game.colors.secondary,
                  },
                }}
              >
                <Container maxW="3xl" p={0}>
                  <VStack spacing={6} pb={4}>
                    {/* Description */}
                    <MotionBox
                      {...ANIMATION_VARIANTS.content}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      w="100%"
                    >
                      <Text
                        fontSize="md"
                        color="gray.300"
                        textAlign="center"
                        lineHeight="1.6"
                        bg="rgba(0, 0, 0, 0.3)"
                        borderRadius="xl"
                        p={4}
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.1)"
                      >
                        {game.description}
                      </Text>
                    </MotionBox>

                    {/* How to Play Section */}
                    <MotionBox
                      {...ANIMATION_VARIANTS.content}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      w="100%"
                    >
                      <Box
                        bg="rgba(0, 0, 0, 0.4)"
                        backdropFilter="blur(10px)"
                        border="2px solid"
                        borderColor={game.colors.border}
                        borderRadius="xl"
                        p={4}
                      >
                        <HStack mb={3} spacing={3}>
                          <Box
                            bg={game.colors.background}
                            borderRadius="lg"
                            p={2}
                            boxShadow={`0 6px 15px ${game.colors.light}`}
                          >
                            <Target size={16} color="white" />
                          </Box>
                          <Text
                            fontSize="md"
                            fontWeight="bold"
                            color={game.colors.text}
                          >
                            How to Play
                          </Text>
                        </HStack>

                        <InstructionsList
                          instructions={game.instructions}
                          colors={game.colors}
                        />
                      </Box>
                    </MotionBox>

                    {/* Features and Tips Row */}
                    <Grid
                      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                      gap={4}
                      w="100%"
                    >
                      {/* Features */}
                      <MotionBox
                        {...ANIMATION_VARIANTS.content}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Box
                          bg="rgba(0, 0, 0, 0.3)"
                          backdropFilter="blur(10px)"
                          border="1px solid"
                          borderColor="rgba(255, 255, 255, 0.2)"
                          borderRadius="lg"
                          p={3}
                          h="100%"
                        >
                          <HStack mb={2} spacing={2}>
                            <Box
                              bg={game.colors.primary}
                              borderRadius="md"
                              p={1.5}
                            >
                              <Zap size={14} color="white" />
                            </Box>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color={game.colors.text}
                            >
                              Features
                            </Text>
                          </HStack>

                          <FeaturesList
                            features={game.features}
                            colors={game.colors}
                          />
                        </Box>
                      </MotionBox>

                      {/* Pro Tips */}
                      <MotionBox
                        {...ANIMATION_VARIANTS.content}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <Box
                          bg="rgba(0, 0, 0, 0.3)"
                          backdropFilter="blur(10px)"
                          border="1px solid"
                          borderColor="rgba(255, 255, 255, 0.2)"
                          borderRadius="lg"
                          p={3}
                          h="100%"
                        >
                          <HStack mb={2} spacing={2}>
                            <Box
                              bg="linear-gradient(45deg, #10B981, #059669)"
                              borderRadius="md"
                              p={1.5}
                            >
                              <Brain size={14} color="white" />
                            </Box>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color="#6EE7B7"
                            >
                              Pro Tips
                            </Text>
                          </HStack>

                          <TipsList tips={game.tips} />
                        </Box>
                      </MotionBox>
                    </Grid>

                    {/* RQM Scoring */}
                    <MotionBox
                      {...ANIMATION_VARIANTS.content}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      w="100%"
                    >
                      <RQMScoringSection />
                    </MotionBox>
                  </VStack>
                </Container>
              </ModalBody>

              {/* Footer - Fixed */}
              <ModalFooter
                pt={4}
                px={{ base: 6, md: 8 }}
                pb={{ base: 4, md: 6 }}
                position="relative"
                zIndex={1}
                bg="rgba(0, 0, 0, 0.8)"
                backdropFilter="blur(20px)"
                borderTop="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                flexShrink={0}
                w={'100%'}
              >
                <MotionBox
                  {...ANIMATION_VARIANTS.content}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  w="100%"
                >
                  <HStack spacing={3} w="100%" justify="center" align="center">
                    <MotionBox
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleClose}
                        size="md"
                        px={6}
                        py={3}
                        borderRadius="full"
                        bg="rgba(255, 255, 255, 0.1)"
                        color="white"
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.2)"
                        fontSize="sm"
                        fontWeight="600"
                        minW="120px"
                        h="44px"
                        _hover={{
                          bg: 'rgba(255, 255, 255, 0.2)',
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                        }}
                        transition="all 0.2s ease"
                      >
                        Back to Menu
                      </Button>
                    </MotionBox>

                    <MotionBox
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleStartGame}
                        size="md"
                        px={8}
                        py={3}
                        bg={game.colors.background}
                        color="white"
                        leftIcon={<Rocket size={16} />}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="bold"
                        boxShadow={`0 8px 25px ${game.colors.light}`}
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.3)"
                        minW="140px"
                        h="44px"
                        _hover={{
                          boxShadow: `0 12px 30px ${game.colors.light}`,
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                        transition="all 0.2s ease"
                      >
                        Launch Game
                      </Button>
                    </MotionBox>
                  </HStack>

                  {/* Safe area for mobile devices */}
                  <Box
                    display={{ base: 'block', md: 'none' }}
                    h="env(safe-area-inset-bottom, 0px)"
                    minH="4px"
                  />
                </MotionBox>
              </ModalFooter>
            </MotionBox>
          </Modal>
        )}
      </AnimatePresence>
    )
  },
)

GameInstructionsModal.displayName = 'GameInstructionsModal'

export default GameInstructionsModal
