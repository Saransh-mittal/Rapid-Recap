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

    // UPDATED: Prompt without context requirement and with proper fill-in-blank validation
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
        "blank": "Complete sentence from article with EXACTLY ONE word replaced by _____: The _____ was significant in the development.",
        "answer": "SINGLEWORD"
      }
    ]
  },
  "connections": {
    "concepts": ["Concept1", "Concept2", "Concept3", "Concept4", "Concept5", "Concept6", "Concept7", "Concept8"],
    "overallDifficulty": 0.65,
    "validConnections": [
      {
        "from": "Concept1",
        "to": "Concept2",
        "reasoning": "DETAILED reasoning explaining how these concepts connect based on article content.",
        "difficulty": 0.45,
        "connectionType": "category_example"
      },
      {
        "from": "Concept3",
        "to": "Concept4",
        "reasoning": "COMPREHENSIVE explanation of the connection with specific article references.",
        "difficulty": 0.72,
        "connectionType": "cause_effect"
      },
      {
        "from": "Concept5",
        "to": "Concept6",
        "reasoning": "THOROUGH reasoning that demonstrates deep understanding of relationship.",
        "difficulty": 0.58,
        "connectionType": "functional"
      },
      {
        "from": "Concept7",
        "to": "Concept8",
        "reasoning": "DETAILED analysis of the relationship with article-specific context.",
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

CRITICAL WORD WEAVER REQUIREMENTS - NO CONTEXT NEEDED:
- MUST pick exact sentences/statements from the provided article text
- Replace only ONE significant word from the exact sentence with _____ (exactly 5 underscores)
- The removed word must be a single word (no spaces, no phrases)
- Word length should be 4-12 letters
- Use the exact sentence structure from the article
- The sentence must be complete and self-explanatory without additional context
- Choose sentences that are clear and meaningful on their own
- Prioritize sentences with nouns, verbs, or adjectives that are central to the article's meaning
- Each blank sentence must contain EXACTLY ONE _____ placeholder
- The sentence should make grammatical sense with the blank
- Choose important keywords, concepts, or facts from the article

WORD WEAVER VALIDATION REQUIREMENTS:
- Each "blank" field must contain exactly one _____ (5 underscores)
- The sentence must be grammatically correct
- The sentence must be at least 10 words long
- The answer must be a single word (4-8 characters, no spaces)
- The sentence should be self-contained and understandable

CRITICAL NORMAL QUIZ REQUIREMENTS:
- Questions must test comprehension of article content
- Include variety: factual, analytical, and inferential questions
- Options should be plausible but clearly distinguishable
- Explanations should reference specific article content

CRITICAL TRUE/FALSE REQUIREMENTS:
- Statements must be directly verifiable from article content
- Mix obviously true, obviously false, and subtly misleading statements
- Avoid absolute terms unless specifically stated in article
- Include both factual and conceptual statements

CRITICAL CONNECTION REQUIREMENTS:
- MUST provide exactly 8 distinct, important concepts from the article
- Create EXACTLY 4 connections that pair up all 8 concepts
- Each concept appears in EXACTLY ONE connection (no reuse)
- Each connection must represent a meaningful relationship from the article

- Ensure variety in question types and difficulty
- All content must be derived directly from the provided article text
- Provide clear explanations that reference article content
- Word Weaver answers must be single words only (no spaces, no phrases)`

    while (attempts-- > 0) {
      try {
        result = await openai.chat.completions.create({
          model: 'gpt-4.1-nano',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are an educational game generator. Create comprehensive quiz content based on articles. For Word Weaver, create fill-in-the-blank sentences without context - each sentence must be self-contained and meaningful.',
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

        // UPDATED: Enhanced Word Weaver validation without context
        if (response.word_weaver?.questions) {
          response.word_weaver.questions = response.word_weaver.questions
            .map(q => {
              // Validate blank format
              if (!q.blank || typeof q.blank !== 'string') {
                console.warn('Invalid blank format, skipping question')
                return null
              }

              // Check for exactly one _____ placeholder
              const blankCount = (q.blank.match(/_____/g) || []).length
              if (blankCount !== 1) {
                console.warn(
                  `Invalid blank count (${blankCount}), must have exactly one _____ placeholder, skipping question`,
                )
                return null
              }

              // Check minimum sentence length
              if (q.blank.split(' ').length < 10) {
                console.warn('Blank sentence too short, skipping question')
                return null
              }

              // Validate answer
              let cleanAnswer = q.answer.replace(/\s+/g, '').toUpperCase()
              if (cleanAnswer.length < 3 || cleanAnswer.length > 15) {
                console.warn('Invalid answer length, skipping question')
                return null
              }

              return {
                blank: q.blank,
                answer: cleanAnswer,
              }
            })
            .filter(Boolean) // Remove null entries
        }

        // Enhanced validation with proper Word Weaver checks
        if (
          response &&
          response.normal_quiz?.questions?.length === 5 &&
          response.true_false?.statements?.length === 7 &&
          response.word_weaver?.questions?.length === 5 && // Must have valid questions after filtering
          response.connections?.concepts?.length === 8 &&
          response.connections?.validConnections?.length === 4
        ) {
          // Additional validation for connections game (existing code)
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

          const unusedConcepts = concepts.filter(
            concept => !usedConcepts.has(concept),
          )
          if (unusedConcepts.length > 0) {
            invalidConnections.push(
              `Unused concepts: ${unusedConcepts.join(', ')}`,
            )
          }

          if (invalidConnections.length > 0) {
            console.error('Invalid connections structure:', invalidConnections)
            throw new Error(
              `Invalid connections: ${invalidConnections.join('; ')}`,
            )
          }

          console.log('✓ Connections validation passed:', {
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

          console.log(
            'Game data saved with word weaver questions (no context):',
            newGameData.word_weaver?.questions?.map(q => ({
              blank: q.blank.substring(0, 50) + '...',
              answer: q.answer,
              wordLength: q.wordLength,
              hasExactlyOneBlank: (q.blank.match(/_____/g) || []).length === 1,
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
              }/3+ questions`,
            )
          }
          if (
            !response.true_false?.statements?.length ||
            response.true_false.statements.length !== 7
          ) {
            issues.push(
              `True/False: ${
                response.true_false?.statements?.length || 0
              }/5+ statements`,
            )
          }
          if (
            !response.word_weaver?.questions?.length ||
            response.word_weaver.questions.length !== 5
          ) {
            issues.push(
              `Word Weaver: ${
                response.word_weaver?.questions?.length || 0
              }/3+ questions (after validation)`,
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
            `Invalid response format. Issues: ${issues.join(', ')}`,
          )
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
