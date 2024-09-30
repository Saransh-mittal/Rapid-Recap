const mongoose = require('mongoose')
const BADGE_CONFIG = require('../data/BADGE_CONFIG')
const { getCategories } = require('../data/categories')
const {
  TournamentRegistration,
  QuizSession,
} = require('../model/tournamentRegistrationSchema')
const User = require('../model/userSchema')

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
        tournament: mongoose.Types.ObjectId.createFromHexString(tournamentId),
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
          leader => leader.toString() === entry.user.toString(),
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

      await User.updateOne(
        { _id: entry.user },
        {
          $push: {
            tournamentPerformance: {
              tournament: tournament._id,
              score: entry.totalScore,
              rank: rank,
              endDate: tournament.endDate,
              tournamentNumber: tournament.tournamentNumber,
              participantCnt: participantCount,
            },
          },
          $set: {
            displayedBadge: displayedBadge
              ? {
                  tournamentNumber: tournament.tournamentNumber,
                  rank: rank,
                  participantCnt: participantCount,
                  badgeName: displayedBadge.name,
                  text: displayedBadge.text,
                }
              : null,
          },
          $push: {
            badges: {
              $each: allBadges.map(badge => ({
                rank: rank,
                tournamentNumber: tournament.tournamentNumber,
                badgeName: badge.name,
                text: badge.text,
                participantCnt: participantCount,
              })),
            },
          },
        },
      )
    }

    console.log('Tournament performance and badges updated successfully')
  } catch (error) {
    console.error('Error updating tournament performance and badges:', error)
  }
}

module.exports = {
  getUserRegistrationDetails,
  updateTournamentPerformanceAndBadges,
  getTopLeadersForCategory,
}
