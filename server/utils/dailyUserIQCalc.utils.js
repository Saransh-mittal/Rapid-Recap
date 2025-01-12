// utils/dailyUserIQCalc.js

const DailyIQ = require('../model/dailyIQSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const User = require('../model/userSchema')
const { updatePercentilesOnQuizDeactivation } = require('./quiz.utils')
const rankUpdate = require('./update.utils/rank.update')
const { getCircleAndSocietyData } = require('../data/CircleAndSocietyData')
const { logActivity } = require('./activity.utils')
const { activityTypes, getXpForActivity } = require('../data/activityTypes')
const configService = require('../configService')
const NoteMessage = require('../model/noteMessageSchema')
const cache = require('memory-cache')
const i18n = require('../i18n')
const {
  societyOrCircleUpgradeTemplate,
} = require('../data/inboxNotificationsTemplates')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')
const { setTimeout } = require('timers/promises')
const { sendNotification } = require('../services/notificationService')

const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) throw error
      console.error(`Attempt ${attempt} failed: ${error.message}. Retrying...`)
      await setTimeout(delay * attempt)
    }
  }
}

const findSocietyCircleByIQ = async (IQScore, user) => {
  const CircleAndSocietyData = await getCircleAndSocietyData(user) // Fetch data by calling the function
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
  session = null,
) => {
  try {
    const userQuery = User.findById(userId)
    const user = session ? await userQuery.session(session) : await userQuery

    if (!user) {
      console.error(`User not found for ID: ${userId}`)
      return
    }

    const prevSocietyCircle = await findSocietyCircleByIQ(prevIQScore)
    const currSocietyCircle = await findSocietyCircleByIQ(currIQScore)
    const localizedI18n = i18n.cloneInstance({ initImmediate: false })

    // Switch to user's language
    await localizedI18n.changeLanguage(
      user?.userLanguage ? user.userLanguage : 'en',
    )

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

    const isUpgrade = currSocietyCircle.IQ_Lower > prevSocietyCircle.IQ_Lower

    if (hasSocietyOrCircleChanged) {
      if (isUpgrade && changedSocietyOrCircle !== 'same') {
        user.societyUpgradeMessage =
          changedSocietyOrCircle === 'society'
            ? currSocietyCircle.SocietyUpgradeMsg
            : currSocietyCircle.CircleUpgradeMsg
        user.baseUpgradeIQ = currSocietyCircle.IQ_Lower

        if (awardableXpOrNot) {
          const activityParams = {
            userInGameName: user.inGameName,
            type: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
            userIQ: currIQScore,
            previousIQ: previousIQForXp,
          }

          if (session) {
            activityParams.session = session
          }

          await logActivity(activityParams)

          const notificationTitle = localizedI18n.t('Achievement unlocked!')
          const notificationMainText = societyOrCircleUpgradeTemplate(
            changedSocietyOrCircle === 'society'
              ? currSocietyCircle.society
              : currSocietyCircle.circle,
            changedSocietyOrCircle,
          )

          const newNotification = new ApplicationUpdates({
            title: notificationTitle,
            mainText: notificationMainText,
            userId: userId,
            type: 'applicationUpdate',
          })
          await newNotification.save()

          await sendNotification({
            title: notificationTitle,
            body: `Congratulations! You have been upgraded to ${
              changedSocietyOrCircle === 'society'
                ? currSocietyCircle?.society
                : currSocietyCircle?.circle
            } ${changedSocietyOrCircle}`, // Localized text
            url: `/`,
            userId: user._id,
          })
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

    if (session) {
      await user.save({ session })
    } else {
      await user.save()
    }

    return {
      societyUpgradeMessage: user.societyUpgradeMessage,
      hasSocietyOrCircleChanged,
      changedSocietyOrCircle,
      isUpgrade,
      newSociety: currSocietyCircle.society,
      newCircle: currSocietyCircle.circle,
    }
  } catch (error) {
    console.error(
      `Error in handleSocietyOrCircleUpgrade for user ${userId}: ${error.message}`,
    )
    console.error(`Stack trace: ${error.stack}`)
    throw error
  }
}

const fetchUsersWithQuizAttempts = async () => {
  try {
    // pause real time IQ of all users
    await User.updateMany({}, { pauseRealTimeIQ: true })
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
          distinctArticles: { $gte: 1 },
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
    const currSeason = configService.getCurrentSeason()
    return await QuizAttempt.aggregate([
      { $match: { season: parseInt(currSeason, 10) } },
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
  const batchSize = 8500 // Adjust this value based on your system's capabilities
  const totalBatches = Math.ceil(uniqueArticleIds.length / batchSize)

  const processBatch = async (batch, batchIndex) => {
    try {
      await Promise.all(
        batch.map(async doc => {
          try {
            await updatePercentilesOnQuizDeactivation({
              id: doc.articleId._id.toString(),
            })
          } catch (error) {
            console.error(
              `Error updating percentiles for article ${doc.articleId}: ${error.message}`,
            )
            // Continue processing other articles in the batch
          }
        }),
      )
      console.log(`Processed batch ${batchIndex + 1} of ${totalBatches}`)
    } catch (error) {
      console.error(
        `Error processing batch ${batchIndex + 1}: ${error.message}`,
      )
      // Continue processing other batches
    }
  }

  try {
    for (let i = 0; i < uniqueArticleIds.length; i += batchSize) {
      const batch = uniqueArticleIds.slice(i, i + batchSize)
      await processBatch(batch, i / batchSize)
    }
    console.log('Finished processing all article batches')
  } catch (error) {
    console.error(`Error in updatePercentilesForArticles: ${error.message}`)
    console.error(`Stack trace: ${error.stack}`)
    // Don't throw the error here, so the process can continue with other tasks
  }
}

// Atomic update function
const atomicUpdateUserScore = async (userId, newScore) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { userScore: newScore } },
      { new: true, runValidators: true },
    )
    if (!result) {
      console.warn(`User ${userId} not found during atomic update.`)
    }
    return result
  } catch (error) {
    console.error(`Error in atomic update for user ${userId}: ${error.message}`)
    throw error
  }
}

const calculateUserScores = async users => {
  const userScores = []
  let sumOfUserScores = 0
  const currSeason = configService.getCurrentSeason()

  for (const user of users) {
    try {
      const quizAttempts = await retryOperation(async () => {
        return await QuizAttempt.find({
          user: user._id,
          season: parseInt(currSeason, 10),
        }).populate({
          path: 'article',
          select: '_id', // Only select the _id field from article
          populate: {
            path: 'quiz',
            select: '_id', // Only select the _id field from quiz
          },
        })
      })

      let userScore = user.baseUserScore || 0

      for (const attempt of quizAttempts) {
        if (
          !attempt ||
          !attempt.article ||
          !attempt.article.quiz ||
          !attempt.articleDifficulty ||
          typeof attempt.userPercentile !== 'number'
        ) {
          continue
        }

        const quizScore = attempt.articleDifficulty * attempt.userPercentile
        if (isNaN(quizScore) || !isFinite(quizScore)) {
          console.warn(
            `Invalid quiz score calculated for user ${user._id}. Skipping this attempt.`,
          )
          continue
        }

        userScore += quizScore
      }

      userScore = Math.max(0, userScore) // Ensure non-negative score

      await retryOperation(async () => {
        const updatedUser = await atomicUpdateUserScore(user._id, userScore)
        if (!updatedUser) {
          console.warn(`User ${user._id} not found when updating score.`)
        }
      })

      sumOfUserScores += userScore
      userScores.push({ user, userScore })
    } catch (error) {
      console.error(`Error processing user ${user._id}: ${error.message}`)
      console.error(`Stack trace: ${error.stack}`)
      // Continue processing other users instead of throwing
    }
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

    const currIQScore = IQScore.toFixed(1)
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
    console.log('\nFetched users.\n', users.length)

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

    console.log('\nUnpause real time IQ of all users\n')
    await User.updateMany({}, { pauseRealTimeIQ: false })
    console.log('\nUnpaused real time IQ of all users\n')

    console.log('\nClearing leaderboard cache...\n')
    const cacheKeys = cache.keys()
    cacheKeys.forEach(key => {
      if (
        key.startsWith('leaderboard_') ||
        key === 'user_scores' ||
        key === 'user_scores_stats'
      ) {
        cache.del(key)
      }
    })
    console.log('\nLeaderboard and IQ realtime calc cache cleared.\n')
  } catch (error) {
    console.error(`Error in dailyUserIQCalc: ${error.message}`)
    console.error(`Stack trace: ${error.stack}`)
  }
}

module.exports = { handleSocietyOrCircleUpgrade, dailyUserIQCalc }
