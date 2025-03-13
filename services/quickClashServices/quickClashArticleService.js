// services/quickClashServices/quickClashArticleService.js
const { makeGPTRequest } = require('../../utils/openai')
const Article = require('../../model/articleSchema')

/**
 * Get source articles based on weighted scoring of recency, time spent, and quiz attempts
 * @param {Object} params - Function parameters
 * @param {string} params.category - Article category to filter by
 * @param {Object} [params.session] - Optional Mongoose session for transactions
 * @returns {Promise<Array>} Array of articles
 */
const getSourceArticles = async ({ category, session }) => {
  // Define weights for scoring factors
  const WEIGHTS = {
    recency: 0.5, // 50% weight for how recent the article is
    timeSpent: 0.3, // 30% weight for how much time users spend reading
    quizAttempts: 0.2, // 20% weight for quiz attempt popularity
  }

  // Get articles in this category
  const articles = await Article.find({ category })
    .sort({ dateTime: -1 }) // Sort by date, newest first
    .limit(15) // Get more than we need for our custom scoring
    .session(session)

  // Calculate scores
  const now = new Date()
  const scoredArticles = articles.map(article => {
    // Parse date (assuming dateTime can be parsed by Date constructor)
    let articleDate
    try {
      articleDate = new Date(article.dateTime)
      if (isNaN(articleDate.getTime())) throw new Error('Invalid date')
    } catch (e) {
      // Fallback to creation date
      articleDate = article.createdAt || now
    }

    // Calculate days difference (max 90 days)
    const daysDiff = Math.min(
      90,
      Math.max(0, (now - articleDate) / (1000 * 60 * 60 * 24)),
    )

    // Calculate scores (0-1 scale)
    const recencyScore = Math.max(0, 1 - daysDiff / 90)
    const quizAttemptScore = Math.min(1, (article.quizAttemptCnt || 0) / 100)
    const timeSpentScore = Math.min(1, (article.avgReadTime || 0) / 300) // Assuming 300 seconds (5 mins) is a good read time

    // Weighted total score
    const totalScore =
      recencyScore * WEIGHTS.recency +
      quizAttemptScore * WEIGHTS.quizAttempts +
      timeSpentScore * WEIGHTS.timeSpent

    return {
      article,
      score: totalScore,
    }
  })

  // Sort by score and return top 5
  scoredArticles.sort((a, b) => b.score - a.score)
  return scoredArticles.slice(0, 5).map(item => item.article)
}

const generateMixedArticle = async ({ articles }) => {
  const sourceContent = articles.map(article => ({
    title: article.title,
    content: article.mainText,
  }))

  // Generate English content
  const englishPrompt = `
    Create an engaging news article (800-1600 chars) by combining these sources:
    ${sourceContent
      .map(a => `Title: ${a.title}\nContent: ${a.content}`)
      .join('\n\n')}

    Requirements:
    1. Maintain factual accuracy and key details from source articles
    2. Create smooth transitions between different pieces of information
    3. Make it engaging and informative while keeping formal news tone
    4. Return JSON with format:
       {
         "title": "Combined article title",
         "content": "Full article content"
       }
  `

  const englishArticle = await makeGPTRequest({
    messages: [
      {
        role: 'system',
        content:
          'You are an expert journalist who specializes in creating engaging news articles.',
      },
      {
        role: 'user',
        content: englishPrompt,
      },
    ],
    temperature: 0.7, // Lower temperature for more factual content
  })

  // Check if English content exceeds the length limit and summarize if needed
  let processedEnglishArticle = { ...englishArticle }
  if (englishArticle.content.length > 1700) {
    processedEnglishArticle = await summarizeContent({
      article: englishArticle,
      targetLength: 1500,
    })
  }

  // Generate Hindi translation using the processed English article
  const hindiPrompt = `
    Translate this English news article to Hindi, maintaining journalistic tone:
    ${JSON.stringify(processedEnglishArticle)}

    Requirements:
    1. Natural and fluent Hindi translation
    2. Maintain formal news article style
    3. Keep all factual information accurate
    4. Return JSON with format:
       {
         "title": "शीर्षक",
         "content": "समाचार सामग्री"
       }
  `

  const hindiArticle = await makeGPTRequest({
    messages: [
      {
        role: 'system',
        content: 'You are an expert Hindi news translator.',
      },
      {
        role: 'user',
        content: hindiPrompt,
      },
    ],
    temperature: 0.7,
  })

  return {
    title: {
      english: processedEnglishArticle.title,
      hindi: hindiArticle.title,
    },
    content: {
      english: processedEnglishArticle.content,
      hindi: hindiArticle.content,
    },
  }
}

// New function to summarize content that exceeds the character limit
const summarizeContent = async ({ article, targetLength }) => {
  console.log(
    `Article exceeds length limit (${article.content.length} chars). Summarizing to ~${targetLength} chars...`,
  )

  const summarizePrompt = `
    Summarize this article to approximately ${targetLength} characters while preserving key information:
    ${JSON.stringify(article)}

    Requirements:
    1. Maintain all important facts and information
    2. Keep the same journalistic tone and style
    3. Focus on clarity and comprehensiveness despite the length reduction
    4. The output should be ${targetLength}-${targetLength + 100} characters
    5. Return JSON with format:
       {
         "title": "Original or slightly modified title",
         "content": "Summarized content"
       }
  `

  const summarizedArticle = await makeGPTRequest({
    messages: [
      {
        role: 'system',
        content:
          'You are an expert editor who specializes in concise news summaries that maintain key information.',
      },
      {
        role: 'user',
        content: summarizePrompt,
      },
    ],
    temperature: 0.5, // Lower temperature for more accurate summarization
  })

  // Log the result of the summarization
  console.log(
    `Summarization complete. Original: ${article.content.length} chars, New: ${summarizedArticle.content.length} chars`,
  )

  return summarizedArticle
}

module.exports = {
  getSourceArticles,
  generateMixedArticle,
  summarizeContent, // Export for testing purposes
}
