// services/quickClashServices/simulatedChallengeService.js
const mongoose = require('mongoose')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const User = require('../../model/userSchema')
const ArticleHighlight = require('../../model/articleHighlightSchema')

// Constants
const CHALLENGE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

// Pre-defined mock data for simulation
const mockArticleContent = {
  english: `This is a simulated article for bot challenge testing. It contains generic content about the specified category.
  The purpose of this article is to provide a structure for bot challenge testing without consuming AI resources.
  The article should be long enough to simulate a real article but does not need to have actual meaningful content.
  This paragraph serves as placeholder text for the article content. Bot challenges using this article will have
  pre-defined quiz questions rather than AI-generated ones.`,

  hindi: `यह बॉट चैलेंज परीक्षण के लिए एक सिम्युलेटेड लेख है। इसमें निर्दिष्ट श्रेणी के बारे में सामान्य सामग्री है।
  इस लेख का उद्देश्य AI संसाधनों का उपयोग किए बिना बॉट चैलेंज परीक्षण के लिए एक संरचना प्रदान करना है।
  लेख इतना लंबा होना चाहिए कि वह वास्तविक लेख जैसा लगे, लेकिन इसमें वास्तविक सार्थक सामग्री होना आवश्यक नहीं है।
  यह अनुच्छेद लेख सामग्री के लिए प्लेसहोल्डर टेक्स्ट के रूप में कार्य करता है। इस लेख का उपयोग करने वाले बॉट चैलेंज में
  AI-जनित प्रश्नों के बजाय पूर्व-परिभाषित क्विज़ प्रश्न होंगे।`,
}

// Pre-defined mock questions by category
const getMockQuestions = category => {
  // Default questions for any category
  const defaultQuestions = [
    {
      question: `What is the main purpose of this simulated article?`,
      options: {
        a: 'To test AI capabilities',
        b: 'To provide real news information',
        c: 'To test bot challenge functionality',
        d: 'To replace human-written content',
      },
      answer: 'c',
      explanation: 'This article is designed for bot challenge testing.',
      difficulty: 0.4,
    },
    {
      question: 'What type of content does this article contain?',
      options: {
        a: 'Detailed analysis of real events',
        b: 'Generic placeholder content',
        c: 'Personal opinions',
        d: 'Interactive elements',
      },
      answer: 'b',
      explanation: 'The article contains generic placeholder content.',
      difficulty: 0.3,
    },
    {
      question: 'What resources does this simulated challenge save?',
      options: {
        a: 'Database storage',
        b: 'Network bandwidth',
        c: 'AI processing resources',
        d: 'User credentials',
      },
      answer: 'c',
      explanation: 'The simulated challenge saves AI processing resources.',
      difficulty: 0.5,
    },
    {
      question: 'What is the purpose of bot challenges?',
      options: {
        a: 'To replace human users',
        b: 'To test and populate the platform',
        c: 'To generate revenue',
        d: 'To create real content',
      },
      answer: 'b',
      explanation: 'Bot challenges help test and populate the platform.',
      difficulty: 0.6,
    },
    {
      question: 'How are quiz questions created in this simulation?',
      options: {
        a: 'Using machine learning models',
        b: 'By human editors',
        c: 'Using pre-defined templates',
        d: 'By analyzing user behavior',
      },
      answer: 'c',
      explanation:
        'The quiz questions use pre-defined templates instead of AI generation.',
      difficulty: 0.5,
    },
  ]

  // You could add category-specific questions here if desired
  // For example:
  if (category === 'technology' || category === 'science') {
    return [
      ...defaultQuestions,
      {
        question: 'Which field focuses on computer systems and software?',
        options: {
          a: 'Biology',
          b: 'Technology',
          c: 'Politics',
          d: 'Sports',
        },
        answer: 'b',
        explanation: 'Technology focuses on computer systems and software.',
        difficulty: 0.4,
      },
    ]
  }

  // Return default questions if no category-specific ones
  return defaultQuestions
}

/**
 * Create a simulated challenge for inter-bot testing without using AI resources
 * @param {Object} params - Parameters
 * @param {string} params.challengerId - Challenger bot ID
 * @param {string} params.opponentId - Opponent bot ID
 * @param {Array<string>} params.categories - Selected categories for challenge
 * @param {boolean} [params.fromMatchMaking=false] - Whether this is from matchmaking
 * @returns {Promise<Object>} Challenge result object
 */
const createSimulatedChallenge = async ({
  challengerId,
  opponentId,
  categories,
  fromMatchMaking = false,
}) => {
  if (challengerId.toString() === opponentId.toString()) {
    throw new Error('Cannot challenge yourself')
  }

  // Select a random category from the provided categories
  const category =
    categories[Math.floor(Math.random() * categories.length)].toLowerCase()

  // Create mock article data
  const mockTitle = `Simulated ${
    category.charAt(0).toUpperCase() + category.slice(1)
  } Article`
  const articleData = {
    title: {
      english: mockTitle,
      hindi: `सिम्युलेटेड ${category} लेख`,
    },
    content: {
      english: mockArticleContent.english.replace(
        'specified category',
        category,
      ),
      hindi: mockArticleContent.hindi,
    },
    sourceArticles: [], // No real source articles needed
  }

  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Create challenge
      const challenge = new QuickClashChallenge({
        challenger: challengerId,
        opponent: opponentId,
        selectedCategories: categories,
        category,
        article: articleData,
        expiresAt: new Date(Date.now() + CHALLENGE_EXPIRY),
      })

      if (fromMatchMaking) challenge.status = 'active'
      await challenge.save({ session })

      // Create mock English quiz with pre-defined questions
      const questions = getMockQuestions(category)
      const overallDifficulty = 0.5 // Medium difficulty

      const englishQuiz = new QuickClashQuiz({
        challenge: challenge._id,
        language: 'en',
        questions,
        overallDifficulty,
      })

      await englishQuiz.save({ session })

      // Create identical Hindi quiz (for simplicity)
      const hindiQuiz = new QuickClashQuiz({
        challenge: challenge._id,
        language: 'hi',
        questions, // Same questions for simplicity
        overallDifficulty,
        translationStatus: 'completed', // Mark as already done
      })

      await hindiQuiz.save({ session })

      // Create minimal highlight placeholders
      const englishHighlight = {}

      const hindiHighlight = {}

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

      return result
    })
  } finally {
    session.endSession()
  }
}

module.exports = {
  createSimulatedChallenge,
}
