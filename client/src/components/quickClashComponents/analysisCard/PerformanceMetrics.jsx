import React, { memo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { GitCommit, GitBranch, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionIcon = motion(Icon)

const PerformanceMetrics = ({
  userAnalysis,
  metrics,
  themeColors,
  customAnimation = true,
}) => {
  const { t } = useTranslation('QuickClash')

  if (!userAnalysis) return null

  return (
    <Box
      bg="rgba(20, 20, 35, 0.4)"
      borderRadius="md"
      p={1.5}
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.05)"
    >
      <Flex gap={2} justify="space-between">
        {/* Left column - Knowledge patterns */}
        <Box flex="1">
          {/* Factual recall */}
          {userAnalysis?.analysis?.knowledgePatterns?.factualRecall !==
            undefined && (
            <VStack align="start" spacing={0.5}>
              <HStack justify="space-between" w="100%" fontSize="2xs">
                <HStack spacing={1}>
                  <MotionIcon
                    as={GitCommit}
                    color={themeColors.iconColor}
                    boxSize={2.5}
                    animate={customAnimation ? { rotate: 360 } : {}}
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
                    userAnalysis.analysis.knowledgePatterns.factualRecall || 0,
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
          {userAnalysis?.analysis?.knowledgePatterns?.technicalTerms !==
            undefined && (
            <VStack align="start" spacing={0.5} mt={1}>
              <HStack justify="space-between" w="100%" fontSize="2xs">
                <HStack spacing={1}>
                  <MotionIcon
                    as={GitBranch}
                    color={themeColors.iconColor}
                    boxSize={2.5}
                    animate={customAnimation ? { rotateY: 180 } : {}}
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
                    userAnalysis.analysis.knowledgePatterns.technicalTerms || 0,
                  )}
                  %
                </Text>
              </HStack>

              <Progress
                value={
                  userAnalysis.analysis.knowledgePatterns.technicalTerms || 0
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

        {/* Divider */}
        <Divider orientation="vertical" borderColor="whiteAlpha.200" />

        {/* Right column - Time metrics */}
        <Box flex="1" pl={1}>
          {/* Reading Time */}
          {userAnalysis?.performance?.readingTime && (
            <HStack justify="space-between" fontSize="2xs">
              <HStack spacing={1}>
                <MotionIcon
                  as={TrendingUp}
                  color={themeColors.iconColor}
                  boxSize={2.5}
                  animate={customAnimation ? { y: [0, -1, 0] } : {}}
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
                  animate={
                    customAnimation
                      ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }
                      : {}
                  }
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
          {metrics?.difficulty && (
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
  )
}

// Add missing import for Icon
import { Icon } from '@chakra-ui/react'

export default memo(PerformanceMetrics)
