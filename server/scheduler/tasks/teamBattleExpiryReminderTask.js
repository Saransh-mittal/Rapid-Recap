// scheduler/tasks/teamBattleExpiryReminderTask.js
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const User = require('../../model/userSchema')
const {
  sendTeamBattleExpiryReminder,
} = require('../../services/quickClashServices/quickClashNotificationService')

/**
 * Process team battles that are about to expire and send reminder notifications
 * Runs every 10 minutes to check for battles expiring within 2 hours
 */
const processTeamBattleExpiryReminders = async () => {
  const startTime = Date.now()
  console.log(
    '[TEAM_BATTLE_EXPIRY_REMINDER] Starting team battle expiry reminder task...',
  )

  try {
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours in milliseconds

    // Find team battles that are about to expire
    const expiringBattles = await QuickClashTeamBattle.find({
      // Only active battles
      status: 'active',

      // Expires within the next 2 hours
      expiresAt: {
        $gt: now,
        $lte: twoHoursFromNow,
      },
    })
      .populate('teamA', '_id name')
      .populate('teamB', '_id name')
      .populate('teamAMembers.user', '_id name inGameName pic')
      .populate('teamBMembers.user', '_id name inGameName pic')
      .lean()

    if (!expiringBattles.length) {
      console.log(
        '[TEAM_BATTLE_EXPIRY_REMINDER] No team battles found that need expiry reminders',
      )
      return
    }

    console.log(
      `[TEAM_BATTLE_EXPIRY_REMINDER] Found ${expiringBattles.length} team battles needing expiry reminders`,
    )

    let remindersSent = 0
    let remindersSkipped = 0

    // Process each battle
    for (const battle of expiringBattles) {
      try {
        const sentCount = await processSingleTeamBattleReminder(battle)
        remindersSent += sentCount
      } catch (error) {
        console.error(
          `[TEAM_BATTLE_EXPIRY_REMINDER] Error processing battle ${battle._id}:`,
          error.message,
        )
        remindersSkipped++
      }
    }

    const duration = Date.now() - startTime
    console.log(
      `[TEAM_BATTLE_EXPIRY_REMINDER] Task completed in ${duration}ms. ` +
        `Reminders sent: ${remindersSent}, Battles skipped: ${remindersSkipped}`,
    )
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `[TEAM_BATTLE_EXPIRY_REMINDER] Task failed after ${duration}ms:`,
      error.message,
    )
  }
}

/**
 * Process a single team battle for expiry reminder
 * @param {Object} battle - The team battle document
 * @returns {number} Number of reminders sent
 */
const processSingleTeamBattleReminder = async battle => {
  try {
    const now = new Date()
    const timeUntilExpiry = battle.expiresAt.getTime() - now.getTime()
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60))

    // Format time left in a human-readable way
    const timeLeft = formatTimeLeft(minutesUntilExpiry)

    // Determine which users need reminders
    const usersToRemind = []

    // Check team A members
    for (const member of battle.teamAMembers) {
      const reminderReason = shouldRemindMember(member, battle)
      usersToRemind.push({
        user: member.user,
        team: battle.teamA,
        opponentTeam: battle.teamB,
        reminderReason,
        isTeamA: true,
      })
    }

    // Check team B members
    for (const member of battle.teamBMembers) {
      const reminderReason = shouldRemindMember(member, battle)
      usersToRemind.push({
        user: member.user,
        team: battle.teamB,
        opponentTeam: battle.teamA,
        reminderReason,
        isTeamA: false,
      })
    }

    if (usersToRemind.length === 0) {
      console.log(
        `[TEAM_BATTLE_EXPIRY_REMINDER] No team members found for battle ${battle._id}`,
      )
      return 0
    }

    // Send reminders to identified users
    let remindersSent = 0
    for (const reminderData of usersToRemind) {
      try {
        const reminderSent = await sendTeamBattleExpiryReminder({
          battle,
          user: reminderData.user,
          team: reminderData.team,
          opponentTeam: reminderData.opponentTeam,
          timeLeft,
          reminderReason: reminderData.reminderReason,
        })

        if (reminderSent) {
          remindersSent++
        }

        console.log(
          `[TEAM_BATTLE_EXPIRY_REMINDER] Reminder for battle ${
            battle._id
          } to user ${reminderData.user._id} (${
            reminderData.reminderReason
          }): ${reminderSent ? 'sent' : 'skipped (user online)'}`,
        )
      } catch (userError) {
        console.error(
          `[TEAM_BATTLE_EXPIRY_REMINDER] Failed to send reminder to user ${reminderData.user._id}:`,
          userError.message,
        )
      }
    }

    return remindersSent
  } catch (error) {
    console.error(
      `[TEAM_BATTLE_EXPIRY_REMINDER] Error processing single battle ${battle._id}:`,
      error.message,
    )
    throw error
  }
}

/**
 * Determine if a team member should be reminded and why
 * @param {Object} member - Team member object
 * @param {Object} battle - Battle object
 * @returns {string} Reason for reminder (always returns a reason since we want to remind all members)
 */
const shouldRemindMember = (member, battle) => {
  // If member hasn't participated at all
  if (!member.participated) {
    return 'not_participating'
  }

  // If member participated but hasn't completed
  if (member.participated && !member.completed) {
    return 'not_completed'
  }

  // If member has completed their part
  if (member.participated && member.completed) {
    return 'completed_waiting_for_team'
  }

  // Check if member has selected a category but challenge hasn't been created
  if (member.category) {
    const memberChallenge = battle.challenges.find(
      challenge => challenge.category === member.category,
    )

    if (!memberChallenge || !memberChallenge.challenge) {
      return 'waiting_for_challenge'
    }
  } else {
    // Member hasn't selected a category yet
    return 'no_category_selected'
  }

  // Default case - battle is expiring
  return 'battle_expiring'
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
  processTeamBattleExpiryReminders,
}
