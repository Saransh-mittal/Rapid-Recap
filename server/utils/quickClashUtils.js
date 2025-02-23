// utils/quickClashUtils.js
const moment = require('moment')
const OpenAI = require('openai')
const { calculateArticleDifficulty } = require('./article.utils')
const QuickClashQuiz = require('../model/quickClashSchemas/quickClashQuizSchema')

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

    // Generate Hindi Quiz
    const hindiQuiz = await generateQuickClashQuiz({
      title: hindiTitle,
      author,
      mainText: hindiMainText,
      challenge,
      language: 'hi',
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
}
