// services/quickClashServices/quickClashAnalysisService.js
const QuickClashAnalysis = require('../../model/quickClashSchemas/quickClashAnalysisSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const mongoose = require('mongoose')
const OpenAI = require('openai')
const User = require('../../model/userSchema')
const { translateAnalysisToHindi } = require('./quickClashTranslationService')
const QuickClashTrophyHistory = require('../../model/quickClashSchemas/quickClashTrophyHistorySchema')

/**
 * Generate AI analysis for a completed challenge
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {mongoose.ClientSession} [params.session] - Optional Mongoose session for transactions
 * @returns {Promise<Object>} The generated analysis document
 */
const generateChallengeAnalysis = async ({ challengeId, session }) => {
  // Optional transaction session
  const mongoSession = session || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!session) {
      startedTransaction = true
      await mongoSession.startTransaction()
    }

    // Check if analysis already exists
    const existingAnalysis = await QuickClashAnalysis.findOne({
      challenge: challengeId,
    }).session(mongoSession)

    if (existingAnalysis) {
      return existingAnalysis
    }

    // Get challenge details
    const challenge = await QuickClashChallenge.findById(challengeId)
      .populate('challenger opponent')
      .session(mongoSession)

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    // Ensure the challenge is completed
    if (challenge.status !== 'completed') {
      throw new Error('Challenge is not completed yet')
    }

    // Get session data for both users
    const [challengerSession, opponentSession] = await Promise.all([
      QuickClashSession.findOne({
        challenge: challengeId,
        user: challenge.challenger._id,
      }).session(mongoSession),
      QuickClashSession.findOne({
        challenge: challengeId,
        user: challenge.opponent._id,
      }).session(mongoSession),
    ])

    if (!challengerSession || !opponentSession) {
      throw new Error(
        `${
          !challengerSession
            ? challenge?.challenger?.inGameName
            : challenge?.opponent?.inGameName
        } did not complete the challenge`,
      )
    }

    // Get user stats data
    const [challengerStats, opponentStats] = await Promise.all([
      getUserChallengeStats({
        userId: challenge.challenger._id,
        session: mongoSession,
      }),
      getUserChallengeStats({
        userId: challenge.opponent._id,
        session: mongoSession,
      }),
    ])

    // Determine winner
    const winnerId =
      challenge.challengerScore > challenge.opponentScore
        ? challenge.challenger._id
        : challenge.opponentScore > challenge.challengerScore
        ? challenge.opponent._id
        : null // Tie case

    // Generate analysis
    const analysisData = await generateAIAnalysis({
      challenge,
      challengerSession,
      opponentSession,
      challengerStats,
      opponentStats,
      winnerId,
    })

    // Create analysis document
    const analysis = new QuickClashAnalysis({
      challenge: challengeId,
      ...analysisData,
      challenger: {
        userId: challenge.challenger._id,
        ...analysisData.challenger,
      },
      opponent: {
        userId: challenge.opponent._id,
        ...analysisData.opponent,
      },
      engagement: {
        winner: winnerId,
        ...analysisData.engagement,
      },
    })

    await analysis.save({ session: mongoSession })

    if (startedTransaction) {
      await mongoSession.commitTransaction()
    }

    return analysis
  } catch (error) {
    if (startedTransaction) {
      await mongoSession.abortTransaction()
    }
    console.error('Error generating challenge analysis:', error)
    throw error
  } finally {
    if (startedTransaction) {
      await mongoSession.endSession()
    }
  }
}

/**
 * Get a user's challenge statistics
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {mongoose.ClientSession} [params.session] - Optional Mongoose session
 * @returns {Promise<Object>} User statistics
 */
const getUserChallengeStats = async ({ userId, session }) => {
  try {
    // Get all completed challenges for this user
    const completedChallenges = await QuickClashChallenge.find({
      $or: [
        { challenger: userId, status: 'completed' },
        { opponent: userId, status: 'completed' },
      ],
    })
      .session(session)
      .lean()

    // Get active challenges count
    const activeChallenges = await QuickClashChallenge.countDocuments({
      $or: [
        { challenger: userId, status: { $in: ['pending', 'active'] } },
        { opponent: userId, status: { $in: ['pending', 'active'] } },
      ],
    }).session(session)

    // Initialize stats
    const stats = {
      totalChallenges: completedChallenges.length + activeChallenges,
      wins: 0,
      currentStreak: 0,
      winRate: 0,
      bestCategory: null,
      peakPerformanceTime: 'Afternoon', // Default value
    }

    // If no completed challenges, return default stats
    if (completedChallenges.length === 0) {
      return stats
    }

    // Sort challenges by date (newest first) for streak calculation
    completedChallenges.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )

    // Calculate wins and category performance
    const categoryScores = {}
    const timeOfDayStats = {
      Morning: { wins: 0, total: 0 },
      Afternoon: { wins: 0, total: 0 },
      Evening: { wins: 0, total: 0 },
    }

    let streakBroken = false
    let completedCount = 0

    for (const challenge of completedChallenges) {
      const isChallenger =
        challenge?.challenger?.toString() === userId.toString()
      const userScore = isChallenger
        ? challenge.challengerScore
        : challenge.opponentScore
      const opponentScore = isChallenger
        ? challenge.opponentScore
        : challenge.challengerScore

      // Only count challenges where both players completed their attempts
      if (challenge.challengerAttempted && challenge.opponentAttempted) {
        completedCount++

        // Track time of day performance
        const hour = new Date(challenge.createdAt).getHours()
        const timeOfDay =
          hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
        timeOfDayStats[timeOfDay].total += 1

        // Track category performance
        if (!categoryScores[challenge.category]) {
          categoryScores[challenge.category] = {
            wins: 0,
            total: 0,
            score: 0, // Will be used for performance calculation
          }
        }
        categoryScores[challenge.category].total += 1

        // Count wins and update stats
        if (userScore > opponentScore) {
          stats.wins += 1
          categoryScores[challenge.category].wins += 1
          timeOfDayStats[timeOfDay].wins += 1

          // Track current streak (only for most recent challenges)
          if (!streakBroken) {
            stats.currentStreak += 1
          }
        } else {
          streakBroken = true // Break the streak on loss or tie
        }
      }
    }

    // Calculate win rate
    if (completedCount > 0) {
      stats.winRate = Math.round((stats.wins / completedCount) * 100)
    }

    // Find best category
    let bestCategoryScore = 0
    Object.entries(categoryScores).forEach(([category, data]) => {
      if (data.total >= 2) {
        // Need at least 2 challenges for meaningful data
        const winRate = data.wins / data.total
        const categoryScore = winRate * Math.min(data.total, 10) // Cap influence of total

        if (categoryScore > bestCategoryScore) {
          bestCategoryScore = categoryScore
          stats.bestCategory = category
        }
      }
    })

    // Find peak performance time
    let bestTimeScore = 0
    Object.entries(timeOfDayStats).forEach(([timeOfDay, data]) => {
      if (data.total >= 2) {
        // Need at least 2 challenges for meaningful data
        const winRate = data.wins / data.total
        const timeScore = winRate * Math.min(data.total, 10) // Cap influence of total

        if (timeScore > bestTimeScore) {
          bestTimeScore = timeScore
          stats.peakPerformanceTime = timeOfDay
        }
      }
    })

    return stats
  } catch (error) {
    console.error('Error calculating user stats:', error)
    throw error
  }
}

/**
 * Calculate enhanced trophy trend based on history and current change
 * @param {number} currentChange - Current trophy change in this challenge
 * @param {Array} trophyHistory - Array of trophy history entries
 * @returns {string} Descriptive trend status
 */
const calculateEnhancedTrophyTrend = (currentChange, trophyHistory) => {
  // If no history available, use current change only
  if (!trophyHistory || trophyHistory.length === 0) {
    return currentChange > 0
      ? 'Rising'
      : currentChange < 0
      ? 'Declining'
      : 'Stable'
  }

  // Calculate net change over recent history (up to 5 entries)
  const recentHistory = trophyHistory.slice(0, 5)
  const netChange = recentHistory.reduce(
    (sum, entry) => sum + entry.trophiesChange,
    0,
  )

  // Count positive and negative changes
  const positiveChanges = recentHistory.filter(
    entry => entry.trophiesChange > 0,
  ).length
  const negativeChanges = recentHistory.filter(
    entry => entry.trophiesChange < 0,
  ).length

  // Determine consistency
  const isConsistent =
    (positiveChanges > 0 && negativeChanges === 0) ||
    (negativeChanges > 0 && positiveChanges === 0)

  // Calculate trend direction and strength
  if (netChange > 20) return 'Strongly Rising'
  if (netChange > 0) return isConsistent ? 'Rising' : 'Gradually Rising'
  if (netChange < -20) return 'Strongly Declining'
  if (netChange < 0) return isConsistent ? 'Declining' : 'Gradually Declining'
  return 'Stable'
}

/**
 * Generate AI analysis for a completed challenge
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - Challenge document
 * @param {Object} params.challengerSession - Challenger's session
 * @param {Object} params.opponentSession - Opponent's session
 * @param {Object} params.challengerStats - Challenger's statistics
 * @param {Object} params.opponentStats - Opponent's statistics
 * @param {string|null} params.winnerId - ID of the winner (null for ties)
 * @returns {Promise<Object>} Analysis data
 */
const generateAIAnalysis = async ({
  challenge,
  challengerSession,
  opponentSession,
  challengerStats,
  opponentStats,
  winnerId,
}) => {
  // Fetch trophy history for both players (limited to recent matches)
  const [challengerTrophyHistory, opponentTrophyHistory] = await Promise.all([
    QuickClashTrophyHistory.find({ user: challenge.challenger._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    QuickClashTrophyHistory.find({ user: challenge.opponent._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ])

  // First, compile the data needed for analysis
  const challengerData = {
    userId: challenge.challenger._id,
    username: challenge.challenger.inGameName || challenge.challenger.name,
    score: challenge.challengerScore,
    readingTime: challengerSession.reading.timeSpent || 0,
    quizTimeSpent: challengerSession.quizAttempt.timeSpent || 0,
    stats: challengerStats,
    correctAnswers: (challengerSession.quizAttempt.responses || []).filter(
      r => r.isCorrect,
    ).length,
    totalQuestions: (challengerSession.quizAttempt.responses || []).length,
    // Add detailed quiz response information
    detailedResponses: await getEnhancedResponseDetails(challengerSession),
    // Add trophy data
    trophyData: challenge.trophyUpdates
      ? {
          previousTrophies: challenge.trophyUpdates.challenger.previousTrophies,
          newTrophies: challenge.trophyUpdates.challenger.newTrophies,
          change: challenge.trophyUpdates.challenger.change,
          protectionApplied:
            challenge.trophyUpdates.protectionApplied?.challenger || false,
          protectionType:
            challenge.trophyUpdates.protectionApplied?.challenger_type || null,
          // Add enhanced trend calculation
          enhancedTrend: calculateEnhancedTrophyTrend(
            challenge.trophyUpdates.challenger.change,
            challengerTrophyHistory,
          ),
        }
      : null,
    // Add trophy history data for AI to analyze
    trophyHistory: challengerTrophyHistory,
  }

  const opponentData = {
    userId: challenge.opponent._id,
    username: challenge.opponent.inGameName || challenge.opponent.name,
    score: challenge.opponentScore,
    readingTime: opponentSession.reading.timeSpent || 0,
    quizTimeSpent: opponentSession.quizAttempt.timeSpent || 0,
    stats: opponentStats,
    correctAnswers: (opponentSession.quizAttempt.responses || []).filter(
      r => r.isCorrect,
    ).length,
    totalQuestions: (opponentSession.quizAttempt.responses || []).length,
    // Add detailed quiz response information
    detailedResponses: await getEnhancedResponseDetails(opponentSession),
    // Add trophy data
    trophyData: challenge.trophyUpdates
      ? {
          previousTrophies: challenge.trophyUpdates.opponent.previousTrophies,
          newTrophies: challenge.trophyUpdates.opponent.newTrophies,
          change: challenge.trophyUpdates.opponent.change,
          protectionApplied:
            challenge.trophyUpdates.protectionApplied?.opponent || false,
          protectionType:
            challenge.trophyUpdates.protectionApplied?.opponent_type || null,
          // Add enhanced trend calculation
          enhancedTrend: calculateEnhancedTrophyTrend(
            challenge.trophyUpdates.opponent.change,
            opponentTrophyHistory,
          ),
        }
      : null,
    // Add trophy history data for AI to analyze
    trophyHistory: opponentTrophyHistory,
  }

  // When calculating engagement score, adjust formula to account for the time constraints
  const calculateEngagementScore = () => {
    // Base engagement score starts at 50
    let baseScore = 50

    // Add points for matching scores (max 20 points for identical scores)
    const scoreDifferencePoints =
      20 - Math.min(20, Math.abs(challengerData.score - opponentData.score))

    // Add points for higher scores (max 15 points)
    const scoreValuePoints = Math.min(
      15,
      Math.min(challengerData.score, opponentData.score) / 20,
    )

    // Calculate final engagement score, capped at 100
    return Math.min(100, baseScore + scoreDifferencePoints + scoreValuePoints)
  }

  // Calculate engagement score with new formula
  const engagementScore = calculateEngagementScore()

  // Determine difficulty level based on scores and time spent
  let difficulty = 'medium'
  const avgScore = (challengerData.score + opponentData.score) / 2
  if (avgScore < 60) {
    difficulty = 'hard'
  } else if (avgScore > 120) {
    difficulty = 'easy'
  }

  // Initialize the OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    // Create a structured profile of each player's performance for the AI
    const challengerProfile = {
      username: challengerData.username,
      score: challengerData.score,
      readingTime: challengerData.readingTime,
      quizTimeInSeconds: challengerData.quizTimeSpent,
      averageTimePerQuestion:
        challengerData.totalQuestions > 0
          ? challengerData.quizTimeSpent / challengerData.totalQuestions
          : 0,
      correctAnswers: challengerData.correctAnswers,
      totalQuestions: challengerData.totalQuestions,
      accuracy:
        challengerData.totalQuestions > 0
          ? (challengerData.correctAnswers / challengerData.totalQuestions) *
            100
          : 0,
      currentStreak: challengerData.stats.currentStreak,
      winRate: challengerData.stats.winRate,
      bestCategory: challengerData.stats.bestCategory,
      peakPerformanceTime: challengerData.stats.peakPerformanceTime,
      detailedResponses: challengerData.detailedResponses,
      // Add question difficulty distribution
      questionDifficultyBreakdown: getQuestionDifficultyBreakdown(
        challengerData.detailedResponses,
      ),
      // Add performance by difficulty
      performanceByDifficulty: getPerformanceByDifficulty(
        challengerData.detailedResponses,
      ),
      // Add time analysis by question difficulty
      timeByDifficulty: getTimeByDifficulty(challengerData.detailedResponses),
      // Add trophy data
      trophyData: challengerData.trophyData,
      // Add trophy history array
      trophyHistory: challengerData.trophyHistory,
    }

    const opponentProfile = {
      username: opponentData.username,
      score: opponentData.score,
      readingTime: opponentData.readingTime,
      quizTimeInSeconds: opponentData.quizTimeSpent,
      averageTimePerQuestion:
        opponentData.totalQuestions > 0
          ? opponentData.quizTimeSpent / opponentData.totalQuestions
          : 0,
      correctAnswers: opponentData.correctAnswers,
      totalQuestions: opponentData.totalQuestions,
      accuracy:
        opponentData.totalQuestions > 0
          ? (opponentData.correctAnswers / opponentData.totalQuestions) * 100
          : 0,
      currentStreak: opponentData.stats.currentStreak,
      winRate: opponentData.stats.winRate,
      bestCategory: opponentData.stats.bestCategory,
      peakPerformanceTime: opponentData.stats.peakPerformanceTime,
      detailedResponses: opponentData.detailedResponses,
      // Add question difficulty distribution
      questionDifficultyBreakdown: getQuestionDifficultyBreakdown(
        opponentData.detailedResponses,
      ),
      // Add performance by difficulty
      performanceByDifficulty: getPerformanceByDifficulty(
        opponentData.detailedResponses,
      ),
      // Add time analysis by question difficulty
      timeByDifficulty: getTimeByDifficulty(opponentData.detailedResponses),
      // Add trophy data
      trophyData: opponentData.trophyData,
      // Add trophy history array
      trophyHistory: opponentData.trophyHistory,
    }

    const winnerUsername = winnerId
      ? winnerId.toString() === challengerData.userId.toString()
        ? challengerData.username
        : opponentData.username
      : null

    const isTie =
      !winnerId && challengerData.score > 0 && opponentData.score > 0

    // Determine if any player had trophy protection
    const protectionInfo =
      challenge.trophyUpdates && challenge.trophyUpdates.protectionApplied
        ? {
            challengerProtected:
              challenge.trophyUpdates.protectionApplied.challenger,
            challengerProtectionType:
              challenge.trophyUpdates.protectionApplied.challenger_type,
            opponentProtected:
              challenge.trophyUpdates.protectionApplied.opponent,
            opponentProtectionType:
              challenge.trophyUpdates.protectionApplied.opponent_type,
          }
        : null

    // Compile the prompt for OpenAI
    const prompt = {
      category: challenge.category,
      battleContext: {
        category: challenge.category,
        difficulty: difficulty,
        winner: winnerUsername,
        isTie: isTie,
        // Add trophy exchange information
        trophyExchange: challenge.trophyUpdates
          ? {
              isTie: challenge.trophyUpdates.isTie,
              protectionApplied: protectionInfo,
            }
          : null,
      },
      challenger: challengerProfile,
      opponent: opponentProfile,
    }

    // First, modify our createFactualMetrics function to handle missing difficulty levels properly
    const createFactualMetrics = userData => {
      // Calculate performance metrics directly from data
      const performance = {
        readingTime: userData.readingTime,
        quizSpeed: userData.averageTimePerQuestion, // Use exact value from data
        finalScore: userData.score,
        // Calculate reading speed percentile based on system's 2-minute limit
        // A lower value is better for reading speed (0-100)
        readingSpeedPercentile: Math.max(
          0,
          Math.min(100, 100 - (userData.readingTime / 120) * 100),
        ),
      }

      // Calculate question type performance scores (0-100 scale)
      const questionTypePerformance = {
        easyQuestions:
          userData.performanceByDifficulty.easy.total > 0
            ? userData.performanceByDifficulty.easy.accuracy
            : null, // Use null instead of 0 if no questions
        mediumQuestions:
          userData.performanceByDifficulty.medium.total > 0
            ? userData.performanceByDifficulty.medium.accuracy
            : null,
        hardQuestions:
          userData.performanceByDifficulty.hard.total > 0
            ? userData.performanceByDifficulty.hard.accuracy
            : null,
      }

      // Create a map of which difficulty levels were actually present
      const difficultyPresence = {
        easy: userData.performanceByDifficulty.easy.total > 0,
        medium: userData.performanceByDifficulty.medium.total > 0,
        hard: userData.performanceByDifficulty.hard.total > 0,
      }

      return {
        performance,
        questionTypePerformance,
        difficultyPresence,
      }
    }

    // Generate the challenger metrics
    const challengerMetrics = createFactualMetrics(challengerProfile)

    // Generate the opponent metrics
    const opponentMetrics = createFactualMetrics(opponentProfile)

    // Generate the challenger analysis with constraints awareness and pre-filled metrics
    const challengerResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert AI tutor and analyst. You'll analyze quiz battle performance data between two users and generate personalized, insightful, and constructive feedback for the first player (challenger).

IMPORTANT SYSTEM CONSTRAINTS:
1. Users are automatically assigned 5 questions of varying difficulty; they don't choose difficulty levels.
2. There is a strict 50-second time limit for the entire quiz.
3. There is a strict 2-minute time limit for reading the article.
4. Questions are randomly selected from a larger pool, so users may not see any questions of a particular difficulty level in a given challenge.

TROPHY SYSTEM INFORMATION:
The system uses trophies as a competitive ranking mechanism. Users gain or lose trophies based on wins and losses.
1. Trophy protection may be applied for losing players in certain situations:
   - Streak Protection: Protects trophies after a losing streak is broken
   - Activity Protection: Protects newer players from losing too many trophies early on
2. Trophy exchange represents skill level and achievement in the system
3. Users with higher trophy counts are typically more experienced or skilled

Your analysis should be compassionate and account for these system constraints. Never suggest that a user "should have attempted more/better/different questions" as this is not under their control. Instead, focus on their performance with what they were randomly given.

CRITICAL: If a user did not receive any questions of a particular difficulty level, DO NOT mention this as an area for growth or improvement. It's a system limitation, not a user performance issue.

The factual metrics have already been calculated and included. Your job is to generate the qualitative analysis and insights.`,
        },
        {
          role: 'user',
          content: `Generate a detailed, personalized analysis for the challenger in this knowledge battle based on their performance metrics and question responses.

IMPORTANT FACTS TO CONSIDER:
- Questions are randomly assigned to users from a pool
- Users have no control over question difficulty selection
- Time constraints are very strict (50 seconds for 5 questions)
- Reading time is capped at 2 minutes
- Trophy exchange reflects skill level and competitive progress

DIFFICULTY LEVELS PRESENT IN THIS QUIZ:
- Easy questions: ${challengerMetrics.difficultyPresence.easy ? 'YES' : 'NO'}
- Medium questions: ${
            challengerMetrics.difficultyPresence.medium ? 'YES' : 'NO'
          }
- Hard questions: ${challengerMetrics.difficultyPresence.hard ? 'YES' : 'NO'}

We've already calculated the following metrics:
- Reading time: ${challengerMetrics.performance.readingTime} seconds
- Quiz speed: ${challengerMetrics.performance.quizSpeed} seconds per question
- Final score: ${challengerMetrics.performance.finalScore}
- Reading speed percentile: ${challengerMetrics.performance.readingSpeedPercentile.toFixed(
            1,
          )}
${
  challengerMetrics.difficultyPresence.easy
    ? `- Performance on easy questions: ${challengerMetrics.questionTypePerformance.easyQuestions.toFixed(
        1,
      )}%`
    : '- No easy questions were assigned in this quiz'
}
${
  challengerMetrics.difficultyPresence.medium
    ? `- Performance on medium questions: ${challengerMetrics.questionTypePerformance.mediumQuestions.toFixed(
        1,
      )}%`
    : '- No medium questions were assigned in this quiz'
}
${
  challengerMetrics.difficultyPresence.hard
    ? `- Performance on hard questions: ${challengerMetrics.questionTypePerformance.hardQuestions.toFixed(
        1,
      )}%`
    : '- No hard questions were assigned in this quiz'
}

${
  challengerProfile.trophyData
    ? `TROPHY INFORMATION:
- Previous trophy count: ${challengerProfile.trophyData.previousTrophies}
- New trophy count: ${challengerProfile.trophyData.newTrophies}
- Trophy change: ${challengerProfile.trophyData.change}
- Enhanced trend: ${challengerProfile.trophyData.enhancedTrend}
- Trophy protection applied: ${
        challengerProfile.trophyData.protectionApplied ? 'YES' : 'NO'
      }
${
  challengerProfile.trophyData.protectionApplied
    ? `- Protection type: ${challengerProfile.trophyData.protectionType}`
    : ''
}`
    : '- Trophy data not available for this challenge'
}

${
  challengerProfile.trophyHistory && challengerProfile.trophyHistory.length > 0
    ? `TROPHY HISTORY INFORMATION:
- Recent trophy changes: ${challengerProfile.trophyHistory
        .slice(0, 5)
        .map(h => h.trophiesChange)
        .join(', ')}
- Enhanced trend analysis: ${
        challengerProfile.trophyData?.enhancedTrend || 'No data'
      }
- Consistency: ${
        challengerProfile.trophyHistory.filter(h => h.trophiesChange > 0)
          .length > 0 &&
        challengerProfile.trophyHistory.filter(h => h.trophiesChange < 0)
          .length === 0
          ? 'Consistently gaining trophies'
          : challengerProfile.trophyHistory.filter(h => h.trophiesChange < 0)
              .length > 0 &&
            challengerProfile.trophyHistory.filter(h => h.trophiesChange > 0)
              .length === 0
          ? 'Consistently losing trophies'
          : 'Mixed trophy results'
      }`
    : '- No trophy history available'
}

Your job is to provide qualitative analysis and insights based on these metrics and the detailed question-level data. Focus on identifying patterns, providing actionable recommendations, and creating a personalized learning path.

VERY IMPORTANT: Only analyze performance for question difficulties that were present in the quiz. Do not mention missing difficulty levels as an area for improvement or growth.

TROPHY ANALYSIS GUIDELINES:
- If the player won and gained trophies, emphasize their achievement and progress
- If the player lost but had protection, explain what the protection means and how it helped them
- For new players (typically lower trophy counts), provide more encouragement and basic tips
- For experienced players (higher trophy counts), provide more advanced strategic advice
- When analyzing trophy trends, use the enhanced trend data (Strongly Rising, Rising, etc.) to give context

KNOWLEDGE PATTERN METRICS SCORING GUIDELINES (All metrics should be scored 0-100):

1. Factual Recall (0-100):
   - Evaluate the user's ability to remember specific facts, dates, names, and direct information from the text
   - Score based on:
     * Accuracy on fact-based questions (70% of score)
     * Speed of answering factual questions (30% of score)
     * 100 = Perfect recall with rapid responses
     * 0 = Unable to recall basic facts

2. Technical Terms (0-100):
   - Evaluate the user's understanding of domain-specific terminology and concepts
   - Score based on:
     * Correct answers to questions featuring specialized vocabulary (80% of score)
     * Consistent performance on technical vs. general questions (20% of score)
     * 100 = Expert-level command of technical concepts
     * 0 = No grasp of specialized terminology

3. Strategic Analysis (0-100):
   - Evaluate the user's ability to connect concepts, infer relationships, and apply knowledge
   - Score based on:
     * Performance on questions requiring synthesis of multiple facts (50% of score)
     * Ability to identify cause-effect relationships (30% of score)
     * Time efficiency on complex questions (20% of score)
     * 100 = Sophisticated analytical thinking
     * 0 = Unable to make connections between related concepts

Ensure these scores reflect the user's actual performance on the questions they received, not theoretical ability. Be consistent in your scoring methodology.

The output must be a valid JSON object with the following structure:
{
  "performance": {
    "quizSpeedTrend": "improving" | "declining" | "consistent",
    "difficultyInsight": string,
    "trophyAnalysis": string  // Add insight about trophy performance
  },
  "analysis": {
    "strengths": string[],
    "weaknesses": string[],
    "knowledgePatterns": {
      "factualRecall": number,
      "technicalTerms": number,
      "strategicAnalysis": number
    },
    "recommendations": string[]
  },
  "learningPath": {
    "focusAreas": string[],
    "topicSuggestions": string[],
    "nextSteps": string[]
  },
  "trophyInsights": {  // Add trophy-specific insights with enhanced trend data
    "currentLevel": string,
    "progressTrend": string,
    "progressTrendContext": string, // Add context about the trend
    "nextMilestone": string
  }
}

Here are the battle details: ${JSON.stringify(prompt, null, 2)}`,
        },
      ],
    })

    // Generate the opponent analysis with constraints awareness and pre-filled metrics
    const opponentResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert AI tutor and analyst. You'll analyze quiz battle performance data between two users and generate personalized, insightful, and constructive feedback for the second player (opponent).

IMPORTANT SYSTEM CONSTRAINTS:
1. Users are automatically assigned 5 questions of varying difficulty; they don't choose difficulty levels.
2. There is a strict 50-second time limit for the entire quiz.
3. There is a strict 2-minute time limit for reading the article.
4. Questions are randomly selected from a larger pool, so users may not see any questions of a particular difficulty level in a given challenge.

TROPHY SYSTEM INFORMATION:
The system uses trophies as a competitive ranking mechanism. Users gain or lose trophies based on wins and losses.
1. Trophy protection may be applied for losing players in certain situations:
   - Streak Protection: Protects trophies after a losing streak is broken
   - Activity Protection: Protects newer players from losing too many trophies early on
2. Trophy exchange represents skill level and achievement in the system
3. Users with higher trophy counts are typically more experienced or skilled

Your analysis should be compassionate and account for these system constraints. Never suggest that a user "should have attempted more/better/different questions" as this is not under their control. Instead, focus on their performance with what they were randomly given.

CRITICAL: If a user did not receive any questions of a particular difficulty level, DO NOT mention this as an area for growth or improvement. It's a system limitation, not a user performance issue.

The factual metrics have already been calculated and included. Your job is to generate the qualitative analysis and insights.`,
        },
        {
          role: 'user',
          content: `Generate a detailed, personalized analysis for the opponent in this knowledge battle based on their performance metrics and question responses.

IMPORTANT FACTS TO CONSIDER:
- Questions are randomly assigned to users from a pool
- Users have no control over question difficulty selection
- Time constraints are very strict (50 seconds for 5 questions)
- Reading time is capped at 2 minutes
- Trophy exchange reflects skill level and competitive progress

DIFFICULTY LEVELS PRESENT IN THIS QUIZ:
- Easy questions: ${opponentMetrics.difficultyPresence.easy ? 'YES' : 'NO'}
- Medium questions: ${opponentMetrics.difficultyPresence.medium ? 'YES' : 'NO'}
- Hard questions: ${opponentMetrics.difficultyPresence.hard ? 'YES' : 'NO'}

We've already calculated the following metrics:
- Reading time: ${opponentMetrics.performance.readingTime} seconds
- Quiz speed: ${opponentMetrics.performance.quizSpeed} seconds per question
- Final score: ${opponentMetrics.performance.finalScore}
- Reading speed percentile: ${opponentMetrics.performance.readingSpeedPercentile.toFixed(
            1,
          )}
${
  opponentMetrics.difficultyPresence.easy
    ? `- Performance on easy questions: ${opponentMetrics.questionTypePerformance.easyQuestions.toFixed(
        1,
      )}%`
    : '- No easy questions were assigned in this quiz'
}
${
  opponentMetrics.difficultyPresence.medium
    ? `- Performance on medium questions: ${opponentMetrics.questionTypePerformance.mediumQuestions.toFixed(
        1,
      )}%`
    : '- No medium questions were assigned in this quiz'
}
${
  opponentMetrics.difficultyPresence.hard
    ? `- Performance on hard questions: ${opponentMetrics.questionTypePerformance.hardQuestions.toFixed(
        1,
      )}%`
    : '- No hard questions were assigned in this quiz'
}

${
  opponentProfile.trophyData
    ? `TROPHY INFORMATION:
- Previous trophy count: ${opponentProfile.trophyData.previousTrophies}
- New trophy count: ${opponentProfile.trophyData.newTrophies}
- Trophy change: ${opponentProfile.trophyData.change}
- Enhanced trend: ${opponentProfile.trophyData.enhancedTrend}
- Trophy protection applied: ${
        opponentProfile.trophyData.protectionApplied ? 'YES' : 'NO'
      }
${
  opponentProfile.trophyData.protectionApplied
    ? `- Protection type: ${opponentProfile.trophyData.protectionType}`
    : ''
}`
    : '- Trophy data not available for this challenge'
}

${
  opponentProfile.trophyHistory && opponentProfile.trophyHistory.length > 0
    ? `TROPHY HISTORY INFORMATION:
- Recent trophy changes: ${opponentProfile.trophyHistory
        .slice(0, 5)
        .map(h => h.trophiesChange)
        .join(', ')}
- Enhanced trend analysis: ${
        opponentProfile.trophyData?.enhancedTrend || 'No data'
      }
- Consistency: ${
        opponentProfile.trophyHistory.filter(h => h.trophiesChange > 0).length >
          0 &&
        opponentProfile.trophyHistory.filter(h => h.trophiesChange < 0)
          .length === 0
          ? 'Consistently gaining trophies'
          : opponentProfile.trophyHistory.filter(h => h.trophiesChange < 0)
              .length > 0 &&
            opponentProfile.trophyHistory.filter(h => h.trophiesChange > 0)
              .length === 0
          ? 'Consistently losing trophies'
          : 'Mixed trophy results'
      }`
    : '- No trophy history available'
}

Your job is to provide qualitative analysis and insights based on these metrics and the detailed question-level data. Focus on identifying patterns, providing actionable recommendations, and creating a personalized learning path.

VERY IMPORTANT: Only analyze performance for question difficulties that were present in the quiz. Do not mention missing difficulty levels as an area for improvement or growth.

TROPHY ANALYSIS GUIDELINES:
- If the player won and gained trophies, emphasize their achievement and progress
- If the player lost but had protection, explain what the protection means and how it helped them
- For new players (typically lower trophy counts), provide more encouragement and basic tips
- For experienced players (higher trophy counts), provide more advanced strategic advice
- When analyzing trophy trends, use the enhanced trend data (Strongly Rising, Rising, etc.) to give context

KNOWLEDGE PATTERN METRICS SCORING GUIDELINES (All metrics should be scored 0-100):

1. Factual Recall (0-100):
   - Evaluate the user's ability to remember specific facts, dates, names, and direct information from the text
   - Score based on:
     * Accuracy on fact-based questions (70% of score)
     * Speed of answering factual questions (30% of score)
     * 100 = Perfect recall with rapid responses
     * 0 = Unable to recall basic facts

2. Technical Terms (0-100):
   - Evaluate the user's understanding of domain-specific terminology and concepts
   - Score based on:
     * Correct answers to questions featuring specialized vocabulary (80% of score)
     * Consistent performance on technical vs. general questions (20% of score)
     * 100 = Expert-level command of technical concepts
     * 0 = No grasp of specialized terminology

3. Strategic Analysis (0-100):
   - Evaluate the user's ability to connect concepts, infer relationships, and apply knowledge
   - Score based on:
     * Performance on questions requiring synthesis of multiple facts (50% of score)
     * Ability to identify cause-effect relationships (30% of score)
     * Time efficiency on complex questions (20% of score)
     * 100 = Sophisticated analytical thinking
     * 0 = Unable to make connections between related concepts

Ensure these scores reflect the user's actual performance on the questions they received, not theoretical ability. Be consistent in your scoring methodology.

The output must be a valid JSON object with the following structure:
{
  "performance": {
    "quizSpeedTrend": "improving" | "declining" | "consistent",
    "difficultyInsight": string,
    "trophyAnalysis": string  // Add insight about trophy performance
  },
  "analysis": {
    "strengths": string[],
    "weaknesses": string[],
    "knowledgePatterns": {
      "factualRecall": number,
      "technicalTerms": number,
      "strategicAnalysis": number
    },
    "recommendations": string[]
  },
  "learningPath": {
    "focusAreas": string[],
    "topicSuggestions": string[],
    "nextSteps": string[]
  },
  "trophyInsights": {  // Add trophy-specific insights with enhanced trend data
    "currentLevel": string,
    "progressTrend": string,
    "progressTrendContext": string, // Add context about the trend
    "nextMilestone": string
  }
}

Here are the battle details: ${JSON.stringify(prompt, null, 2)}`,
        },
      ],
    })

    // Use our new function to create the analyses
    const challengerAnalysis = JSON.parse(
      challengerResponse.choices[0].message.content,
    )
    const opponentAnalysis = JSON.parse(
      opponentResponse.choices[0].message.content,
    )

    // Generate the engagement content with trophy mentions (this remains AI-generated)
    const engagementResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.9, // Higher temperature for more creative outputs
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a witty, engaging AI host for educational battles. You'll create fun, motivational, and engaging content to wrap up a quiz battle between two users. Be creative and entertaining while still being educational and positive. Reference specific performance details and trophy exchanges from the battle.`,
        },
        {
          role: 'user',
          content: `Create engaging, fun content to wrap up this knowledge battle. Be witty, motivational, and interesting. Use the detailed question-level data and trophy exchanges to personalize your commentary. victoryMeme should be text only no links anywhere.

The battle includes trophy exchanges and enhanced trophy trends - reference this in your analysis. If a player had protection applied, mention this in a positive way. Use the enhanced trend data (Strongly Rising, Rising, etc.) to create more context-aware commentary.

The output must be a valid JSON object with the following structure:
{
  "victoryMeme": string,
  "competitiveTaunt": string,
  "wittyAnalysis": string,
  "difficultySpecificComment": string,
  "trophyComment": string,  // Add a comment about the trophy exchange
  "trophyTrendInsight": string, // Add insight about trophy trends over time
  "topicSuggestions": string[],
  "interestMetrics": {
    "victorMemeInterest": number,
    "competitiveTauntPreference": number,
    "wittyAnalysisPreference": number,
    "topicSuggestionsInterest": number,
    "trophyCommentInterest": number  // Add interest metric for trophy comments
  }
}

Here are the battle details: ${JSON.stringify(prompt, null, 2)}`,
        },
      ],
    })
    // Parse the JSON response
    const engagement = JSON.parse(engagementResponse.choices[0].message.content)

    // Create the complete analysis
    const analysisResult = {
      battleMetrics: {
        category: challenge.category,
        difficulty: difficulty,
        engagementScore: engagementScore,
        questionDifficultyDistribution: getQuestionDifficultyDistribution([
          ...challengerData.detailedResponses,
          ...opponentData.detailedResponses,
        ]),
        // Add trophy data to battle metrics
        trophyExchange: challenge.trophyUpdates
          ? {
              isTie: challenge.trophyUpdates.isTie,
              protectionApplied: protectionInfo,
            }
          : null,
      },
      challenger: {
        statistics: challengerData.stats,
        trophyData: challengerData.trophyData,

        // IMPORTANT: Directly include all performance metrics here instead of spreading
        // the AI analysis object which might be missing these fields
        performance: {
          readingTime: challengerData.readingTime,
          readingSpeedPercentile:
            challengerProfile.readingSpeedPercentile ||
            Math.max(
              0,
              Math.min(100, 100 - (challengerData.readingTime / 120) * 100),
            ),
          quizSpeed:
            challengerData.quizTimeSpent /
            Math.max(1, challengerData.totalQuestions),
          quizSpeedTrend:
            challengerAnalysis.performance?.quizSpeedTrend || 'consistent',
          finalScore: challengerData.score,
          hiddenWordTime: 0,
          difficultyInsight:
            challengerAnalysis.performance?.difficultyInsight ||
            'You handled questions at varying difficulty levels.',
          trophyAnalysis:
            challengerAnalysis.performance?.trophyAnalysis ||
            (challengerData.trophyData
              ? `Your trophy trend is ${
                  challengerData.trophyData.enhancedTrend
                }. ${
                  challengerData.trophyData.change > 0
                    ? `You gained ${challengerData.trophyData.change} trophies from this victory!`
                    : challengerData.trophyData.change < 0
                    ? `You lost ${Math.abs(
                        challengerData.trophyData.change,
                      )} trophies in this battle.`
                    : 'Your trophy count remained unchanged.'
                }`
              : 'No trophy data available for this challenge.'),
        },

        // Include the rest of the analysis data
        analysis: challengerAnalysis.analysis || {
          strengths: [
            'Good performance on factual questions',
            'Quick reading comprehension',
          ],
          weaknesses: ['Areas for improvement in technical terminology'],
          knowledgePatterns: {
            factualRecall: 70,
            technicalTerms: 60,
            strategicAnalysis: 65,
          },
          recommendations: [
            'Practice more in this category',
            'Focus on technical terms',
          ],
        },
        learningPath: challengerAnalysis.learningPath || {
          focusAreas: ['Technical vocabulary', 'Quick comprehension'],
          topicSuggestions: [
            `More about ${challenge.category}`,
            'Related concepts',
          ],
          nextSteps: [
            'Challenge yourself with more quizzes',
            'Review technical terms',
          ],
        },
        trophyInsights: challengerAnalysis.trophyInsights || {
          currentLevel: challengerData.trophyData
            ? challengerData.trophyData.newTrophies > 1500
              ? 'Advanced'
              : challengerData.trophyData.newTrophies > 1000
              ? 'Intermediate'
              : 'Beginner'
            : 'Beginner',
          progressTrend: challengerData.trophyData
            ? challengerData.trophyData.enhancedTrend ||
              (challengerData.trophyData.change > 0
                ? 'Rising'
                : challengerData.trophyData.change < 0
                ? 'Declining'
                : 'Stable')
            : 'Stable',
          progressTrendContext: challengerData.trophyData
            ? challengerData.trophyHistory &&
              challengerData.trophyHistory.length > 0
              ? `Based on your recent ${
                  challengerData.trophyHistory.length
                } matches, your trophy count is ${challengerData.trophyData.enhancedTrend.toLowerCase()}.`
              : 'This is based on your current match performance only.'
            : 'No trophy history available to analyze trends.',
          nextMilestone: challengerData.trophyData
            ? challengerData.trophyData.newTrophies < 1000
              ? 'Reach 1000 trophies'
              : challengerData.trophyData.newTrophies < 1500
              ? 'Reach 1500 trophies'
              : 'Reach 2000 trophies'
            : 'Reach 1000 trophies',
        },
      },
      opponent: {
        statistics: opponentData.stats,
        trophyData: opponentData.trophyData,

        // IMPORTANT: Directly include all performance metrics for opponent too
        performance: {
          readingTime: opponentData.readingTime,
          readingSpeedPercentile:
            opponentProfile.readingSpeedPercentile ||
            Math.max(
              0,
              Math.min(100, 100 - (opponentData.readingTime / 120) * 100),
            ),
          quizSpeed:
            opponentData.quizTimeSpent /
            Math.max(1, opponentData.totalQuestions),
          quizSpeedTrend:
            opponentAnalysis.performance?.quizSpeedTrend || 'consistent',
          finalScore: opponentData.score,
          hiddenWordTime: 0,
          difficultyInsight:
            opponentAnalysis.performance?.difficultyInsight ||
            'Your opponent handled questions at varying difficulty levels.',
          trophyAnalysis:
            opponentAnalysis.performance?.trophyAnalysis ||
            (opponentData.trophyData
              ? `Your opponent's trophy trend is ${
                  opponentData.trophyData.enhancedTrend
                }. ${
                  opponentData.trophyData.change > 0
                    ? `They gained ${opponentData.trophyData.change} trophies from this victory!`
                    : opponentData.trophyData.change < 0
                    ? `They lost ${Math.abs(
                        opponentData.trophyData.change,
                      )} trophies in this battle.`
                    : 'Their trophy count remained unchanged.'
                }`
              : 'No trophy data available for this challenge.'),
        },

        // Include the rest of the opponent analysis data
        analysis: opponentAnalysis.analysis || {
          strengths: [
            'Good performance on factual questions',
            'Quick reading comprehension',
          ],
          weaknesses: ['Areas for improvement in technical terminology'],
          knowledgePatterns: {
            factualRecall: 65,
            technicalTerms: 60,
            strategicAnalysis: 70,
          },
          recommendations: [
            'Practice more in this category',
            'Focus on technical terms',
          ],
        },
        learningPath: opponentAnalysis.learningPath || {
          focusAreas: ['Technical vocabulary', 'Quick comprehension'],
          topicSuggestions: [
            `More about ${challenge.category}`,
            'Related concepts',
          ],
          nextSteps: [
            'Challenge yourself with more quizzes',
            'Review technical terms',
          ],
        },
        trophyInsights: opponentAnalysis.trophyInsights || {
          currentLevel: opponentData.trophyData
            ? opponentData.trophyData.newTrophies > 1500
              ? 'Advanced'
              : opponentData.trophyData.newTrophies > 1000
              ? 'Intermediate'
              : 'Beginner'
            : 'Beginner',
          progressTrend: opponentData.trophyData
            ? opponentData.trophyData.enhancedTrend ||
              (opponentData.trophyData.change > 0
                ? 'Rising'
                : opponentData.trophyData.change < 0
                ? 'Declining'
                : 'Stable')
            : 'Stable',
          progressTrendContext: opponentData.trophyData
            ? opponentData.trophyHistory &&
              opponentData.trophyHistory.length > 0
              ? `Based on their recent ${
                  opponentData.trophyHistory.length
                } matches, their trophy count is ${opponentData.trophyData.enhancedTrend.toLowerCase()}.`
              : 'This is based on their current match performance only.'
            : 'No trophy history available to analyze trends.',
          nextMilestone: opponentData.trophyData
            ? opponentData.trophyData.newTrophies < 1000
              ? 'Reach 1000 trophies'
              : opponentData.trophyData.newTrophies < 1500
              ? 'Reach 1500 trophies'
              : 'Reach 2000 trophies'
            : 'Reach 1000 trophies',
        },
      },
      engagement: {
        winner: winnerId,
        ...engagement,
      },
    }

    return analysisResult
  } catch (error) {
    console.error('Error generating AI analysis with OpenAI:', error)

    // Fallback to simulated analysis if OpenAI fails
    console.log('Falling back to simulated analysis...')

    const analysisResult = {
      battleMetrics: {
        category: challenge.category,
        difficulty: difficulty,
        engagementScore: engagementScore,
        questionDifficultyDistribution: getQuestionDifficultyDistribution([
          ...challengerData.detailedResponses,
          ...opponentData.detailedResponses,
        ]),
        // Add trophy data to battle metrics
        trophyExchange: challenge.trophyUpdates
          ? {
              isTie: challenge.trophyUpdates.isTie,
              protectionApplied: challenge.trophyUpdates.protectionApplied,
            }
          : null,
      },
      challenger: {
        ...createUserAnalysisWithTrophyTrend(
          challengerData,
          opponentData,
          challenge.trophyUpdates?.challenger,
          challengerTrophyHistory,
        ),
        statistics: challengerData.stats,
        trophyData: challengerData.trophyData,
      },
      opponent: {
        ...createUserAnalysisWithTrophyTrend(
          opponentData,
          challengerData,
          challenge.trophyUpdates?.opponent,
          opponentTrophyHistory,
        ),
        statistics: opponentData.stats,
        trophyData: opponentData.trophyData,
      },
      engagement: {
        ...createEngagementContentWithTrends(
          challengerData,
          opponentData,
          winnerId,
          challenge.category,
          challenge.trophyUpdates,
          challengerTrophyHistory,
          opponentTrophyHistory,
        ),
        winner: winnerId,
      },
    }

    return analysisResult
  }
}

/**
 * Create a simulated user analysis with trophy trend data as fallback when OpenAI isn't available
 * @param {Object} userData - User data
 * @param {Object} opponentData - Opponent's data for comparison
 * @param {Object} trophyData - Trophy update data
 * @param {Array} trophyHistory - Trophy history data
 * @returns {Object} Simulated analysis
 */
const createUserAnalysisWithTrophyTrend = (
  userData,
  opponentData,
  trophyData,
  trophyHistory = [],
) => {
  // Calculate accuracy
  const accuracy =
    userData.totalQuestions > 0
      ? (userData.correctAnswers / userData.totalQuestions) * 100
      : 0

  // Determine speed rating based on average time per question
  const avgTimePerQuestion =
    userData.totalQuestions > 0
      ? userData.quizTimeSpent / userData.totalQuestions
      : 0

  let speedRating = 'consistent'
  if (avgTimePerQuestion < 5) {
    speedRating = 'improving'
  } else if (avgTimePerQuestion > 15) {
    speedRating = 'declining'
  }

  // Generate randomized but sensible knowledge pattern scores
  const factualRecall = Math.min(
    100,
    Math.max(0, accuracy + (Math.random() * 20 - 10)),
  )
  const technicalTerms = Math.min(
    100,
    Math.max(0, factualRecall - 10 + Math.random() * 20),
  )
  const strategicAnalysis = Math.min(
    100,
    Math.max(
      0,
      (factualRecall + technicalTerms) / 2 + (Math.random() * 20 - 10),
    ),
  )

  // Get enhanced trophy trend if available
  const enhancedTrend =
    userData.trophyData?.enhancedTrend ||
    (trophyHistory.length > 0
      ? calculateEnhancedTrophyTrend(
          userData.trophyData?.change || 0,
          trophyHistory,
        )
      : userData.trophyData?.change > 0
      ? 'Rising'
      : userData.trophyData?.change < 0
      ? 'Declining'
      : 'Stable')

  // Create trophy context based on history
  const trophyTrendContext =
    trophyHistory.length > 0
      ? `Based on ${
          trophyHistory.length
        } recent matches, showing a ${enhancedTrend.toLowerCase()} pattern.`
      : 'Based on current match only.'

  return {
    performance: {
      readingTime: userData.readingTime,
      readingSpeedPercentile: Math.random() * 100,
      quizSpeed: avgTimePerQuestion,
      quizSpeedTrend: speedRating,
      finalScore: userData.score,
      trophyAnalysis: userData.trophyData
        ? `Trophy trend is ${enhancedTrend}. ${
            userData.trophyData.change > 0
              ? `Gained ${userData.trophyData.change} trophies in this victory!`
              : userData.trophyData.change < 0
              ? `Lost ${Math.abs(
                  userData.trophyData.change,
                )} trophies in this battle.`
              : 'Trophy count unchanged.'
          } ${
            userData.trophyData.protectionApplied
              ? `Protected by ${userData.trophyData.protectionType} protection.`
              : ''
          }`
        : 'No trophy data available.',
    },
    analysis: {
      strengths: [
        'Shows good comprehension of main concepts',
        'Answers questions efficiently',
        'Strong in factual recall',
      ],
      weaknesses: [
        'May need more time on complex questions',
        'Could improve speed-accuracy balance',
        'Might benefit from broader knowledge in this category',
      ],
      knowledgePatterns: {
        factualRecall: factualRecall,
        technicalTerms: technicalTerms,
        strategicAnalysis: strategicAnalysis,
      },
      recommendations: [
        'Practice more quizzes in this category',
        'Focus on understanding technical terms',
        'Work on improving reading comprehension',
      ],
    },
    learningPath: {
      focusAreas: [
        'Technical vocabulary',
        'Quick comprehension',
        'Strategic thinking',
      ],
      topicSuggestions: [
        'Fundamentals of ' + userData.stats.bestCategory,
        'Advanced concepts in ' + userData.stats.bestCategory,
        'Related topics to expand knowledge breadth',
      ],
      nextSteps: [
        'Challenge yourself with harder quizzes',
        'Review technical terms in this subject area',
        'Practice timed reading exercises',
      ],
    },
    trophyInsights: {
      currentLevel: userData.trophyData
        ? userData.trophyData.newTrophies > 1500
          ? 'Advanced'
          : userData.trophyData.newTrophies > 1000
          ? 'Intermediate'
          : 'Beginner'
        : 'Beginner',
      progressTrend: enhancedTrend,
      progressTrendContext: trophyTrendContext,
      nextMilestone: userData.trophyData
        ? userData.trophyData.newTrophies < 1000
          ? 'Reach 1000 trophies'
          : userData.trophyData.newTrophies < 1500
          ? 'Reach 1500 trophies'
          : 'Reach 2000 trophies'
        : 'Reach 1000 trophies',
    },
  }
}

/**
 * Create simulated engagement content with trophy trends as fallback when OpenAI isn't available
 * @param {Object} challengerData - Challenger data
 * @param {Object} opponentData - Opponent data
 * @param {string|null} winnerId - ID of the winner (null for ties)
 * @param {string} category - Challenge category
 * @param {Object} trophyUpdates - Trophy update data
 * @param {Array} challengerHistory - Challenger's trophy history
 * @param {Array} opponentHistory - Opponent's trophy history
 * @returns {Object} Simulated engagement content
 */
const createEngagementContentWithTrends = (
  challengerData,
  opponentData,
  winnerId,
  category,
  trophyUpdates,
  challengerHistory = [],
  opponentHistory = [],
) => {
  // Determine if it's a tie
  const isTie = !winnerId && challengerData.score > 0 && opponentData.score > 0

  // Setup different engagement content based on outcome
  let victoryMeme,
    competitiveTaunt,
    wittyAnalysis,
    trophyComment,
    trophyTrendInsight

  if (isTie) {
    victoryMeme = "It's a tie! Two minds thinking alike!"
    competitiveTaunt =
      'You two are evenly matched! Ready for a rematch to break the tie?'
    wittyAnalysis =
      'What are the odds? You both showed equal knowledge prowess. Great minds think alike!'
    trophyComment = 'No trophies exchanged in this perfectly balanced match!'
    trophyTrendInsight = 'Both players maintain their current trophy rankings.'
  } else if (winnerId) {
    const winner =
      winnerId.toString() === challengerData.userId.toString()
        ? challengerData
        : opponentData
    const loser =
      winnerId.toString() === challengerData.userId.toString()
        ? opponentData
        : challengerData

    const winnerHistory =
      winnerId.toString() === challengerData.userId.toString()
        ? challengerHistory
        : opponentHistory

    const loserHistory =
      winnerId.toString() === challengerData.userId.toString()
        ? opponentHistory
        : challengerHistory

    const winnerTrend =
      winner.trophyData?.enhancedTrend ||
      (winnerHistory.length > 0
        ? calculateEnhancedTrophyTrend(
            winner.trophyData?.change || 0,
            winnerHistory,
          )
        : 'Rising')

    const loserTrend =
      loser.trophyData?.enhancedTrend ||
      (loserHistory.length > 0
        ? calculateEnhancedTrophyTrend(
            loser.trophyData?.change || 0,
            loserHistory,
          )
        : 'Declining')

    victoryMeme = `${winner.username} takes the crown! Knowledge victory achieved!`
    competitiveTaunt = `${loser.username}, ready for a rematch? Knowledge is power, and practice makes perfect!`
    wittyAnalysis = `${winner.username} showed impressive recall speed and accuracy. Every champion was once a contender that refused to give up!`

    trophyComment = trophyUpdates
      ? `${winner.username} gained ${Math.abs(
          winner.trophyData?.change || 0,
        )} trophies!${
          loser.trophyData?.protectionApplied
            ? ` ${loser.username} had ${loser.trophyData.protectionType} protection activated, preserving their trophy count!`
            : ` ${loser.username} lost ${Math.abs(
                loser.trophyData?.change || 0,
              )} trophies.`
        }`
      : 'Trophy exchange data not available.'

    trophyTrendInsight = `${
      winner.username
    }'s trophy count is ${winnerTrend.toLowerCase()}${
      winnerHistory.length > 0
        ? ` based on their last ${Math.min(5, winnerHistory.length)} matches.`
        : '.'
    } ${loser.username}'s trophy count is ${loserTrend.toLowerCase()}${
      loserHistory.length > 0
        ? ` based on their last ${Math.min(5, loserHistory.length)} matches.`
        : '.'
    }`
  } else {
    victoryMeme = 'Challenge incomplete! The knowledge quest awaits completion!'
    competitiveTaunt =
      'Finish what you started! Knowledge awaits the determined mind.'
    wittyAnalysis =
      'We have an unfinished battle! Remember, the quest for knowledge is a marathon, not a sprint.'
    trophyComment = 'Trophies await the conclusion of this challenge!'
    trophyTrendInsight =
      'Complete the challenge to see trophy progression trends.'
  }

  return {
    victoryMeme: victoryMeme,
    competitiveTaunt: competitiveTaunt,
    wittyAnalysis: wittyAnalysis,
    difficultySpecificComment: `This match featured questions in the ${category} category at ${
      challengerData.score > 120 || opponentData.score > 120
        ? 'a high'
        : challengerData.score < 60 && opponentData.score < 60
        ? 'a challenging'
        : 'a moderate'
    } difficulty level.`,
    trophyComment: trophyComment,
    trophyTrendInsight: trophyTrendInsight,
    topicSuggestions: [
      `More about ${category}`,
      `Advanced topics in ${category}`,
      `Historical perspectives on ${category}`,
      `Practical applications of ${category}`,
    ],
    interestMetrics: {
      victorMemeInterest: Math.random() * 100,
      competitiveTauntPreference: Math.random() * 100,
      wittyAnalysisPreference: Math.random() * 100,
      topicSuggestionsInterest: Math.random() * 100,
      trophyCommentInterest: Math.random() * 100,
    },
  }
}

/**
 * Generate AI analysis for a completed challenge with translation support
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {mongoose.ClientSession} [params.session] - Optional Mongoose session for transactions
 * @param {string} [params.preferredLanguage] - User's preferred language (en/hi)
 * @returns {Promise<Object>} The generated analysis document with translation if needed
 */
const generateChallengeAnalysisWithTranslation = async ({
  userId,
  challengeId,
  session,
  preferredLanguage = 'en',
}) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 10000))
    // First check if we already have an analysis
    let analysis = await QuickClashAnalysis.findOne({ challenge: challengeId })

    // If no analysis exists, generate a new one
    if (!analysis) {
      analysis = await generateChallengeAnalysis({ challengeId, session })
    }

    // If user prefers Hindi, ensure translation is complete
    if (preferredLanguage === 'hi') {
      // Check if translation is already done
      if (
        analysis.translationStatus !== 'completed' ||
        !analysis.hindiTranslation ||
        !analysis.hindiTranslation.challenger ||
        !analysis.hindiTranslation.challenger.analysis ||
        !analysis.hindiTranslation.challenger.analysis.strengths ||
        analysis.hindiTranslation.challenger.analysis.strengths.length === 0
      ) {
        console.log(
          'Hindi translation needed and not available - generating now',
        )

        // Do the translation synchronously before returning
        analysis = await translateAnalysisToHindi({ analysisId: analysis._id })
      }
    }
    return {
      _id: analysis._id,
      battleMetrics: analysis.battleMetrics,
      userAnalysis:
        analysis?.challenger?.userId?.toString() === userId.toString()
          ? analysis.challenger
          : analysis.opponent,
      opponentAnalysis:
        analysis?.challenger?.userId?.toString() === userId.toString()
          ? analysis.opponent
          : analysis.challenger,
      engagement: analysis.engagement,
      isWinner:
        analysis.engagement.winner &&
        analysis.engagement.winner.toString() === userId.toString(),
    }
  } catch (error) {
    console.error(
      'Error generating challenge analysis with translation:',
      error,
    )
    throw error
  }
}

/**
 * Get analysis for a specific user in a challenge, respecting language preference
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} User's analysis with the appropriate language
 */
const getUserChallengeAnalysisLocalized = async ({ challengeId, userId }) => {
  try {
    // Get user's language preference first
    const user = await User.findById(userId, 'userLanguage')
    const preferredLanguage = user?.userLanguage || 'en'

    // First check if analysis exists
    let analysis = await QuickClashAnalysis.findOne({ challenge: challengeId })

    if (!analysis) {
      // Generate analysis if it doesn't exist, passing the language preference
      return await generateChallengeAnalysisWithTranslation({
        challengeId,
        userId,
        preferredLanguage,
      })
    }

    // Check if Hindi is requested and translation is needed
    if (
      preferredLanguage === 'hi' &&
      (analysis.translationStatus !== 'completed' ||
        !analysis.hindiTranslation ||
        !analysis.hindiTranslation.challenger)
    ) {
      // Complete the translation synchronously
      analysis = await translateAnalysisToHindi({ analysisId: analysis._id })
    }

    // Determine if user is challenger or opponent
    const isChallenger =
      analysis.challenger.userId.toString() === userId.toString()

    // Create localized version of the analysis based on language preference
    if (preferredLanguage === 'hi' && analysis.hindiTranslation) {
      return {
        battleMetrics: analysis.battleMetrics,
        userAnalysis: isChallenger
          ? createLocalizedUserAnalysis(
              analysis.challenger,
              analysis.hindiTranslation.challenger,
            )
          : createLocalizedUserAnalysis(
              analysis.opponent,
              analysis.hindiTranslation.opponent,
            ),
        opponentAnalysis: isChallenger
          ? createLocalizedUserAnalysis(
              analysis.opponent,
              analysis.hindiTranslation.opponent,
            )
          : createLocalizedUserAnalysis(
              analysis.challenger,
              analysis.hindiTranslation.challenger,
            ),
        engagement: {
          ...analysis.engagement,
          ...(analysis.hindiTranslation.engagement || {}),
          winner: analysis.engagement.winner,
        },
        isWinner:
          analysis.engagement.winner &&
          analysis.engagement.winner.toString() === userId.toString(),
      }
    }

    // Return English version
    return {
      battleMetrics: analysis.battleMetrics,
      userAnalysis:
        analysis.challenger.userId.toString() === userId.toString()
          ? analysis.challenger
          : analysis.opponent,
      opponentAnalysis:
        analysis.challenger.userId.toString() === userId.toString()
          ? analysis.opponent
          : analysis.challenger,
      engagement: analysis.engagement,
      isWinner:
        analysis.engagement.winner &&
        analysis.engagement.winner.toString() === userId.toString(),
    }
  } catch (error) {
    console.error('Error fetching localized challenge analysis:', error)
    throw error
  }
}

/**
 * Helper function to create a localized version of user analysis by merging English and Hindi data
 * @param {Object} englishData - Original English analysis data
 * @param {Object} hindiData - Hindi translation data
 * @returns {Object} Merged analysis with Hindi text where available
 */
const createLocalizedUserAnalysis = (englishData, hindiData) => {
  if (!hindiData) return englishData

  return {
    ...englishData,
    performance: {
      ...englishData.performance,
      difficultyInsight:
        hindiData.performance?.difficultyInsight ||
        englishData.performance?.difficultyInsight,
    },
    analysis: {
      ...englishData.analysis,
      strengths:
        hindiData.analysis?.strengths || englishData.analysis?.strengths,
      weaknesses:
        hindiData.analysis?.weaknesses || englishData.analysis?.weaknesses,
      recommendations:
        hindiData.analysis?.recommendations ||
        englishData.analysis?.recommendations,
      // Keep numeric data from English version
      knowledgePatterns: englishData.analysis?.knowledgePatterns,
    },
    learningPath: {
      ...englishData.learningPath,
      focusAreas:
        hindiData.learningPath?.focusAreas ||
        englishData.learningPath?.focusAreas,
      topicSuggestions:
        hindiData.learningPath?.topicSuggestions ||
        englishData.learningPath?.topicSuggestions,
      nextSteps:
        hindiData.learningPath?.nextSteps ||
        englishData.learningPath?.nextSteps,
    },
    // Keep statistics from English version
    statistics: englishData.statistics,
  }
}

/**
 * Get enhanced response details with question-level data, handling shuffled options
 * @param {Object} session - Quiz session
 * @returns {Array} Enhanced response data with question details
 */
const getEnhancedResponseDetails = async session => {
  // Check if session has necessary data
  if (!session || !session.quizAttempt || !session.quizAttempt.responses) {
    return []
  }

  try {
    // Extract detailed data from sessions
    const responseDetails = []

    // Find the quiz to get original questions
    const quiz = await QuickClashQuiz.findById(session.quiz)

    if (!quiz || !quiz.questions) {
      return session.quizAttempt.responses // Return basic responses if quiz not found
    }

    // Get the answer mappings from the session
    const answerMappings = session.quizAttempt.answerMappings || {}
    const shuffledOptions = session.quizAttempt.shuffledOptions || {}
    const selectedQuestionIds = session.quizAttempt.selectedQuestionIds || []

    // Process each response and match with original question
    for (const response of session.quizAttempt.responses) {
      const questionId = response.questionId.toString()

      // Find the matching original question
      const originalQuestion = quiz.questions.find(
        q => q._id.toString() === questionId,
      )

      if (originalQuestion) {
        // Get the mapping for this question
        const mapping = answerMappings[questionId]
        const shuffledOpts = shuffledOptions[questionId]

        // Determine if the answer was correct based on the mapping
        let isCorrect = response.isCorrect

        // If we have a mapping, we need to check against the mapped answer
        if (mapping && mapping.newAnswer) {
          isCorrect = response.userAnswer === mapping.newAnswer
        }

        // Get the actual options that were presented to the user
        const presentedOptions = shuffledOpts || originalQuestion.options

        responseDetails.push({
          questionId: response.questionId,
          question: originalQuestion.question,
          difficulty: originalQuestion.difficulty,
          userAnswer: response.userAnswer,
          correctAnswer: mapping ? mapping.newAnswer : originalQuestion.answer,
          isCorrect: isCorrect,
          timeSpent: response.timeSpent || 0,
          // Categorize question difficulty
          difficultyLevel: categorizeDifficulty(originalQuestion.difficulty),
          // Check for fast response (potentially guessing)
          isPotentialGuess: response.timeSpent < 3 && !isCorrect,
          // Include the explanation if available
          explanation: originalQuestion.explanation || '',
        })
      } else {
        // Use basic response data if question not found
        responseDetails.push({
          questionId: response.questionId,
          userAnswer: response.userAnswer,
          isCorrect: response.isCorrect,
          timeSpent: response.timeSpent || 0,
          difficultyLevel: 'unknown',
          isPotentialGuess: response.timeSpent < 3 && !response.isCorrect,
          wasSelectedQuestion: selectedQuestionIds.includes(questionId),
        })
      }
    }

    // Sort by selectedQuestionIds order if available
    if (selectedQuestionIds.length > 0) {
      responseDetails.sort((a, b) => {
        const aIndex = selectedQuestionIds.indexOf(a.questionId.toString())
        const bIndex = selectedQuestionIds.indexOf(b.questionId.toString())

        // If both were selected questions, sort by their original order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }

        // Put selected questions first
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1

        // For non-selected questions, maintain original order
        return 0
      })
    }

    return responseDetails
  } catch (error) {
    console.error('Error getting enhanced response details:', error)
    return session.quizAttempt.responses || [] // Return basic responses on error
  }
}

/**
 * Categorize question difficulty level
 * @param {number} difficultyValue - Numeric difficulty score (0.01-0.99)
 * @returns {string} Difficulty category
 */
const categorizeDifficulty = difficultyValue => {
  const difficulty = parseFloat(difficultyValue)
  if (isNaN(difficulty)) return 'medium'

  if (difficulty < 0.5) return 'easy'
  if (difficulty >= 0.7) return 'hard'
  return 'medium'
}

/**
 * Get breakdown of question difficulty distribution
 * @param {Array} detailedResponses - Response details with difficulty info
 * @returns {Object} Distribution of question difficulties
 */
const getQuestionDifficultyBreakdown = detailedResponses => {
  const counts = {
    easy: 0,
    medium: 0,
    hard: 0,
    unknown: 0,
  }

  detailedResponses.forEach(response => {
    if (response.difficultyLevel) {
      counts[response.difficultyLevel]++
    } else {
      counts.unknown++
    }
  })

  return counts
}

/**
 * Get performance metrics broken down by question difficulty
 * @param {Array} detailedResponses - Response details with difficulty info
 * @returns {Object} Performance metrics by difficulty
 */
const getPerformanceByDifficulty = detailedResponses => {
  const performance = {
    easy: { total: 0, correct: 0, accuracy: 0 },
    medium: { total: 0, correct: 0, accuracy: 0 },
    hard: { total: 0, correct: 0, accuracy: 0 },
  }

  // Count correct/total for each difficulty
  detailedResponses.forEach(response => {
    const level = response.difficultyLevel || 'medium'
    if (level === 'unknown') return

    performance[level].total++
    if (response.isCorrect) {
      performance[level].correct++
    }
  })

  // Calculate accuracy percentages
  Object.keys(performance).forEach(level => {
    const { total, correct } = performance[level]
    performance[level].accuracy = total > 0 ? (correct / total) * 100 : 0
  })

  return performance
}

/**
 * Get time spent analysis by question difficulty
 * @param {Array} detailedResponses - Response details with difficulty and time info
 * @returns {Object} Time analysis by difficulty
 */
const getTimeByDifficulty = detailedResponses => {
  const timeAnalysis = {
    easy: { totalTime: 0, count: 0, avgTime: 0 },
    medium: { totalTime: 0, count: 0, avgTime: 0 },
    hard: { totalTime: 0, count: 0, avgTime: 0 },
  }

  // Sum time spent for each difficulty level
  detailedResponses.forEach(response => {
    const level = response.difficultyLevel || 'medium'
    if (level === 'unknown') return

    timeAnalysis[level].totalTime += response.timeSpent || 0
    timeAnalysis[level].count++
  })

  // Calculate average times
  Object.keys(timeAnalysis).forEach(level => {
    const { totalTime, count } = timeAnalysis[level]
    timeAnalysis[level].avgTime = count > 0 ? totalTime / count : 0
  })

  return timeAnalysis
}

/**
 * Get overall distribution of question difficulties
 * @param {Array} allResponses - All responses from both players
 * @returns {Object} Overall question difficulty distribution
 */
const getQuestionDifficultyDistribution = allResponses => {
  // Count questions by difficulty level
  const difficultyCounts = {
    easy: 0,
    medium: 0,
    hard: 0,
    unknown: 0,
  }

  // Create a Set to track unique question IDs
  const uniqueQuestionIds = new Set()

  // Group by question ID to avoid counting the same question twice
  allResponses.forEach(response => {
    if (
      response.questionId &&
      !uniqueQuestionIds.has(response.questionId.toString())
    ) {
      uniqueQuestionIds.add(response.questionId.toString())
      const level = response.difficultyLevel || 'unknown'
      difficultyCounts[level]++
    }
  })

  // Calculate percentages
  const total = Object.values(difficultyCounts).reduce(
    (sum, count) => sum + count,
    0,
  )

  const distribution = {
    counts: difficultyCounts,
    percentages: {},
  }

  if (total > 0) {
    Object.keys(difficultyCounts).forEach(level => {
      distribution.percentages[level] = (difficultyCounts[level] / total) * 100
    })
  }

  return distribution
}

/**
 * Get analysis for a specific user in a challenge
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} User's analysis
 */
const getUserChallengeAnalysis = async ({ challengeId, userId }) => {
  // First check if analysis exists
  const analysis = await QuickClashAnalysis.findOne({ challenge: challengeId })

  if (!analysis) {
    // Generate analysis if it doesn't exist
    return await generateChallengeAnalysis({ challengeId })
  }

  // Determine if user is challenger or opponent
  const isChallenger =
    analysis.challenger.userId.toString() === userId.toString()

  // Return full analysis with focus on the user's data
  return {
    battleMetrics: analysis.battleMetrics,
    userAnalysis: isChallenger ? analysis.challenger : analysis.opponent,
    opponentAnalysis: isChallenger ? analysis.opponent : analysis.challenger,
    engagement: analysis.engagement,
    isWinner:
      analysis.engagement.winner &&
      analysis.engagement.winner.toString() === userId.toString(),
  }
}

module.exports = {
  generateChallengeAnalysis,
  getUserChallengeAnalysis,
  generateChallengeAnalysisWithTranslation,
  getUserChallengeAnalysis,
  getUserChallengeAnalysisLocalized,
}
