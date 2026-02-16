// services/quickClashServices/quickClashStreakService.js
// Streak system for daily return habit - drives retention for Quick Clash V2

const mongoose = require('mongoose')
const PlaySession = require('../../model/quickClashSchemas/playSessionSchema')
const User = require('../../model/userSchema')

// ============================================================================
// STREAK MULTIPLIER TIERS (display only, not applied to rewards yet)
// ============================================================================

const STREAK_TIERS = [
  { minDays: 30, multiplier: 3.0, label: 'Legendary', emoji: '🏆' },
  { minDays: 15, multiplier: 2.5, label: 'Master', emoji: '⭐' },
  { minDays: 7, multiplier: 2.0, label: 'Expert', emoji: '💪' },
  { minDays: 4, multiplier: 1.5, label: 'Rising', emoji: '🔥' },
  { minDays: 1, multiplier: 1.0, label: 'Started', emoji: '✨' },
]

/**
 * Get the streak tier info for a given streak count
 * @param {number} dayStreak - Current streak count
 * @returns {Object} { multiplier, label, emoji, nextTier }
 */
const getStreakTier = (dayStreak) => {
  for (const tier of STREAK_TIERS) {
    if (dayStreak >= tier.minDays) {
      // Find the next tier for progress display
      const currentIndex = STREAK_TIERS.indexOf(tier)
      const nextTier = currentIndex > 0 ? STREAK_TIERS[currentIndex - 1] : null

      return {
        multiplier: tier.multiplier,
        label: tier.label,
        emoji: tier.emoji,
        nextTier: nextTier
          ? {
              minDays: nextTier.minDays,
              multiplier: nextTier.multiplier,
              label: nextTier.label,
              daysUntil: nextTier.minDays - dayStreak,
            }
          : null,
      }
    }
  }

  // Day 0 - no streak yet
  return {
    multiplier: 1.0,
    label: 'None',
    emoji: '💤',
    nextTier: { minDays: 1, multiplier: 1.0, label: 'Started', daysUntil: 1 },
  }
}

/**
 * Check if two dates are on the same calendar day
 * @param {Date} date1
 * @param {Date} date2
 * @param {string} timezone - IANA timezone string (e.g., 'Asia/Kolkata')
 * @returns {boolean}
 */
const isSameDay = (date1, date2, timezone = 'Asia/Kolkata') => {
  const d1 = new Date(date1).toLocaleDateString('en-US', { timeZone: timezone })
  const d2 = new Date(date2).toLocaleDateString('en-US', { timeZone: timezone })
  return d1 === d2
}

/**
 * Check if date1 is exactly one calendar day before date2
 * @param {Date} date1 - Earlier date (last played)
 * @param {Date} date2 - Later date (today)
 * @param {string} timezone - IANA timezone string
 * @returns {boolean}
 */
const isYesterday = (date1, date2, timezone = 'Asia/Kolkata') => {
  // Get the calendar day for both dates in the specified timezone
  const options = { timeZone: timezone }

  const d1 = new Date(date1)
  const d2 = new Date(date2)

  // Get midnight of date2 in the timezone
  const date2Str = d2.toLocaleDateString('en-US', options)
  const date1Str = d1.toLocaleDateString('en-US', options)

  // Parse the dates (MM/DD/YYYY format)
  const [m1, day1, y1] = date1Str.split('/').map(Number)
  const [m2, day2, y2] = date2Str.split('/').map(Number)

  const date1Midnight = new Date(y1, m1 - 1, day1)
  const date2Midnight = new Date(y2, m2 - 1, day2)

  // Calculate difference in days
  const diffTime = date2Midnight - date1Midnight
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  return diffDays === 1
}

/**
 * Get time remaining until streak resets (midnight in timezone)
 * @param {string} timezone - IANA timezone string
 * @returns {Object} { hours, minutes, totalSeconds }
 */
const getTimeUntilReset = (timezone = 'Asia/Kolkata') => {
  const now = new Date()

  // Get tomorrow's date in the timezone
  const options = { timeZone: timezone }
  const todayStr = now.toLocaleDateString('en-US', options)
  const [m, d, y] = todayStr.split('/').map(Number)

  // Calculate midnight tomorrow in local timezone context
  const tomorrow = new Date(y, m - 1, d + 1)

  // Get current time in the timezone
  const nowInTz = new Date(
    now.toLocaleString('en-US', { timeZone: timezone })
  )
  const tomorrowMidnight = new Date(tomorrow.toLocaleString('en-US'))

  // This is approximate - for accurate countdown, frontend should handle it
  const diffMs = tomorrow.getTime() - now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return { hours, minutes, totalSeconds }
}

/**
 * Update player streak after battle completion
 * @param {Object} params
 * @param {string} params.playerId - User ID or Session Player ID
 * @param {boolean} params.isSessionPlayer - Whether this is a session player
 * @param {string} [params.timezone] - Player's timezone (defaults to IST)
 * @param {mongoose.ClientSession} [params.session] - DB session for transactions
 * @returns {Promise<Object>} { previousStreak, newStreak, multiplier, milestoneReached, isFirstPlayToday }
 */
const updateStreakOnBattleComplete = async ({
  playerId,
  isSessionPlayer,
  timezone = 'Asia/Kolkata',
  session = null,
}) => {
  const now = new Date()

  try {
    let player
    let streakData

    if (isSessionPlayer) {
      player = await PlaySession.findById(playerId).session(session)
      if (!player) {
        console.log(`[Streak] Session player ${playerId} not found`)
        return null
      }
      streakData = player.streak || { dayStreak: 0, lastPlayedDate: null, longestStreak: 0 }
    } else {
      player = await User.findById(playerId)
        .select('quickClashStats')
        .session(session)
      if (!player) {
        console.log(`[Streak] User ${playerId} not found`)
        return null
      }
      streakData = {
        dayStreak: player.quickClashStats?.dayStreak || 0,
        lastPlayedDate: player.quickClashStats?.lastPlayedDate || null,
        longestStreak: player.quickClashStats?.longestStreak || 0,
      }
    }

    const previousStreak = streakData.dayStreak
    const lastPlayed = streakData.lastPlayedDate

    let newStreak = previousStreak
    let isFirstPlayToday = false
    let milestoneReached = null

    if (!lastPlayed) {
      // First time playing ever - start streak at 1
      newStreak = 1
      isFirstPlayToday = true
      milestoneReached = 'streak_started'
      console.log(`[Streak] Player ${playerId} started their first streak!`)
    } else if (isSameDay(lastPlayed, now, timezone)) {
      // Already played today - no streak change
      isFirstPlayToday = false
      console.log(`[Streak] Player ${playerId} already played today, streak stays at ${previousStreak}`)
    } else if (isYesterday(lastPlayed, now, timezone)) {
      // Played yesterday - increment streak!
      newStreak = previousStreak + 1
      isFirstPlayToday = true

      // Check for milestone
      const prevTier = getStreakTier(previousStreak)
      const newTier = getStreakTier(newStreak)
      if (newTier.multiplier > prevTier.multiplier) {
        milestoneReached = `tier_up_${newTier.label.toLowerCase()}`
      }

      console.log(`[Streak] Player ${playerId} streak increased: ${previousStreak} -> ${newStreak}`)
    } else {
      // Missed a day (or more) - reset streak to 1
      newStreak = 1
      isFirstPlayToday = true
      if (previousStreak > 1) {
        milestoneReached = 'streak_lost'
        console.log(`[Streak] Player ${playerId} lost ${previousStreak}-day streak, reset to 1`)
      }
    }

    // Update longest streak if needed
    const newLongestStreak = Math.max(streakData.longestStreak, newStreak)

    // Persist the streak update
    if (isSessionPlayer) {
      await PlaySession.findByIdAndUpdate(
        playerId,
        {
          $set: {
            'streak.dayStreak': newStreak,
            'streak.lastPlayedDate': now,
            'streak.longestStreak': newLongestStreak,
          },
        },
        { session }
      )
    } else {
      await User.findByIdAndUpdate(
        playerId,
        {
          $set: {
            'quickClashStats.dayStreak': newStreak,
            'quickClashStats.lastPlayedDate': now,
            'quickClashStats.longestStreak': newLongestStreak,
          },
        },
        { session }
      )
    }

    const tierInfo = getStreakTier(newStreak)

    return {
      previousStreak,
      newStreak,
      longestStreak: newLongestStreak,
      multiplier: tierInfo.multiplier,
      tierLabel: tierInfo.label,
      tierEmoji: tierInfo.emoji,
      nextTier: tierInfo.nextTier,
      milestoneReached,
      isFirstPlayToday,
    }
  } catch (error) {
    console.error(`[Streak] Error updating streak for ${playerId}:`, error)
    throw error
  }
}

/**
 * Get streak info for a player (for display purposes)
 * @param {string} playerId - User ID or Session Player ID
 * @param {boolean} isSessionPlayer - Whether this is a session player
 * @param {string} [timezone] - Player's timezone
 * @returns {Promise<Object>} Streak info for display
 */
const getPlayerStreak = async (playerId, isSessionPlayer, timezone = 'Asia/Kolkata') => {
  try {
    let streakData

    if (isSessionPlayer) {
      const player = await PlaySession.findById(playerId).select('streak').lean()
      if (!player) return null
      streakData = player.streak || { dayStreak: 0, lastPlayedDate: null, longestStreak: 0, streakProtectionAvailable: false }
    } else {
      const player = await User.findById(playerId).select('quickClashStats').lean()
      if (!player) return null
      streakData = {
        dayStreak: player.quickClashStats?.dayStreak || 0,
        lastPlayedDate: player.quickClashStats?.lastPlayedDate || null,
        longestStreak: player.quickClashStats?.longestStreak || 0,
        streakProtectionAvailable: player.quickClashStats?.streakProtectionAvailable || false,
      }
    }

    const now = new Date()
    const lastPlayed = streakData.lastPlayedDate

    // Check if streak is still active (played today or yesterday)
    let isActive = false
    let needsPlayToday = false

    if (lastPlayed) {
      if (isSameDay(lastPlayed, now, timezone)) {
        isActive = true
        needsPlayToday = false
      } else if (isYesterday(lastPlayed, now, timezone)) {
        isActive = true
        needsPlayToday = true // Must play today to keep streak
      } else {
        // Streak has expired (missed day)
        isActive = false
        needsPlayToday = true
      }
    }

    const tierInfo = getStreakTier(streakData.dayStreak)
    const timeUntilReset = getTimeUntilReset(timezone)

    return {
      dayStreak: isActive ? streakData.dayStreak : 0, // Show 0 if streak expired
      actualStreak: streakData.dayStreak, // Raw stored value
      longestStreak: streakData.longestStreak,
      lastPlayedDate: streakData.lastPlayedDate,
      isActive,
      needsPlayToday,
      streakExpired: !isActive && streakData.dayStreak > 0,
      streakProtectionAvailable: streakData.streakProtectionAvailable,
      multiplier: tierInfo.multiplier,
      tierLabel: tierInfo.label,
      tierEmoji: tierInfo.emoji,
      nextTier: tierInfo.nextTier,
      timeUntilReset,
    }
  } catch (error) {
    console.error(`[Streak] Error getting streak for ${playerId}:`, error)
    throw error
  }
}

/**
 * Transfer streak from session player to user during account conversion
 * @param {string} sessionPlayerId - Session player ID
 * @param {string} userId - User ID
 * @param {mongoose.ClientSession} [session] - DB session
 */
const transferStreakToUser = async (sessionPlayerId, userId, session = null) => {
  try {
    const sessionPlayer = await PlaySession.findById(sessionPlayerId)
      .select('streak')
      .session(session)

    if (!sessionPlayer || !sessionPlayer.streak) {
      console.log(`[Streak] No streak to transfer for session ${sessionPlayerId}`)
      return
    }

    const { dayStreak, lastPlayedDate, longestStreak } = sessionPlayer.streak

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'quickClashStats.dayStreak': dayStreak,
          'quickClashStats.lastPlayedDate': lastPlayedDate,
          'quickClashStats.longestStreak': longestStreak,
        },
      },
      { session }
    )

    console.log(
      `[Streak] Transferred ${dayStreak}-day streak from session ${sessionPlayerId} to user ${userId}`
    )
  } catch (error) {
    console.error(`[Streak] Error transferring streak:`, error)
    throw error
  }
}

module.exports = {
  getStreakTier,
  getTimeUntilReset,
  updateStreakOnBattleComplete,
  getPlayerStreak,
  transferStreakToUser,
  STREAK_TIERS,
}
