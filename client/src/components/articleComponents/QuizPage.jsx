// Optimized QuizPage.jsx with performance enhancements
// Location: client/src/components/articleComponents/QuizPage.jsx
// Optimizations: State consolidation, memoization, efficient responsive calculations, improved scroll handling

import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  memo,
} from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Circle,
  useMediaQuery,
  Icon,
  Flex,
  Container,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { CheckIcon, CircleX, Zap, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionFlex = motion(Flex)

// Memoized animation variants to prevent recreation
const containerVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

const optionVariants = {
  initial: index => ({
    opacity: 0,
    x: index % 2 === 0 ? -20 : 20,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  hover: {
    scale: 1.02,
    y: -2,
  },
  tap: {
    scale: 0.98,
  },
}

const scrollIndicatorVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 0.7, y: 0 },
}

// Optimized responsive configuration with memoization
const getResponsiveConfig = (breakpoint, isLandscape, isMobile) => {
  const baseConfigs = {
    base: {
      containerPadding: 2,
      containerMargin: 1,
      spacing: 2,
      questionFontSize: 'md',
      optionFontSize: 'sm',
      circleSize: '24px',
      minHeight: '48px',
      maxWidth: '100%',
      headerSize: 'sm',
      borderRadius: 'md',
      iconSize: 3,
    },
    sm: {
      containerPadding: 3,
      containerMargin: 2,
      spacing: 3,
      questionFontSize: 'lg',
      optionFontSize: 'sm',
      circleSize: '28px',
      minHeight: '52px',
      maxWidth: '95%',
      headerSize: 'md',
      borderRadius: 'lg',
      iconSize: 4,
    },
    md: {
      containerPadding: 4,
      containerMargin: 3,
      spacing: 4,
      questionFontSize: 'xl',
      optionFontSize: 'md',
      circleSize: '32px',
      minHeight: '56px',
      maxWidth: '90%',
      headerSize: 'lg',
      borderRadius: 'lg',
      iconSize: 4,
    },
    lg: {
      containerPadding: 5,
      containerMargin: 4,
      spacing: 5,
      questionFontSize: '2xl',
      optionFontSize: 'md',
      circleSize: '36px',
      minHeight: '60px',
      maxWidth: '650px',
      headerSize: 'xl',
      borderRadius: 'xl',
      iconSize: 5,
    },
  }

  const config = baseConfigs[breakpoint] || baseConfigs.base

  // Apply landscape adjustments
  if (isLandscape && isMobile) {
    return {
      ...config,
      questionFontSize: 'sm',
      optionFontSize: 'xs',
      spacing: 2,
      containerPadding: 2,
      minHeight: '40px',
      circleSize: '20px',
    }
  }

  return config
}

// Memoized scroll button component
const ScrollButton = memo(({ direction, onClick, ...props }) => (
  <MotionBox
    variants={scrollIndicatorVariants}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.3 }}
    {...props}
  >
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      bg="rgba(0,0,0,0.6)"
      color="white"
      borderRadius="full"
      p={1}
      minW="auto"
      h="auto"
      _hover={{ bg: 'rgba(0,0,0,0.8)' }}
    >
      <Icon
        as={ChevronDown}
        boxSize={4}
        transform={direction === 'up' ? 'rotate(180deg)' : 'none'}
      />
    </Button>
  </MotionBox>
))

ScrollButton.displayName = 'ScrollButton'

// Memoized statistics bar component
const StatisticsBar = memo(({ percentage, isMobile }) => (
  <Box mt={2} w="100%">
    <Flex justify="space-between" align="center" mb={1}>
      <Text
        fontSize={isMobile ? '2xs' : 'xs'}
        color="whiteAlpha.700"
        fontWeight="500"
      >
        {percentage}%
      </Text>
    </Flex>
    <Box
      w="100%"
      h={isMobile ? '2px' : '3px'}
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius="full"
      overflow="hidden"
    >
      <MotionBox
        h="100%"
        bg="linear-gradient(90deg, #9F7AEA, #D69E2E)"
        borderRadius="full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />
    </Box>
  </Box>
))

StatisticsBar.displayName = 'StatisticsBar'

const QuizPage = memo(
  ({
    question,
    onAnswer,
    showStatistics = false,
    selectedAnswer = null,
    isCorrect = null,
    disabled = false,
    statistics = null,
    isAuthenticated = true,
  }) => {
    // Optimized media queries with reduced calls
    const [isMobile] = useMediaQuery('(max-width: 480px)')
    const [isTablet] = useMediaQuery('(max-width: 768px)')
    const [isLandscape] = useMediaQuery('(orientation: landscape)')
    const [isTouch] = useMediaQuery('(hover: none) and (pointer: coarse)')
    const [startTime] = useState(Date.now())
    const [hasEmittedStartEvent, setHasEmittedStartEvent] = useState(false)

    // Consolidated scroll state
    const [scrollState, setScrollState] = useState({
      canScrollUp: false,
      canScrollDown: false,
      isScrolling: false,
    })

    const scrollContainerRef = useRef(null)
    const scrollTimeoutRef = useRef(null)
    const { t } = useTranslation('GameHub')

    // Determine current breakpoint for responsive config
    const currentBreakpoint = useMemo(() => {
      if (!isTablet) return 'lg'
      if (!isMobile) return 'md'
      return isTablet ? 'sm' : 'base'
    }, [isMobile, isTablet])

    // Memoized responsive configuration
    const responsiveConfig = useMemo(
      () => getResponsiveConfig(currentBreakpoint, isLandscape, isMobile),
      [currentBreakpoint, isLandscape, isMobile],
    )

    // Optimized scroll detection with throttling
    const checkScrollState = useCallback(() => {
      const container = scrollContainerRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const canScrollUp = scrollTop > 5
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 5

      setScrollState(prevState => {
        // Only update if state actually changed
        if (
          prevState.canScrollUp !== canScrollUp ||
          prevState.canScrollDown !== canScrollDown
        ) {
          return {
            canScrollUp,
            canScrollDown,
            isScrolling: false,
          }
        }
        return prevState
      })
    }, [])

    // Debounced scroll state check
    const debouncedScrollCheck = useCallback(() => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(checkScrollState, 16) // ~60fps
    }, [checkScrollState])

    // Optimized smooth scroll handlers
    const scrollTo = useCallback(
      direction => {
        const container = scrollContainerRef.current
        if (!container) return

        setScrollState(prev => ({ ...prev, isScrolling: true }))

        const scrollAmount = container.clientHeight * 0.4
        const targetScroll =
          direction === 'up'
            ? container.scrollTop - scrollAmount
            : container.scrollTop + scrollAmount

        container.scrollTo({
          top: Math.max(
            0,
            Math.min(
              targetScroll,
              container.scrollHeight - container.clientHeight,
            ),
          ),
          behavior: 'smooth',
        })

        setTimeout(() => {
          setScrollState(prev => ({ ...prev, isScrolling: false }))
          checkScrollState()
        }, 300)
      },
      [checkScrollState],
    )

    const handleScrollUp = useCallback(() => scrollTo('up'), [scrollTo])
    const handleScrollDown = useCallback(() => scrollTo('down'), [scrollTo])

    useEffect(() => {
      if (!hasEmittedStartEvent) {
        window.dispatchEvent(
          new CustomEvent('inlineQuizStart', {
            detail: {
              questionId: question._id,
              questionText: question.question,
              timestamp: Date.now(),
            },
          }),
        )
        setHasEmittedStartEvent(true)
      }
    }, [question._id, hasEmittedStartEvent])
    // Event listeners with proper cleanup
    useEffect(() => {
      const container = scrollContainerRef.current
      if (!container) return

      const handleScroll = () => {
        if (!scrollState.isScrolling) {
          debouncedScrollCheck()
        }
      }

      const handleResize = () => {
        setTimeout(debouncedScrollCheck, 100)
      }

      container.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize)

      // Initial check after a brief delay
      setTimeout(debouncedScrollCheck, 100)

      return () => {
        container.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }, [debouncedScrollCheck, scrollState.isScrolling])

    // Memoized option styles calculation
    const getOptionStyles = useCallback(
      optionIndex => {
        const isSelected = selectedAnswer === optionIndex
        const isCorrectAnswer = optionIndex === question.correctAnswer
        const isWrongSelected = isSelected && !isCorrectAnswer && showStatistics

        if (!showStatistics) {
          return {
            bg: isSelected
              ? 'rgba(159, 122, 234, 0.2)'
              : 'rgba(255, 255, 255, 0.08)',
            borderColor: isSelected ? '#9F7AEA' : 'rgba(255, 255, 255, 0.2)',
            shadow: isSelected ? '0 0 15px rgba(159, 122, 234, 0.5)' : 'none',
            transform: isSelected ? 'scale(1.01)' : 'scale(1)',
          }
        }

        if (isCorrectAnswer) {
          return {
            bg: 'rgba(72, 187, 120, 0.2)',
            borderColor: '#48BB78',
            shadow: '0 0 15px rgba(72, 187, 120, 0.4)',
            transform: 'scale(1)',
          }
        }

        if (isWrongSelected) {
          return {
            bg: 'rgba(245, 101, 101, 0.2)',
            borderColor: '#F56565',
            shadow: '0 0 15px rgba(245, 101, 101, 0.4)',
            transform: 'scale(1)',
          }
        }

        return {
          bg: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          shadow: 'none',
          transform: 'scale(1)',
        }
      },
      [showStatistics, selectedAnswer, question.correctAnswer],
    )

    const handleAnswerClick = useCallback(
      answerIndex => {
        if (disabled || showStatistics) return

        const timeSpent = Date.now() - startTime
        const isAnswerCorrect = answerIndex === question.correctAnswerIndex

        // Call the original onAnswer function
        onAnswer(answerIndex)

        // NEW: Emit tracking event for quiz performance
        window.dispatchEvent(
          new CustomEvent('inlineQuizAnswer', {
            detail: {
              questionId: question._id,
              answerIndex,
              isCorrect: isAnswerCorrect,
              timeSpent,
              questionText: question.question,
              selectedOption: question.options[answerIndex],
              timestamp: Date.now(),
            },
          }),
        )

        // NEW: Also emit the completion event for backward compatibility
        window.dispatchEvent(
          new CustomEvent('inlineQuizCompleted', {
            detail: {
              score: isAnswerCorrect ? 1 : 0,
              totalQuestions: 1,
              hasCompleted: true,
              questionId: question._id,
            },
          }),
        )
      },
      [disabled, startTime, onAnswer, question, showStatistics],
    )

    // Memoized option icon
    const getOptionIcon = useCallback(
      optionIndex => {
        if (!showStatistics) return String.fromCharCode(65 + optionIndex)

        if (optionIndex === question.correctAnswer) {
          return (
            <Icon
              as={CheckIcon}
              color="#48BB78"
              boxSize={responsiveConfig.iconSize}
            />
          )
        }

        if (
          selectedAnswer === optionIndex &&
          optionIndex !== question.correctAnswer
        ) {
          return (
            <Icon
              as={CircleX}
              color="#F56565"
              boxSize={responsiveConfig.iconSize}
            />
          )
        }

        return String.fromCharCode(65 + optionIndex)
      },
      [
        showStatistics,
        selectedAnswer,
        question.correctAnswer,
        responsiveConfig.iconSize,
      ],
    )

    // Memoized statistics bar
    const getStatisticsBar = useCallback(
      optionIndex => {
        if (!statistics || !showStatistics) return null

        const percentage = statistics.optionPercentages[optionIndex] || 0

        return <StatisticsBar percentage={percentage} isMobile={isMobile} />
      },
      [statistics, showStatistics, isMobile],
    )

    // Memoized CSS styles for better performance
    const scrollContainerStyles = useMemo(
      () => ({
        '&::-webkit-scrollbar': {
          width: isMobile ? '2px' : '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(159, 122, 234, 0.5)',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(159, 122, 234, 0.7)',
        },
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        ...(isTouch && {
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
        }),
      }),
      [isMobile, isTouch],
    )

    return (
      <MotionBox
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.4, ease: 'easeOut' }}
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={responsiveConfig.containerMargin}
        position="relative"
      >
        {/* Scroll Indicators */}
        {scrollState.canScrollUp && (
          <ScrollButton
            direction="up"
            onClick={handleScrollUp}
            position="absolute"
            top={2}
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
          />
        )}

        {scrollState.canScrollDown && (
          <ScrollButton
            direction="down"
            onClick={handleScrollDown}
            position="absolute"
            bottom={2}
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
          />
        )}

        {/* Main Container */}
        <Container
          maxW={responsiveConfig.maxWidth}
          w="100%"
          h="100%"
          p={0}
          centerContent={false}
        >
          <Box
            ref={scrollContainerRef}
            w="100%"
            h="100%"
            bg="rgba(30, 41, 59, 0.95)"
            backdropFilter="blur(20px)"
            borderRadius={responsiveConfig.borderRadius}
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.15)"
            boxShadow={
              isMobile
                ? '0 15px 35px rgba(0, 0, 0, 0.4)'
                : '0 25px 50px rgba(0, 0, 0, 0.5)'
            }
            position="relative"
            overflow="auto"
            css={scrollContainerStyles}
          >
            <VStack
              spacing={responsiveConfig.spacing}
              p={responsiveConfig.containerPadding}
              align="stretch"
              minH="100%"
              justify="flex-start"
            >
              {/* Header */}
              <MotionFlex
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                justify="center"
                align="center"
                flexWrap="wrap"
                gap={2}
                py={isMobile ? 1 : 2}
              >
                <HStack spacing={isMobile ? 2 : 3}>
                  <Circle
                    size={isMobile ? '24px' : '32px'}
                    bg="linear-gradient(135deg, #9F7AEA, #D69E2E)"
                  >
                    <Icon as={Zap} boxSize={isMobile ? 3 : 4} color="white" />
                  </Circle>
                  <Text
                    fontSize={responsiveConfig.headerSize}
                    fontWeight="700"
                    color="white"
                    textAlign="center"
                  >
                    Interactive Quiz
                  </Text>
                </HStack>
              </MotionFlex>

              {/* Auth Notice */}
              {!isAuthenticated && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  w="100%"
                  bg="rgba(255, 215, 0, 0.1)"
                  border="1px solid rgba(255, 215, 0, 0.3)"
                  borderRadius={responsiveConfig.borderRadius}
                  p={responsiveConfig.containerPadding}
                >
                  <Text
                    fontSize={responsiveConfig.optionFontSize}
                    color="yellow.100"
                    textAlign="center"
                    lineHeight="1.4"
                  >
                    Sign in to participate and see statistics
                  </Text>
                </MotionBox>
              )}

              {/* Results Notice */}
              {showStatistics && isAuthenticated && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  w="100%"
                  bg="rgba(72, 187, 120, 0.1)"
                  border="1px solid rgba(72, 187, 120, 0.3)"
                  borderRadius={responsiveConfig.borderRadius}
                  p={responsiveConfig.containerPadding}
                >
                  <Text
                    fontSize={responsiveConfig.optionFontSize}
                    color="green.100"
                    textAlign="center"
                    fontWeight="500"
                    lineHeight="1.4"
                  >
                    {isCorrect
                      ? '🎉 Correct! Well done!'
                      : '❌ Incorrect, but great effort!'}
                  </Text>
                </MotionBox>
              )}

              {/* Question */}
              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                w="100%"
                bg="rgba(255, 255, 255, 0.06)"
                borderRadius={responsiveConfig.borderRadius}
                p={responsiveConfig.containerPadding}
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
              >
                <Text
                  fontSize={responsiveConfig.questionFontSize}
                  fontWeight="600"
                  color="white"
                  textAlign="center"
                  lineHeight="1.4"
                  wordBreak="break-word"
                >
                  {question.question}
                </Text>
              </MotionBox>

              {/* Options */}
              <VStack spacing={responsiveConfig.spacing} w="100%">
                {question.options.map((option, index) => {
                  const styles = getOptionStyles(index)

                  return (
                    <MotionButton
                      key={index}
                      custom={index}
                      variants={optionVariants}
                      initial="initial"
                      animate="animate"
                      whileHover={
                        !disabled && !showStatistics && isAuthenticated
                          ? 'hover'
                          : {}
                      }
                      whileTap={
                        !disabled && !showStatistics && isAuthenticated
                          ? 'tap'
                          : {}
                      }
                      transition={{
                        delay: 0.5 + index * 0.05,
                        duration: 0.4,
                        ease: 'easeOut',
                      }}
                      onClick={() => handleAnswerClick(index)}
                      w="100%"
                      h="auto"
                      minH={responsiveConfig.minHeight}
                      p={responsiveConfig.containerPadding}
                      bg={styles.bg}
                      border="2px solid"
                      borderColor={styles.borderColor}
                      borderRadius={responsiveConfig.borderRadius}
                      color="white"
                      fontSize={responsiveConfig.optionFontSize}
                      fontWeight="500"
                      textAlign="left"
                      isDisabled={disabled}
                      cursor={
                        disabled || showStatistics ? 'not-allowed' : 'pointer'
                      }
                      boxShadow={styles.shadow}
                      _hover={{
                        bg:
                          !disabled && !showStatistics && isAuthenticated
                            ? 'rgba(255, 255, 255, 0.12)'
                            : undefined,
                        borderColor:
                          !disabled && !showStatistics && isAuthenticated
                            ? 'rgba(159, 122, 234, 0.6)'
                            : undefined,
                      }}
                      _active={{
                        transform: 'scale(0.98)',
                      }}
                      position="relative"
                      overflow="hidden"
                      minTouchTarget={isTouch ? '44px' : undefined}
                    >
                      <Flex w="100%" align="flex-start" gap={isMobile ? 2 : 3}>
                        <Circle
                          size={responsiveConfig.circleSize}
                          bg="rgba(255, 255, 255, 0.1)"
                          border="1px solid rgba(255, 255, 255, 0.2)"
                          color="white"
                          fontSize={isMobile ? 'xs' : 'sm'}
                          fontWeight="600"
                          flexShrink={0}
                          mt={0.5}
                        >
                          {getOptionIcon(index)}
                        </Circle>
                        <Box flex={1} textAlign="left">
                          <Text
                            lineHeight="1.4"
                            wordBreak="break-word"
                            whiteSpace="normal"
                            textAlign="left"
                          >
                            {option}
                          </Text>
                          {getStatisticsBar(index)}
                        </Box>
                      </Flex>

                      {/* Selection effect */}
                      {selectedAnswer === index && !showStatistics && (
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="linear-gradient(90deg, transparent, rgba(159, 122, 234, 0.1), transparent)"
                          animation="pulse 2s ease-in-out infinite"
                          pointerEvents="none"
                        />
                      )}

                      {/* Ripple effect for touch devices */}
                      {isTouch && (
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          w="0"
                          h="0"
                          bg="rgba(255, 255, 255, 0.3)"
                          borderRadius="50%"
                          transform="translate(-50%, -50%)"
                          pointerEvents="none"
                          _active={{
                            animation: 'ripple 0.6s ease-out',
                          }}
                        />
                      )}
                    </MotionButton>
                  )
                })}
              </VStack>

              {/* Spacer for bottom padding */}
              <Box h={isMobile ? 2 : 4} />
            </VStack>
          </Box>
        </Container>

        {/* CSS for animations */}
        <style jsx>{`
          @keyframes pulse {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.1;
            }
          }

          @keyframes ripple {
            to {
              width: 100px;
              height: 100px;
              opacity: 0;
            }
          }
        `}</style>
      </MotionBox>
    )
  },
)

QuizPage.displayName = 'QuizPage'

export default QuizPage
