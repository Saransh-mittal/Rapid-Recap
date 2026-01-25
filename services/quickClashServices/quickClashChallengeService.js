// services/quickClashChallengeService.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const {
  getSourceArticles,
  generateMixedArticle,
  getSourceArticle,
  generateHindiTranslation,
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
  notifyMatchmakingSuccess,
} = require('./quickClashNotificationService')
const ArticleHighlight = require('../../model/articleHighlightSchema')
const {
  copyHighlightsToChallenge,
  createPlaceholderHighlight,
} = require('../../utils/quickClashHighlightIntegration.utils')
const Article = require('../../model/articleSchema')
const {
  updateTrophiesAfterChallenge,
  DEFAULT_STARTING_TROPHIES,
  calculateTrophiesToExchange,
} = require('./quickClashTrophyService')
const globalEmitter = require('../../eventEmitter')
const {
  calculateSoloWinProbability,
} = require('./quickClashWinProbabilityService')

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

// Helper to emit progress updates to both users for 1v1 matchmaking
const emitProgressUpdate = (challengerId, opponentId, step, progress) => {
  console.log(
    `[CHALLENGE_SERVICE] Emitting progress: ${step} - ${progress}% to users ${challengerId} and ${opponentId}`,
  )

  // Emit progress event for challenger
  globalEmitter.emit('quickClash:challengeProgress', {
    userId: challengerId,
    step,
    progress,
  })

  // Emit progress event for opponent
  globalEmitter.emit('quickClash:challengeProgress', {
    userId: opponentId,
    step,
    progress,
  })
}

/**
 * Create a new QuickClash challenge using a single article
 * @param {Object} params - Parameters
 * @param {string} params.challengerId - Challenger user ID
 * @param {string} params.opponentId - Opponent user ID
 * @param {Array<string>} params.categories - Selected categories for challenge
 * @param {boolean} [params.fromMatchMaking=false] - Whether this is from matchmaking
 * @returns {Promise<Object>} Challenge result object
 */
const createChallenge = async ({
  challengerId,
  opponentId,
  categories,
  fromMatchMaking = false,
}) => {
  if (challengerId.toString() === opponentId.toString()) {
    throw new Error('Cannot challenge yourself')
  }

  console.log(
    `[CHALLENGE_SERVICE] Creating challenge: ${challengerId} vs ${opponentId}, fromMatchmaking: ${fromMatchMaking}`,
  )

  // First progress update - Starting challenge creation
  if (fromMatchMaking) {
    emitProgressUpdate(challengerId, opponentId, 'matchFound', 5)
  }

  // Check limits
  // await checkChallengeLimits({ userId: challengerId })

  // Select a random category from the provided categories
  const category =
    categories[
      Math.floor(Math.random() * categories.length)
    ].toLocaleLowerCase()

  // Progress update - Content selection
  if (fromMatchMaking) {
    emitProgressUpdate(challengerId, opponentId, 'contentLoading', 15)
  }

  // Get a single article instead of multiple
  const article = await getSourceArticle({ category })

  // Progress update - Content loaded
  if (fromMatchMaking) {
    emitProgressUpdate(challengerId, opponentId, 'contentLoading', 30)
  }

  // Check if Hindi translation exists
  const hasHindiTranslation = !!(
    article.hindiTitle &&
    article.hindiMainText &&
    article.hindiMainText.length > 0
  )

  // Format article data for the challenge
  let articleData = {
    title: {
      english: article.title,
      hindi: article.hindiTitle || '',
    },
    content: {
      english: article.mainText,
      hindi:
        article.hindiMainText && article.hindiMainText.length > 0
          ? article.hindiMainText.join(' ')
          : '',
    },
    sourceArticles: [article._id],
  }

  // Progress update - Content preparation
  if (fromMatchMaking) {
    emitProgressUpdate(challengerId, opponentId, 'contentLoading', 45)
  }

  // Generate Hindi translation if it doesn't exist
  if (!hasHindiTranslation) {
    console.log(`Generating Hindi translation for article ${article._id}`)

    // Progress update - Translation starting
    if (fromMatchMaking) {
      emitProgressUpdate(challengerId, opponentId, 'contentLoading', 50)
    }

    const hindiTranslation = await generateHindiTranslation({
      title: article.title,
      content: article.mainText,
    })

    // Update article data with the new translation
    articleData.title.hindi = hindiTranslation.title
    articleData.content.hindi = hindiTranslation.content

    // Progress update - Translation completed
    if (fromMatchMaking) {
      emitProgressUpdate(challengerId, opponentId, 'contentLoading', 60)
    }

    // Optionally update the original article for future use
    try {
      // Convert content string to array format as expected by schema
      const hindiContentArray = [hindiTranslation.content]

      await Article.findByIdAndUpdate(article._id, {
        hindiTitle: hindiTranslation.title,
        hindiMainText: hindiContentArray,
      })

      console.log(`Updated article ${article._id} with Hindi translation`)
    } catch (updateError) {
      console.error(
        'Error updating article with Hindi translation:',
        updateError,
      )
      // Continue with the challenge creation even if saving to article fails
    }
  } else {
    // Progress update - No translation needed
    if (fromMatchMaking) {
      emitProgressUpdate(challengerId, opponentId, 'contentLoading', 60)
    }
  }

  // Calculate win probability
  let winProbability = null
  try {
    winProbability = await calculateSoloWinProbability({
      challengerId,
      opponentId,
      session: null,
    })
    console.log('[WIN_PROB] Solo challenge probability calculated:', {
      challenger: winProbability.challenger.probability,
      opponent: winProbability.opponent.probability,
    })
  } catch (probError) {
    // Non-blocking: if probability calculation fails, continue without it
    console.error('[WIN_PROB] Error calculating probability:', probError)
    // Challenge creation continues even if probability fails
  }

  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(
      async () => {
        // Progress update - Starting transaction
        if (fromMatchMaking) {
          emitProgressUpdate(challengerId, opponentId, 'contentLoading', 65)
        }

        const [challenger, opponent] = await Promise.all([
          User.findById(challengerId)
            .select('_id inGameName name pic quickClashTrophies')
            .session(session),
          User.findById(opponentId)
            .select('_id inGameName name pic quickClashTrophies')
            .session(session),
        ])

        // Get trophy counts with fallbacks to default
        const challengerTrophies =
          challenger.quickClashTrophies || DEFAULT_STARTING_TROPHIES
        const opponentTrophies =
          opponent.quickClashTrophies || DEFAULT_STARTING_TROPHIES

        // Calculate potential trophy exchanges for both players
        const challengerGain = calculateTrophiesToExchange({
          playerTrophies: challengerTrophies,
          opponentTrophies,
        })

        const opponentGain = calculateTrophiesToExchange({
          playerTrophies: opponentTrophies,
          opponentTrophies: challengerTrophies,
        })

        // Ensure losses don't go below minimum (players always keep at least 100 trophies)
        const challengerLoss = Math.min(opponentGain, challengerTrophies - 100)
        const opponentLoss = Math.min(challengerGain, opponentTrophies - 100)

        // Progress update - Setting up challenge
        if (fromMatchMaking) {
          emitProgressUpdate(challengerId, opponentId, 'generatingQuiz', 70)
        }

        // Create challenge
        const challenge = new QuickClashChallenge({
          challenger: challengerId,
          opponent: opponentId,
          selectedCategories: categories,
          category,
          fromMatchmaking: fromMatchMaking || false,
          article: articleData,
          expiresAt: new Date(Date.now() + CHALLENGE_EXPIRY),
          trophyPotential: {
            challenger: {
              currentTrophies: challengerTrophies,
              potentialGain: challengerGain,
              potentialLoss: challengerLoss,
            },
            opponent: {
              currentTrophies: opponentTrophies,
              potentialGain: opponentGain,
              potentialLoss: opponentLoss,
            },
          },
          winProbability: winProbability,
        })

        if (fromMatchMaking) challenge.status = 'active'
        await challenge.save({ session })

        // Progress update - Challenge created, generating questions
        if (fromMatchMaking) {
          emitProgressUpdate(challengerId, opponentId, 'generatingQuiz', 75)
        }

        // Generate English quiz in transaction
        const englishQuiz = await generateQuickClashQuiz({
          title: articleData.title.english,
          author: article.author || 'Rapid Recap Team',
          mainText: articleData.content.english,
          challenge,
          language: 'en',
          session,
        })

        // Progress update - English quiz generated
        if (fromMatchMaking) {
          emitProgressUpdate(challengerId, opponentId, 'generatingQuiz', 85)
        }

        // Create a placeholder for the Hindi quiz
        const hindiQuiz = new QuickClashQuiz({
          challenge: challenge._id,
          language: 'hi',
          questions: [], // Empty initially
          overallDifficulty: englishQuiz.overallDifficulty,
          translationStatus: 'pending',
        })

        await hindiQuiz.save({ session })

        // Progress update - Preparing highlights
        if (fromMatchMaking) {
          emitProgressUpdate(challengerId, opponentId, 'generatingQuiz', 90)
        }

        // Look for existing article highlights for English
        let englishHighlight = await ArticleHighlight.findOne({
          articleId: article._id,
          language: 'en',
          processingStatus: 'completed',
        }).session(session)

        // If article highlights exist, copy them to challenge
        if (englishHighlight) {
          englishHighlight = await copyHighlightsToChallenge({
            articleHighlight: englishHighlight,
            challengeId: challenge._id,
            lang: 'en',
            session,
          })
        } else {
          // Otherwise, create a placeholder
          englishHighlight = await createPlaceholderHighlight({
            challengeId: challenge._id,
            lang: 'en',
            session,
          })
        }

        // Do the same for Hindi highlights
        let hindiHighlight = await ArticleHighlight.findOne({
          articleId: article._id,
          language: 'hi',
          processingStatus: 'completed',
        }).session(session)

        if (hindiHighlight) {
          hindiHighlight = await copyHighlightsToChallenge({
            articleHighlight: hindiHighlight,
            challengeId: challenge._id,
            lang: 'hi',
            session,
          })
        } else {
          hindiHighlight = await createPlaceholderHighlight({
            challengeId: challenge._id,
            lang: 'hi',
            session,
          })
        }

        // Progress update - Almost done
        if (fromMatchMaking) {
          emitProgressUpdate(challengerId, opponentId, 'generatingQuiz', 95)
        }

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

        // Final progress update - Challenge ready!
        if (fromMatchMaking) {
          emitProgressUpdate(challengerId, opponentId, 'challengeReady', 100)
        }

        // Schedule quiz translation with our Hindi content
        setTimeout(() => {
          translateQuizBackground({
            englishQuiz,
            challengeId: challenge._id,
            hindiQuizId: hindiQuiz._id,
            hindiTitle: articleData.title.hindi,
            hindiMainText: articleData.content.hindi,
          }).catch(err => {
            console.error('Background Hindi translation failed:', err)
          })
        }, 1000)

        console.log(
          `[CHALLENGE_SERVICE] Challenge created successfully: ${challenge._id}`,
        )
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

const postChallengeCreation = async (challengeId, notifyData) => {
  try {
    console.log(
      `[CHALLENGE_SERVICE] Post challenge creation for: ${challengeId}`,
    )

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
      // Get the challenge to check if it's from matchmaking
      const challenge = await QuickClashChallenge.findById(challengeId)

      if (challenge && challenge.fromMatchmaking) {
        console.log(
          `[CHALLENGE_SERVICE] Sending matchmaking success notification for challenge: ${challengeId}`,
        )

        // For matchmaking, send different notifications
        notifyMatchmakingSuccess({
          challenge: notifyData.challenge,
          challenger: notifyData.challenger,
          opponent: notifyData.opponent,
        }).catch(err => {
          console.error(
            'Error sending matchmaking success notification:',
            err.message,
          )
        })
      } else {
        console.log(
          `[CHALLENGE_SERVICE] Sending regular challenge creation notification for challenge: ${challengeId}`,
        )

        // For normal challenges, send the regular challenge creation notification
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
      console.log(`[CHALLENGE_SERVICE] Challenge accepted: ${result._id}`)
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
        console.log(`[CHALLENGE_SERVICE] Challenge rejected: ${result._id}`)
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
    .populate('forgeArticle') // Add forge article population
    .populate({
      path: 'article.sourceArticles',
      select: 'title dateTime category',
    })

  if (!challenge) {
    throw new Error('Challenge not found')
  }

  const challengeObj = challenge.toObject()

  // Check if this is a forge challenge
  if (challengeObj.forgeArticle) {
    // Forge challenge - no highlights needed
    // Forge article already populated with all sections
    return challengeObj
  }

  // Traditional challenge - get highlights
  const [hindiHighlights, englishHighlights] = await Promise.all([
    getQuickClashHighlights({ challengeId, lang: 'hi' }),
    getQuickClashHighlights({ challengeId, lang: 'en' }),
  ])

  if (!hindiHighlights || !englishHighlights) {
    throw new Error('Highlights not found')
  }

  challengeObj.article.hindiImportantSentences =
    hindiHighlights.importantSentences
  challengeObj.article.englishImportantSentences =
    englishHighlights.importantSentences
  challengeObj.article.hindiDictionary = hindiHighlights.dictionary
  challengeObj.article.englishDictionary = englishHighlights.dictionary

  return challengeObj
}

const getUserChallenges = async ({
  userId,
  status = null,
  page = 1,
  limit = 20,
}) => {
  // Calculate skip value for pagination
  const skip = (page - 1) * limit

  let query = {
    $and: [
      {
        $or: [{ challenger: userId }, { opponent: userId }],
        fromTeamBattle: false,
      },
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

  // Get total count for pagination
  const total = await QuickClashChallenge.countDocuments(query)

  const challenges = await QuickClashChallenge.find(query)
    .populate('challenger', '_id name inGameName pic quickClashTrophies')
    .populate('opponent', '_id name inGameName pic quickClashTrophies')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    challenges,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  }
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
    if (challenge?.challenger?._id.equals(userId)) {
      challenge.challengerScore = score
      challenge.challengerAttempted = true // Mark as attempted regardless of score
    } else if (challenge?.opponent?._id.equals(userId)) {
      challenge.opponentScore = score
      challenge.opponentAttempted = true // Mark as attempted regardless of score
    } else if (challenge.fromTeamBattle) {
      // For team battles, the user might be a team member but not the direct challenger/opponent
      // In this case, we don't update the challenge score directly here, but we return the challenge
      // so the caller can proceed to update the team battle
      console.log(
        `[CHALLENGE_SERVICE] User ${userId} is not direct participant in challenge ${challengeId} but it is a team battle. Skipping direct score update.`,
      )
      return challenge
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

      // Calculate and update trophies
      if (!challenge.fromTeamBattle) {
        try {
          const trophyUpdates = await updateTrophiesAfterChallenge({
            challengeId: challenge._id,
            winnerId: challenge.winner || null,
            challengerId: challenge.challenger._id,
            opponentId: challenge.opponent._id,
            session, // Pass the current session
          })

          // Store trophy updates in the challenge for UI display
          challenge.trophyUpdates = trophyUpdates
        } catch (trophyError) {
          console.error('Error updating trophies:', trophyError)
          // Continue with challenge completion even if trophy update fails
        }
      } else {
        // Handle team battle completion logic here if needed
        // For now, team battle service handles the overall battle completion
        // But we might need to update individual challenge status in the team battle
      }
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
        console.log(
          `[CHALLENGE_SERVICE] Challenge score updated, notifying completion: ${challengeId}`,
        )
        notifyChallengeCompleted({
          challenge: {
            _id: challenge._id,
            category: challenge.category,
            winner: challenge.winner,
            challengerScore: challenge.challengerScore,
            opponentScore: challenge.opponentScore,
          },
          challenger: challenge.challenger,
          opponent: challenge.opponent,
        }).catch(err => {
          console.error('Error sending challenge completed notification:', err)
        })
      }, 0)
    }

    return challenge
  } catch (error) {
    // If we started the transaction, abort it on error
    if (startedTransaction) {
      await session.abortTransaction()
    }
    console.error('Error updating challenge score:', error)
    throw error
  } finally {
    // If we started the session, end it
    if (startedTransaction) {
      await session.endSession()
    }
  }
}

/**
 * Place a bet on a challenge
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID placing the bet
 * @param {number} params.amount - Bet amount (0, 1, 2, 5, 10)
 * @returns {Promise<Object>} Updated challenge
 */
const placeBet = async ({ challengeId, userId, amount }) => {
  // Validate bet amount
  const allowedBets = [0, 1, 2, 5, 10]
  if (!allowedBets.includes(amount)) {
    throw new Error('Invalid bet amount. Allowed values: 0, 1, 2, 5, 10')
  }

  const session = await mongoose.startSession()
  let result

  try {
    result = await session.withTransaction(async () => {
      // Get challenge and user
      const [challenge, user] = await Promise.all([
        QuickClashChallenge.findById(challengeId).session(session),
        User.findById(userId).select('quickClashTrophies').session(session),
      ])

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      // Check if betting is enabled
      if (challenge.betting && challenge.betting.enabled === false) {
        throw new Error('Betting is disabled for this challenge')
      }

      // Determine if user is challenger or opponent
      // Add null checks to prevent "Cannot read properties of null" errors
      let isChallenger = false
      const challengerId = challenge.challenger?.toString()
      const opponentId = challenge.opponent?.toString()
      const userIdStr = userId.toString()

      if (challengerId && challengerId === userIdStr) {
        isChallenger = true
      } else if (opponentId && opponentId === userIdStr) {
        isChallenger = false
      } else {
        // For team battles, challenger/opponent may be null - betting not supported
        if (challenge.fromTeamBattle) {
          throw new Error('Betting is not supported for team battle challenges')
        }
        throw new Error('User is not a participant in this challenge')
      }

      // Check if bet already placed
      const betInfo = isChallenger
        ? challenge.betting.challenger
        : challenge.betting.opponent

      if (betInfo.betPlaced) {
        throw new Error('Bet already placed')
      }

      // Check user balance
      const currentTrophies = user.quickClashTrophies || 0
      if (currentTrophies < amount) {
        throw new Error('Insufficient trophies for this bet')
      }

      // Deduct trophies (escrow)
      if (amount > 0) {
        user.quickClashTrophies -= amount
        await user.save({ session })
      }

      // Update challenge with bet info
      if (isChallenger) {
        challenge.betting.challenger.betAmount = amount
        challenge.betting.challenger.betPlaced = true
        challenge.betting.challenger.betPlacedAt = new Date()
        challenge.betting.challenger.trophiesAtBet = currentTrophies
      } else {
        challenge.betting.opponent.betAmount = amount
        challenge.betting.opponent.betPlaced = true
        challenge.betting.opponent.betPlacedAt = new Date()
        challenge.betting.opponent.trophiesAtBet = currentTrophies
      }

      await challenge.save({ session })

      return challenge
    })

    console.log(
      `[CHALLENGE_SERVICE] Bet placed: Challenge ${challengeId}, User ${userId}, Amount ${amount}`,
    )
    return result
  } finally {
    session.endSession()
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
  placeBet,
  placeBet,
}
