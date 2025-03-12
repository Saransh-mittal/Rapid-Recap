import React from 'react'
import {
  Box,
  HStack,
  Text,
  Badge,
  Button,
  Flex,
  Icon,
  Progress,
  VStack,
  Spinner,
  Center,
  Tooltip,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Brain,
  TrendingUp,
  Shield,
  Award,
  Lightbulb,
  Eye,
  XCircle,
  Sparkles,
  MessageCircle,
  Quote,
  ChevronRight,
  Star,
  Zap,
  Target,
  ArrowUp,
  GitCommit,
  GitBranch,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

// Motion-enhanced components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)
const MotionButton = motion(Button)
const MotionIcon = motion(Icon)

/**
 * Compact Analysis Summary Card with green victory and red defeat states
 */
const AnalysisSummaryCard = ({
  challenge,
  analysis,
  userId,
  isLoading = false,
  onViewFull,
}) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  const isChallenger = challenge.challenger._id === userId
  const userScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const opponentScore = isChallenger
    ? challenge.opponentScore
    : challenge.challengerScore
  const opponent = isChallenger ? challenge.opponent : challenge.challenger

  // Pre-calculate some values
  const userIsWinner = userScore > opponentScore
  const isTie = userScore === opponentScore && userScore > 0

  // Check if user prefers Hindi
  const prefersHindi = user?.userLanguage === 'hi'

  // Get the user's analysis data
  const userAnalysis =
    analysis?.challenger?._id === userId
      ? analysis?.challenger
      : analysis?.opponent || {}
  const metrics = analysis?.battleMetrics || {}
  const engagement = analysis?.engagement || {}

  // Get focus areas based on language preference
  const focusAreas =
    prefersHindi && userAnalysis?.learningPath?.focusAreas
      ? userAnalysis.learningPath.focusAreas
      : userAnalysis?.learningPath?.focusAreas || []

  // Get the user's top strength and weakness
  const topStrength = userAnalysis?.analysis?.strengths?.[0] || null
  const topWeakness = userAnalysis?.analysis?.weaknesses?.[0] || null

  // Find the shortest comment
  const findShortestComment = () => {
    const comments = [
      engagement.wittyAnalysis,
      engagement.competitiveTaunt,
      userIsWinner && engagement.victoryMeme,
    ].filter(Boolean)

    if (comments.length === 0) return null

    let shortest = comments[0]
    let shortestLength = shortest ? shortest.length : Infinity

    comments.forEach(comment => {
      if (comment && comment.length < shortestLength) {
        shortest = comment
        shortestLength = comment.length
      }
    })

    return shortest
  }

  // Get the comment icon based on content
  const getCommentIcon = text => {
    if (!text) return Quote
    if (text === engagement.wittyAnalysis) return Quote
    if (text === engagement.competitiveTaunt) return MessageCircle
    if (text === engagement.victoryMeme) return Star
    return Quote
  }

  // Get the shortest comment
  const shortestComment = findShortestComment()
  const commentIcon = getCommentIcon(shortestComment)

  // Get theme colors based on result
  const getThemeColors = () => {
    if (userIsWinner) {
      return {
        primaryColor: 'green.400',
        secondaryColor: 'green.500',
        accentColor: 'green.300',
        gradientStart: 'rgba(72, 187, 120, 0.15)',
        gradientEnd: 'rgba(56, 161, 105, 0.05)',
        borderColor: 'green.500',
        cardBg:
          'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(23, 43, 35, 0.9) 100%)',
        iconColor: 'green.300',
        commentBg: 'rgba(35, 50, 40, 0.6)',
        commentBorder: 'green.400',
        progressColorScheme: 'green',
        secondaryProgressColorScheme: 'teal',
      }
    } else if (isTie) {
      return {
        primaryColor: 'blue.400',
        secondaryColor: 'blue.500',
        accentColor: 'blue.300',
        gradientStart: 'rgba(66, 153, 225, 0.15)',
        gradientEnd: 'rgba(49, 130, 206, 0.05)',
        borderColor: 'blue.500',
        cardBg:
          'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(23, 30, 54, 0.9) 100%)',
        iconColor: 'blue.300',
        commentBg: 'rgba(30, 32, 55, 0.6)',
        commentBorder: 'blue.400',
        progressColorScheme: 'blue',
        secondaryProgressColorScheme: 'cyan',
      }
    } else {
      return {
        primaryColor: 'red.400',
        secondaryColor: 'red.500',
        accentColor: 'red.300',
        gradientStart: 'rgba(245, 101, 101, 0.15)',
        gradientEnd: 'rgba(229, 62, 62, 0.05)',
        borderColor: 'red.500',
        cardBg:
          'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 25, 25, 0.9) 100%)',
        iconColor: 'red.300',
        commentBg: 'rgba(50, 30, 30, 0.6)',
        commentBorder: 'red.400',
        progressColorScheme: 'red',
        secondaryProgressColorScheme: 'orange',
      }
    }
  }

  const themeColors = getThemeColors()

  // Handle loading/empty state
  if (isLoading) {
    return (
      <MotionBox
        p={2.5}
        borderRadius="lg"
        bg="rgba(26, 21, 39, 0.85)"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
        borderWidth="1.5px"
        borderColor="blue.500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        position="relative"
        overflow="hidden"
      >
        <Center py={2}>
          <HStack spacing={3}>
            <Spinner size="sm" color="blue.400" />
            <Text color="whiteAlpha.800" fontSize="xs">
              {t('Analyzing challenge data...')}
            </Text>
          </HStack>
        </Center>
      </MotionBox>
    )
  }

  // If no analysis yet, show a compact generate button
  if (!analysis) {
    return (
      <MotionBox
        p={2.5}
        borderRadius="lg"
        bg="rgba(26, 21, 39, 0.85)"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
        borderWidth="1.5px"
        borderColor="blue.500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        position="relative"
        overflow="hidden"
        _hover={{
          borderColor: 'blue.400',
          boxShadow: '0 4px 16px rgba(66, 153, 225, 0.3)',
        }}
      >
        <VStack spacing={1.5}>
          <HStack spacing={1.5}>
            <Icon as={Brain} color="blue.400" boxSize={3.5} />
            <Text color="whiteAlpha.900" fontSize="xs" fontWeight="medium">
              {t('AI Analysis Available')}
            </Text>
          </HStack>

          <MotionButton
            onClick={onViewFull}
            colorScheme="blue"
            size="xs"
            width="100%"
            leftIcon={<Brain size={12} />}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('Generate Analysis')}
          </MotionButton>
        </VStack>
      </MotionBox>
    )
  }

  return (
    <MotionBox
      width={'100%'}
      display={{ base: 'block', md: 'flex' }}
      flexDirection={'column'}
      p={2.5}
      height={{ base: '100%', md: '225px' }}
      borderRadius="lg"
      bgGradient={themeColors.cardBg}
      borderWidth="1.5px"
      borderColor={themeColors.borderColor}
      boxShadow={`0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px ${
        userIsWinner
          ? 'rgba(72, 187, 120, 0.1)'
          : isTie
          ? 'rgba(66, 153, 225, 0.1)'
          : 'rgba(245, 101, 101, 0.1)'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      position="relative"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px ${
          userIsWinner
            ? 'rgba(72, 187, 120, 0.2)'
            : isTie
            ? 'rgba(66, 153, 225, 0.2)'
            : 'rgba(245, 101, 101, 0.2)'
        }`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Background glow/gradient effect */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={`radial(circle at top right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`}
        zIndex="0"
      />

      {/* Victory sparkle effects */}
      {userIsWinner && (
        <>
          <MotionBox
            position="absolute"
            top="20%"
            right="10%"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            zIndex="1"
          >
            <Icon as={Sparkles} color="green.300" boxSize={3} />
          </MotionBox>

          <MotionBox
            position="absolute"
            bottom="15%"
            left="5%"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 0.5,
            }}
            zIndex="1"
          >
            <Icon as={Sparkles} color={themeColors.iconColor} boxSize={2.5} />
          </MotionBox>
        </>
      )}

      <VStack spacing={2} align="stretch" position="relative" zIndex="2">
        {/* Header with result banner and score */}
        <Flex justifyContent="space-between" alignItems="center">
          {/* Left side - Badge */}
          <MotionBadge
            px={2}
            py={1}
            borderRadius="full"
            bg={
              userIsWinner
                ? 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)'
                : isTie
                ? 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)'
                : 'linear-gradient(135deg, #F56565 0%, #E53E3E 100%)'
            }
            color="white"
            boxShadow={
              userIsWinner
                ? '0 0 10px rgba(72, 187, 120, 0.4)'
                : isTie
                ? '0 0 10px rgba(66, 153, 225, 0.3)'
                : '0 0 10px rgba(245, 101, 101, 0.4)'
            }
            animate={
              userIsWinner
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 5px rgba(72, 187, 120, 0.2)',
                      '0 0 12px rgba(72, 187, 120, 0.6)',
                      '0 0 5px rgba(72, 187, 120, 0.2)',
                    ],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            display="flex"
            alignItems="center"
            fontWeight="bold"
            fontSize="xs"
          >
            <HStack spacing={1}>
              <MotionIcon
                as={userIsWinner ? Trophy : isTie ? Shield : XCircle}
                boxSize={3}
                animate={
                  userIsWinner
                    ? {
                        rotate: [-5, 0, 5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
              <Text fontSize="xs" fontWeight="bold">
                {userIsWinner ? t('Victory!') : isTie ? t('Draw') : t('Defeat')}
              </Text>
            </HStack>
          </MotionBadge>

          {/* Right side - Score */}
          <HStack
            spacing={1.5}
            bg={`rgba(20, 20, 35, 0.6)`}
            p={1.5}
            borderRadius="md"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
          >
            <VStack spacing={0} align="center">
              <Text color="whiteAlpha.600" fontSize="2xs">
                {t('You')}
              </Text>
              <Text
                fontWeight="bold"
                fontSize="sm"
                color={userIsWinner ? 'green.300' : 'whiteAlpha.900'}
                textShadow={
                  userIsWinner ? '0 0 5px rgba(72, 187, 120, 0.5)' : 'none'
                }
              >
                {userScore}
              </Text>
            </VStack>

            <Center height="20px">
              <Text color="whiteAlpha.500" fontSize="md" mx={0.5}>
                :
              </Text>
            </Center>

            <VStack spacing={0} align="center">
              <Text color="whiteAlpha.600" fontSize="2xs">
                {opponent.inGameName}
              </Text>
              <Text
                fontWeight="bold"
                fontSize="sm"
                color={!userIsWinner && !isTie ? 'red.300' : 'whiteAlpha.900'}
                textShadow={
                  !userIsWinner && !isTie
                    ? '0 0 5px rgba(245, 101, 101, 0.5)'
                    : 'none'
                }
              >
                {opponentScore}
              </Text>
            </VStack>
          </HStack>
        </Flex>

        {/* Performance metrics - now in a "stats card" styled container */}
        <Box
          bg="rgba(20, 20, 35, 0.4)"
          borderRadius="md"
          p={1.5}
          borderWidth="1px"
          borderColor="rgba(255, 255, 255, 0.05)"
        >
          <Flex gap={2} justify="space-between">
            {/* Left column */}
            <Box flex="1">
              {/* Factual recall */}
              {userAnalysis?.analysis?.knowledgePatterns?.factualRecall && (
                <VStack align="start" spacing={0.5}>
                  <HStack justify="space-between" w="100%" fontSize="2xs">
                    <HStack spacing={1}>
                      <MotionIcon
                        as={GitCommit}
                        color={themeColors.iconColor}
                        boxSize={2.5}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <Text color="whiteAlpha.700">{t('Factual Recall')}</Text>
                    </HStack>
                    <Text color="whiteAlpha.900" fontWeight="bold">
                      {Math.round(
                        userAnalysis.analysis.knowledgePatterns.factualRecall ||
                          0,
                      )}
                      %
                    </Text>
                  </HStack>

                  <Progress
                    value={
                      userAnalysis.analysis.knowledgePatterns.factualRecall || 0
                    }
                    size="xs"
                    colorScheme={themeColors.progressColorScheme}
                    borderRadius="full"
                    w="100%"
                    bgColor="rgba(255, 255, 255, 0.1)"
                  />
                </VStack>
              )}

              {/* Technical Terms */}
              {userAnalysis?.analysis?.knowledgePatterns?.technicalTerms && (
                <VStack align="start" spacing={0.5} mt={1}>
                  <HStack justify="space-between" w="100%" fontSize="2xs">
                    <HStack spacing={1}>
                      <MotionIcon
                        as={GitBranch}
                        color={themeColors.iconColor}
                        boxSize={2.5}
                        animate={{ rotateY: 180 }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />
                      <Text color="whiteAlpha.700">{t('Technical Terms')}</Text>
                    </HStack>
                    <Text color="whiteAlpha.900" fontWeight="bold">
                      {Math.round(
                        userAnalysis.analysis.knowledgePatterns
                          .technicalTerms || 0,
                      )}
                      %
                    </Text>
                  </HStack>

                  <Progress
                    value={
                      userAnalysis.analysis.knowledgePatterns.technicalTerms ||
                      0
                    }
                    size="xs"
                    colorScheme={themeColors.secondaryProgressColorScheme}
                    borderRadius="full"
                    w="100%"
                    bgColor="rgba(255, 255, 255, 0.1)"
                  />
                </VStack>
              )}
            </Box>

            {/* Right column */}
            <Divider orientation="vertical" borderColor="whiteAlpha.200" />

            <Box flex="1" pl={1}>
              {/* Reading Time */}
              {userAnalysis?.performance?.readingTime && (
                <HStack justify="space-between" fontSize="2xs">
                  <HStack spacing={1}>
                    <MotionIcon
                      as={TrendingUp}
                      color={themeColors.iconColor}
                      boxSize={2.5}
                      animate={{ y: [0, -1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <Text color="whiteAlpha.700">{t('Reading')}</Text>
                  </HStack>
                  <Text color="whiteAlpha.900" fontWeight="bold">
                    {userAnalysis.performance.readingTime}s
                  </Text>
                </HStack>
              )}

              {/* Quiz Speed */}
              {userAnalysis?.performance?.quizSpeed && (
                <HStack justify="space-between" fontSize="2xs" mt={1}>
                  <HStack spacing={1}>
                    <MotionIcon
                      as={Zap}
                      color={themeColors.iconColor}
                      boxSize={2.5}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <Text color="whiteAlpha.700">{t('Quiz Speed')}</Text>
                  </HStack>
                  <Text color="whiteAlpha.900" fontWeight="bold">
                    {userAnalysis.performance.quizSpeed}s/q
                  </Text>
                </HStack>
              )}

              {/* Difficulty */}
              {metrics.difficulty && (
                <HStack justify="space-between" fontSize="2xs" mt={1}>
                  <Text color="whiteAlpha.700">{t('Difficulty')}</Text>
                  <Badge
                    colorScheme={
                      metrics.difficulty === 'easy'
                        ? 'green'
                        : metrics.difficulty === 'medium'
                        ? 'blue'
                        : 'red'
                    }
                    fontSize="2xs"
                    variant="solid"
                  >
                    {t(metrics.difficulty)}
                  </Badge>
                </HStack>
              )}
            </Box>
          </Flex>
        </Box>

        {/* Shortest Comment Section - Only show if available */}
        {shortestComment && (
          <MotionBox
            px={2.5}
            py={1.5}
            borderRadius="md"
            bg={themeColors.commentBg}
            borderLeftWidth="2px"
            borderLeftColor={themeColors.commentBorder}
            boxShadow="inset 0 1px 3px rgba(0, 0, 0, 0.2)"
            overflow="hidden"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <HStack spacing={1.5} align="flex-start">
              <MotionIcon
                as={commentIcon}
                color={themeColors.primaryColor}
                boxSize={3}
                mt="2px"
                animate={{ rotate: [-5, 0, 5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
              <Text
                color="whiteAlpha.950"
                fontStyle="italic"
                fontWeight="medium"
                fontSize="xs"
                letterSpacing="0.02em"
                lineHeight="1.4"
                fontFamily="Georgia, serif"
                textShadow="0 1px 2px rgba(0, 0, 0, 0.3)"
              >
                {shortestComment}
              </Text>
            </HStack>
          </MotionBox>
        )}

        {/* View Full Button */}
        <MotionButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onViewFull}
          colorScheme={userIsWinner ? 'green' : isTie ? 'blue' : 'red'}
          leftIcon={<Eye size={14} />}
          size="xs"
          fontWeight="bold"
          bgGradient={
            userIsWinner
              ? 'linear(to-r, green.400, teal.500)'
              : isTie
              ? 'linear(to-r, blue.400, cyan.500)'
              : 'linear(to-r, red.400, orange.500)'
          }
          color="white"
          _hover={{
            bgGradient: userIsWinner
              ? 'linear(to-r, green.300, teal.400)'
              : isTie
              ? 'linear(to-r, blue.300, cyan.400)'
              : 'linear(to-r, red.300, orange.400)',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          }}
          _active={{
            bgGradient: userIsWinner
              ? 'linear(to-r, green.500, teal.600)'
              : isTie
              ? 'linear(to-r, blue.500, cyan.600)'
              : 'linear(to-r, red.500, orange.600)',
            transform: 'translateY(0)',
          }}
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {t('View Full Analysis')}
        </MotionButton>
      </VStack>
      {/* View Full Button */}
      <MotionButton
        display={{ base: 'none', md: 'block' }}
        marginTop={'auto'}
        marginLeft={'auto'}
        marginRight={'auto'}
        w={'70%'}
        onClick={onViewFull}
        colorScheme={userIsWinner ? 'green' : isTie ? 'blue' : 'red'}
        leftIcon={<Eye size={14} />}
        size="xs"
        fontWeight="bold"
        bgGradient={
          userIsWinner
            ? 'linear(to-r, green.400, teal.500)'
            : isTie
            ? 'linear(to-r, blue.400, cyan.500)'
            : 'linear(to-r, red.400, orange.500)'
        }
        color="white"
        _hover={{
          bgGradient: userIsWinner
            ? 'linear(to-r, green.300, teal.400)'
            : isTie
            ? 'linear(to-r, blue.300, cyan.400)'
            : 'linear(to-r, red.300, orange.400)',
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        }}
        _active={{
          bgGradient: userIsWinner
            ? 'linear(to-r, green.500, teal.600)'
            : isTie
            ? 'linear(to-r, blue.500, cyan.600)'
            : 'linear(to-r, red.500, orange.600)',
          transform: 'translateY(0)',
        }}
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {t('View Full Analysis')}
      </MotionButton>
    </MotionBox>
  )
}

export default AnalysisSummaryCard
