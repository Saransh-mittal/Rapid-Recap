const OpenAI = require('openai')
const QuizAttempt = require('../model/quizAttemptSchema')
const Quiz = require('../model/quizSchema')
const Article = require('../model/articleSchema')
const moment = require('moment')
const fakeQuizAttemptMinMax = require('../data/fakeAttemptMinMax.json')
const configService = require('../configService')
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

    const prompt = `Title: ${title}\nAuthor: ${author}\n\nMainText: ${mainText}\n\nInstructions:
1. Divide the article into 3 paragraphs.
2. Generate 2 to 5 unique questions for each paragraph.
3. Provide 4 answer options for each question, with one correct answer labeled (a, b, c, or d).
4. Include a brief explanation for each correct answer.
5. Ensure all questions are derived from the provided text.
6. Assign a difficulty level between 0 and 1 for each question (It can't be 0 or 1 it has to be in decimal between 0 to 1 (with two decimal accuracy)). **This field is mandatory**.
7. If the question requires remembering numerical data, specific dates, or names, assign a higher difficulty level. Give These things higher priority while assigning difficulty.
8. Evaluate the article's overall difficulty considering factors such as vocabulary complexity, sentence structure,clarity, coherence, information density, length, and reader engagement. If the article involves a significant amount of numerical or name-based information, assign a higher overall difficulty rating. Provide an overall difficulty rating between 0 and 1 (It can't be 0 or 1; it has to be a decimal value between 0 to 1, with two decimal accuracy).
9. Return the response in the following JSON format:
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
  const prompt = `Title: ${title}\n Author: ${author}\n\n MainText:${combinedMainText}\n\n`
  const instructions = `Instructions:
                                1. Break the article into 3 paragraphs such that minimum 2 questions can be made from each para. Quiz should be generated in hindi langauge as article will be in hindi and it should be generated carefully.
                                2. Generate minimum 2 and maximum 5 questions from each paragraph(very important!).
                                3. Each question should have 4 options.
                                4. Each question should have a correct option.
                                5. Anwer should be one of the options key(a,b,c,d).
                                6. Each answer should have an explanation.
                                7. Nothing should be outside of the article provided(important)
                                8. Every question should be unique.
                                9. Give each question a difficulty level between 0 to 1 (It can't be 0 or 1 it has to be in decimal between 0 to 1 (with two decimal accuracy)). **This field is mandatory**..
                                10.Assess the overall difficulty level of the article by considering factors
                                  such as vocabulary complexity, sentence structure, conceptual difficulty,
                                  depth of analysis, background knowledge required, clarity and coherence,
                                  density of information, language style, length of the article, and reader
                                  engagement. Evaluate each criterion to determine the article's difficulty
                                  rating on a scale from 0 to 1, where 0 represents low difficulty and 1 represents
                                  high difficulty. Aggregate these assessments to derive an overall difficulty level
                                  that reflects the article's complexity and suitability for readers of varying
                                  proficiency levels (It can't be 0 or 1 it has to be in decimal between 0 to 1 (with two decimal accuracy)). **This field is mandatory**..
                                10. Return response in following JSON object format:
                                  {
                                    title: "Title of the article",
                                    para1 :
                                    {
                                      questions:
                                      [
                                        {
                                          question: "",
                                          options:
                                          {
                                            a: "",
                                            b: "",
                                            c: "",
                                            d: ""
                                          },
                                          answer: "",
                                          explanation:"",
                                          difficulty: ""
                                        },
                                      ],
                                    }
                                    para2 :
                                    {
                                      questions:
                                      [
                                        {
                                          question: "",
                                          options:
                                          {
                                            a: "",
                                            b: "",
                                            c: "",
                                            d: ""
                                          },
                                          answer: "",
                                          explanation:"",
                                          difficulty: ""
                                        },
                                      ],
                                    }
                                    para3 :
                                    {
                                      questions:
                                      [
                                        {
                                          question: "",
                                          options:
                                          {
                                            a: "",
                                            b: "",
                                            c: "",
                                            d: ""
                                          },
                                          answer: "",
                                          explanation:"",
                                          difficulty: ""
                                        },
                                      ],
                                    }
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
  const attempts = await QuizAttempt.find({
    article: id,
  })
  //console.log(id, "Attempts", attempts.length);

  // Calculate the total number of attempts
  const totalAttempts = attempts.length

  // Sort attempts by RQM score
  attempts.sort((a, b) => b.RQM_score - a.RQM_score)

  // Update user percentile based on their position in the sorted array
  //console.log("Total Attempts", totalAttempts);
  await Promise.all(
    attempts.map(async (attempt, index) => {
      if (!attempt || !attempt.article || !attempt.articleDifficulty) {
        return // Skip this attempt
      }
      const percentile = ((totalAttempts - index) / totalAttempts) * 100

      const attemptQuiz = await QuizAttempt.findById(attempt._id)
      attemptQuiz.userPercentile = percentile
      // Save updated attempt
      await attemptQuiz.save()
    }),
  )
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

const fetchTodaysPastRQMs = async ({ userId }) => {
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
      let { min, max } = fakeQuizAttemptMinMax[article.category]

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

module.exports = {
  genQuiz,
  generateQuestionsForQuiz,
  generateQuestionsForHindiQuiz,
  updatePercentilesOnQuizDeactivation,
  findQuizByLanguage,
  fetchTodaysPastRQMs,
  fakeQuizAttemptCnt,
}
