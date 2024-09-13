const Article = require('../model/articleSchema')
const TournamentQuestion = require('../model/tournamentQuestionSchema')
const OpenAI = require('openai')

const generateTournamentQuestions = async articleId => {
  try {
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }

    const prompt = `Generate 3 multiple-choice questions based on the following article. Each question should capture a key point from the article and be suitable for a general knowledge tournament. For each question, provide 4 options (a, b, c, d) and indicate the correct answer. Also get the hindi translated version of the questions and options .If the question requires remembering numerical data, specific dates, or names(except author names and small names.), assign a higher difficulty level between 0.5 to 0.99 . Give These things higher priority while assigning difficulty. Use the following format:

  Article: "${article.mainText}"

  Each question should be in the following JSON format:
  {
    question: '',
    hindiQuestion: '',
    options: {
      a: '',
      b: '',
      c: '',
      d: '',
    },
    hindiOptions: {
    a: '',
    b: '',
    c: '',
    d: '',
  },
    correctAnswer: ''
    difficulty: '',
  }

  1. Question: [Question text]
     a) [Option A]
     b) [Option B]
     c) [Option C]
     d) [Option D]
     Correct Answer: [a/b/c/d]
     Difficulty: [0.0 - 1.0]

  2. [Repeat format for question 2]

  3. [Repeat format for question 3]

  return response in JSON format.
  `
    const openai = new OpenAI(process.env.OPENAI_API_KEY)
    let response
    let attempts = 5
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

        // check if response is valid
        if (
          response.questions.length === 3 &&
          response.questions.every(
            q =>
              q.question &&
              q.options &&
              q.correctAnswer &&
              q.difficulty &&
              q.hindiQuestion &&
              q.hindiOptions,
          )
        ) {
          break
        }
      } catch (err) {
        console.error('Error during OpenAI API call:', err.message)
      }

      console.log(`Retrying... ${attempts} attempts left.`)
    }

    await saveTournamentQuestions(article, response)
  } catch (error) {
    console.error('Error generating tournament questions:', error.message)
  }
}

const saveTournamentQuestions = async (article, response) => {
  for (let question of response.questions) {
    const newQuestion = new TournamentQuestion({
      article: article._id,
      question: question.question,
      hindiQuestion: question.hindiQuestion,
      options: question.options,
      hindiOptions: question.hindiOptions,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      category: article.category,
    })

    await newQuestion.save()

    article.tournamentQuestions.push(newQuestion._id)
  }

  await article.save()
}

module.exports = {
  generateTournamentQuestions,
}
