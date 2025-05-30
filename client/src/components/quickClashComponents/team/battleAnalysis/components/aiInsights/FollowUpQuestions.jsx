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
  Spinner,
  Center,
  Progress,
  Circle,
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
  Brain,
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
    currentlyProcessingQuestionId,
    waitingForNextQuestion,
    isQuestionClickable,
    completeTypewriterAndShowNextQuestion,
  } = useQuickClashAnalysis()

  // Memoized responsive configuration - static values for performance
  const config = useMemo(
    () => ({
      isMobile: window.innerWidth < 768,
      headingSize: window.innerWidth < 768 ? 'md' : 'lg',
      questionTitleSize: window.innerWidth < 768 ? 'sm' : 'md',
    }),
    [],
  )

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
  const totalQuestionsToAsk = 3
  const isAnalysisComplete = questionProgression?.isComplete || false

  const handleQuestionClick = useCallback(
    async question => {
      if (!question || !isQuestionClickable(question.id) || question.answered) {
        return
      }

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
      isQuestionClickable,
      startTypewriterEffect,
    ],
  )

  // Handle typewriter completion to show next question
  const handleTypewriterComplete = useCallback(
    questionId => {
      // Shorter delay for better UX, especially for the last question
      setTimeout(() => {
        completeTypewriterAndShowNextQuestion({ questionId })
      }, 300) // Reduced from 500ms
    },
    [completeTypewriterAndShowNextQuestion],
  )

  if (
    questionsToShow.length === 0 &&
    !isAnalysisComplete &&
    !questionAnswerLoading
  ) {
    return (
      <Center p={6} minH="160px">
        <VStack spacing={3}>
          <Spinner color="purple.400" size="lg" thickness="3px" />
          <Text color="whiteAlpha.800" fontSize="sm" fontWeight="medium">
            {t('Preparing your personalized insights...')}
          </Text>
          <Text color="whiteAlpha.600" fontSize="xs">
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
      <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Box
          bg="rgba(139, 92, 246, 0.15)"
          borderRadius="xl"
          p={6}
          border="1px solid"
          borderColor="purple.500"
          textAlign="center"
          boxShadow={
            config.isMobile
              ? '0 6px 20px rgba(139, 92, 246, 0.15)'
              : '0 8px 25px rgba(139, 92, 246, 0.2)'
          }
        >
          <VStack spacing={4}>
            <MotionBox
              animate={
                config.isMobile
                  ? {}
                  : {
                      scale: [1, 1.05, 1],
                      color: ['#6EE7B7', '#34D399', '#6EE7B7'],
                    }
              }
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon as={CheckCircle} color="green.400" boxSize={8} />
            </MotionBox>
            <Heading size="md" color="white" fontWeight="semibold">
              {t('Analysis Complete!')}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="sm">
              {t("You've explored all AI insights for this battle. Great job!")}
            </Text>
          </VStack>
        </Box>
      </MotionBox>
    )
  }

  return (
    <VStack spacing={{ base: 4, md: 5 }} w="100%">
      <VStack spacing={3} w="100%">
        <HStack spacing={3} w="100%" justify="space-between">
          <HStack spacing={3}>
            <Icon
              as={MessageCircle}
              color="purple.300"
              boxSize={{ base: 5, md: 6 }}
            />
            <VStack align="flex-start" spacing={0.5}>
              <Heading
                size={config.headingSize}
                color="white"
                fontWeight="bold"
              >
                {t('AI Deep Dive')}
              </Heading>
              <Text color="whiteAlpha.700" fontSize={{ base: 'xs', md: 'sm' }}>
                {t('Question {{current}} of {{total}}', {
                  current: Math.min(currentQuestionNumber, totalQuestionsToAsk),
                  total: totalQuestionsToAsk,
                })}
              </Text>
            </VStack>
          </HStack>
          <Badge
            bgGradient="linear(to-r, purple.600, pink.500)"
            color="white"
            px={3}
            py={1.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            boxShadow="0 3px 8px rgba(0,0,0,0.25)"
          >
            {isAnalysisComplete ? t('Complete') : t('Progressive Analysis')}
          </Badge>
        </HStack>
      </VStack>
      <VStack spacing={3} w="100%" align="stretch">
        {answeredQuestions.map((question, index) => (
          <MotionBox
            key={`answered-${question.id}`}
            layout
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03, ease: 'easeOut' }}
          >
            <QuestionCard
              question={question}
              isCurrentlyLoadingAnswer={false}
              onClick={() => {}}
              titleSize={config.questionTitleSize}
              isAnsweredCard={true}
              isMobile={config.isMobile}
              onTypewriterComplete={handleTypewriterComplete}
            />
          </MotionBox>
        ))}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <MotionBox
              key={`current-${currentQuestion.id}`}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <QuestionCard
                question={currentQuestion}
                isCurrentlyLoadingAnswer={
                  currentlyProcessingQuestionId === currentQuestion.id
                }
                onClick={() => handleQuestionClick(currentQuestion)}
                titleSize={config.questionTitleSize}
                isAnsweredCard={false}
                isMobile={config.isMobile}
                onTypewriterComplete={handleTypewriterComplete}
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
  isMobile,
  onTypewriterComplete,
}) => {
  const { t } = useTranslation('QuickClash')
  const { typewriterStates, isQuestionClickable } = useQuickClashAnalysis()
  const categoryConfig =
    categoryConfigs[question.category] || categoryConfigs.default
  const [isHovered, setIsHovered] = useState(false)

  const answer = question.answer
  const canClick = !isAnsweredCard && isQuestionClickable(question.id)

  const currentQuestionTypewriterState = typewriterStates[question.id]

  // Only show "Thinking..." when we have an answer and are about to start typing
  const isPreparingToType =
    currentQuestionTypewriterState?.isTyping &&
    !!answer?.content &&
    !isCurrentlyLoadingAnswer

  const shouldStartTypingAnimation =
    currentQuestionTypewriterState?.isTyping &&
    !!answer?.content &&
    !isCurrentlyLoadingAnswer

  // Enhanced loading state check - this is for the brain icon in the top right
  const isQuestionBeingProcessed = isCurrentlyLoadingAnswer

  return (
    <MotionBox
      onHoverStart={() => canClick && !isMobile && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
      animate={
        canClick && !isAnsweredCard && !isQuestionBeingProcessed
          ? {
              y: isMobile ? [0, -1, 0] : [0, -2, 0], // Subtle bounce - smaller on mobile
            }
          : {}
      }
      whileHover={
        canClick && !isMobile
          ? {
              y: -2,
              boxShadow: `0 8px 15px rgba(0,0,0,0.25), 0 0 12px ${categoryConfig.color}.400`,
            }
          : {}
      }
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        // Bounce animation settings
        y: {
          duration: isMobile ? 2.5 : 3, // Slower on mobile for performance
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: isMobile ? 3 : 2.5, // Longer delay on mobile
        },
      }}
    >
      <Box
        position="relative"
        bg={isAnsweredCard ? `rgba(0,0,0,0.35)` : `rgba(10, 5, 20, 0.55)`}
        backdropFilter={isMobile ? 'none' : 'blur(10px)'}
        borderRadius="xl"
        border="1px solid"
        borderColor={
          isAnsweredCard
            ? `${categoryConfig.color}.600`
            : isHovered && canClick
            ? `${categoryConfig.color}.400`
            : isQuestionBeingProcessed
            ? `${categoryConfig.color}.500`
            : 'rgba(255,255,255,0.12)'
        }
        p={{ base: 3, md: 4 }}
        cursor={
          canClick ? 'pointer' : isQuestionBeingProcessed ? 'wait' : 'default'
        }
        onClick={canClick ? onClick : undefined}
        overflow="hidden"
        boxShadow={
          isAnsweredCard
            ? `inset 0 0 15px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)`
            : isQuestionBeingProcessed
            ? `0 0 15px ${categoryConfig.color}.500, 0 4px 12px rgba(0,0,0,0.15)`
            : `0 4px 12px rgba(0,0,0,0.15)`
        }
        opacity={canClick || isAnsweredCard ? 1 : 0.7}
        transform={isQuestionBeingProcessed ? 'scale(1.02)' : 'scale(1)'}
        transition="all 0.3s ease-in-out"
      >
        {isAnsweredCard && (
          <Box
            position="absolute"
            inset={0}
            bgGradient={categoryConfig.gradient}
            opacity={0.08}
            zIndex={0}
          />
        )}
        {!isAnsweredCard && isHovered && canClick && !isMobile && (
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

        <VStack align="stretch" spacing={3} position="relative" zIndex={1}>
          <HStack justify="space-between" align="flex-start">
            <HStack spacing={3} flex={1} minW={0}>
              <Text fontSize={{ base: 'xl', md: '2xl' }} userSelect="none">
                {question.emoji || '🤔'}
              </Text>
              <VStack align="flex-start" spacing={1} flex={1} overflow="hidden">
                <HStack spacing={2}>
                  <Badge
                    bgGradient={categoryConfig.gradient}
                    color="white"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    boxShadow="0 2px 4px rgba(0,0,0,0.15)"
                  >
                    {t(categoryConfig.name) || t('General')}
                  </Badge>
                  {question.questionIndex && (
                    <Badge
                      variant="outline"
                      borderColor="whiteAlpha.500"
                      color="whiteAlpha.800"
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
                  title={question.question}
                >
                  {question.question}
                </Text>
              </VStack>
            </HStack>
            <Box pt={0.5} minW="35px" textAlign="center">
              {isQuestionBeingProcessed ? (
                <VStack spacing={0.5} align="center">
                  <MotionBox
                    animate={
                      isMobile
                        ? { rotate: [0, 360] }
                        : {
                            scale: [1, 1.1, 1],
                            rotate: [0, 360],
                            opacity: [0.6, 1, 0.6],
                          }
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Icon
                      as={Brain}
                      color={`${categoryConfig.color}.400`}
                      boxSize="24px"
                    />
                  </MotionBox>
                  <Text
                    fontSize="3xs"
                    color={`${categoryConfig.color}.300`}
                    fontWeight="bold"
                    lineHeight="1"
                    textTransform="uppercase"
                  >
                    {t('Thinking...')}
                  </Text>
                </VStack>
              ) : isAnsweredCard ? (
                <Icon as={CheckCircle} color="green.400" boxSize={5} />
              ) : (
                <MotionBox
                  animate={
                    isHovered && !isMobile
                      ? { x: [0, 3, 0], opacity: [0.7, 1, 0.7] }
                      : { x: 0, opacity: 0.7 }
                  }
                  transition={{
                    x: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                    opacity: {
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                >
                  <Icon
                    as={ChevronRight}
                    color={`${categoryConfig.color}.300`}
                    boxSize={5}
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
                transition={{ duration: 0.4, ease: 'easeOut' }}
                overflow="hidden"
              >
                <TypewriterAnswer
                  answer={answer}
                  categoryConfig={categoryConfig}
                  questionId={question.id}
                  shouldStartTyping={shouldStartTypingAnimation}
                  isStaticDisplay={
                    isAnsweredCard && !shouldStartTypingAnimation
                  }
                  isMobile={isMobile}
                  onTypewriterComplete={onTypewriterComplete}
                />
              </MotionBox>
            ) : !isQuestionBeingProcessed &&
              !isPreparingToType &&
              question.preview &&
              !isAnsweredCard ? (
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
  isMobile,
  onTypewriterComplete,
}) => {
  const { t } = useTranslation('QuickClash')
  const [currentTypingSectionKey, setCurrentTypingSectionKey] = useState(null)
  const [completedSectionKeys, setCompletedSectionKeys] = useState(new Set())
  const [showThinkingIndicator, setShowThinkingIndicator] = useState(false)
  const [allSectionsComplete, setAllSectionsComplete] = useState(false)

  const answerSections = useMemo(() => {
    const sections = []
    if (answer?.content)
      sections.push({
        key: 'content',
        text: answer.content,
        label: t('Detailed Analysis'),
        icon: Brain,
        config: categoryConfig,
      })
    if (answer?.keyTakeaway)
      sections.push({
        key: 'takeaway',
        text: answer.keyTakeaway,
        label: t('Key Insight'),
        icon: Sparkles,
        config: categoryConfig,
      })
    if (answer?.actionItem)
      sections.push({
        key: 'action',
        text: answer.actionItem,
        label: t('Actionable Tip'),
        icon: Lightbulb,
        config: categoryConfigs.improvement,
      })
    return sections
  }, [answer, t, categoryConfig])

  useEffect(() => {
    setCompletedSectionKeys(new Set())
    setCurrentTypingSectionKey(null)
    setShowThinkingIndicator(false)
    setAllSectionsComplete(false)

    if (shouldStartTyping && answerSections.length > 0) {
      setShowThinkingIndicator(true)
      const timer = setTimeout(
        () => {
          setCurrentTypingSectionKey(answerSections[0].key)
        },
        isMobile ? 400 : 600,
      )
      return () => clearTimeout(timer)
    }
  }, [questionId, shouldStartTyping, answerSections, isMobile])

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
        setShowThinkingIndicator(true)
        const timer = setTimeout(
          () => {
            setCurrentTypingSectionKey(answerSections[currentIndex + 1].key)
            setShowThinkingIndicator(false)
          },
          isMobile ? 300 : 400,
        )
        return () => clearTimeout(timer)
      } else {
        // All sections completed
        setCurrentTypingSectionKey(null)
        setShowThinkingIndicator(false)
        setAllSectionsComplete(true)

        // Notify parent that typewriter is complete after a short delay
        setTimeout(() => {
          if (onTypewriterComplete) {
            onTypewriterComplete(questionId)
          }
        }, 800) // Slightly shorter delay
      }
    },
    [
      answerSections,
      completedSectionKeys,
      isMobile,
      onTypewriterComplete,
      questionId,
    ],
  )

  const renderSectionContent = (section, isTyping) => {
    const typewriterOptions = {
      delay: isMobile ? 20 : 15,
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
                .pauseFor(100)
                .callFunction(() => handleSectionTyped(section.key))
                .start()
            }}
          />
        ) : (
          <Text whiteSpace="pre-wrap" wordBreak="break-word">
            {section.text}
          </Text>
        )}
      </Box>
    )
  }

  if (isStaticDisplay) {
    return (
      <VStack
        align="stretch"
        spacing={3}
        pt={3}
        borderTop="1px dashed"
        borderColor="rgba(255,255,255,0.15)"
      >
        {answerSections.map(section => (
          <SectionDisplay key={section.key} section={section} isStatic={true} />
        ))}
      </VStack>
    )
  }

  if (!shouldStartTyping && !isStaticDisplay) return null

  return (
    <VStack
      align="stretch"
      spacing={3}
      pt={3}
      borderTop="1px dashed"
      borderColor="rgba(255,255,255,0.15)"
    >
      {answerSections.map(section => {
        const isCurrentlyTypingThisSection =
          currentTypingSectionKey === section.key
        const isCompleted = completedSectionKeys.has(section.key)

        if (!isCurrentlyTypingThisSection && !isCompleted) return null

        return (
          <MotionBox
            key={section.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
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
        currentTypingSectionKey &&
        !allSectionsComplete && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HStack spacing={2} justify="center" opacity={0.8} pt={1}>
              <Spinner
                color={`${categoryConfig.color}.400`}
                size="xs"
                speed="0.9s"
              />
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
        bg="rgba(255,255,255,0.03)"
        backdropFilter="blur(4px)"
        borderRadius="lg"
        p={3}
        border="1px solid"
        borderColor="rgba(255,255,255,0.1)"
        minH="45px"
      >
        <HStack spacing={2.5} mb={1.5} opacity={0.8}>
          <Icon
            as={section.icon}
            color={sectionConfig.iconColor}
            boxSize={3.5}
          />
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
      bgGradient={`linear(to-br, ${sectionConfig.color}.800, ${sectionConfig.color}.900)`}
      p={3}
      borderRadius="lg"
      border="1px solid"
      borderColor={sectionConfig.borderColor}
      spacing={3}
      boxShadow={`0 3px 8px rgba(0,0,0,0.15), inset 0 1px 1px ${sectionConfig.color}.700`}
    >
      <Circle
        size="28px"
        bg={`${sectionConfig.color}.600`}
        boxShadow={`0 0 8px ${sectionConfig.color}.500`}
      >
        <Icon as={section.icon} color="white" boxSize={3.5} />
      </Circle>
      <VStack align="flex-start" spacing={0.5} flex={1}>
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
