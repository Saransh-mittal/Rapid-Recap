// services/battleStatsService.js - Enhanced Frontend service with Global RQM
import axios from 'axios'

/**
 * Fetch battle statistics with global RQM comparisons for the current user
 * @returns {Promise<Object>} Battle statistics data with global comparisons
 */
export const fetchBattleStats = async () => {
  try {
    const response = await axios.get('/api/quickClash/battle-stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        timestamp: response.data.timestamp,
      }
    } else {
      throw new Error(response.data.message || 'Failed to fetch battle stats')
    }
  } catch (error) {
    console.error('Error fetching battle stats:', error)

    // Return default values if API fails
    return {
      success: false,
      error: error.message,
      data: {
        battlesWon: 0,
        winRate: 0,
        teamBattlesWon: 0,
        averageRQM: 0,
        weeklyTeamWins: 0,
        currentWinStreak: 0,
        userTrophies: 1000,
        globalComparison: {
          userRQM: 0,
          globalAverage: 0,
          highestRQM: 0,
          userPercentile: 0,
          totalPlayers: 0,
          lastUpdated: new Date(),
          performance: {
            vsGlobal: 0,
            vsHighest: 0,
          },
          percentileMessage: 'Keep playing to establish your ranking!',
        },
      },
    }
  }
}

/**
 * Fetch detailed RQM analysis with recent performance trends
 * @returns {Promise<Object>} Detailed RQM analysis
 */
export const fetchDetailedRQMAnalysis = async () => {
  try {
    const response = await axios.get('/api/quickClash/rqm-analysis', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        timestamp: response.data.timestamp,
      }
    } else {
      throw new Error(response.data.message || 'Failed to fetch RQM analysis')
    }
  } catch (error) {
    console.error('Error fetching RQM analysis:', error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}

/**
 * Fetch global RQM statistics (public data)
 * @returns {Promise<Object>} Global statistics
 */
export const fetchGlobalRQMStats = async () => {
  try {
    const response = await axios.get('/api/quickClash/global-stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        timestamp: response.data.timestamp,
      }
    } else {
      throw new Error(response.data.message || 'Failed to fetch global stats')
    }
  } catch (error) {
    console.error('Error fetching global stats:', error)
    return {
      success: false,
      error: error.message,
      data: {
        globalAverage: 0,
        highestRQM: 0,
        medianRQM: 0,
        totalPlayers: 0,
        percentileRanges: {
          elite: 0,
          advanced: 0,
          intermediate: 0,
          beginner: 0,
        },
        trophyStats: {
          averageTrophies: 1000,
          highestTrophies: 1000,
          totalPlayers: 0,
        },
        lastUpdated: new Date(),
        dataFreshness: { minutesOld: 0, status: 'unavailable' },
      },
    }
  }
}

/**
 * Format battle stats for display with fallbacks and enhanced global data
 * @param {Object} stats - Raw battle statistics
 * @returns {Object} Formatted stats ready for UI display
 */
export const formatBattleStats = stats => {
  return {
    battlesWon: stats?.battlesWon ?? 0,
    winRate: stats?.winRate ?? 0,
    teamBattlesWon: stats?.teamBattlesWon ?? 0,
    averageRQM: stats?.averageRQM ?? 0,
    weeklyTeamWins: stats?.weeklyTeamWins ?? 0,
    currentWinStreak: stats?.currentWinStreak ?? 0,
    userTrophies: stats?.userTrophies ?? 1000,

    // Enhanced global comparison data
    globalComparison: {
      userRQM: stats?.globalComparison?.userRQM ?? 0,
      globalAverage: stats?.globalComparison?.globalAverage ?? 0,
      highestRQM: stats?.globalComparison?.highestRQM ?? 0,
      userPercentile: stats?.globalComparison?.userPercentile ?? 0,
      totalPlayers: stats?.globalComparison?.totalPlayers ?? 0,
      lastUpdated: stats?.globalComparison?.lastUpdated ?? new Date(),
      performance: {
        vsGlobal: stats?.globalComparison?.performance?.vsGlobal ?? 0,
        vsHighest: stats?.globalComparison?.performance?.vsHighest ?? 0,
      },
      percentileMessage:
        stats?.globalComparison?.percentileMessage ??
        'Keep playing to establish your ranking!',
    },
  }
}

/**
 * Get performance indicator for UI display
 * @param {number} userRQM - User's RQM score
 * @param {number} globalAverage - Global average RQM
 * @returns {Object} Performance indicator with color and message
 */
export const getPerformanceIndicator = (userRQM, globalAverage) => {
  if (userRQM === 0) {
    return {
      status: 'unranked',
      color: '#6b7280', // gray
      message: 'Play more battles to get ranked',
      icon: 'help-circle',
    }
  }

  const difference = userRQM - globalAverage
  const percentDiff = globalAverage > 0 ? (difference / globalAverage) * 100 : 0

  if (percentDiff >= 50) {
    return {
      status: 'excellent',
      color: '#10b981', // green
      message: 'Far above average!',
      icon: 'trending-up',
    }
  } else if (percentDiff >= 20) {
    return {
      status: 'good',
      color: '#22d3ee', // cyan
      message: 'Above average',
      icon: 'arrow-up',
    }
  } else if (percentDiff >= -10) {
    return {
      status: 'average',
      color: '#f59e0b', // amber
      message: 'Around average',
      icon: 'minus',
    }
  } else {
    return {
      status: 'below',
      color: '#ef4444', // red
      message: 'Room for improvement',
      icon: 'arrow-down',
    }
  }
}

/**
 * Format time ago string for last updated timestamp
 * @param {string|Date} timestamp - Last updated timestamp
 * @returns {string} Human-readable time ago string
 */
export const formatTimeAgo = timestamp => {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMinutes = Math.floor((now - then) / (1000 * 60))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}
