const { convertISTtoUTCCron } = require('../utils/miscellaneous.utils')
const processExpiredChallenges = require('./tasks/processExpiredChallenges')
const { cleanupExpiredSessions } = require('./tasks/simpleSessionCleanup')
const {
  processBattleExpiryEvents,
  cleanupBattleExpiryEvents,
} = require('./tasks/processBattleExpiryEvents')
const { fallbackBattleCompletion } = require('./tasks/fallbackBattleCompletion')
const { manageBotMatchmaking } = require('./tasks/botMatchmakingTask')
const { botFallbackRecovery } = require('./tasks/botFallbackRecovery')

/**
 * Schedule configuration for Quick Clash related tasks
 */
const quickClashSchedules = [
  {
    name: 'bot-fallback-recovery',
    cronPattern: '*/5 * * * *', // Every 5 minutes
    task: botFallbackRecovery,
  },
  {
    name: 'bot-matchmaking-management',
    cronPattern: '*/25 * * * * *', // Every 25 seconds (note the extra * for seconds)
    task: manageBotMatchmaking,
  },
  // Run 6 times a day to process expired challenges
  {
    name: 'process-expired-challenges-morning',
    cronPattern: convertISTtoUTCCron(6, 0, '*'), // 6 AM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-noon',
    cronPattern: convertISTtoUTCCron(12, 0, '*'), // 12 PM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-afternoon',
    cronPattern: convertISTtoUTCCron(15, 0, '*'), // 3 PM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-evening',
    cronPattern: convertISTtoUTCCron(18, 0, '*'), // 6 PM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-night',
    cronPattern: convertISTtoUTCCron(21, 0, '*'), // 9 PM IST daily
    task: processExpiredChallenges,
  },
  {
    name: 'process-expired-challenges-midnight',
    cronPattern: convertISTtoUTCCron(0, 0, '*'), // 12 AM IST daily
    task: processExpiredChallenges,
  },
  // Run every 5 minutes to clean up expired sessions
  {
    name: 'cleanup-expired-sessions',
    cronPattern: '*/5 * * * *', // Every 5 minutes
    task: cleanupExpiredSessions,
  },
  // NEW: Process battle expiry events every minute for precise timing
  {
    name: 'process-battle-expiry-events',
    cronPattern: '*/1 * * * *', // Every minute
    task: processBattleExpiryEvents,
  },
  // NEW: Cleanup failed battle expiry events every 30 minutes
  {
    name: 'cleanup-battle-expiry-events',
    cronPattern: '*/30 * * * *', // Every 30 minutes
    task: cleanupBattleExpiryEvents,
  },
  // NEW: Fallback battle completion check every 15 minutes (safety net)
  {
    name: 'fallback-battle-completion',
    cronPattern: '*/15 * * * *', // Every 15 minutes
    task: fallbackBattleCompletion,
  },
]

module.exports = quickClashSchedules
