const ArticleHighlight = require('../../model/articleHighlightSchema')
const {
  generateHighlightForArticle,
} = require('../../utils/article.highlight.utils')
const { makeGPTRequest } = require('../../utils/openai')
const Article = require('../../model/articleSchema')

async function getOrGenerateHighlights(articleId, lang, fromCache = false) {
  try {
    let highlights = await ArticleHighlight.findOne({
      articleId,
      processingStatus: 'completed',
      language: lang || 'en',
    })

    // Handle empty highlights
    if (
      highlights?.dictionary?.length === 0 &&
      highlights?.importantSentences?.length === 0
    ) {
      await ArticleHighlight.deleteOne({
        articleId,
        processingStatus: 'completed',
        language: lang || 'en',
      })
      highlights = null
    }

    // Generate new highlights if needed
    if (
      !highlights ||
      highlights.processingStatus !== 'completed' ||
      (highlights.dictionary.length === 0 &&
        highlights.importantSentences.length === 0)
    ) {
      if (fromCache) return highlights
      try {
        highlights = await generateHighlightForArticle({
          articleId,
          lang: lang || 'en',
        })

        // Generate inline quiz for BOTH languages directly after highlights are created
        if (
          highlights &&
          highlights.importantSentences &&
          highlights.importantSentences.length >= 2
        ) {
          console.log(
            `🎯 Generating dual-language inline quiz for article: ${articleId}`,
          )

          try {
            // Generate for both English and Hindi
            await generateDualLanguageInlineQuiz({
              articleId,
              importantSentences: highlights.importantSentences,
              sourceLanguage: lang || 'en',
            })
            console.log(
              `✅ Dual-language inline quiz generated successfully for article: ${articleId}`,
            )
          } catch (quizError) {
            console.error(
              `❌ Failed to generate dual-language inline quiz for article ${articleId}:`,
              quizError.message,
            )
            // Don't throw error - highlights are still valid
          }
        }
      } catch (error) {
        console.error('Error generating highlights:', error)
        highlights = { dictionary: [], importantSentences: [] }
      }
    }

    return highlights
  } catch (error) {
    console.error('Error in getOrGenerateHighlights:', error)
    return { dictionary: [], importantSentences: [] }
  }
}

/**
 * Generate inline quiz questions for both English and Hindi languages
 * @param {Object} params - Parameters object
 * @param {string} params.articleId - Article ID
 * @param {Array} params.importantSentences - Array of important sentences
 * @param {string} params.sourceLanguage - Source language of the article ('en' or 'hi')
 */
async function generateDualLanguageInlineQuiz({
  articleId,
  importantSentences,
  sourceLanguage = 'en',
}) {
  try {
    // Get article details
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }

    // Check if quizzes already exist for both languages
    const existingEnglishQuiz =
      article.inlineQuiz?.filter(q => q.language === 'en') || []
    const existingHindiQuiz =
      article.inlineQuiz?.filter(q => q.language === 'hi') || []

    const languagesToGenerate = []

    if (existingEnglishQuiz.length === 0) {
      languagesToGenerate.push('en')
    }
    if (existingHindiQuiz.length === 0) {
      languagesToGenerate.push('hi')
    }

    if (languagesToGenerate.length === 0) {
      console.log(
        `✅ Inline quizzes already exist for both languages for article: ${articleId}`,
      )
      return { english: existingEnglishQuiz, hindi: existingHindiQuiz }
    }

    console.log(
      `🔄 Generating quizzes for languages: ${languagesToGenerate.join(
        ', ',
      )} for article: ${articleId}`,
    )

    const results = {}

    // Generate for each required language
    for (const targetLang of languagesToGenerate) {
      try {
        console.log(
          `🔄 Generating ${targetLang} quiz for article: ${articleId}`,
        )

        const questions = await generateInlineQuizDirect({
          articleId,
          importantSentences,
          language: targetLang,
          articleTitle:
            targetLang === 'hi' ? article.hindiTitle : article.title,
          skipExistingCheck: true, // Skip check since we already checked above
        })

        results[targetLang] = questions
        console.log(
          `✅ Generated ${questions.length} ${targetLang} questions for article: ${articleId}`,
        )
      } catch (error) {
        console.error(
          `❌ Failed to generate ${targetLang} quiz for article ${articleId}:`,
          error.message,
        )
        results[targetLang] = []
      }
    }

    return results
  } catch (error) {
    console.error('❌ Error in generateDualLanguageInlineQuiz:', error.message)
    throw error
  }
}

/**
 * Generate inline quiz questions directly during highlight generation
 * @param {Object} params - Parameters object
 * @param {string} params.articleId - Article ID
 * @param {Array} params.importantSentences - Array of important sentences
 * @param {string} params.language - Language ('en' or 'hi')
 * @param {string} params.articleTitle - Article title in target language
 * @param {boolean} params.skipExistingCheck - Skip existing quiz check
 */
async function generateInlineQuizDirect({
  articleId,
  importantSentences,
  language = 'en',
  articleTitle,
  skipExistingCheck = false,
}) {
  try {
    // Get article details
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }

    // Use provided title or get from article
    const title =
      articleTitle || (language === 'hi' ? article.hindiTitle : article.title)

    // Check if quiz already exists for this language (unless skipping)
    if (!skipExistingCheck) {
      const existingQuiz =
        article.inlineQuiz?.filter(q => q.language === language) || []
      if (existingQuiz.length > 0) {
        console.log(
          `✅ Inline quiz already exists for article: ${articleId}, language: ${language}`,
        )
        return existingQuiz
      }
    }

    // Create sentence groups (2-3 sentences each)
    const sentenceGroups = createSentenceGroupsDirect(importantSentences, 3) // Limit to 3 questions max

    if (sentenceGroups.length === 0) {
      console.log(
        `⚠️ No suitable sentence groups found for article: ${articleId}`,
      )
      return []
    }

    // Generate questions for each group
    const generatedQuestions = []
    for (let i = 0; i < sentenceGroups.length; i++) {
      const group = sentenceGroups[i]
      console.log(
        `🔄 Generating ${language} question ${i + 1}/${
          sentenceGroups.length
        } for article: ${articleId}`,
      )

      try {
        const question = await generateQuestionFromSentencesDirect({
          sentences: group.sentences,
          language,
          articleTitle: title,
        })

        if (question) {
          generatedQuestions.push({
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            relatedSentences: group.sentences.map(s => ({
              sentenceIndex: s.index,
              sentence: s.text,
            })),
            sentencePosition: group.sentences[1].index, // Use second sentence position
            language,
            difficulty: determineDifficultyDirect(question.question),
            answerStats: {
              totalResponses: 0,
              optionCounts: [0, 0, 0, 0], // Initialize with 4 zeros
              lastUpdated: new Date(),
            },
            userResponses: [],
          })
        }
      } catch (error) {
        console.error(
          `❌ Failed to generate ${language} question for group ${i + 1}:`,
          error.message,
        )
      }
    }

    if (generatedQuestions.length === 0) {
      console.log(
        `⚠️ No ${language} questions generated for article: ${articleId}`,
      )
      return []
    }

    // Save questions to article
    article.inlineQuiz = article.inlineQuiz || []

    // Add new questions (don't remove existing ones for other languages)
    article.inlineQuiz.push(...generatedQuestions)

    await article.save()

    console.log(
      `✅ Generated ${generatedQuestions.length} ${language} inline quiz questions for article: ${articleId}`,
    )
    return generatedQuestions
  } catch (error) {
    console.error(
      `❌ Error in generateInlineQuizDirect for ${language}:`,
      error.message,
    )
    throw error
  }
}

/**
 * Create groups of 2-3 sentences for question generation
 */
function createSentenceGroupsDirect(sentences, maxGroups = 2) {
  const groups = []
  const sentencesWithIndex = sentences.map((text, index) => ({ text, index }))

  // Create groups of 2-3 sentences with some overlap
  for (
    let i = 0;
    i < sentencesWithIndex.length - 1 && groups.length < maxGroups;
    i += 2
  ) {
    const group = {
      sentences: [sentencesWithIndex[i], sentencesWithIndex[i + 1]],
    }

    // Add third sentence if available and makes sense
    if (i + 2 < sentencesWithIndex.length && Math.random() > 0.5) {
      group.sentences.push(sentencesWithIndex[i + 2])
    }

    groups.push(group)
  }

  return groups
}

/**
 * Generate a question from a group of sentences using AI
 */
async function generateQuestionFromSentencesDirect({
  sentences,
  language,
  articleTitle,
}) {
  const sentenceTexts = sentences.map(s => s.text).join(' ')

  const instructions = `You are an expert quiz generator. Create a multiple-choice question based on the provided important sentences from a news article.

**Requirements:**
1. Generate ONE question that tests comprehension of the key information in the sentences
2. Create 4 options (A, B, C, D) with only ONE correct answer
3. The question should be factual and based directly on the information provided
4. Make the incorrect options plausible but clearly wrong
5. Keep the question and options concise but clear
6. The question should test understanding, not just memory
7. Focus on the most important facts, numbers, or key points mentioned

**Language:** ${
    language === 'hi'
      ? 'Generate the question in Hindi using Devanagari script. Use proper Hindi grammar and vocabulary.'
      : 'Generate the question in English'
  }

**Article Title:** ${articleTitle}

**Important Sentences:** ${sentenceTexts}

**Output Format:** Return ONLY a JSON object:
\`\`\`json
{
  "question": "Your question here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0
}
\`\`\`

Where correctAnswer is the index (0-3) of the correct option.`

  try {
    const result = await makeGPTRequest({
      messages: [
        { role: 'system', content: instructions },
        {
          role: 'user',
          content: `Generate a ${
            language === 'hi' ? 'Hindi' : 'English'
          } quiz question for these sentences: ${sentenceTexts}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600, // Increased for Hindi text
    })

    // Validate the result
    if (
      !result.question ||
      !result.options ||
      !Array.isArray(result.options) ||
      result.options.length !== 4
    ) {
      throw new Error('Invalid question format received from AI')
    }

    if (
      typeof result.correctAnswer !== 'number' ||
      result.correctAnswer < 0 ||
      result.correctAnswer > 3
    ) {
      throw new Error('Invalid correct answer index')
    }

    return result
  } catch (error) {
    console.error(
      `Error generating ${language} question from sentences:`,
      error.message,
    )
    throw error
  }
}

/**
 * Determine question difficulty based on complexity
 */
function determineDifficultyDirect(question) {
  const wordCount = question.split(' ').length
  const hasComplexTerms =
    /\b(analysis|significant|implementation|approximately|consequently)\b/i.test(
      question,
    )

  if (wordCount > 20 || hasComplexTerms) return 'hard'
  if (wordCount > 12) return 'medium'
  return 'easy'
}

module.exports = {
  getOrGenerateHighlights,
  generateInlineQuizDirect,
  generateDualLanguageInlineQuiz,
}
