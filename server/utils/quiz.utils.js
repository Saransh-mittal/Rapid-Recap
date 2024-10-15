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
const genQuiz = async ({ fullQuiz, title }) => {
  const selectedQuestions = new Set() // Using a Set to ensure uniqueness

  // Loop through each paragraph
  const len = Math.min(
    5,
    fullQuiz.para1.questions.length +
      fullQuiz.para2.questions.length +
      fullQuiz.para3.questions.length,
  )
  const paraNames = []
  for (let paraName in fullQuiz) {
    if (paraName.startsWith('para')) {
      paraNames.push(paraName)
      const para = fullQuiz[paraName]
      while (para.questions.length > 0) {
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

    while (para.questions.length > 0 && selectedQuestions.size < len) {
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
  const originalFullQuiz = await Quiz.findById(fullQuiz._id)
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
}) => {
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
9. If the question requires remembering numerical data, specific dates, or names (except author names and short names), assign a higher difficulty level between 0.55 to 0.99. Give these things higher priority while assigning difficulty.
10. Evaluate the article's overall difficulty considering factors such as vocabulary complexity, sentence structure, clarity, coherence, information density, length, and reader engagement. If the article involves a significant amount of numerical or name-based information, assign a higher overall difficulty rating.
11. Provide an overall difficulty rating between 0.01 and 0.99 (with two decimal accuracy).
12. Return the response in the following JSON format:

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
        },
      ],
    },
    {
      "paragraph": 2,
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
        },
      ],
    },
    {
      "paragraph": 3,
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
        },
      ],
    }
  ],
  "overAllDifficulty": ""
}`

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

        // Remove any backticks or invalid characters
        responseText = responseText.replace(/```json|```/g, '').trim()

        response = JSON.parse(responseText)

        if (
          response &&
          response.paragraphs &&
          response.paragraphs.length === 3 &&
          response.paragraphs[0].questions.every(
            q => q.difficulty !== undefined,
          ) &&
          response.paragraphs[1].questions.every(
            q => q.difficulty !== undefined,
          ) &&
          response.paragraphs[2].questions.every(
            q => q.difficulty !== undefined,
          ) &&
          response.overAllDifficulty !== undefined
        ) {
          break
        }
      } catch (err) {
        console.error('Error during OpenAI API call:', err.message)
      }

      console.log(`Retrying... ${attempts} attempts left.`)
    }

    if (!response) {
      throw new Error('Failed to generate quiz after multiple attempts')
    }

    const newQuiz = new Quiz({
      article: articleId,
      para1: { questions: response.paragraphs[0].questions },
      para2: { questions: response.paragraphs[1].questions },
      para3: { questions: response.paragraphs[2].questions },
      overAllDifficulty: response.overAllDifficulty,
    })
    await newQuiz.save()

    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }

    if (!article.quiz) {
      article.quiz = []
    }
    article.quiz.push(newQuiz._id)
    await article.save()

    return newQuiz
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
}) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const combinedMainText = mainText.join(' ')
  //console.log(title, author, mainText);
  const prompt = `शीर्षक: ${title}\nलेखक: ${author}\n\nमुख्य पाठ: ${combinedMainText}\n\n`
  const instructions = `निर्देश:
1. लेख को 3 अनुच्छेदों में इस तरह विभाजित करें कि प्रत्येक अनुच्छेद से कम से कम 2 प्रश्न बनाए जा सकें। क्विज़ हिंदी भाषा में तैयार की जानी चाहिए क्योंकि लेख हिंदी में होगा और इसे सावधानीपूर्वक तैयार किया जाना चाहिए।
2. प्रत्येक अनुच्छेद से न्यूनतम 2 और अधिकतम 5 प्रश्न तैयार करें (बहुत महत्वपूर्ण!)।
3. प्रत्येक प्रश्न के लिए 4 विकल्प प्रदान करें।
4. प्रत्येक प्रश्न का एक सही विकल्प होना चाहिए।
5. उत्तर विकल्पों में से एक की कुंजी (a, b, c, d) होनी चाहिए।
6. प्रत्येक उत्तर के लिए एक व्याख्या प्रदान करें।
7. दिए गए लेख के बाहर कुछ भी नहीं होना चाहिए (महत्वपूर्ण)।
8. प्रत्येक प्रश्न अद्वितीय होना चाहिए।
9. प्रत्येक प्रश्न को 0 से 1 के बीच एक कठिनाई स्तर दें (यह 0 या 1 नहीं हो सकता, यह 0 से 1 के बीच दशमलव में होना चाहिए (दो दशमलव सटीकता के साथ))। **यह फ़ील्ड अनिवार्य है**।
10. यदि प्रश्न में संख्यात्मक डेटा, विशिष्ट तिथियों, या नामों (लेखक के नाम और छोटे नामों को छोड़कर) को याद रखने की आवश्यकता है, तो 0.55 से 0.99 के बीच एक उच्च कठिनाई स्तर असाइन करें। कठिनाई असाइन करते समय इन चीजों को उच्च प्राथमिकता दें।
11. लेख के समग्र कठिनाई स्तर का मूल्यांकन करें, जिसमें शब्दावली की जटिलता, वाक्य संरचना, अवधारणात्मक कठिनाई, विश्लेषण की गहराई, आवश्यक पृष्ठभूमि ज्ञान, स्पष्टता और सुसंगतता, सूचना की सघनता, भाषा शैली, लेख की लंबाई और पाठक की रुचि जैसे कारकों पर विचार करें। प्रत्येक मानदंड का मूल्यांकन करके लेख की कठिनाई रेटिंग 0 से 1 के पैमाने पर निर्धारित करें, जहां 0 कम कठिनाई और 1 उच्च कठिनाई का प्रतिनिधित्व करता है। इन मूल्यांकनों को समेकित करके एक समग्र कठिनाई स्तर निकालें जो लेख की जटिलता और विभिन्न प्रवीणता स्तरों के पाठकों के लिए उपयुक्तता को दर्शाता हो (यह 0 या 1 नहीं हो सकता, यह 0 से 1 के बीच दशमलव में होना चाहिए (दो दशमलव सटीकता के साथ))। **यह फ़ील्ड अनिवार्य है**।
12. सही उत्तरों को विकल्पों में निम्नलिखित संभावनाओं के साथ वितरित करें:
    - विकल्प 'd': 40% संभावना
    - विकल्प 'a', 'b', और 'c': प्रत्येक 20% संभावना
    सुनिश्चित करें कि यह वितरण क्विज़ के सभी प्रश्नों में लागू हो।
13. दोहरी जांच करें कि सही उत्तर और व्याख्या एक दूसरे के साथ और लेख की सामग्री के साथ सुसंगत हैं।
14. प्रतिक्रिया को निम्नलिखित JSON ऑब्जेक्ट प्रारूप में वापस करें:
{
  title: "लेख का शीर्षक",
  para1: {
    questions: [
      {
        question: "",
        options: {
          a: "",
          b: "",
          c: "",
          d: ""
        },
        answer: "",
        explanation: "",
        difficulty: ""
      },
    ],
  },
  para2: {
    questions: [
      {
        question: "",
        options: {
          a: "",
          b: "",
          c: "",
          d: ""
        },
        answer: "",
        explanation: "",
        difficulty: ""
      },
    ],
  },
  para3: {
    questions: [
      {
        question: "",
        options: {
          a: "",
          b: "",
          c: "",
          d: ""
        },
        answer: "",
        explanation: "",
        difficulty: ""
      },
    ],
  },
  overAllDifficulty: ""
}`
  let result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a quiz generator bot. You have to generate a quiz for the given article. You
                    have to follow the given instructions to generate the quiz. You importantly have to give
                    the overall difficulty of the article and also difficulty of each question. You have to
                    return the response in the given JSON format. Break the article into 3 paragraphs such that minimum 2 questions can be made from each para.
                    ${instructions}`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  })
  let response = JSON.parse(result.choices[0].message.content)
  let cnt = 3
  while (
    (!response.para1.questions[0].difficulty ||
      !response.para2.questions[0].difficulty ||
      !response.para3.questions[0].difficulty ||
      !response.overAllDifficulty) &&
    cnt-- > 0
  ) {
    result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Provide the difficulty of each question and overall difficulty of the article.Assess the overall difficulty level of the article by considering factors
                      such as vocabulary complexity, sentence structure, conceptual difficulty,
                      depth of analysis, background knowledge required, clarity and coherence,
                      density of information, language style, length of the article, and reader
                      engagement. Evaluate each criterion to determine the article's difficulty
                      rating on a scale from 0 to 1, where 0 represents low difficulty and 1 represents
                      high difficulty. Aggregate these assessments to derive an overall difficulty level
                      that reflects the article's complexity and suitability for readers of varying
                      proficiency levels. ${instructions}`,
        },
        {
          role: 'user',
          content: JSON.stringify(response),
        },
      ],
    })
    response = JSON.parse(result.choices[0].message.content)
  }
  if (
    !response ||
    !response.para1 ||
    !response.para2 ||
    !response.para3 ||
    !response.overAllDifficulty
  ) {
    throw new Error('Quiz not generated')
  }

  const newQuiz = new Quiz({
    article: articleId,
    para1: response.para1,
    para2: response.para2,
    para3: response.para3,
    overAllDifficulty: response.overAllDifficulty,
    language: 'hi',
  })
  await newQuiz.save()
  const article = await Article.findById(articleId)
  if (!article.quiz) {
    article.quiz = []
    await article.save()
  }
  article.quiz.push(newQuiz._id)
  await article.save()

  return newQuiz
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
      // console.log(
      //   `Updated ${result.modifiedCount} out of ${totalAttempts} attempts for quiz ${id}`,
      // )
    } else {
      console.log(`No valid attempts to update for quiz ${id}`)
    }
  } catch (error) {
    console.error('Error updating percentiles on quiz deactivation:', error)
  }
}

const findQuizByLanguage = async ({ language, articleId }) => {
  try {
    const article = await Article.findById(articleId)
    const quizzes = await Quiz.find({
      _id: { $in: article.quiz },
      language,
    })

    if (quizzes.length === 0) {
      return null
    }

    let fullQuiz = quizzes[Math.floor(Math.random() * quizzes.length)]
    return fullQuiz
  } catch (error) {
    console.error('Error finding quiz by language:', error)
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

const fakeQuizAttemptCnt = async () => {
  try {
    const currentDateTime = moment()
    const oneDayAgoDateTime = currentDateTime
      .subtract(2, 'days')
      .format('YYYY-MM-DD')

    const query = {
      dateTime: {
        $gte: oneDayAgoDateTime,
      },
    }

    const articles = await Article.find(query)

    for (let article of articles) {
      let quizAttemptCnt = article.quizAttemptCnt
      let { min, max } =
        fakeQuizAttemptMinMax[article?.category?.toLocaleLowerCase()]

      if (quizAttemptCnt < min) {
        const skew = 1 // Adjust this value to control the skewness
        const weightedRandom = Math.pow(Math.random(), skew) * (max - 1) + 1
        quizAttemptCnt += Math.floor(weightedRandom)
        for (let i = 0; i < Math.floor(weightedRandom); i++) {
          const topScore = Math.floor(Math.random() * 50)
          const newQuizAttempt = new QuizAttempt({
            article: article._id,
            RQM_score: Math.floor(Math.random() * topScore),
            articleDifficulty: Math.random(),
            userPercentile: Math.random() * 100,
            timeTaken: Math.floor(Math.random() * 100),
            season: parseInt(configService.getCurrentSeason(), 10),
          })
          await newQuizAttempt.save()
        }
      }

      article.quizAttemptCnt = quizAttemptCnt
      await article.save()
    }
    console.log('Fake quiz attempts incremented ', articles.length)
  } catch (error) {
    console.error('Error updating quiz attempt counts:', error)
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

const generateCategoryQuiz = async (userId, tournamentId, category) => {
  // Verify user registration
  const registration = await TournamentRegistration.findOne({
    user: userId,
    tournament: tournamentId,
  })
  const tournament = await Tournament.findById(tournamentId)
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
          // $gte: tournament.registrationStartDate,
          // $lte: tournament.startDate,
          $gte: new Date('2024-10-04'),
        },
        _id: { $nin: askedQuestions },
      },
    },
    { $sample: { size: 5 } },
  ])

  if (questions.length < 5) {
    throw new Error('Not enough new questions available for this category')
  }

  // Update the askedQuestions for this category
  const newAskedQuestions = [...askedQuestions, ...questions.map(q => q._id)]
  registration.askedQuestions.set(category, newAskedQuestions)

  await registration.save()

  return questions
}

const calculateScore = (userResponses, correctAnswers) => {
  return (
    correctAnswers.reduce((acc, answer, index) => {
      if (userResponses.length > index && answer === userResponses[index]) {
        return acc + 1
      }
      return acc
    }, 0) / correctAnswers.length
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

const calculateApparentTimeTaken = timeTaken => {
  return timeTaken <= 10
    ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
    : timeTaken
}

const calculateRQMScore = (score, quizDifficulty, apparentTimeTaken) => {
  const apparentScore = (score * Math.log(score + 1)) / Math.log(1.3)
  return Math.ceil(
    ((apparentScore * quizDifficulty) / apparentTimeTaken) * 1000,
  )
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
  calcUserPercentile,
}
