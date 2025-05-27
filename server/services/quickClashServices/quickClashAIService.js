// services/quickClashServices/quickClashAIService.js
const { makeGPTRequest } = require('../../utils/openai')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const User = require('../../model/userSchema')
const QuickClashTeamBattleAnalysis = require('../../model/quickClashSchemas/quickClashTeamBattleAnalysisSchema')
const QuickClashTeamTrophyHistory = require('../../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')

// Question templates with data placeholders for experienced users (AI-answerable format)
const QUESTION_TEMPLATES = {
  categorySelection: [
    {
      id: 'category_comfort_zone',
      template:
        "You've picked {{category}} {{percentage}}% of the time but your win rate there is only {{winRate}}% - what does this pattern suggest about diversification strategy?",
      category: 'tactical',
      emoji: '🎯',
      preview: 'Analyzing category selection efficiency and optimization',
      requiresData: ['userCategoryStats', 'userWinRates'],
    },
    {
      id: 'category_avoidance',
      template:
        '{{category}} shows your lowest pick frequency ({{percentage}}%) yet highest average score ({{avgScore}} points) - what opportunity is being missed?',
      category: 'strategic',
      emoji: '💎',
      preview: 'Identifying underutilized strength categories',
      requiresData: ['userCategoryStats', 'userScoresByCategory'],
    },
    {
      id: 'category_weekend_pattern',
      template:
        'Your {{category}} selection increases {{percentage}}% on weekends versus weekdays - what does this timing pattern reveal?',
      category: 'tactical',
      emoji: '📅',
      preview: 'Analyzing temporal performance patterns',
      requiresData: ['timingPatterns', 'categoryFrequency'],
    },
  ],

  performance: [
    {
      id: 'time_performance',
      template:
        'Your record shows {{winRecord}} in morning battles versus {{lossRecord}} at night - what factors explain this timing disparity?',
      category: 'psychological',
      emoji: '⏰',
      preview: 'Analyzing circadian performance patterns',
      requiresData: ['timingPerformance'],
    },
    {
      id: 'reading_vs_performance',
      template:
        'You spent {{userReadTime}} minutes reading while teammates used {{teammateReadTime}} seconds, yet they outscored you - what does this efficiency gap indicate?',
      category: 'improvement',
      emoji: '📚',
      preview: 'Evaluating reading strategy effectiveness',
      requiresData: ['readingTimeComparison', 'scoreComparison'],
    },
    {
      id: 'streak_analysis',
      template:
        'Your {{streakLength}}-game winning streak coincided with exclusively choosing {{categories}} - what does this correlation reveal?',
      category: 'strategic',
      emoji: '🔥',
      preview: 'Understanding winning pattern mechanics',
      requiresData: ['streakData', 'categoryDuringStreak'],
    },
  ],

  teamDynamics: [
    {
      id: 'pick_order_impact',
      template:
        'First-pick battles yield {{firstPickWinRate}}% wins versus {{thirdPickWinRate}}% when picking third - what explains this positional advantage?',
      category: 'tactical',
      emoji: '🎲',
      preview: 'Analyzing pick order impact on success rates',
      requiresData: ['pickOrderStats'],
    },
    {
      id: 'trophy_pressure',
      template:
        "Teams where you're highest-trophy player win {{highTrophyWinRate}}% versus {{lowTrophyWinRate}}% as lowest - how does expectation pressure affect performance?",
      category: 'psychological',
      emoji: '👑',
      preview: 'Examining leadership pressure dynamics',
      requiresData: ['trophyRolePerformance'],
    },
    {
      id: 'category_conflict',
      template:
        'Your scores drop {{pointDrop}} points when teammates select your preferred categories - what adaptation strategy would counter this conflict?',
      category: 'improvement',
      emoji: '⚔️',
      preview: 'Developing conflict resolution tactics',
      requiresData: ['categoryConflictImpact'],
    },
  ],

  momentum: [
    {
      id: 'tilt_recovery',
      template:
        'Post-loss performance drops {{percentage}}% in subsequent battles - what mental reset techniques could break this tilt pattern?',
      category: 'psychological',
      emoji: '🌊',
      preview: 'Analyzing tilt recovery mechanisms',
      requiresData: ['postLossPerformance'],
    },
    {
      id: 'rebound_effect',
      template:
        'Your peak score ({{bestScore}} points) followed your worst performance ({{worstScore}} points) - what psychological factors enable this rebound pattern?',
      category: 'psychological',
      emoji: '📈',
      preview: 'Understanding resilience and comeback mechanics',
      requiresData: ['extremeScorePatterns'],
    },
  ],
}

// NEW: Beginner questions for users with limited history (AI-answerable format)
const BEGINNER_QUESTION_TEMPLATES = {
  currentBattle: [
    {
      id: 'first_category_choice',
      template:
        'You chose {{category}} and scored {{score}} points - what does this performance reveal about your knowledge strengths?',
      category: 'improvement',
      emoji: '🎯',
      preview: 'Analyzing your category selection and performance',
      requiresData: ['currentBattleData'],
    },
    {
      id: 'team_vs_solo',
      template:
        "You contributed {{contributionPercent}}% of your team's total points - what does this say about your readiness for team battles?",
      category: 'tactical',
      emoji: '👥',
      preview: 'Evaluating your team contribution and impact',
      requiresData: ['currentBattleData'],
    },
    {
      id: 'performance_vs_expectations',
      template:
        'Your {{score}}-point performance in {{category}} - what strategy adjustments would optimize future results?',
      category: 'psychological',
      emoji: '🤔',
      preview: 'Analyzing performance patterns for improvement',
      requiresData: ['currentBattleData'],
    },
  ],

  earlyPatterns: [
    {
      id: 'early_category_preference',
      template:
        "You've explored {{categoryCount}} different categories across {{battleCount}} battles - what specialization strategy would maximize your growth?",
      category: 'strategic',
      emoji: '🧭',
      preview: 'Determining optimal specialization path',
      requiresData: ['earlyPatternData'],
    },
    {
      id: 'learning_curve',
      template:
        'Your scores improved from {{firstScore}} to {{recentScore}} points - what factors are driving this improvement trend?',
      category: 'improvement',
      emoji: '📈',
      preview: 'Identifying key learning accelerators',
      requiresData: ['earlyPatternData'],
    },
    {
      id: 'comfort_zone_exploration',
      template:
        "Your preference for {{preferredCategories}} is evident - what's the optimal balance between comfort and exploration?",
      category: 'strategic',
      emoji: '🚀',
      preview: 'Balancing specialization with growth opportunities',
      requiresData: ['earlyPatternData'],
    },
  ],
}

// Context builders for different question types
const CONTEXT_BUILDERS = {
  userCategoryStats: (battleData, userHistory) => {
    // Build category frequency and performance stats
    const categoryStats = {}
    userHistory.forEach(battle => {
      const userMember = getUserMemberFromBattle(battle, battleData.userId)
      if (userMember && userMember.category) {
        if (!categoryStats[userMember.category]) {
          categoryStats[userMember.category] = {
            picks: 0,
            wins: 0,
            totalScore: 0,
          }
        }
        categoryStats[userMember.category].picks++
        categoryStats[userMember.category].totalScore += userMember.score || 0
        if (battle.winner === battleData.userTeam) {
          categoryStats[userMember.category].wins++
        }
      }
    })
    return categoryStats
  },

  timingPerformance: (battleData, userHistory) => {
    const timeSlots = {
      morning: { wins: 0, total: 0 },
      afternoon: { wins: 0, total: 0 },
      evening: { wins: 0, total: 0 },
      night: { wins: 0, total: 0 },
    }

    userHistory.forEach(battle => {
      const hour = new Date(battle.createdAt).getHours()
      let timeSlot
      if (hour >= 6 && hour < 12) timeSlot = 'morning'
      else if (hour >= 12 && hour < 17) timeSlot = 'afternoon'
      else if (hour >= 17 && hour < 21) timeSlot = 'evening'
      else timeSlot = 'night'

      timeSlots[timeSlot].total++
      if (battle.winner === battleData.userTeam) {
        timeSlots[timeSlot].wins++
      }
    })

    return timeSlots
  },

  pickOrderStats: (battleData, userHistory) => {
    const pickOrderStats = {}
    userHistory.forEach(battle => {
      const userMember = getUserMemberFromBattle(battle, battleData.userId)
      if (userMember && userMember.pickOrder) {
        if (!pickOrderStats[userMember.pickOrder]) {
          pickOrderStats[userMember.pickOrder] = { wins: 0, total: 0 }
        }
        pickOrderStats[userMember.pickOrder].total++
        if (battle.winner === battleData.userTeam) {
          pickOrderStats[userMember.pickOrder].wins++
        }
      }
    })
    return pickOrderStats
  },
}

// Enhanced context builders for new users
const BEGINNER_CONTEXT_BUILDERS = {
  currentBattleData: battleData => {
    const userScore = battleData.userMemberData?.score || 0
    const teamTotalScore =
      battleData.userTeamKey === 'teamA'
        ? battleData.battle?.teamATotalScore || 0
        : battleData.battle?.teamBTotalScore || 0

    return {
      category: battleData.userMemberData?.category || 'Unknown',
      score: userScore,
      contributionPercent:
        teamTotalScore > 0 ? Math.round((userScore / teamTotalScore) * 100) : 0,
      battleResult: battleData.battleResult,
      trophyChange: battleData.userMemberData?.trophyChange || 0,
    }
  },

  earlyPatternData: (battleData, userHistory) => {
    const categories = new Set()
    let totalScore = 0
    let firstBattleScore = 0
    let recentBattleScore = 0

    userHistory.forEach((battle, index) => {
      const userMember = getUserMemberFromBattle(battle, battleData.userId)
      if (userMember) {
        categories.add(userMember.category)
        totalScore += userMember.score || 0

        if (index === userHistory.length - 1) {
          // First battle (oldest)
          firstBattleScore = userMember.score || 0
        }
        if (index === 0) {
          // Most recent battle
          recentBattleScore = userMember.score || 0
        }
      }
    })

    // Add current battle data
    categories.add(battleData.userMemberData?.category)

    const allCategories = [
      'Technology',
      'Sports',
      'Politics',
      'Business',
      'Science',
      'History',
      'Entertainment',
      'Current Events',
    ]
    const triedCategories = Array.from(categories).filter(
      c => c && c !== 'Unknown',
    )
    const untriedCategories = allCategories.filter(
      c => !triedCategories.includes(c),
    )

    return {
      battleCount: userHistory.length + 1, // +1 for current battle
      categoryCount: triedCategories.length,
      preferredCategories:
        triedCategories.slice(0, 2).join(' and ') || 'various topics',
      unexploredCategories:
        untriedCategories.slice(0, 2).join(' and ') || 'new areas',
      firstScore: firstBattleScore,
      recentScore: recentBattleScore,
      avgScore: Math.round(totalScore / Math.max(userHistory.length, 1)),
    }
  },
}

// Helper function to get user member data from battle
const getUserMemberFromBattle = (battle, userId) => {
  const teamAMember = battle.teamAMembers?.find(
    m => m.user?.toString() === userId.toString(),
  )
  const teamBMember = battle.teamBMembers?.find(
    m => m.user?.toString() === userId.toString(),
  )
  return teamAMember || teamBMember
}

// Determine user experience level and select appropriate questions
const selectRelevantQuestions = async (battleData, userHistory) => {
  const relevantQuestions = []
  const historyLength = userHistory.length

  try {
    // NEW USER (0-2 battles): Focus on current battle and first impressions
    if (historyLength <= 2) {
      console.log(
        `New user detected (${historyLength} battles) - using beginner questions`,
      )

      const currentBattleData =
        BEGINNER_CONTEXT_BUILDERS.currentBattleData(battleData)

      // Question 1: Always ask about current battle experience
      relevantQuestions.push({
        template: BEGINNER_QUESTION_TEMPLATES.currentBattle[0],
        data: currentBattleData,
      })

      // Question 2: Team dynamics for new players
      if (currentBattleData.contributionPercent > 0) {
        relevantQuestions.push({
          template: BEGINNER_QUESTION_TEMPLATES.currentBattle[1],
          data: currentBattleData,
        })
      }

      // Question 3: Expectation vs reality
      relevantQuestions.push({
        template: BEGINNER_QUESTION_TEMPLATES.currentBattle[2],
        data: currentBattleData,
      })

      return relevantQuestions.slice(0, 3)
    }

    // EARLY USER (3-9 battles): Focus on emerging patterns and learning
    if (historyLength <= 9) {
      console.log(
        `Early user detected (${historyLength} battles) - using early pattern questions`,
      )

      const earlyPatternData = BEGINNER_CONTEXT_BUILDERS.earlyPatternData(
        battleData,
        userHistory,
      )

      // Question 1: Category exploration
      if (earlyPatternData.categoryCount >= 2) {
        relevantQuestions.push({
          template: BEGINNER_QUESTION_TEMPLATES.earlyPatterns[0],
          data: earlyPatternData,
        })
      }

      // Question 2: Learning curve
      if (earlyPatternData.recentScore > earlyPatternData.firstScore) {
        relevantQuestions.push({
          template: BEGINNER_QUESTION_TEMPLATES.earlyPatterns[1],
          data: earlyPatternData,
        })
      }

      // Question 3: Comfort zone vs exploration
      if (earlyPatternData.categoryCount < 5) {
        relevantQuestions.push({
          template: BEGINNER_QUESTION_TEMPLATES.earlyPatterns[2],
          data: earlyPatternData,
        })
      }

      // Fill with current battle questions if needed
      if (relevantQuestions.length < 2) {
        const currentBattleData =
          BEGINNER_CONTEXT_BUILDERS.currentBattleData(battleData)
        relevantQuestions.push({
          template: BEGINNER_QUESTION_TEMPLATES.currentBattle[0],
          data: currentBattleData,
        })
      }

      return relevantQuestions.slice(0, 3)
    }

    // EXPERIENCED USER (10+ battles): Use original pattern-based questions
    console.log(
      `Experienced user detected (${historyLength} battles) - using pattern-based questions`,
    )

    const userStats = {
      categoryStats: CONTEXT_BUILDERS.userCategoryStats(
        battleData,
        userHistory,
      ),
      timingPerformance: CONTEXT_BUILDERS.timingPerformance(
        battleData,
        userHistory,
      ),
      pickOrderStats: CONTEXT_BUILDERS.pickOrderStats(battleData, userHistory),
    }

    // Question 1: Category selection patterns
    const categoryEntries = Object.entries(userStats.categoryStats)
    if (categoryEntries.length > 0) {
      const mostPickedCategory = categoryEntries.reduce((a, b) =>
        userStats.categoryStats[a[0]].picks >
        userStats.categoryStats[b[0]].picks
          ? a
          : b,
      )

      const winRate =
        (mostPickedCategory[1].wins / mostPickedCategory[1].picks) * 100

      if (mostPickedCategory[1].picks >= 3 && winRate < 60) {
        relevantQuestions.push({
          template: QUESTION_TEMPLATES.categorySelection[0],
          data: {
            category: mostPickedCategory[0],
            percentage: Math.round(
              (mostPickedCategory[1].picks / userHistory.length) * 100,
            ),
            winRate: Math.round(winRate),
          },
        })
      }
    }

    // Question 2: Timing patterns
    const timingStats = userStats.timingPerformance
    const morningWinRate =
      timingStats.morning.total > 0
        ? (timingStats.morning.wins / timingStats.morning.total) * 100
        : 0
    const nightWinRate =
      timingStats.night.total > 0
        ? (timingStats.night.wins / timingStats.night.total) * 100
        : 0

    if (
      Math.abs(morningWinRate - nightWinRate) > 20 &&
      timingStats.morning.total >= 3 &&
      timingStats.night.total >= 3
    ) {
      relevantQuestions.push({
        template: QUESTION_TEMPLATES.performance[0],
        data: {
          winRecord: `${timingStats.morning.wins}-${
            timingStats.morning.total - timingStats.morning.wins
          }`,
          lossRecord: `${timingStats.night.wins}-${
            timingStats.night.total - timingStats.night.wins
          }`,
        },
      })
    }

    // Question 3: Team dynamics
    const pickStats = userStats.pickOrderStats
    if (pickStats[1] && pickStats[3]) {
      const firstPickWinRate = Math.round(
        (pickStats[1].wins / pickStats[1].total) * 100,
      )
      const thirdPickWinRate = Math.round(
        (pickStats[3].wins / pickStats[3].total) * 100,
      )

      if (Math.abs(firstPickWinRate - thirdPickWinRate) > 15) {
        relevantQuestions.push({
          template: QUESTION_TEMPLATES.teamDynamics[0],
          data: {
            firstPickWinRate,
            thirdPickWinRate,
          },
        })
      }
    }

    // Fill with beginner questions if not enough pattern-based questions found
    if (relevantQuestions.length < 2) {
      const currentBattleData =
        BEGINNER_CONTEXT_BUILDERS.currentBattleData(battleData)
      relevantQuestions.push({
        template: BEGINNER_QUESTION_TEMPLATES.currentBattle[0],
        data: currentBattleData,
      })
    }

    return relevantQuestions.slice(0, 3)
  } catch (error) {
    console.error('Error selecting relevant questions:', error)
    // Fallback to beginner questions on error
    const currentBattleData =
      BEGINNER_CONTEXT_BUILDERS.currentBattleData(battleData)
    return [
      {
        template: BEGINNER_QUESTION_TEMPLATES.currentBattle[0],
        data: currentBattleData,
      },
    ]
  }
}

// Fallback questions if analysis fails - always use beginner-friendly questions
const getDefaultQuestions = battleData => {
  const currentBattleData =
    BEGINNER_CONTEXT_BUILDERS.currentBattleData(battleData)
  return [
    {
      template: BEGINNER_QUESTION_TEMPLATES.currentBattle[0],
      data: currentBattleData,
    },
  ]
}

// Generate questions with specific context (cost-effective)
const generateSpecificQuestion = async (questionData, battleContext) => {
  try {
    const { template, data } = questionData

    // Fill template with actual data
    let questionText = template.template
    Object.keys(data).forEach(key => {
      questionText = questionText.replace(
        new RegExp(`{{${key}}}`, 'g'),
        data[key],
      )
    })

    // Create minimal context for AI
    const minimalContext = {
      questionText,
      category: template.category,
      emoji: template.emoji,
      preview: template.preview,
      battleResult: battleContext.battleResult,
      userScore: battleContext.userScore,
    }

    const messages = [
      {
        role: 'system',
        content: `You are BattleSage AI. Create a follow-up question based on the provided template and context.

CONTEXT: Quick Clash is a 4v4 team quiz game where:
- Players are randomly matched into teams of 4
- Each player selects a category (Technology, Sports, Politics, Business, etc.)
- Players read an article in their chosen category, then take a quiz
- Team with highest combined score wins
- Players can't communicate during the battle
- Trophy system rewards wins and individual performance

The question should be data-driven and analytical, suitable for AI to answer with insights about quiz game strategy and performance patterns.

Output MUST be valid JSON:
{
  "question": {
    "id": "generated_id",
    "question": "The filled template question",
    "category": "provided_category",
    "emoji": "provided_emoji",
    "preview": "provided_preview"
  }
}`,
      },
      {
        role: 'user',
        content: `Template Question: ${questionText}
Category: ${template.category}
Emoji: ${template.emoji}
Preview: ${template.preview}
Battle Result: ${battleContext.battleResult}
User Score: ${battleContext.userScore}

Generate the final question object.`,
      },
    ]

    const response = await makeGPTRequest({
      messages,
      temperature: 0.3, // Lower temperature for consistency
    })

    if (response && response.question) {
      return {
        id: response.question.id || `q_${Date.now()}`,
        question: questionText, // Use filled template directly
        category: template.category,
        emoji: template.emoji,
        preview: template.preview,
        answered: false,
        answer: null,
      }
    }

    throw new Error('Invalid AI response')
  } catch (error) {
    console.error('Error generating specific question:', error)
    // Return template-based fallback
    return {
      id: `fallback_${Date.now()}`,
      question: questionData.template.template.replace(/{{(\w+)}}/g, '[data]'),
      category: questionData.template.category,
      emoji: questionData.template.emoji,
      preview: questionData.template.preview,
      answered: false,
      answer: null,
    }
  }
}

/**
 * Generate AI battle recap and first follow-up question (MODIFIED)
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

    // Fetch battle data
    const battle = await QuickClashTeamBattle.findById(battleId)
      .populate('teamA', 'name avgTrophies')
      .populate('teamB', 'name avgTrophies')
      .populate(
        'teamAMembers.user',
        '_id name inGameName pic quickClashTrophies experienceLevel',
      )
      .populate(
        'teamBMembers.user',
        '_id name inGameName pic quickClashTrophies experienceLevel',
      )

    if (!battle) {
      throw new Error('Battle not found')
    }

    const isTeamAMember = battle.teamAMembers.some(
      member => member.user._id.toString() === userId.toString(),
    )
    const userTeamKey = isTeamAMember ? 'teamA' : 'teamB'
    const userMemberData = battle[`${userTeamKey}Members`].find(
      m => m.user._id.toString() === userId.toString(),
    )

    if (!userMemberData) {
      throw new Error('User not in this battle')
    }

    // Get user's battle history for pattern analysis
    const userHistory = await QuickClashTeamTrophyHistory.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(20) // Limit to reduce processing
      .populate('teamBattle')

    // Create battle context
    const battleContext = {
      battleId: battle._id.toString(),
      userId: userId.toString(),
      userTeamKey,
      userMemberData,
      battle,
      battleResult:
        battle.winner === userTeamKey
          ? 'win'
          : battle.winner === 'tie'
          ? 'tie'
          : 'loss',
      userScore: userMemberData.score,
      trophyChange: userMemberData.trophyChange,
    }

    // Generate battle recap (simplified)
    const recap = await generateSimpleBattleRecap(battleContext)

    // Select and generate relevant questions
    const relevantQuestions = await selectRelevantQuestions(
      battleContext,
      userHistory,
    )

    const followUpQuestions = []
    for (let i = 0; i < Math.min(relevantQuestions.length, 1); i++) {
      const question = await generateSpecificQuestion(
        relevantQuestions[i],
        battleContext,
      )
      if (question) {
        followUpQuestions.push({
          ...question,
          questionIndex: i + 1,
          isActive: i === 0, // Only first question is active
        })
      }
    }

    // Save analysis
    const analysisDoc = await QuickClashTeamBattleAnalysis.findOneAndUpdate(
      { battle: battleId, user: userId },
      {
        battle: battleId,
        user: userId,
        teamMode: '4v4',
        userTeam: userTeamKey,
        battleRecap: recap,
        followUpQuestions,
        questionProgression: {
          currentQuestionIndex: 1,
          totalQuestionsGenerated: followUpQuestions.length,
          isComplete: false,
          battleContext: JSON.stringify(battleContext),
          conversationHistory: [],
        },
        meta: {
          generatedAt: new Date(),
          version: '3.2.0', // Updated version
          openAIModel: 'gpt-4o-mini',
          contextEnrichment: 'data_driven_questions',
          battleCount: userHistory.length + 1, // Track user experience level
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    return {
      battleRecap: recap,
      followUpQuestions,
      analysisId: analysisDoc._id,
      questionProgression: analysisDoc.questionProgression,
    }
  } catch (error) {
    console.error('Error generating battle recap:', error)
    return getFallbackRecapAndQuestions()
  }
}

// Simplified battle recap generation
const generateSimpleBattleRecap = async battleContext => {
  try {
    const messages = [
      {
        role: 'system',
        content: `Create a brief battle recap for Quick Clash team mode.

CONTEXT: Quick Clash is a 4v4 team quiz game where:
- Players are randomly matched into teams of 4
- Each player selects a category and reads an article
- Players take quizzes on their chosen articles
- Team with highest combined score wins
- No communication between teammates during battle

Keep recap concise and focus on the battle outcome.

Output JSON:
{
  "title": "Battle result title (3-4 words)",
  "content": "Brief recap (1-2 sentences, max 40 words)",
  "mood": "victory | defeat | close_call | learning_moment"
}`,
      },
      {
        role: 'user',
        content: `Battle Result: ${battleContext.battleResult}
User Score: ${battleContext.userScore}
Trophy Change: ${battleContext.trophyChange}`,
      },
    ]

    const response = await makeGPTRequest({
      messages,
      temperature: 0.7,
    })

    if (response) {
      return {
        title: response.title || 'Battle Complete',
        content: response.content || 'Your battle analysis is ready.',
        mood: response.mood || 'learning_moment',
      }
    }

    throw new Error('No response from AI')
  } catch (error) {
    console.error('Error generating simple recap:', error)
    return {
      title: 'Battle Analysis',
      content: 'Your personalized insights are ready to explore.',
      mood: 'learning_moment',
    }
  }
}

// Generate next question based on user experience level
const generateNextQuestion = async ({
  analysisId,
  currentQuestionIndex,
  conversationHistory,
  battleContext,
}) => {
  try {
    if (currentQuestionIndex >= 3) {
      return null
    }

    const parsedBattleContext = JSON.parse(battleContext)
    const userHistory = await QuickClashTeamTrophyHistory.find({
      user: parsedBattleContext.userId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('teamBattle')

    const relevantQuestions = await selectRelevantQuestions(
      parsedBattleContext,
      userHistory,
    )

    if (relevantQuestions[currentQuestionIndex]) {
      const question = await generateSpecificQuestion(
        relevantQuestions[currentQuestionIndex],
        parsedBattleContext,
      )

      return {
        ...question,
        questionIndex: currentQuestionIndex + 1,
        isActive: true,
        generatedAt: new Date(),
      }
    }

    // If no more pattern-based questions, generate a learning-focused question for any user level
    const learningQuestion = {
      template: {
        template:
          'What key strategic insight from this battle performance would be most valuable for future improvement?',
        category: 'improvement',
        emoji: '💡',
        preview: 'Extracting actionable learning from battle analysis',
      },
      data: {
        battleResult: parsedBattleContext.battleResult,
        userScore: parsedBattleContext.userScore,
      },
    }

    const question = await generateSpecificQuestion(
      learningQuestion,
      parsedBattleContext,
    )

    return {
      ...question,
      questionIndex: currentQuestionIndex + 1,
      isActive: true,
      generatedAt: new Date(),
    }
  } catch (error) {
    console.error('Error generating next question:', error)
    return null
  }
}

const generateFollowUpAnswer = async (
  battleId,
  userId,
  questionId,
  questionText,
) => {
  try {
    const analysis = await QuickClashTeamBattleAnalysis.findOne({
      battle: battleId,
      user: userId,
    })

    if (!analysis) {
      throw new Error('Analysis not found')
    }

    // Determine if this is a new user based on battle count
    const isNewUser = (analysis.meta?.battleCount || 0) <= 5
    const user = await User.findById(userId)

    // Find the question to determine its category
    const question = analysis.followUpQuestions.find(q => q.id === questionId)
    const questionCategory = question?.category || 'general'

    const messages = [
      {
        role: 'system',
        content: `You are BattleSage AI, providing ${
          isNewUser
            ? 'encouraging guidance for new players'
            : 'specific advice for developing players'
        } in Quick Clash team battles.

CONTEXT: Quick Clash is a 4v4 team quiz game where:
- Players are randomly matched into teams of 4
- Each player selects a category (Technology, Sports, Politics, Business, etc.)
- Players read an article in their chosen category, then take a quiz
- Team with highest combined score wins
- Players can't communicate during battles
- Trophy system based on team performance and individual contribution

${
  isNewUser
    ? 'This user is new to the game. Be supportive, explain concepts simply, and focus on building confidence.'
    : 'This user is developing their skills. Provide practical advice with clear explanations.'
}

Focus on ${questionCategory} insights for quiz game performance.

Guidelines:
- ${isNewUser ? 'Use encouraging, supportive tone' : 'Be direct but helpful'}
- Give specific, actionable advice for team quiz battles
- ${
          isNewUser
            ? 'Explain WHY something works in team context'
            : 'Focus on HOW to improve team performance'
        }
- Keep advice achievable for random team scenarios

Output JSON:
{
  "answer": {
    "content": "${
      isNewUser
        ? 'Encouraging, educational advice (50-70 words)'
        : 'Specific, actionable advice (40-60 words)'
    }",
    "keyTakeaway": "${
      isNewUser
        ? 'Simple, memorable insight (max 12 words)'
        : 'Main insight (max 10 words)'
    }",
    "actionItem": "${
      isNewUser
        ? 'One encouraging step to try (max 12 words)'
        : 'Specific next step (max 10 words)'
    }"
  }
}`,
      },
      {
        role: 'user',
        content: `Question: ${questionText}

User Context:
- Experience Level: ${isNewUser ? 'New Player' : 'Developing Player'}
- Battle Count: ${analysis.meta?.battleCount || 'Unknown'}
- Recent Score: ${analysis.metrics?.userScore || 0}
- Trophy Change: ${analysis.metrics?.trophyChange || 0}
- Trophy Level: ${user?.quickClashTrophies || 1000}

Provide ${
          isNewUser ? 'encouraging guidance' : 'practical improvement advice'
        }.`,
      },
    ]

    const response = await makeGPTRequest({
      messages,
      temperature: isNewUser ? 0.8 : 0.6, // More warmth for new users
    })

    if (response && response.answer) {
      return {
        content:
          response.answer.content ||
          (isNewUser
            ? 'Great job completing this battle! Every game teaches you something valuable.'
            : 'Focus on consistent improvement through targeted practice.'),
        keyTakeaway:
          response.answer.keyTakeaway ||
          (isNewUser
            ? 'Every battle helps you grow.'
            : 'Practice builds consistency.'),
        actionItem:
          response.answer.actionItem ||
          (isNewUser
            ? 'Try exploring a new category next time.'
            : 'Focus on your weakest area next.'),
      }
    }

    // Fallback based on user experience
    return {
      content: isNewUser
        ? "You're doing great! Each battle helps you understand the game better and find your strengths."
        : 'Analyze your patterns and adapt your strategy for consistently better results.',
      keyTakeaway: isNewUser
        ? 'Every game teaches you something new.'
        : 'Adaptation leads to improvement.',
      actionItem: isNewUser
        ? 'Keep exploring different categories.'
        : 'Focus on your lowest win rate category.',
    }
  } catch (error) {
    console.error('Error generating follow-up answer:', error)
    return {
      content: 'Keep practicing and reviewing your performance patterns.',
      keyTakeaway: 'Consistency drives success.',
      actionItem: 'Review your recent battle history.',
    }
  }
}

const getFallbackRecapAndQuestions = () => ({
  battleRecap: {
    title: 'Battle Complete',
    content: 'Your performance data is being analyzed for insights.',
    mood: 'learning_moment',
  },
  followUpQuestions: [
    {
      id: 'fallback_q1',
      question:
        'What does your category choice and score performance indicate about your current knowledge strengths?',
      category: 'improvement',
      emoji: '🎯',
      preview: 'Analyzing your category performance patterns',
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

// Keep existing helper functions...
const calculateEnhancedBattleMetrics = (
  battle,
  userTeamKey,
  userMemberData,
  recentBattles,
) => {
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
