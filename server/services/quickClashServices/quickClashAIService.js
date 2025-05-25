// services/quickClashServices/quickClashAIService.js
const { makeGPTRequest } = require('../../utils/openai')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const User = require('../../model/userSchema')
const QuickClashTeamBattleAnalysis = require('../../model/quickClashSchemas/quickClashTeamBattleAnalysisSchema')
const QuickClashTeamTrophyHistory = require('../../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
const QuickClashTrophyHistory = require('../../model/quickClashSchemas/quickClashTrophyHistorySchema')

/**
 * Generate AI battle recap and first follow-up question
 */
const generateBattleRecapAndQuestions = async (
  battleId,
  userId,
  existingAnalysisId = null,
  forceRefresh = false,
) => {
  try {
    // Check cache only if not forcing refresh
    if (!forceRefresh && existingAnalysisId) {
      const existingAnalysis = await QuickClashTeamBattleAnalysis.findById(
        existingAnalysisId,
      )
      if (
        existingAnalysis &&
        existingAnalysis.battleRecap &&
        existingAnalysis.followUpQuestions &&
        existingAnalysis.followUpQuestions.length > 0
      ) {
        const analysisAgeHours =
          (Date.now() - new Date(existingAnalysis.meta.generatedAt).getTime()) /
          (1000 * 60 * 60)

        if (analysisAgeHours < 4) {
          console.log(
            `Using cached analysis for battle ${battleId}, user ${userId}`,
          )
          return {
            battleRecap: existingAnalysis.battleRecap,
            followUpQuestions: existingAnalysis.followUpQuestions.filter(
              q => q.isActive,
            ),
            analysisId: existingAnalysis._id,
            questionProgression: existingAnalysis.questionProgression,
          }
        }
      }
    }

    console.log(
      `Generating new battle recap for battle ${battleId}, user ${userId}`,
    )

    // Fetch comprehensive battle data
    const battle = await QuickClashTeamBattle.findById(battleId)
      .populate('teamA', 'name avgTrophies formationInfo')
      .populate('teamB', 'name avgTrophies formationInfo')
      .populate(
        'teamAMembers.user',
        '_id name inGameName pic quickClashTrophies experienceLevel',
      )
      .populate(
        'teamBMembers.user',
        '_id name inGameName pic quickClashTrophies experienceLevel',
      )
      .populate({
        path: 'challenges.challenge',
        select:
          'category articleId challengerScore opponentScore status winner article',
      })

    if (!battle) {
      throw new Error('Battle not found')
    }

    const isTeamAMember = battle.teamAMembers.some(
      member => member.user._id.toString() === userId.toString(),
    )
    const userTeamKey = isTeamAMember ? 'teamA' : 'teamB'
    const opponentTeamKey = isTeamAMember ? 'teamB' : 'teamA'

    const userMemberData = battle[`${userTeamKey}Members`].find(
      m => m.user._id.toString() === userId.toString(),
    )

    if (!userMemberData) {
      throw new Error('User not in this battle')
    }

    const user = await User.findById(userId).select(
      'name inGameName quickClashTrophies experienceLevel stats',
    )

    // Get user's recent battle history for trend analysis
    const recentBattles = await QuickClashTeamTrophyHistory.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('teamBattle')

    // Calculate enhanced battle metrics
    const battleMetrics = calculateEnhancedBattleMetrics(
      battle,
      userTeamKey,
      userMemberData,
      recentBattles,
    )

    // Build comprehensive context for AI
    const battleContext = {
      battleId: battle._id.toString(),
      userTeamKey,
      userTeamName: battle[userTeamKey]?.name || 'Your Team',
      opponentTeamName: battle[opponentTeamKey]?.name || 'Opponent Team',
      battleResult:
        battle.winner === userTeamKey
          ? 'win'
          : battle.winner === 'tie'
          ? 'tie'
          : 'loss',

      userPerformance: {
        name: user.name || user.inGameName,
        score: userMemberData.score,
        completed: userMemberData.completed,
        category: userMemberData.category,
        trophyChange: userMemberData.trophyChange,
        contributionPercentage: battleMetrics.userContributionPercentage,
        performanceRating: battleMetrics.userPerformanceRating,
      },

      teamStats: {
        userTeam: battleMetrics.userTeamStats,
        opponentTeam: battleMetrics.opponentTeamStats,
      },

      keyHighlights: {
        teamSynergy: battleMetrics.teamSynergy,
        categoryBreakdown: battleMetrics.categoryAnalysis,
        wasComeback: battle.isComeback,
        allMatchesWon: battle.allMatchesWon,
        bonusesEarned: battle.trophyExchange?.bonuses || {},
      },

      battleFlow: battleMetrics.battleFlow,
    }

    const startTime = Date.now()
    const { recap, firstQuestion } = await getAIBattleRecapAndFirstQuestion(
      battleContext,
    )
    const generationTime = Date.now() - startTime

    // Save analysis with new structure
    const analysisDoc = await QuickClashTeamBattleAnalysis.findOneAndUpdate(
      { battle: battleId, user: userId },
      {
        battle: battleId,
        user: userId,
        teamMode: '4v4',
        userTeam: userTeamKey,
        battleRecap: recap,
        followUpQuestions: [
          {
            ...firstQuestion,
            questionIndex: 1,
            isActive: true,
          },
        ],
        questionProgression: {
          currentQuestionIndex: 1,
          totalQuestionsGenerated: 1,
          isComplete: false,
          battleContext: JSON.stringify(battleContext),
          conversationHistory: [],
        },
        trophyHistory: battleMetrics.trophyHistoryId,
        metrics: {
          userScore: userMemberData.score,
          teamAvgScore: battleMetrics.userTeamStats.avgScore,
          opponentAvgScore: battleMetrics.opponentTeamStats.avgScore,
          trophyChange: userMemberData.trophyChange,
          appliedBonuses: {
            firstDaily:
              battle.trophyExchange?.bonuses?.firstDaily?.applied || false,
            strongerTeam:
              battle.trophyExchange?.bonuses?.strongerTeam?.applied || false,
            comebackWin:
              battle.trophyExchange?.bonuses?.comebackWin?.applied || false,
            allWins: battle.trophyExchange?.bonuses?.allWins?.applied || false,
          },
          performanceRating: battleMetrics.userPerformanceRating,
          contributionPercentage: battleMetrics.userContributionPercentage,
        },
        meta: {
          generatedAt: new Date(),
          version: '3.1.0',
          openAIModel: 'gpt-4o-mini',
          generationTimeMs: generationTime,
          contextEnrichment: 'progressive_qa',
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    console.log(
      `Battle recap and first question generated for battle ${battleId} and user ${userId} in ${generationTime}ms`,
    )

    return {
      battleRecap: recap,
      followUpQuestions: [firstQuestion],
      analysisId: analysisDoc._id,
      questionProgression: analysisDoc.questionProgression,
    }
  } catch (error) {
    console.error('Error generating battle recap:', error)
    return getFallbackRecapAndQuestions()
  }
}

/**
 * Get AI-generated battle recap and first question
 */
const getAIBattleRecapAndFirstQuestion = async battleContext => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are "BattleSage AI", an advanced battle analyst for "Quick Clash".
Quick Clash is a 4v4 team news quiz game where strategy and quick thinking on specific articles are key.

Your task: Generate a personalized battle recap and the FIRST follow-up question only. This is part of a progressive Q&A system where questions will be generated one at a time based on user engagement.

Guidelines for the recap:
1. The "title" should be catchy (3-5 words).
2. The "content" must be very concise (2-3 short sentences, max ~50-70 words).
3. Highlight 1-2 key moments relevant to the user's performance.
4. End with a brief forward-looking statement.

Guidelines for the FIRST question:
1. Should be the most important/impactful question about this battle.
2. Focus on immediate tactical insights or key battle moments.
3. Make it engaging and relevant to their specific performance.
4. The question should naturally lead to deeper analysis in follow-up questions.

Output MUST be valid JSON:
{
  "recap": {
    "title": "Catchy 3-5 word battle title",
    "content": "Engaging recap (2-3 short sentences, ~50-70 words)",
    "mood": "victory | defeat | epic | close_call | learning_moment | comeback | dominant"
  },
  "firstQuestion": {
    "id": "q1",
    "question": "The most important question about this battle",
    "category": "tactical | strategic | psychological | improvement",
    "emoji": "⚔️ | 🎯 | 🧠 | 📈 | 💡 | 🔥 | 🤔",
    "preview": "Brief preview of what the answer will reveal (1 sentence)"
  }
}`,
      },
      {
        role: 'user',
        content: `Analyze this battle and create a recap with the first follow-up question:

        Battle Result: ${battleContext.battleResult.toUpperCase()}
        User Performance: ${battleContext.userPerformance.score} points
        User's Category: ${
          battleContext.userPerformance.category || 'None selected'
        }
        Trophy Change: ${battleContext.userPerformance.trophyChange}

        Team Performance:
        - Your team: ${battleContext.teamStats.userTeam.totalScore} points
        - Opponent: ${battleContext.teamStats.opponentTeam.totalScore} points

        Key Highlights:
        - Team synergy: ${battleContext.keyHighlights.teamSynergy.score}/100
        - Comeback victory: ${
          battleContext.keyHighlights.wasComeback ? 'Yes' : 'No'
        }
        - Perfect match: ${
          battleContext.keyHighlights.allMatchesWon ? 'Yes' : 'No'
        }`,
      },
    ]

    const response = await makeGPTRequest({
      messages,
      temperature: 0.85,
    })

    if (response && response.recap && response.firstQuestion) {
      const question = {
        id: response.firstQuestion.id || 'q1',
        question:
          response.firstQuestion.question ||
          'How can I improve my performance?',
        category: response.firstQuestion.category || 'improvement',
        emoji: response.firstQuestion.emoji || '💡',
        preview: response.firstQuestion.preview || 'Tap to discover insights',
        answered: false,
        answer: null,
      }

      return {
        recap: {
          title: response.recap.title || 'Battle Complete',
          content: response.recap.content || 'Your battle has been analyzed.',
          mood: response.recap.mood || 'learning_moment',
        },
        firstQuestion: question,
      }
    }

    return getFallbackRecapAndQuestions()
  } catch (error) {
    console.error('Error in AI recap generation:', error)
    return getFallbackRecapAndQuestions()
  }
}

/**
 * Generate next follow-up question based on previous context
 */
const generateNextQuestion = async ({
  analysisId,
  currentQuestionIndex,
  conversationHistory,
  battleContext,
}) => {
  try {
    if (currentQuestionIndex >= 3) {
      return null // No more questions
    }

    const nextQuestionIndex = currentQuestionIndex + 1
    const parsedBattleContext = JSON.parse(battleContext)

    const messages = [
      {
        role: 'system',
        content: `You are "BattleSage AI". Based on the previous conversation and battle context, generate the next logical follow-up question.

This is question ${nextQuestionIndex} of 3 in our progressive analysis system.

Guidelines:
1. Build upon previous questions and answers to go deeper
2. For question 2: Focus on strategic implications or team dynamics
3. For question 3: Focus on future improvement or advanced insights
4. Make each question more specific and actionable than the previous
5. Ensure natural conversation flow

Previous conversation context: ${JSON.stringify(conversationHistory)}

Output MUST be valid JSON:
{
  "question": {
    "id": "q${nextQuestionIndex}",
    "question": "Next logical question based on conversation flow",
    "category": "tactical | strategic | psychological | improvement",
    "emoji": "⚔️ | 🎯 | 🧠 | 📈 | 💡 | 🔥 | 🤔",
    "preview": "Brief preview of what this answer will reveal"
  }
}`,
      },
      {
        role: 'user',
        content: `Battle Context: ${battleContext}

Previous Conversation:
${conversationHistory.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n')}

Generate question ${nextQuestionIndex} that naturally follows from this conversation.`,
      },
    ]

    const response = await makeGPTRequest({
      messages,
      temperature: 0.8,
    })

    if (response && response.question) {
      return {
        id: response.question.id || `q${nextQuestionIndex}`,
        question: response.question.question,
        category: response.question.category || 'improvement',
        emoji: response.question.emoji || '💡',
        preview: response.question.preview || 'Tap to discover insights',
        answered: false,
        answer: null,
        questionIndex: nextQuestionIndex,
        isActive: true,
        generatedAt: new Date(),
      }
    }

    return null
  } catch (error) {
    console.error('Error generating next question:', error)
    return null
  }
}

/**
 * Generate answer for a follow-up question and potentially next question
 */
const generateFollowUpAnswer = async (
  battleId,
  userId,
  questionId,
  questionText,
) => {
  try {
    // Fetch the battle and analysis data
    const analysis = await QuickClashTeamBattleAnalysis.findOne({
      battle: battleId,
      user: userId,
    })

    if (!analysis) {
      throw new Error('Analysis not found')
    }

    const battle = await QuickClashTeamBattle.findById(battleId)
      .populate('teamA teamB')
      .populate('teamAMembers.user teamBMembers.user')
      .populate('challenges.challenge')

    const messages = [
      {
        role: 'system',
        content: `You are BattleSage AI, providing a CONCISE and insightful answer to a follow-up question about a "Quick Clash" team battle.

Your task: Provide a brief, specific, and actionable answer with typewriter-friendly formatting.

Guidelines:
1. The "content" MUST be very concise (1-2 short paragraphs, max ~60-80 words total).
2. Focus on 1-2 key insights or actionable tips.
3. "keyTakeaway" should be impactful (max 15 words).
4. "actionItem" should be practical and specific (max 15 words).
5. Use clear, engaging language that works well with typewriter effect.

Output must be valid JSON:
{
  "answer": {
    "content": "The concise and insightful answer text (60-80 words max).",
    "keyTakeaway": "Impactful one-sentence summary (max 15 words).",
    "actionItem": "Specific, practical suggestion for next time (max 15 words)."
  }
}`,
      },
      {
        role: 'user',
        content: `Question: ${questionText}

        Battle context:
        - User score: ${analysis.metrics.userScore}
        - Team average: ${analysis.metrics.teamAvgScore}
        - Performance rating: ${analysis.metrics.performanceRating}/100
        - Trophy change: ${analysis.metrics.trophyChange}
        - Battle result: ${
          battle.winner === analysis.userTeam
            ? 'Won'
            : battle.winner === 'tie'
            ? 'Tied'
            : 'Lost'
        }

        Provide an insightful answer that helps the user improve.`,
      },
    ]

    const response = await makeGPTRequest({
      messages,
      temperature: 0.7,
    })

    if (response && response.answer) {
      return {
        content: response.answer.content || 'Analysis complete.',
        keyTakeaway: response.answer.keyTakeaway || 'Keep practicing!',
        actionItem:
          response.answer.actionItem || 'Try a new strategy next time.',
      }
    }

    return {
      content:
        'Based on your battle performance, focus on consistency and team coordination.',
      keyTakeaway: 'Small improvements lead to big wins.',
      actionItem: 'Practice your weakest category before the next battle.',
    }
  } catch (error) {
    console.error('Error generating follow-up answer:', error)
    return {
      content: 'Unable to generate detailed analysis at this time.',
      keyTakeaway: 'Keep battling and learning!',
      actionItem: 'Review your battle stats for insights.',
    }
  }
}

const getFallbackRecapAndQuestions = () => ({
  battleRecap: {
    title: 'Battle Analysis Ready',
    content:
      'Your battle has been analyzed. Explore the insights below to improve your gameplay.',
    mood: 'learning_moment',
  },
  followUpQuestions: [
    {
      id: 'q1',
      question: 'What was the turning point in this battle?',
      category: 'tactical',
      emoji: '⚔️',
      preview: 'Discover the key moment that decided the outcome',
      answered: false,
      answer: null,
      questionIndex: 1,
      isActive: true,
    },
  ],
  questionProgression: {
    currentQuestionIndex: 1,
    totalQuestionsGenerated: 1,
    isComplete: false,
    battleContext: '',
    conversationHistory: [],
  },
})

// Helper functions (keeping existing implementations)
const calculateEnhancedBattleMetrics = (
  battle,
  userTeamKey,
  userMemberData,
  recentBattles,
) => {
  // Implementation remains the same as in original file
  // ... (keeping all the existing helper functions)

  const userTeamMembers = battle[`${userTeamKey}Members`]
  const opponentTeamMembers =
    battle[userTeamKey === 'teamA' ? 'teamBMembers' : 'teamAMembers']

  const userTeamStats = calculateTeamStats(userTeamMembers)
  const opponentTeamStats = calculateTeamStats(opponentTeamMembers)

  const userContributionPercentage =
    (userMemberData.score / Math.max(1, userTeamStats.totalScore)) * 100

  const userPerformanceRating = calculatePerformanceRating(
    userMemberData,
    userTeamStats.avgScore,
  )

  const categoryAnalysis = analyzeCategoryPerformance(
    battle,
    userTeamKey,
    userMemberData,
  )

  const teamSynergy = calculateTeamSynergy(userTeamMembers)
  const battleFlow = analyzeBattleFlow(battle, userTeamKey)

  return {
    userTeamStats,
    opponentTeamStats,
    userContributionPercentage,
    userPerformanceRating,
    categoryAnalysis,
    teamSynergy,
    battleFlow,
    trophyHistoryId: recentBattles[0]?._id || null,
  }
}

const calculateTeamStats = members => {
  const totalScore = members.reduce((sum, m) => sum + m.score, 0)
  const avgScore = totalScore / Math.max(1, members.length)
  const completionRate =
    members.filter(m => m.completed).length / members.length
  const participationRate =
    members.filter(m => m.participated).length / members.length

  return {
    totalScore,
    avgScore,
    completionRate,
    participationRate,
    memberCount: members.length,
  }
}

const calculatePerformanceRating = (memberData, teamAvgScore) => {
  const scoreRatio = memberData.score / Math.max(1, teamAvgScore)
  const completionBonus = memberData.completed ? 1.2 : 0.8

  return Math.min(100, Math.round(scoreRatio * completionBonus * 50))
}

const analyzeCategoryPerformance = (battle, userTeamKey, userMemberData) => {
  const userChallenge = battle.challenges.find(
    c =>
      (userTeamKey === 'teamA' &&
        c.teamAPlayer?.toString() === userMemberData.user._id.toString()) ||
      (userTeamKey === 'teamB' &&
        c.teamBPlayer?.toString() === userMemberData.user._id.toString()),
  )

  if (!userChallenge) {
    return { played: false }
  }

  const userScore =
    userTeamKey === 'teamA'
      ? userChallenge.teamAScore
      : userChallenge.teamBScore
  const opponentScore =
    userTeamKey === 'teamA'
      ? userChallenge.teamBScore
      : userChallenge.teamAScore

  return {
    played: true,
    category: userChallenge.category,
    userScore,
    opponentScore,
    margin: userScore - opponentScore,
    result:
      userScore > opponentScore
        ? 'won'
        : userScore < opponentScore
        ? 'lost'
        : 'tied',
  }
}

const calculateTeamSynergy = members => {
  const scoreVariance = calculateVariance(members.map(m => m.score))
  const completionSync =
    members.filter(m => m.completed).length / members.length

  const synergyScore = (1 - scoreVariance / 1000) * completionSync * 100

  return {
    score: Math.max(0, Math.min(100, synergyScore)),
    variance: scoreVariance,
    completionSync: (completionSync * 100).toFixed(1),
  }
}

const calculateVariance = numbers => {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
  const variance =
    numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) /
    numbers.length
  return variance
}

const analyzeBattleFlow = (battle, userTeamKey) => {
  const challenges = battle.challenges
  let momentum = []
  let currentMomentum = 0

  challenges.forEach((challenge, index) => {
    if (challenge.winner === userTeamKey) {
      currentMomentum++
    } else if (challenge.winner && challenge.winner !== 'tie') {
      currentMomentum--
    }
    momentum.push({ round: index + 1, momentum: currentMomentum })
  })

  const maxMomentum = Math.max(...momentum.map(m => m.momentum))
  const minMomentum = Math.min(...momentum.map(m => m.momentum))
  const finalMomentum = currentMomentum

  return {
    momentum,
    maxMomentum,
    minMomentum,
    finalMomentum,
    wasComeback: minMomentum < -1 && finalMomentum > 0,
    wasDominant: minMomentum >= 0 && maxMomentum >= 2,
  }
}

module.exports = {
  generateBattleInsights: generateBattleRecapAndQuestions,
  generateFollowUpAnswer,
  generateNextQuestion,
}
