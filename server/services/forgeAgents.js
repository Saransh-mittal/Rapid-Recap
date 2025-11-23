/**
 * Forge AI Agents - Using Latest OpenAI SDK Pattern
 *
 * LEARNING NOTE: This uses the new Agent pattern from @openai/agents
 * - Structured outputs via Zod schemas
 * - Agent class for cleaner API
 * - run() function for execution
 * - No custom temperature (uses model defaults)
 */

const { Agent, run } = require('@openai/agents')
const { z } = require('zod')

// ============================================================================
// STRUCTURED OUTPUT SCHEMAS
// ============================================================================

/**
 * Classification Output Schema
 *
 * Defines the expected JSON structure for content classification
 */
const ClassificationOutputSchema = z.object({
  suitable: z.boolean().describe('Whether content is suitable for Forge Mode'),

  category: z
    .enum([
      'GK Prime',
      'Science Facts Simplified',
      'Everyday Tech',
      'Geography',
      'Unsuitable',
    ])
    .describe('Main category classification'),

  subtype: z
    .string()
    .nullable()
    .describe('Specific subtype within category, or null if unsuitable'),

  reasoning: z
    .string()
    .describe('Brief explanation of classification decision'),

  estimatedDifficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('Estimated difficulty level'),
})

/**
 * Rewrite Output Schema
 *
 * Defines the expected JSON structure for rewritten Forge articles
 */
const RewriteOutputSchema = z.object({
  title: z.string().describe('Concise article title (5-8 words)'),

  sections: z
    .array(
      z.object({
        sectionNumber: z
          .number()
          .min(1)
          .max(5)
          .describe('Section number (1-5)'),

        title: z.string().describe('Section title (2-4 words)'),

        content: z.string().describe('Educational content (30-55 words)'),

        icon: z.string().describe('Emoji icon representing the section'),

        mcq: z.object({
          question: z
            .string()
            .describe('Clear question testing section comprehension'),

          options: z
            .array(z.string())
            .length(4)
            .describe('Exactly 4 multiple choice options'),

          correctIndex: z
            .number()
            .min(0)
            .max(3)
            .describe('Index of correct answer (0-3)'),

          hint: z.string().describe('Optional hint (10-15 words)'),

          contextNugget: z.string().describe('Brief learning path cue'),
        }),
      }),
    )
    .length(5)
    .describe('Exactly 5 sections'),

  tags: z.array(z.string()).describe('Relevant topic tags'),

  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('Overall difficulty level'),
})

// ============================================================================
// AGENT 1: Content Classifier (gpt-5-nano)
// ============================================================================

const classifierAgent = new Agent({
  name: 'Content Classifier',
  model: 'gpt-5-nano',
  outputType: ClassificationOutputSchema,

  instructions: `You are a content quality classifier for an educational reading app.

**YOUR TASK:**
Analyze article seeds and determine if they're suitable for conversion into a 5-section educational reading experience for ages 13-30.

**SUITABLE CONTENT:**
✅ Factual, informative articles
✅ Science, technology, geography, history topics
✅ Clear explanations of concepts or processes
✅ Educational value for ages 13-30
✅ 150+ words of substance
✅ Can be broken into 5 logical learning sections

**UNSUITABLE CONTENT:**
❌ Opinion pieces, editorials, personal essays
❌ Paywalled/premium content indicators
❌ Listicles or clickbait ("10 Best...", "Top 5...")
❌ Too short (<150 words)
❌ Highly technical jargon (PhD-level)
❌ Breaking news without educational context
❌ Product reviews or shopping guides
❌ Entertainment news or celebrity gossip
❌ Political news without educational value
❌ Puzzle hints or game walkthroughs
❌ Promotional or advertising content

**CRITICAL CATEGORY RULES:**

"GK Prime" = General knowledge, historical facts, world basics
  Subtypes: "How Things Work", "India Basics", "World Basics", "Spotlight Facts"
  NOT: Breaking news or current events

"Science Facts Simplified" = Biology, physics, chemistry, space, earth science
  Subtypes: "Everyday Physics & Chemistry", "Human Body & Biology Basics", "Space & Earth Science", "Science in Daily Life"
  NOT: Environmental activism or political protests

"Everyday Tech" = Technology concepts, apps, algorithms, internet, devices, AI/privacy
  Subtypes: "Apps & Algorithms Simplified", "Internet & Devices Basics", "AI, Cybersecurity & Privacy Basics", "Tech Behind Daily Life"
  NOT: Politics, economics, or non-tech business news

"Geography" = Physical features, climate, environment, regions, cultures
  Subtypes: "India Physical Geography", "Global Geography Basics", "Human & Economic Geography", "Climate & Environmental Geography"
  NOT: Political events or current affairs

**When in doubt:** Reject articles that are primarily:
- About specific people/companies (unless explaining broader concepts)
- Time-sensitive breaking news
- Political/economic news without educational angle

**RESPOND WITH STRUCTURED JSON** matching the ClassificationOutputSchema.

Be strict - only approve content that can be broken into clear, educational sections.`,
})

/**
 * Classify if content is suitable for Forge Mode
 *
 * @param {Object} seed - Article seed data
 * @returns {Promise<Object>} - Classification result
 */
async function classifyContent(seed) {
  const prompt = `Analyze this article seed:

**ARTICLE SEED:**
Title: ${seed.title}
Source: ${seed.source}
Summary: ${seed.summary || 'N/A'}
Body excerpt: ${seed.body ? seed.body.substring(0, 1000) : 'N/A'}

Classify this content according to your instructions.`

  try {
    console.log('🤖 Running classifier agent...')
    const result = await run(classifierAgent, prompt)

    // Extract the final output
    const output = result.finalOutput

    return {
      suitable: output.suitable || false,
      category: output.category || 'Unsuitable',
      subtype: output.subtype || null,
      reasoning: output.reasoning || '',
      difficulty: output.estimatedDifficulty || 'medium',
    }
  } catch (error) {
    console.error('Classification error:', error.message)
    return {
      suitable: false,
      category: 'Unsuitable',
      subtype: null,
      reasoning: 'Classification failed',
      difficulty: 'medium',
    }
  }
}

// ============================================================================
// AGENT 2: Content Rewriter (gpt-5-nano)
// ============================================================================

const rewriterAgent = new Agent({
  name: 'Content Rewriter',
  model: 'gpt-5-nano',
  outputType: RewriteOutputSchema,

  instructions: `You are an expert educational content writer creating structured learning experiences.

**YOUR TASK:**
Convert articles into 5-section "Forge Mode" reading experiences. Each section builds on the previous, creating a coherent learning journey.

**OUTPUT REQUIREMENTS:**

1. **5 Sections** - Each section must:
   - Have a descriptive title (2-4 words)
   - Contain 30-55 words of clear, educational content
   - Build logically on previous sections
   - Be self-contained (understandable if read alone)
   - Use simple language (ages 13-30 audience)
   - Include an emoji icon that fits the theme

2. **1 MCQ per Section** - Each question must:
   - Test understanding of THAT section's content
   - Have exactly 4 choices (A, B, C, D)
   - Have 1 correct answer
   - Have 1 "close" distractor (common misconception)
   - Have 2 easier distractors
   - Include an optional hint (10-15 words)
   - Include a contextNugget (brief learning path cue)

**SECTION STRUCTURE:**
Section 1: Introduction/Foundation
Section 2: Core Concept
Section 3: Mechanism/Process
Section 4: Application/Example
Section 5: Broader Context/Conclusion

**CRITICAL RULES:**
- Use ONLY facts from the source article
- NO hallucination or external knowledge
- Keep language clear and accessible
- Each section must be exactly 30-55 words
- Exactly 4 MCQ options per question
- Make questions test comprehension, not trivia

**RESPOND WITH STRUCTURED JSON** matching the RewriteOutputSchema.`,
})

/**
 * Rewrite content into Forge-ready format with 5 sections + MCQs
 *
 * @param {Object} seed - Article seed data
 * @param {Object} classification - Classification result
 * @returns {Promise<Object>} - Rewritten article
 */
async function rewriteToForgeFormat(seed, classification) {
  const prompt = `Convert this article into a 5-section Forge Mode reading experience.

**SOURCE ARTICLE:**
Title: ${seed.title}
Category: ${classification.category}
Subtype: ${classification.subtype}
Difficulty: ${classification.difficulty}
Body: ${seed.body}

Create the structured Forge article according to your instructions.`

  try {
    console.log('🤖 Running rewriter agent...')
    const result = await run(rewriterAgent, prompt)

    // Extract the final output
    const output = result.finalOutput

    // Validate structure
    if (!output.sections || output.sections.length !== 5) {
      throw new Error('Invalid section count')
    }

    // Validate each section
    output.sections.forEach((section, idx) => {
      if (
        !section.mcq ||
        !section.mcq.options ||
        section.mcq.options.length !== 4
      ) {
        throw new Error(`Section ${idx + 1} has invalid MCQ structure`)
      }
      if (section.mcq.correctIndex < 0 || section.mcq.correctIndex > 3) {
        throw new Error(`Section ${idx + 1} has invalid correctIndex`)
      }
    })

    return output
  } catch (error) {
    console.error('Rewrite error:', error.message)
    throw error
  }
}

module.exports = {
  classifyContent,
  rewriteToForgeFormat,
}
