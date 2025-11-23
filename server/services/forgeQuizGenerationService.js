/**
 * Forge Quiz Generation Service (Simplified)
 *
 * PURPOSE: Generate Quick Clash quizzes and store them IN the Forge Article
 *
 * ARCHITECTURE CHANGE: Quiz is now part of the content asset (ForgeArticle)
 * - ForgeArticles are reusable content assets
 * - QuickClashQuizzes are game instances (created during team battle creation)
 * - When team battle is created, quiz is copied from ForgeArticle to QuickClashQuiz
 *
 * WORKFLOW:
 * 1. Fetch draft Forge Articles (last 7 days)
 * 2. Generate unique quiz questions (different from section MCQs)
 * 3. Store quiz directly in ForgeArticle.quickClashQuiz
 * 4. Update article status to "published"
 *
 * CRITICAL REQUIREMENT: Quiz questions must be COMPLETELY DIFFERENT
 * from the 5 section MCQs already in the Forge Article.
 */

const { Agent, run } = require('@openai/agents')
const { z } = require('zod')
const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  LOOKBACK_DAYS: 7,
  BATCH_SIZE: 10,
  QUESTIONS_PER_QUIZ: 5,
  MIN_DIFFICULTY: 0.01,
  MAX_DIFFICULTY: 0.99,
}

// ============================================================================
// STRUCTURED OUTPUT SCHEMA
// ============================================================================

/**
 * Quiz Generation Output Schema
 *
 * LEARNING NOTE: This schema matches the quickClashQuiz field in ForgeArticle
 */
const QuizGenerationSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .min(10)
          .describe('Clear question testing article comprehension (10+ chars)'),

        options: z.object({
          a: z.string().describe('Option A'),
          b: z.string().describe('Option B'),
          c: z.string().describe('Option C'),
          d: z.string().describe('Option D'),
        }),

        answer: z.enum(['a', 'b', 'c', 'd']).describe('Correct answer letter'),

        explanation: z
          .string()
          .min(15)
          .describe(
            'Brief explanation of why this answer is correct (15+ chars)',
          ),

        difficulty: z
          .number()
          .min(CONFIG.MIN_DIFFICULTY)
          .max(CONFIG.MAX_DIFFICULTY)
          .describe('Question difficulty (0.01-0.99, where 0.5 is medium)'),
      }),
    )
    .length(CONFIG.QUESTIONS_PER_QUIZ)
    .describe(`Exactly ${CONFIG.QUESTIONS_PER_QUIZ} questions`),

  overallDifficulty: z
    .number()
    .min(CONFIG.MIN_DIFFICULTY)
    .max(CONFIG.MAX_DIFFICULTY)
    .describe('Average difficulty of the entire quiz'),

  reasoning: z
    .string()
    .describe(
      'Brief explanation of how questions avoid duplication with section MCQs',
    ),
})

// ============================================================================
// AI AGENT: Quiz Generator
// ============================================================================

const quizGeneratorAgent = new Agent({
  name: 'Forge Quiz Generator',
  model: 'gpt-5-nano',
  outputType: QuizGenerationSchema,

  instructions: `You are an expert quiz creator for educational content.

**YOUR TASK:**
Generate a comprehensive quiz that tests overall understanding of a Forge Article WITHOUT duplicating any of the section MCQs already embedded in the article.

**CRITICAL DEDUPLICATION RULES:**
❌ DO NOT create questions about the same topics as existing section MCQs
❌ DO NOT use similar phrasing or vocabulary as section MCQs
❌ DO NOT test the same specific facts covered in section MCQs
✅ DO create questions that test broader comprehension
✅ DO synthesize information across multiple sections
✅ DO test application/analysis rather than recall
✅ DO use completely different angles and perspectives

**QUIZ REQUIREMENTS:**

1. **5 Questions Total** - Each question must:
   - Test understanding of the FULL article (not just one section)
   - Require synthesis of information from multiple sections
   - Test application, analysis, or inference (not just recall)
   - Have 4 distinct, plausible options (a, b, c, d)
   - Have 1 clearly correct answer
   - Include a brief explanation (2-3 sentences)

2. **Difficulty Levels:**
   - 0.01-0.33 = Easy (straightforward comprehension)
   - 0.34-0.66 = Medium (requires synthesis)
   - 0.67-0.99 = Hard (requires deep analysis/inference)
   - Vary difficulty across questions

3. **Question Types (vary these):**
   - Synthesis: "Based on the article, how do X and Y relate?"
   - Application: "If Z occurred, what would happen according to the article?"
   - Analysis: "Why does the article suggest X is important?"
   - Inference: "What can be concluded from the information provided?"
   - Comparison: "How does X differ from Y as described?"

**DEDUPLICATION STRATEGY:**
You will be provided with ALL existing section MCQs. Read them carefully and:
- Note which specific facts/concepts they cover
- Identify which sections they focus on
- Create new questions that cover DIFFERENT aspects
- Test understanding at a higher cognitive level

**EXAMPLE APPROACH:**
If a section MCQ asks: "What is the main cause of X?"
Your quiz should ask: "How might understanding X help solve problem Y?" (application, not recall)

If a section MCQ asks: "Which component does task A?"
Your quiz should ask: "Why is the relationship between A and B significant?" (synthesis, not isolated facts)

**RESPOND WITH STRUCTURED JSON** matching the QuizGenerationSchema.

Focus on testing true comprehension and critical thinking, not just memorization.`,
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract all existing MCQ questions from a Forge Article
 *
 * LEARNING NOTE: This is the deduplication mechanism
 * We collect all existing questions to pass to the LLM
 */
function extractExistingMCQs(forgeArticle) {
  const existingMCQs = []

  forgeArticle.sections.forEach((section, idx) => {
    if (section.mcq) {
      existingMCQs.push({
        sectionNumber: idx + 1,
        question: section.mcq.question,
        options: section.mcq.options,
        hint: section.mcq.hint || '',
      })
    }
  })

  return existingMCQs
}

/**
 * Format article content for the LLM
 */
function formatArticleContent(forgeArticle) {
  const sections = forgeArticle.sections
    .map(
      (section, idx) => `
**Section ${idx + 1}: ${section.title}**
${section.content}
`,
    )
    .join('\n')

  return sections
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Generate quiz for a single Forge Article
 *
 * @param {Object} forgeArticle - The Forge Article document
 * @returns {Promise<Object>} - Generated quiz data
 */
async function generateQuizForForgeArticle(forgeArticle) {
  const startTime = Date.now()

  try {
    console.log(`\n📚 Generating quiz for: ${forgeArticle.title}`)

    // Extract existing MCQs to avoid duplication
    const existingMCQs = extractExistingMCQs(forgeArticle)
    console.log(`  Found ${existingMCQs.length} existing section MCQs`)

    // Format article content
    const articleContent = formatArticleContent(forgeArticle)

    // Create the prompt
    const prompt = `Generate a comprehensive quiz for this Forge Article.

**ARTICLE DETAILS:**
Title: ${forgeArticle.title}
Category: ${forgeArticle.category}
Subtype: ${forgeArticle.subtype}
Difficulty: ${forgeArticle.difficulty}
Total Sections: ${forgeArticle.sections.length}

**FULL ARTICLE CONTENT:**
${articleContent}

**EXISTING SECTION MCQs (DO NOT DUPLICATE THESE):**
${existingMCQs
  .map(
    (mcq, idx) => `
${idx + 1}. Section ${mcq.sectionNumber} MCQ:
   Question: ${mcq.question}
   Options: ${mcq.options.join(' | ')}
   ${mcq.hint ? `Hint: ${mcq.hint}` : ''}
`,
  )
  .join('\n')}

**YOUR TASK:**
Create ${CONFIG.QUESTIONS_PER_QUIZ} NEW questions that:
- Test understanding of the FULL article
- Are COMPLETELY DIFFERENT from the section MCQs above
- Test higher-order thinking (synthesis, application, analysis)
- Have varying difficulty levels

Generate the quiz according to your instructions.`

    console.log('  🤖 Running quiz generator agent...')
    const result = await run(quizGeneratorAgent, prompt)

    // Extract the final output
    const output = result.finalOutput

    // Validate structure
    if (
      !output.questions ||
      output.questions.length !== CONFIG.QUESTIONS_PER_QUIZ
    ) {
      throw new Error(
        `Invalid question count: expected ${CONFIG.QUESTIONS_PER_QUIZ}, got ${output.questions.length}`,
      )
    }

    // Verify each question has required fields
    output.questions.forEach((q, idx) => {
      if (!q.question || !q.options || !q.answer || !q.explanation) {
        throw new Error(`Question ${idx + 1} is missing required fields`)
      }
      if (!['a', 'b', 'c', 'd'].includes(q.answer)) {
        throw new Error(`Question ${idx + 1} has invalid answer: ${q.answer}`)
      }
      if (
        q.difficulty < CONFIG.MIN_DIFFICULTY ||
        q.difficulty > CONFIG.MAX_DIFFICULTY
      ) {
        throw new Error(
          `Question ${idx + 1} has invalid difficulty: ${q.difficulty}`,
        )
      }
    })

    const processingTime = Date.now() - startTime
    console.log(`  ✅ Quiz generated successfully (${processingTime}ms)`)
    console.log(`  Overall difficulty: ${output.overallDifficulty.toFixed(2)}`)

    return {
      success: true,
      questions: output.questions,
      overallDifficulty: output.overallDifficulty,
      reasoning: output.reasoning,
      processingTime,
    }
  } catch (error) {
    console.error(`  ❌ Error generating quiz: ${error.message}`)
    throw error
  }
}

/**
 * Process a single Forge Article through the full pipeline
 *
 * SIMPLIFIED WORKFLOW:
 * 1. Generate quiz questions
 * 2. Store quiz in ForgeArticle.quickClashQuiz
 * 3. Update status to "published"
 *
 * @param {Object} forgeArticle - The Forge Article document
 * @returns {Promise<Object>} - Processing result
 */
async function processForgeArticle(forgeArticle) {
  const startTime = Date.now()

  try {
    console.log(`\n🚀 Processing Forge Article: ${forgeArticle.title}`)
    console.log(`   ID: ${forgeArticle._id}`)
    console.log(
      `   Category: ${forgeArticle.category} - ${forgeArticle.subtype}`,
    )

    // Stage 1: Generate quiz
    console.log('\n  Stage 1: Generating quiz questions...')
    const quizData = await generateQuizForForgeArticle(forgeArticle)

    // Stage 2: Store quiz in ForgeArticle
    console.log('\n  Stage 2: Storing quiz in ForgeArticle...')
    forgeArticle.quickClashQuiz = {
      questions: quizData.questions,
      overallDifficulty: quizData.overallDifficulty,
      generatedAt: new Date(),
    }

    // Stage 3: Update status to published
    console.log('\n  Stage 3: Publishing Forge Article...')
    forgeArticle.status = 'published'
    forgeArticle.publishedAt = new Date()
    await forgeArticle.save()

    const totalTime = Date.now() - startTime
    console.log(`\n  ✅ COMPLETE - Article published (${totalTime}ms)`)
    console.log(`     Quiz stored with ${quizData.questions.length} questions`)
    console.log(`     Reasoning: ${quizData.reasoning}`)

    return {
      success: true,
      forgeArticleId: forgeArticle._id,
      questionsGenerated: quizData.questions.length,
      overallDifficulty: quizData.overallDifficulty,
      processingTime: totalTime,
    }
  } catch (error) {
    console.error(`\n  ❌ Error processing article: ${error.message}`)

    // Don't update status if failed - allows retry
    return {
      success: false,
      forgeArticleId: forgeArticle._id,
      error: error.message,
    }
  }
}

/**
 * Process all draft Forge Articles from the last 7 days
 *
 * USAGE: Called by cron job or manual trigger
 *
 * @param {Number} limit - Maximum articles to process
 * @returns {Promise<Object>} - Batch processing results
 */
async function processDraftForgeArticles(limit = CONFIG.BATCH_SIZE) {
  console.log(`\n🚀 Starting Forge Quiz Generation Pipeline`)
  console.log(`   Looking back: ${CONFIG.LOOKBACK_DAYS} days`)
  console.log(`   Batch limit: ${limit}`)

  // Calculate date cutoff
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - CONFIG.LOOKBACK_DAYS)

  try {
    // Fetch draft Forge Articles from last 7 days
    const draftArticles = await ForgeArticle.find({
      status: 'draft',
      createdAt: { $gte: cutoffDate },
    })
      .sort({ createdAt: 1 }) // Process oldest first
      .limit(limit)

    console.log(`\n📋 Found ${draftArticles.length} draft Forge Articles`)

    if (draftArticles.length === 0) {
      console.log('\n✅ No draft articles to process')
      return {
        total: 0,
        published: 0,
        failed: 0,
        results: [],
      }
    }

    // Process each article
    const results = {
      total: draftArticles.length,
      published: 0,
      failed: 0,
      results: [],
    }

    for (const article of draftArticles) {
      const result = await processForgeArticle(article)
      results.results.push(result)

      if (result.success) {
        results.published++
      } else {
        results.failed++
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Summary
    console.log('\n📊 Batch Processing Complete:')
    console.log(`   Total processed: ${results.total}`)
    console.log(`   Published: ${results.published}`)
    console.log(`   Failed: ${results.failed}`)

    if (results.failed > 0) {
      console.log('\n⚠️  Failed articles:')
      results.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.forgeArticleId}: ${r.error}`)
        })
    }

    return results
  } catch (error) {
    console.error('\n❌ Fatal error in batch processing:', error.message)
    throw error
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateQuizForForgeArticle,
  processForgeArticle,
  processDraftForgeArticles,
}
