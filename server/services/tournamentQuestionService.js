const Article = require('../model/articleSchema')
const TournamentQuestion = require('../model/tournamentQuestionSchema')
const OpenAI = require('openai')

const generateTournamentQuestions = async category => {
  try {
    console.log('Generating tournament questions...')
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const article = await Article.find({ category, createdAt: { $gte: today } })

    const textForOpenAI = article.map(a => a.mainText).join('\n\n') // Concatenate all articles
    if (!article) {
      throw new Error('Article not found')
    }

    const prompt = `Generate around 20 multiple-choice questions from the following corpus of multiple articles. Each question should capture a key point from the articles and be suitable for a general knowledge tournament.

Requirements:
Keep questions short and concise, as users will have less than 10 seconds to answer.
Each question should stand alone and describe enough context since users won't know which article it is based on.
For each question, provide 4 randomized answer options (a, b, c, d), with the correct answer randomly placed (not always in the same position).
Distribute the correct answers across options with the following probabilities:
   - Option 'd': 40% chance
   - Options 'a', 'b', and 'c': 20% chance each
   Ensure this distribution is applied across all questions in the quiz.
   Double-check that the correct answer i.e. its consistent with the article's content
Example Output Format:

Q1. Which country hosted the 2024 Summer Olympics?
a) China
b) Japan
c) France
d) Italy
Correct answer: c) France

Q2. Who invented the World Wide Web?
a) Steve Jobs
b) Bill Gates
c) Mark Zuckerberg
d) Tim Berners-Lee
Correct answer: d) Tim Berners-Lee

Also get the hindi translated version of the questions and options .If the question requires remembering numerical data, specific dates, names (except author names and short names), or options and question are longer to read under 10 seconds then assign a higher difficulty level between 0.55 to 0.99. Give these things higher priority while assigning difficulty. Use the following format:

  Article: "${textForOpenAI}"

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

    await saveTournamentQuestions(category, response)
  } catch (error) {
    console.error('Error generating tournament questions:', error.message)
  }
}

const saveTournamentQuestions = async (category, response) => {
  try {
    for (let questionData of response.questions) {
      const newQuestion = new TournamentQuestion({
        question: questionData.question,
        hindiQuestion: questionData.hindiQuestion,
        options: {
          a: {
            text: questionData.options.a,
            hindiText: questionData.hindiOptions.a,
          },
          b: {
            text: questionData.options.b,
            hindiText: questionData.hindiOptions.b,
          },
          c: {
            text: questionData.options.c,
            hindiText: questionData.hindiOptions.c,
          },
          d: {
            text: questionData.options.d,
            hindiText: questionData.hindiOptions.d,
          },
        },

        difficulty: parseFloat(questionData.difficulty),
        category: category,
      })

      // Set the correctAnswer after the options are created
      newQuestion.correctAnswer =
        newQuestion.options[questionData.correctAnswer]._id

      await newQuestion.save()
    }
  } catch (error) {
    console.error('Error saving tournament questions:', error)
    throw error
  }
}

module.exports = {
  generateTournamentQuestions,
}
