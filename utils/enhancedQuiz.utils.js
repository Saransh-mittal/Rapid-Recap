// utils/enhancedQuiz.utils.js - UPDATED: Remove context and add proper validation
const OpenAI = require('openai')
const GameData = require('../model/gameDataSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const { calculateArticleDifficulty } = require('./article.utils')
const connectionTypes = require('../data/connectionGameTypes')
const {
  containsHindi,
  getHindiDisplayLength,
  segmentHindiText,
} = require('./hindiText.utils')

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
    BASE_TIME_WINDOW: 72,
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

  if (!answer || typeof answer !== 'string') {
    return Math.min(
      0.99,
      Math.max(0.01, Math.round(difficultyScore * 100) / 100),
    )
  }

  const cleanAnswer = answer.replace(/\s+/g, '').trim()
  const isHindiWord = containsHindi(cleanAnswer)

  if (isHindiWord) {
    // Hindi-specific difficulty calculation
    try {
      const hindiUnits = segmentHindiText(cleanAnswer)
      const wordLength = hindiUnits.length

      // Answer unit length (longer words are harder in Hindi)
      if (wordLength > 8) difficultyScore += 0.25
      else if (wordLength > 6) difficultyScore += 0.2
      else if (wordLength > 4) difficultyScore += 0.15
      else if (wordLength > 3) difficultyScore += 0.1

      // Complex matras and conjuncts make Hindi words harder
      const complexMatras = ['ौ', 'ै', 'ी', 'ू', 'ृ', 'ॄ', 'ॢ', 'ॣ']
      const conjunctPattern = /्[क-ह]/g // Halant followed by consonant

      let complexityCount = 0
      hindiUnits.forEach(unit => {
        // Check for complex matras
        complexMatras.forEach(matra => {
          if (unit.includes(matra)) complexityCount++
        })

        // Check for conjuncts (halant + consonant)
        if (conjunctPattern.test(unit)) complexityCount++
      })

      if (complexityCount > 0) difficultyScore += complexityCount * 0.08

      // Rare letters in Hindi
      const rareHindiLetters = ['क्ष', 'त्र', 'ज्ञ', 'श्र', 'ढ़', 'ड़', 'ऋ']
      const rareCount = rareHindiLetters.filter(rare =>
        cleanAnswer.includes(rare),
      ).length
      if (rareCount > 0) difficultyScore += rareCount * 0.1

      // Repeated units might be easier in Hindi
      const unitCounts = {}
      hindiUnits.forEach(unit => {
        unitCounts[unit] = (unitCounts[unit] || 0) + 1
      })
      const maxRepeats = Math.max(...Object.values(unitCounts))
      if (maxRepeats > 2) difficultyScore -= 0.05

      console.log('Hindi word difficulty calculation:', {
        answer: cleanAnswer,
        units: hindiUnits,
        wordLength,
        complexityCount,
        rareCount,
        maxRepeats,
        finalDifficulty: difficultyScore,
      })
    } catch (error) {
      console.error('Error calculating Hindi difficulty:', error)
      // Fallback to character-based calculation for Hindi
      const answerLength = cleanAnswer.length
      if (answerLength > 10) difficultyScore += 0.25
      else if (answerLength > 8) difficultyScore += 0.2
      else if (answerLength > 6) difficultyScore += 0.15
      else if (answerLength > 4) difficultyScore += 0.1
    }
  } else {
    // English-specific difficulty calculation (existing logic)
    const answerLength = cleanAnswer.length

    // Answer word length (longer words are harder)
    if (answerLength > 10) difficultyScore += 0.25
    else if (answerLength > 8) difficultyScore += 0.2
    else if (answerLength > 6) difficultyScore += 0.15
    else if (answerLength > 4) difficultyScore += 0.1

    // Word complexity based on length - longer words are typically more complex
    if (answerLength > 12) difficultyScore += 0.15
    else if (answerLength > 9) difficultyScore += 0.1

    // Proper noun detection (capitalized words)
    const isProperNoun = /^[A-Z][a-z]+$/.test(answer)
    if (isProperNoun) difficultyScore += 0.1

    // Uncommon letters (harder to unscramble)
    const uncommonLetters = ['Q', 'X', 'Z', 'J', 'K']
    const uncommonCount = cleanAnswer
      .split('')
      .filter(letter => uncommonLetters.includes(letter.toUpperCase())).length
    if (uncommonCount > 0) difficultyScore += uncommonCount * 0.05

    // Letter frequency - words with repeated letters might be easier
    const letterCounts = {}
    cleanAnswer.split('').forEach(letter => {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1
    })
    const maxRepeats = Math.max(...Object.values(letterCounts))
    if (maxRepeats > 2) difficultyScore -= 0.05 // Slightly easier if letters repeat
  }

  // Blank sentence complexity (applies to both languages)
  if (blank && typeof blank === 'string') {
    const blankLength = blank.split(' ').length
    if (blankLength > 25) difficultyScore += 0.1
    else if (blankLength > 20) difficultyScore += 0.08
    else if (blankLength > 15) difficultyScore += 0.05
  }

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

  const baseRQM_score = Math.ceil(
    (adjustedScore * timeFactor * config.cognitiveLoad * 150) / 2,
  )
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
    baseRQM_score,
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

// --- START: SPECIALIZED GAME GENERATION FUNCTIONS ---

const callOpenAIWithRetry = async (
  prompt,
  language,
  model = 'gpt-4.1-nano',
  attempts = 3,
) => {
  const openai = new OpenAI(process.env.OPENAI_API_KEY)
  let lastError = null

  while (attempts-- > 0) {
    try {
      const systemMessage = `You are an expert educational game generator. Create quiz content based on the provided article. ${
        language === 'hi'
          ? 'Generate ALL content in HINDI language (हिंदी में). Use proper Hindi grammar and vocabulary.'
          : 'Generate ALL content in ENGLISH language.'
      } Respond with a valid JSON object.`

      const result = await openai.chat.completions.create({
        model: model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
      })
      const responseText = result.choices[0].message.content
        .replace(/```json|```/g, '')
        .trim()
      return JSON.parse(responseText)
    } catch (err) {
      console.error(
        `Error during OpenAI API call (attempt ${3 - attempts}/3):`,
        err.message,
      )
      lastError = err
    }
  }
  throw new Error(
    `Failed to get a valid JSON response after multiple attempts. Last error: ${lastError?.message}`,
  )
}

const generateNormalQuizData = async ({
  title,
  author,
  mainText,
  language,
}) => {
  const prompt = `Based on the article titled "${title}" by ${author}, generate a JSON object for a normal quiz with high-quality, challenging multiple-choice questions.

    Article Text: """${mainText}"""

    CRITICAL REQUIREMENTS FOR HIGH-QUALITY QUIZ GENERATION:

    1. JSON STRUCTURE:
    - The JSON object must have a single key "normal_quiz"
    - The value should be an object with a "questions" array
    - Generate EXACTLY 5 multiple-choice questions
    - Each question object must have: "question", "options" (object with keys "a", "b", "c", "d"), "correct" (key of correct option), and "explanation"

    2. OPTION LENGTH CONSISTENCY:
    - ALL four options (a, b, c, d) for each question MUST be approximately the same character length
    - Target 15-40 characters per option, with maximum variance of ±5 characters between options
    - If one option is 25 characters, others should be 20-30 characters
    - Use similar sentence structures and formatting for all options

    3. CONTENT QUALITY AND DIFFICULTY:
    - ALL options must be plausible and contextually relevant to the article topic
    - Create sophisticated distractors that sound correct but contain subtle errors
    - Wrong options should be based on:
      * Common misconceptions about the topic
      * Partial truths or incomplete information
      * Similar concepts mentioned in the article but used incorrectly
      * Logical-sounding but factually wrong statements
      * Mixed-up facts from different parts of the article

    4. QUESTION DESIGN PRINCIPLES:
    - Questions should test comprehension, not just recall
    - Focus on key concepts, relationships, and implications
    - Avoid questions where answer is obvious without reading the article
    - Include questions about cause-effect, comparisons, and analysis
    - Mix question types: factual, inferential, and analytical

    5. DISTRACTOR CREATION GUIDELINES:
    - Wrong options should be BELIEVABLE and require careful consideration
    - Use numbers/dates that are close to but not exactly correct
    - Include names/terms that appear in the article but in wrong contexts
    - Create options that test common confusions about the topic
    - Make sure reading the question AND options is necessary to answer correctly

    6. LANGUAGE AND FORMATTING:
    - All content MUST be in ${language === 'hi' ? 'Hindi' : 'English'}
    - Use clear, concise language appropriate for educated readers
    - Maintain consistent terminology throughout
    - Ensure grammatical correctness and natural flow

    7. VALIDATION CHECKLIST:
    - Each question tests important article content
    - All options are similar in length and complexity
    - Wrong options are plausible but definitely incorrect
    - Correct option is unambiguously right
    - Question cannot be answered without reading both article and options carefully

    EXAMPLE OF WELL-DESIGNED QUESTION:
    {
      "question": "According to the article, what was the primary factor that led to the economic transformation?",
      "options": {
        "a": "Implementation of new trade policies",
        "b": "Introduction of advanced technology",
        "c": "Expansion of manufacturing sectors",
        "d": "Development of infrastructure projects"
      },
      "correct": "b",
      "explanation": "The article specifically states that the introduction of advanced technology was the catalyst for the economic transformation, while the other factors were secondary developments."
    }

    Notice how all options:
    - Are similar in length (32-37 characters)
    - Are all plausible economic factors
    - Require knowledge of the article to distinguish
    - Sound equally professional and specific

    FINAL STRUCTURE:
    {
      "normal_quiz": {
        "questions": [
          {
            "question": "...",
            "options": { "a": "...", "b": "...", "c": "...", "d": "..." },
            "correct": "a",
            "explanation": "..."
          }
          // ... 4 more questions
        ]
      }
    }

    Generate questions that truly challenge readers' understanding and cannot be solved through guessing or elimination based on relevance alone.`

  const response = await callOpenAIWithRetry(prompt, language)
  if (response.normal_quiz?.questions?.length === 5) {
    return processGameDataWithDifficulties(response).normal_quiz
  }
  throw new Error('Invalid normal_quiz data received from AI.')
}

const generateTrueFalseData = async ({ title, author, mainText, language }) => {
  const prompt = `Based on the article titled "${title}" by ${author}, generate a JSON object for a true/false game.
    Article Text: """${mainText}"""

    Requirements:
    - The JSON object must have a single key "true_false".
    - The value should be an object with a "statements" array.
    - Generate EXACTLY 7 true/false statements.
    - Each statement object must have: "text", "correct" (a boolean true/false), and "explanation".
    - All content MUST be in ${language === 'hi' ? 'Hindi' : 'English'}.

    Example Structure:
    {
      "true_false": {
        "statements": [
          { "text": "...", "correct": true, "explanation": "..." }
        ]
      }
    }`
  const response = await callOpenAIWithRetry(prompt, language)
  if (response.true_false?.statements?.length === 7) {
    return processGameDataWithDifficulties(response).true_false
  }
  throw new Error('Invalid true_false data received from AI.')
}

const generateWordWeaverData = async ({
  title,
  author,
  mainText,
  language,
}) => {
  const prompt = `Based on the article titled "${title}" by ${author}, generate a JSON object for a Word Weaver game.
    Article Text: """${mainText}"""

    CRITICAL REQUIREMENTS:
    - The JSON object must have a single key "word_weaver".
    - The value should be an object with a "questions" array.
    - Generate EXACTLY 5 fill-in-the-blank questions.
    - For each question:
        1. Pick an EXACT sentence from the article text.
        2. Replace ONE significant, single word (4-12 letters, no spaces) with a "_____" placeholder.
        3. The result is the "blank" value.
        4. The removed word is the "answer" value (MUST be a single word).
    - All content MUST be in ${language === 'hi' ? 'Hindi' : 'English'}.

    Example Structure:
    {
      "word_weaver": {
        "questions": [
          { "blank": "The capital of India is _____.", "answer": "DELHI" }
        ]
      }
    }`
  let response = await callOpenAIWithRetry(prompt, language, 'gpt-4o-mini')
  if (response.word_weaver?.questions) {
    const validQuestions = response.word_weaver.questions
      .map(q => {
        if (
          !q.blank ||
          !q.answer ||
          typeof q.blank !== 'string' ||
          typeof q.answer !== 'string'
        )
          return null
        if ((q.blank.match(/_____/g) || []).length !== 1) return null
        if (q.answer.trim().includes(' ')) return null
        return { blank: q.blank.trim(), answer: q.answer.trim().toUpperCase() }
      })
      .filter(Boolean)

    if (validQuestions.length === 5) {
      response.word_weaver.questions = validQuestions
      return processGameDataWithDifficulties(response).word_weaver
    }
  }
  throw new Error(
    `Invalid or insufficient word_weaver data received from AI. (Required: >=3, Found response: ${JSON.stringify(
      response.word_weaver?.questions || [],
      null,
      2,
    )})`,
  )
}
const generateConnectionsData = async ({
  title,
  author,
  mainText,
  language,
}) => {
  const prompt = `Based on the article titled "${title}" by ${author}, generate a JSON object for a Connections game.
    Article Text: """${mainText}"""

    Requirements:
    - The JSON object must have a single key "connections".
    - The value should be an object containing:
        - "concepts": An array of EXACTLY 8 distinct, important concepts from the article.
        - "validConnections": An array of EXACTLY 4 connection objects that pair up all 8 concepts perfectly.
    - Each connection object must have: "from", "to", "reasoning", "difficulty" (0.01-0.99), and "connectionType".
    - Each concept must appear in EXACTLY ONE connection.
    - So no concept can be reused across connections.
    - All content MUST be in ${language === 'hi' ? 'Hindi' : 'English'}.

    Connection Types allowed:
    ${connectionTypes.map(type => `- ${type}`).join('\n')}

    Example Structure:
    {
      "connections": {
        "concepts": ["Concept1", ..., "Concept8"],
        "validConnections": [
          { "from": "Concept1", "to": "Concept2", "reasoning": "...", "difficulty": 0.6, "connectionType": "cause_effect" },
          ... (3 more connections)
        ]
      }
    }`
  const response = await callOpenAIWithRetry(prompt, language, 'gpt-4o-mini')
  const concepts = response.connections?.concepts
  let connections = response.connections?.validConnections

  if (concepts?.length === 8 && connections?.length === 4) {
    // NEW: Sanitize the connectionType field before validation
    connections.forEach(conn => {
      if (!connectionTypes.includes(conn.connectionType)) {
        console.warn(
          `Invalid connectionType "${conn.connectionType}" received from AI. Replacing with "conceptual".`,
        )
        conn.connectionType = 'conceptual' // Replace with a valid default
      }
    })

    // Now proceed with validation
    const usedConcepts = new Set(connections.flatMap(c => [c.from, c.to]))
    if (usedConcepts.size === 8) {
      // Assign the sanitized connections back to the response object
      response.connections.validConnections = connections
      return response.connections
    }
  }
  throw new Error(
    `Invalid connections data structure received from AI. : ${JSON.stringify(
      response.connections,
      null,
      2,
    )}`,
  )
}

// --- END: SPECIALIZED GAME GENERATION FUNCTIONS ---

// UPDATED: Orchestrator for game data generation
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

  const promptData = { title, author, mainText, language }

  console.log(
    `Starting modular game data generation for article ${articleId} in ${language}...`,
  )

  // Use Promise.allSettled to attempt all generations, even if some fail
  const results = await Promise.allSettled([
    generateNormalQuizData(promptData),
    generateTrueFalseData(promptData),
    generateWordWeaverData(promptData),
    generateConnectionsData(promptData),
  ])

  const [
    normalQuizResult,
    trueFalseResult,
    wordWeaverResult,
    connectionsResult,
  ] = results

  const generatedData = {}

  if (normalQuizResult.status === 'fulfilled') {
    generatedData.normal_quiz = normalQuizResult.value
    console.log(`✓ Successfully generated Normal Quiz data for ${language}.`)
  } else {
    console.error(
      `✗ Failed to generate Normal Quiz data for ${language}:`,
      normalQuizResult.reason.message,
    )
  }

  if (trueFalseResult.status === 'fulfilled') {
    generatedData.true_false = trueFalseResult.value
    console.log(`✓ Successfully generated True/False data for ${language}.`)
  } else {
    console.error(
      `✗ Failed to generate True/False data for ${language}:`,
      trueFalseResult.reason.message,
    )
  }

  if (wordWeaverResult.status === 'fulfilled') {
    generatedData.word_weaver = wordWeaverResult.value
    // Add wordLength after generation
    generatedData.word_weaver.questions =
      generatedData.word_weaver.questions.map(q => ({
        ...q,
        wordLength: q.answer.replace(/\s+/g, '').length,
      }))
    console.log(`✓ Successfully generated Word Weaver data for ${language}.`)
  } else {
    console.error(
      `✗ Failed to generate Word Weaver data for ${language}:`,
      wordWeaverResult.reason.message,
    )
  }

  if (connectionsResult.status === 'fulfilled') {
    generatedData.connections = connectionsResult.value
    console.log(`✓ Successfully generated Connections data for ${language}.`)
  } else {
    console.error(
      `✗ Failed to generate Connections data for ${language}:`,
      connectionsResult.reason.message,
    )
  }

  // Create GameData document even with partial data
  const newGameData = new GameData({
    title: title,
    description: `Games for article: ${title}`,
    category: article.category || 'general',
    article: articleId,
    normal_quiz: generatedData.normal_quiz,
    true_false: generatedData.true_false,
    word_weaver: generatedData.word_weaver,
    connections: generatedData.connections,
    language: language,
  })

  await newGameData.save({ session })
  console.log(
    `Game data (partial or full) saved for article ${articleId} in ${language}.`,
  )
  return newGameData
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
  generateNormalQuizData,
  generateTrueFalseData,
  generateWordWeaverData,
  generateConnectionsData,
  GAME_CONFIGS,
}
