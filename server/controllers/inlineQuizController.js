// Enhanced inlineQuizController.js with user language detection
// Location: server/controllers/inlineQuizController.js

const asyncHandler = require('express-async-handler')
const Article = require('../model/articleSchema')
const User = require('../model/userSchema')
const ArticleHighlight = require('../model/articleHighlightSchema')
const {
  generateInlineQuizDirect,
  generateDualLanguageInlineQuiz,
} = require('../services/articleServicesForEndUsers/articleHighlightService')

/**
 * Get user's preferred language for quiz
 * @param {Object} req - Request object
 * @returns {string} Language code ('en' or 'hi')
 */
const getUserLanguagePreference = async req => {
  try {
    // If user is authenticated, get their language preference
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id).select('userLanguage')
      if (user && user.userLanguage && user.userLanguage !== '') {
        return user.userLanguage
      }
    }

    // Fall back to query parameter
    const queryLang = req.query.language
    if (queryLang === 'hi' || queryLang === 'en') {
      return queryLang
    }

    // Default to English
    console.log('🌐 Using default language: en')
    return 'en'
  } catch (error) {
    console.error('Error getting user language preference:', error)
    return 'en' // Default fallback
  }
}

/**
 * @desc    Get inline quiz questions with statistics and user history for an article
 * @route   GET /api/articles/inline-quiz/:articleId?language=en
 * @access  Public
 */
const getInlineQuizWithStats = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const { language } = req.query

  try {
    // Get user's preferred language
    const preferredLanguage = language

    const article = await Article.findById(articleId).select(
      'inlineQuiz title hindiTitle',
    )
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      })
    }

    // Get quiz questions for preferred language
    let quizQuestions =
      article.inlineQuiz?.filter(q => q.language === preferredLanguage) || []

    // If no quiz exists for preferred language, try fallback generation
    if (quizQuestions.length === 0) {
      console.log(
        `🔄 No ${preferredLanguage} quiz found for article ${articleId}, attempting fallback generation...`,
      )

      try {
        const highlights = await ArticleHighlight.findOne({
          articleId,
          language: preferredLanguage,
          processingStatus: 'completed',
        })

        // If no highlights for preferred language, try the other language
        let fallbackHighlights = highlights
        if (!fallbackHighlights) {
          console.log(
            `🔄 No ${preferredLanguage} highlights found, trying fallback...`,
          )
          fallbackHighlights = await ArticleHighlight.findOne({
            articleId,
            language: preferredLanguage === 'hi' ? 'english' : 'hindi',
            processingStatus: 'completed',
          })
        }

        if (
          fallbackHighlights &&
          fallbackHighlights.importantSentences &&
          fallbackHighlights.importantSentences.length >= 2
        ) {
          const generatedQuestions = await generateInlineQuizDirect({
            articleId,
            importantSentences: fallbackHighlights.importantSentences,
            language: preferredLanguage,
            articleTitle:
              preferredLanguage === 'hi' ? article.hindiTitle : article.title,
          })

          quizQuestions = generatedQuestions
          console.log(
            `✅ Generated ${quizQuestions.length} ${preferredLanguage} questions via fallback`,
          )
        }
      } catch (error) {
        console.error('Fallback generation failed:', error.message)
      }
    }

    // If still no questions for preferred language, try the alternative language
    if (quizQuestions.length === 0) {
      const alternativeLanguage = preferredLanguage === 'en' ? 'hi' : 'en'
      const alternativeQuiz =
        article.inlineQuiz?.filter(q => q.language === alternativeLanguage) ||
        []

      if (alternativeQuiz.length > 0) {
        console.log(
          `🔄 Using ${alternativeLanguage} quiz as fallback for article ${articleId}`,
        )
        quizQuestions = alternativeQuiz
      }
    }

    // Format questions with statistics
    const questionsWithStats = quizQuestions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      relatedSentences: q.relatedSentences,
      sentencePosition: q.sentencePosition,
      language: q.language,
      difficulty: q.difficulty,
      statistics: calculateStatistics(q.answerStats),
    }))

    const actualLanguage =
      questionsWithStats.length > 0
        ? questionsWithStats[0].language
        : preferredLanguage

    // NEW: Get user's quiz history if authenticated
    let userHistory = []

    if (req.user && req.user._id && questionsWithStats.length > 0) {
      try {
        // Create user history from the original quiz questions (which have userResponses)
        userHistory = quizQuestions.map(question => {
          // Find user response in the original question document
          const userResponse = question.userResponses?.find(
            response => response.userId.toString() === req.user._id.toString(),
          )

          return {
            questionId: question._id,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            language: question.language,
            userAnswer: userResponse
              ? {
                  selectedOption: userResponse.selectedOption,
                  answeredAt: userResponse.answeredAt,
                  isCorrect:
                    userResponse.selectedOption === question.correctAnswer,
                }
              : null,
            statistics: calculateStatistics(question.answerStats),
          }
        })

        const answeredCount = userHistory.filter(h => h.userAnswer).length
        if (answeredCount > 0) {
          console.log(`✅ Found ${answeredCount} previous answers for user`)
        }
      } catch (error) {
        console.error('Error fetching user history:', error.message)
        // Continue without user history if there's an error
        userHistory = []
      }
    }

    res.status(200).json({
      success: true,
      data: {
        questions: questionsWithStats,
        count: questionsWithStats.length,
        articleId,
        language: actualLanguage,
        preferredLanguage,
        fallbackUsed: actualLanguage !== preferredLanguage,
        userHistory: userHistory, // NEW: Include user's previous answers
      },
    })
  } catch (error) {
    console.error('Error in getInlineQuizWithStats:', error.message)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get inline quiz',
    })
  }
})

/**
 * @desc    Submit answer to inline quiz question
 * @route   POST /api/articles/inline-quiz/:articleId/answer
 * @access  Private
 */
const submitQuizAnswer = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const { questionId, selectedOption } = req.body
  const userId = req?.user?._id

  if (
    typeof selectedOption !== 'number' ||
    selectedOption < 0 ||
    selectedOption > 3
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid option selected. Must be between 0 and 3.',
    })
  }

  try {
    const article = await Article.findById(articleId)
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      })
    }

    // Find the specific question
    const questionIndex = article.inlineQuiz.findIndex(
      q => q._id.toString() === questionId,
    )
    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      })
    }

    const question = article.inlineQuiz[questionIndex]

    // Check if user has already answered this question
    const existingResponse = question.userResponses.find(
      response => response.userId.toString() === userId?.toString(),
    )

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already answered this question',
        data: {
          previousAnswer: existingResponse.selectedOption,
          answeredAt: existingResponse.answeredAt,
          statistics: calculateStatistics(question.answerStats),
          language: question.language,
        },
      })
    }

    // Add user response
    userId &&
      question.userResponses.push({
        userId,
        selectedOption,
        answeredAt: new Date(),
      })

    // Update answer statistics
    if (!question.answerStats) {
      question.answerStats = {
        totalResponses: 0,
        optionCounts: [0, 0, 0, 0],
        lastUpdated: new Date(),
      }
    }

    question.answerStats.totalResponses += 1
    question.answerStats.optionCounts[selectedOption] += 1
    question.answerStats.lastUpdated = new Date()

    // Save the article
    await article.save()

    // Calculate statistics
    const statistics = calculateStatistics(question.answerStats)

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        questionId,
        selectedOption,
        correctAnswer: question.correctAnswer,
        isCorrect: selectedOption === question.correctAnswer,
        statistics,
        language: question.language,
      },
    })
  } catch (error) {
    console.error('Error in submitQuizAnswer:', error.message)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit answer',
    })
  }
})

/**
 * @desc    Generate inline quiz questions for both languages
 * @route   POST /api/articles/inline-quiz/generate/:articleId
 * @access  Private
 */
const generateInlineQuizFallback = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const { language, force = false, generateBothLanguages = true } = req.body

  try {
    // Get user's preferred language if not specified
    const targetLanguage = language || (await getUserLanguagePreference(req))

    // Check if quiz already exists
    if (!force) {
      const article = await Article.findById(articleId).select('inlineQuiz')
      if (article && article.inlineQuiz) {
        const existingQuizzes = {
          en: article.inlineQuiz.filter(q => q.language === 'en'),
          hi: article.inlineQuiz.filter(q => q.language === 'hi'),
        }

        if (generateBothLanguages) {
          if (existingQuizzes.en.length > 0 && existingQuizzes.hi.length > 0) {
            return res.status(400).json({
              success: false,
              message:
                'Quizzes already exist for both languages. Use force=true to regenerate.',
            })
          }
        } else if (existingQuizzes[targetLanguage]?.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Quiz already exists for ${targetLanguage}. Use force=true to regenerate.`,
          })
        }
      }
    }

    // Get highlights for the appropriate language
    const highlights = await ArticleHighlight.findOne({
      articleId,
      language: targetLanguage === 'hi' ? 'hindi' : 'english',
      processingStatus: 'completed',
    })

    // Fallback to other language highlights if not found
    let fallbackHighlights = highlights
    if (!fallbackHighlights) {
      fallbackHighlights = await ArticleHighlight.findOne({
        articleId,
        language: targetLanguage === 'hi' ? 'english' : 'hindi',
        processingStatus: 'completed',
      })
    }

    if (
      !fallbackHighlights ||
      !fallbackHighlights.importantSentences ||
      fallbackHighlights.importantSentences.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Not enough important sentences available to generate quiz. Please ensure article highlights are generated first.',
      })
    }

    let results = {}

    if (generateBothLanguages) {
      // Generate for both languages
      console.log(`🎯 Generating dual-language quiz for article: ${articleId}`)

      try {
        const dualResults = await generateDualLanguageInlineQuiz({
          articleId,
          importantSentences: fallbackHighlights.importantSentences,
          sourceLanguage: targetLanguage,
        })

        results = {
          en: {
            success: true,
            questions: dualResults.en || [],
            count: dualResults.en?.length || 0,
          },
          hi: {
            success: true,
            questions: dualResults.hi || [],
            count: dualResults.hi?.length || 0,
          },
        }
      } catch (error) {
        console.error('Error generating dual-language quiz:', error)
        results = {
          en: { success: false, error: error.message, questions: [], count: 0 },
          hi: { success: false, error: error.message, questions: [], count: 0 },
        }
      }
    } else {
      // Generate for single language
      try {
        const questions = await generateInlineQuizDirect({
          articleId,
          importantSentences: fallbackHighlights.importantSentences,
          language: targetLanguage,
        })

        results[targetLanguage] = {
          success: true,
          questions: questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            relatedSentences: q.relatedSentences,
            sentencePosition: q.sentencePosition,
            language: q.language,
            difficulty: q.difficulty,
            statistics: calculateStatistics(q.answerStats),
          })),
          count: questions.length,
        }
      } catch (error) {
        results[targetLanguage] = {
          success: false,
          error: error.message,
          questions: [],
          count: 0,
        }
      }
    }

    const totalGenerated = Object.values(results).reduce(
      (sum, result) => sum + (result.count || 0),
      0,
    )

    res.status(200).json({
      success: totalGenerated > 0,
      message: generateBothLanguages
        ? `Generated quizzes for both languages (Total: ${totalGenerated} questions)`
        : `Generated ${totalGenerated} questions for ${targetLanguage}`,
      data: {
        results,
        articleId,
        generateBothLanguages,
        fallbackGeneration: true,
        totalGenerated,
      },
    })
  } catch (error) {
    console.error('Error in generateInlineQuizFallback:', error.message)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate inline quiz',
    })
  }
})

/**
 * @desc    Get user's quiz answer history for an article
 * @route   GET /api/articles/inline-quiz/:articleId/history
 * @access  Private
 */
const getUserQuizHistory = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const userId = req.user._id

  try {
    // Get user's preferred language
    const preferredLanguage = await getUserLanguagePreference(req)

    const article = await Article.findById(articleId).select('inlineQuiz')
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      })
    }

    // Get quiz questions for preferred language, fallback to any language
    let quizQuestions =
      article.inlineQuiz?.filter(q => q.language === preferredLanguage) || []

    if (quizQuestions.length === 0) {
      quizQuestions = article.inlineQuiz || []
    }

    const userHistory = quizQuestions.map(question => {
      const userResponse = question.userResponses.find(
        response => response.userId.toString() === userId.toString(),
      )

      return {
        questionId: question._id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        language: question.language,
        userAnswer: userResponse
          ? {
              selectedOption: userResponse.selectedOption,
              answeredAt: userResponse.answeredAt,
              isCorrect: userResponse.selectedOption === question.correctAnswer,
            }
          : null,
        statistics: calculateStatistics(question.answerStats),
      }
    })

    res.status(200).json({
      success: true,
      data: {
        history: userHistory,
        articleId,
        preferredLanguage,
        totalQuestions: userHistory.length,
        answeredQuestions: userHistory.filter(h => h.userAnswer).length,
      },
    })
  } catch (error) {
    console.error('Error in getUserQuizHistory:', error.message)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get quiz history',
    })
  }
})

/**
 * Calculate percentage statistics for quiz options
 * @param {Object} answerStats - Answer statistics object
 * @returns {Object} Formatted statistics
 */
function calculateStatistics(answerStats) {
  if (!answerStats || answerStats.totalResponses === 0) {
    return {
      totalResponses: 0,
      optionPercentages: [0, 0, 0, 0],
      mostChosen: null,
      lastUpdated: null,
    }
  }

  const { totalResponses, optionCounts, lastUpdated } = answerStats

  const optionPercentages = optionCounts.map(count =>
    totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0,
  )

  const mostChosenIndex = optionCounts.indexOf(Math.max(...optionCounts))

  return {
    totalResponses,
    optionPercentages,
    mostChosen: mostChosenIndex,
    lastUpdated,
  }
}

module.exports = {
  getInlineQuizWithStats,
  submitQuizAnswer,
  generateInlineQuizFallback,
  getUserQuizHistory,
}
