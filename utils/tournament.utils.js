const BADGE_CONFIG = require('../data/BADGE_CONFIG')
const { getCategories } = require('../data/categories')
const {
  TournamentRegistration,
  QuizSession,
} = require('../model/tournamentRegistrationSchema')
const User = require('../model/userSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const i18n = require('i18next')

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

async function getCategoryLeaders(tournamentId) {
  const categories = getCategories()
  const categoryLeaders = {}

  for (const category of categories) {
    categoryLeaders[category] = await getTopLeadersForCategory(
      tournamentId,
      category,
    )
  }

  return categoryLeaders
}

async function getTopLeadersForCategory(tournamentId, category) {
  return await QuizSession.aggregate([
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
  ])
}

async function updateTournamentPerformanceAndBadges(tournament) {
  try {
    const leaderboardData = await TournamentRegistration.aggregate([
      { $match: { tournament: tournament._id } },
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

    if (leaderboardData.length === 0) return

    const { entries, participantCount } = leaderboardData[0]

    // Calculate percentile thresholds
    const top5Threshold = Math.ceil(participantCount * 0.05)
    const top10Threshold = Math.ceil(participantCount * 0.1)
    const top25Threshold = Math.ceil(participantCount * 0.25)

    // Get category leaders
    const categoryLeaders = await getCategoryLeaders(tournament._id)

    // Update each user's tournament performance and badges
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const rank = i + 1

      let overallBadge = null
      let categoryBadges = []

      // Determine overall rank badge based on priority
      if (rank === 1) overallBadge = BADGE_CONFIG.RANK_1
      else if (rank === 2) overallBadge = BADGE_CONFIG.RANK_2
      else if (rank === 3) overallBadge = BADGE_CONFIG.RANK_3
      else if (rank <= top5Threshold) overallBadge = BADGE_CONFIG.TOP_5
      else if (rank <= top10Threshold) overallBadge = BADGE_CONFIG.TOP_10
      else if (rank <= top25Threshold) overallBadge = BADGE_CONFIG.TOP_25
      else {
        // Check if the user has participated in at least one quiz
        const hasParticipated = await QuizSession.exists({
          user: entry.user,
          tournament: tournament._id,
          completed: true,
        })
        if (hasParticipated) overallBadge = BADGE_CONFIG.QUIZ_WARRIOR
      }

      // Check for category leadership badges
      for (const category of entry.selectedCategories) {
        const categoryRank = categoryLeaders[category]?.findIndex(
          leader => leader.userId.toString() === entry.user.toString(),
        )
        if (categoryRank === 0)
          categoryBadges.push({ ...BADGE_CONFIG.ACE, text: category })
        else if (categoryRank === 1)
          categoryBadges.push({ ...BADGE_CONFIG.PRO, text: category })
        else if (categoryRank === 2)
          categoryBadges.push({ ...BADGE_CONFIG.CHAMP, text: category })
      }

      // Determine displayed badge
      let displayedBadge
      if (
        overallBadge &&
        ['RANK_1', 'RANK_2', 'RANK_3'].includes(overallBadge.name)
      ) {
        displayedBadge = overallBadge
      } else {
        // Prioritize ACE badge
        const aceBadge = categoryBadges.find(badge => badge.name === 'ACE')
        const proBadge = categoryBadges.find(badge => badge.name === 'PRO')
        const champBadge = categoryBadges.find(badge => badge.name === 'CHAMP')
        if (aceBadge || proBadge || champBadge) {
          displayedBadge = aceBadge
            ? aceBadge
            : proBadge
            ? proBadge
            : champBadge
        } else {
          // If no category badges, use the overall badge
          displayedBadge = overallBadge
        }
      }

      // Combine overall badge and category badges
      const allBadges = overallBadge
        ? [overallBadge, ...categoryBadges]
        : categoryBadges
      const user = await User.findOne({
        _id: entry.user,
      })
      if (!user) continue

      if (displayedBadge && displayedBadge.name)
        user.displayedBadge = {
          tournamentNumber: tournament.tournamentNumber,
          rank: rank,
          participantCnt: participantCount,
          badgeName: displayedBadge.name,
          text: displayedBadge.text,
        }

      if (allBadges && allBadges.length > 0)
        user.badges = [
          ...user.badges,
          ...allBadges.map(badge => ({
            rank: rank,
            tournamentNumber: tournament.tournamentNumber,
            badgeName: badge.name,
            text: badge.text,
            participantCnt: participantCount,
          })),
        ]
      user.tournamentPerformance.push({
        tournament: tournament._id,
        score: entry.totalScore,
        rank: rank,
        endDate: tournament.endDate,
        tournamentNumber: tournament.tournamentNumber,
        participantCnt: participantCount,
      })
      await user.save()
    }

    console.log('Tournament performance and badges updated successfully')
  } catch (error) {
    console.error('Error updating tournament performance and badges:', error)
  }
}

const checkTournamentEligibility = async (user, RQM_score, session) => {
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
            (new Date().getTime() -
              user.quizAttempts[
                user.quizAttempts.length - 2
              ].createdAt.getTime()) /
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
module.exports = {
  getUserRegistrationDetails,
  updateTournamentPerformanceAndBadges,
  getTopLeadersForCategory,
  checkTournamentEligibility,
}
