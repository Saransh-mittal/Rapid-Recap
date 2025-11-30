const { z } = require('zod')

// ============================================================================
// SCHEMA
// ============================================================================

const BatchQuizOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string().max(120).describe('Concise question (max 15 words)'),
    options: z.object({
      a: z.string().max(50).describe('Option A (max 5 words)'),
      b: z.string().max(50).describe('Option B (max 5 words)'),
      c: z.string().max(50).describe('Option C (max 5 words)'),
      d: z.string().max(50).describe('Option D (max 5 words)'),
    }),
    answer: z.enum(['a', 'b', 'c', 'd']),
    explanation: z.string().max(200).describe('Brief explanation (max 20 words)'),
    difficulty: z.number().min(0.01).max(0.99),
  })).length(5),
  overallDifficulty: z.number(),
  reasoning: z.string(),
})

// ============================================================================
// PROMPT
// ============================================================================

const BATCH_QUIZ_SYSTEM_PROMPT = `You are an expert quiz creator for a fast-paced mobile game.

**GOAL:**
Create 5 multiple-choice questions based on the provided article.
These questions must be **EXTREMELY CONCISE** and readable in **8-10 seconds**.

**RULES:**
1. **Length Constraints (STRICT):**
   - Question: MAX 15 words.
   - Options: MAX 5 words each.
   - Explanation: MAX 20 words.
2. **Content:**
   - Test comprehension of the article.
   - DO NOT duplicate the "Existing Section MCQs" provided in the prompt.
   - Use simple, direct language.
3. **Difficulty:**
   - Mix of Easy (0.3), Medium (0.6), Hard (0.9).

**OUTPUT:**
Return a JSON object matching the schema.`

module.exports = {
  BatchQuizOutputSchema,
  BATCH_QUIZ_SYSTEM_PROMPT
}
