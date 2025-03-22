// services/quickClashServices/quickClashNotificationService.js
const { sendNotification } = require('../notificationService')
const ApplicationUpdates = require('../../model/applicationUpdatesSchema')
const User = require('../../model/userSchema')
const globalEmitter = require('../../eventEmitter')
const QuickClashOutcomeTracker = require('../../utils/quickClashOutcomeTracker')

/**
 * Send notification when a new challenge is created
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - The challenge document with basic info
 * @param {Object} params.challenger - The user who created the challenge
 * @param {Object} params.opponent - The opponent user
 */
const notifyChallengeCreated = async ({ challenge, challenger, opponent }) => {
  try {
    // Create application update for the opponent
    const appUpdate = new ApplicationUpdates({
      title: 'New Quick Clash Challenge',
      mainText: `${
        challenger.inGameName || challenger.name
      } has challenged you to a knowledge battle in the ${
        challenge.category
      } category!`,
      userId: opponent._id,
      type: 'applicationUpdate',
    })

    await appUpdate.save()

    // Send push notification to opponent
    await sendNotification({
      title: 'New Quick Clash Challenge!',
      body: `${
        challenger.inGameName || challenger.name
      } has challenged you to a knowledge battle!`,
      url: '/quickclash',
      userId: opponent._id,
      messageId: appUpdate._id.toString(),
    })

    // Emit event for socket notification
    globalEmitter.emit('quickClash:challengeCreated', {
      challenge,
      challenger,
      opponent,
    })
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
      // Create application update for successful creation
      const appUpdate = new ApplicationUpdates({
        title: 'Challenge Created Successfully',
        mainText: `Your Quick Clash challenge to ${
          opponent.inGameName || opponent.name
        } in the ${challenge.category} category has been sent!`,
        userId: challenger._id,
        type: 'applicationUpdate',
      })

      await appUpdate.save()

      // Send push notification
      await sendNotification({
        title: 'Challenge Created!',
        body: `Your Quick Clash challenge to ${
          opponent.inGameName || opponent.name
        } has been sent.`,
        url: '/quickclash',
        userId: challenger._id,
        messageId: appUpdate._id.toString(),
      })

      // Emit event for socket notification to challenger
      globalEmitter.emit('quickClash:challengerNotified', {
        challenge,
        challenger,
        opponent,
        success: true,
      })
    } else {
      // Create application update for failed creation
      const appUpdate = new ApplicationUpdates({
        title: 'Challenge Creation Failed',
        mainText: `We couldn't create your Quick Clash challenge to ${
          opponent.inGameName || opponent.name
        }. ${errorMessage || 'Please try again later.'}`,
        userId: challenger._id,
        type: 'applicationUpdate',
      })

      await appUpdate.save()

      // Send push notification
      await sendNotification({
        title: 'Challenge Creation Failed',
        body: "We couldn't create your Quick Clash challenge. Please try again.",
        url: '/quickclash',
        userId: challenger._id,
        messageId: appUpdate._id.toString(),
      })

      // Emit event for socket notification about failure to challenger
      globalEmitter.emit('quickClash:challengerNotified', {
        challenge,
        challenger,
        opponent,
        success: false,
        errorMessage: errorMessage || 'Failed to create challenge',
      })
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
    // Create application update for the challenger
    const appUpdate = new ApplicationUpdates({
      title: 'Challenge Accepted!',
      mainText: `${
        opponent.inGameName || opponent.name
      } has accepted your Quick Clash challenge in the ${
        challenge.category
      } category!`,
      userId: challenger._id,
      type: 'applicationUpdate',
    })

    await appUpdate.save()

    // Send push notification to challenger
    await sendNotification({
      title: 'Challenge Accepted!',
      body: `${
        opponent.inGameName || opponent.name
      } has accepted your Quick Clash challenge!`,
      url: '/quickclash',
      userId: challenger._id,
      messageId: appUpdate._id.toString(),
    })

    // Emit event for socket notification
    globalEmitter.emit('quickClash:challengeAccepted', {
      challengeId: challenge._id,
      category: challenge.category,
      challenger,
      opponent,
    })
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
    // Create application update for the challenger
    const appUpdate = new ApplicationUpdates({
      title: 'Challenge Rejected',
      mainText: `${
        opponent.inGameName || opponent.name
      } has declined your Quick Clash challenge in the ${
        challenge.category
      } category.`,
      userId: challenger._id,
      type: 'applicationUpdate',
    })

    await appUpdate.save()

    // Send push notification to challenger
    await sendNotification({
      title: 'Challenge Rejected',
      body: `${
        opponent.inGameName || opponent.name
      } has declined your Quick Clash challenge.`,
      url: '/quickclash',
      userId: challenger._id,
      messageId: appUpdate._id.toString(),
    })

    // Emit event for socket notification
    globalEmitter.emit('quickClash:challengeRejected', {
      challengeId: challenge._id,
      category: challenge.category,
      challenger,
      opponent,
    })
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

      const challengerWon = challenge.challengerScore > challenge.opponentScore
      const isTie = challenge.challengerScore === challenge.opponentScore

      // Create application update for challenger
      const challengerUpdate = new ApplicationUpdates({
        title: challengerWon
          ? 'Victory in Quick Clash!'
          : isTie
          ? 'Quick Clash Ended in a Tie!'
          : 'Quick Clash Defeat',
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
        userId: challenger._id,
        type: 'applicationUpdate',
      })

      // Create application update for opponent
      const opponentUpdate = new ApplicationUpdates({
        title: !challengerWon
          ? 'Victory in Quick Clash!'
          : isTie
          ? 'Quick Clash Ended in a Tie!'
          : 'Quick Clash Defeat',
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
        userId: opponent._id,
        type: 'applicationUpdate',
      })

      // Save both updates
      await Promise.all([challengerUpdate.save(), opponentUpdate.save()])

      // Send push notifications
      await Promise.all([
        sendNotification({
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
          url: '/quickclash',
          userId: challenger._id,
          messageId: challengerUpdate._id.toString(),
        }),
        sendNotification({
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
          url: '/quickclash',
          userId: opponent._id,
          messageId: opponentUpdate._id.toString(),
        }),
      ])

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
        trackWinnerOutcomeResult,
        completedByUserId,
      })
    } else {
      // Only one player has completed - notify the other player
      const isChallenger =
        completedByUserId.toString() === challenge.challenger._id.toString()
      const otherPlayerId = isChallenger
        ? challenge.opponent._id
        : challenge.challenger._id

      // Get user information for both players
      const [completedPlayer, otherPlayer] = await Promise.all([
        isChallenger
          ? User.findById(challenge.challenger._id).select('name inGameName')
          : User.findById(challenge.opponent._id).select('name inGameName'),
        isChallenger
          ? User.findById(challenge.opponent._id).select('name inGameName')
          : User.findById(challenge.challenger._id).select('name inGameName'),
      ])

      // Create application update
      const appUpdate = new ApplicationUpdates({
        title: 'Your Turn in Quick Clash!',
        mainText: `${
          completedPlayer.inGameName || completedPlayer.name
        } has completed their part of the Quick Clash challenge in the ${
          challenge.category
        } category. It's your turn now!`,
        userId: otherPlayerId,
        type: 'applicationUpdate',
      })

      await appUpdate.save()

      // Send push notification
      await sendNotification({
        title: 'Your Turn in Quick Clash!',
        body: `${
          completedPlayer.inGameName || completedPlayer.name
        } has completed their challenge. Your turn now!`,
        url: `/quickclash`,
        userId: otherPlayerId,
        messageId: appUpdate._id.toString(),
      })

      // Emit event for socket notification
      globalEmitter.emit('quickClash:challengeCompleted', {
        challenge,
        completedByUserId,
      })
    }
  } catch (error) {
    console.error('Error sending challenge completion notification:', error)
  }
}

/**
 * Send notification when an analysis is ready
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - The challenge document
 * @param {boolean} params.forOpponent - Whether to notify the opponent (true) or challenger (false)
 */
const notifyAnalysisReady = async ({ challenge, forOpponent = false }) => {
  try {
    const userId = forOpponent ? challenge.opponent : challenge.challenger
    const user = await User.findById(userId)

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    // Create application update
    const appUpdate = new ApplicationUpdates({
      title: 'AI Analysis Ready',
      mainText: `The AI analysis for your Quick Clash in the ${challenge.category} category is now ready to view!`,
      userId: userId,
      type: 'applicationUpdate',
    })

    await appUpdate.save()

    // Send push notification
    await sendNotification({
      title: 'AI Analysis Ready',
      body: `Your Quick Clash performance analysis is ready to view!`,
      url: '/quickclash',
      userId: userId,
      messageId: appUpdate._id.toString(),
    })

    // Emit event for socket notification
    globalEmitter.emit('quickClash:analysisReady', {
      challengeId: challenge._id,
      userId,
    })
  } catch (error) {
    console.error('Error sending analysis ready notification:', error)
  }
}

module.exports = {
  notifyChallengeCreated,
  notifyChallengeAccepted,
  notifyChallengeRejected,
  notifyChallengeCompleted,
  notifyAnalysisReady,
  notifyChallengerAboutCreation,
}
