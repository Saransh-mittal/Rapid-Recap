// services/quickClashServices/quickClashArticleService.js
const { makeGPTRequest } = require('../../utils/openai')
const Article = require('../../model/articleSchema')
const SpecialCategory = require('../../model/specialCategorySchema')
const OpenAI = require('openai')

// /**
//  * Get 5 random source articles from the last 7 days for a given category
//  * @param {Object} params - Function parameters
//  * @param {string} params.category - Article category to filter by
//  * @param {Object} [params.session] - Optional Mongoose session for transactions
//  * @returns {Promise<Array>} Array of articles
//  */
// const getSourceArticles = async ({ category, session }) => {
//   // Calculate date 7 days ago
//   const sevenDaysAgo = new Date()
//   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

//   // Get articles in this category from the last 7 days
//   const articles = await Article.find({
//     category,
//     dateTime: { $gte: sevenDaysAgo },
//   }).session(session)

//   // If we have fewer than 5 articles, return all of them
//   if (articles.length <= 5) {
//     return articles
//   }

//   // Randomly select 5 articles
//   const selectedArticles = []
//   const usedIndices = new Set()

//   while (selectedArticles.length < 5 && usedIndices.size < articles.length) {
//     // Generate random index
//     const randomIndex = Math.floor(Math.random() * articles.length)

//     // If this index hasn't been used, add the article
//     if (!usedIndices.has(randomIndex)) {
//       usedIndices.add(randomIndex)
//       selectedArticles.push(articles[randomIndex])
//     }
//   }

//   return selectedArticles
// }

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

/**
 * Get a random source article from the last 7 days for a given category
 * @param {Object} params - Function parameters
 * @param {string} params.category - Article category to filter by
 * @param {Object} [params.session] - Optional Mongoose session for transactions
 * @returns {Promise<Object>} A single article
 */
const getSourceArticle = async ({ category, session }) => {
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // First, check if this is a special category
  const specialCategory = await SpecialCategory.findOne({
    key: category,
    isActive: true,
  }).session(session)

  let query = {}

  if (specialCategory) {
    // For special categories, look for articles with the specialCategory reference
    console.log(`Getting article for special category: ${category}`)
    query = {
      specialCategory: specialCategory._id,
    }
  } else {
    // For regular categories, use the category field
    console.log(`Getting article for regular category: ${category}`)
    query = {
      category,
      // dateTime: { $gte: sevenDaysAgo.toISOString() },
    }
  }

  // Get articles matching the query
  const articles = await Article.find(query).session(session)

  // If no articles found, throw error
  if (articles.length === 0) {
    if (specialCategory) {
      throw new Error(`No articles available in special category: ${category}`)
    } else {
      throw new Error(`No articles available in category: ${category}`)
    }
  }

  // Select one random article
  const randomIndex = Math.floor(Math.random() * articles.length)
  return articles[randomIndex]
}

/**
 * Get article highlights or schedule their creation
 * @param {Object} params - Parameters
 * @param {mongoose.Types.ObjectId} params.articleId - Article ID
 * @param {string} params.lang - Language (en/hi)
 * @param {mongoose.ClientSession} [params.session] - Optional session
 * @returns {Promise<Object>} Article highlights
 */
const getArticleHighlights = async ({
  articleId,
  lang = 'en',
  session = null,
}) => {
  try {
    // Check if highlights already exist
    const existingHighlight = await ArticleHighlight.findOne({
      articleId,
      language: lang,
      processingStatus: 'completed',
    }).session(session)

    if (existingHighlight) {
      return existingHighlight
    }

    // Check for pending highlights
    const pendingHighlight = await ArticleHighlight.findOne({
      articleId,
      language: lang,
    }).session(session)

    if (pendingHighlight) {
      // If it's an old pending highlight, schedule regeneration
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      if (pendingHighlight.lastUpdated < fiveMinutesAgo) {
        // Schedule regeneration in background after this transaction
        setTimeout(() => {
          generateArticleHighlights({
            articleId,
            lang,
            highlightId: pendingHighlight._id,
          }).catch(err =>
            console.error('Error generating article highlights:', err),
          )
        }, 100)
      }
      return pendingHighlight
    }

    // Create new placeholder highlights
    const newHighlight = new ArticleHighlight({
      articleId,
      dictionary: [],
      importantSentences: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      processingStatus: 'pending',
      language: lang,
      error: null,
    })

    if (session) {
      await newHighlight.save({ session })
    } else {
      await newHighlight.save()
    }

    // Schedule generation in background
    setTimeout(() => {
      generateArticleHighlights({
        articleId,
        lang,
        highlightId: newHighlight._id,
      }).catch(err =>
        console.error('Error generating article highlights:', err),
      )
    }, 100)

    return newHighlight
  } catch (error) {
    console.error('Error getting article highlights:', error)
    throw error
  }
}

/**
 * Generate highlights for an article
 * @param {Object} params - Parameters
 * @param {mongoose.Types.ObjectId} params.articleId - Article ID
 * @param {mongoose.Types.ObjectId} params.highlightId - Highlight document ID to update
 * @param {string} params.lang - Language (en/hi)
 */
const generateArticleHighlights = async ({
  articleId,
  highlightId,
  lang = 'en',
}) => {
  try {
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const instructions = `
    Give the output in the ${lang === 'en' ? 'English' : 'Hindi'} language.
    Analyze this news article and create two things:

    1. Important Sentences (4-6):
       - Copy sentences EXACTLY as they appear in the text
       - Maintain exact capitalization and case
       - Include key facts, statistics, or significant quotes
       - Focus on major developments or turning points
       - Do not modify any part of the sentence
       - Use exact punctuation and spacing

    2. Dictionary (5-10 terms):
       - Select terms EXACTLY as they appear in the text
       - Maintain original capitalization
       - Include technical or domain-specific terms
       - Include uncommon or specialized vocabulary or unique phrases or less known names or terms
       - Include hard vocabulary or terms that may be unfamiliar to readers
       - Copy phrases exactly as written
       - Do not modify case or punctuation
       - Verify each term exists exactly in the text

    Return ONLY a JSON object:
    {
      "dictionary": [{ "word": string, "definition": string }],
      "importantSentences": [string]
    }

    CRITICAL: Maintain exact case sensitivity - do not capitalize or modify any text.
    Copy and paste the exact text from the original.
    `

    const content =
      lang === 'en'
        ? article.mainText
        : article.hindiMainText && article.hindiMainText.length > 0
        ? article.hindiMainText.join(' ')
        : ''

    const title = lang === 'en' ? article.title : article.hindiTitle
    const decodedText = decode(content)

    const prompt = {
      title: title,
      mainText: decodedText,
      category: article.category,
    }

    // Make the OpenAI API call
    const output = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: JSON.stringify(prompt) },
      ],
    })

    const highlightData = JSON.parse(output.choices[0].message.content)

    // Update the highlight document
    await ArticleHighlight.findByIdAndUpdate(highlightId, {
      dictionary: highlightData.dictionary,
      importantSentences: highlightData.importantSentences,
      lastUpdated: new Date(),
      processingStatus: 'completed',
      error: null,
    })

    return highlightData
  } catch (error) {
    console.error(`Error generating article highlights: ${error.message}`)

    // Update the record to mark as failed
    try {
      await ArticleHighlight.findByIdAndUpdate(highlightId, {
        lastUpdated: new Date(),
        processingStatus: 'failed',
        error: error.message,
      })
    } catch (updateError) {
      console.error('Error updating failed highlight status:', updateError)
    }

    throw error
  }
}

/**
 * Format article data for QuickClash challenge
 * @param {Object} params - Parameters
 * @param {Object} params.article - Source article
 * @returns {Object} Formatted article data
 */
const formatArticleForChallenge = article => {
  return {
    title: {
      english: article.title,
      hindi: article.hindiTitle || '',
    },
    content: {
      english: article.mainText,
      hindi:
        article.hindiMainText && article.hindiMainText.length > 0
          ? article.hindiMainText.join(' ')
          : '',
    },
  }
}

/**
 * Generate Hindi translation for an article
 * @param {Object} params - Parameters
 * @param {string} params.title - English title
 * @param {string} params.content - English content
 * @returns {Promise<Object>} - Hindi title and content
 */
const generateHindiTranslation = async ({ title, content }) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const articleData = {
      title,
      content,
    }

    const hindiPrompt = `
      Translate this English news article to Hindi, maintaining journalistic tone:
      ${JSON.stringify(articleData)}

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

    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
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

    return JSON.parse(result.choices[0].message.content)
  } catch (error) {
    console.error('Error generating Hindi translation:', error)
    return { title: '', content: '' }
  }
}
module.exports = {
  // getSourceArticles,
  generateMixedArticle,
  summarizeContent, // Export for testing purposes
  getSourceArticle,
  getArticleHighlights,
  generateArticleHighlights,
  formatArticleForChallenge,
  generateHindiTranslation,
}
