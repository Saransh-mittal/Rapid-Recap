// scheduler/tasks/updateGlobalRQMStats.js
const {
  updateGlobalRQMStats,
} = require('../../services/quickClashServices/globalRQMStatsService')

/**
 * Background task to update global RQM statistics
 * Runs every 30 minutes to keep stats fresh while managing performance
 */
const updateGlobalRQMStatsTask = async () => {
  const taskStartTime = Date.now()

  try {
    console.log('🔄 Starting global RQM statistics update task...')

    // Update global statistics
    const updatedStats = await updateGlobalRQMStats()

    const taskDuration = Date.now() - taskStartTime
    const calculationDuration = updatedStats.calculationDuration

    console.log('✅ Global RQM statistics update completed successfully')
    console.log(`📊 Statistics Summary:`)
    console.log(
      `   - Global Average RQM: ${updatedStats.rqmStats.globalAverage}`,
    )
    console.log(`   - Highest RQM: ${updatedStats.rqmStats.highestAverage}`)
    console.log(
      `   - Total Players: ${updatedStats.rqmStats.totalPlayersWithRQM}`,
    )
    console.log(
      `   - Average Trophies: ${updatedStats.trophyStats.averageTrophies}`,
    )
    console.log(
      `   - Highest Trophies: ${updatedStats.trophyStats.highestTrophies}`,
    )
    console.log(`⏱️  Calculation Time: ${calculationDuration}ms`)
    console.log(`⏱️  Total Task Time: ${taskDuration}ms`)

    // Log performance warning if calculation takes too long
    if (calculationDuration > 60000) {
      // > 1 minute
      console.warn(
        `⚠️  Warning: Global RQM calculation took ${Math.round(
          calculationDuration / 1000,
        )}s - consider optimization`,
      )
    }

    return {
      success: true,
      stats: updatedStats,
      duration: taskDuration,
      calculationDuration,
    }
  } catch (error) {
    const taskDuration = Date.now() - taskStartTime

    console.error('❌ Global RQM statistics update failed:', error.message)
    console.error(`⏱️  Failed after: ${taskDuration}ms`)

    // Log detailed error for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error('Full error:', error)
    }

    return {
      success: false,
      error: error.message,
      duration: taskDuration,
    }
  }
}

module.exports = updateGlobalRQMStatsTask
