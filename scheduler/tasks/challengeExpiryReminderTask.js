// scheduler/tasks/challengeExpiryReminderTask.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const {
  sendChallengeExpiryReminder,
} = require('../../services/quickClashServices/quickClashNotificationService')

/**
 * Process challenges that are about to expire and send reminder notifications
 * Runs every 5 minutes to check for challenges expiring within 1 hour
 */
const processChallengeExpiryReminders = async () => {
  const startTime = Date.now()
  console.log(
    '[CHALLENGE_EXPIRY_REMINDER] Starting challenge expiry reminder task...',
  )

  try {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour in milliseconds

    // Find solo challenges that are about to expire
    const expiringChallenges = await QuickClashChallenge.find({
      // Only solo challenges (not team battles)
      fromTeamBattle: false,

      // Only active or pending challenges
      status: { $in: ['active', 'pending'] },

      // Expires within the next hour
      expiresAt: {
        $gt: now,
        $lte: oneHourFromNow,
      },
    })
      .populate('challenger', '_id name inGameName pic')
      .populate('opponent', '_id name inGameName pic')
      .lean()

    if (!expiringChallenges.length) {
      console.log(
        '[CHALLENGE_EXPIRY_REMINDER] No challenges found that need expiry reminders',
      )
      return
    }

    console.log(
      `[CHALLENGE_EXPIRY_REMINDER] Found ${expiringChallenges.length} challenges needing expiry reminders`,
    )

    let remindersSent = 0
    let remindersSkipped = 0

    // Process each challenge
    for (const challenge of expiringChallenges) {
      try {
        await processSingleChallengeReminder(challenge)
        remindersSent++
      } catch (error) {
        console.error(
          `[CHALLENGE_EXPIRY_REMINDER] Error processing challenge ${challenge._id}:`,
          error.message,
        )
        remindersSkipped++
      }
    }

    const duration = Date.now() - startTime
    console.log(
      `[CHALLENGE_EXPIRY_REMINDER] Task completed in ${duration}ms. ` +
        `Reminders sent: ${remindersSent}, Skipped: ${remindersSkipped}`,
    )
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `[CHALLENGE_EXPIRY_REMINDER] Task failed after ${duration}ms:`,
      error.message,
    )
  }
}

/**
 * Process a single challenge for expiry reminder
 * @param {Object} challenge - The challenge document
 */
const processSingleChallengeReminder = async challenge => {
  try {
    const now = new Date()
    const timeUntilExpiry = challenge.expiresAt.getTime() - now.getTime()
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60))

    // Format time left in a human-readable way
    const timeLeft = formatTimeLeft(minutesUntilExpiry)

    // Determine which users need reminders
    const usersToRemind = []

    // Check if challenger needs reminder (for pending challenges)
    if (challenge.status === 'pending') {
      // For pending challenges, remind the opponent to accept
      usersToRemind.push({
        user: challenge.opponent,
        role: 'opponent',
      })
    } else if (challenge.status === 'active') {
      // For active challenges, remind users who haven't attempted yet
      if (!challenge.challengerAttempted) {
        usersToRemind.push({
          user: challenge.challenger,
          role: 'challenger',
        })
      }
      if (!challenge.opponentAttempted) {
        usersToRemind.push({
          user: challenge.opponent,
          role: 'opponent',
        })
      }
    }

    // Send reminders to identified users
    for (const { user } of usersToRemind) {
      try {
        const reminderSent = await sendChallengeExpiryReminder({
          challenge,
          user,
          timeLeft,
        })

        console.log(
          `[CHALLENGE_EXPIRY_REMINDER] Reminder for challenge ${
            challenge._id
          } to user ${user._id}: ${
            reminderSent ? 'sent' : 'skipped (user online)'
          }`,
        )
      } catch (userError) {
        console.error(
          `[CHALLENGE_EXPIRY_REMINDER] Failed to send reminder to user ${user._id}:`,
          userError.message,
        )
      }
    }
  } catch (error) {
    console.error(
      `[CHALLENGE_EXPIRY_REMINDER] Error processing single challenge ${challenge._id}:`,
      error.message,
    )
    throw error
  }
}

/**
 * Format minutes into human-readable time left
 * @param {number} minutes - Minutes until expiry
 * @returns {string} Formatted time string
 */
const formatTimeLeft = minutes => {
  if (minutes <= 0) {
    return 'a few moments'
  } else if (minutes === 1) {
    return '1 minute'
  } else if (minutes < 60) {
    return `${minutes} minutes`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 1) {
      return remainingMinutes > 0
        ? `1 hour ${remainingMinutes} minutes`
        : '1 hour'
    } else {
      return remainingMinutes > 0
        ? `${hours} hours ${remainingMinutes} minutes`
        : `${hours} hours`
    }
  }
}

module.exports = {
  processChallengeExpiryReminders,
}
