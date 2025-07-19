const OpenAI = require('openai')
const QuizAttempt = require('../model/quizAttemptSchema')
const Quiz = require('../model/quizSchema')
const Article = require('../model/articleSchema')
const moment = require('moment')
const fakeQuizAttemptMinMax = require('../data/fakeAttemptMinMax.json')
const configService = require('../configService')
const User = require('../model/userSchema')
const { cancelScheduledNotif } = require('./notif.utils')
const {
  TournamentRegistration,
} = require('../model/tournamentRegistrationSchema')
const TournamentQuestion = require('../model/tournamentQuestionSchema')
const Tournament = require('../model/tournamentSchema')
const { calculateArticleDifficulty } = require('./article.utils')
const GameData = require('../model/gameDataSchema')
const { GAME_CONFIGS, calculateEnhancedRQM } = require('./enhancedQuiz.utils')
const mongoose = require('mongoose')

const genQuiz = async ({ fullQuiz, title, session }) => {
  const selectedQuestions = new Set() // Using a Set to ensure uniqueness

  // Loop through each paragraph
  const len = Math.min(
    5,
    (fullQuiz?.para1?.questions?.length || 0) +
      (fullQuiz?.para2?.questions?.length || 0) +
      (fullQuiz?.para3?.questions?.length || 0),
  )
  const paraNames = []
  for (let paraName in fullQuiz) {
    if (paraName.startsWith('para')) {
      paraNames.push(paraName)
      const para = fullQuiz[paraName]
      while (para && para.questions && para.questions.length > 0) {
        // Loop through each question in the paragraph
        // randomly select a question
        const question =
          para.questions[Math.floor(Math.random() * para.questions.length)]
        const questionId = question._id.toString() // Convert ObjectId to string for comparison
        // Add the question's ID to the selectedQuestions Set if it's not already there
        if (!selectedQuestions.has(questionId)) {
          selectedQuestions.add(questionId)
          // If we have enough questions, break out of the loop
          break
        }
        para.questions = para.questions.filter(
          q => q._id.toString() !== questionId,
        )
      }
      if (selectedQuestions.size >= 3) {
        break
      }
    }
  }

  // Loop through each paragraph to select remaining questions randomly
  while (selectedQuestions.size < len) {
    const randomParaName =
      paraNames[Math.floor(Math.random() * paraNames.length)]
    const para = fullQuiz[randomParaName]

    while (
      para &&
      para.questions &&
      para.questions.length > 0 &&
      selectedQuestions.size < len
    ) {
      // Select a random question from the paragraph
      const randomIndex = Math.floor(Math.random() * para.questions.length)
      const randomQuestion = para.questions[randomIndex]
      const questionId = randomQuestion._id.toString() // Convert ObjectId to string for comparison

      // Add the question's ID to the selectedQuestions Set if it's not already there
      if (!selectedQuestions.has(questionId)) {
        selectedQuestions.add(questionId)
        // If we have enough questions, break out of the loop
        break
      }
      // Remove the selected question from the paragraph
      para.questions = para.questions.filter(
        q => q._id.toString() !== questionId,
      )
    }
  }
  // Convert Set back to array
  const selectedQuestionsArray = Array.from(selectedQuestions)
  const originalFullQuiz = await Quiz.findById(fullQuiz._id).session(session)
  // Create the quiz object
  const quiz = {
    title: title,
    questions: selectedQuestionsArray.map(questionId => {
      // Find the question object by its ID
      for (let paraName in originalFullQuiz) {
        if (paraName.startsWith('para')) {
          const para = originalFullQuiz[paraName]

          // found question using included
          const foundQuestion = para.questions.filter(question => {
            return question._id.toString() === questionId
          })[0]
          if (foundQuestion) {
            return foundQuestion
          }
        }
      }
    }),
  }

  return quiz
}
const generateQuestionsForQuiz = async ({
  title,
  author,
  mainText,
  articleId,
  article,
  emitProgress,
  session,
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

Instructions:
1. Divide the article into 3 paragraphs.
2. Generate 2 to 5 unique questions for each paragraph.
3. Provide 4 answer options for each question, with one correct answer labeled (a, b, c, or d).
4. Distribute the correct answers across options with the following probabilities:
   - Option 'd': 40% chance
   - Options 'a', 'b', and 'c': 20% chance each
   Ensure this distribution is applied across all questions in the quiz.
5. Include a brief explanation for each correct answer.
6. Double-check that the correct answer and explanation are consistent with each other and the article's content.
7. Ensure all questions are derived from the provided text.
8. Assign a difficulty level between 0.01 and 0.99 for each question (with two decimal accuracy). This field is mandatory.
9. If the question requires remembering numerical data, specific dates, names (except author names and short names), or options and question are longer to read under 10 seconds then assign a higher difficulty level between 0.55 to 0.99. Give these things higher priority while assigning difficulty.
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

    emitProgress(40)
    while (attempts-- > 0) {
      try {
        result = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are an educational quiz generator bot. Generate quiz questions based on the given article following the provided instructions and return the response in the specified JSON format.',
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

        if (
          response &&
          response.paragraphs &&
          response.paragraphs.length === 3 &&
          response.paragraphs[0].questions.every(
            q =>
              q.difficulty !== undefined &&
              q.question &&
              q.answer &&
              q.explanation,
          ) &&
          response.paragraphs[1].questions.every(
            q =>
              q.difficulty !== undefined &&
              q.question &&
              q.answer &&
              q.explanation,
          ) &&
          response.paragraphs[2].questions.every(
            q =>
              q.difficulty !== undefined &&
              q.question &&
              q.answer &&
              q.explanation,
          )
        ) {
          // If response is valid, fetch article and create quiz

          if (!article) {
            throw new Error('Article not found')
          }

          const newQuiz = new Quiz({
            article: articleId,
            para1: { questions: response.paragraphs[0].questions },
            para2: { questions: response.paragraphs[1].questions },
            para3: { questions: response.paragraphs[2].questions },
            overAllDifficulty:
              article.articleDifficulty ||
              calculateArticleDifficulty({ mainText }),
          })

          await newQuiz.save({ session })

          if (!article.quiz) {
            article.quiz = []
          }
          article.quiz.push(newQuiz._id)
          await article.save({ session })
          emitProgress(80)

          return newQuiz
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Error during OpenAI API call:', err.message)
      }
    }
    throw new Error('Failed to generate quiz after multiple attempts')
  } catch (error) {
    console.error('Error generating questions for quiz:', error)
    throw error
  }
}

const generateQuestionsForHindiQuiz = async ({
  title,
  author,
  mainText,
  articleId,
  article,
  emitProgress,
  session,
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
    const combinedMainText = mainText.join(' ')

    const prompt = `शीर्षक: ${title}\nलेखक: ${author}\n\nमुख्य पाठ: ${combinedMainText}\n\nनिर्देश:
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
9. यदि प्रश्न में संख्यात्मक डेटा, विशिष्ट तिथियों, नामों को याद रखने की आवश्यकता हो, या विकल्प और प्रश्न को पढ़ने में 10 सेकंड से अधिक समय लगता है, तो कठिनाई स्तर 0.55 से 0.99 के बीच निर्धारित करें।
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

    emitProgress(40)
    while (attempts-- > 0) {
      try {
        result = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'आप एक शैक्षिक क्विज जनरेटर बॉट हैं। दिए गए लेख के आधार पर निर्देशों का पालन करते हुए क्विज प्रश्न तैयार करें और प्रतिक्रिया को निर्दिष्ट JSON प्रारूप में वापस करें।',
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

        if (
          response &&
          response.paragraphs &&
          response.paragraphs.length === 3 &&
          response.paragraphs[0].questions.every(
            q =>
              q.difficulty !== undefined &&
              q.question &&
              q.answer &&
              q.explanation,
          ) &&
          response.paragraphs[1].questions.every(
            q =>
              q.difficulty !== undefined &&
              q.question &&
              q.answer &&
              q.explanation,
          ) &&
          response.paragraphs[2].questions.every(
            q =>
              q.difficulty !== undefined &&
              q.question &&
              q.answer &&
              q.explanation,
          )
        ) {
          // If response is valid, fetch article and create quiz

          if (!article) {
            throw new Error('Article not found')
          }

          const newQuiz = new Quiz({
            article: articleId,
            para1: { questions: response.paragraphs[0].questions },
            para2: { questions: response.paragraphs[1].questions },
            para3: { questions: response.paragraphs[2].questions },
            overAllDifficulty:
              article.articleDifficulty ||
              calculateArticleDifficulty({ mainText: article.mainText }),
            language: 'hi',
          })

          await newQuiz.save({ session })

          if (!article.quiz) {
            article.quiz = []
          }
          article.quiz.push(newQuiz._id)
          await article.save({ session })
          emitProgress(80)

          return newQuiz
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Error during OpenAI API call:', err.message)
      }
    }
    throw new Error('Failed to generate quiz after multiple attempts')
  } catch (error) {
    console.error('Error generating Hindi quiz:', error)
    throw error
  }
}

const updatePercentilesOnQuizDeactivation = async ({ id }) => {
  try {
    const attempts = await QuizAttempt.find({ article: id }).lean()

    if (attempts.length === 0) {
      console.log(`No attempts found for quiz with id: ${id}`)
      return
    }

    const totalAttempts = attempts.length

    // Sort attempts by RQM score
    attempts.sort((a, b) => b.RQM_score - a.RQM_score)

    // Calculate percentiles and prepare bulk update
    const bulkOps = attempts
      .map((attempt, index) => {
        if (!attempt || !attempt.article || !attempt.articleDifficulty) {
          return null // Skip invalid attempts
        }
        const percentile = ((totalAttempts - index) / totalAttempts) * 100
        return {
          updateOne: {
            filter: { _id: attempt._id },
            update: { $set: { userPercentile: percentile } },
            upsert: false,
          },
        }
      })
      .filter(op => op !== null)

    if (bulkOps.length > 0) {
      const result = await QuizAttempt.bulkWrite(bulkOps)
    } else {
      console.log(`No valid attempts to update for quiz ${id}`)
    }
  } catch (error) {
    console.error('Error updating percentiles on quiz deactivation:', error)
  }
}

const findQuizByLanguage = async ({ language, articleId, session }) => {
  try {
    const article = await Article.findById(articleId).session(session)
    const quizzes = await Quiz.find({
      _id: { $in: article.quiz },
      language,
    }).session(session)

    if (quizzes.length === 0) {
      return null
    }

    let fullQuiz = quizzes[Math.floor(Math.random() * quizzes.length)]
    return fullQuiz
  } catch (error) {
    console.error('Error finding quiz by language:', error)
    throw error // Propagate the error to be handled in the calling function
  }
}

const fetchTodaysPastRQMs = async ({ userId, session }) => {
  try {
    // fetch todays all quizAttempts RQMs in ascending sorted time order
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const pastRQMs = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: today },
    })
      .sort({ createdAt: 1 })
      .select('RQM_score')
      .session(session)
    const result = pastRQMs.map(attempt => attempt.RQM_score)
    return result
  } catch (error) {
    console.log("Error fetching today's past RQMs:", error)
  }
}

// Available game types and languages
const availableGameTypes = [
  'normal_quiz',
  'true_false',
  'word_weaver',
  'connections',
]
const availableLanguages = ['en', 'hi']

// Generate fake question data based on game type
const generateFakeQuestions = (gameType, gameConfig) => {
  switch (gameType) {
    case 'normal_quiz':
      return Array.from({ length: gameConfig.itemCount }, (_, i) => ({
        _id: new mongoose.Types.ObjectId(),
        difficulty: 0.3 + Math.random() * 0.4, // Random difficulty 0.3-0.7
        questionType: 'multiple_choice',
      }))

    case 'true_false':
      return Array.from({ length: gameConfig.itemCount }, (_, i) => ({
        _id: new mongoose.Types.ObjectId(),
        difficulty: 0.25 + Math.random() * 0.4, // Random difficulty 0.25-0.65
        questionType: 'boolean',
      }))

    case 'word_weaver':
      return Array.from({ length: gameConfig.itemCount }, (_, i) => ({
        _id: new mongoose.Types.ObjectId(),
        difficulty: 0.4 + Math.random() * 0.4, // Random difficulty 0.4-0.8
        questionType: 'fill_blank',
        wordLength: 4 + Math.floor(Math.random() * 8), // Random word length 4-11
      }))

    case 'connections':
      return [
        {
          _id: new mongoose.Types.ObjectId(),
          difficulty: 0.5 + Math.random() * 0.3, // Random difficulty 0.5-0.8
          questionType: 'connections',
          maxConnections: 4,
          validConnections: Array.from({ length: 4 }, (_, i) => ({
            _id: new mongoose.Types.ObjectId(),
            from: `concept${i * 2}`,
            to: `concept${i * 2 + 1}`,
            difficulty: 0.4 + Math.random() * 0.4,
            connectionType: [
              'cause_effect',
              'category',
              'similarity',
              'conceptual',
            ][Math.floor(Math.random() * 4)],
          })),
        },
      ]

    default:
      return []
  }
}

// Generate realistic fake responses based on skill level
const generateFakeResponses = ({ gameType, questions, skillLevel = 0.6 }) => {
  let correctCount = 0
  let totalItems = questions.length
  const responses = []

  switch (gameType) {
    case 'normal_quiz':
      questions.forEach((question, index) => {
        const isCorrect = Math.random() < skillLevel
        const selectedOption = ['a', 'b', 'c', 'd'][
          Math.floor(Math.random() * 4)
        ]

        responses.push({
          questionId: question._id,
          userAnswer: selectedOption,
          isCorrect: isCorrect,
        })

        if (isCorrect) correctCount++
      })
      break

    case 'true_false':
      questions.forEach((question, index) => {
        const isCorrect = Math.random() < skillLevel
        const userAnswer = Math.random() > 0.5 // Random true/false

        responses.push({
          questionId: question._id,
          userAnswer: userAnswer,
          isCorrect: isCorrect,
        })

        if (isCorrect) correctCount++
      })
      break

    case 'word_weaver':
      questions.forEach((question, index) => {
        const isCorrect = Math.random() < skillLevel
        const userWord = isCorrect ? 'CORRECT' : 'WRONG' // Simplified fake words

        responses.push({
          questionId: question._id,
          userWord: userWord,
          isCorrect: isCorrect,
        })

        if (isCorrect) correctCount++
      })
      break

    case 'connections':
      const question = questions[0]
      const maxConnections = question.maxConnections || 4
      const connectionsToMake = Math.floor(Math.random() * maxConnections) + 1
      const correctConnections = Math.floor(connectionsToMake * skillLevel)

      const connections = []
      for (let i = 0; i < connectionsToMake; i++) {
        connections.push({
          from: `concept${i * 2}`,
          to: `concept${i * 2 + 1}`,
          isValid: i < correctConnections,
        })
      }

      responses.push({
        questionId: question._id,
        connections: connections,
      })

      correctCount = correctConnections
      totalItems = connectionsToMake
      break

    default:
      break
  }

  return {
    responses,
    correctCount,
    totalItems,
  }
}

// Calculate performance metrics from responses
const calculateFakePerformance = ({
  responses,
  questions,
  gameType,
  correctCount,
  totalItems,
}) => {
  const accuracy = totalItems > 0 ? correctCount / totalItems : 0
  const avgDifficulty =
    questions.reduce((sum, q) => sum + (q.difficulty || 0.5), 0) /
    questions.length

  return {
    accuracy,
    difficulty: avgDifficulty,
    correctCount,
    totalItems,
  }
}

// Generate realistic timing based on game type and skill level
const generateRealisticTiming = (gameType, gameConfig, skillLevel) => {
  const baseTime = gameConfig.timeLimit || 50

  // Higher skill = faster completion (but not too fast)
  const skillTimeFactor = 1.4 - skillLevel * 0.6 // Range: 0.8 to 1.4

  // Add some randomness for realism
  const randomFactor = 0.7 + Math.random() * 0.6 // Range: 0.7 to 1.3

  const timeTaken = Math.floor(baseTime * skillTimeFactor * randomFactor)

  // Ensure minimum realistic time (can't be too fast)
  const minTime = Math.floor(baseTime * 0.3)
  const maxTime = Math.floor(baseTime * 1.2)

  return Math.max(minTime, Math.min(maxTime, timeTaken))
}

// Create a single fake attempt
const createFakeAttempt = async ({ article, gameType, language, session }) => {
  try {
    const gameConfig = GAME_CONFIGS[gameType]

    if (!gameConfig) {
      console.error(`Invalid game type: ${gameType}`)
      return null
    }

    // Generate fake questions for this game type
    const questions = generateFakeQuestions(gameType, gameConfig)

    if (questions.length === 0) {
      console.error(`No questions generated for game type: ${gameType}`)
      return null
    }

    // Generate random skill level (0.3 to 0.9 for realistic distribution)
    const skillLevel = 0.3 + Math.random() * 0.6

    // Generate fake responses based on skill level
    const { responses, correctCount, totalItems } = generateFakeResponses({
      gameType,
      questions,
      skillLevel,
    })

    // Calculate performance metrics
    const performance = calculateFakePerformance({
      responses,
      questions,
      gameType,
      correctCount,
      totalItems,
    })

    // Generate realistic timing
    const timeTaken = generateRealisticTiming(gameType, gameConfig, skillLevel)

    // Calculate enhanced RQM score using the actual game system
    const rqmResult = calculateEnhancedRQM(
      gameType,
      performance,
      timeTaken,
      performance.totalItems,
      null, // No time dilation for fake attempts
    )

    // Create realistic timestamps
    const now = new Date()
    const createdAt = new Date(
      now.getTime() - Math.random() * 24 * 60 * 60 * 1000,
    ) // Random time in last 24 hours

    // Create the fake QuizAttempt
    const quizAttempt = new QuizAttempt({
      user: null, // No user for fake attempts
      article: article._id,
      articleQuizSession: new mongoose.Types.ObjectId(), // Fake session ID
      gameData: null, // No GameData for fake attempts
      gameType: gameType,
      responses: responses,
      performance: performance,
      RQM_score: rqmResult.rqmScore,
      baseRQM_score: rqmResult.rqmScore, // No boosts for fake attempts
      articleDifficulty: performance.difficulty,
      timeTaken: timeTaken,
      expectedTime: gameConfig.timeLimit,
      timeFactor: rqmResult.timeFactor,
      performanceBonus: rqmResult.performanceBonus,
      boost: 1, // No boosts for fake attempts
      isBoosted: false,
      timeDilationBoosted: false,
      quinBoostUtilized: false,
      streakRevived: false,
      pauseRealTimeIQ: false,
      season: parseInt(configService.getCurrentSeason(), 10),
      month: moment().month() + 1,
      year: moment().year(),
      createdAt: createdAt,
    })

    await quizAttempt.save({ session })

    return quizAttempt
  } catch (error) {
    console.error(`Error creating fake attempt for ${gameType}:`, error.message)
    return null
  }
}

// Main function to generate fake quiz attempts
const fakeQuizAttemptCnt = async () => {
  console.log('Starting fake quiz attempt generation for GameHub...')

  try {
    const currentDateTime = moment()
    const twoDaysAgoDateTime = currentDateTime
      .clone()
      .subtract(2, 'days')
      .format('YYYY-MM-DD')

    const query = {
      dateTime: {
        $gte: twoDaysAgoDateTime,
      },
    }

    // Get all articles from the last 2 days (no GameData check needed)
    const articles = await Article.find(query)
    console.log(`Found ${articles.length} articles from the last 2 days`)

    let processedCount = 0
    let skippedCount = 0

    for (const article of articles) {
      // Skip articles with categories not in our min/max config
      const categoryKey = article?.category?.toLowerCase()
      if (!categoryKey || !fakeQuizAttemptMinMax[categoryKey]) {
        console.log(
          `Skipping article ${article._id} - category '${article.category}' not in config`,
        )
        skippedCount++
        continue
      }

      // Check if article already has enough attempts
      const currentAttemptCount = article.quizAttemptCnt || 0
      const { min, max } = fakeQuizAttemptMinMax[categoryKey]

      if (currentAttemptCount >= min) {
        console.log(
          `Skipping article ${article._id} - already has ${currentAttemptCount} attempts (min: ${min})`,
        )
        continue
      }

      // Calculate how many attempts to add
      const skew = 1.2 // Slight skew toward lower numbers
      const attemptsToAdd = Math.floor(
        Math.pow(Math.random(), skew) * (max - currentAttemptCount) + 1,
      )

      console.log(
        `Adding ${attemptsToAdd} fake attempts to article ${article._id} (category: ${article.category})`,
      )

      // Start transaction for this article
      const mongoSession = await mongoose.startSession()
      mongoSession.startTransaction()

      try {
        let addedAttempts = 0

        for (let i = 0; i < attemptsToAdd; i++) {
          // Randomly select language and game type (no GameData dependency)
          const language =
            availableLanguages[
              Math.floor(Math.random() * availableLanguages.length)
            ]

          const selectedGameType =
            availableGameTypes[
              Math.floor(Math.random() * availableGameTypes.length)
            ]

          // Create fake attempt (all fake data)
          const fakeAttempt = await createFakeAttempt({
            article,
            gameType: selectedGameType,
            language: language,
            session: mongoSession,
          })

          if (fakeAttempt) {
            addedAttempts++
          }
        }

        // Update article attempt count
        article.quizAttemptCnt = currentAttemptCount + addedAttempts
        await article.save({ session: mongoSession })

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        console.log(
          `Successfully added ${addedAttempts} fake attempts to article ${article._id}`,
        )
        processedCount++
      } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
        console.error(`Error processing article ${article._id}:`, error.message)
      }
    }

    console.log(`Fake quiz attempt generation completed!`)
    console.log(`Processed: ${processedCount} articles`)
    console.log(`Skipped: ${skippedCount} articles`)
  } catch (error) {
    console.error('Error in fakeQuizAttemptCnt:', error.message)
    console.error('Stack trace:', error.stack)
    throw error
  }
}

const sendMailsForQuizRemainingToReviveStreak = async (
  userId,
  quizzes_left,
) => {
  try {
    const user = await User.findById(userId)

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0) // Set time to start of the day
    let remainingTimeBeforeRevival = null

    if (user.streak >= 5 && user.revivalPeriodEnd) {
      user.revivalPeriodEnd = getTheRevivalEndDay(
        user.streak,
        user.streakExpiry,
      )
      remainingTimeBeforeRevival =
        user.revivalPeriodEnd.getTime() - today.getTime()
      if (remainingTimeBeforeRevival < 0) {
        user.revivalPeriodEnd = null
        user.streakBeforeBreak = 0
      } else {
        cancelScheduledNotif(userId)
        if (
          remainingTimeBeforeRevival <= 24 * 60 * 60 * 1000 &&
          quizzes_left === 1
        ) {
          await scheduleNotif({
            userId,
            title: `Keep Going, ${user.name}! 🌟`,
            body: `🚨 This is it, One quiz stands between you and your streak. Today is your last shot—complete that final quiz now and unleash QuinBoost to reclaim your streak! Time is running out! ⚡🔥`,
            image:
              'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
            delayMinutes: 20,
          })
        } else if (quizzes_left === 1) {
          await scheduleNotif({
            userId,
            title: `Keep Going, ${user.name}! 🌟`,
            body: `🔥 Just one quiz left! Today’s your last chance to revive your streak—complete your final quiz now to activate and utilize QuinBoost to get back on track. Don’t let this slip away! 🚀`,
            image:
              'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
            delayMinutes: 30,
          })
        } else
          await scheduleNotif({
            userId,
            title: `Keep Going, ${user.name}! 🌟`,
            body: `You're just ${quizzes_left} quizzes away from activating QuinBoost and ${
              quizzes_left + 1
            } quizzes from fully reviving your streak! Don’t give up now—finish strong and get your streak back on track! 🚀`,
            image:
              'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
            delayMinutes: 60,
          })
      }
      await user.save()
    }
  } catch (error) {
    console.error(
      'Error sending mails for quiz remaining to revive streak:',
      error,
    )
  }
}

const generateCategoryQuiz = async ({
  userId,
  tournamentId,
  category,
  session,
}) => {
  // Verify user registration
  const registration = await TournamentRegistration.findOne({
    user: userId,
    tournament: tournamentId,
  }).session(session)
  const tournament = await Tournament.findById(tournamentId).session(session)
  if (!registration) {
    throw new Error('User is not registered for this tournament')
  }

  // Verify category selection
  if (!registration.selectedCategories.includes(category)) {
    throw new Error('Invalid category selection')
  }

  // Check if category is already completed
  if (registration.completedCategories.includes(category)) {
    throw new Error('Category already completed')
  }

  // Get previously asked questions for this category
  const askedQuestions = registration.askedQuestions.get(category) || []

  // Get questions for the selected category, excluding previously asked questions
  const questions = await TournamentQuestion.aggregate([
    {
      $match: {
        category: category,
        createdAt: {
          $gte: tournament.registrationStartDate,
          $lte: tournament.startDate,
        },
        _id: { $nin: askedQuestions },
      },
    },
    { $sample: { size: 5 } },
  ]).session(session)
  if (questions.length < 5) {
    throw new Error('Not enough new questions available for this category')
  }

  // Update the askedQuestions for this category
  const newAskedQuestions = [...askedQuestions, ...questions.map(q => q._id)]
  registration.askedQuestions.set(category, newAskedQuestions)

  await registration.save()

  return questions
}

const BASELINE_TIME_PER_QUESTION = 15 // seconds
const ALL_CORRECT_BONUS = 1.2 // 20% bonus for all correct
const ONE_WRONG_BONUS = 1.1 // 10% bonus for only one wrong
const BASE_TIME_WINDOW = 50

const calculateScore = userResponses => {
  return (
    userResponses.reduce((acc, res) => acc + (res.isCorrect ? 1 : 0), 0) /
    userResponses.length
  )
}

const calculateQuizDifficulty = questions => {
  return (
    questions.reduce(
      (acc, question) => acc + parseFloat(question.difficulty),
      0,
    ) / questions.length
  )
}

const calculateExpectedTime = questions => {
  const totalDifficultyFactor = questions.reduce(
    (sum, question) => sum + parseFloat(question.difficulty),
    0,
  )
  return Math.round(
    BASELINE_TIME_PER_QUESTION *
      questions.length *
      (totalDifficultyFactor / questions.length),
  )
}

const calculateApparentTimeTaken = (
  timeTaken,
  isActiveTimeDilation = false,
) => {
  return timeTaken <= 10 && !isActiveTimeDilation
    ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
    : timeTaken
}

const calculateRQMScore = (
  userResponses,
  questions,
  timeTaken,
  activeTimeDilation,
) => {
  const score = calculateScore(userResponses)
  const quizDifficulty = calculateQuizDifficulty(questions)
  const expectedTime = calculateExpectedTime(questions)
  const timeDilatedTimeTaken = activeTimeDilation
    ? (timeTaken * BASE_TIME_WINDOW) /
      (BASE_TIME_WINDOW + (activeTimeDilation?.abilityId?.additionalTime || 30))
    : timeTaken

  const apparentTimeTaken = calculateApparentTimeTaken(timeTaken)
  const apparentDilatedTimeTaken = calculateApparentTimeTaken(
    timeDilatedTimeTaken,
    !!activeTimeDilation,
  )

  // Calculate weighted score based on question difficulties
  const weightedScore =
    userResponses.reduce((acc, res, index) => {
      if (res.isCorrect) {
        return acc + parseFloat(questions[index].difficulty)
      }
      return acc
    }, 0) / questions.length

  // Adjust score based on difficulty
  let adjustedScore = weightedScore * (1 + (quizDifficulty - 0.5))
  // Apply bonus for exceptional performance
  const correctCount = userResponses.filter(res => res.isCorrect).length
  // Calculate time factor (compare to expected time)
  const timeFactor = Math.min(expectedTime / apparentTimeTaken, 2) // Cap at 2x speed
  const timeDilatedFactor = Math.min(expectedTime / apparentDilatedTimeTaken, 2) // Cap at 2x speed

  const baseRQM_score = Math.ceil((adjustedScore * timeFactor * 150) / 2)
  if (correctCount === questions.length) {
    adjustedScore *= ALL_CORRECT_BONUS
  } else if (correctCount === questions.length - 1) {
    adjustedScore *= ONE_WRONG_BONUS
  }

  // Calculate final RQM score
  const RQM_score = Math.ceil((adjustedScore * timeDilatedFactor * 150) / 2)
  return {
    baseRQM_score,
    RQM_score,
    score,
    expectedTime,
    performanceBonus:
      correctCount === questions.length
        ? ALL_CORRECT_BONUS
        : correctCount === questions.length - 1
        ? ONE_WRONG_BONUS
        : 1,
    timeDilationBoosted: !!activeTimeDilation,
    timeDilatedTimeTaken,
  }
}

const calcUserPercentile = async ({ userId, articleId, session }) => {
  try {
    const quizAttempt = await QuizAttempt.findOne({
      user: userId,
      article: articleId,
    }).session(session)
    if (quizAttempt) {
      const quizAttempts = await QuizAttempt.find({
        article: articleId,
      }).session(session)
      const sortedQuizAttempts = quizAttempts.sort(
        (a, b) => b.RQM_score - a.RQM_score,
      )
      const userAttempt = sortedQuizAttempts.find(
        attempt => attempt.user && attempt.user.toString() === userId,
      )
      if (!userAttempt) {
        throw new Error('User has not attempted the quiz for the article.')
      }
      const userPosition = sortedQuizAttempts.indexOf(userAttempt)

      const totalAttempts = sortedQuizAttempts.length
      const userPercentile =
        ((totalAttempts - userPosition) / totalAttempts) * 100
      userAttempt.userPercentile = userPercentile
      await userAttempt.save({ session })
      return userPercentile
    }
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  genQuiz,
  generateQuestionsForQuiz,
  generateQuestionsForHindiQuiz,
  updatePercentilesOnQuizDeactivation,
  findQuizByLanguage,
  fetchTodaysPastRQMs,
  fakeQuizAttemptCnt,
  sendMailsForQuizRemainingToReviveStreak,
  generateCategoryQuiz,
  calculateScore,
  calculateQuizDifficulty,
  calculateApparentTimeTaken,
  calculateRQMScore,
  calculateExpectedTime,
  calcUserPercentile,
}
