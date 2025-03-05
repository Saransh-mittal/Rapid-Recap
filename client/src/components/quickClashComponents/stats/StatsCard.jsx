import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Users, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

import Stat from './Stat'

const MotionBox = motion(Box)

const StatsCard = () => {
  const { t } = useTranslation('QuickClash')
  const [stats, setStats] = useState({
    winRate: 0,
    avgCompletionTime: 0,
    totalChallenges: 0,
    bestCategory: null,
    totalWins: 0,
    totalLosses: 0,
    totalTies: 0,
    avgReadingTime: 0,
  })
  const [loading, setLoading] = useState(true)

  // Use useCallback to memoize the fetch function
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/quickClash/stats')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching Quick Clash stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch stats on component mount
    fetchStats()
  }, [fetchStats])

  // Format seconds to a human-readable format using useMemo
  const formatTime = useCallback(seconds => {
    if (!seconds) return '0s'
    return `${seconds}s`
  }, [])

  // Get best category with useMemo to avoid unnecessary recalculations
  const bestCategory = useMemo(() => {
    if (!stats.bestCategory) return t('None')
    return t(
      stats.bestCategory.charAt(0).toUpperCase() + stats.bestCategory.slice(1),
    )
  }, [stats.bestCategory, t])

  // Get win rate tooltip with useMemo
  const winRateTooltip = useMemo(() => {
    if (stats.totalWins === 0)
      return t('Complete challenges to build your win rate')
    return `${stats.totalWins} ${t('wins')} / ${stats.totalLosses || 0} ${t(
      'losses',
    )} / ${stats.totalTies || 0} ${t('ties')}`
  }, [stats.totalWins, stats.totalLosses, stats.totalTies, t])

  // Get time tooltip with useMemo
  const timeTooltip = useMemo(() => {
    if (!stats.avgCompletionTime)
      return t('Average time to complete quiz phase')
    return `${t('Quiz')}: ${stats.avgCompletionTime}s, ${t('Reading avg.')}: ${
      stats.avgReadingTime || 0
    }s`
  }, [stats.avgCompletionTime, stats.avgReadingTime, t])

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      mb={6}
    >
      <Box
        borderRadius="lg"
        bg="#1a1527"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
        overflow="hidden"
      >
        <Flex wrap="wrap" justify="space-around" py={4} px={4} gap={2}>
          <Stat
            icon={Trophy}
            label={t('Win Rate')}
            value={`${stats.winRate}%`}
            color="yellow.400"
            isLoading={loading}
            tooltip={winRateTooltip}
          />
          <Stat
            icon={Clock}
            label={t('Avg. Time')}
            value={formatTime(stats.avgCompletionTime)}
            color="blue.400"
            isLoading={loading}
            tooltip={timeTooltip}
          />
          <Stat
            icon={Users}
            label={t('Challenges')}
            value={stats.totalChallenges}
            color="purple.400"
            isLoading={loading}
            tooltip={t('Total active and completed challenges')}
          />
          <Stat
            icon={Sparkles}
            label={t('Best Category')}
            value={bestCategory}
            color="green.400"
            isLoading={loading}
            tooltip={t('Category with your best performance')}
          />
        </Flex>
      </Box>
    </MotionBox>
  )
}

export default StatsCard
