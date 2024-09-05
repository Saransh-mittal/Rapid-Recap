// utils/dailyUserIQCalc.js

const DailyIQ = require('../model/dailyIQSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const User = require('../model/userSchema')
const { updatePercentilesOnQuizDeactivation } = require('./quiz.utils')
const rankUpdate = require('./update.utils/rank.update')
const CircleAndSocietyData = require('../data/CircleAndSocietyData')
const { logActivity } = require('./activity.utils')
const { activityTypes, getXpForActivity } = require('../data/activityTypes')
const configService = require('../configService')
const NoteMessage = require('../model/noteMessageSchema')
const cache = require('memory-cache')
const i18n = require('../i18n')

const findSocietyCircleByIQ = IQScore => {
  return CircleAndSocietyData.find(data => {
    return (
      IQScore >= data.IQ_Lower &&
      (data.IQ_Upper === null || IQScore < data.IQ_Upper)
    )
  })
}

const handleSocietyOrCircleUpgrade = async (
  userId,
  prevIQScore,
  currIQScore,
  previousIQForXp,
  awardableXpOrNot,
) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      console.error(`User not found for ID: ${userId}`)
      return
    }

    // Set the language for this session
    i18n.changeLanguage(user.userLanguage)

    const prevSocietyCircle = findSocietyCircleByIQ(prevIQScore)
    const currSocietyCircle = findSocietyCircleByIQ(currIQScore)

    if (!prevSocietyCircle || !currSocietyCircle) {
      console.error(
        `Invalid society/circle data for IQ scores: ${prevIQScore} or ${currIQScore}`,
      )
      return
    }

    const hasSocietyOrCircleChanged =
      prevSocietyCircle.society !== currSocietyCircle.society ||
      prevSocietyCircle.circle !== currSocietyCircle.circle

    const changedSocietyOrCircle = hasSocietyOrCircleChanged
      ? prevSocietyCircle.society !== currSocietyCircle.society
        ? 'society'
        : 'circle'
      : 'same'

    const isUpgrade = currSocietyCircle.IQ_Lower >= prevSocietyCircle.IQ_Lower

    if (hasSocietyOrCircleChanged) {
      if (isUpgrade) {
        user.societyUpgradeMessage = currSocietyCircle.upgradeMsg
        user.baseUpgradeIQ = currSocietyCircle.IQ_Lower

        if (awardableXpOrNot) {
          await logActivity({
            userInGameName: user.inGameName,
            type: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
            userIQ: currIQScore,
            previousIQ: previousIQForXp,
          })

          const noteMessage = new NoteMessage({
            userId: user._id,
            title: i18n.t('upgradeTitle'),
            milestoneContent: i18n.t('upgradeContent', {
              society:
                changedSocietyOrCircle === 'society'
                  ? currSocietyCircle.society
                  : currSocietyCircle.circle,
              type: changedSocietyOrCircle,
            }),
            messageType: 'xpAward',
            xpAwarded: getXpForActivity({
              activityType: type,
              userIQ: currIQScore || user.IQ_score,
              previousIQ: previousIQForXp || user.prevIQScore,
            }),
            xpSource: 'Society/Circle Upgrade',
            isMilestone: true,
            actions: [{ actionType: 'VIEW_EXPERIENCE' }],
          })
          await noteMessage.save()
        }
      } else {
        user.societyUpgradeMessage = ''
        user.baseUpgradeIQ = null
      }
    } else if (user.baseUpgradeIQ && currIQScore < user.baseUpgradeIQ) {
      user.societyUpgradeMessage = ''
      user.baseUpgradeIQ = null
    }

    user.currentSociety = currSocietyCircle.society
    user.currentCircle = currSocietyCircle.circle

    await user.save()

    console.log(
      `Updated society/circle for user ${userId}: ${
        currSocietyCircle.society
      } - ${currSocietyCircle.circle || 'N/A'}`,
    )
  } catch (error) {
    console.error(
      `Error in handleSocietyOrCircleUpgrade for user ${userId}: ${error.message}`,
    )
    console.error(`Stack trace: ${error.stack}`)
  }
}

const fetchUsersWithQuizAttempts = async () => {
  try {
    return await User.aggregate([
      {
        $match: {
          role: { $ne: 'guest' }, // Exclude guest users
        },
      },
      {
        $lookup: {
          from: 'quiz_attempts',
          localField: '_id',
          foreignField: 'user',
          as: 'quizAttempts',
        },
      },
      {
        $addFields: {
          distinctArticles: { $size: { $setUnion: '$quizAttempts.article' } },
        },
      },
      {
        $match: {
          distinctArticles: { $gte: 10 },
        },
      },
    ])
  } catch (error) {
    console.error(`Error in fetchUsersWithQuizAttempts: ${error.message}`)
    console.error(`Stack trace: ${error.stack}`)
    throw error
  }
}

const fetchUniqueArticleIds = async () => {
  try {
    return await QuizAttempt.aggregate([
      { $group: { _id: '$article' } },
      { $project: { _id: 0, articleId: '$_id' } },
    ])
  } catch (error) {
    console.error(`Error in fetchUniqueArticleIds: ${error.message}`)
    console.error(`Stack trace: ${error.stack}`)
    throw error
  }
}

const updatePercentilesForArticles = async uniqueArticleIds => {
  try {
    await Promise.all(
      uniqueArticleIds.map(async doc => {
        await updatePercentilesOnQuizDeactivation({
          id: doc.articleId.toString(),
        })
      }),
    )
  } catch (error) {
    console.error(`Error in updatePercentilesForArticles: ${error.message}`)
    console.error(`Stack trace: ${error.stack}`)
    throw error
  }
}

const calculateUserScores = async users => {
  const userScores = []
  let sumOfUserScores = 0
  const currSeason = configService.getCurrentSeason()

  const fetchQuizAttemptsPromises = users.map(async user => {
    try {
      const quizAttempts = await QuizAttempt.find({
        user: user._id,
        season: parseInt(currSeason, 10),
      }).populate({
        path: 'article',
        populate: { path: 'quiz' },
      })
      return { user, quizAttempts }
    } catch (error) {
      console.error(
        `Error fetching quiz attempts for user ${user._id}: ${error.message}`,
      )
      console.error(`Stack trace: ${error.stack}`)
      throw error
    }
  })

  const userQuizAttempts = await Promise.all(fetchQuizAttemptsPromises)
  for (const { user, quizAttempts } of userQuizAttempts) {
    let userScore = user.baseUserScore || 0

    for (const attempt of quizAttempts) {
      if (
        !attempt ||
        !attempt.article ||
        !attempt.article.quiz ||
        !attempt.articleDifficulty
      ) {
        console.error(`Invalid quiz attempt data for user ${user._id}.`)
        continue
      }

      const quizScore = attempt.articleDifficulty * attempt.userPercentile
      userScore += quizScore
    }

    userScore = typeof userScore === 'number' && userScore ? userScore : 0
    try {
      const u = await User.findById(user._id)
      u.userScore = userScore
      await u.save()
    } catch (error) {
      console.error(
        `Error saving user score for user ${user._id}: ${error.message}`,
      )
      console.error(`Stack trace: ${error.stack}`)
      throw error
    }

    sumOfUserScores += userScore
    userScores.push({ user, userScore })
  }

  return { userScores, sumOfUserScores }
}

const calculateAndAssignIQScores = async (userScores, sumOfUserScores) => {
  const meanOfUserScores = sumOfUserScores / userScores.length
  const sumOfSquares = userScores.reduce(
    (acc, user) => acc + Math.pow(user.userScore - meanOfUserScores, 2),
    0,
  )
  const standardDeviation = Math.sqrt(sumOfSquares / userScores.length)

  userScores.sort((a, b) => b.userScore - a.userScore)
  let rank = 1
  for (const { user, userScore } of userScores) {
    if (!user) {
      console.error(`Invalid user data for rank ${rank}.`)
      continue
    }

    const normalizedScore = (userScore - meanOfUserScores) / standardDeviation
    const IQScore = 100 + 15 * normalizedScore

    const currIQScore = Math.round(IQScore)
    try {
      const updatedUser = await User.findById(user._id)
      const awardableXpOrNot = currIQScore > user.maxIQScore
      const previousIQForXp = user.maxIQScore
      const prevIQScore = updatedUser.IQ_score

      updatedUser.IQ_score = currIQScore
      updatedUser.maxIQScore = Math.max(updatedUser.maxIQScore, currIQScore)
      updatedUser.prevIQScore = prevIQScore
      const currentSeason = configService.getCurrentSeason()
      const dailyIQ = new DailyIQ({
        user: updatedUser._id,
        IQ_score: currIQScore,
        dailyRank: `${rank}/${userScores.length}`,
        season: parseInt(currentSeason, 10),
      })
      await dailyIQ.save()

      updatedUser.dailyIQScores.push(dailyIQ._id)
      await updatedUser.save()

      await handleSocietyOrCircleUpgrade(
        updatedUser._id.toString(),
        prevIQScore,
        currIQScore,
        previousIQForXp,
        awardableXpOrNot,
      )
    } catch (error) {
      console.error(
        `Error calculating or saving IQ scores for user ${user._id}: ${error.message}`,
      )
      console.error(`Stack trace: ${error.stack}`)
      throw error
    }
    rank++
  }
}

const dailyUserIQCalc = async () => {
  try {
    console.log('\nFetching users...\n')
    const users = await fetchUsersWithQuizAttempts()
    console.log('\nFetched users.\n')

    console.log('\nFetching unique article IDs...\n')
    const uniqueArticleIds = await fetchUniqueArticleIds()
    console.log('\nFetched unique article IDs.\n')

    console.log('\nUpdating percentiles on quiz...\n')
    await updatePercentilesForArticles(uniqueArticleIds)
    console.log('\nUpdated percentiles on quiz.\n')

    console.log('\nCalculating user scores...\n')
    const { userScores, sumOfUserScores } = await calculateUserScores(users)
    console.log('\nCalculated user scores.\n')

    console.log('\nCalculating and assigning IQ scores...\n')
    await calculateAndAssignIQScores(userScores, sumOfUserScores)
    console.log('\nCalculated and assigned IQ scores.\n')

    await rankUpdate()
    console.log('\nRank updated.\n')

    console.log('\nClearing leaderboard cache...\n')
    const cacheKeys = cache.keys()
    cacheKeys.forEach(key => {
      if (key.startsWith('leaderboard_')) {
        cache.del(key)
      }
    })
    console.log('\nLeaderboard cache cleared.\n')
  } catch (error) {
    console.error(`Error in dailyUserIQCalc: ${error.message}`)
    console.error(`Stack trace: ${error.stack}`)
  }
}

module.exports = dailyUserIQCalc
