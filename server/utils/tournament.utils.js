const BADGE_CONFIG = require('../data/BADGE_CONFIG')
const { getAllCategories, shouldHaveBadgeText } = require('../data/categories')
const {
  TournamentRegistration,
  QuizSession,
} = require('../model/tournamentRegistrationSchema')
const User = require('../model/userSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const i18n = require('i18next')
const { makeRetryable, defaultIsRetryableError } = require('./retryUtils')
const moment = require('moment-timezone')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')
const {
  tournamentWinnerNotificationTemplate,
} = require('../data/inboxNotificationsTemplates')
const {
  createCategoryAbilities,
} = require('../services/abilityServices/tournamentAbilityService')
const mongoose = require('mongoose')

const getUserRegistrationDetails = async (userId, tournamentId, session) => {
  try {
    if (
      !userId ||
      !tournamentId ||
      userId === 'undefined' ||
      tournamentId === 'undefined'
    ) {
      return
    }
    const registration = await TournamentRegistration.findOne({
      user: userId,
      tournament: tournamentId,
    })
      .select('selectedCategories completedCategories totalScore')
      .session(session)

    if (registration) {
      return {
        isRegistered: true,
        selectedCategories: registration.selectedCategories,
        completedCategories: registration.completedCategories,
        totalScore: registration.totalScore,
      }
    }

    return { isRegistered: false }
  } catch (error) {
    console.log(error)
    return
  }
}

async function getCategoryLeaders({ tournamentId }) {
  const categories = getAllCategories()
  const categoryLeaders = {}

  for (const category of categories) {
    categoryLeaders[category] = await getTopLeadersForCategory({
      tournamentId,
      category,
    })
  }

  return categoryLeaders
}

/**
 * Get top 3 leaders for a specific category in a tournament
 * @param {Object} params - Function parameters
 * @param {string} params.tournamentId - Tournament ID
 * @param {string} params.category - Category name
 * @returns {Promise<Array>} Array of top 3 leaders with their scores
 */
const getTopLeadersForCategory = makeRetryable(
  async ({ tournamentId, category }) => {
    const pipeline = [
      {
        $match: {
          tournament: tournamentId,
          category: category,
          completed: true,
        },
      },
      {
        $sort: { RQM_score: -1 },
      },
      {
        $group: {
          _id: '$user',
          bestScore: { $first: '$RQM_score' },
          session: { $first: '$$ROOT' },
        },
      },
      {
        $sort: { bestScore: -1 },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: 'Users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          inGameName: '$userDetails.inGameName',
          score: '$bestScore',
          userId: '$_id',
        },
      },
    ]

    return await QuizSession.aggregate(pipeline)
  },
  {
    operationName: 'GetTopLeadersForCategory',
    maxRetries: 3,
    onRetry: (error, attempt) => {
      console.warn(
        `Retrying getTopLeadersForCategory attempt ${attempt}. Error: ${error.message}`,
      )
    },
    isRetryable: error => {
      // Add custom logic for retryable errors if needed
      return error.name === 'MongoError' || error.name === 'MongoNetworkError'
    },
  },
)

/**
 * Base function for determining badges with session management
 */
const determineBadgesWithSession = async ({
  rank,
  participantCount,
  selectedCategories,
  categoryLeaders,
  userId,
  hasParticipated,
}) => {
  const session = await mongoose.startSession()

  try {
    // Capture and return the result of the transaction
    const result = await session.withTransaction(async () => {
      const top5Threshold = Math.ceil(participantCount * 0.05)
      const top10Threshold = Math.ceil(participantCount * 0.1)
      const top25Threshold = Math.ceil(participantCount * 0.25)

      // Determine overall rank badge
      let overallBadge = null
      if (rank === 1) overallBadge = BADGE_CONFIG.RANK_1
      else if (rank === 2) overallBadge = BADGE_CONFIG.RANK_2
      else if (rank === 3) overallBadge = BADGE_CONFIG.RANK_3
      else if (rank <= top5Threshold) overallBadge = BADGE_CONFIG.TOP_5
      else if (rank <= top10Threshold) overallBadge = BADGE_CONFIG.TOP_10
      else if (rank <= top25Threshold) overallBadge = BADGE_CONFIG.TOP_25
      else if (hasParticipated) overallBadge = BADGE_CONFIG.QUIZ_WARRIOR

      // Process category badges with retry mechanism
      const categoryBadgePromises = selectedCategories.map(category =>
        processCategoryBadge({
          category,
          categoryLeaders,
          userId,
          session,
        }),
      )

      // Wait for all category badge processing to complete
      const categoryBadges = (await Promise.all(categoryBadgePromises)).filter(
        Boolean,
      )

      // Return the result object
      return { overallBadge, categoryBadges }
    })

    // Return the transaction result
    return result
  } catch (error) {
    // Add context to the error for retry mechanism
    const enhancedError = new Error(
      'Badge determination failed: ' + error.message,
    )
    enhancedError.originalError = error
    throw enhancedError
  } finally {
    await session.endSession()
  }
}
/**
 * Retryable version of the badge determination process with session management
 */
const determineBadges = makeRetryable(determineBadgesWithSession, {
  operationName: 'DetermineBadges',
  maxRetries: 3,
  onRetry: (error, attempt) => {
    console.warn(
      `Retrying badge determination, attempt ${attempt}. Error: ${error.message}`,
    )
  },
  isRetryable: error => {
    // Check if the error has transaction-related labels
    if (error.originalError?.errorLabels?.includes('TransientTransactionError'))
      return true
    if (error.originalError?.errorLabels?.includes('RetryableWriteError'))
      return true

    // Check custom error messages
    if (error.message.includes('Badge determination failed')) return true
    if (error.message.includes('Category badge processing failed')) return true

    // Fall back to default error checker
    return defaultIsRetryableError(error)
  },
})

/**
 * Process category badge with retry mechanism
 */
const processCategoryBadgeBase = async ({
  category,
  categoryLeaders,
  userId,
  session,
}) => {
  if (!session) {
    throw new Error('Session is required for category badge processing')
  }

  const categoryRank = categoryLeaders[category]?.findIndex(
    leader => leader.userId.toString() === userId.toString(),
  )

  // Only assign badge if user is in top 3
  if (categoryRank > 2 || categoryRank === -1) return null

  // Create badge with optional text based on category
  const badge = (() => {
    if (categoryRank === 0) return { ...BADGE_CONFIG.ACE }
    if (categoryRank === 1) return { ...BADGE_CONFIG.PRO }
    if (categoryRank === 2) return { ...BADGE_CONFIG.CHAMP }
  })()

  // Only add category text for regular categories
  if (badge && shouldHaveBadgeText(category)) {
    badge.text = category
    await createCategoryAbilities({
      userId,
      category: badge.text,
      badgeName: badge.name,
      session,
    })
  }

  return badge
}

const processCategoryBadge = makeRetryable(processCategoryBadgeBase, {
  operationName: 'ProcessCategoryBadge',
  maxRetries: 3,
  onRetry: (error, attempt) => {
    console.warn(
      `Retrying category badge processing, attempt ${attempt}. Error: ${error.message}`,
    )
  },
  isRetryable: error => {
    if (error.message.includes('Category processing failed')) return true
    if (error.message.includes('Transaction aborted')) return true
    return defaultIsRetryableError(error)
  },
})
/**
 * Determines which badge should be displayed for a user
 */
const determineDisplayedBadge = ({ overallBadge, categoryBadges }) => {
  if (
    overallBadge &&
    ['RANK_1', 'RANK_2', 'RANK_3'].includes(overallBadge.name)
  ) {
    return overallBadge
  }

  const aceBadge = categoryBadges?.find(badge => badge.name === 'ACE')
  const proBadge = categoryBadges?.find(badge => badge.name === 'PRO')
  const champBadge = categoryBadges?.find(badge => badge.name === 'CHAMP')

  return aceBadge || proBadge || champBadge || overallBadge
}

/**
 * Calculate badge expiry time (Friday 10:59 PM IST of the ongoing week)
 */
const calculateBadgeClaimDeadline = () => {
  const now = moment().tz('Asia/Kolkata')
  const friday = now.clone().day(5) // Get this week's Friday

  // If today is Saturday or later, get next Friday
  if (now.day() > 5) {
    friday.add(1, 'week')
  }

  // Set time to 22:59
  return friday
    .set({
      hour: 22,
      minute: 59,
      second: 0,
      millisecond: 0,
    })
    .toDate()
}

/**
 * Update user's badges and displayed badge
 */
const updateUserBadges = makeRetryable(
  async ({
    user,
    badges,
    displayedBadge,
    tournamentId,
    rank,
    tournamentNumber,
    participantCount,
  }) => {
    // Calculate claim deadline
    const claimDeadline = calculateBadgeClaimDeadline()

    // Apply IQ boost first if user is in top 3
    if (rank <= 3) {
      try {
        const {
          calculateTournamentRankIQBoost,
        } = require('../services/iqCalculationService')
        const iqBoostResult = await calculateTournamentRankIQBoost(
          user,
          rank,
          tournamentId,
          tournamentNumber,
        )

        if (iqBoostResult) {
          const iqBoostTemplate = tournamentWinnerNotificationTemplate({
            tournamentNumber,
            prevIQ: iqBoostResult.prevIQScore,
            newIQ: iqBoostResult.newIQScore,
            boost: iqBoostResult.boost,
          })
          // Add notification for IQ boost
          const notification = new ApplicationUpdates({
            userId: user._id,
            title: `Tournament Champion IQ Boost!`,
            mainText: iqBoostTemplate,
            read: false,
          })
          await notification.save()
        }
      } catch (error) {
        console.error(`Error applying IQ boost for rank ${rank}:`, error)
      }
    }
    // Update displayed badge if available
    if (displayedBadge && displayedBadge.name) {
      user.displayedBadge = {
        tournamentNumber,
        rank,
        participantCnt: participantCount,
        badgeName: displayedBadge.name,
        text: displayedBadge.text,
      }
    }

    // Add new badges with claim deadline
    if (badges && badges.length > 0) {
      user.badges = [
        ...user.badges,
        ...badges.map(badge => ({
          rank,
          tournamentNumber,
          badgeName: badge.name,
          text: badge.text,
          participantCnt: participantCount,
          claimed: false,
          canBeClaimedUntil: claimDeadline,
        })),
      ]
    }

    await user.save()
  },
  {
    operationName: 'UpdateUserBadges',
    maxRetries: 3,
  },
)

/**
 * Gets tournament leaderboard data with user details
 */
const getTournamentLeaderboard = makeRetryable(
  async ({ tournamentId }) => {
    const leaderboardData = await TournamentRegistration.aggregate([
      { $match: { tournament: tournamentId } },
      {
        $lookup: {
          from: 'Users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          user: '$user',
          inGameName: '$userDetails.inGameName',
          totalScore: 1,
          selectedCategories: 1,
        },
      },
      { $sort: { totalScore: -1 } },
      {
        $group: {
          _id: null,
          entries: { $push: '$$ROOT' },
          participantCount: { $sum: 1 },
        },
      },
    ])

    return leaderboardData[0] || { entries: [], participantCount: 0 }
  },
  {
    operationName: 'GetTournamentLeaderboard',
    maxRetries: 3,
  },
)

/**
 * Checks if a user has participated in tournament quizzes
 */
const hasParticipatedInTournament = makeRetryable(
  async ({ userId, tournamentId }) => {
    return await QuizSession.exists({
      user: userId,
      tournament: tournamentId,
      completed: true,
    })
  },
  {
    operationName: 'CheckTournamentParticipation',
    maxRetries: 3,
  },
)

/**
 * Updates user's tournament performance record
 */
const updateUserPerformance = makeRetryable(
  async ({
    user,
    tournamentId,
    score,
    rank,
    endDate,
    tournamentNumber,
    participantCount,
  }) => {
    user.tournamentPerformance.push({
      tournament: tournamentId,
      score,
      rank,
      endDate,
      tournamentNumber,
      participantCnt: participantCount,
    })
    await user.save()
  },
  {
    operationName: 'UpdateUserPerformance',
    maxRetries: 3,
  },
)

/**
 * Main function to update tournament performance and badges for all participants
 */
const updateTournamentPerformanceAndBadges = async tournament => {
  try {
    // Get leaderboard data
    const { entries, participantCount } = await getTournamentLeaderboard({
      tournamentId: tournament._id,
    })

    if (!entries.length) {
      console.log('No entries found for tournament')
      return
    }

    // Get category leaders
    const categoryLeaders = await getCategoryLeaders({
      tournamentId: tournament._id,
    })

    // Process each participant
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const rank = i + 1

      try {
        // Check participation
        const hasParticipated = await hasParticipatedInTournament({
          userId: entry.user,
          tournamentId: tournament._id,
        })

        // Determine badges
        const resultingBadges = await determineBadges({
          rank,
          participantCount,
          selectedCategories: entry.selectedCategories,
          categoryLeaders,
          userId: entry.user,
          hasParticipated,
        })

        const overallBadge = resultingBadges?.overallBadge
        const categoryBadges = resultingBadges?.categoryBadges
        // Determine displayed badge
        const displayedBadge = determineDisplayedBadge({
          overallBadge,
          categoryBadges,
        })

        // Get user
        const user = await User.findOne({ _id: entry.user })
        if (!user) continue

        // Update user's badges
        await updateUserBadges({
          user,
          badges: overallBadge
            ? [overallBadge, ...categoryBadges]
            : categoryBadges,
          displayedBadge,
          rank,
          tournamentNumber: tournament.tournamentNumber,
          tournamentId: tournament._id,
          participantCount,
        })

        // // Update user's tournament performance
        await updateUserPerformance({
          user,
          tournamentId: tournament._id,
          score: entry.totalScore,
          rank,
          endDate: tournament.endDate,
          tournamentNumber: tournament.tournamentNumber,
          participantCount,
        })
      } catch (error) {
        console.error(`Error processing user ${entry.user}:`, error)
        // Continue with next user even if one fails
        continue
      }
    }

    console.log('Tournament performance and badges updated successfully')
  } catch (error) {
    console.error('Error updating tournament performance and badges:', error)
    throw error
  }
}

const checkTournamentEligibility = async (
  user,
  RQM_score,
  lastQuizAttempt,
  session,
) => {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const last30Min = new Date()
  last30Min.setMinutes(last30Min.getMinutes() - 30)

  const last30MinQuizAttempts = await QuizAttempt.countDocuments({
    user: user._id,
    createdAt: { $gte: last30Min },
  }).session(session)

  const todaysQuizAttempts = await QuizAttempt.countDocuments({
    user: user._id,
    createdAt: { $gte: today },
    RQM_score: { $gt: 42 },
  }).session(session)

  if (
    last30MinQuizAttempts === 3 ||
    todaysQuizAttempts === 2 ||
    user.streak >= 2
  ) {
    user.eligibleForTournament = true
  }

  const localizedI18n = i18n.cloneInstance()
  await localizedI18n.changeLanguage(user.userLanguage)
  const t = (key, options) => localizedI18n.t(key, { ns: 'quiz', ...options })

  let messageForTournamentEligibility = ''
  if (!user.eligibleForTournament) {
    if (RQM_score > 42 && todaysQuizAttempts < 2) {
      messageForTournamentEligibility = t(
        'Do one more quiz with RQM score > 42 to be eligible for tournament',
      )
    } else if (user.todaysQuizCnt >= 4) {
      messageForTournamentEligibility = t(
        'You have already attempted 4 quizzes today. Complete 2 more quizzes to be eligible for tournament',
      )
    } else if (last30MinQuizAttempts < 3) {
      if (last30MinQuizAttempts === 1) {
        messageForTournamentEligibility = t(
          'Do 2 more quizzes under 30 minutes to be eligible for tournament',
        )
      } else {
        const timeLeft =
          30 -
          Math.floor(
            (new Date().getTime() - lastQuizAttempt.createdAt.getTime()) /
              60000,
          )
        messageForTournamentEligibility = t(
          'Do 1 more quiz under 30 minutes to be eligible for tournament. Time left: {{min}} minutes',
          { min: timeLeft },
        )
      }
    } else {
      messageForTournamentEligibility = t(
        'You are not eligible for tournament. Play more quizzes to be eligible',
      )
    }
  }
  await user.save({ session })
  return {
    messageForTournamentEligibility,
    userEligibleForTournament: user.eligibleForTournament,
  }
}

/**
 * Process category privileges based on valid tournament badges
 * @param {Array} badges - User's badges
 * @returns {Object} Category privileges map
 */
const processBadgePrivileges = badges => {
  const now = moment().tz('Asia/Kolkata')
  const categoryPrivileges = {}

  // Process only unclaimed and valid badges
  const validBadges =
    badges?.filter(
      badge =>
        badge.canBeClaimedUntil &&
        moment(badge.canBeClaimedUntil).isAfter(now) &&
        ['ACE', 'PRO', 'CHAMP'].includes(badge.badgeName),
    ) || []

  // Map badge types to privileges
  const privilegeMap = {
    ACE: ['rqmBoost', 'radar'],
    PRO: ['rqmBoost'],
    CHAMP: ['radar'],
  }

  // Process each valid badge
  validBadges.forEach(badge => {
    const category = badge.text
    const privileges = privilegeMap[badge.badgeName]

    if (!categoryPrivileges[category]) {
      categoryPrivileges[category] = {
        rqmBoost: false,
        radar: false,
      }
    }

    // Enable privileges based on badge type
    privileges.forEach(privilege => {
      categoryPrivileges[category][privilege] = true
    })
  })

  return categoryPrivileges
}

module.exports = {
  getUserRegistrationDetails,
  updateTournamentPerformanceAndBadges,
  getTopLeadersForCategory,
  checkTournamentEligibility,
  processBadgePrivileges,
  calculateBadgeClaimDeadline,
}
