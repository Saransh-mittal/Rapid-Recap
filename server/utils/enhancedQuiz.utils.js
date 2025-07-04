// utils/enhancedQuiz.utils.js - UPDATED: Remove context and add proper validation
const OpenAI = require('openai')
const GameData = require('../model/gameDataSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const { calculateArticleDifficulty } = require('./article.utils')

// UPDATED: Game-specific configurations (unchanged)
const GAME_CONFIGS = {
  normal_quiz: {
    timeLimit: 50,
    itemCount: 5,
    BASELINE_TIME_PER_QUESTION: 15,
    ALL_CORRECT_BONUS: 1.2,
    ONE_WRONG_BONUS: 1.1,
    BASE_TIME_WINDOW: 50,
    difficultyMultiplier: 1.0,
    timeMultiplier: 1.0,
    skillComplexity: 1.0,
    cognitiveLoad: 1.0,
  },
  true_false: {
    timeLimit: 35,
    itemCount: 7,
    BASELINE_TIME_PER_QUESTION: 7,
    ALL_CORRECT_BONUS: 1.15,
    ONE_WRONG_BONUS: 1.05,
    BASE_TIME_WINDOW: 35,
    difficultyMultiplier: 0.85,
    timeMultiplier: 1.4,
    skillComplexity: 0.8,
    cognitiveLoad: 0.75,
  },
  word_weaver: {
    timeLimit: 100,
    itemCount: 5,
    BASELINE_TIME_PER_QUESTION: 25,
    ALL_CORRECT_BONUS: 1.25,
    ONE_WRONG_BONUS: 1.15,
    BASE_TIME_WINDOW: 100,
    difficultyMultiplier: 1.1,
    timeMultiplier: 0.9,
    skillComplexity: 1.15,
    cognitiveLoad: 1.15,
  },
  connections: {
    timeLimit: 72,
    itemCount: 8,
    BASELINE_TIME_PER_QUESTION: 20,
    ALL_CORRECT_BONUS: 1.3,
    ONE_WRONG_BONUS: 1.2,
    BASE_TIME_WINDOW: 100,
    difficultyMultiplier: 1.2,
    timeMultiplier: 0.8,
    skillComplexity: 1.15,
    cognitiveLoad: 1.2,
  },
}

// Existing calculation functions (unchanged)
const calculateQuestionDifficulty = (question, options) => {
  let difficultyScore = 0.3 // Base difficulty

  // Factor 1: Question length (longer questions are harder to process)
  const questionLength = question.split(' ').length
  if (questionLength > 20) difficultyScore += 0.2
  else if (questionLength > 15) difficultyScore += 0.15
  else if (questionLength > 10) difficultyScore += 0.1
  else if (questionLength > 7) difficultyScore += 0.05

  // Factor 2: Total options length (more reading required)
  const totalOptionsLength = Object.values(options).join(' ').split(' ').length
  if (totalOptionsLength > 30) difficultyScore += 0.2
  else if (totalOptionsLength > 25) difficultyScore += 0.15
  else if (totalOptionsLength > 20) difficultyScore += 0.1
  else if (totalOptionsLength > 15) difficultyScore += 0.05

  // Factor 3: Numbers, dates, and specific data (harder to remember)
  const numberPattern = /\b\d{1,4}\b/g
  const yearPattern = /\b(19|20)\d{2}\b/g
  const percentPattern = /\b\d+(\.\d+)?%/g

  const questionNumbers = (question.match(numberPattern) || []).length
  const questionYears = (question.match(yearPattern) || []).length
  const questionPercents = (question.match(percentPattern) || []).length

  const optionsText = Object.values(options).join(' ')
  const optionsNumbers = (optionsText.match(numberPattern) || []).length
  const optionsYears = (optionsText.match(yearPattern) || []).length
  const optionsPercents = (optionsText.match(percentPattern) || []).length

  if (questionNumbers + questionYears + questionPercents > 0)
    difficultyScore += 0.15
  if (optionsNumbers + optionsYears + optionsPercents > 3)
    difficultyScore += 0.1

  // Factor 4: Proper nouns (names, places, organizations)
  const properNounPattern = /\b[A-Z][a-z]{2,}\b/g
  const questionProperNouns = (question.match(properNounPattern) || []).filter(
    word =>
      ![
        'Which',
        'What',
        'When',
        'Where',
        'Who',
        'How',
        'The',
        'This',
        'That',
      ].includes(word),
  ).length
  const optionsProperNouns = (optionsText.match(properNounPattern) || []).length

  if (questionProperNouns > 1) difficultyScore += 0.1
  if (optionsProperNouns > 3) difficultyScore += 0.1

  // Factor 5: Word complexity - longer words are generally more complex
  const allWords = (question + ' ' + optionsText).split(/\s+/)
  const longWords = allWords.filter(word => word.length > 8).length
  const veryLongWords = allWords.filter(word => word.length > 12).length

  if (longWords > 3) difficultyScore += 0.08
  if (veryLongWords > 1) difficultyScore += 0.12

  // Factor 6: Question complexity indicators
  const complexIndicators = [
    'which of the following',
    'all of the above',
    'none of the above',
    'except',
    'not',
    'least likely',
    'most likely',
    'primarily',
    'mainly',
    'according to',
    'based on',
    'in contrast to',
    'compared to',
  ]

  const complexityCount = complexIndicators.filter(
    indicator =>
      question.toLowerCase().includes(indicator) ||
      optionsText.toLowerCase().includes(indicator),
  ).length

  if (complexityCount > 0) difficultyScore += complexityCount * 0.07

  // Factor 7: Sentence complexity (punctuation and structure)
  const commaCount = (question.match(/,/g) || []).length
  const semicolonCount = (question.match(/;/g) || []).length
  const colonCount = (question.match(/:/g) || []).length

  if (commaCount > 2) difficultyScore += 0.05
  if (semicolonCount > 0) difficultyScore += 0.08
  if (colonCount > 0) difficultyScore += 0.06

  // Ensure difficulty is within bounds and round to 2 decimal places
  return Math.min(0.99, Math.max(0.01, Math.round(difficultyScore * 100) / 100))
}

const calculateTrueFalseDifficulty = statement => {
  let difficultyScore = 0.25 // Base difficulty (T/F is generally easier)

  // Statement length
  const statementLength = statement.split(' ').length
  if (statementLength > 25) difficultyScore += 0.2
  else if (statementLength > 20) difficultyScore += 0.15
  else if (statementLength > 15) difficultyScore += 0.1
  else if (statementLength > 10) difficultyScore += 0.05

  // Negation words (make statements trickier)
  const negationWords = [
    'not',
    'never',
    'no',
    'none',
    'neither',
    'nor',
    'cannot',
    'without',
  ]
  const negationCount = negationWords.filter(
    word =>
      statement.toLowerCase().includes(' ' + word + ' ') ||
      statement.toLowerCase().startsWith(word + ' '),
  ).length
  if (negationCount > 0) difficultyScore += negationCount * 0.1

  // Absolute terms (often indicate false statements)
  const absoluteTerms = [
    'always',
    'never',
    'all',
    'none',
    'every',
    'only',
    'exclusively',
    'entirely',
  ]
  const absoluteCount = absoluteTerms.filter(term =>
    statement.toLowerCase().includes(term),
  ).length
  if (absoluteCount > 0) difficultyScore += absoluteCount * 0.08

  // Numbers and specific data
  const numberPattern = /\b\d+(\.\d+)?/g
  const numberCount = (statement.match(numberPattern) || []).length
  if (numberCount > 0) difficultyScore += numberCount * 0.1

  // Word complexity - longer words are generally more complex
  const words = statement.split(/\s+/)
  const longWords = words.filter(word => word.length > 8).length
  if (longWords > 2) difficultyScore += longWords * 0.05

  return Math.min(0.99, Math.max(0.01, Math.round(difficultyScore * 100) / 100))
}

// UPDATED: Word Weaver difficulty calculation without context parameter
const calculateWordWeaverDifficulty = (blank, answer) => {
  let difficultyScore = 0.4 // Base difficulty (word puzzles are inherently challenging)

  // Answer word length (longer words are harder)
  const answerLength = answer.length
  if (answerLength > 10) difficultyScore += 0.25
  else if (answerLength > 8) difficultyScore += 0.2
  else if (answerLength > 6) difficultyScore += 0.15
  else if (answerLength > 4) difficultyScore += 0.1

  // UPDATED: Blank sentence complexity (instead of context)
  const blankLength = blank.split(' ').length
  if (blankLength > 25) difficultyScore += 0.1
  else if (blankLength > 20) difficultyScore += 0.08
  else if (blankLength > 15) difficultyScore += 0.05

  // Word complexity based on length - longer words are typically more complex
  if (answer.length > 12) difficultyScore += 0.15
  else if (answer.length > 9) difficultyScore += 0.1

  // Proper noun detection (capitalized words)
  const isProperNoun = /^[A-Z][a-z]+$/.test(answer)
  if (isProperNoun) difficultyScore += 0.1

  // Uncommon letters (harder to unscramble)
  const uncommonLetters = ['Q', 'X', 'Z', 'J', 'K']
  const uncommonCount = answer
    .split('')
    .filter(letter => uncommonLetters.includes(letter.toUpperCase())).length
  if (uncommonCount > 0) difficultyScore += uncommonCount * 0.05

  // Letter frequency - words with repeated letters might be easier
  const letterCounts = {}
  answer.split('').forEach(letter => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1
  })
  const maxRepeats = Math.max(...Object.values(letterCounts))
  if (maxRepeats > 2) difficultyScore -= 0.05 // Slightly easier if letters repeat

  return Math.min(0.99, Math.max(0.01, Math.round(difficultyScore * 100) / 100))
}

// Existing calculation functions (unchanged)
const calculateExpectedTime = (questions, gameType) => {
  const config = GAME_CONFIGS[gameType]
  if (!config) throw new Error(`Invalid game type: ${gameType}`)

  const totalDifficultyFactor = questions.reduce(
    (sum, question) => sum + parseFloat(question.difficulty || 0.5),
    0,
  )
  const avgDifficulty = totalDifficultyFactor / questions.length

  return Math.round(
    config.BASELINE_TIME_PER_QUESTION * questions.length * avgDifficulty,
  )
}

const calculateApparentTimeTaken = (
  timeTaken,
  activeTimeDilation,
  gameType,
) => {
  const config = GAME_CONFIGS[gameType]
  if (!config) throw new Error(`Invalid game type: ${gameType}`)

  let adjustedTime = timeTaken

  // Apply time dilation if active
  if (activeTimeDilation) {
    adjustedTime =
      (timeTaken * config.BASE_TIME_WINDOW) /
      (config.BASE_TIME_WINDOW + (activeTimeDilation?.additionalTime || 30))
  }

  // Anti-cheat for very fast times
  return adjustedTime <= 10 && !activeTimeDilation
    ? Math.ceil((adjustedTime * adjustedTime) / 2 - 10 * adjustedTime + 60)
    : adjustedTime
}

const calculateEnhancedRQM = (
  gameType,
  performance,
  timeTaken,
  totalItems,
  activeTimeDilation,
) => {
  const config = GAME_CONFIGS[gameType]
  if (!config) throw new Error(`Invalid game type: ${gameType}`)

  const apparentTimeTaken = calculateApparentTimeTaken(
    timeTaken,
    activeTimeDilation,
    gameType,
  )

  const expectedTime = config.BASELINE_TIME_PER_QUESTION * totalItems

  // Time factor calculation with game-specific multiplier
  const timeFactor =
    Math.min(expectedTime / apparentTimeTaken, 2) * config.timeMultiplier

  // Base score calculation
  let adjustedScore =
    performance.accuracy * (1 + (performance.difficulty - 0.5))
  adjustedScore *= config.difficultyMultiplier
  adjustedScore *= config.skillComplexity

  if (performance.correctCount === totalItems) {
    adjustedScore *= config.ALL_CORRECT_BONUS
  } else if (performance.correctCount === totalItems - 1) {
    adjustedScore *= config.ONE_WRONG_BONUS
  }

  // Final RQM calculation
  const rqmScore = Math.ceil(
    (adjustedScore * timeFactor * config.cognitiveLoad * 150) / 2,
  )

  return {
    rqmScore,
    timeFactor: parseFloat(timeFactor.toFixed(2)),
    performanceBonus:
      performance.correctCount === totalItems
        ? config.ALL_CORRECT_BONUS
        : performance.correctCount === totalItems - 1
        ? config.ONE_WRONG_BONUS
        : 1.0,
  }
}

// UPDATED: Enhanced game data generation with removed context and proper validation
const generateEnhancedGameData = async ({
  title,
  author,
  mainText,
  articleId,
  article,
  session,
  language = 'en',
}) => {
  if (!article || !article.save || typeof article.save !== 'function') {
    throw new Error('Invalid article object - must be a Mongoose document')
  }

  if (!title || !author || !mainText || !articleId) {
    throw new Error('Missing required parameters')
  }

  try {
    const openai = new OpenAI(process.env.OPENAI_API_KEY)
    let attempts = 5
    let result
    let response

    // ADD: Language-aware prompt generation
    const getLanguageSpecificPrompt = (language, title, author, mainText) => {
      const isHindi = language === 'hi'

      const languageInstructions = isHindi
        ? `Generate ALL content in HINDI language (हिंदी में). All questions, options, statements, explanations, and content must be in Hindi. Use proper Hindi grammar and vocabulary.`
        : `Generate ALL content in ENGLISH language. All questions, options, statements, explanations, and content must be in English.`

      const exampleStructure = isHindi
        ? {
            normal_quiz_example: `"question": "लेख के अनुसार मुख्य विषय क्या है?", "options": {"a": "विकल्प 1", "b": "विकल्प 2", "c": "विकल्प 3", "d": "विकल्प 4"}, "correct": "a", "explanation": "यह सही है क्योंकि..."`,
            true_false_example: `"text": "लेख के अनुसार यह कथन सत्य है।", "correct": true, "explanation": "यह सत्य है क्योंकि..."`,
            word_weaver_example: `"blank": "भारत की राजधानी _____ है।", "answer": "दिल्ली"`,
            connections_example: `"concepts": ["अवधारणा1", "अवधारणा2", "अवधारणा3", "अवधारणा4"], "reasoning": "ये दोनों अवधारणाएं इसलिए जुड़ी हैं कि..."`,
          }
        : {
            normal_quiz_example: `"question": "What is the main topic according to the article?", "options": {"a": "Option 1", "b": "Option 2", "c": "Option 3", "d": "Option 4"}, "correct": "a", "explanation": "This is correct because..."`,
            true_false_example: `"text": "According to the article, this statement is true.", "correct": true, "explanation": "This is true because..."`,
            word_weaver_example: `"blank": "The capital of India is _____.", "answer": "DELHI"`,
            connections_example: `"concepts": ["Concept1", "Concept2", "Concept3", "Concept4"], "reasoning": "These concepts are connected because..."`,
          }

      return `Title: ${title}
Author: ${author}
MainText: ${mainText}

${languageInstructions}

Generate comprehensive game data for multiple quiz types based on this article. Return a JSON object with the following structure:

{
  "title": "${isHindi ? 'लेख का शीर्षक' : 'Article title'}",
  "description": "${isHindi ? 'संक्षिप्त विवरण' : 'Brief description'}",
  "category": "${isHindi ? 'लेख श्रेणी' : 'article category'}",
  "normal_quiz": {
    "questions": [
      {
        ${exampleStructure.normal_quiz_example}
      }
    ]
  },
  "true_false": {
    "statements": [
      {
        ${exampleStructure.true_false_example}
      }
    ]
  },
  "word_weaver": {
    "questions": [
      {
        ${exampleStructure.word_weaver_example}
      }
    ]
  },
  "connections": {
    "concepts": [${
      exampleStructure.connections_example.split('"concepts":')[1].split(',')[0]
    }, "Concept5", "Concept6", "Concept7", "Concept8"],
    "overallDifficulty": 0.65,
    "validConnections": [
      {
        "from": "Concept1",
        "to": "Concept2",
        ${exampleStructure.connections_example.split('"reasoning":')[1]},
        "difficulty": 0.45,
        "connectionType": "category_example"
      },
      {
        "from": "Concept3",
        "to": "Concept4",
        "reasoning": "${
          isHindi
            ? 'विस्तृत स्पष्टीकरण के साथ लेख-विशिष्ट संदर्भ।'
            : 'COMPREHENSIVE explanation of the connection with specific article references.'
        }",
        "difficulty": 0.72,
        "connectionType": "cause_effect"
      },
      {
        "from": "Concept5",
        "to": "Concept6",
        "reasoning": "${
          isHindi
            ? 'रिश्ते की गहरी समझ दिखाने वाला पूर्ण तर्क।'
            : 'THOROUGH reasoning that demonstrates deep understanding of relationship.'
        }",
        "difficulty": 0.58,
        "connectionType": "functional"
      },
      {
        "from": "Concept7",
        "to": "Concept8",
        "reasoning": "${
          isHindi
            ? 'लेख-विशिष्ट संदर्भ के साथ रिश्ते का विस्तृत विश्लेषण।'
            : 'DETAILED analysis of the relationship with article-specific context.'
        }",
        "difficulty": 0.81,
        "connectionType": "opposing"
      }
    ]
  }
}

Requirements:
- Normal quiz: EXACTLY 5 questions with 4 options each
- True/False: EXACTLY 7 statements
- Word Weaver: EXACTLY 5 fill-in-the-blank questions with SINGLE WORD answers only
- Connections: EXACTLY 8 concepts with EXACTLY 4 valid connections forming perfect pairs

${isHindi ? 'हिंदी भाषा की आवश्यकताएं:' : 'LANGUAGE REQUIREMENTS:'}
- ${
        isHindi
          ? 'सभी प्रश्न, विकल्प, कथन, और स्पष्टीकरण हिंदी में होने चाहिए'
          : 'All questions, options, statements, and explanations must be in the specified language'
      }
- ${
        isHindi
          ? 'उचित हिंदी व्याकरण और शब्दावली का उपयोग करें'
          : 'Use proper grammar and vocabulary for the language'
      }
- ${
        isHindi
          ? 'तकनीकी शब्दों के लिए उनके हिंदी समकक्ष का उपयोग करें जहाँ संभव हो'
          : 'Use appropriate technical terms for the language context'
      }

CRITICAL WORD WEAVER REQUIREMENTS:
- ${
        isHindi
          ? 'लेख के वास्तविक वाक्यों/कथनों को चुनें'
          : 'MUST pick exact sentences/statements from the provided article text'
      }
- ${
        isHindi
          ? 'केवल एक महत्वपूर्ण शब्द को _____ से बदलें'
          : 'Replace only ONE significant word from the exact sentence with _____ (exactly 5 underscores)'
      }
- ${
        isHindi
          ? 'हटाया गया शब्द एक ही शब्द होना चाहिए (कोई स्पेस नहीं)'
          : 'The removed word must be a single word (no spaces, no phrases)'
      }
- ${
        isHindi
          ? 'शब्द की लंबाई 4-12 अक्षर होनी चाहिए'
          : 'Word length should be 4-12 letters'
      }
- ${
        isHindi
          ? 'लेख की मूल वाक्य संरचना का उपयोग करें'
          : 'Use the exact sentence structure from the article'
      }

${isHindi ? 'सामान्य प्रश्न आवश्यकताएं:' : 'CRITICAL NORMAL QUIZ REQUIREMENTS:'}
- ${
        isHindi
          ? 'प्रश्न लेख की समझ का परीक्षण करें'
          : 'Questions must test comprehension of article content'
      }
- ${
        isHindi
          ? 'तथ्यात्मक, विश्लेषणात्मक, और अनुमानित प्रश्न शामिल करें'
          : 'Include variety: factual, analytical, and inferential questions'
      }
- ${
        isHindi
          ? 'विकल्प संभावित लेकिन स्पष्ट रूप से अलग होने चाहिए'
          : 'Options should be plausible but clearly distinguishable'
      }
- ${
        isHindi
          ? 'स्पष्टीकरण में लेख की विशिष्ट सामग्री का संदर्भ दें'
          : 'Explanations should reference specific article content'
      }

${isHindi ? 'सत्य/असत्य आवश्यकताएं:' : 'CRITICAL TRUE/FALSE REQUIREMENTS:'}
- ${
        isHindi
          ? 'कथन लेख की सामग्री से सीधे सत्यापित होने चाहिए'
          : 'Statements must be directly verifiable from article content'
      }
- ${
        isHindi
          ? 'स्पष्ट सत्य, स्पष्ट असत्य, और सूक्ष्म भ्रामक कथन मिलाएं'
          : 'Mix obviously true, obviously false, and subtly misleading statements'
      }
- ${
        isHindi
          ? 'पूर्ण शब्दों से बचें जब तक कि लेख में विशेष रूप से न कहा गया हो'
          : 'Avoid absolute terms unless specifically stated in article'
      }

${isHindi ? 'कनेक्शन आवश्यकताएं:' : 'CRITICAL CONNECTION REQUIREMENTS:'}
- ${
        isHindi
          ? 'लेख से बिल्कुल 8 अलग, महत्वपूर्ण अवधारणाएं प्रदान करें'
          : 'MUST provide exactly 8 distinct, important concepts from the article'
      }
- ${
        isHindi
          ? 'बिल्कुल 4 कनेक्शन बनाएं जो सभी 8 अवधारणाओं को जोड़ें'
          : 'Create EXACTLY 4 connections that pair up all 8 concepts'
      }
- ${
        isHindi
          ? 'प्रत्येक अवधारणा बिल्कुल एक कनेक्शन में दिखाई देनी चाहिए'
          : 'Each concept appears in EXACTLY ONE connection (no reuse)'
      }

- ${
        isHindi
          ? 'प्रश्न प्रकारों और कठिनाई में विविधता सुनिश्चित करें'
          : 'Ensure variety in question types and difficulty'
      }
- ${
        isHindi
          ? 'सभी सामग्री सीधे लेख की सामग्री से ली जानी चाहिए'
          : 'All content must be derived directly from the provided article text'
      }
- ${
        isHindi
          ? 'स्पष्ट स्पष्टीकरण प्रदान करें जो लेख की सामग्री का संदर्भ दें'
          : 'Provide clear explanations that reference article content'
      }
- ${
        isHindi
          ? 'वर्ड वीवर उत्तर केवल एक शब्द होने चाहिए'
          : 'Word Weaver answers must be single words only (no spaces, no phrases)'
      }`
    }

    // Generate the appropriate prompt based on language
    const prompt = getLanguageSpecificPrompt(language, title, author, mainText)

    while (attempts-- > 0) {
      try {
        result = await openai.chat.completions.create({
          model: 'gpt-4.1-nano',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an educational game generator. Create comprehensive quiz content based on articles. ${
                language === 'hi'
                  ? 'Generate ALL content in HINDI language (हिंदी में). Use proper Hindi grammar, vocabulary, and sentence structure.'
                  : 'Generate ALL content in ENGLISH language.'
              } For Word Weaver, create fill-in-the-blank sentences - each sentence must be self-contained and meaningful.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        })

        let responseText = result.choices[0].message.content
        responseText = responseText.replace(/```json|```/g, '').trim()
        response = JSON.parse(responseText)

        // Enhanced Word Weaver validation (language-agnostic)
        if (response.word_weaver?.questions) {
          response.word_weaver.questions = response.word_weaver.questions
            .map(q => {
              if (!q.blank || typeof q.blank !== 'string') {
                console.warn('Invalid blank format, skipping question')
                return null
              }

              const blankCount = (q.blank.match(/_____/g) || []).length
              if (blankCount !== 1) {
                console.warn(
                  `Invalid blank count (${blankCount}), must have exactly one _____ placeholder, skipping question`,
                )
                return null
              }

              if (q.blank.split(' ').length < 5) {
                // Reduced requirement for Hindi
                console.warn('Blank sentence too short, skipping question')
                return null
              }

              let cleanAnswer = q.answer.replace(/\s+/g, '').toUpperCase()
              if (cleanAnswer.length < 2 || cleanAnswer.length > 15) {
                // Adjusted for Hindi
                console.warn('Invalid answer length, skipping question')
                return null
              }

              return {
                blank: q.blank,
                answer: cleanAnswer,
              }
            })
            .filter(Boolean)
        }

        // Enhanced validation with language-specific logging
        if (
          response &&
          response.normal_quiz?.questions?.length === 5 &&
          response.true_false?.statements?.length === 7 &&
          response.word_weaver?.questions?.length === 5 &&
          response.connections?.concepts?.length === 8 &&
          response.connections?.validConnections?.length === 4
        ) {
          // Validate connections structure (language-agnostic)
          const concepts = response.connections.concepts
          const connections = response.connections.validConnections

          const uniqueConcepts = new Set(concepts)
          if (uniqueConcepts.size !== 8) {
            throw new Error('Connections must have exactly 8 unique concepts')
          }

          const usedConcepts = new Set()
          const invalidConnections = []

          connections.forEach((conn, index) => {
            if (!concepts.includes(conn.from) || !concepts.includes(conn.to)) {
              invalidConnections.push(
                `Connection ${index + 1}: Uses invalid concept`,
              )
            }

            if (usedConcepts.has(conn.from)) {
              invalidConnections.push(
                `Connection ${index + 1}: "${conn.from}" already used`,
              )
            }
            if (usedConcepts.has(conn.to)) {
              invalidConnections.push(
                `Connection ${index + 1}: "${conn.to}" already used`,
              )
            }

            if (conn.from === conn.to) {
              invalidConnections.push(
                `Connection ${index + 1}: Self-connection not allowed`,
              )
            }

            usedConcepts.add(conn.from)
            usedConcepts.add(conn.to)
          })

          if (usedConcepts.size !== 8) {
            invalidConnections.push(
              `Only ${usedConcepts.size} of 8 concepts used in connections`,
            )
          }

          if (invalidConnections.length > 0) {
            console.error('Invalid connections structure:', invalidConnections)
            throw new Error(
              `Invalid connections: ${invalidConnections.join('; ')}`,
            )
          }

          console.log(`✓ Game data validation passed for ${language}:`, {
            language: language,
            conceptCount: concepts.length,
            connectionCount: connections.length,
            allConceptsUsed: usedConcepts.size === 8,
            perfectPairs: connections.length === 4,
          })

          // Process and add automatic difficulty calculations
          const processedData = processGameDataWithDifficulties(response)

          // Add word length for Word Weaver questions
          if (processedData.word_weaver?.questions) {
            processedData.word_weaver.questions =
              processedData.word_weaver.questions.map(q => {
                const wordLength = q.answer.replace(/\s+/g, '').length
                return {
                  ...q,
                  wordLength: wordLength,
                }
              })
          }

          // Create GameData document with proper language setting
          const newGameData = new GameData({
            title: processedData.title || title,
            description: processedData.description || '',
            category: processedData.category || article.category || 'general',
            article: articleId,
            normal_quiz: processedData.normal_quiz,
            true_false: processedData.true_false,
            word_weaver: processedData.word_weaver,
            connections: processedData.connections,
            language: language, // Ensure language is set correctly
          })

          await newGameData.save({ session })

          console.log(
            `Game data saved for ${language} with word weaver questions:`,
            newGameData.word_weaver?.questions?.map(q => ({
              blank: q.blank.substring(0, 50) + '...',
              answer: q.answer,
              wordLength: q.wordLength,
              hasExactlyOneBlank: (q.blank.match(/_____/g) || []).length === 1,
              language: language,
            })),
          )

          return newGameData
        } else {
          // Enhanced error message for debugging
          const issues = []
          if (
            !response.normal_quiz?.questions?.length ||
            response.normal_quiz.questions.length !== 5
          ) {
            issues.push(
              `Normal quiz: ${
                response.normal_quiz?.questions?.length || 0
              }/5 questions`,
            )
          }
          if (
            !response.true_false?.statements?.length ||
            response.true_false.statements.length !== 7
          ) {
            issues.push(
              `True/False: ${
                response.true_false?.statements?.length || 0
              }/7 statements`,
            )
          }
          if (
            !response.word_weaver?.questions?.length ||
            response.word_weaver.questions.length !== 5
          ) {
            issues.push(
              `Word Weaver: ${
                response.word_weaver?.questions?.length || 0
              }/5 questions (after validation)`,
            )
          }
          if (
            !response.connections?.concepts?.length ||
            response.connections.concepts.length !== 8
          ) {
            issues.push(
              `Connections concepts: ${
                response.connections?.concepts?.length || 0
              }/8 (must be exactly 8)`,
            )
          }
          if (
            !response.connections?.validConnections?.length ||
            response.connections.validConnections.length !== 4
          ) {
            issues.push(
              `Connections pairs: ${
                response.connections?.validConnections?.length || 0
              }/4 (must be exactly 4)`,
            )
          }

          throw new Error(
            `Invalid response format for ${language}. Issues: ${issues.join(
              ', ',
            )}`,
          )
        }
      } catch (err) {
        console.error(
          `Error during OpenAI API call for ${language}:`,
          err.message,
        )
      }
    }
    throw new Error(
      `Failed to generate game data for ${language} after multiple attempts`,
    )
  } catch (error) {
    console.error(`Error generating enhanced game data for ${language}:`, error)
    throw error
  }
}

// UPDATED: Process game data and add automatic difficulty calculations (without context)
const processGameDataWithDifficulties = rawGameData => {
  const processedData = { ...rawGameData }

  // Process normal quiz questions
  if (processedData.normal_quiz?.questions) {
    processedData.normal_quiz.questions =
      processedData.normal_quiz.questions.map(q => ({
        ...q,
        difficulty: calculateQuestionDifficulty(q.question, q.options),
      }))
  }

  // Process true/false statements
  if (processedData.true_false?.statements) {
    processedData.true_false.statements =
      processedData.true_false.statements.map(s => ({
        ...s,
        difficulty: calculateTrueFalseDifficulty(s.text),
      }))
  }

  // UPDATED: Process word weaver questions without context
  if (processedData.word_weaver?.questions) {
    processedData.word_weaver.questions =
      processedData.word_weaver.questions.map(q => ({
        ...q,
        difficulty: calculateWordWeaverDifficulty(q.blank, q.answer),
      }))
  }

  return processedData
}

// UPDATED: Save enhanced quiz attempt (remove context handling)
const saveEnhancedQuizAttempt = async ({
  userId,
  articleId,
  sessionId,
  gameDataId,
  gameType,
  userResponses,
  questions,
  timeTaken,
  activeTimeDilation,
  session,
}) => {
  try {
    const config = GAME_CONFIGS[gameType]
    if (!config) throw new Error(`Invalid game type: ${gameType}`)

    // Calculate performance metrics
    let correctCount = 0
    let totalItems = questions.length

    // Calculate accuracy based on game type
    switch (gameType) {
      case 'normal_quiz':
      case 'true_false':
        correctCount = userResponses.filter(
          response => response.isCorrect,
        ).length
        break
      case 'word_weaver':
        correctCount = userResponses.filter(
          response => response.isCorrect,
        ).length
        break
      case 'connections':
        correctCount = userResponses.reduce((count, response) => {
          return (
            count +
            (response.connections?.filter(conn => conn.isValid).length || 0)
          )
        }, 0)
        totalItems = userResponses.reduce((total, response) => {
          return total + (response.connections?.length || 0)
        }, 0)
        break
    }

    const accuracy = totalItems > 0 ? correctCount / totalItems : 0

    // Calculate average difficulty
    const avgDifficulty =
      questions.reduce((sum, q) => sum + (q.difficulty || 0.5), 0) /
      questions.length

    const performance = {
      accuracy,
      difficulty: avgDifficulty,
      correctCount,
      totalItems,
    }

    const rqmResult = calculateEnhancedRQM(
      gameType,
      performance,
      timeTaken,
      totalItems,
      activeTimeDilation,
    )

    const expectedTime = calculateExpectedTime(questions, gameType)

    // Create enhanced quiz attempt
    const enhancedAttempt = new QuizAttempt({
      user: userId,
      article: articleId,
      articleQuizSession: sessionId,
      gameData: gameDataId,
      gameType,
      responses: userResponses,
      performance,
      RQM_score: rqmResult.rqmScore,
      baseRQM_score: rqmResult.rqmScore,
      articleDifficulty: avgDifficulty,
      timeTaken,
      expectedTime: expectedTime,
      timeFactor: rqmResult.timeFactor,
      performanceBonus: rqmResult.performanceBonus,
      timeDilationBoosted: !!activeTimeDilation,
      additionalTime: activeTimeDilation?.additionalTime || 0,
      season: parseInt(require('../configService').getCurrentSeason(), 10),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    })

    await enhancedAttempt.save({ session })
    return enhancedAttempt
  } catch (error) {
    console.error('Error saving enhanced quiz attempt:', error)
    throw error
  }
}

module.exports = {
  calculateQuestionDifficulty,
  calculateTrueFalseDifficulty,
  calculateWordWeaverDifficulty,
  calculateEnhancedRQM,
  generateEnhancedGameData,
  processGameDataWithDifficulties,
  saveEnhancedQuizAttempt,
  GAME_CONFIGS,
}
