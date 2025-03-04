// utils/quickClashUtils.js
const moment = require('moment')
const OpenAI = require('openai')
const { calculateArticleDifficulty } = require('./article.utils')
const QuickClashQuiz = require('../model/quickClashSchemas/quickClashQuizSchema')
const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')

// Calculate time remaining in reading phase
const getReadingTimeRemaining = (startTime, timeLimit) => {
  if (!startTime) return 0

  const now = moment()
  const endTime = moment(startTime).add(timeLimit, 'seconds')
  const remaining = endTime.diff(now, 'seconds')

  return Math.max(0, remaining)
}

// Validate quiz responses format
const validateQuizResponses = (responses, questions) => {
  if (!Array.isArray(responses)) {
    throw new Error('Responses must be an array')
  }

  if (responses.length !== questions.length) {
    throw new Error('Number of responses does not match number of questions')
  }

  return responses.map((response, index) => {
    if (!response.questionId || !response.answer) {
      throw new Error(`Invalid response format at index ${index}`)
    }

    const question = questions.find(
      q => q._id.toString() === response.questionId.toString(),
    )
    if (!question) {
      throw new Error(`Question not found for response at index ${index}`)
    }

    return {
      questionId: response.questionId,
      answer: response.answer,
      isCorrect: response.answer === question.answer,
      timeSpent: response.timeSpent || 0,
    }
  })
}

// Format challenge status for client
const formatChallengeStatus = (challenge, userId) => {
  const isChallenger = challenge.challenger._id.toString() === userId.toString()
  const opponent = isChallenger ? challenge.opponent : challenge.challenger
  const myScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const opponentScore = isChallenger
    ? challenge.opponentScore
    : challenge.challengerScore

  return {
    id: challenge._id,
    category: challenge.category,
    status: challenge.status,
    opponent: {
      id: opponent._id,
      name: opponent.name,
      inGameName: opponent.inGameName,
      picture: opponent.pic,
    },
    scores: {
      me: myScore,
      opponent: opponentScore,
    },
    isWinner:
      challenge.winner && challenge.winner.toString() === userId.toString(),
    createdAt: challenge.createdAt,
    expiresAt: challenge.expiresAt,
  }
}

// Check if user can start new challenge
const canStartNewChallenge = async userId => {
  const today = moment().startOf('day')
  const challenges = await QuickClashChallenge.countDocuments({
    challenger: userId,
    createdAt: { $gte: today.toDate() },
  })

  const pendingChallenges = await QuickClashChallenge.countDocuments({
    challenger: userId,
    status: 'pending',
  })

  return {
    canStart: challenges < 5 && pendingChallenges < 10,
    remainingDaily: 5 - challenges,
    remainingPending: 10 - pendingChallenges,
  }
}

// Format session status for client
const formatSessionStatus = session => {
  const now = moment()
  const phase = session.phase
  let remainingTime = 0

  if (phase === 'reading' && session.reading.startTime) {
    remainingTime = getReadingTimeRemaining(
      session.reading.startTime,
      120, // 2 minutes reading time
    )
  }

  return {
    id: session._id,
    phase,
    language: session.language,
    reading: {
      completed: session.reading.completed,
      completionType: session.reading.completionType,
      timeSpent: session.reading.timeSpent,
      remainingTime,
    },
    quiz: session.quiz.completed
      ? {
          completed: true,
          responses: session.quiz.responses,
          timeSpent: session.quiz.timeSpent,
          score: session.score,
        }
      : {
          completed: false,
        },
  }
}

const generateQuickClashQuizzes = async ({
  title,
  author,
  mainText,
  challenge,
  hindiTitle,
  hindiMainText,
  session,
}) => {
  try {
    // Generate English Quiz
    const englishQuiz = await generateQuickClashQuiz({
      title,
      author,
      mainText,
      challenge,
      language: 'en',
      session,
    })

    // Translate English quiz to Hindi instead of generating a new one
    const hindiQuiz = await translateQuizToHindi({
      englishQuiz,
      challenge,
      session,
    })

    return {
      englishQuiz,
      hindiQuiz,
    }
  } catch (error) {
    console.error('Error generating quick clash quizzes:', error)
    throw error
  }
}

// New background translation function (without session)
const translateQuizBackground = async ({
  englishQuiz,
  challengeId,
  hindiQuizId,
  hindiTitle,
  hindiMainText,
}) => {
  try {
    console.log(`Starting background translation for quiz ${hindiQuizId}`)

    // Add retries for fetching documents
    let challenge, hindiQuiz
    let retries = 3

    while (retries > 0) {
      ;[challenge, hindiQuiz] = await Promise.all([
        QuickClashChallenge.findById(challengeId),
        QuickClashQuiz.findById(hindiQuizId),
      ])

      if (challenge && hindiQuiz) break

      console.log(
        `Documents not found yet, retrying... (${retries} attempts left)`,
      )
      await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms between retries
      retries--
    }

    if (!challenge || !hindiQuiz) {
      throw new Error(
        `Challenge (${!!challenge}) or Hindi quiz (${!!hindiQuiz}) not found after multiple attempts`,
      )
    }

    // Perform the translation
    const translatedQuestions = await translateQuizQuestionsToHindi(
      englishQuiz.questions,
    )

    // Update the Hindi quiz with the translated questions
    hindiQuiz.questions = translatedQuestions
    hindiQuiz.translationStatus = 'completed'
    await hindiQuiz.save()

    console.log(
      `Successfully completed background translation for quiz ${hindiQuizId}`,
    )
  } catch (error) {
    console.error('Background translation error:', error)

    // Update the quiz to indicate translation failure if we can find it
    try {
      const quizExists = await QuickClashQuiz.exists({ _id: hindiQuizId })

      if (quizExists) {
        await QuickClashQuiz.findByIdAndUpdate(hindiQuizId, {
          translationStatus: 'failed',
          translationError: error.message,
        })
        console.log(`Updated quiz ${hindiQuizId} with failed status`)
      } else {
        console.error(
          `Cannot update quiz status: Quiz ${hindiQuizId} not found`,
        )
      }
    } catch (updateError) {
      console.error(
        'Failed to update quiz status after translation failure:',
        updateError,
      )
    }
  }
}

// Helper function to translate questions
const translateQuizQuestionsToHindi = async englishQuestions => {
  const openai = new OpenAI(process.env.OPENAI_API_KEY)
  let attempts = 5
  let lastError = null

  // Prepare the questions for translation
  const questionsForTranslation = englishQuestions.map(q => ({
    question: q.question,
    optionA: q.options.a,
    optionB: q.options.b,
    optionC: q.options.c,
    optionD: q.options.d,
    explanation: q.explanation,
  }))

  const prompt = `
Translate the following quiz questions from English to Hindi while preserving the meaning and context accurately:

Quiz questions: ${JSON.stringify(questionsForTranslation, null, 2)}

Return the translated content in the following JSON format:
{
  "translatedQuestions": [
    {
      "question": "Hindi translated question",
      "optionA": "Hindi option A",
      "optionB": "Hindi option B",
      "optionC": "Hindi option C",
      "optionD": "Hindi option D",
      "explanation": "Hindi explanation"
    },
    ...
  ]
}
`

  while (attempts-- > 0) {
    try {
      const result = await openai.chat.completions.create({
        model: attempts > 2 ? 'gpt-4o-mini' : 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a translation assistant that accurately translates English quiz questions to Hindi while preserving the original meaning, format, and structure.',
          },
          {
            role: 'user',
            content: prompt,
          },
          ...(lastError
            ? [
                {
                  role: 'user',
                  content: `The previous attempt failed with this issue: ${lastError}. Please ensure your response includes all required fields and follows the exact format requested.`,
                },
              ]
            : []),
        ],
      })

      let responseText = result.choices[0].message.content
      responseText = responseText.replace(/```json|```/g, '').trim()

      // Validate JSON before parsing
      if (!responseText.startsWith('{') || !responseText.endsWith('}')) {
        throw new Error('Response is not valid JSON')
      }

      const response = JSON.parse(responseText)

      // Validate response
      if (!response || !response.translatedQuestions) {
        throw new Error('Response missing translatedQuestions field')
      }

      if (!Array.isArray(response.translatedQuestions)) {
        throw new Error('translatedQuestions must be an array')
      }

      if (response.translatedQuestions.length !== englishQuestions.length) {
        throw new Error(
          `Translation count mismatch: Expected ${englishQuestions.length} items but got ${response.translatedQuestions.length}`,
        )
      }

      // Validate each translated question
      for (let i = 0; i < response.translatedQuestions.length; i++) {
        const t = response.translatedQuestions[i]
        if (
          !t.question ||
          !t.optionA ||
          !t.optionB ||
          !t.optionC ||
          !t.optionD ||
          !t.explanation
        ) {
          throw new Error(`Missing fields in question #${i + 1}`)
        }
      }

      // Map the translated questions to match the original schema structure
      return englishQuestions.map((originalQ, index) => {
        const translatedQ = response.translatedQuestions[index]
        return {
          question: translatedQ.question,
          options: {
            a: translatedQ.optionA,
            b: translatedQ.optionB,
            c: translatedQ.optionC,
            d: translatedQ.optionD,
          },
          answer: originalQ.answer, // Keep original correct answer (a, b, c, or d)
          explanation: translatedQ.explanation,
          difficulty: originalQ.difficulty, // Keep original difficulty
        }
      })
    } catch (err) {
      lastError = err.message
      console.error(
        `Error translating quiz to Hindi (attempt ${5 - attempts}/${5}):`,
        err.message,
      )

      if (attempts === 0) {
        // If all attempts fail, try the fallback approach
        return await translateQuizFallbackForBackgroundProcess(englishQuestions)
      }

      // Add delay between attempts
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  throw new Error(`Failed to translate quiz to Hindi after multiple attempts.`)
}

// New function to translate quiz from English to Hindi
const translateQuizToHindi = async ({ englishQuiz, challenge, session }) => {
  const openai = new OpenAI(process.env.OPENAI_API_KEY)
  let attempts = 5 // Increased from 3 to 5 attempts
  let lastError = null

  // Prepare the questions for translation
  const questionsForTranslation = englishQuiz.questions.map(q => ({
    question: q.question,
    optionA: q.options.a,
    optionB: q.options.b,
    optionC: q.options.c,
    optionD: q.options.d,
    explanation: q.explanation,
  }))

  const prompt = `
Translate the following quiz questions from English to Hindi while preserving the meaning and context accurately:

Quiz questions: ${JSON.stringify(questionsForTranslation, null, 2)}

Return the translated content in the following JSON format:
{
  "translatedQuestions": [
    {
      "question": "Hindi translated question",
      "optionA": "Hindi option A",
      "optionB": "Hindi option B",
      "optionC": "Hindi option C",
      "optionD": "Hindi option D",
      "explanation": "Hindi explanation"
    },
    ...
  ]
}
`

  while (attempts-- > 0) {
    try {
      const result = await openai.chat.completions.create({
        model: attempts > 2 ? 'gpt-4o-mini' : 'gpt-4o', // Use more powerful model for last attempts
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a translation assistant that accurately translates English quiz questions to Hindi while preserving the original meaning, format, and structure.',
          },
          {
            role: 'user',
            content: prompt,
          },
          // If we had a previous error, tell the model what went wrong
          ...(lastError
            ? [
                {
                  role: 'user',
                  content: `The previous attempt failed with this issue: ${lastError}. Please ensure your response includes all required fields and follows the exact format requested.`,
                },
              ]
            : []),
        ],
      })

      let responseText = result.choices[0].message.content
      responseText = responseText.replace(/```json|```/g, '').trim()

      // Validate JSON before parsing
      if (!responseText.startsWith('{') || !responseText.endsWith('}')) {
        throw new Error('Response is not valid JSON')
      }

      const response = JSON.parse(responseText)

      // Perform thorough validation
      if (!response || !response.translatedQuestions) {
        throw new Error('Response missing translatedQuestions field')
      }

      if (!Array.isArray(response.translatedQuestions)) {
        throw new Error('translatedQuestions must be an array')
      }

      if (
        response.translatedQuestions.length !== englishQuiz.questions.length
      ) {
        throw new Error(
          `Translation count mismatch: Expected ${englishQuiz.questions.length} items but got ${response.translatedQuestions.length}`,
        )
      }

      // Validate each translated question
      for (let i = 0; i < response.translatedQuestions.length; i++) {
        const t = response.translatedQuestions[i]
        if (
          !t.question ||
          !t.optionA ||
          !t.optionB ||
          !t.optionC ||
          !t.optionD ||
          !t.explanation
        ) {
          throw new Error(`Missing fields in question #${i + 1}`)
        }
      }

      // Map the translated questions to match the original schema structure
      // but keep the original difficulty values and correct answers
      const translatedQuestions = englishQuiz.questions.map(
        (originalQ, index) => {
          const translatedQ = response.translatedQuestions[index]
          return {
            question: translatedQ.question,
            options: {
              a: translatedQ.optionA,
              b: translatedQ.optionB,
              c: translatedQ.optionC,
              d: translatedQ.optionD,
            },
            answer: originalQ.answer, // Keep original correct answer (a, b, c, or d)
            explanation: translatedQ.explanation,
            difficulty: originalQ.difficulty, // Keep original difficulty
          }
        },
      )

      // Create Hindi QuickClashQuiz with translated questions but same structure and difficulty
      const hindiQuiz = new QuickClashQuiz({
        challenge: challenge._id,
        language: 'hi',
        questions: translatedQuestions,
        overallDifficulty: englishQuiz.overallDifficulty, // Keep the same overall difficulty
      })

      try {
        // Validate model before saving
        await hindiQuiz.validate()
        await hindiQuiz.save({ session })
        console.log(
          `Successfully translated quiz to Hindi (${translatedQuestions.length} questions)`,
        )
        return hindiQuiz
      } catch (validationError) {
        // If there's a validation error, capture it and retry
        lastError = `Mongoose validation error: ${validationError.message}`
        console.error(lastError)
        continue
      }
    } catch (err) {
      lastError = err.message
      console.error(
        `Error translating quiz to Hindi (attempt ${5 - attempts}/${5}):`,
        err.message,
      )

      // Add delay between attempts to avoid rate limiting
      if (attempts > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        // On final failure, try a fallback approach
        return await translateQuizFallback({
          englishQuiz,
          challenge,
          session,
        })
      }
    }
  }

  throw new Error(
    `Failed to translate quiz to Hindi after multiple attempts. Last error: ${lastError}`,
  )
}

const translateQuizFallbackForBackgroundProcess = async englishQuestions => {
  console.log(
    'Attempting fallback translation method (one question at a time)...',
  )
  const openai = new OpenAI(process.env.OPENAI_API_KEY)
  const translatedQuestions = []

  // Try to translate one question at a time
  for (let i = 0; i < englishQuestions.length; i++) {
    const q = englishQuestions[i]
    try {
      const result = await openai.chat.completions.create({
        model: 'o3-mini', // Use powerful model for fallback
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Translate this single quiz question from English to Hindi with accuracy.',
          },
          {
            role: 'user',
            content: `
Translate this single quiz question from English to Hindi:
Question: ${q.question}
Option A: ${q.options.a}
Option B: ${q.options.b}
Option C: ${q.options.c}
Option D: ${q.options.d}
Explanation: ${q.explanation}

Return as JSON:
{
  "question": "Hindi question",
  "optionA": "Hindi option A",
  "optionB": "Hindi option B",
  "optionC": "Hindi option C",
  "optionD": "Hindi option D",
  "explanation": "Hindi explanation"
}`,
          },
        ],
      })

      const response = JSON.parse(result.choices[0].message.content)

      translatedQuestions.push({
        question: response.question,
        options: {
          a: response.optionA,
          b: response.optionB,
          c: response.optionC,
          d: response.optionD,
        },
        answer: q.answer,
        explanation: response.explanation,
        difficulty: q.difficulty,
      })

      console.log(
        `Successfully translated question ${i + 1}/${englishQuestions.length}`,
      )
    } catch (err) {
      console.error(`Failed to translate question ${i + 1}:`, err.message)
      // If translation fails, use the English version as fallback
      translatedQuestions.push(q)
    }
  }

  return translatedQuestions
}
// Fallback method if translation fails - translates one question at a time
const translateQuizFallback = async ({ englishQuiz, challenge, session }) => {
  console.log(
    'Attempting fallback translation method (one question at a time)...',
  )
  const openai = new OpenAI(process.env.OPENAI_API_KEY)
  const translatedQuestions = []

  // Try to translate one question at a time
  for (let i = 0; i < englishQuiz.questions.length; i++) {
    const q = englishQuiz.questions[i]
    try {
      const result = await openai.chat.completions.create({
        model: 'o3‑mini', // Use most powerful model for fallback
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Translate this single quiz question from English to Hindi with accuracy.',
          },
          {
            role: 'user',
            content: `
Translate this single quiz question from English to Hindi:
Question: ${q.question}
Option A: ${q.options.a}
Option B: ${q.options.b}
Option C: ${q.options.c}
Option D: ${q.options.d}
Explanation: ${q.explanation}

Return as JSON:
{
  "question": "Hindi question",
  "optionA": "Hindi option A",
  "optionB": "Hindi option B",
  "optionC": "Hindi option C",
  "optionD": "Hindi option D",
  "explanation": "Hindi explanation"
}`,
          },
        ],
      })

      const response = JSON.parse(result.choices[0].message.content)

      translatedQuestions.push({
        question: response.question,
        options: {
          a: response.optionA,
          b: response.optionB,
          c: response.optionC,
          d: response.optionD,
        },
        answer: q.answer,
        explanation: response.explanation,
        difficulty: q.difficulty,
      })

      console.log(
        `Successfully translated question ${i + 1}/${
          englishQuiz.questions.length
        }`,
      )
    } catch (err) {
      console.error(`Failed to translate question ${i + 1}:`, err.message)
      // If translation fails, use the English version as fallback
      translatedQuestions.push(q)
    }
  }

  // Create Hindi QuickClashQuiz with translated questions
  const hindiQuiz = new QuickClashQuiz({
    challenge: challenge._id,
    language: 'hi',
    questions: translatedQuestions,
    overallDifficulty: englishQuiz.overallDifficulty,
  })

  await hindiQuiz.save({ session })
  console.log(
    `Fallback translation complete. Saved ${translatedQuestions.length} questions.`,
  )
  return hindiQuiz
}

const generateQuickClashQuiz = async ({
  title,
  author,
  mainText,
  challenge,
  language,
  session,
}) => {
  const openai = new OpenAI(process.env.OPENAI_API_KEY)
  let attempts = 5

  const prompt =
    language === 'en'
      ? getEnglishPrompt(title, author, mainText)
      : getHindiPrompt(title, author, mainText)

  const systemRole =
    language === 'en'
      ? 'You are an educational quiz generator bot. Generate quiz questions based on the given article following the provided instructions and return the response in the specified JSON format.'
      : 'आप एक शैक्षिक क्विज जनरेटर बॉट हैं। दिए गए लेख के आधार पर निर्देशों का पालन करते हुए क्विज प्रश्न तैयार करें और प्रतिक्रिया को निर्दिष्ट JSON प्रारूप में वापस करें।'

  while (attempts-- > 0) {
    try {
      const result = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemRole,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      let responseText = result.choices[0].message.content
      responseText = responseText.replace(/```json|```/g, '').trim()
      const response = JSON.parse(responseText)

      if (validateQuizResponse(response)) {
        // Format questions from all paragraphs into a single array
        const questions = response.paragraphs.reduce((acc, para) => {
          return acc.concat(para.questions)
        }, [])

        // Calculate overall difficulty
        const overallDifficulty = calculateArticleDifficulty({ mainText })

        // Create new QuickClashQuiz
        const quiz = new QuickClashQuiz({
          challenge: challenge._id,
          language,
          questions,
          overallDifficulty,
        })

        await quiz.save({ session })
        return quiz
      }
    } catch (err) {
      console.error(`Error generating ${language} quiz:`, err.message)
      if (attempts === 0) throw err
    }
  }

  throw new Error(`Failed to generate ${language} quiz after multiple attempts`)
}

const validateQuizResponse = response => {
  return (
    response &&
    response.paragraphs &&
    response.paragraphs.length === 3 &&
    response.paragraphs.every(
      para =>
        para.questions &&
        para.questions.every(
          q =>
            q.difficulty !== undefined &&
            q.question &&
            q.answer &&
            q.explanation &&
            q.options &&
            q.options.a &&
            q.options.b &&
            q.options.c &&
            q.options.d,
        ),
    )
  )
}

const getEnglishPrompt = (title, author, mainText) => `
Title: ${title}
Author: ${author}
MainText: ${mainText}

Instructions:
1. Divide the article into 3 paragraphs.
2. Generate 2 to 5 unique questions for each paragraph.
3. Provide 4 answer options for each question, with one correct answer labeled (a, b, c, or d).
4. Distribute the correct answers across options with the following probabilities:
   - Option 'd': 40% chance
   - Options 'a', 'b', and 'c': 20% chance each
5. Include a brief explanation for each correct answer.
6. Double-check that the correct answer and explanation are consistent with each other and the article's content.
7. Ensure all questions are derived from the provided text.
8. Assign a difficulty level between 0.01 and 0.99 for each question (with two decimal accuracy).
9. If the question requires remembering numerical data, specific dates, names (except author names and short names), or options and question are longer to read under 10 seconds then assign a higher difficulty level between 0.55 to 0.99.
10. Return the response in the following JSON format:
{
  "title": "Title of the article",
  "paragraphs": [
    {
      "paragraph": 1,
      "questions": [
        {
          "question": "",
          "options": {
            "a": "",
            "b": "",
            "c": "",
            "d": ""
          },
          "answer": "",
          "explanation": "",
          "difficulty": ""
        }
      ]
    },
    {
      "paragraph": 2,
      "questions": []
    },
    {
      "paragraph": 3,
      "questions": []
    }
  ]
}`

const getHindiPrompt = (title, author, mainText) => `
शीर्षक: ${title}
लेखक: ${author}
मुख्य पाठ: ${mainText}

निर्देश:
1. लेख को 3 अनुच्छेदों में विभाजित करें।
2. प्रत्येक अनुच्छेद से 2 से 5 अद्वितीय प्रश्न तैयार करें।
3. प्रत्येक प्रश्न के लिए 4 विकल्प प्रदान करें, जिनमें से एक सही उत्तर (a, b, c, या d) से चिह्नित हो।
4. सही उत्तरों को विकल्पों में निम्नलिखित संभावनाओं के साथ वितरित करें:
   - विकल्प 'd': 40% संभावना
   - विकल्प 'a', 'b', और 'c': प्रत्येक 20% संभावना
5. प्रत्येक सही उत्तर के लिए संक्षिप्त व्याख्या प्रदान करें।
6. दोहरी जांच करें कि सही उत्तर और व्याख्या एक दूसरे के साथ और लेख की सामग्री के साथ सुसंगत हैं।
7. सभी प्रश्न दिए गए लेख से ही होने चाहिए।
8. प्रत्येक प्रश्न को 0.01 से 0.99 के बीच एक कठिनाई स्तर दें (दो दशमलव सटीकता के साथ)।
9. यदि प्रश्न में संख्यात्मक डेटा, विशिष्ट तिथियों, नामों को याद रखने की आवश्यकता हो, तो कठिनाई स्तर 0.55 से 0.99 के बीच निर्धारित करें।
10. प्रतिक्रिया को निम्नलिखित JSON प्रारूप में वापस करें:
{
  "title": "लेख का शीर्षक",
  "paragraphs": [
    {
      "paragraph": 1,
      "questions": [
        {
          "question": "",
          "options": {
            "a": "",
            "b": "",
            "c": "",
            "d": ""
          },
          "answer": "",
          "explanation": "",
          "difficulty": ""
        }
      ]
    },
    {
      "paragraph": 2,
      "questions": []
    },
    {
      "paragraph": 3,
      "questions": []
    }
  ]
}`

module.exports = {
  getReadingTimeRemaining,
  validateQuizResponses,
  formatChallengeStatus,
  canStartNewChallenge,
  formatSessionStatus,
  generateQuickClashQuizzes,
  translateQuizToHindi,
  generateQuickClashQuiz,
  translateQuizBackground,
}
