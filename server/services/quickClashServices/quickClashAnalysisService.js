// services/quickClashServices/quickClashAnalysisService.js
const QuickClashAnalysis = require('../../model/quickClashSchemas/quickClashAnalysisSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const mongoose = require('mongoose')
const OpenAI = require('openai')
const User = require('../../model/userSchema')
const { translateAnalysisToHindi } = require('./quickClashTranslationService')

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
      throw new Error('Session data missing for one or both users')
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
 * @param {mongoose.ClientSession} params.session - Mongoose session
 * @returns {Promise<Object>} User statistics
 */
const getUserChallengeStats = async ({ userId, session }) => {
  // Get all completed challenges for this user
  const challenges = await QuickClashChallenge.find({
    $or: [
      { challenger: userId, status: 'completed' },
      { opponent: userId, status: 'completed' },
    ],
  }).session(session)

  // Calculate win rate
  let wins = 0
  let currentStreak = 0
  let categoryCounts = {}
  let timeOfDayCounts = {}

  // Sort challenges by creation date (newest first)
  challenges.sort((a, b) => b.createdAt - a.createdAt)

  for (const challenge of challenges) {
    const isChallenger = challenge.challenger.toString() === userId.toString()
    const userScore = isChallenger
      ? challenge.challengerScore
      : challenge.opponentScore
    const opponentScore = isChallenger
      ? challenge.opponentScore
      : challenge.challengerScore

    // Count wins and streaks
    if (userScore > opponentScore) {
      wins++

      // Only count for the current streak if it's consecutive
      if (
        currentStreak === 0 ||
        challenges.indexOf(challenge) ===
          challenges.indexOf(challenges[0]) + currentStreak
      ) {
        currentStreak++
      }
    } else {
      // Break the streak on loss
      if (challenges.indexOf(challenge) <= currentStreak) {
        break
      }
    }

    // Count categories
    if (challenge.category) {
      categoryCounts[challenge.category] =
        (categoryCounts[challenge.category] || 0) + 1
    }

    // Count time of day
    const hour = new Date(challenge.createdAt).getHours()
    const timeOfDay =
      hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
    timeOfDayCounts[timeOfDay] = (timeOfDayCounts[timeOfDay] || 0) + 1
  }

  // Calculate win rate
  const winRate = challenges.length > 0 ? (wins / challenges.length) * 100 : 0

  // Determine best category and peak performance time
  const bestCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
  const peakPerformanceTime =
    Object.entries(timeOfDayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'Afternoon'

  return {
    totalChallenges: challenges.length,
    wins,
    currentStreak,
    winRate,
    bestCategory,
    peakPerformanceTime,
  }
}

/**
 * Generate AI analysis for the challenge with enhanced question-level data
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

  // 2. Calculate engagement score with new formula
  const engagementScore = calculateEngagementScore()

  // 3. Determine difficulty level based on scores and time spent
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
    }

    const winnerUsername = winnerId
      ? winnerId.toString() === challengerData.userId.toString()
        ? challengerData.username
        : opponentData.username
      : null

    const isTie =
      !winnerId && challengerData.score > 0 && opponentData.score > 0

    // Compile the prompt for OpenAI
    const prompt = {
      category: challenge.category,
      battleContext: {
        category: challenge.category,
        difficulty: difficulty,
        winner: winnerUsername,
        isTie: isTie,
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

    // Now let's update the prompts to be explicit about which difficulty levels were present

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

Your job is to provide qualitative analysis and insights based on these metrics and the detailed question-level data. Focus on identifying patterns, providing actionable recommendations, and creating a personalized learning path.

VERY IMPORTANT: Only analyze performance for question difficulties that were present in the quiz. Do not mention missing difficulty levels as an area for improvement or growth.

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
    "difficultyInsight": string
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

Your job is to provide qualitative analysis and insights based on these metrics and the detailed question-level data. Focus on identifying patterns, providing actionable recommendations, and creating a personalized learning path.

VERY IMPORTANT: Only analyze performance for question difficulties that were present in the quiz. Do not mention missing difficulty levels as an area for improvement or growth.

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
    "difficultyInsight": string
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
  }
}

Here are the battle details: ${JSON.stringify(prompt, null, 2)}`,
        },
      ],
    })

    // When merging the metrics with the AI's analysis, also handle the question performance differently
    const createAnalysis = (metrics, qualitativeAnalysis) => {
      // Create a proper questionTypePerformance object with only the difficulties that were present
      const questionTypePerformance = {}

      if (metrics.difficultyPresence.easy) {
        questionTypePerformance.easyQuestions =
          metrics.questionTypePerformance.easyQuestions
      }

      if (metrics.difficultyPresence.medium) {
        questionTypePerformance.mediumQuestions =
          metrics.questionTypePerformance.mediumQuestions
      }

      if (metrics.difficultyPresence.hard) {
        questionTypePerformance.hardQuestions =
          metrics.questionTypePerformance.hardQuestions
      }

      return {
        performance: {
          ...metrics.performance,
          quizSpeedTrend: qualitativeAnalysis.performance.quizSpeedTrend,
          difficultyInsight: qualitativeAnalysis.performance.difficultyInsight,
        },
        analysis: {
          ...qualitativeAnalysis.analysis,
          knowledgePatterns: {
            ...qualitativeAnalysis.analysis.knowledgePatterns,
            questionTypePerformance,
          },
        },
        learningPath: qualitativeAnalysis.learningPath,
        // Include which difficulties were present for transparency
        difficultyLevelsPresent: metrics.difficultyPresence,
      }
    }

    // Use our new function to create the analyses
    const challengerAnalysis = createAnalysis(
      challengerMetrics,
      JSON.parse(challengerResponse.choices[0].message.content),
    )

    const opponentAnalysis = createAnalysis(
      opponentMetrics,
      JSON.parse(opponentResponse.choices[0].message.content),
    )

    // Generate the engagement content (this remains AI-generated)
    const engagementResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.9, // Higher temperature for more creative outputs
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a witty, engaging AI host for educational battles. You'll create fun, motivational, and engaging content to wrap up a quiz battle between two users. Be creative and entertaining while still being educational and positive. Reference specific performance details from the battle.`,
        },
        {
          role: 'user',
          content: `Create engaging, fun content to wrap up this knowledge battle. Be witty, motivational, and interesting. Use the detailed question-level data to personalize your commentary. victoryMeme should be text only no links anywhere.

      The output must be a valid JSON object with the following structure:
      {
        "victoryMeme": string,
        "competitiveTaunt": string,
        "wittyAnalysis": string,
        "difficultySpecificComment": string,
        "topicSuggestions": string[],
        "interestMetrics": {
          "victorMemeInterest": number,
          "competitiveTauntPreference": number,
          "wittyAnalysisPreference": number,
          "topicSuggestionsInterest": number
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
      },
      challenger: {
        statistics: challengerData.stats,
        ...challengerAnalysis,
      },
      opponent: {
        statistics: opponentData.stats,
        ...opponentAnalysis,
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
      },
      challenger: createUserAnalysis(challengerData, opponentData),
      opponent: createUserAnalysis(opponentData, challengerData),
      engagement: createEngagementContent(
        challengerData,
        opponentData,
        winnerId,
        challenge.category,
      ),
    }

    return analysisResult
  }
}

// services/quickClashServices/quickClashAnalysisService.js - Improved translation handling

/**
 * Generate AI analysis for a completed challenge with translation support
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {mongoose.ClientSession} [params.session] - Optional Mongoose session for transactions
 * @param {string} [params.preferredLanguage] - User's preferred language (en/hi)
 * @returns {Promise<Object>} The generated analysis document with translation if needed
 */
const generateChallengeAnalysisWithTranslation = async ({
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

    return analysis
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
 * Create a simulated user analysis as fallback when OpenAI isn't available
 * @param {Object} userData - User data
 * @param {Object} opponentData - Opponent's data for comparison
 * @returns {Object} Simulated analysis
 */
const createUserAnalysis = (userData, opponentData) => {
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

  return {
    performance: {
      readingTime: userData.readingTime,
      readingSpeedPercentile: Math.random() * 100,
      quizSpeed: avgTimePerQuestion,
      quizSpeedTrend: speedRating,
      finalScore: userData.score,
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
  }
}

/**
 * Create simulated engagement content as fallback when OpenAI isn't available
 * @param {Object} challengerData - Challenger data
 * @param {Object} opponentData - Opponent data
 * @param {string|null} winnerId - ID of the winner (null for ties)
 * @param {string} category - Challenge category
 * @returns {Object} Simulated engagement content
 */
const createEngagementContent = (
  challengerData,
  opponentData,
  winnerId,
  category,
) => {
  // Determine if it's a tie
  const isTie = !winnerId && challengerData.score > 0 && opponentData.score > 0

  // Setup different engagement content based on outcome
  let victoryMeme, competitiveTaunt, wittyAnalysis

  if (isTie) {
    victoryMeme = "It's a tie! Two minds thinking alike!"
    competitiveTaunt =
      'You two are evenly matched! Ready for a rematch to break the tie?'
    wittyAnalysis =
      'What are the odds? You both showed equal knowledge prowess. Great minds think alike!'
  } else if (winnerId) {
    const winner =
      winnerId.toString() === challengerData.userId.toString()
        ? challengerData
        : opponentData
    const loser =
      winnerId.toString() === challengerData.userId.toString()
        ? opponentData
        : challengerData

    victoryMeme = `${winner.username} takes the crown! Knowledge victory achieved!`
    competitiveTaunt = `${loser.username}, ready for a rematch? Knowledge is power, and practice makes perfect!`
    wittyAnalysis = `${winner.username} showed impressive recall speed and accuracy. Every champion was once a contender that refused to give up!`
  } else {
    victoryMeme = 'Challenge incomplete! The knowledge quest awaits completion!'
    competitiveTaunt =
      'Finish what you started! Knowledge awaits the determined mind.'
    wittyAnalysis =
      'We have an unfinished battle! Remember, the quest for knowledge is a marathon, not a sprint.'
  }

  return {
    victoryMeme: victoryMeme,
    competitiveTaunt: competitiveTaunt,
    wittyAnalysis: wittyAnalysis,
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
    },
  }
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
