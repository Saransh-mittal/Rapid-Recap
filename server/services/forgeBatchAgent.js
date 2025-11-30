const { z } = require('zod')

// ============================================================================
// COMBINED OUTPUT SCHEMA
// ============================================================================

/**
 * Combined Output Schema for Batch Processing
 *
 * Handles two scenarios:
 * 1. Unsuitable content -> returns suitable=false and reasoning
 * 2. Suitable content -> returns suitable=true AND the full rewritten article
 */
const BatchForgeOutputSchema = z.object({
  suitable: z.boolean().describe('Whether content is suitable for Forge Mode'),

  // Classification Fields
  category: z.enum([
    'GK Prime',
    'Science Facts Simplified',
    'Everyday Tech',
    'Geography',
    'Unsuitable'
  ]).describe('Main category classification'),

  subtype: z.string().nullable().describe('Specific subtype within category'),

  reasoning: z.string().describe('Explanation for classification/rejection'),

  estimatedDifficulty: z.enum(['easy', 'medium', 'hard']).describe('Estimated difficulty'),

  // Rewritten Content (Optional - only if suitable is true)
  article: z.object({
    title: z.string().describe('Concise article title (5-8 words)'),

    sections: z.array(z.object({
      sectionNumber: z.number().min(1).max(5),
      title: z.string().describe('Section title (2-4 words)'),
      content: z.string().describe('Educational content (30-55 words)'),
      icon: z.string().describe('Emoji icon'),

      mcq: z.object({
        question: z.string().describe('Prediction/Curiosity question (Max 15 words)'),
        options: z.array(z.string()).length(4).describe('4 options (Max 5-7 words each)'),
        correctIndex: z.number().min(0).max(3),
        hint: z.string().optional(),
        contextNugget: z.string().describe('Brief learning path cue'),
      })
    })).length(5).optional().describe('Rewritten sections (Required if suitable=true)'),

    tags: z.array(z.string()).optional(),
  }).nullable().describe('Rewritten article data (Null if unsuitable)'),
})

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const BATCH_SYSTEM_PROMPT = `You are an expert educational content processor.

**YOUR TASK:**
Analyze the input article and perform a TWO-STEP process:

**STEP 1: CLASSIFY**
Determine if the content is suitable for a "Forge Mode" 5-section educational reading experience (Ages 13-30).
- **Suitable:** Factual, educational, science/tech/geo/history, >150 words.
- **Unsuitable:** Opinion, politics, breaking news, listicles, too short.

**STEP 2: REWRITE (Only if Suitable)**
If suitable, IMMEDIATELY rewrite it into the Forge format.
- **5 Sections:** Logical flow (Intro -> Concept -> Mechanism -> Application -> Conclusion).
- **30-55 words per section.**
- **1 MCQ per section:**
    - **GOAL:** Spark curiosity/prediction ("What do you think...", "How might...").
    - **FORBIDDEN:** "According to the text...", "What did you just read?".
    - **LENGTH:** Question max 15 words, Options max 5-7 words.

**OUTPUT:**
Return a JSON object matching the schema.
- If \`suitable: false\`, set \`article: null\`.
- If \`suitable: true\`, populate the \`article\` field with the full rewritten content.
`

module.exports = {
  BatchForgeOutputSchema,
  BATCH_SYSTEM_PROMPT
}
