const OpenAI = require('openai')
const { generatePrompt } = require('../utils/promptGenerator')

const generateStory = async (article, theme) => {
  const prompt = generatePrompt(article, theme)

  try {
    const openai = new OpenAI(process.env.OPENAI_API_KEY)
    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return result.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating story:', error)
    throw error
  }
}

module.exports = { generateStory }
