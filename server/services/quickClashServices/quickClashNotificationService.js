// services/quickClashServices/quickClashNotificationService.js
const { sendNotification } = require('../notificationService')
const ApplicationUpdates = require('../../model/applicationUpdatesSchema')
const User = require('../../model/userSchema')
const globalEmitter = require('../../eventEmitter')
const QuickClashOutcomeTracker = require('../../utils/quickClashOutcomeTracker')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const { isUserOnline } = require('../../utils/socketUtils') // Use the new socket utils

/**
 * Send notification and create app update only if user is offline
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - User ID
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {string} params.mainText - App update main text
 * @param {string} [params.url='/quickclash'] - Notification URL
 * @param {string} [params.importance='normal'] - Notification importance
 * @returns {Promise<boolean>} True if notification was sent, false if user is online
 */
const sendNotificationIfOffline = async ({
  userId,
  title,
  body,
  mainText,
  url = '/quickclash',
  importance = 'normal',
}) => {
  try {
    // Check if user is online using the socket utils
    if (isUserOnline(userId)) {
      console.log(
        `[NOTIFICATION] User ${userId} is online, skipping notification: ${title}`,
      )
      return false
    }

    console.log(
      `[NOTIFICATION] User ${userId} is offline, sending notification: ${title}`,
    )

    // Create application update
    const appUpdate = new ApplicationUpdates({
      title,
      mainText,
      userId,
      type: 'applicationUpdate',
    })

    await appUpdate.save()

    // Send push notification
    await sendNotification({
      title,
      body,
      url,
      userId,
      messageId: appUpdate._id.toString(),
      type: 'quickClash',
      importance,
    })

    return true
  } catch (error) {
    console.error(
      `[NOTIFICATION] Error sending notification to user ${userId}:`,
      error,
    )
    return false
  }
}

/**
 * Send notification when a new challenge is created
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - The challenge document with basic info
 * @param {Object} params.challenger - The user who created the challenge
 * @param {Object} params.opponent - The opponent user
 */
const notifyChallengeCreated = async ({ challenge, challenger, opponent }) => {
  try {
    // Only send notification if opponent is offline
    const notificationSent = await sendNotificationIfOffline({
      userId: opponent._id,
      title: 'New Quick Clash Challenge',
      body: `${
        challenger.inGameName || challenger.name
      } has challenged you to a knowledge battle!`,
      mainText: `${
        challenger.inGameName || challenger.name
      } has challenged you to a knowledge battle in the ${
        challenge.category
      } category!`,
      importance: 'important',
    })

    // Always emit socket event (socket system will handle delivery)
    globalEmitter.emit('quickClash:challengeCreated', {
      challenge,
      challenger,
      opponent,
      notificationSent, // Include whether push notification was sent
    })

    // Also emit challenger notification for success
    globalEmitter.emit('quickClash:challengerNotified', {
      challenge,
      challenger,
      opponent,
      success: true,
    })

    console.log(
      `[NOTIFICATION] Challenge created notification - Socket: sent, Push: ${
        notificationSent ? 'sent' : 'skipped'
      }`,
    )
  } catch (error) {
    console.error('Error sending challenge created notification:', error)
    // Non-blocking - this doesn't affect the main challenge creation flow
  }
}

/**
 * Notify challenger about challenge creation status
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - Challenge basic info
 * @param {Object} params.challenger - The challenger user
 * @param {Object} params.opponent - The opponent user
 * @param {boolean} params.success - Whether creation was successful
 * @param {string} [params.errorMessage] - Error message if creation failed
 */
const notifyChallengerAboutCreation = async ({
  challenge,
  challenger,
  opponent,
  success,
  errorMessage,
}) => {
  try {
    if (success) {
      // For success cases, this is now handled by notifyChallengeCreated or notifyMatchmakingSuccess
      // Only emit socket event for backward compatibility
      globalEmitter.emit('quickClash:challengerNotified', {
        challenge,
        challenger,
        opponent,
        success: true,
      })
    } else {
      // Only send notification if challenger is offline
      const notificationSent = await sendNotificationIfOffline({
        userId: challenger._id,
        title: 'Challenge Creation Failed',
        body: "We couldn't create your Quick Clash challenge. Please try again.",
        mainText: `We couldn't create your Quick Clash challenge to ${
          opponent.inGameName || opponent.name
        }. ${errorMessage || 'Please try again later.'}`,
        importance: 'normal',
      })

      // Emit event for socket notification about failure to challenger
      globalEmitter.emit('quickClash:challengerNotified', {
        challenge,
        challenger,
        opponent,
        success: false,
        errorMessage: errorMessage || 'Failed to create challenge',
        notificationSent,
      })

      console.log(
        `[NOTIFICATION] Challenge creation failed notification - Socket: sent, Push: ${
          notificationSent ? 'sent' : 'skipped'
        }`,
      )
    }
  } catch (error) {
    console.error(
      'Error sending challenger notification about creation:',
      error,
    )
  }
}

/**
 * Send notification when a challenge is accepted
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - The challenge document with basic info
 * @param {Object} params.challenger - The user who created the challenge
 * @param {Object} params.opponent - The opponent user who accepted
 */
const notifyChallengeAccepted = async ({ challenge, challenger, opponent }) => {
  try {
    // Only send notification if challenger is offline
    const notificationSent = await sendNotificationIfOffline({
      userId: challenger._id,
      title: 'Challenge Accepted!',
      body: `${
        opponent.inGameName || opponent.name
      } has accepted your Quick Clash challenge!`,
      mainText: `${
        opponent.inGameName || opponent.name
      } has accepted your Quick Clash challenge in the ${
        challenge.category
      } category!`,
      importance: 'normal',
    })

    // Emit event for socket notification
    globalEmitter.emit('quickClash:challengeAccepted', {
      challengeId: challenge._id,
      category: challenge.category,
      challenger,
      opponent,
      notificationSent,
    })

    console.log(
      `[NOTIFICATION] Challenge accepted notification - Socket: sent, Push: ${
        notificationSent ? 'sent' : 'skipped'
      }`,
    )
  } catch (error) {
    console.error('Error sending challenge accepted notification:', error)
  }
}

/**
 * Send notification when a challenge is rejected
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - The challenge document with basic info
 * @param {Object} params.challenger - The user who created the challenge
 * @param {Object} params.opponent - The opponent user who rejected
 */
const notifyChallengeRejected = async ({ challenge, challenger, opponent }) => {
  try {
    // Only send notification if challenger is offline
    const notificationSent = await sendNotificationIfOffline({
      userId: challenger._id,
      title: 'Challenge Rejected',
      body: `${
        opponent.inGameName || opponent.name
      } has declined your Quick Clash challenge.`,
      mainText: `${
        opponent.inGameName || opponent.name
      } has declined your Quick Clash challenge in the ${
        challenge.category
      } category.`,
      importance: 'normal',
    })

    // Emit event for socket notification
    globalEmitter.emit('quickClash:challengeRejected', {
      challengeId: challenge._id,
      category: challenge.category,
      challenger,
      opponent,
      notificationSent,
    })

    console.log(
      `[NOTIFICATION] Challenge rejected notification - Socket: sent, Push: ${
        notificationSent ? 'sent' : 'skipped'
      }`,
    )
  } catch (error) {
    console.error('Error sending challenge rejected notification:', error)
  }
}

/**
 * Send notification when a challenge is completed
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - The challenge document
 * @param {string} params.completedByUserId - ID of the user who just completed their part
 */
const notifyChallengeCompleted = async ({ challenge, completedByUserId }) => {
  try {
    // Both players have completed
    if (challenge.challengerAttempted && challenge.opponentAttempted) {
      // Get user information
      const [challenger, opponent] = await Promise.all([
        User.findById(challenge.challenger),
        User.findById(challenge.opponent),
      ])

      // Update challenge with user details for socket emission
      challenge.challenger = challenger
      challenge.opponent = opponent

      const challengerWon = challenge.challengerScore > challenge.opponentScore
      const isTie = challenge.challengerScore === challenge.opponentScore

      let teamBattleParticipantIds = []
      if (challenge?.fromTeamBattle) {
        const battle = await QuickClashTeamBattle.findById(
          challenge.teamBattle.toString(),
        )
        // get all the participant ids
        const teamAMembers = battle.teamAMembers.map(member => member.user)
        const teamBMembers = battle.teamBMembers.map(member => member.user)
        teamBattleParticipantIds = [...teamAMembers, ...teamBMembers]
      } else {
        // Send notifications only to offline users
        const challengerNotificationSent = await sendNotificationIfOffline({
          userId: challenger._id,
          title: challengerWon
            ? 'Victory in Quick Clash!'
            : isTie
            ? 'Quick Clash Tie!'
            : 'Quick Clash Result',
          body: isTie
            ? `Your battle with ${
                opponent.inGameName || opponent.name
              } ended in a tie!`
            : `Final score: You (${challenge.challengerScore}) vs ${
                opponent.inGameName || opponent.name
              } (${challenge.opponentScore})`,
          mainText: isTie
            ? `Your battle with ${
                opponent.inGameName || opponent.name
              } ended in a tie with both scoring ${
                challenge.challengerScore
              } points!`
            : `Final score: ${challenger.inGameName || challenger.name} (${
                challenge.challengerScore
              }) vs ${opponent.inGameName || opponent.name} (${
                challenge.opponentScore
              })`,
          importance: 'important', // Results are always important
        })

        const opponentNotificationSent = await sendNotificationIfOffline({
          userId: opponent._id,
          title: !challengerWon
            ? 'Victory in Quick Clash!'
            : isTie
            ? 'Quick Clash Tie!'
            : 'Quick Clash Result',
          body: isTie
            ? `Your battle with ${
                challenger.inGameName || challenger.name
              } ended in a tie!`
            : `Final score: You (${challenge.opponentScore}) vs ${
                challenger.inGameName || challenger.name
              } (${challenge.challengerScore})`,
          mainText: isTie
            ? `Your battle with ${
                challenger.inGameName || challenger.name
              } ended in a tie with both scoring ${
                challenge.opponentScore
              } points!`
            : `Final score: ${opponent.inGameName || opponent.name} (${
                challenge.opponentScore
              }) vs ${challenger.inGameName || challenger.name} (${
                challenge.challengerScore
              })`,
          importance: 'important', // Results are always important
        })

        console.log(
          `[NOTIFICATION] Challenge completed (both players) - Challenger push: ${
            challengerNotificationSent ? 'sent' : 'skipped'
          }, Opponent push: ${opponentNotificationSent ? 'sent' : 'skipped'}`,
        )
      }

      let trackWinnerOutcomeResult
      try {
        trackWinnerOutcomeResult = await QuickClashOutcomeTracker.trackOutcome({
          challengeId: challenge._id.toString(),
        })
      } catch (error) {
        trackWinnerOutcomeResult = null
      }

      globalEmitter.emit('quickClash:challengeCompletedByBothPlayers', {
        challenge,
        teamBattleParticipantIds,
        trackWinnerOutcomeResult,
        completedByUserId,
      })
    } else {
      // Only one player has completed - notify the other player
      // Calculate how long since the challenge was created
      const createdAt = new Date(challenge.createdAt).getTime()
      const now = new Date().getTime()
      const timeSinceCreation = now - createdAt
      let teamBattleParticipantIds = []

      if (challenge?.fromTeamBattle) {
        const battle = await QuickClashTeamBattle.findById(
          challenge.teamBattle.toString(),
        )
        // get all the participant ids
        const teamAMembers = battle.teamAMembers.map(member => member.user)
        const teamBMembers = battle.teamBMembers.map(member => member.user)
        teamBattleParticipantIds = [...teamAMembers, ...teamBMembers]
      } else {
        const isChallenger =
          completedByUserId.toString() ===
          (challenge.challenger._id || challenge.challenger).toString()
        const otherPlayerId = isChallenger
          ? challenge.opponent._id || challenge.opponent
          : challenge.challenger._id || challenge.challenger

        // If it's been a while, this becomes an important notification
        const isImportant = timeSinceCreation > 12 * 3600000 // 12 hours

        // Get user information for both players
        const [completedPlayer, otherPlayer] = await Promise.all([
          isChallenger
            ? User.findById(
                challenge.challenger._id || challenge.challenger,
              ).select('name inGameName')
            : User.findById(challenge.opponent._id || challenge.opponent).select(
                'name inGameName',
              ),
          isChallenger
            ? User.findById(challenge.opponent._id || challenge.opponent).select(
                'name inGameName',
              )
            : User.findById(
                challenge.challenger._id || challenge.challenger,
              ).select('name inGameName'),
        ])

        // Only send notification if other player is offline
        const notificationSent = await sendNotificationIfOffline({
          userId: otherPlayerId,
          title: 'Your Turn in Quick Clash!',
          body: `${
            completedPlayer.inGameName || completedPlayer.name
          } has completed their challenge. Your turn now!`,
          mainText: `${
            completedPlayer.inGameName || completedPlayer.name
          } has completed their part of the Quick Clash challenge in the ${
            challenge.category
          } category. It's your turn now!`,
          importance: isImportant ? 'important' : 'normal', // Important if it's been waiting a while
        })

        console.log(
          `[NOTIFICATION] Challenge completed (waiting for other player) - Push: ${
            notificationSent ? 'sent' : 'skipped'
          }`,
        )
      }

      // Emit event for socket notification
      globalEmitter.emit('quickClash:challengeCompleted', {
        challenge,
        teamBattleParticipantIds,
        completedByUserId,
        waitTime: timeSinceCreation,
      })
    }
  } catch (error) {
    console.error('Error sending challenge completion notification:', error)
  }
}

/**
 * Send notifications to both players when a match is found through matchmaking
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - The challenge document with basic info
 * @param {Object} params.challenger - The user who was matched as challenger
 * @param {Object} params.opponent - The user who was matched as opponent
 */
const notifyMatchmakingSuccess = async ({
  challenge,
  challenger,
  opponent,
}) => {
  try {
    // Send notifications only to offline users
    const challengerNotificationSent = await sendNotificationIfOffline({
      userId: challenger._id,
      title: 'Match Found!',
      body: `You've been matched with ${
        opponent.inGameName || opponent.name
      } for a Quick Clash battle!`,
      mainText: `You've been matched with ${
        opponent.inGameName || opponent.name
      } for a Quick Clash battle in the ${challenge.category} category!`,
      importance: 'important',
    })

    const opponentNotificationSent = await sendNotificationIfOffline({
      userId: opponent._id,
      title: 'Match Found!',
      body: `You've been matched with ${
        challenger.inGameName || challenger.name
      } for a Quick Clash battle!`,
      mainText: `You've been matched with ${
        challenger.inGameName || challenger.name
      } for a Quick Clash battle in the ${challenge.category} category!`,
      importance: 'important',
    })

    // Emit event for socket notifications
    globalEmitter.emit('quickClash:matchFound', {
      challengeId: challenge._id,
      category: challenge.category,
      challenger,
      opponent,
      challengerNotificationSent,
      opponentNotificationSent,
    })

    console.log(
      `[NOTIFICATION] Matchmaking success notifications - Challenger push: ${
        challengerNotificationSent ? 'sent' : 'skipped'
      }, Opponent push: ${opponentNotificationSent ? 'sent' : 'skipped'}`,
    )
  } catch (error) {
    console.error('Error sending matchmaking success notifications:', error)
  }
}

/**
 * Send engaging reminder notifications for challenges about to expire
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - The challenge document
 * @param {Object} params.user - The user who needs to be reminded
 * @param {string} params.timeLeft - Human readable time left (e.g., "45 minutes")
 * @returns {Promise<boolean>} True if notification was sent, false if user is online
 */
const sendChallengeExpiryReminder = async ({ challenge, user, timeLeft }) => {
  try {
    // Get opponent name for context
    const isChallenger =
      challenge.challenger._id.toString() === user._id.toString()
    const opponent = isChallenger ? challenge.opponent : challenge.challenger
    const opponentName = opponent.inGameName || opponent.name

    // Create engaging messages
    const messages = getEngagingReminderMessages({
      opponentName,
      category: challenge.category,
      timeLeft,
    })

    // Only send notification if user is offline
    const notificationSent = await sendNotificationIfOffline({
      userId: user._id,
      title: messages.title,
      body: messages.body,
      mainText: messages.mainText,
      importance: 'important',
    })

    console.log(
      `[REMINDER] Challenge expiry reminder for ${user._id} - Push: ${
        notificationSent ? 'sent' : 'skipped (user online)'
      }`,
    )

    return notificationSent
  } catch (error) {
    console.error(
      `[REMINDER] Error sending challenge expiry reminder to user ${user._id}:`,
      error,
    )
    return false
  }
}

/**
 * Generate engaging reminder messages
 * @param {Object} params - Parameters
 * @param {string} params.opponentName - Opponent's name
 * @param {string} params.category - Challenge category
 * @param {string} params.timeLeft - Time left until expiry
 * @returns {Object} Message object with title, body, and mainText
 */
const getEngagingReminderMessages = ({ opponentName, category, timeLeft }) => {
  const messages = [
    {
      title: '⚡ Challenge Expiring Soon!',
      body: `Your battle with ${opponentName} expires in ${timeLeft}. Don't miss out on those trophies!`,
      mainText: `Your Quick Clash challenge against ${opponentName} in ${category} is about to expire in ${timeLeft}. Complete it now to earn trophies!`,
    },
    {
      title: '🏆 Trophy Battle Awaits!',
      body: `${timeLeft} left to defeat ${opponentName}. Will you claim victory?`,
      mainText: `Time is running out! You have ${timeLeft} remaining to complete your ${category} challenge against ${opponentName}.`,
    },
    {
      title: '⏰ Last Chance for Glory!',
      body: `${opponentName} is waiting! ${timeLeft} to prove your ${category} knowledge.`,
      mainText: `Your Quick Clash challenge with ${opponentName} expires in ${timeLeft}. Take on the challenge now!`,
    },
    {
      title: '🎯 Final Call for Battle!',
      body: `Don't let ${opponentName} win by default! ${timeLeft} remaining.`,
      mainText: `Your ${category} challenge against ${opponentName} will expire in ${timeLeft}. Fight for those trophies!`,
    },
  ]

  // Select a random message for variety
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Send engaging notification when team matchmaking starts
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.teamName - Team name
 * @param {string} params.leaderName - Name of the team leader who started matchmaking
 * @param {Array} params.teamMembers - Array of team member objects with user info
 * @param {string} params.leaderId - ID of the team leader (to exclude from notifications)
 */
const notifyTeamMatchmakingStarted = async ({
  teamId,
  teamName,
  leaderName,
  teamMembers,
  leaderId,
}) => {
  try {
    console.log(
      `[TEAM_MATCHMAKING] Sending matchmaking started notifications for team ${teamName}`,
    )

    let notificationsSent = 0
    const totalMembers = teamMembers.length - 1 // Exclude leader

    // Send notifications to all team members except the leader
    for (const member of teamMembers) {
      const memberId = member.user._id || member.user
      const memberIdStr = memberId.toString()

      // Skip the leader who started matchmaking
      if (memberIdStr === leaderId.toString()) {
        continue
      }

      // Get member's name for personalization
      const memberName =
        member.user.name || member.user.inGameName || 'Teammate'

      // Send engaging notification only to offline members
      const notificationSent = await sendNotificationIfOffline({
        userId: memberIdStr,
        title: '🚀 Squad Battle Ready!',
        body: `${leaderName} started matchmaking for "${teamName}". Your squad is hunting for opponents!`,
        mainText: `Hey ${memberName}! 🎯\n\n${leaderName} just launched "${teamName}" into battle matchmaking! Your squad is now actively searching for worthy opponents.\n\n⚡ Jump in now to support your team and get ready for an epic 4v4 clash!\n\nDon't keep your teammates waiting - the battle arena awaits! 🔥`,
        importance: 'important',
        url: '/quickclash',
      })

      if (notificationSent) {
        notificationsSent++
      }
    }

    console.log(
      `[TEAM_MATCHMAKING] Sent ${notificationsSent}/${totalMembers} matchmaking notifications for team "${teamName}"`,
    )

    return {
      success: true,
      notificationsSent,
      totalEligibleMembers: totalMembers,
    }
  } catch (error) {
    console.error(
      `[TEAM_MATCHMAKING] Error sending team matchmaking notifications:`,
      error,
    )
    return {
      success: false,
      error: error.message,
      notificationsSent: 0,
    }
  }
}

/**
 * Send engaging reminder notifications for team battles about to expire
 * @param {Object} params - Parameters
 * @param {Object} params.battle - The team battle document
 * @param {Object} params.user - The user who needs to be reminded
 * @param {Object} params.team - The user's team
 * @param {Object} params.opponentTeam - The opponent team
 * @param {string} params.timeLeft - Human readable time left (e.g., "45 minutes")
 * @param {string} params.reminderReason - Why the user is being reminded
 * @returns {Promise<boolean>} True if notification was sent, false if user is online
 */
const sendTeamBattleExpiryReminder = async ({
  battle,
  user,
  team,
  opponentTeam,
  timeLeft,
  reminderReason,
}) => {
  try {
    const teamName = team?.name || 'Your Squad'
    const opponentTeamName = opponentTeam?.name || 'Opponent Squad'

    // Create engaging messages based on reminder reason
    const messages = getEngagingTeamBattleReminderMessages({
      teamName,
      opponentTeamName,
      timeLeft,
      reminderReason,
    })

    // Only send notification if user is offline
    const notificationSent = await sendNotificationIfOffline({
      userId: user._id,
      title: messages.title,
      body: messages.body,
      mainText: messages.mainText,
      importance: 'important',
      url: '/quickclash#active/4v4', // Specific URL for team battles
    })

    console.log(
      `[TEAM_BATTLE_REMINDER] Team battle expiry reminder for ${
        user._id
      } (${reminderReason}) - Push: ${
        notificationSent ? 'sent' : 'skipped (user online)'
      }`,
    )

    return notificationSent
  } catch (error) {
    console.error(
      `[TEAM_BATTLE_REMINDER] Error sending team battle expiry reminder to user ${user._id}:`,
      error,
    )
    return false
  }
}

/**
 * Send notification when team battle ends (completed with results)
 * @param {Object} params - Parameters
 * @param {Object} params.battle - The completed team battle document
 * @param {Array} params.teamAMembers - Team A member details
 * @param {Array} params.teamBMembers - Team B member details
 * @param {Object} params.teamA - Team A details
 * @param {Object} params.teamB - Team B details
 * @returns {Promise<number>} Number of notifications sent
 */
const notifyTeamBattleCompleted = async ({
  battle,
  teamAMembers,
  teamBMembers,
  teamA,
  teamB,
}) => {
  try {
    const teamAName = teamA?.name || 'Your Squad'
    const teamBName = teamB?.name || 'Opponent Squad'
    const battleResult = battle.winner
    const isTie = battleResult === 'tie'

    let notificationsSent = 0

    // Notify Team A members
    for (const member of teamAMembers) {
      try {
        const isWinner = battleResult === 'teamA'
        const messages = getTeamBattleCompletedMessages({
          userTeamName: teamAName,
          opponentTeamName: teamBName,
          isWinner,
          isTie,
          trophyChange: member.trophyChange,
          finalScore: `${battle.teamAWins}-${battle.teamBWins}`,
          userParticipated: member.participated,
          userCompleted: member.completed,
        })

        const notificationSent = await sendNotificationIfOffline({
          userId: member.user,
          title: messages.title,
          body: messages.body,
          mainText: messages.mainText,
          importance: 'important',
          url: '/quickclash#active/4v4',
        })

        if (notificationSent) {
          notificationsSent++
        }

        console.log(
          `[TEAM_BATTLE_COMPLETED] Notification for Team A member ${
            member.user
          } - Push: ${notificationSent ? 'sent' : 'skipped (user online)'}`,
        )
      } catch (error) {
        console.error(
          `[TEAM_BATTLE_COMPLETED] Error notifying Team A member ${member.user}:`,
          error,
        )
      }
    }

    // Notify Team B members
    for (const member of teamBMembers) {
      try {
        const isWinner = battleResult === 'teamB'
        const messages = getTeamBattleCompletedMessages({
          userTeamName: teamBName,
          opponentTeamName: teamAName,
          isWinner,
          isTie,
          trophyChange: member.trophyChange,
          finalScore: `${battle.teamBWins}-${battle.teamAWins}`,
          userParticipated: member.participated,
          userCompleted: member.completed,
        })

        const notificationSent = await sendNotificationIfOffline({
          userId: member.user,
          title: messages.title,
          body: messages.body,
          mainText: messages.mainText,
          importance: 'important',
          url: '/quickclash#active/4v4',
        })

        if (notificationSent) {
          notificationsSent++
        }

        console.log(
          `[TEAM_BATTLE_COMPLETED] Notification for Team B member ${
            member.user
          } - Push: ${notificationSent ? 'sent' : 'skipped (user online)'}`,
        )
      } catch (error) {
        console.error(
          `[TEAM_BATTLE_COMPLETED] Error notifying Team B member ${member.user}:`,
          error,
        )
      }
    }

    console.log(
      `[TEAM_BATTLE_COMPLETED] Battle ${
        battle._id
      } completion notifications sent: ${notificationsSent}/${
        teamAMembers.length + teamBMembers.length
      }`,
    )

    return notificationsSent
  } catch (error) {
    console.error(
      `[TEAM_BATTLE_COMPLETED] Error sending team battle completion notifications:`,
      error,
    )
    return 0
  }
}

/**
 * Generate engaging messages for team battle completion
 * @param {Object} params - Parameters
 * @param {string} params.userTeamName - User's team name
 * @param {string} params.opponentTeamName - Opponent team name
 * @param {boolean} params.isWinner - Whether user's team won
 * @param {boolean} params.isTie - Whether battle was a tie
 * @param {number} params.trophyChange - Trophy change for user
 * @param {string} params.finalScore - Final score (e.g., "3-1")
 * @param {boolean} params.userParticipated - Whether user participated
 * @param {boolean} params.userCompleted - Whether user completed their challenge
 * @returns {Object} Message object with title, body, and mainText
 */
const getTeamBattleCompletedMessages = ({
  userTeamName,
  opponentTeamName,
  isWinner,
  isTie,
  trophyChange,
  finalScore,
  userParticipated,
  userCompleted,
}) => {
  const trophyText =
    trophyChange > 0
      ? `+${trophyChange} trophies`
      : trophyChange < 0
      ? `${trophyChange} trophies`
      : 'No trophy change'

  if (isTie) {
    return {
      title: '⚔️ Epic Squad Battle Draw!',
      body: `${userTeamName} vs ${opponentTeamName} ended ${finalScore}! What a battle!`,
      mainText: `🤝 EPIC STALEMATE: Your squad battle ended in an incredible draw!\n\n"${userTeamName}" vs "${opponentTeamName}" - Final Score: ${finalScore}\n\n🎯 Battle Summary:\n⚖️ Perfectly matched teams\n🏆 ${trophyText}\n${
        userParticipated && userCompleted
          ? '✅ You fought valiantly'
          : '👥 Great team effort'
      }\n\nWhat an incredible display of knowledge! 🌟`,
    }
  }

  if (isWinner) {
    const winMessages = [
      {
        title: '🏆 SQUAD VICTORY!',
        body: `${userTeamName} CONQUERED ${opponentTeamName} ${finalScore}! Epic win!`,
        mainText: `🎉 GLORIOUS VICTORY: Your squad has triumphed!\n\n"${userTeamName}" DEFEATED "${opponentTeamName}" - Final Score: ${finalScore}\n\n🔥 Victory Rewards:\n🏆 ${trophyText} earned\n⭐ Squad supremacy achieved\n${
          userParticipated && userCompleted
            ? '💪 Your contribution was crucial'
            : '👥 Amazing team effort'
        }\n\nCelebrate this epic conquest! 🚀`,
      },
      {
        title: '⚡ SQUAD DOMINATION!',
        body: `${userTeamName} crushed ${opponentTeamName} ${finalScore}! Victory is yours!`,
        mainText: `👑 TOTAL DOMINATION: Your squad reigns supreme!\n\n"${userTeamName}" vs "${opponentTeamName}" - Victory Score: ${finalScore}\n\n🎯 Champions' Rewards:\n🏆 ${trophyText} claimed\n⚡ Knowledge superiority proven\n${
          userParticipated && userCompleted
            ? '🌟 You were instrumental in this victory'
            : '🤝 Incredible teamwork prevailed'
        }\n\nYour squad is unstoppable! 💫`,
      },
      {
        title: '🚀 LEGENDARY SQUAD WIN!',
        body: `${finalScore} victory! ${userTeamName} outplayed ${opponentTeamName}!`,
        mainText: `🔥 LEGENDARY TRIUMPH: Your squad has made history!\n\n"${userTeamName}" vs "${opponentTeamName}" - Winning Score: ${finalScore}\n\n⭐ Epic Achievement:\n🏆 ${trophyText} secured\n🎯 Perfect team execution\n${
          userParticipated && userCompleted
            ? '⚡ Your expertise shined bright'
            : '👥 Flawless squad coordination'
        }\n\nThis victory will be remembered! 🏅`,
      },
    ]
    return winMessages[Math.floor(Math.random() * winMessages.length)]
  } else {
    const loseMessages = [
      {
        title: '⚔️ Valiant Squad Effort!',
        body: `${userTeamName} fought hard vs ${opponentTeamName} ${finalScore}. Regroup and rise!`,
        mainText: `🛡️ HONORABLE BATTLE: Your squad fought with courage!\n\n"${userTeamName}" vs "${opponentTeamName}" - Final Score: ${finalScore}\n\n💪 Battle Report:\n🏆 ${trophyText}\n⚡ Valuable experience gained\n${
          userParticipated && userCompleted
            ? '🌟 You gave your all for the team'
            : '👥 Strong team spirit shown'
        }\n\nEvery battle makes you stronger! 🚀`,
      },
      {
        title: '🔥 Squad Battle Experience!',
        body: `Close battle! ${opponentTeamName} edged ${userTeamName} ${finalScore}. Bounce back!`,
        mainText: `⚡ HARD-FOUGHT BATTLE: Your squad showed true grit!\n\n"${userTeamName}" vs "${opponentTeamName}" - Score: ${finalScore}\n\n🎯 Learning Opportunity:\n🏆 ${trophyText}\n📈 Skills sharpened in battle\n${
          userParticipated && userCompleted
            ? '💫 Your effort was commendable'
            : '🤝 Great team collaboration'
        }\n\nCome back stronger than ever! 💪`,
      },
      {
        title: '🌟 Squad Growth Moment!',
        body: `${opponentTeamName} won ${finalScore}, but ${userTeamName} never gives up!`,
        mainText: `🚀 RESILIENCE BUILDING: Every battle is a step forward!\n\n"${userTeamName}" vs "${opponentTeamName}" - Final: ${finalScore}\n\n⭐ Growth Achieved:\n🏆 ${trophyText}\n🎯 New strategies learned\n${
          userParticipated && userCompleted
            ? '🔥 You fought with honor'
            : '👥 Team unity strengthened'
        }\n\nYour comeback story starts now! 🌟`,
      },
    ]
    return loseMessages[Math.floor(Math.random() * loseMessages.length)]
  }
}
const getEngagingTeamBattleReminderMessages = ({
  teamName,
  opponentTeamName,
  timeLeft,
  reminderReason,
}) => {
  const baseMessages = {
    not_participating: [
      {
        title: '🚨 Squad Battle Emergency!',
        body: `${teamName} vs ${opponentTeamName} expires in ${timeLeft}! Your squad needs you NOW!`,
        mainText: `🔥 URGENT: Your epic 4v4 squad battle "${teamName}" vs "${opponentTeamName}" is about to expire in ${timeLeft}!\n\nYour teammates are counting on you! Jump in now to:\n⚡ Select your battle category\n🎯 Prove your knowledge supremacy\n🏆 Claim victory for your squad\n\nDon't let your team down - the arena awaits! 💪`,
      },
      {
        title: '⚡ Your Squad is Under Attack!',
        body: `${opponentTeamName} is waiting! ${teamName} battle expires in ${timeLeft}!`,
        mainText: `🛡️ BATTLE ALERT: "${opponentTeamName}" is challenging your squad "${teamName}" and time is running out!\n\n⏰ Only ${timeLeft} left to:\n🎯 Choose your specialty category\n⚔️ Defend your team's honor\n🏆 Secure those precious trophies\n\nYour squad is counting on your expertise! 🌟`,
      },
    ],
    not_completed: [
      {
        title: '🎯 Finish Your Squad Mission!',
        body: `${teamName} vs ${opponentTeamName} - ${timeLeft} to complete your challenge!`,
        mainText: `⚔️ MISSION INCOMPLETE: Your squad battle challenge is waiting!\n\n"${teamName}" vs "${opponentTeamName}" expires in ${timeLeft}!\n\n🔥 You've started but haven't finished:\n✅ Category selected\n⏳ Challenge in progress\n🏆 Victory within reach\n\nComplete your mission and bring glory to your squad! 💫`,
      },
      {
        title: '🏆 Victory Awaits Your Squad!',
        body: `Complete your challenge for ${teamName}! ${timeLeft} remaining!`,
        mainText: `🌟 SO CLOSE TO VICTORY: Your squad "${teamName}" is depending on you!\n\n⏰ Only ${timeLeft} left to complete your challenge against "${opponentTeamName}"\n\n🎯 You're almost there:\n✅ Challenge started\n⚡ Knowledge tested\n🏆 Trophies waiting\n\nFinish strong and lead your team to triumph! 🚀`,
      },
    ],
    completed_waiting_for_team: [
      {
        title: '🎖️ Squad Leader Alert!',
        body: `${teamName} vs ${opponentTeamName} - Rally your teammates! ${timeLeft} left!`,
        mainText: `⭐ CHAMPION DUTY: You've crushed your challenge! Now it's time to lead!\n\n"${teamName}" vs "${opponentTeamName}" expires in ${timeLeft}!\n\n🔥 Your mission as squad champion:\n✅ You've dominated your category\n👥 Rally your teammates\n🏆 Secure the team victory\n\nCheck on your squad and cheer them to victory! 🚀`,
      },
      {
        title: '🌟 Victory Captain!',
        body: `You conquered your challenge! Help ${teamName} finish strong - ${timeLeft} left!`,
        mainText: `👑 SQUAD CAPTAIN: Your expertise has been proven!\n\n"${teamName}" vs "${opponentTeamName}" - ${timeLeft} remaining!\n\n🎯 Leadership moment:\n✅ Your battle won\n🤝 Support your team\n🏆 Guide them to victory\n\nYour squad needs your encouragement to cross the finish line! 💪`,
      },
      {
        title: '🔥 Team Victory Depends on You!',
        body: `${teamName} battle expires in ${timeLeft}! Check your team's progress!`,
        mainText: `⚡ SQUAD UPDATE: You've done your part brilliantly!\n\n"${teamName}" vs "${opponentTeamName}" - ${timeLeft} to victory!\n\n🎖️ Your role now:\n✅ Challenge completed\n📊 Monitor team progress\n🏆 Celebrate the win\n\nStay tuned for the epic conclusion! 🌟`,
      },
    ],
    no_category_selected: [
      {
        title: '🎮 Squad Battle Ready!',
        body: `${teamName} needs you to pick your category! ${timeLeft} left vs ${opponentTeamName}!`,
        mainText: `🔥 CATEGORY SELECTION TIME: Your epic squad battle is ready!\n\n"${teamName}" vs "${opponentTeamName}" - ${timeLeft} remaining!\n\n🎯 Choose your battle domain:\n⚡ Pick your strongest category\n🧠 Show your expertise\n🏆 Dominate the competition\n\nYour squad is assembled and ready - choose wisely! ⭐`,
      },
      {
        title: '⚔️ Choose Your Battleground!',
        body: `Squad battle ${teamName} vs ${opponentTeamName} - Pick your category now!`,
        mainText: `🛡️ BATTLE PREPARATION: Your squad "${teamName}" is locked and loaded!\n\n⏰ ${timeLeft} to select your specialty against "${opponentTeamName}"\n\n🎯 Time to choose your weapon:\n📚 Pick your knowledge domain\n⚡ Claim your category\n🏆 Lead your team to victory\n\nThe arena is set - which category will you conquer? 🌟`,
      },
    ],
    waiting_for_challenge: [
      {
        title: '⏳ Squad Challenge Loading...',
        body: `${teamName} vs ${opponentTeamName} - Your challenge is being prepared! ${timeLeft} left!`,
        mainText: `🎯 CHALLENGE INCOMING: Your category is locked in!\n\n"${teamName}" vs "${opponentTeamName}" - ${timeLeft} remaining!\n\n⚡ Your epic challenge is being crafted:\n✅ Category selected\n🔄 Challenge generating\n🏆 Victory awaiting\n\nStay ready - your moment of glory approaches! 🚀`,
      },
    ],
    battle_expiring: [
      {
        title: '⏰ Squad Battle Finale!',
        body: `${teamName} vs ${opponentTeamName} battle ends in ${timeLeft}! Check the results!`,
        mainText: `🏁 FINAL COUNTDOWN: Your epic squad battle is reaching its climax!\n\n"${teamName}" vs "${opponentTeamName}" - ${timeLeft} remaining!\n\n🎯 Don't miss the finale:\n📊 Check team standings\n🏆 See who's winning\n🎉 Celebrate the victory\n\nWitness the epic conclusion! ⭐`,
      },
    ],
  }

  const messageArray =
    baseMessages[reminderReason] || baseMessages.battle_expiring

  // Select a random message for variety
  return messageArray[Math.floor(Math.random() * messageArray.length)]
}

/**
 * Send notification when a user joins a team via team code
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.userId - User who joined
 * @param {string} params.userName - User's display name
 * @param {string} params.userInGameName - User's in-game name
 * @param {string} params.teamName - Team name
 * @param {Array} params.teamMembers - Array of team member objects with user info
 * @returns {Promise<number>} Number of notifications sent
 */
const notifyTeamMemberJoined = async ({
  teamId,
  userId,
  userName,
  userInGameName,
  teamName,
  teamMembers,
}) => {
  try {
    const displayName = userInGameName || userName || 'New Member'
    let notificationsSent = 0

    // Send notifications to all existing team members except the new joiner
    for (const member of teamMembers) {
      const memberId = member.user._id || member.user
      const memberIdStr = memberId.toString()

      // Skip the user who just joined
      if (memberIdStr === userId.toString()) {
        continue
      }

      const messages = getTeamMemberJoinedMessages({ displayName, teamName })

      const notificationSent = await sendNotificationIfOffline({
        userId: memberIdStr,
        title: messages.title,
        body: messages.body,
        mainText: messages.mainText,
        importance: 'normal',
        url: '/quickclash',
      })

      if (notificationSent) {
        notificationsSent++
      }

      console.log(
        `[TEAM_MEMBER_JOINED] Notification for member ${memberIdStr} - Push: ${
          notificationSent ? 'sent' : 'skipped (user online)'
        }`,
      )
    }

    console.log(
      `[TEAM_MEMBER_JOINED] Sent ${notificationsSent} notifications for ${displayName} joining team "${teamName}"`,
    )

    return notificationsSent
  } catch (error) {
    console.error(
      `[TEAM_MEMBER_JOINED] Error sending team member joined notifications:`,
      error,
    )
    return 0
  }
}

/**
 * Send notification when a user leaves a team
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.userId - User who left
 * @param {string} params.userName - User's display name
 * @param {string} params.userInGameName - User's in-game name
 * @param {string} params.teamName - Team name
 * @param {Array} params.teamMembers - Array of remaining team member objects with user info
 * @returns {Promise<number>} Number of notifications sent
 */
const notifyTeamMemberLeft = async ({
  teamId,
  userId,
  userName,
  userInGameName,
  teamName,
  teamMembers,
}) => {
  try {
    const displayName = userInGameName || userName || 'Team Member'
    let notificationsSent = 0

    // Send notifications to all remaining team members
    for (const member of teamMembers) {
      const memberId = member.user._id || member.user
      const memberIdStr = memberId.toString()

      const messages = getTeamMemberLeftMessages({ displayName, teamName })

      const notificationSent = await sendNotificationIfOffline({
        userId: memberIdStr,
        title: messages.title,
        body: messages.body,
        mainText: messages.mainText,
        importance: 'normal',
        url: '/quickclash',
      })

      if (notificationSent) {
        notificationsSent++
      }

      console.log(
        `[TEAM_MEMBER_LEFT] Notification for member ${memberIdStr} - Push: ${
          notificationSent ? 'sent' : 'skipped (user online)'
        }`,
      )
    }

    console.log(
      `[TEAM_MEMBER_LEFT] Sent ${notificationsSent} notifications for ${displayName} leaving team "${teamName}"`,
    )

    return notificationsSent
  } catch (error) {
    console.error(
      `[TEAM_MEMBER_LEFT] Error sending team member left notifications:`,
      error,
    )
    return 0
  }
}

/**
 * Send notification when a team member is removed by leader
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.leaderId - Leader who removed the member
 * @param {string} params.removedMemberId - Member who was removed
 * @param {string} params.teamName - Team name
 * @param {string} params.removedMemberName - Removed member's display name
 * @param {string} params.removedMemberInGameName - Removed member's in-game name
 * @param {string} params.leaderName - Leader's display name
 * @param {Array} params.teamMembers - Array of remaining team member objects with user info
 * @returns {Promise<number>} Number of notifications sent
 */
const notifyTeamMemberRemoved = async ({
  teamId,
  leaderId,
  removedMemberId,
  teamName,
  removedMemberName,
  removedMemberInGameName,
  leaderName,
  teamMembers,
}) => {
  try {
    const removedDisplayName =
      removedMemberInGameName || removedMemberName || 'Team Member'
    let notificationsSent = 0

    // Notify the removed member
    try {
      const removedMemberMessages = getRemovedMemberMessages({
        teamName,
        leaderName,
      })

      const removedMemberNotified = await sendNotificationIfOffline({
        userId: removedMemberId,
        title: removedMemberMessages.title,
        body: removedMemberMessages.body,
        mainText: removedMemberMessages.mainText,
        importance: 'important',
        url: '/quickclash',
      })

      if (removedMemberNotified) {
        notificationsSent++
      }

      console.log(
        `[TEAM_MEMBER_REMOVED] Notification for removed member ${removedMemberId} - Push: ${
          removedMemberNotified ? 'sent' : 'skipped (user online)'
        }`,
      )
    } catch (error) {
      console.error(
        `[TEAM_MEMBER_REMOVED] Error notifying removed member ${removedMemberId}:`,
        error,
      )
    }

    // Notify remaining team members (excluding the leader who performed the action)
    for (const member of teamMembers) {
      const memberId = member.user._id || member.user
      const memberIdStr = memberId.toString()

      // Skip the leader who removed the member
      if (memberIdStr === leaderId.toString()) {
        continue
      }

      const messages = getTeamMemberRemovedMessages({
        removedDisplayName,
        teamName,
        leaderName,
      })

      const notificationSent = await sendNotificationIfOffline({
        userId: memberIdStr,
        title: messages.title,
        body: messages.body,
        mainText: messages.mainText,
        importance: 'normal',
        url: '/quickclash',
      })

      if (notificationSent) {
        notificationsSent++
      }

      console.log(
        `[TEAM_MEMBER_REMOVED] Notification for member ${memberIdStr} - Push: ${
          notificationSent ? 'sent' : 'skipped (user online)'
        }`,
      )
    }

    console.log(
      `[TEAM_MEMBER_REMOVED] Sent ${notificationsSent} notifications for ${removedDisplayName} being removed from team "${teamName}"`,
    )

    return notificationsSent
  } catch (error) {
    console.error(
      `[TEAM_MEMBER_REMOVED] Error sending team member removed notifications:`,
      error,
    )
    return 0
  }
}

/**
 * Send notification when team invitation is accepted
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.userId - User who accepted
 * @param {string} params.userName - User's display name
 * @param {string} params.userInGameName - User's in-game name
 * @param {string} params.teamName - Team name
 * @param {string} params.inviterName - Inviter's display name
 * @param {Array} params.teamMembers - Array of team member objects with user info
 * @returns {Promise<number>} Number of notifications sent
 */
const notifyTeamInvitationAccepted = async ({
  teamId,
  userId,
  userName,
  userInGameName,
  teamName,
  inviterName,
  teamMembers,
}) => {
  try {
    const displayName = userInGameName || userName || 'New Member'
    let notificationsSent = 0

    // Send notifications to all team members except the user who accepted
    for (const member of teamMembers) {
      const memberId = member.user._id || member.user
      const memberIdStr = memberId.toString()

      // Skip the user who just accepted
      if (memberIdStr === userId.toString()) {
        continue
      }

      const messages = getTeamInvitationAcceptedMessages({
        displayName,
        teamName,
        inviterName,
      })

      const notificationSent = await sendNotificationIfOffline({
        userId: memberIdStr,
        title: messages.title,
        body: messages.body,
        mainText: messages.mainText,
        importance: 'normal',
        url: '/quickclash',
      })

      if (notificationSent) {
        notificationsSent++
      }

      console.log(
        `[TEAM_INVITATION_ACCEPTED] Notification for member ${memberIdStr} - Push: ${
          notificationSent ? 'sent' : 'skipped (user online)'
        }`,
      )
    }

    console.log(
      `[TEAM_INVITATION_ACCEPTED] Sent ${notificationsSent} notifications for ${displayName} accepting invitation to team "${teamName}"`,
    )

    return notificationsSent
  } catch (error) {
    console.error(
      `[TEAM_INVITATION_ACCEPTED] Error sending team invitation accepted notifications:`,
      error,
    )
    return 0
  }
}

/**
 * Send notification when team invitation is rejected
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.userId - User who rejected
 * @param {string} params.userName - User's display name
 * @param {string} params.userInGameName - User's in-game name
 * @param {string} params.teamName - Team name
 * @param {string} params.inviterName - Inviter's display name
 * @param {Array} params.teamMembers - Array of team member objects with user info
 * @returns {Promise<number>} Number of notifications sent
 */
const notifyTeamInvitationRejected = async ({
  teamId,
  userId,
  userName,
  userInGameName,
  teamName,
  inviterName,
  teamMembers,
}) => {
  try {
    const displayName = userInGameName || userName || 'Player'
    let notificationsSent = 0

    // Send notifications to team members about invitation rejection
    for (const member of teamMembers) {
      const memberId = member.user._id || member.user
      const memberIdStr = memberId.toString()

      const messages = getTeamInvitationRejectedMessages({
        displayName,
        teamName,
        inviterName,
      })

      const notificationSent = await sendNotificationIfOffline({
        userId: memberIdStr,
        title: messages.title,
        body: messages.body,
        mainText: messages.mainText,
        importance: 'normal',
        url: '/quickclash',
      })

      if (notificationSent) {
        notificationsSent++
      }

      console.log(
        `[TEAM_INVITATION_REJECTED] Notification for member ${memberIdStr} - Push: ${
          notificationSent ? 'sent' : 'skipped (user online)'
        }`,
      )
    }

    console.log(
      `[TEAM_INVITATION_REJECTED] Sent ${notificationsSent} notifications for ${displayName} rejecting invitation to team "${teamName}"`,
    )

    return notificationsSent
  } catch (error) {
    console.error(
      `[TEAM_INVITATION_REJECTED] Error sending team invitation rejected notifications:`,
      error,
    )
    return 0
  }
}

/**
 * Send notification when team invitation is sent
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.inviterId - Inviter user ID
 * @param {string} params.inviteeId - Invitee user ID
 * @param {string} params.teamName - Team name
 * @param {string} params.inviterName - Inviter's display name
 * @returns {Promise<boolean>} True if notification was sent
 */
const notifyTeamInvitationSent = async ({
  teamId,
  inviterId,
  inviteeId,
  teamName,
  inviterName,
}) => {
  try {
    const messages = getTeamInvitationSentMessages({ teamName, inviterName })

    const notificationSent = await sendNotificationIfOffline({
      userId: inviteeId,
      title: messages.title,
      body: messages.body,
      mainText: messages.mainText,
      importance: 'important',
      url: '/quickclash',
    })

    console.log(
      `[TEAM_INVITATION_SENT] Invitation notification for ${inviteeId} to join "${teamName}" - Push: ${
        notificationSent ? 'sent' : 'skipped (user online)'
      }`,
    )

    return notificationSent
  } catch (error) {
    console.error(
      `[TEAM_INVITATION_SENT] Error sending team invitation notification:`,
      error,
    )
    return false
  }
}

// ===== MESSAGE GENERATOR FUNCTIONS =====

/**
 * Generate messages for team member joined notifications
 */
const getTeamMemberJoinedMessages = ({ displayName, teamName }) => {
  const messages = [
    {
      title: '🎉 New Squad Member!',
      body: `${displayName} joined "${teamName}"! Welcome them to the squad!`,
      mainText: `🚀 SQUAD EXPANSION: ${displayName} has joined your team "${teamName}"!\n\n🎯 Your squad is growing stronger:\n👥 New teammate ready for battle\n⚡ Fresh skills added to the roster\n🏆 More power for upcoming clashes\n\nWelcome your new squadmate! 💪`,
    },
    {
      title: '⚡ Squad Reinforcement!',
      body: `${displayName} is now part of "${teamName}"! Squad power increased!`,
      mainText: `🔥 REINFORCEMENTS ARRIVED: Your team "${teamName}" just got stronger!\n\n🌟 ${displayName} has joined the squad:\n🎯 Ready for epic battles\n⚔️ Bringing fresh expertise\n🏆 Boosting team potential\n\nTime to dominate together! 🚀`,
    },
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Generate messages for team member left notifications
 */
const getTeamMemberLeftMessages = ({ displayName, teamName }) => {
  const messages = [
    {
      title: '👋 Squad Member Departed',
      body: `${displayName} left "${teamName}". Regroup and stay strong!`,
      mainText: `⚡ SQUAD UPDATE: ${displayName} has left your team "${teamName}"\n\n🎯 Moving forward together:\n💪 Your remaining squad is still strong\n🚀 Ready for new recruitment\n🏆 Unity makes you unstoppable\n\nKeep building your legendary team! 🌟`,
    },
    {
      title: '🔄 Squad Transition',
      body: `"${teamName}" roster update: ${displayName} moved on. Onward!`,
      mainText: `🛡️ ROSTER CHANGE: Team "${teamName}" continues its journey!\n\n⭐ After ${displayName}'s departure:\n🎯 Core squad remains united\n⚡ Open spot for new talent\n🏆 Stronger bonds within the team\n\nYour squad's destiny awaits! 💫`,
    },
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Generate messages for removed member notifications
 */
const getRemovedMemberMessages = ({ teamName, leaderName }) => {
  return {
    title: '⚠️ Team Status Update',
    body: `You've been removed from "${teamName}" by ${leaderName}`,
    mainText: `🎯 TEAM UPDATE: You are no longer a member of "${teamName}"\n\nTeam leader ${leaderName} has made this decision. Don't worry - there are many other squads looking for talented players like you!\n\n🚀 Next steps:\n⚡ Find a new squad that fits your style\n🏆 Show your skills in solo battles\n🌟 Create your own legendary team\n\nYour Quick Clash journey continues! 💪`,
  }
}

/**
 * Generate messages for team member removed notifications (for other members)
 */
const getTeamMemberRemovedMessages = ({
  removedDisplayName,
  teamName,
  leaderName,
}) => {
  const messages = [
    {
      title: '⚠️ Squad Roster Change',
      body: `${leaderName} removed ${removedDisplayName} from "${teamName}"`,
      mainText: `🎯 ROSTER UPDATE: Team "${teamName}" has made a change\n\nTeam leader ${leaderName} has removed ${removedDisplayName} from the squad.\n\n⚡ Moving forward:\n🛡️ Core team remains strong\n🚀 Ready for new recruitment\n🏆 Unity and focus maintained\n\nYour squad continues its journey! 💪`,
    },
    {
      title: '🔄 Team Management',
      body: `"${teamName}" update: ${removedDisplayName} is no longer with the squad`,
      mainText: `⭐ TEAM DECISION: "${teamName}" leadership has spoken\n\n${leaderName} has made the decision to remove ${removedDisplayName} from the team.\n\n🎯 Squad status:\n⚡ Maintaining team standards\n🛡️ Focused on team goals\n🏆 Ready for epic battles\n\nStronger together! 🚀`,
    },
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Generate messages for team invitation accepted notifications
 */
const getTeamInvitationAcceptedMessages = ({
  displayName,
  teamName,
  inviterName,
}) => {
  const messages = [
    {
      title: '🎉 Invitation Success!',
      body: `${displayName} accepted ${inviterName}'s invitation to "${teamName}"!`,
      mainText: `🚀 INVITATION ACCEPTED: Great news for team "${teamName}"!\n\n${displayName} has accepted the invitation from ${inviterName} and is now part of your squad!\n\n🎯 Team celebration:\n⚡ New talent acquired\n🏆 Squad power increased\n🌟 Ready for epic battles\n\nWelcome your new teammate! 💪`,
    },
    {
      title: '⚡ Squad Recruitment Win!',
      body: `${displayName} is now part of "${teamName}"! ${inviterName}'s invite worked!`,
      mainText: `🔥 RECRUITMENT SUCCESS: "${teamName}" grows stronger!\n\nThanks to ${inviterName}'s invitation, ${displayName} has joined your legendary squad!\n\n🎖️ Achievement unlocked:\n🎯 Successful team building\n⚔️ Enhanced squad capabilities\n🏆 Ready to dominate\n\nTime to conquer together! 🌟`,
    },
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Generate messages for team invitation rejected notifications
 */
const getTeamInvitationRejectedMessages = ({
  displayName,
  teamName,
  inviterName,
}) => {
  const messages = [
    {
      title: '❌ Invitation Declined',
      body: `${displayName} declined ${inviterName}'s invitation to "${teamName}"`,
      mainText: `💔 INVITATION DECLINED: Unfortunately, ${displayName} has decided not to join team "${teamName}"\n\n${inviterName}'s invitation was respectfully declined.\n\n🎯 Keep building your squad:\n🚀 There are many talented players out there\n⚡ Your team will find the right fit\n🏆 Quality over quantity always wins\n\nThe perfect teammate is waiting! 🌟`,
    },
    {
      title: '🔄 Recruitment Update',
      body: `"${teamName}" recruitment: ${displayName} chose a different path`,
      mainText: `⭐ RECRUITMENT UPDATE: Team "${teamName}" continues its search!\n\n${displayName} has decided not to accept the invitation from ${inviterName}.\n\n🎯 Moving forward:\n🛡️ Your squad remains strong\n🚀 New opportunities ahead\n🏆 The right player will come\n\nKeep growing your legendary team! 💪`,
    },
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Generate messages for team invitation sent notifications
 */
const getTeamInvitationSentMessages = ({ teamName, inviterName }) => {
  const messages = [
    {
      title: '🎯 Squad Invitation!',
      body: `${inviterName} invited you to join "${teamName}"! Epic battles await!`,
      mainText: `⚡ SQUAD INVITATION: You've been chosen!\n\n${inviterName} wants you to join the legendary team "${teamName}"!\n\n🎯 What awaits you:\n🏆 Epic 4v4 team battles\n⚔️ Strategic category selection\n🚀 Climb the trophy leaderboards\n🌟 Forge unbreakable squad bonds\n\nWill you answer the call to greatness? 💪`,
    },
    {
      title: '🔥 Team Recruitment!',
      body: `Join "${teamName}"! ${inviterName} thinks you've got what it takes!`,
      mainText: `👑 CHOSEN WARRIOR: Your skills have been recognized!\n\n${inviterName} believes you're perfect for team "${teamName}" and wants you to join their squad!\n\n⭐ Your squad destiny:\n🎯 Prove your knowledge supremacy\n⚡ Dominate in team competitions\n🏆 Share victory with your teammates\n🚀 Build an unstoppable legacy\n\nAccept and become a legend! 🌟`,
    },
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

module.exports = {
  notifyChallengeCreated,
  notifyChallengeAccepted,
  notifyChallengeRejected,
  notifyChallengeCompleted,
  notifyChallengerAboutCreation,
  notifyMatchmakingSuccess,
  sendChallengeExpiryReminder,
  notifyTeamMatchmakingStarted,
  sendTeamBattleExpiryReminder,
  notifyTeamBattleCompleted,
  notifyTeamMemberJoined,
  notifyTeamMemberLeft,
  notifyTeamMemberRemoved,
  notifyTeamInvitationAccepted,
  notifyTeamInvitationRejected,
  notifyTeamInvitationSent,
  sendNotificationIfOffline, // Export for potential reuse
}
