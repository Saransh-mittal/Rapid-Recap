// components/quickClashComponents/stats/StatsCard.jsx
import React, { useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  useToast,
  Skeleton,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Users, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useQuickClash from '../../../customHooks/useQuickClash'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const StatsCard = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const {
    userStats: stats,
    userStatsLoading: loading,
    loadUserStats,
  } = useQuickClash()

  // Fetch stats on component mount
  useEffect(() => {
    loadUserStats().catch(error => {
      toast({
        title: t('Error'),
        description: error || t('Failed to load statistics'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    })
  }, [loadUserStats, toast, t])

  // Format seconds to a human-readable format
  const formatTime = useCallback(seconds => {
    if (!seconds) return '0s'
    return `${seconds}s`
  }, [])

  // Get best category
  const bestCategory = useMemo(() => {
    if (!stats.bestCategory) return t('None')
    return t(
      stats.bestCategory.charAt(0).toUpperCase() + stats.bestCategory.slice(1),
    )
  }, [stats.bestCategory, t])

  return (
    <MotionBox
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      mb={6}
    >
      <Grid
        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
        gap={3}
        width="100%"
      >
        {/* Win Rate */}
        <GridItem>
          <StatCard
            icon={Trophy}
            label={t('Win Rate')}
            value={`${stats.winRate || 0}%`}
            color="rgba(255, 185, 70, 0.9)"
            secondaryColor="rgba(230, 150, 40, 0.2)"
            accentColor="rgba(255, 215, 120, 0.8)"
            detail={`${stats.totalWins || 0}W/${stats.totalLosses || 0}L`}
            isLoading={loading}
          />
        </GridItem>

        {/* Average Time */}
        <GridItem>
          <StatCard
            icon={Clock}
            label={t('Avg. Time')}
            value={formatTime(stats.avgCompletionTime)}
            color="rgba(80, 130, 200, 0.9)"
            secondaryColor="rgba(60, 110, 180, 0.2)"
            accentColor="rgba(100, 160, 240, 0.8)"
            detail={
              stats.avgReadingTime
                ? `R: ${formatTime(stats.avgReadingTime)}`
                : ''
            }
            isLoading={loading}
          />
        </GridItem>

        {/* Challenges */}
        <GridItem>
          <StatCard
            icon={Users}
            label={t('Challenges')}
            value={stats.totalChallenges || 0}
            color="rgba(160, 120, 220, 0.9)"
            secondaryColor="rgba(130, 90, 190, 0.2)"
            accentColor="rgba(180, 140, 240, 0.8)"
            isLoading={loading}
          />
        </GridItem>

        {/* Best Category */}
        <GridItem>
          <StatCard
            icon={Sparkles}
            label={t('Best Category')}
            value={bestCategory}
            color="rgba(70, 190, 130, 0.9)"
            secondaryColor="rgba(50, 160, 110, 0.2)"
            accentColor="rgba(90, 210, 150, 0.8)"
            isLoading={loading}
          />
        </GridItem>
      </Grid>
    </MotionBox>
  )
}

// Individual stat card component with sleek and refined design
const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  secondaryColor,
  accentColor,
  detail,
  isLoading,
}) => {
  return (
    <MotionBox
      h="100px"
      w="100%"
      bg="rgba(26, 21, 39, 0.6)"
      borderRadius="lg"
      borderLeft="3px solid"
      borderColor={color}
      boxShadow={`inset 0 0 15px ${secondaryColor}, 0 4px 8px rgba(0, 0, 0, 0.2)`}
      position="relative"
      overflow="hidden"
      whileHover={{
        y: -3,
        boxShadow: `inset 0 0 20px ${secondaryColor}, 0 6px 12px rgba(0, 0, 0, 0.3)`,
        transition: { duration: 0.2 },
      }}
    >
      {/* Decorative element */}
      <Box
        position="absolute"
        top="-10px"
        right="-10px"
        width="60px"
        height="60px"
        borderRadius="full"
        bg={accentColor}
        opacity="0.1"
      />

      {/* Content container */}
      <Flex direction="column" h="100%" p={3} justifyContent="space-between">
        {/* Label and icon */}
        <Flex justify="space-between" align="center">
          <Text
            fontSize="xs"
            fontWeight="medium"
            color="whiteAlpha.700"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {label}
          </Text>
          <Box color={color}>
            <Icon size={16} />
          </Box>
        </Flex>

        {/* Value and detail */}
        <Flex direction="column" mt={1}>
          <Skeleton
            isLoaded={!isLoading}
            height={isLoading ? '24px' : 'auto'}
            startColor="whiteAlpha.100"
            endColor="whiteAlpha.300"
            borderRadius="md"
            mb={1}
          >
            <Text
              fontSize="24px"
              fontWeight="bold"
              color="white"
              letterSpacing="tight"
              lineHeight="1"
            >
              {value}
            </Text>
          </Skeleton>

          {detail && (
            <Text fontSize="xs" color="whiteAlpha.600" mt={0.5}>
              {detail}
            </Text>
          )}
        </Flex>
      </Flex>
    </MotionBox>
  )
}

export default StatsCard
