// components/quickClashComponents/team/battleAnalysis/components/aiInsights/FollowUpQuestions.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  Badge,
  useBreakpointValue,
  Spinner,
  Center,
  Progress,
  Circle, // Added for SectionDisplay
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Lightbulb,
  Clock,
  Brain, // Ensured Brain is here
} from 'lucide-react'
import Typewriter from 'typewriter-effect'
import useQuickClashAnalysis from '../../../../../../customHooks/useQuickClashAnalysis'

const MotionBox = motion(Box)

const categoryConfigs = {
  tactical: {
    name: 'Tactical Edge',
    color: 'orange',
    gradient: 'linear(to-br, orange.500, yellow.600)',
    iconColor: 'orange.300',
    bgColor: 'orange.800',
    borderColor: 'orange.700',
    textColor: 'orange.100',
    labelColor: 'orange.200',
  },
  strategic: {
    name: 'Strategic Mind',
    color: 'purple',
    gradient: 'linear(to-br, purple.500, pink.600)',
    iconColor: 'purple.300',
    bgColor: 'purple.800',
    borderColor: 'purple.700',
    textColor: 'purple.100',
    labelColor: 'purple.200',
  },
  psychological: {
    name: 'Mental Fortitude',
    color: 'pink',
    gradient: 'linear(to-br, pink.500, rose.600)',
    iconColor: 'pink.300',
    bgColor: 'pink.800',
    borderColor: 'pink.700',
    textColor: 'pink.100',
    labelColor: 'pink.200',
  },
  improvement: {
    name: 'Growth Path',
    color: 'green',
    gradient: 'linear(to-br, green.500, teal.600)',
    iconColor: 'green.300',
    bgColor: 'green.800',
    borderColor: 'green.700',
    textColor: 'green.100',
    labelColor: 'green.200',
  },
  default: {
    name: 'General Insight',
    color: 'blue',
    gradient: 'linear(to-br, blue.500, cyan.600)',
    iconColor: 'blue.300',
    bgColor: 'blue.800',
    borderColor: 'blue.700',
    textColor: 'blue.100',
    labelColor: 'blue.200',
  },
}

const FollowUpQuestions = ({ questions, battleId, onQuestionAnswered }) => {
  const { t } = useTranslation('QuickClash')
  const {
    answerQuestion,
    questionAnswerLoading,
    typewriterStates,
    startTypewriterEffect,
    questionProgression,
    allQuestions,
  } = useQuickClashAnalysis()

  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const questionTitleSize = useBreakpointValue({ base: 'sm', md: 'md' })

  const questionsToShow = useMemo(
    () =>
      (allQuestions && allQuestions.length > 0 ? allQuestions : questions) ||
      [],
    [allQuestions, questions],
  )

  const currentQuestion = useMemo(
    () => questionsToShow.find(q => !q.answered && q.isActive),
    [questionsToShow],
  )
  const answeredQuestions = useMemo(
    () =>
      questionsToShow
        .filter(q => q.answered)
        .sort((a, b) => (a.questionIndex || 0) - (b.questionIndex || 0)),
    [questionsToShow],
  )

  const currentQuestionNumber = questionProgression?.currentQuestionIndex || 1
  const totalQuestionsToAsk = 3 // This might need to be dynamic from hook/config
  const isAnalysisComplete = questionProgression?.isComplete || false

  const handleQuestionClick = useCallback(
    async question => {
      if (!question || questionAnswerLoading || question.answered) return

      try {
        startTypewriterEffect(question.id)
        const result = await answerQuestion({
          battleId,
          questionId: question.id,
          questionText: question.question,
        })
        if (onQuestionAnswered) {
          onQuestionAnswered(question.id, result.answer)
        }
      } catch (error) {
        console.error('Error answering question:', error)
      }
    },
    [
      answerQuestion,
      battleId,
      onQuestionAnswered,
      questionAnswerLoading,
      startTypewriterEffect,
    ],
  )

  if (
    questionsToShow.length === 0 &&
    !isAnalysisComplete &&
    !questionAnswerLoading
  ) {
    return (
      <Center p={8} minH="200px">
        <VStack spacing={4}>
          <Spinner color="purple.400" size="xl" thickness="4px" />
          <Text color="whiteAlpha.800" fontSize="md" fontWeight="medium">
            {t('Preparing your personalized insights...')}
          </Text>
          <Text color="whiteAlpha.600" fontSize="sm">
            {t('BattleSage AI is warming up its circuits!')}
          </Text>
        </VStack>
      </Center>
    )
  }

  const noMoreQuestionsToDisplay =
    !currentQuestion &&
    (isAnalysisComplete || answeredQuestions.length === questionsToShow.length)

  if (noMoreQuestionsToDisplay && answeredQuestions.length === 0) {
    return (
      <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box
          bg="rgba(139, 92, 246, 0.15)"
          borderRadius="xl"
          p={8} // Increased padding
          border="1px solid"
          borderColor="purple.500" // Stronger border
          textAlign="center"
          boxShadow="0 8px 25px rgba(139, 92, 246, 0.2)" // Added shadow
        >
          <VStack spacing={5}>
            {' '}
            {/* Increased spacing */}
            <MotionBox
              animate={{
                scale: [1, 1.1, 1],
                color: ['#6EE7B7', '#34D399', '#6EE7B7'],
              }} // green.300, green.400
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon as={CheckCircle} color="green.400" boxSize={10} />{' '}
              {/* Larger icon */}
            </MotionBox>
            <Heading size="lg" color="white" fontWeight="semibold">
              {' '}
              {/* Larger heading */}
              {t('Analysis Complete!')}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="md">
              {' '}
              {/* Brighter, larger text */}
              {t("You've explored all AI insights for this battle. Great job!")}
            </Text>
          </VStack>
        </Box>
      </MotionBox>
    )
  }

  return (
    <VStack spacing={{ base: 5, md: 6 }} w="100%">
      {' '}
      {/* Increased spacing */}
      <VStack spacing={3.5} w="100%">
        {' '}
        {/* Increased spacing */}
        <HStack spacing={3.5} w="100%" justify="space-between">
          {' '}
          {/* Increased spacing */}
          <HStack spacing={3.5}>
            <Icon
              as={MessageCircle}
              color="purple.300"
              boxSize={{ base: 6, md: 7 }} // Larger icon
            />
            <VStack align="flex-start" spacing={0.5}>
              {' '}
              {/* Increased spacing */}
              <Heading size={headingSize} color="white" fontWeight="bold">
                {' '}
                {/* Bolder */}
                {t('AI Deep Dive')}
              </Heading>
              <Text color="whiteAlpha.700" fontSize={{ base: 'xs', md: 'sm' }}>
                {' '}
                {/* Brighter */}
                {t('Question {{current}} of {{total}}', {
                  current: Math.min(currentQuestionNumber, totalQuestionsToAsk),
                  total: totalQuestionsToAsk,
                })}
              </Text>
            </VStack>
          </HStack>
          <Badge
            bgGradient="linear(to-r, purple.600, pink.500)" // Gradient badge
            color="white"
            px={3.5} // More padding
            py={1.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            boxShadow="0 4px 10px rgba(0,0,0,0.3)"
          >
            {isAnalysisComplete ? t('Complete') : t('Progressive Analysis')}
          </Badge>
        </HStack>
      </VStack>
      <VStack spacing={4} w="100%" align="stretch">
        {answeredQuestions.map((question, index) => (
          <MotionBox
            key={`answered-${question.id}`}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: 'circOut' }}
          >
            <QuestionCard
              question={question}
              isCurrentlyLoadingAnswer={false}
              onClick={() => {}}
              titleSize={questionTitleSize}
              isAnsweredCard={true}
            />
          </MotionBox>
        ))}

        <AnimatePresence mode="wait">
          {currentQuestion && (
            <MotionBox
              key={`current-${currentQuestion.id}`}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'circOut' }}
            >
              <QuestionCard
                question={currentQuestion}
                isCurrentlyLoadingAnswer={questionAnswerLoading}
                onClick={() => handleQuestionClick(currentQuestion)}
                titleSize={questionTitleSize}
                isAnsweredCard={false}
              />
            </MotionBox>
          )}
        </AnimatePresence>
      </VStack>
    </VStack>
  )
}

const QuestionCard = ({
  question,
  isCurrentlyLoadingAnswer,
  onClick,
  titleSize,
  isAnsweredCard,
}) => {
  const { t } = useTranslation('QuickClash')
  const { typewriterStates } = useQuickClashAnalysis()
  const categoryConfig =
    categoryConfigs[question.category] || categoryConfigs.default
  const [isHovered, setIsHovered] = useState(false)

  const answer = question.answer
  const canClick = !isAnsweredCard && !isCurrentlyLoadingAnswer

  const currentQuestionTypewriterState = typewriterStates[question.id]
  const isPreparingToType = // This means API call is done, hook is setting up for typing
    currentQuestionTypewriterState?.isTyping &&
    !answer?.content && // Answer content not yet available locally or not yet started typing
    !isCurrentlyLoadingAnswer // API call itself is not happening

  const shouldStartTypingAnimation = // Ready to start the typewriter animation for the answer
    currentQuestionTypewriterState?.isTyping &&
    !!answer?.content && // Answer content is available
    !isCurrentlyLoadingAnswer

  return (
    <MotionBox
      onHoverStart={() => canClick && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
      whileHover={
        canClick
          ? {
              y: -4,
              boxShadow: `0 10px 20px rgba(0,0,0,0.3), 0 0 15px ${categoryConfig.color}.400`,
            }
          : {}
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Box
        position="relative"
        bg={isAnsweredCard ? `rgba(0,0,0,0.4)` : `rgba(10, 5, 20, 0.6)`} // Darker, more consistent bg
        backdropFilter="blur(15px)" // More blur
        borderRadius="xl"
        border="1px solid"
        borderColor={
          isAnsweredCard
            ? `${categoryConfig.color}.600`
            : isHovered && canClick
            ? `${categoryConfig.color}.400`
            : 'rgba(255,255,255,0.15)' // More subtle default border
        }
        p={{ base: 4, md: 5 }}
        cursor={canClick ? 'pointer' : 'default'}
        onClick={canClick ? onClick : undefined}
        overflow="hidden"
        boxShadow={
          isAnsweredCard
            ? `inset 0 0 20px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.2)`
            : `0 5px 15px rgba(0,0,0,0.2)`
        }
      >
        {isAnsweredCard && (
          <Box
            position="absolute"
            inset={0}
            bgGradient={categoryConfig.gradient}
            opacity={0.1} // More subtle
            zIndex={0}
          />
        )}
        {!isAnsweredCard && isHovered && canClick && (
          <MotionBox
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="3px"
            bgGradient={`linear(to-r, transparent, ${categoryConfig.color}.400, transparent)`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        <VStack align="stretch" spacing={3.5} position="relative" zIndex={1}>
          {' '}
          {/* Reduced spacing for tighter look */}
          <HStack justify="space-between" align="flex-start">
            <HStack spacing={3.5} flex={1} minW={0}>
              {' '}
              {/* Increased spacing */}
              <Text fontSize={{ base: '2xl', md: '3xl' }} userSelect="none">
                {' '}
                {/* Larger emoji */}
                {question.emoji || '🤔'}
              </Text>
              <VStack align="flex-start" spacing={1} flex={1} overflow="hidden">
                <HStack spacing={2}>
                  <Badge
                    bgGradient={categoryConfig.gradient}
                    color="white"
                    px={2.5} // Adjusted padding
                    py={0.5}
                    borderRadius="full"
                    fontSize="xs" // Standardized
                    fontWeight="bold"
                    textTransform="uppercase"
                    boxShadow="0 2px 5px rgba(0,0,0,0.2)"
                  >
                    {t(categoryConfig.name) || t('General')}
                  </Badge>
                  {question.questionIndex && (
                    <Badge
                      variant="outline"
                      borderColor="whiteAlpha.500" // Brighter border
                      color="whiteAlpha.800" // Brighter text
                      fontSize="xs"
                      px={1.5}
                    >
                      Q{question.questionIndex}
                    </Badge>
                  )}
                </HStack>
                <Text
                  color="white"
                  fontSize={titleSize}
                  fontWeight="medium"
                  lineHeight="tight"
                  noOfLines={isAnsweredCard ? undefined : 2} // Show full title if answered
                  title={question.question}
                >
                  {question.question}
                </Text>
              </VStack>
            </HStack>
            <Box pt={0.5} minW="40px" textAlign="center">
              {' '}
              {/* Adjusted minW for new indicator */}
              {isCurrentlyLoadingAnswer ? (
                <VStack spacing={0.5} align="center">
                  <MotionBox
                    animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{
                      duration: 1.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Icon
                      as={Brain}
                      color={`${categoryConfig.color}.300`}
                      boxSize="22px"
                    />
                  </MotionBox>
                  <Text
                    fontSize="2xs"
                    color="whiteAlpha.700"
                    fontWeight="medium"
                    lineHeight="1"
                  >
                    {t('Thinking...')}
                  </Text>
                </VStack>
              ) : isAnsweredCard ? (
                <Icon as={CheckCircle} color="green.400" boxSize={6} />
              ) : (
                <MotionBox
                  animate={
                    isHovered
                      ? { x: [0, 4, 0], opacity: [0.7, 1, 0.7] }
                      : { x: 0, opacity: 0.7 }
                  }
                  transition={{
                    x: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
                    opacity: {
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                >
                  <Icon
                    as={ChevronRight}
                    color={`${categoryConfig.color}.300`}
                    boxSize={6}
                  />
                </MotionBox>
              )}
            </Box>
          </HStack>
          <AnimatePresence mode="wait">
            {(isAnsweredCard || shouldStartTypingAnimation) && answer ? (
              <MotionBox
                key="answer-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: 'circOut' }}
                overflow="hidden" // Prevents content spill during animation
              >
                <TypewriterAnswer
                  answer={answer}
                  categoryConfig={categoryConfig}
                  questionId={question.id}
                  shouldStartTyping={shouldStartTypingAnimation}
                  isStaticDisplay={
                    isAnsweredCard && !shouldStartTypingAnimation
                  }
                />
              </MotionBox>
            ) : !isCurrentlyLoadingAnswer &&
              !isPreparingToType &&
              question.preview &&
              !isAnsweredCard ? ( // Only show preview if not answered
              <MotionBox
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                pt={1}
              >
                <Text
                  color="whiteAlpha.600"
                  fontSize="sm"
                  fontStyle="italic"
                  noOfLines={2}
                >
                  {question.preview}
                </Text>
              </MotionBox>
            ) : null}
          </AnimatePresence>
          {isPreparingToType && ( // This is the "AI is fetching/preparing your answer" state
            <MotionBox
              key="preparing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <HStack
                spacing={3}
                justify="center"
                py={4}
                bg="rgba(0,0,0,0.2)"
                borderRadius="md"
                mt={2}
              >
                <Spinner color={`${categoryConfig.color}.400`} size="sm" />
                <Text color="whiteAlpha.700" fontSize="sm" fontWeight="medium">
                  {t('BattleSage AI is analyzing...')}
                </Text>
              </HStack>
            </MotionBox>
          )}
        </VStack>
      </Box>
    </MotionBox>
  )
}

const TypewriterAnswer = ({
  answer,
  categoryConfig,
  questionId,
  shouldStartTyping,
  isStaticDisplay,
}) => {
  const { t } = useTranslation('QuickClash')
  const [currentTypingSectionKey, setCurrentTypingSectionKey] = useState(null)
  const [completedSectionKeys, setCompletedSectionKeys] = useState(new Set())
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false)

  const answerSections = useMemo(() => {
    const sections = []
    if (answer?.content)
      sections.push({
        key: 'content',
        text: answer.content,
        label: t('Detailed Analysis'),
        icon: Brain, // Using Brain for detailed analysis
        config: categoryConfig,
      })
    if (answer?.keyTakeaway)
      sections.push({
        key: 'takeaway',
        text: answer.keyTakeaway,
        label: t('Key Insight'),
        icon: Sparkles,
        config: categoryConfig, // Use main category config
      })
    if (answer?.actionItem)
      sections.push({
        key: 'action',
        text: answer.actionItem,
        label: t('Actionable Tip'),
        icon: Lightbulb,
        config: categoryConfigs.improvement, // Action items often relate to improvement
      })
    return sections
  }, [answer, t, categoryConfig])

  useEffect(() => {
    setCompletedSectionKeys(new Set())
    setCurrentTypingSectionKey(null)
    setShowThinkingIndicator(false)

    if (shouldStartTyping && answerSections.length > 0) {
      setShowThinkingIndicator(true) // Show thinking indicator immediately
      // Slight delay before starting the first section to make "thinking" more apparent
      const timer = setTimeout(() => {
        setCurrentTypingSectionKey(answerSections[0].key)
      }, 700) // Adjust delay as needed
      return () => clearTimeout(timer)
    }
  }, [questionId, shouldStartTyping, answerSections])

  const handleSectionTyped = useCallback(
    typedSectionKey => {
      const newCompletedKeys = new Set(completedSectionKeys).add(
        typedSectionKey,
      )
      setCompletedSectionKeys(newCompletedKeys)

      const currentIndex = answerSections.findIndex(
        s => s.key === typedSectionKey,
      )
      if (currentIndex + 1 < answerSections.length) {
        // Short pause before typing next section, keep "thinking" indicator
        setShowThinkingIndicator(true)
        const timer = setTimeout(() => {
          setCurrentTypingSectionKey(answerSections[currentIndex + 1].key)
        }, 500) // Adjust delay
        return () => clearTimeout(timer)
      } else {
        setCurrentTypingSectionKey(null) // All sections typed
        setShowThinkingIndicator(false) // Hide thinking indicator
      }
    },
    [answerSections, completedSectionKeys],
  )

  const renderSectionContent = (section, isTyping) => {
    const typewriterOptions = {
      delay: 15, // Faster typing
      cursor: '▋',
      autoStart: true,
      loop: false,
    }
    const sectionConfig = section.config
    const sx = {
      '.Typewriter__wrapper': {
        display: 'inline',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      '.Typewriter__cursor': {
        color: `${sectionConfig.color}.400`,
        animation: 'blink 0.7s infinite',
      },
      '@keyframes blink': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } },
    }

    return (
      <Box sx={sx}>
        {isTyping ? (
          <Typewriter
            key={`${questionId}-${section.key}`}
            options={typewriterOptions}
            onInit={tw => {
              tw.typeString(section.text)
                .pauseFor(150)
                .callFunction(() => handleSectionTyped(section.key))
                .start()
            }}
          />
        ) : (
          <Text whiteSpace="pre-wrap" wordBreak="break-word">
            {section.text}
          </Text> // Static text after typing
        )}
      </Box>
    )
  }

  if (isStaticDisplay) {
    return (
      <VStack
        align="stretch"
        spacing={4}
        pt={3.5} // Consistent padding
        borderTop="1px dashed"
        borderColor="rgba(255,255,255,0.15)" // More subtle
      >
        {answerSections.map(section => (
          <SectionDisplay key={section.key} section={section} isStatic={true} />
        ))}
      </VStack>
    )
  }

  if (!shouldStartTyping && !isStaticDisplay) return null // Don't render if not supposed to type and not static

  return (
    <VStack
      align="stretch"
      spacing={4}
      pt={3.5}
      borderTop="1px dashed"
      borderColor="rgba(255,255,255,0.15)"
    >
      {answerSections.map(section => {
        const isCurrentlyTypingThisSection =
          currentTypingSectionKey === section.key
        const isCompleted = completedSectionKeys.has(section.key)

        if (!isCurrentlyTypingThisSection && !isCompleted) return null // Don't render if not typed or typing

        return (
          <MotionBox
            key={section.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
          >
            <SectionDisplay
              section={section}
              isTyping={isCurrentlyTypingThisSection}
              renderContentMethod={renderSectionContent}
            />
          </MotionBox>
        )
      })}

      {showThinkingIndicator &&
        currentTypingSectionKey && ( // Show only when actively typing a section or about to
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HStack spacing={2.5} justify="center" opacity={0.8} pt={2}>
              <Spinner
                color={`${categoryConfig.color}.400`}
                size="xs"
                speed="0.8s"
              />
              <Text color="whiteAlpha.700" fontSize="xs" fontStyle="italic">
                {t('BattleSage AI is crafting your insight...')}
              </Text>
            </HStack>
          </MotionBox>
        )}
    </VStack>
  )
}

// Helper component to render section content (static or with typewriter)
const SectionDisplay = ({
  section,
  isStatic = false,
  isTyping = false,
  renderContentMethod,
}) => {
  const sectionConfig = section.config

  if (section.key === 'content') {
    return (
      <Box
        bg="rgba(255,255,255,0.03)" // More subtle bg
        backdropFilter="blur(5px)"
        borderRadius="lg" // Consistent rounding
        p={4}
        border="1px solid"
        borderColor="rgba(255,255,255,0.1)"
        minH="50px" // Ensure some height for typing
      >
        <HStack spacing={3} mb={2} opacity={0.8}>
          <Icon as={section.icon} color={sectionConfig.iconColor} boxSize={4} />
          <Text
            color={sectionConfig.labelColor || 'whiteAlpha.800'}
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {section.label}
          </Text>
        </HStack>
        <Text
          as="div"
          color={sectionConfig.textColor || 'whiteAlpha.900'}
          fontSize="sm"
          lineHeight="tall"
        >
          {isStatic ? (
            <Text whiteSpace="pre-wrap" wordBreak="break-word">
              {section.text}
            </Text>
          ) : (
            renderContentMethod(section, isTyping)
          )}
        </Text>
      </Box>
    )
  }
  // For keyTakeaway and actionItem
  return (
    <HStack
      bgGradient={`linear(to-br, ${sectionConfig.color}.800, ${sectionConfig.color}.900)`} // Darker gradient
      p={3.5} // More padding
      borderRadius="lg"
      border="1px solid"
      borderColor={sectionConfig.borderColor}
      spacing={3.5} // Increased spacing
      boxShadow={`0 4px 10px rgba(0,0,0,0.2), inset 0 1px 1px ${sectionConfig.color}.700`}
    >
      <Circle
        size="30px"
        bg={`${sectionConfig.color}.600`}
        boxShadow={`0 0 10px ${sectionConfig.color}.500`}
      >
        <Icon as={section.icon} color="white" boxSize={4} />
      </Circle>
      <VStack align="flex-start" spacing={0.5} flex={1}>
        {' '}
        {/* Increased spacing */}
        <Text
          color={sectionConfig.labelColor}
          fontSize="xs"
          fontWeight="bold"
          textTransform="uppercase"
        >
          {section.label}
        </Text>
        <Text
          as="div"
          color={sectionConfig.textColor}
          fontSize="sm"
          fontWeight="medium"
        >
          {isStatic ? (
            <Text whiteSpace="pre-wrap" wordBreak="break-word">
              {section.text}
            </Text>
          ) : (
            renderContentMethod(section, isTyping)
          )}
        </Text>
      </VStack>
    </HStack>
  )
}

export default FollowUpQuestions
