const { OpenAI } = require('openai')
const { zodResponseFormat } = require('openai/helpers/zod')
const { BatchForgeOutputSchema, BATCH_SYSTEM_PROMPT } = require('../forgeBatchAgent')
const { BatchQuizOutputSchema, BATCH_QUIZ_SYSTEM_PROMPT } = require('../forgeBatchQuizAgent')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MODEL = 'gpt-5-nano'

// ============================================================================
// ADDENDUM (appended to batch prompts for custom drill specifics)
// ============================================================================

const CUSTOM_FORGE_ADDENDUM = `

=== ADDITIONAL RULES FOR CUSTOM USER INPUT ===

**CONTENT QUALITY CHECKS (STRICT):**
- If the text is unreadable, garbled, or mostly non-English → set suitable=false, reasoning="The provided content could not be read clearly. Please provide clearer text or a higher-quality image."
- If the text is too short (<50 meaningful words of educational content) → set suitable=false, reasoning="Not enough educational content to generate a quality drill. Please provide more detailed material."
- If the text is mostly code, URLs, numbers, or non-educational → set suitable=false, reasoning="This content doesn't contain enough educational material for a drill."
- If the image text extraction yields very little content → set suitable=false, reasoning="Could not extract enough readable text from the image. Please try a clearer screenshot."

**OPTION FORMATTING (CRITICAL):**
- NEVER prefix options with letters like "A.", "B.", "C.", "D." or numbers like "1.", "2.", etc.
- The UI already displays its own A/B/C/D labels, so adding prefixes creates duplicates like "A: B. Some answer"
- Options must be raw answer text only, e.g. "Manage user accounts" NOT "C. Manage user accounts"
`

const CUSTOM_QUIZ_ADDENDUM = `

**OPTION FORMATTING (CRITICAL):**
- NEVER prefix options with letters like "A.", "B.", "C.", "D." or numbers.
- Write raw answer text only. The UI adds its own labels.
`

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Strip leading letter/number prefixes the LLM sometimes adds.
 * e.g. "A. Manage accounts" → "Manage accounts"
 */
const stripOptionPrefix = (text) =>
  text.replace(/^[A-Da-d1-4][.):\-]\s*/i, '').trim()

const sanitizeForgeResult = (result) => {
  if (!result?.article?.sections) return result
  for (const section of result.article.sections) {
    if (section.mcq?.options) {
      section.mcq.options = section.mcq.options.map(stripOptionPrefix)
    }
  }
  return result
}

const sanitizeQuizResult = (result) => {
  if (!result?.questions) return result
  // Clamp overallDifficulty to valid Mongoose range
  if (typeof result.overallDifficulty === 'number') {
    result.overallDifficulty = Math.min(0.99, Math.max(0.01, result.overallDifficulty))
  }
  for (const q of result.questions) {
    if (typeof q.difficulty === 'number') {
      q.difficulty = Math.min(0.99, Math.max(0.01, q.difficulty))
    }
    if (q.options) {
      for (const key of ['a', 'b', 'c', 'd']) {
        if (q.options[key]) q.options[key] = stripOptionPrefix(q.options[key])
      }
    }
  }
  return result
}

// ============================================================================
// FORGE CONTENT GENERATION
// ============================================================================

const generateCustomForgeContent = async ({ text, imageBase64 }) => {
  let userContent
  const seedPrefix = `SEED_CATEGORY_RAW: Custom\nSEED_CATEGORY_CANONICAL: Custom\nSEED_SOURCE: User Input\n\nTITLE: Custom Drill\n\n`

  if (imageBase64) {
    userContent = [
      {
        type: 'text',
        text: seedPrefix + 'BODY: [See attached image — extract all educational content from it and generate the forge article. If the image is blurry, unreadable, or contains very little text, set suitable=false.]',
      },
      {
        type: 'image_url',
        image_url: {
          url: imageBase64.startsWith('data:')
            ? imageBase64
            : `data:image/jpeg;base64,${imageBase64}`,
          detail: 'low',
        },
      },
    ]
  } else {
    userContent = seedPrefix + `BODY: ${text}`
  }

  try {
    const t0 = Date.now()
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: BATCH_SYSTEM_PROMPT + CUSTOM_FORGE_ADDENDUM },
        { role: 'user', content: userContent },
      ],
      response_format: zodResponseFormat(BatchForgeOutputSchema, 'forge_analysis'),
    })
    console.log(`[CustomDrill] Forge generation: ${((Date.now() - t0) / 1000).toFixed(1)}s`)

    const result = JSON.parse(completion.choices[0].message.content)

    if (!result.suitable || !result.article) {
      const reason = result.reasoning || ''
      if (reason.toLowerCase().includes('unreadable') || reason.toLowerCase().includes('extract')) {
        throw new Error('Could not read the content clearly. Please provide clearer text or a higher-quality image.')
      }
      if (reason.toLowerCase().includes('short') || reason.toLowerCase().includes('not enough')) {
        throw new Error('Not enough educational content to generate a drill. Please provide more detailed material.')
      }
      throw new Error(reason || 'This content isn\'t suitable for generating a drill. Please try different material.')
    }

    return sanitizeForgeResult(result)
  } catch (error) {
    if (error.status === 429) {
      throw new Error('Our AI servers are currently busy. Please try again in a few moments.')
    }
    if (error.status >= 500) {
      throw new Error('AI service is temporarily unavailable. Please try again later.')
    }
    throw error
  }
}

// ============================================================================
// QUIZ GENERATION
// ============================================================================

const generateCustomQuizContent = async (forgeArticleData) => {
  const article = forgeArticleData.article

  const articleContent = article.sections
    .map((s, i) => `[Section ${i + 1}] ${s.title}\n${s.content}`)
    .join('\n\n')

  const existingMCQs = article.sections
    .filter(s => s.mcq)
    .map((s, i) => `Q${i + 1}: ${s.mcq.question}`)
    .join('\n')

  try {
    const t0 = Date.now()
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: BATCH_QUIZ_SYSTEM_PROMPT + CUSTOM_QUIZ_ADDENDUM },
        {
          role: 'user',
          content: `TITLE: ${article.title}\nCATEGORY: Custom\n\nCONTENT:\n${articleContent}\n\nEXISTING MCQS (AVOID THESE):\n${existingMCQs}`,
        },
      ],
      response_format: zodResponseFormat(BatchQuizOutputSchema, 'quiz_generation'),
    })
    console.log(`[CustomDrill] Quiz generation: ${((Date.now() - t0) / 1000).toFixed(1)}s`)

    return sanitizeQuizResult(JSON.parse(completion.choices[0].message.content))
  } catch (error) {
    if (error.status === 429) {
      throw new Error('Our AI servers are currently busy. Please try again in a few moments.')
    }
    throw error
  }
}

// ============================================================================
// ORCHESTRATOR
// ============================================================================

const processCustomDrill = async ({ text, imageBase64 }) => {
  const t0 = Date.now()

  const forgeResult = await generateCustomForgeContent({ text, imageBase64 })
  const quizResult = await generateCustomQuizContent(forgeResult)

  console.log(`[CustomDrill] Total generation: ${((Date.now() - t0) / 1000).toFixed(1)}s`)

  return {
    title: forgeResult.article.title,
    sections: forgeResult.article.sections,
    category: 'Custom',
    subtype: imageBase64 ? 'Screenshot Upload' : 'User Generated',
    difficulty: forgeResult.estimatedDifficulty,
    tags: forgeResult.article.tags || [],
    status: 'custom',
    quickClashQuiz: {
      questions: quizResult.questions,
      overallDifficulty: quizResult.overallDifficulty,
      generatedAt: new Date(),
    },
    llmMetadata: {
      model: MODEL,
      promptVersion: 'custom-drill-v2',
      generatedAt: new Date(),
    },
  }
}

module.exports = { processCustomDrill }
