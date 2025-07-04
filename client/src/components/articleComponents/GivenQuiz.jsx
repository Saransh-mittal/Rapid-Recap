// components/articleComponents/GivenQuiz.jsx - Enhanced Premium Gamified Version with Aesthetic Popover

import React, { useMemo } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Icon,
  Tooltip,
  Grid,
  GridItem,
  CircularProgress,
  CircularProgressLabel,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  FileText,
  FlipHorizontal2,
  Sparkles,
  Link2,
  Trophy,
  Target,
  Star,
  Crown,
  TrendingUp,
  BarChart3,
  Zap,
  Award,
  Gem,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)

const gameTypeIcons = {
  normal_quiz: FileText,
  true_false: FlipHorizontal2,
  word_weaver: Sparkles,
  connections: Link2,
}

const gameTypeColors = {
  normal_quiz: { primary: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  true_false: { primary: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  word_weaver: { primary: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  connections: { primary: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
}

const GivenQuiz = ({ articleId, percentile, RQM_score, gameData }) => {
  const { t } = useTranslation('GameHub')
  const navigate = useNavigate()

  // Handle both old format (boolean) and new format (object with game details)
  const isNewFormat =
    gameData && typeof gameData === 'object' && gameData.hasPlayed
  const completedGameType = isNewFormat
    ? gameData.gameType || gameData.bestGameType
    : 'normal_quiz'
  const totalAttempts = isNewFormat ? gameData.totalAttempts : 1
  const gameTimeTaken = isNewFormat ? gameData.timeTaken : null

  const getPerformanceData = (p, score) => {
    if (p >= 90)
      return {
        level: t('performanceLevels.legend'),
        color: '#FFD700',
        bg: 'linear(45deg, #FFD700, #FFA500)',
        icon: Crown,
        emoji: '👑',
        description: t('performanceDescriptions.legend'),
      }
    if (p >= 75)
      return {
        level: t('performanceLevels.master'),
        color: '#8B5CF6',
        bg: 'linear(45deg, #8B5CF6, #7C3AED)',
        icon: Star,
        emoji: '⭐',
        description: t('performanceDescriptions.master'),
      }
    if (p >= 50)
      return {
        level: t('performanceLevels.skilled'),
        color: '#10B981',
        bg: 'linear(45deg, #10B981, #059669)',
        icon: Target,
        emoji: '🎯',
        description: t('performanceDescriptions.skilled'),
      }
    return {
      level: t('performanceLevels.rising'),
      color: '#F59E0B',
      bg: 'linear(45deg, #F59E0B, #D97706)',
      icon: TrendingUp,
      emoji: '📈',
      description: t('performanceDescriptions.rising'),
    }
  }

  const performance = useMemo(
    () => getPerformanceData(percentile, RQM_score),
    [percentile, RQM_score, t],
  )
  const PerformanceIcon = performance.icon
  const completedGameConfig =
    gameTypeColors[completedGameType] || gameTypeColors.normal_quiz

  const handleViewReport = () => {
    navigate(`/gamehub/${articleId}/report`)
  }

  const CompletedGamePopover = () => {
    const CompletedGameIcon = gameTypeIcons[completedGameType]

    return (
      <Popover
        trigger="hover"
        placement="top-start"
        openDelay={300}
        closeDelay={100}
        isLazy
        strategy="absolute"
        modifiers={[
          {
            name: 'preventOverflow',
            options: {
              boundary: 'clippingParents',
            },
          },
        ]}
      >
        <PopoverTrigger>
          <Box
            bg={completedGameConfig.bg}
            borderRadius="lg"
            p={2}
            border="1px solid"
            borderColor={`${completedGameConfig.primary}40`}
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: 'scale(1.05)',
              borderColor: completedGameConfig.primary,
              boxShadow: `0 4px 15px ${completedGameConfig.primary}40`,
            }}
          >
            <Icon
              as={CompletedGameIcon}
              boxSize={4}
              color={completedGameConfig.primary}
            />
          </Box>
        </PopoverTrigger>

        <PopoverContent
          bg="rgba(0, 0, 0, 0.95)"
          border="1px solid"
          borderColor={`${completedGameConfig.primary}60`}
          borderRadius="xl"
          boxShadow={`0 20px 40px -12px ${completedGameConfig.primary}40, 0 0 0 1px ${completedGameConfig.primary}20`}
          backdropFilter="blur(20px)"
          maxW="280px"
          zIndex={9999}
          _focus={{
            boxShadow: `0 20px 40px -12px ${completedGameConfig.primary}60`,
          }}
        >
          <PopoverArrow
            bg="rgba(0, 0, 0, 0.95)"
            borderColor={`${completedGameConfig.primary}60`}
            shadowColor={`${completedGameConfig.primary}40`}
          />

          <PopoverHeader
            bg={`${completedGameConfig.primary}10`}
            borderBottom="1px solid"
            borderColor={`${completedGameConfig.primary}30`}
            borderTopRadius="xl"
            p={3}
          >
            <HStack spacing={3} align="center">
              <Box
                bg={completedGameConfig.primary}
                borderRadius="lg"
                p={2}
                boxShadow={`0 4px 15px ${completedGameConfig.primary}40`}
              >
                <Icon as={CompletedGameIcon} boxSize={5} color="white" />
              </Box>

              <VStack spacing={0} align="start" flex={1}>
                <HStack spacing={2} align="center">
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    color="white"
                    lineHeight="1.2"
                  >
                    {t(`gameTypes.${completedGameType}`)}
                  </Text>
                  <Badge
                    bg="linear-gradient(45deg, #10B981, #059669)"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontSize="2xs"
                    fontWeight="bold"
                  >
                    <HStack spacing={1}>
                      <Trophy size={10} />
                      <Text>{t('status.completed')}</Text>
                    </HStack>
                  </Badge>
                </HStack>

                <Text
                  fontSize="xs"
                  color={completedGameConfig.primary}
                  fontWeight="600"
                >
                  {t('popover.challengeMastered')}
                </Text>
              </VStack>
            </HStack>
          </PopoverHeader>

          <PopoverBody p={3}>
            <VStack spacing={3} align="stretch">
              {/* Description */}
              <Text
                fontSize="sm"
                color="gray.200"
                lineHeight="1.4"
                textAlign="center"
              >
                {t(`gameDescriptions.${completedGameType}`)}
              </Text>

              {/* Stats */}
              <HStack
                spacing={3}
                justify="center"
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="lg"
                p={2}
              >
                <VStack spacing={0}>
                  <HStack spacing={1}>
                    <Award size={12} color={completedGameConfig.primary} />
                    <Text
                      fontSize="xs"
                      color={completedGameConfig.primary}
                      fontWeight="bold"
                    >
                      {RQM_score}
                    </Text>
                  </HStack>
                  <Text fontSize="2xs" color="gray.400">
                    {t('stats.rqmScore')}
                  </Text>
                </VStack>

                <Box w="1px" h="20px" bg="gray.600" />

                <VStack spacing={0}>
                  <HStack spacing={1}>
                    <Gem size={12} color="#10B981" />
                    <Text fontSize="xs" color="emerald.400" fontWeight="bold">
                      {Math.round(percentile)}%
                    </Text>
                  </HStack>
                  <Text fontSize="2xs" color="gray.400">
                    {t('stats.percentile')}
                  </Text>
                </VStack>
              </HStack>

              {/* Achievement Badge */}
              <Box
                bg={`${completedGameConfig.primary}20`}
                borderRadius="lg"
                p={2}
                border="1px solid"
                borderColor={`${completedGameConfig.primary}40`}
                textAlign="center"
              >
                <HStack spacing={2} justify="center">
                  <Text fontSize="xs">🎯</Text>
                  <Text fontSize="xs" color="white" fontWeight="600">
                    {t('popover.gameChallengeCompleted')}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        bg="rgba(255, 255, 255, 0.02)"
        backdropFilter="blur(20px)"
        borderRadius="xl"
        p={4}
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        position="relative"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      >
        {/* Animated Background Gradient */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={`radial(circle at 30% 20%, ${performance.color}15, transparent 70%)`}
          opacity={0.8}
          pointerEvents="none"
        />

        {/* Floating Orbs */}
        <Box
          position="absolute"
          top="10%"
          right="15%"
          w="20px"
          h="20px"
          borderRadius="50%"
          bg={performance.color}
          opacity={0.2}
          filter="blur(8px)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="20%"
          left="10%"
          w="12px"
          h="12px"
          borderRadius="50%"
          bg={completedGameConfig.primary}
          opacity={0.3}
          filter="blur(6px)"
          pointerEvents="none"
        />

        <VStack spacing={3} position="relative" zIndex={1}>
          {/* Compact Header */}
          <HStack justify="space-between" w="100%" align="center">
            <HStack spacing={2}>
              <Text fontSize="lg">{performance.emoji}</Text>
              <VStack spacing={0} align="start">
                <Text fontSize="md" fontWeight="bold" color="white">
                  {t('headers.gamesMastered')}
                </Text>
              </VStack>
            </HStack>

            <Badge
              bgGradient={performance.bg}
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              boxShadow={`0 4px 15px ${performance.color}40`}
            >
              <HStack spacing={1}>
                <PerformanceIcon size={12} />
                <Text>{performance.level}</Text>
              </HStack>
            </Badge>
          </HStack>

          {/* Compact Score Display */}
          <Grid
            templateColumns="1fr auto 1fr"
            gap={4}
            w="100%"
            alignItems="center"
          >
            {/* RQM Score */}
            <GridItem>
              <VStack spacing={1}>
                <HStack spacing={1} align="baseline">
                  <Text
                    fontSize="2xl"
                    fontWeight="900"
                    color={performance.color}
                    lineHeight="1"
                  >
                    {RQM_score}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {t('stats.rqmUnit')}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  {t('stats.bestScoreShort')}
                </Text>
              </VStack>
            </GridItem>

            {/* Percentile Circle */}
            <GridItem>
              <Box position="relative">
                <CircularProgress
                  value={percentile}
                  size="60px"
                  color={performance.color}
                  trackColor="rgba(255, 255, 255, 0.1)"
                  thickness="6px"
                >
                  <CircularProgressLabel>
                    <VStack spacing={0}>
                      <HStack spacing={0} align="baseline">
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="white"
                          lineHeight="1"
                        >
                          {Math.round(percentile)}
                        </Text>
                        <Text fontSize="xs" color="gray.400" lineHeight="1">
                          %
                        </Text>
                      </HStack>
                      <Text fontSize="2xs" color="gray.500" lineHeight="1">
                        {t('stats.rank')}
                      </Text>
                    </VStack>
                  </CircularProgressLabel>
                </CircularProgress>

                {/* Glow effect */}
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  w="70px"
                  h="70px"
                  borderRadius="50%"
                  bg={performance.color}
                  opacity={0.1}
                  filter="blur(10px)"
                  zIndex={-1}
                />
              </Box>
            </GridItem>

            {/* Completed Game Type with Premium Popover */}
            <GridItem>
              <VStack spacing={1}>
                <CompletedGamePopover />
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  {t('status.completedShort')}
                </Text>
              </VStack>
            </GridItem>
          </Grid>

          {/* Game Achievement Status */}
          <HStack spacing={3} justify="center" w="100%">
            <Badge
              bg={`${completedGameConfig.primary}15`}
              color={completedGameConfig.primary}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              border="1px solid"
              borderColor={`${completedGameConfig.primary}40`}
            >
              <HStack spacing={1}>
                <Icon as={gameTypeIcons[completedGameType]} boxSize={3} />
                <Text>{t(`gameTypes.${completedGameType}`)}</Text>
              </HStack>
            </Badge>

            {totalAttempts > 1 && (
              <Badge
                bg="rgba(139, 92, 246, 0.15)"
                color="purple.300"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                border="1px solid"
                borderColor="rgba(139, 92, 246, 0.4)"
              >
                <HStack spacing={1}>
                  <Target size={10} />
                  <Text>
                    {totalAttempts} {t('stats.attempts')}
                  </Text>
                </HStack>
              </Badge>
            )}
          </HStack>

          {/* Action Button */}
          <MotionBox
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            w="100%"
          >
            <Button
              onClick={handleViewReport}
              size="sm"
              width="100%"
              height="36px"
              bgGradient="linear(45deg, rgba(139, 92, 246, 0.8), rgba(99, 102, 241, 0.8))"
              color="white"
              leftIcon={<BarChart3 size={14} />}
              borderRadius="lg"
              fontSize="sm"
              fontWeight="600"
              border="1px solid"
              borderColor="rgba(139, 92, 246, 0.3)"
              _hover={{
                bgGradient:
                  'linear(45deg, rgba(139, 92, 246, 0.9), rgba(99, 102, 241, 0.9))',
                borderColor: 'rgba(139, 92, 246, 0.5)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              }}
              transition="all 0.2s"
            >
              {t('actions.viewDetailedReport')}
            </Button>
          </MotionBox>

          {/* Performance Description */}
          <Box
            bg="rgba(255, 255, 255, 0.05)"
            borderRadius="lg"
            p={2}
            w="100%"
            textAlign="center"
          >
            <HStack justify="center" spacing={2}>
              <Zap size={12} color={performance.color} />
              <Text fontSize="xs" color="gray.300" fontWeight="500">
                {performance.description}
              </Text>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </MotionBox>
  )
}

export default GivenQuiz
