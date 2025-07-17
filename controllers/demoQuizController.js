// controllers/demoQuizController.js - Updated with Hindi/English support

const asyncHandler = require('express-async-handler')

// Pool of premade demo questions with both Hindi and English
const DEMO_QUESTIONS_POOL = [
  {
    question: {
      en: 'Who is the current Prime Minister of India?',
      hi: 'भारत के वर्तमान प्रधान मंत्री कौन हैं?',
    },
    options: {
      a: { en: 'Amit Shah', hi: 'अमित शाह' },
      b: { en: 'Rahul Gandhi', hi: 'राहुल गांधी' },
      c: { en: 'Narendra Modi', hi: 'नरेंद्र मोदी' },
      d: { en: 'Arvind Kejriwal', hi: 'अरविंद केजरीवाल' },
    },
    correctAnswer: 'c',
    explanation: {
      en: 'Narendra Modi is the current Prime Minister of India, having served since 2014.',
      hi: 'नरेंद्र मोदी भारत के वर्तमान प्रधान मंत्री हैं, जो 2014 से इस पद पर हैं।',
    },
    category: { en: 'Current Affairs', hi: 'सामयिकी' },
    difficulty: 0.1,
    timeLimit: 15,
  },
  {
    question: {
      en: "Which Indian city is home to the world's largest cricket stadium by seating capacity?",
      hi: 'कौन सा भारतीय शहर बैठने की क्षमता के हिसाब से दुनिया के सबसे बड़े क्रिकेट स्टेडियम का घर है?',
    },
    options: {
      a: { en: 'Mumbai', hi: 'मुंबई' },
      b: { en: 'Ahmedabad', hi: 'अहमदाबाद' },
      c: { en: 'Kolkata', hi: 'कोलकाता' },
      d: { en: 'Delhi', hi: 'दिल्ली' },
    },
    correctAnswer: 'b',
    explanation: {
      en: "The Narendra Modi Stadium in Ahmedabad has a seating capacity of 132,000, making it the world's largest cricket stadium.",
      hi: 'अहमदाबाद में नरेंद्र मोदी स्टेडियम की बैठने की क्षमता 132,000 है, जो इसे दुनिया का सबसे बड़ा क्रिकेट स्टेडियम बनाता है।',
    },
    category: { en: 'Sports', hi: 'खेल' },
    difficulty: 0.2,
    timeLimit: 15,
  },
  {
    question: {
      en: "Which team won the most recent Men's Cricket World Cup (2023)?",
      hi: 'सबसे हाल का पुरुष क्रिकेट विश्व कप (2023) किस टीम ने जीता?',
    },
    options: {
      a: { en: 'India', hi: 'भारत' },
      b: { en: 'England', hi: 'इंग्लैंड' },
      c: { en: 'South Africa', hi: 'दक्षिण अफ्रीका' },
      d: { en: 'Australia', hi: 'ऑस्ट्रेलिया' },
    },
    correctAnswer: 'd',
    explanation: {
      en: "Australia won the 2023 ICC Men's Cricket World Cup by defeating India in the final.",
      hi: 'ऑस्ट्रेलिया ने फाइनल में भारत को हराकर 2023 आईसीसी पुरुष क्रिकेट विश्व कप जीता।',
    },
    category: { en: 'Current Affairs', hi: 'सामयिकी' },
    difficulty: 0.2,
    timeLimit: 15,
  },
  {
    question: {
      en: 'What is the capital of India?',
      hi: 'भारत की राजधानी क्या है?',
    },
    options: {
      a: { en: 'Mumbai', hi: 'मुंबई' },
      b: { en: 'Kolkata', hi: 'कोलकाता' },
      c: { en: 'Chennai', hi: 'चेन्नई' },
      d: { en: 'New Delhi', hi: 'नई दिल्ली' },
    },
    correctAnswer: 'd',
    explanation: {
      en: 'New Delhi is the capital of India and is part of the National Capital Territory of Delhi.',
      hi: 'नई दिल्ली भारत की राजधानी है और यह राष्ट्रीय राजधानी क्षेत्र दिल्ली का एक हिस्सा है।',
    },
    category: { en: 'Geography', hi: 'भूगोल' },
    difficulty: 0.1,
    timeLimit: 15,
  },
  {
    question: {
      en: 'Which company owns the popular messaging app WhatsApp?',
      hi: 'लोकप्रिय मैसेजिंग ऐप व्हाट्सएप का मालिक कौन सी कंपनी है?',
    },
    options: {
      a: { en: 'Google', hi: 'गूगल' },
      b: { en: 'Meta', hi: 'मेटा' },
      c: { en: 'Apple', hi: 'एप्पल' },
      d: { en: 'Amazon', hi: 'अमेज़ॅन' },
    },
    correctAnswer: 'b',
    explanation: {
      en: 'Meta, the company formerly known as Facebook, owns WhatsApp and Instagram.',
      hi: 'मेटा, जिसे पहले फेसबुक के नाम से जाना जाता था, व्हाट्सएप और इंस्टाग्राम का मालिक है।',
    },
    category: { en: 'Technology', hi: 'प्रौद्योगिकी' },
    difficulty: 0.2,
    timeLimit: 15,
  },
  {
    question: {
      en: "Which Indian state is known as the 'Land of Five Rivers'?",
      hi: "कौन सा भारतीय राज्य 'पांच नदियों की भूमि' के नाम से जाना जाता है?",
    },
    options: {
      a: { en: 'Haryana', hi: 'हरियाणा' },
      b: { en: 'Punjab', hi: 'पंजाब' },
      c: { en: 'Rajasthan', hi: 'राजस्थान' },
      d: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
    },
    correctAnswer: 'b',
    explanation: {
      en: "Punjab is called the 'Land of Five Rivers' referring to the five rivers: Sutlej, Beas, Ravi, Chenab, and Jhelum.",
      hi: "पंजाब को 'पांच नदियों की भूमि' कहा जाता है जो पांच नदियों को संदर्भित करता है: सतलुज, ब्यास, रावी, चिनाब और झेलम।",
    },
    category: { en: 'Indian Geography', hi: 'भारतीय भूगोल' },
    difficulty: 0.3,
    timeLimit: 15,
  },
  {
    question: {
      en: 'What is the largest mammal in the world?',
      hi: 'दुनिया का सबसे बड़ा स्तनधारी कौन सा है?',
    },
    options: {
      a: { en: 'African Elephant', hi: 'अफ्रीकी हाथी' },
      b: { en: 'Blue Whale', hi: 'नीली व्हेल' },
      c: { en: 'Giraffe', hi: 'जिराफ' },
      d: { en: 'Polar Bear', hi: 'ध्रुवीय भालू' },
    },
    correctAnswer: 'b',
    explanation: {
      en: 'The Blue Whale is the largest mammal and the largest animal ever known to have lived on Earth.',
      hi: 'नीली व्हेल सबसे बड़ा स्तनधारी और पृथ्वी पर अब तक का सबसे बड़ा ज्ञात जानवर है।',
    },
    category: { en: 'Biology', hi: 'जीव विज्ञान' },
    difficulty: 0.2,
    timeLimit: 15,
  },
  {
    question: {
      en: 'In which year did India gain independence from Britain?',
      hi: 'भारत को ब्रिटेन से आज़ादी किस साल मिली थी?',
    },
    options: {
      a: { en: '1946', hi: '1946' },
      b: { en: '1947', hi: '1947' },
      c: { en: '1948', hi: '1948' },
      d: { en: '1950', hi: '1950' },
    },
    correctAnswer: 'b',
    explanation: {
      en: 'India gained independence from British rule on August 15, 1947. This date is celebrated annually as Independence Day.',
      hi: 'भारत को 15 अगस्त, 1947 को ब्रिटिश शासन से आजादी मिली। यह तारीख हर साल स्वतंत्रता दिवस के रूप में मनाई जाती है।',
    },
    category: { en: 'Indian History', hi: 'भारतीय इतिहास' },
    difficulty: 0.1,
    timeLimit: 15,
  },
  {
    question: {
      en: "What is the name of India's currency?",
      hi: 'भारत की मुद्रा का क्या नाम है?',
    },
    options: {
      a: { en: 'Taka', hi: 'टका' },
      b: { en: 'Rupee', hi: 'रुपया' },
      c: { en: 'Riyal', hi: 'रियाल' },
      d: { en: 'Dollar', hi: 'डॉलर' },
    },
    correctAnswer: 'b',
    explanation: {
      en: 'The Indian Rupee (₹) is the official currency of the Republic of India.',
      hi: 'भारतीय रुपया (₹) भारत गणराज्य की आधिकारिक मुद्रा है।',
    },
    category: { en: 'Economics', hi: 'अर्थशास्त्र' },
    difficulty: 0.1,
    timeLimit: 15,
  },
]

// Cache for current demo question to avoid repeated selections
let currentQuestionCache = null
let cacheTimestamp = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Get a random demo question from the pool
const getRandomDemoQuestion = () => {
  const randomIndex = Math.floor(Math.random() * DEMO_QUESTIONS_POOL.length)
  return DEMO_QUESTIONS_POOL[randomIndex]
}

// Get demo question with caching - sends both languages
const getDemoQuestion = asyncHandler(async (req, res) => {
  try {
    const now = Date.now()

    // Check if we have a cached question that's still valid
    if (
      currentQuestionCache &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_DURATION
    ) {
      return res.status(200).json({
        success: true,
        question: currentQuestionCache,
        cached: true,
      })
    }

    // Get a random question from the pool
    const question = getRandomDemoQuestion()

    // Cache the question
    currentQuestionCache = question
    cacheTimestamp = now

    res.status(200).json({
      success: true,
      question: question, // Contains both en and hi versions
      cached: false,
    })
  } catch (error) {
    console.error('Error in getDemoQuestion:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demo question',
    })
  }
})

// Submit demo question answer (for analytics/engagement tracking)
const submitDemoAnswer = asyncHandler(async (req, res) => {
  try {
    const {
      selectedAnswer,
      timeTaken,
      userAgent,
      correctAnswer,
      questionCategory,
      language, // Track which language was used
    } = req.body

    // Calculate if answer was correct
    const isCorrect = selectedAnswer === correctAnswer

    // Here you can add analytics tracking
    console.log('Demo quiz answered:', {
      selectedAnswer,
      correctAnswer,
      isCorrect,
      timeTaken,
      questionCategory,
      language: language || 'en', // Default to English
      timestamp: new Date(),
      userAgent: userAgent || req.get('User-Agent'),
    })

    // You could store this in a database for analytics
    // Example: await AnalyticsModel.create({ ... })

    res.status(200).json({
      success: true,
      message: 'Demo answer recorded',
      isCorrect: isCorrect,
    })
  } catch (error) {
    console.error('Error in submitDemoAnswer:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record demo answer',
    })
  }
})

// Generate demo question for SSR (synchronous) - returns both languages
const generateDemoQuestion = () => {
  try {
    const now = Date.now()

    // Check cache first
    if (
      currentQuestionCache &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_DURATION
    ) {
      return {
        success: true,
        question: currentQuestionCache,
      }
    }

    // Get random question
    const question = getRandomDemoQuestion()

    // Update cache
    currentQuestionCache = question
    cacheTimestamp = now

    return {
      success: true,
      question: question, // Contains both en and hi versions
    }
  } catch (error) {
    console.error('Error generating demo question:', error)

    // Fallback question if something goes wrong
    return {
      success: true,
      question: DEMO_QUESTIONS_POOL[0], // Use first question as fallback
    }
  }
}

// Get all demo questions (for admin/testing purposes)
const getAllDemoQuestions = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      questions: DEMO_QUESTIONS_POOL,
      totalQuestions: DEMO_QUESTIONS_POOL.length,
    })
  } catch (error) {
    console.error('Error in getAllDemoQuestions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch demo questions',
    })
  }
})

module.exports = {
  getDemoQuestion,
  submitDemoAnswer,
  generateDemoQuestion, // For SSR use
  getAllDemoQuestions, // For admin use
}
