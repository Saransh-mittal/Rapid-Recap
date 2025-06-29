// utils/enhancedQuiz.utils.js
const OpenAI = require('openai')
const GameData = require('../model/gameDataSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const { calculateArticleDifficulty } = require('./article.utils')

// RQM Calculation Constants
const BASELINE_TIME_PER_QUESTION = 10
const ALL_CORRECT_BONUS = 1.2
const ONE_WRONG_BONUS = 1.1
const BASE_TIME_WINDOW = 50

// Game configurations
const GAME_CONFIGS = {
  normal_quiz: {
    timeLimit: 50,
    itemCount: 5,
    difficultyMultiplier: 1.0,
    timeMultiplier: 1.0,
    skillComplexity: 1.0,
    cognitiveLoad: 1.0,
  },
  true_false: {
    timeLimit: 35,
    itemCount: 7,
    difficultyMultiplier: 0.85,
    timeMultiplier: 1.4,
    skillComplexity: 0.8,
    cognitiveLoad: 0.75,
  },
  word_weaver: {
    timeLimit: 100,
    itemCount: 5,
    difficultyMultiplier: 1.1,
    timeMultiplier: 0.9,
    skillComplexity: 1.05,
    cognitiveLoad: 1.05,
  },
  connections: {
    timeLimit: 80,
    itemCount: 4,
    difficultyMultiplier: 1.2,
    timeMultiplier: 0.8,
    skillComplexity: 1.25,
    cognitiveLoad: 1.3,
  },
}

// Automatic Difficulty Calculation Functions
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

const calculateWordWeaverDifficulty = (context, answer) => {
  let difficultyScore = 0.4 // Base difficulty (word puzzles are inherently challenging)

  // Answer word length (longer words are harder)
  const answerLength = answer.length
  if (answerLength > 10) difficultyScore += 0.25
  else if (answerLength > 8) difficultyScore += 0.2
  else if (answerLength > 6) difficultyScore += 0.15
  else if (answerLength > 4) difficultyScore += 0.1

  // Context complexity
  const contextLength = context.split(' ').length
  if (contextLength > 25) difficultyScore += 0.1
  else if (contextLength > 20) difficultyScore += 0.08
  else if (contextLength > 15) difficultyScore += 0.05

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

// Enhanced RQM Calculation
const calculateEnhancedRQM = (
  gameType,
  performance,
  timeTaken,
  totalItems,
  activeTimeDilation,
) => {
  const config = GAME_CONFIGS[gameType]
  const expectedTime = config.timeLimit

  // Calculate apparent time (anti-cheat for very fast times)
  const apparentTimeTaken =
    timeTaken <= 10
      ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
      : timeTaken

  // Time factor calculation
  const timeFactor =
    Math.min(expectedTime / apparentTimeTaken, 2) * config.timeMultiplier

  // Base score calculation
  let adjustedScore =
    performance.accuracy * (1 + (performance.difficulty - 0.5))
  adjustedScore *= config.difficultyMultiplier
  adjustedScore *= config.skillComplexity

  // Performance bonuses
  if (performance.correctCount === totalItems) {
    adjustedScore *= ALL_CORRECT_BONUS
  } else if (performance.correctCount === totalItems - 1) {
    adjustedScore *= ONE_WRONG_BONUS
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
        ? ALL_CORRECT_BONUS
        : performance.correctCount === totalItems - 1
        ? ONE_WRONG_BONUS
        : 1.0,
  }
}

const generateEnhancedGameData = async ({
  title,
  author,
  mainText,
  articleId,
  article,
  emitProgress,
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

    const prompt = `Title: ${title}
Author: ${author}
MainText: ${mainText}

Generate comprehensive game data for multiple quiz types based on this article. Return a JSON object with the following structure:

{
  "title": "Article title",
  "description": "Brief description",
  "category": "article category",
  "normal_quiz": {
    "questions": [
      {
        "question": "Question text",
        "options": {"a": "option1", "b": "option2", "c": "option3", "d": "option4"},
        "correct": "a",
        "explanation": "Why this is correct"
      }
    ]
  },
  "true_false": {
    "statements": [
      {
        "text": "Statement to evaluate",
        "correct": true,
        "explanation": "Explanation"
      }
    ]
  },
  "word_weaver": {
    "questions": [
      {
        "context": "Brief context from article",
        "blank": "Exact sentence from article with one word replaced by blank: The _______ was significant.",
        "answer": "SINGLEWORD"
      }
    ]
  },
  "connections": {
    "concepts": ["Concept1", "Concept2", "Concept3", "Concept4", "Concept5", "Concept6"],
    "validConnections": [
      {
        "from": "Concept1",
        "to": "Concept2",
        "reasoning": "How they connect"
      }
    ]
  }
}

Requirements:
- Normal quiz: 5 questions with 4 options each
- True/False: 7 statements
- Word Weaver: 5 fill-in-the-blank questions with SINGLE WORD answers only
- Connections: 6 concepts with 4-5 valid connections
- All content must be derived from the article
- Provide explanations for normal quiz and true/false

CRITICAL WORD WEAVER REQUIREMENTS:
- MUST pick exact sentences/statements from the provided article text
- Replace only ONE significant word from the exact sentence with a blank (_______)
- The removed word must be a single word (no spaces, no phrases)
- Word length should be 4-12 letters
- Use the exact sentence structure from the article
- Context should be 1-2 sentences before the blank sentence from the article
- The blank sentence should flow naturally from the context
- Choose sentences that contain important keywords, concepts, or facts
- Prioritize sentences with nouns, verbs, or adjectives that are central to the article's meaning
- Example format:
  * Context: "Previous sentence from article for background."
  * Blank: "The exact sentence from article with _______ replaced."
  * Answer: "REPLACEDWORD"

- Ensure variety in question types and difficulty
- Word Weaver answers must be single words only (no spaces, no phrases)
- Word Weaver blanks should clearly indicate one word is needed`

    emitProgress && emitProgress(40)

    while (attempts-- > 0) {
      try {
        result = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are an educational game generator. Create comprehensive quiz content based on articles. For Word Weaver, ensure all answers are single words only.',
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

        // Validate and clean Word Weaver answers to ensure single words
        if (response.word_weaver?.questions) {
          response.word_weaver.questions = response.word_weaver.questions
            .map(q => {
              let cleanAnswer = q.answer.replace(/\s+/g, '').toUpperCase()
              // Ensure it's a single word and reasonable length
              if (cleanAnswer.length < 3 || cleanAnswer.length > 15) {
                // Skip invalid answers - they'll be filtered out later
                return null
              }
              return {
                ...q,
                answer: cleanAnswer,
              }
            })
            .filter(Boolean) // Remove null entries
        }

        // Validate response structure
        if (
          response &&
          response.normal_quiz?.questions?.length >= 3 &&
          response.true_false?.statements?.length >= 5 &&
          response.word_weaver?.questions?.length >= 3 &&
          response.connections?.concepts?.length >= 4
        ) {
          // Process and add automatic difficulty calculations
          const processedData = processGameDataWithDifficulties(response)

          // FIXED: Add shuffled letters for Word Weaver questions
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

          // Create GameData document
          const newGameData = new GameData({
            title: processedData.title || title,
            description: processedData.description || '',
            category: processedData.category || article.category || 'general',
            article: articleId,
            normal_quiz: processedData.normal_quiz,
            true_false: processedData.true_false,
            word_weaver: processedData.word_weaver,
            connections: processedData.connections,
            language: language,
          })

          await newGameData.save({ session })
          emitProgress && emitProgress(80)

          console.log(
            'Game data saved with word weaver questions:',
            newGameData.word_weaver?.questions?.map(q => ({
              answer: q.answer,
              shuffledLettersCount: q.shuffledLetters?.length,
              wordLength: q.wordLength,
            })),
          )

          return newGameData
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Error during OpenAI API call:', err.message)
      }
    }
    throw new Error('Failed to generate game data after multiple attempts')
  } catch (error) {
    console.error('Error generating enhanced game data:', error)
    throw error
  }
}

// Process game data and add automatic difficulty calculations
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

  // Process word weaver questions
  if (processedData.word_weaver?.questions) {
    processedData.word_weaver.questions =
      processedData.word_weaver.questions.map(q => ({
        ...q,
        difficulty: calculateWordWeaverDifficulty(q.context, q.answer),
      }))
  }

  return processedData
}

// Save enhanced quiz attempt
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

    // Calculate enhanced RQM
    const rqmResult = calculateEnhancedRQM(
      gameType,
      performance,
      timeTaken,
      totalItems,
      activeTimeDilation,
    )

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
      expectedTime: GAME_CONFIGS[gameType].timeLimit,
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
