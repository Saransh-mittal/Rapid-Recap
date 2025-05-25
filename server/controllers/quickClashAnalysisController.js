// controllers/quickClashAnalysisController.js
const asyncHandler = require('express-async-handler')
const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')
const QuickClashTeamTrophyHistory = require('../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
const QuickClashTeamBattleAnalysis = require('../model/quickClashSchemas/quickClashTeamBattleAnalysisSchema')
const QuickClashInsightFeedback = require('../model/quickClashSchemas/quickClashInsightFeedbackSchema')
const {
  generateBattleInsights,
  generateFollowUpAnswer,
  generateNextQuestion,
} = require('../services/quickClashServices/quickClashAIService')
const {
  calculateMVPAwards,
  getSimplifiedTrophyData,
  getEnhancedPerformanceLevel,
} = require('../services/quickClashServices/quickClashMVPService')

/**
 * @desc    Get team battle analysis
 * @route   GET /api/quickClash/analysis/battle/:battleId
 * @access  Private
 */
const getTeamBattleAnalysis = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const userId = req.user._id

  try {
    const battle = await QuickClashTeamBattle.findById(battleId)
      .populate('teamA', 'name avgTrophies')
      .populate('teamB', 'name avgTrophies')
      .populate(
        'teamAMembers.user',
        '_id name inGameName pic quickClashTrophies',
      )
      .populate(
        'teamBMembers.user',
        '_id name inGameName pic quickClashTrophies',
      )
      .populate({
        path: 'challenges.challenge',
        select:
          'category article status challenger opponent challengerScore opponentScore challengerAttempted opponentAttempted',
      })

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle analysis not found',
      })
    }

    const isTeamAMember = battle.teamAMembers.some(
      member => member.user._id.toString() === userId.toString(),
    )
    const isTeamBMember = battle.teamBMembers.some(
      member => member.user._id.toString() === userId.toString(),
    )

    if (!isTeamAMember && !isTeamBMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this battle analysis',
      })
    }

    const existingAnalysis = await QuickClashTeamBattleAnalysis.findOne({
      battle: battleId,
      user: userId,
    })

    let currentAnalysisId = null
    let battleRecap = null
    let followUpQuestions = []
    let questionProgression = null

    if (
      existingAnalysis &&
      existingAnalysis.battleRecap &&
      existingAnalysis.battleRecap.title &&
      existingAnalysis.followUpQuestions // Check if array exists, not necessarily length > 0 initially
    ) {
      battleRecap = existingAnalysis.battleRecap
      // MODIFICATION: Send all questions from the existing analysis
      followUpQuestions = existingAnalysis.followUpQuestions
      questionProgression = existingAnalysis.questionProgression
      currentAnalysisId = existingAnalysis._id
      console.log(
        `Using existing analysis (ID: ${currentAnalysisId}) for battle ${battleId}, user ${userId}. Found ${followUpQuestions.length} questions.`,
      )
    } else {
      // Generate new analysis
      console.log(
        `No complete existing analysis found. Generating new analysis for battle ${battleId}, user ${userId}.`,
      )
      // generateBattleInsights (alias for generateBattleRecapAndQuestions) will create or update the analysis doc
      const insights = await generateBattleInsights(battleId, userId) // This function now handles upsert
      battleRecap = insights.battleRecap
      followUpQuestions = insights.followUpQuestions // This will be the initial set (usually one question)
      questionProgression = insights.questionProgression
      currentAnalysisId = insights.analysisId // The service should return the ID of the (newly created/updated) analysis document

      console.log(
        `Generated new analysis (ID: ${currentAnalysisId}) for battle ${battleId}, user ${userId}. Initial questions: ${followUpQuestions.length}.`,
      )
    }

    const trophyHistory = await QuickClashTeamTrophyHistory.find({
      teamBattle: battleId,
      user: userId,
    })

    // Calculate MVP awards and enhanced recognitions
    const mvpAwards = calculateMVPAwards(
      battle,
      isTeamAMember ? 'teamA' : 'teamB',
    )

    // Get simplified trophy data (bonuses only)
    const userMemberData = (
      isTeamAMember ? battle.teamAMembers : battle.teamBMembers
    ).find(member => member.user._id.toString() === userId.toString())
    const simplifiedTrophyData = getSimplifiedTrophyData(battle, userMemberData)

    // Enhance team member data with new performance levels - FIXED VERSION
    const enhanceTeamMembers = members => {
      return members.map(member => {
        // Convert mongoose document to plain object to avoid nested structure issues
        const memberObj = member.toObject ? member.toObject() : member

        return {
          ...memberObj,
          enhancedPerformance: getEnhancedPerformanceLevel(
            memberObj.score || 0,
          ),
          isMatchMVP:
            mvpAwards.matchMVP?.user._id.toString() ===
            memberObj.user._id.toString(),
          isTeamMVP:
            mvpAwards.teamMVP?.user._id.toString() ===
            memberObj.user._id.toString(),
          isPivotalPlayer:
            mvpAwards.pivotalPlayer?.user._id.toString() ===
            memberObj.user._id.toString(),
        }
      })
    }

    // Convert battle to plain object and enhance - FIXED VERSION
    const battleObj = battle.toObject()
    const enhancedBattle = {
      ...battleObj,
      teamAMembers: enhanceTeamMembers(battleObj.teamAMembers),
      teamBMembers: enhanceTeamMembers(battleObj.teamBMembers),
    }

    res.status(200).json({
      success: true,
      analysis: {
        battle: enhancedBattle,
        userTeam: isTeamAMember ? 'teamA' : 'teamB',
        trophyHistory,
        battleRecap,
        followUpQuestions,
        questionProgression,
        analysisId: currentAnalysisId,
        mvpAwards,
        simplifiedTrophyData,
        enhancedMemberPerformance: true,
      },
    })
  } catch (error) {
    console.error('Error fetching team battle analysis:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve battle analysis',
    })
  }
})

/**
 * @desc    Answer a follow-up question and get next question
 * @route   POST /api/quickClash/analysis/answer-question
 * @access  Private
 */
const answerFollowUpQuestion = asyncHandler(async (req, res) => {
  const { battleId, questionId, questionText } = req.body
  const userId = req.user._id

  if (!battleId || !questionId || !questionText) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
    })
  }

  try {
    const analysis = await QuickClashTeamBattleAnalysis.findOne({
      battle: battleId,
      user: userId,
    })

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
      })
    }

    const answer = await generateFollowUpAnswer(
      battleId,
      userId,
      questionId,
      questionText,
    )

    let updatedAnalysis = await QuickClashTeamBattleAnalysis.findOneAndUpdate(
      {
        _id: analysis._id, // Use analysis _id for precision
        'followUpQuestions.id': questionId,
      },
      {
        $set: {
          'followUpQuestions.$.answered': true,
          'followUpQuestions.$.answer': {
            ...answer,
            answeredAt: new Date(),
          },
          'followUpQuestions.$.isActive': false,
        },
        $push: {
          'questionProgression.conversationHistory': {
            questionId,
            question: questionText,
            answer: answer.content, // Storing main content of answer
            timestamp: new Date(),
          },
        },
      },
      { new: true }, // Get the updated document
    )

    if (!updatedAnalysis) {
      // This might happen if the questionId was already processed or doesn't exist
      // Re-fetch to ensure we have the latest state if the update seemed to fail
      updatedAnalysis = await QuickClashTeamBattleAnalysis.findById(
        analysis._id,
      )
      if (!updatedAnalysis) {
        return res.status(404).json({
          success: false,
          message: 'Failed to update analysis or analysis re-fetch failed.',
        })
      }
      const questionInDb = updatedAnalysis.followUpQuestions.find(
        q => q.id === questionId,
      )
      if (!questionInDb || !questionInDb.answered) {
        console.error(
          `Failed to mark question ${questionId} as answered in DB, or it was not found after initial update attempt.`,
        )
        // Potentially return an error or proceed if other parts are okay
      }
    }

    let nextQuestion = null
    const currentQuestionIndex =
      updatedAnalysis.questionProgression.currentQuestionIndex

    if (currentQuestionIndex < 3) {
      nextQuestion = await generateNextQuestion({
        analysisId: updatedAnalysis._id,
        currentQuestionIndex,
        conversationHistory:
          updatedAnalysis.questionProgression.conversationHistory,
        battleContext: updatedAnalysis.questionProgression.battleContext,
      })

      if (nextQuestion) {
        updatedAnalysis = await QuickClashTeamBattleAnalysis.findByIdAndUpdate(
          updatedAnalysis._id,
          {
            $push: {
              followUpQuestions: nextQuestion,
            },
            $set: {
              'questionProgression.currentQuestionIndex':
                nextQuestion.questionIndex,
              'questionProgression.totalQuestionsGenerated': Math.max(
                updatedAnalysis.questionProgression.totalQuestionsGenerated,
                nextQuestion.questionIndex,
              ), // Ensure totalQuestionsGenerated is accurate
            },
          },
          { new: true },
        )
      } else {
        updatedAnalysis = await QuickClashTeamBattleAnalysis.findByIdAndUpdate(
          updatedAnalysis._id,
          {
            $set: {
              'questionProgression.isComplete': true,
            },
          },
          { new: true },
        )
      }
    } else {
      updatedAnalysis = await QuickClashTeamBattleAnalysis.findByIdAndUpdate(
        updatedAnalysis._id,
        {
          $set: {
            'questionProgression.isComplete': true,
          },
        },
        { new: true },
      )
    }

    // MODIFICATION: Send the authoritative progression object from the database
    res.status(200).json({
      success: true,
      answer,
      nextQuestion,
      questionId, // ID of the question that was just answered
      progression: updatedAnalysis.questionProgression,
    })
  } catch (error) {
    console.error('Error answering follow-up question:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate answer',
    })
  }
})

/**
 * @desc    Get user's battle history analysis
 * @route   GET /api/quickClash/analysis/history
 * @access  Private
 */
const getUserBattleAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { limit = 10 } = req.query

  try {
    const trophyHistory = await QuickClashTeamTrophyHistory.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('team', 'name')
      .populate('opponentTeam', 'name')
      .populate('teamBattle')

    const stats = await calculateUserBattleStats(userId)

    res.status(200).json({
      success: true,
      trophyHistory,
      stats,
    })
  } catch (error) {
    console.error('Error fetching user battle analysis:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve battle history',
    })
  }
})

/**
 * @desc    Submit feedback for an AI insight
 * @route   POST /api/quickClash/analysis/insight-feedback
 * @access  Private
 */
const submitInsightFeedback = asyncHandler(async (req, res) => {
  const {
    analysisId,
    insightTitle,
    insightDescription,
    insightType,
    feedbackType,
    comment,
  } = req.body
  const userId = req.user._id

  if (
    !analysisId ||
    !insightTitle ||
    !insightDescription ||
    !insightType ||
    !feedbackType
  ) {
    return res.status(400).json({
      success: false,
      message: 'Missing required feedback fields.',
    })
  }

  try {
    const analysis = await QuickClashTeamBattleAnalysis.findById(analysisId)

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found.',
      })
    }

    const battle = await QuickClashTeamBattle.findById(analysis.battle)

    let battleResult = 'unknown'
    if (battle) {
      if (analysis.userTeam === battle.winner) {
        battleResult = 'win'
      } else if (battle.winner === 'tie') {
        battleResult = 'tie'
      } else {
        battleResult = 'loss'
      }
    }

    const newFeedback = new QuickClashInsightFeedback({
      battleAnalysis: analysisId,
      insightTitle,
      insightDescription,
      insightType,
      feedbackType,
      user: userId,
      comment,
      meta: {
        battleResult,
        userExperienceLevel: req.user.experienceLevel || 'intermediate',
        insightVersion: analysis.meta?.version || '3.1.0',
        generationModel: analysis.meta?.openAIModel || 'gpt-4o-mini',
      },
    })

    await newFeedback.save()

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback: newFeedback,
    })
  } catch (error) {
    console.error('Error submitting insight feedback:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback.',
    })
  }
})

const calculateUserBattleStats = async userId => {
  const history = await QuickClashTeamTrophyHistory.find({ user: userId })

  const totalBattles = history.length
  const wins = history.filter(h => h.result === 'win').length
  const losses = history.filter(h => h.result === 'loss').length
  const ties = history.filter(h => h.result === 'tie').length

  const totalTrophiesGained = history
    .filter(h => h.trophiesChange > 0)
    .reduce((sum, h) => sum + h.trophiesChange, 0)

  const totalTrophiesLost = history
    .filter(h => h.trophiesChange < 0)
    .reduce((sum, h) => sum + Math.abs(h.trophiesChange), 0)

  const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0

  return {
    totalBattles,
    wins,
    losses,
    ties,
    totalTrophiesGained,
    totalTrophiesLost,
    netTrophies: totalTrophiesGained - totalTrophiesLost,
    winRate: Math.round(winRate * 10) / 10,
    averageTrophiesPerWin:
      wins > 0 ? Math.round(totalTrophiesGained / wins) : 0,
    averageTrophiesPerLoss:
      losses > 0 ? Math.round(totalTrophiesLost / losses) : 0,
  }
}

module.exports = {
  getTeamBattleAnalysis,
  getUserBattleAnalysis,
  submitInsightFeedback,
  answerFollowUpQuestion,
}
