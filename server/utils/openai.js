// utils/openai.js

const OpenAI = require('openai')

const MODEL_NAME = 'gpt-4o-mini'

const makeGPTRequest = async ({
  messages,
  temperature = 0.7,
  maxRetries = 3,
}) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        response_format: { type: 'json_object' },
        messages,
        temperature,
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      retries++
      if (retries === maxRetries) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * retries)) // Exponential backoff
    }
  }
}

module.exports = {
  makeGPTRequest,
}
