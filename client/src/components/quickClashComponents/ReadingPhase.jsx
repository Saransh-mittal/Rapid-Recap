// components/quickClashComponents/ReadingPhase.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Icon,
  Container,
  useBreakpointValue,
  Badge,
  Tooltip,
  useToken,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  Clock,
} from 'lucide-react'
import MainArticleContent from '../articleComponents/MainArticleContent'
import world from '/images/quickclash/world_quickclash.webp'
import politics from '/images/quickclash/politics_quickclash.webp'
import tech from '/images/quickclash/technology_quickclash.webp'
import science from '/images/quickclash/science_quickclash.webp'
import health from '/images/quickclash/health_quickclash.webp'
import business from '/images/quickclash/business_quickclash.webp'
import sports from '/images/quickclash/sports_quickclash.webp'
import entertainment from '/images/quickclash/entertainment_quickclash.webp'
import education from '/images/quickclash/education_quickclash.webp'
import lifestyle from '/images/quickclash/lifestyle_quickclash.webp'
import environment from '/images/quickclash/environment_quickclash.webp'
import food from '/images/quickclash/food_quickclash.webp'
import tourism from '/images/quickclash/tourism_quickclash.webp'
import crime from '/images/quickclash/crime_quickclash.webp'

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionBadge = motion(Badge)
const MotionText = motion(Text)

// Function to get the appropriate image based on category
const getCategoryImage = category => {
  if (!category) return null

  const categoryLower = category.toLowerCase()

  const categoryImageMap = {
    world: world,
    politics: politics,
    technology: tech,
    science: science,
    health: health,
    business: business,
    sports: sports,
    entertainment: entertainment,
    education: education,
    lifestyle: lifestyle,
    environment: environment,
    food: food,
    tourism: tourism,
    crime: crime,
  }

  return categoryImageMap[categoryLower] || null
}

// Format time display as MM:SS
const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Get button styling based on time remaining and scroll status
const getButtonStyles = (timeLeft, hasScrolledToBottom) => {
  // Base styles that apply in all cases
  const baseStyles = {
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    w: '100%',
    maxW: '400px',
  }

  // If user hasn't scrolled to bottom yet
  if (!hasScrolledToBottom) {
    return {
      ...baseStyles,
      bgGradient: 'linear(to-r, purple.500, purple.700)',
      _hover: {
        bgGradient: 'linear(to-r, purple.600, purple.800)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
      },
      opacity: 0.9,
    }
  }

  // Critical time (10 seconds or less)
  if (timeLeft <= 10) {
    return {
      ...baseStyles,
      bgGradient: 'linear(to-r, red.500, orange.500)',
      color: 'white',
      _hover: {
        bgGradient: 'linear(to-r, red.600, orange.600)',
        transform: 'translateY(-2px)',
      },
      boxShadow: '0 0 15px rgba(255, 59, 48, 0.6)',
      borderWidth: '1px',
      borderColor: 'red.400',
    }
  }

  // Low time (30 seconds or less)
  if (timeLeft <= 30) {
    return {
      ...baseStyles,
      bgGradient: 'linear(to-r, orange.400, yellow.400)',
      _hover: {
        bgGradient: 'linear(to-r, orange.500, yellow.500)',
        transform: 'translateY(-2px)',
      },
      boxShadow: '0 0 12px rgba(237, 137, 54, 0.5)',
    }
  }

  // Medium time (60 seconds or less)
  if (timeLeft <= 60) {
    return {
      ...baseStyles,
      bgGradient: 'linear(to-r, green.400, teal.400)',
      _hover: {
        bgGradient: 'linear(to-r, green.500, teal.500)',
        transform: 'translateY(-2px)',
      },
      boxShadow: '0 0 12px rgba(72, 187, 120, 0.4)',
    }
  }

  // Plenty of time (more than 60 seconds)
  return {
    ...baseStyles,
    bgGradient: 'linear(to-r, green.400, blue.400)',
    _hover: {
      bgGradient: 'linear(to-r, green.500, blue.500)',
      transform: 'translateY(-2px)',
    },
    boxShadow: '0 0 12px rgba(72, 187, 120, 0.4)',
  }
}

const ReadingPhase = ({ article, timeLeft, onComplete, category }) => {
  const { t } = useTranslation('QuickClash')
  const articleRef = useRef(null)
  const contentRef = useRef(null)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const maxWidth = useBreakpointValue({ base: '100%', md: '800px' })

  // Get color values for gradient effects
  const [red400, orange400, yellow400, green400, blue400, purple400] = useToken(
    'colors',
    [
      'red.400',
      'orange.400',
      'yellow.400',
      'green.400',
      'blue.400',
      'purple.400',
    ],
  )

  // Determine timer color based on remaining time
  const getTimerColorScheme = () => {
    if (timeLeft <= 10) return 'red'
    if (timeLeft <= 30) return 'orange'
    return 'blue'
  }

  // Get gradient background for the timer based on remaining time
  const getTimerGradient = () => {
    if (timeLeft <= 10) {
      return `linear-gradient(90deg, ${red400}, ${orange400})`
    } else if (timeLeft <= 30) {
      return `linear-gradient(90deg, ${orange400}, ${yellow400})`
    } else if (timeLeft <= 60) {
      return `linear-gradient(90deg, ${green400}, ${blue400})`
    } else {
      return `linear-gradient(90deg, ${blue400}, ${purple400})`
    }
  }

  // Get the appropriate image for the category
  const categoryImage = getCategoryImage(category)

  // Calculate scroll percentage based on window scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return

      const articleHeight = articleRef.current.getBoundingClientRect().height
      const windowHeight = window.innerHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - windowHeight

      // Calculate scroll percentage relative to the article
      const articleScrollProgress = Math.min(
        100,
        (scrollTop / scrollHeight) * 100,
      )

      setScrollPercentage(articleScrollProgress)

      // Check if we're near the bottom of the article
      const distanceFromBottom = scrollHeight - scrollTop
      if (distanceFromBottom < 100) {
        setHasScrolledToBottom(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Show a hint after 30 seconds if user hasn't scrolled much
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      if (scrollPercentage < 30 && !hasScrolledToBottom) {
        setShowHint(true)
      }
    }, 30000)

    return () => clearTimeout(hintTimer)
  }, [scrollPercentage, hasScrolledToBottom])

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      w="100%"
    >
      {/* Floating Timer - Always visible with dynamic styling */}
      <MotionBox
        position="fixed"
        top="10px"
        right="20px"
        zIndex={100}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Pulsing Background Effect */}
        {timeLeft <= 30 && (
          <MotionBox
            position="absolute"
            top="-2px"
            left="-2px"
            right="-2px"
            bottom="-2px"
            borderRadius="full"
            bg={
              timeLeft <= 10
                ? 'rgba(254, 78, 78, 0.2)'
                : 'rgba(254, 178, 78, 0.2)'
            }
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0.2, 0.6],
              transition: {
                duration: timeLeft <= 10 ? 0.8 : 1.2,
                repeat: Infinity,
                repeatType: 'reverse',
              },
            }}
          />
        )}

        <MotionBadge
          p={3}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={2}
          boxShadow={
            timeLeft <= 10
              ? '0 0 15px rgba(255, 59, 48, 0.5)'
              : timeLeft <= 30
              ? '0 0 10px rgba(255, 149, 0, 0.4)'
              : '0 4px 10px rgba(0, 0, 0, 0.3)'
          }
          bg={getTimerGradient()}
          color="white"
          fontWeight="bold"
          initial={{ scale: 1 }}
          animate={
            timeLeft <= 10
              ? {
                  scale: [1, 1.08, 1],
                  transition: {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  },
                }
              : timeLeft <= 30
              ? {
                  scale: [1, 1.04, 1],
                  transition: {
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  },
                }
              : {}
          }
        >
          <Icon as={Clock} className={timeLeft <= 10 ? 'ticker-icon' : ''} />
          <Text fontWeight="bold">{formatTime(timeLeft)}</Text>

          {/* Additional indicator for critical time */}
          {timeLeft <= 10 && (
            <Box
              as="span"
              w="8px"
              h="8px"
              borderRadius="full"
              bg="red.100"
              ml="1"
              className="blinker"
            />
          )}

          <style jsx>{`
            .ticker-icon {
              animation: tick 0.5s linear infinite;
            }
            @keyframes tick {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.2);
              }
              100% {
                transform: scale(1);
              }
            }
            .blinker {
              animation: blink 0.7s ease-in-out infinite;
            }
            @keyframes blink {
              0% {
                opacity: 0.2;
              }
              50% {
                opacity: 1;
              }
              100% {
                opacity: 0.2;
              }
            }
          `}</style>
        </MotionBadge>
      </MotionBox>

      <VStack spacing={4} align="stretch">
        {/* Reading tips and info */}
        <Flex justify="center" mb={2}>
          <Badge colorScheme="purple" p={2} borderRadius="md" fontSize="sm">
            <HStack>
              <Icon as={BookOpen} />
              <Text>{t('Read carefully to answer questions')}</Text>
            </HStack>
          </Badge>
        </Flex>

        {showHint && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            p={3}
            borderRadius="md"
            bg="rgba(255, 214, 0, 0.1)"
            borderLeft="4px solid"
            borderColor="yellow.400"
          >
            <HStack>
              <Icon as={Lightbulb} color="yellow.400" />
              <Text fontSize="sm">
                {t(
                  'Tip: Remember to scroll through the entire article. Important information could be at the bottom!',
                )}
              </Text>
            </HStack>
          </MotionBox>
        )}

        {timeLeft <= 30 && (
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            p={3}
            borderRadius="md"
            bg="rgba(255, 50, 50, 0.1)"
            borderLeft="4px solid"
            borderColor="red.400"
          >
            <HStack>
              <Icon as={AlertCircle} color="red.400" />
              <Text fontSize="sm">
                {t('Time is running out! Reading phase will end soon.')}
              </Text>
            </HStack>
          </MotionBox>
        )}

        {/* Article content */}
        <Box
          ref={contentRef}
          borderRadius="lg"
          bg="rgba(26, 21, 39, 0.7)"
          p={1}
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.25)"
          border="1px solid"
          borderColor={hasScrolledToBottom ? 'green.700' : 'purple.800'}
          transition="border-color 0.3s ease"
        >
          <Container maxW={maxWidth} mx="auto" ref={articleRef} p={0}>
            {/* Article Header */}
            <Box mb={5}>
              <Heading size="lg" color="white" mb={3}>
                {article.title}
              </Heading>
              <HStack spacing={4} color="gray.300" fontSize="sm">
                <Text>{t('Challenge Article')}</Text>
                <Text>•</Text>
                <Text>
                  {t('Reading Time')}: 2 {t('minutes')}
                </Text>
              </HStack>
            </Box>

            {/* Article Content */}
            <MainArticleContent
              imgURL={categoryImage}
              mainText={article?.content}
              articleRef={articleRef}
              articleLoading={false}
              themedContent={''}
              dictionary={article?.dictionary}
              importantSentences={article?.importantSentences}
            />
          </Container>
        </Box>

        {/* Controls fixed at the bottom */}
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          p={4}
          bg="rgba(13, 10, 20, 0.95)"
          backdropFilter="blur(10px)"
          borderTop="1px solid"
          borderColor="whiteAlpha.200"
          zIndex={10}
        >
          <Container maxW="container.lg">
            <VStack spacing={3} align="center">
              {/* Progress bar with tooltip */}
              <Tooltip
                label={
                  hasScrolledToBottom
                    ? t('Article fully read!')
                    : `${Math.round(scrollPercentage)}% ${t('read')}`
                }
                placement="top"
              >
                <Box w="100%" position="relative">
                  <Box
                    w="100%"
                    h="4px"
                    bg="whiteAlpha.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${scrollPercentage}%`}
                      bg={hasScrolledToBottom ? 'green.400' : 'purple.400'}
                      borderRadius="full"
                      transition="width 0.2s, background-color 0.3s"
                    />
                  </Box>
                </Box>
              </Tooltip>

              <Text
                fontSize="sm"
                color={hasScrolledToBottom ? 'green.300' : 'whiteAlpha.600'}
              >
                {hasScrolledToBottom
                  ? t('Article fully read!')
                  : `${Math.round(scrollPercentage)}% ${t('read')}`}
              </Text>

              <Box position="relative" w="100%" maxW="400px" mx="auto">
                {/* Circular progress indicator */}
                {hasScrolledToBottom && (
                  <MotionBox
                    position="absolute"
                    top="-5px"
                    left="-5px"
                    right="-5px"
                    bottom="-5px"
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={
                      timeLeft <= 10
                        ? 'red.400'
                        : timeLeft <= 30
                        ? 'orange.400'
                        : 'green.400'
                    }
                    opacity={0.7}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: [0.4, 0.9, 0.4],
                      scale: [0.99, 1.01, 0.99],
                      transition: {
                        duration:
                          timeLeft <= 10 ? 0.8 : timeLeft <= 30 ? 1.5 : 3,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      },
                    }}
                    pointerEvents="none"
                  />
                )}

                {/* Timer circles that appear when time is running low */}
                {hasScrolledToBottom && timeLeft <= 30 && (
                  <>
                    <MotionBox
                      position="absolute"
                      top="50%"
                      left="0"
                      width="12px"
                      height="12px"
                      ml="-6px"
                      mt="-6px"
                      borderRadius="full"
                      bg={timeLeft <= 10 ? 'red.400' : 'orange.400'}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [1, 0.4, 1],
                        scale: [0.8, 1.2, 0.8],
                        transition: {
                          duration: 1,
                          repeat: Infinity,
                          repeatType: 'loop',
                        },
                      }}
                    />
                    <MotionBox
                      position="absolute"
                      top="50%"
                      right="0"
                      width="12px"
                      height="12px"
                      mr="-6px"
                      mt="-6px"
                      borderRadius="full"
                      bg={timeLeft <= 10 ? 'red.400' : 'orange.400'}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [1, 0.4, 1],
                        scale: [0.8, 1.2, 0.8],
                        transition: {
                          duration: 1,
                          repeat: Infinity,
                          repeatType: 'loop',
                          delay: 0.5,
                        },
                      }}
                    />
                  </>
                )}

                {/* Main Button with dynamic styling */}
                <MotionButton
                  disabled={!hasScrolledToBottom}
                  size="lg"
                  leftIcon={
                    timeLeft <= 10 ? (
                      <Clock className="pulse-icon" />
                    ) : (
                      <CheckCircle2 />
                    )
                  }
                  onClick={onComplete}
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    timeLeft <= 10
                      ? {
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            '0 0 10px rgba(255, 59, 48, 0.4)',
                            '0 0 20px rgba(255, 59, 48, 0.7)',
                            '0 0 10px rgba(255, 59, 48, 0.4)',
                          ],
                          transition: {
                            duration: 0.6,
                            repeat: Infinity,
                            repeatType: 'reverse',
                          },
                        }
                      : timeLeft <= 30
                      ? {
                          y: [0, -2, 0],
                          transition: {
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: 'reverse',
                          },
                        }
                      : {}
                  }
                  {...getButtonStyles(timeLeft, hasScrolledToBottom)}
                  position="relative"
                  overflow="hidden"
                >
                  {/* Dynamic countdown indicator */}
                  {hasScrolledToBottom && timeLeft <= 30 && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      height="100%"
                      bg="whiteAlpha.200"
                      width={`${(timeLeft / 120) * 100}%`}
                      transition="width 1s linear"
                      zIndex={0}
                    />
                  )}

                  {/* Button text with time countdown for low time */}
                  <HStack
                    position="relative"
                    zIndex={1}
                    spacing={timeLeft <= 30 ? 3 : 2}
                  >
                    {timeLeft <= 10 ? (
                      <MotionText
                        fontWeight="bold"
                        animate={{
                          scale: [1, 1.1, 1],
                          transition: {
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: 'reverse',
                          },
                        }}
                      >
                        {t('Complete Now!')} ({timeLeft}s)
                      </MotionText>
                    ) : timeLeft <= 30 ? (
                      <Text fontWeight="bold">
                        {t('Complete Reading')} ({timeLeft}s)
                      </Text>
                    ) : hasScrolledToBottom ? (
                      <Text fontWeight="bold">{t('Complete Reading')}</Text>
                    ) : (
                      <Text fontWeight="bold">{t('Continue Reading')}</Text>
                    )}
                  </HStack>

                  {/* Animated particles for urgent countdown (only when time is critical) */}
                  {hasScrolledToBottom && timeLeft <= 10 && (
                    <>
                      <Box
                        position="absolute"
                        top="50%"
                        left="15%"
                        width="5px"
                        height="5px"
                        borderRadius="full"
                        bg="red.200"
                        animation="particle1 2s infinite"
                      />
                      <Box
                        position="absolute"
                        top="20%"
                        right="30%"
                        width="3px"
                        height="3px"
                        borderRadius="full"
                        bg="orange.200"
                        animation="particle2 1.5s infinite"
                      />
                      <style jsx>{`
                        @keyframes particle1 {
                          0% {
                            transform: translate(0, 0);
                            opacity: 0;
                          }
                          50% {
                            opacity: 1;
                          }
                          100% {
                            transform: translate(-15px, -15px);
                            opacity: 0;
                          }
                        }
                        @keyframes particle2 {
                          0% {
                            transform: translate(0, 0);
                            opacity: 0;
                          }
                          50% {
                            opacity: 1;
                          }
                          100% {
                            transform: translate(10px, -20px);
                            opacity: 0;
                          }
                        }
                        .pulse-icon {
                          animation: pulse-icon 1s infinite;
                        }
                        @keyframes pulse-icon {
                          0% {
                            transform: scale(1);
                          }
                          50% {
                            transform: scale(1.2);
                          }
                          100% {
                            transform: scale(1);
                          }
                        }
                      `}</style>
                    </>
                  )}
                </MotionButton>

                {/* Button glow effect when time is critical */}
                {hasScrolledToBottom && timeLeft <= 10 && (
                  <MotionBox
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    pointerEvents="none"
                    bg="transparent"
                    borderRadius="lg"
                    animate={{
                      boxShadow: [
                        '0 0 20px 5px rgba(255, 86, 48, 0.2)',
                        '0 0 30px 10px rgba(255, 86, 48, 0.4)',
                        '0 0 20px 5px rgba(255, 86, 48, 0.2)',
                      ],
                      transition: {
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      },
                    }}
                  />
                )}
              </Box>

              {!hasScrolledToBottom && timeLeft > 10 && (
                <Text fontSize="sm" color="whiteAlpha.600" textAlign="center">
                  {t(
                    'Try to read the entire article for better quiz performance',
                  )}
                </Text>
              )}
            </VStack>
          </Container>
        </Box>

        {/* Add bottom padding to ensure content isn't hidden behind the fixed controls */}
        <Box h="130px" />
      </VStack>
    </MotionBox>
  )
}

export default ReadingPhase
