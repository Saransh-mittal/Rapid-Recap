// services/quickClashChallengeService.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const {
  getSourceArticles,
  generateMixedArticle,
} = require('./quickClashArticleService')
const mongoose = require('mongoose')
const {
  generateQuickClashQuiz,
  translateQuizBackground,
} = require('../../utils/quickClashUtils')
const {
  generateQuickClashHighlights,
  getQuickClashHighlights,
  scheduleHighlightGeneration,
} = require('../../utils/quickClashHighlight.utils')
const User = require('../../model/userSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const {
  notifyChallengeCreated,
  notifyChallengeAccepted,
  notifyChallengeRejected,
  notifyChallengeCompleted,
} = require('./quickClashNotificationService')

const CHALLENGE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

const checkChallengeLimits = async ({ userId, session }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysChallenges = await QuickClashChallenge.countDocuments({
    challenger: userId,
    createdAt: { $gte: today },
  }).session(session)

  if (todaysChallenges >= 5) {
    throw new Error('Daily challenge limit (5) reached')
  }

  const pendingChallenges = await QuickClashChallenge.countDocuments({
    challenger: userId,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  }).session(session)

  if (pendingChallenges >= 10) {
    throw new Error('Maximum pending challenges (10) reached')
  }
}

const createChallenge = async ({
  challengerId,
  opponentId,
  categories,
  fromMatchMaking = false,
}) => {
  if (challengerId.toString() === opponentId.toString()) {
    throw new Error('Cannot challenge yourself')
  }
  // Check limits
  // await checkChallengeLimits({ userId: challengerId })
  const category = categories[Math.floor(Math.random() * categories.length)]
  const articles = await getSourceArticles({ category })
  const mixedArticle = await generateMixedArticle({ articles })
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(
      async () => {
        // Create challenge
        const challenge = new QuickClashChallenge({
          challenger: challengerId,
          opponent: opponentId,
          selectedCategories: categories,
          category,
          article: {
            ...mixedArticle,
            sourceArticles: articles.map(a => a._id),
          },
          expiresAt: new Date(Date.now() + CHALLENGE_EXPIRY),
        })
        if (fromMatchMaking) challenge.status = 'active'
        await challenge.save({ session })

        // Generate only English quiz in transaction
        const englishQuiz = await generateQuickClashQuiz({
          title: mixedArticle.title.english,
          author: 'Rapid Recap Team',
          mainText: mixedArticle.content.english,
          challenge,
          language: 'en',
          session,
        })

        // Create a placeholder for the Hindi quiz that will be updated later
        const hindiQuiz = new QuickClashQuiz({
          challenge: challenge._id,
          language: 'hi',
          questions: [], // Empty initially
          overallDifficulty: englishQuiz.overallDifficulty,
          translationStatus: 'pending', // Add this field to your schema
        })

        await hindiQuiz.save({ session })

        // Create placeholder highlights inside the transaction
        const englishHighlight = await generateQuickClashHighlights({
          challengeId: challenge._id,
          lang: 'en',
          session,
        })

        const hindiHighlight = await generateQuickClashHighlights({
          challengeId: challenge._id,
          lang: 'hi',
          session,
        })

        // Populate challenger and opponent info
        const [challenger, opponent] = await Promise.all([
          User.findById(challengerId)
            .select('_id inGameName name')
            .session(session),
          User.findById(opponentId)
            .select('_id inGameName name')
            .session(session),
        ])

        challenge.challenger = challenger
        challenge.opponent = opponent

        const result = {
          challenge,
          quizzes: {
            english: englishQuiz,
            hindi: hindiQuiz,
          },
          highlights: {
            english: englishHighlight,
            hindi: hindiHighlight,
          },
        }
        result.notifyData = {
          challenger,
          opponent,
          challenge: {
            _id: challenge._id,
            category: challenge.category,
          },
        }

        // Schedule the Hindi translation to happen after transaction completes
        setTimeout(() => {
          translateQuizBackground({
            englishQuiz,
            challengeId: challenge._id,
            hindiQuizId: hindiQuiz._id,
            hindiTitle: mixedArticle.title.hindi,
            hindiMainText: mixedArticle.content.hindi,
          }).catch(err => {
            console.error('Background Hindi translation failed:', err)
          })
        }, 1000)

        return result
      },
      {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        maxTimeMS: 300000, // 5 minutes instead of default 60 seconds
      },
    )
  } finally {
    session.endSession()
  }
}

// After the transaction completes successfully,
// schedule the actual highlight generation in the background
const postChallengeCreation = async (challengeId, notifyData) => {
  try {
    // Schedule both English and Hindi highlight generation outside of the transaction
    // Don't await these - let them run in the background
    scheduleHighlightGeneration({ challengeId, lang: 'en' }).catch(err =>
      console.error(
        `Error in background English highlight generation: ${err.message}`,
      ),
    )

    scheduleHighlightGeneration({ challengeId, lang: 'hi' }).catch(err =>
      console.error(
        `Error in background Hindi highlight generation: ${err.message}`,
      ),
    )

    if (notifyData) {
      notifyChallengeCreated({
        challenge: notifyData.challenge,
        challenger: notifyData.challenger,
        opponent: notifyData.opponent,
      }).catch(err => {
        console.error(
          'Error sending challenge creation notification:',
          err.message,
        )
      })
    }
  } catch (error) {
    console.error(
      `Error scheduling background highlight generation: ${error.message}`,
    )
    // Non-blocking - this won't affect the challenge creation itself
  }
}

const acceptChallenge = async ({ challengeId, userId }) => {
  const session = await mongoose.startSession()
  let result
  try {
    result = await session.withTransaction(async () => {
      const challenge = await QuickClashChallenge.findById(challengeId)
        .populate('opponent', '_id inGameName name')
        .populate('challenger', '_id inGameName name')
        .session(session)

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      if (challenge.status !== 'pending') {
        throw new Error('Challenge is no longer pending')
      }

      if (!challenge.opponent.equals(userId)) {
        throw new Error('Not authorized to accept this challenge')
      }

      challenge.status = 'active'
      await challenge.save({ session })

      return challenge
    })
    setTimeout(() => {
      notifyChallengeAccepted({
        challenge: {
          _id: result._id,
          category: result.category,
        },
        challenger: result.challenger,
        opponent: result.opponent,
      }).catch(err => {
        console.error('Error sending challenge accepted notification:', err)
      })
    }, 0)

    return result
  } finally {
    session.endSession()
  }
}

const rejectChallenge = async ({ challengeId, userId }) => {
  const session = await mongoose.startSession()
  let result

  try {
    result = await session.withTransaction(async () => {
      const challenge = await QuickClashChallenge.findById(challengeId)
        .populate('challenger', '_id name inGameName')
        .populate('opponent', '_id name inGameName')
        .session(session)

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      if (challenge.status !== 'pending') {
        throw new Error('Challenge is no longer pending')
      }

      if (!challenge.opponent._id.equals(userId)) {
        throw new Error('Not authorized to reject this challenge')
      }

      challenge.status = 'rejected'
      await challenge.save({ session })

      return challenge
    })

    // Send notification outside of transaction
    if (result) {
      // Use setTimeout to ensure this runs after the transaction is completed
      // and doesn't block the response
      setTimeout(() => {
        notifyChallengeRejected({
          challenge: {
            _id: result._id,
            category: result.category,
          },
          challenger: result.challenger,
          opponent: result.opponent,
        }).catch(err => {
          console.error('Error sending challenge rejected notification:', err)
        })
      }, 0)
    }

    return result
  } finally {
    session.endSession()
  }
}

const getChallengeDetails = async ({ challengeId }) => {
  const challenge = await QuickClashChallenge.findById(challengeId)
    .populate('challenger opponent')
    .populate({
      path: 'article.sourceArticles',
      select: 'title dateTime category',
    })

  const [hindiHighlights, englishHighlights] = await Promise.all([
    getQuickClashHighlights({ challengeId, lang: 'hi' }),
    getQuickClashHighlights({ challengeId, lang: 'en' }),
  ])

  if (!challenge) {
    throw new Error('Challenge not found')
  }
  if (!hindiHighlights || !englishHighlights) {
    throw new Error('Highlights not found')
  }

  const challengeObj = challenge.toObject()
  challengeObj.article.hindiImportantSentences =
    hindiHighlights.importantSentences
  challengeObj.article.englishImportantSentences =
    englishHighlights.importantSentences
  challengeObj.article.hindiDictionary = hindiHighlights.dictionary
  challengeObj.article.englishDictionary = englishHighlights.dictionary

  return challengeObj
}

const getUserChallenges = async ({ userId, status = null, limit = 10 }) => {
  let query = {
    $and: [
      { $or: [{ challenger: userId }, { opponent: userId }] },
      {
        $or: [
          { status: 'completed' },
          {
            status: { $in: ['active', 'pending'] },
            expiresAt: { $gt: new Date() },
          },
          {
            $and: [
              { status: 'expired' },
              { challengerAttempted: true },
              { opponentAttempted: true },
            ],
          },
        ],
      },
    ],
  }

  if (status) {
    query = {
      $or: [{ challenger: userId }, { opponent: userId }],
      status: status,
    }
  }

  const challenges = await QuickClashChallenge.find(query)
    .populate('challenger', '_id name inGameName')
    .populate('opponent', '_id name inGameName')
    .sort({ createdAt: -1 })
    .limit(limit)

  return challenges
}

const updateChallengeScore = async ({
  challengeId,
  userId,
  score,
  session: providedSession,
}) => {
  // Use provided session if available, otherwise create a new one
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false
  let result
  let shouldNotify = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    // Find and update the challenge
    const challenge = await QuickClashChallenge.findById(challengeId)
      .populate('challenger', '_id name inGameName')
      .populate('opponent', '_id name inGameName')
      .session(session)

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    const wasComplete =
      challenge.challengerAttempted && challenge.opponentAttempted

    // Update appropriate score and attempted status based on user role
    if (challenge.challenger._id.equals(userId)) {
      challenge.challengerScore = score
      challenge.challengerAttempted = true // Mark as attempted regardless of score
    } else if (challenge.opponent._id.equals(userId)) {
      challenge.opponentScore = score
      challenge.opponentAttempted = true // Mark as attempted regardless of score
    } else {
      throw new Error('User not part of this challenge')
    }

    // If both players have completed, determine winner
    const isNowComplete =
      challenge.challengerAttempted && challenge.opponentAttempted

    if (isNowComplete && !wasComplete) {
      challenge.status = 'completed'

      // Set winner if not a tie
      if (challenge.challengerScore !== challenge.opponentScore) {
        challenge.winner =
          challenge.challengerScore > challenge.opponentScore
            ? challenge.challenger._id
            : challenge.opponent._id
      }

      // Mark for notification after transaction
      shouldNotify = true
    } else if (
      !isNowComplete &&
      (challenge.challengerAttempted || challenge.opponentAttempted)
    ) {
      // Only one player has completed - notify the other player
      shouldNotify = true
    }

    await challenge.save({ session })
    result = challenge

    // If we started the transaction, commit it
    if (startedTransaction) {
      await session.commitTransaction()
    }

    // Send notification outside of transaction (after it's committed)
    if (shouldNotify) {
      // Use setTimeout to ensure this runs after the transaction is completed
      // and doesn't block the response
      setTimeout(() => {
        notifyChallengeCompleted({
          challenge: result,
          completedByUserId: userId,
        }).catch(err => {
          console.error('Error sending challenge completion notification:', err)
        })
      }, 0)
    }

    return result
  } catch (error) {
    // If we started the transaction, abort it on error
    if (startedTransaction) {
      await session.abortTransaction()
    }
    throw error
  } finally {
    // If we started the session, end it
    if (!providedSession) {
      session.endSession()
    }
  }
}

module.exports = {
  checkChallengeLimits,
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  getChallengeDetails,
  getUserChallenges,
  updateChallengeScore,
  postChallengeCreation,
}
