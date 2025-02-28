// services/quickClashChallengeService.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const {
  getSourceArticles,
  generateMixedArticle,
} = require('./quickClashArticleService')
const mongoose = require('mongoose')
const { generateQuickClashQuizzes } = require('../../utils/quickClashUtils')
const {
  generateQuickClashHighlights,
  getQuickClashHighlights,
} = require('../../utils/quickClashHighlight.utils')

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
  }).session(session)

  if (pendingChallenges >= 10) {
    throw new Error('Maximum pending challenges (10) reached')
  }
}

const createChallenge = async ({ challengerId, opponentId, categories }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      // Check limits
      await checkChallengeLimits({ userId: challengerId, session })

      // Randomly select category
      const category = categories[Math.floor(Math.random() * categories.length)]

      // Get source articles and generate mixed content
      const articles = await getSourceArticles({ category, session })
      const mixedArticle = await generateMixedArticle({ articles })

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

      await challenge.save({ session })

      // Generate quizzes in both languages
      const { englishQuiz, hindiQuiz } = await generateQuickClashQuizzes({
        title: mixedArticle.title.english,
        author: 'Rapid Recap Team',
        mainText: mixedArticle.content.english,
        hindiTitle: mixedArticle.title.hindi,
        hindiMainText: mixedArticle.content.hindi,
        challenge,
        session,
      })

      // Generate highlights for both languages in parallel
      // We use Promise.allSettled to continue even if one fails
      const highlightPromises = [
        generateQuickClashHighlights({
          challengeId: challenge._id,
          lang: 'en',
          session,
        }),
        generateQuickClashHighlights({
          challengeId: challenge._id,
          lang: 'hi',
          session,
        }),
      ]

      const highlightResults = await Promise.allSettled(highlightPromises)
      console.log(
        `Highlight generation results: ${highlightResults
          .map(r => r.status)
          .join(', ')}`,
      )

      return {
        challenge,
        quizzes: {
          english: englishQuiz,
          hindi: hindiQuiz,
        },
        highlights: {
          english:
            highlightResults[0].status === 'fulfilled'
              ? highlightResults[0].value
              : null,
          hindi:
            highlightResults[1].status === 'fulfilled'
              ? highlightResults[1].value
              : null,
        },
      }
    })
  } finally {
    session.endSession()
  }
}

const acceptChallenge = async ({ challengeId, userId }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const challenge = await QuickClashChallenge.findById(challengeId).session(
        session,
      )

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
  } finally {
    session.endSession()
  }
}

const rejectChallenge = async ({ challengeId, userId }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const challenge = await QuickClashChallenge.findById(challengeId).session(
        session,
      )

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      if (challenge.status !== 'pending') {
        throw new Error('Challenge is no longer pending')
      }

      if (!challenge.opponent.equals(userId)) {
        throw new Error('Not authorized to reject this challenge')
      }

      challenge.status = 'rejected'
      await challenge.save({ session })

      return challenge
    })
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
  const query = {
    $or: [{ challenger: userId }, { opponent: userId }],
  }

  if (status) {
    query.status = status
  }

  const challenges = await QuickClashChallenge.find(query)
    .populate('challenger opponent')
    .sort({ createdAt: -1 })
    .limit(limit)

  return challenges
}

const updateChallengeScore = async ({ challengeId, userId, score }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const challenge = await QuickClashChallenge.findById(challengeId).session(
        session,
      )

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      // Update appropriate score based on user role
      if (challenge.challenger.equals(userId)) {
        challenge.challengerScore = score
      } else if (challenge.opponent.equals(userId)) {
        challenge.opponentScore = score
      } else {
        throw new Error('User not part of this challenge')
      }

      // If both players have completed, determine winner
      if (challenge.challengerScore > 0 && challenge.opponentScore > 0) {
        challenge.status = 'completed'
        challenge.winner =
          challenge.challengerScore > challenge.opponentScore
            ? challenge.challenger
            : challenge.opponent
      }

      await challenge.save({ session })
      return challenge
    })
  } finally {
    session.endSession()
  }
}

module.exports = {
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  getChallengeDetails,
  getUserChallenges,
  updateChallengeScore,
}
