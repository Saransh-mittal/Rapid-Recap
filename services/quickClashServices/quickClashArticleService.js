// services/quickClashServices/quickClashArticleService.js
const { makeGPTRequest } = require('../../utils/openai')
const Article = require('../../model/articleSchema')

/**
 * Get 5 random source articles from the last 7 days for a given category
 * @param {Object} params - Function parameters
 * @param {string} params.category - Article category to filter by
 * @param {Object} [params.session] - Optional Mongoose session for transactions
 * @returns {Promise<Array>} Array of articles
 */
const getSourceArticles = async ({ category, session }) => {
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Get articles in this category from the last 7 days
  const articles = await Article.find({
    category,
    dateTime: { $gte: sevenDaysAgo },
  }).session(session)

  // If we have fewer than 5 articles, return all of them
  if (articles.length <= 5) {
    return articles
  }

  // Randomly select 5 articles
  const selectedArticles = []
  const usedIndices = new Set()

  while (selectedArticles.length < 5 && usedIndices.size < articles.length) {
    // Generate random index
    const randomIndex = Math.floor(Math.random() * articles.length)

    // If this index hasn't been used, add the article
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex)
      selectedArticles.push(articles[randomIndex])
    }
  }

  return selectedArticles
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
