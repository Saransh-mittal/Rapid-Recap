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

const ReadingPhase = ({ article, timeLeft, onComplete, category }) => {
  const { t } = useTranslation('QuickClash')
  const articleRef = useRef(null)
  const contentRef = useRef(null)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const maxWidth = useBreakpointValue({ base: '100%', md: '800px' })

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

  // Determine timer color based on remaining time
  const getTimerColorScheme = () => {
    if (timeLeft <= 10) return 'red'
    if (timeLeft <= 30) return 'orange'
    return 'blue'
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      w="100%"
    >
      {/* Floating Timer - Always visible */}
      <MotionBadge
        position="fixed"
        top="15px"
        right="20px"
        zIndex={100}
        colorScheme={getTimerColorScheme()}
        p={2}
        borderRadius="full"
        display="flex"
        alignItems="center"
        gap={2}
        boxShadow="0 4px 10px rgba(0,0,0,0.3)"
        initial={{ opacity: 0, y: -10 }}
        animate={
          timeLeft <= 30
            ? {
                scale: [1, 1.1, 1],
                transition: {
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: 'reverse',
                },
                opacity: 1,
                y: 0,
              }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.3 }}
      >
        <Icon as={Clock} />
        <Text fontWeight="bold">{formatTime(timeLeft)}</Text>
      </MotionBadge>

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

              <MotionButton
                disabled={!hasScrolledToBottom}
                colorScheme={hasScrolledToBottom ? 'green' : 'purple'}
                size="lg"
                leftIcon={<CheckCircle2 />}
                onClick={onComplete}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  timeLeft <= 10
                    ? {
                        scale: [1, 1.05, 1],
                        transition: {
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        },
                      }
                    : {}
                }
                w="100%"
                maxW="400px"
                bgGradient={
                  hasScrolledToBottom
                    ? 'linear(to-r, green.400, green.600)'
                    : 'linear(to-r, purple.500, purple.700)'
                }
                _hover={{
                  bgGradient: hasScrolledToBottom
                    ? 'linear(to-r, green.500, green.700)'
                    : 'linear(to-r, purple.600, purple.800)',
                }}
                boxShadow={
                  timeLeft <= 10
                    ? '0 0 15px rgba(255, 0, 0, 0.4)'
                    : hasScrolledToBottom
                    ? '0 4px 12px rgba(72, 187, 120, 0.3)'
                    : 'none'
                }
              >
                {timeLeft <= 10
                  ? t('Time running out!')
                  : hasScrolledToBottom
                  ? t('Complete Reading')
                  : t('Continue Reading')}
              </MotionButton>

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
