const natural = require('natural')
const OpenAI = require('openai')
// const { progressBar } = require("./progress.utils");
const Article = require('../model/articleSchema')
const { decode } = require('html-entities')
const NewsAPI = require('newsapi')
const axios = require('axios')
const script_prepare_article_data = require('../scripts/script_prepare_article_data')
const {
  averageReadTime,
  shuffleArray,
  formatDate,
} = require('./miscellaneous.utils')
const { Recommendation } = require('../model/recommendationSchema')
const newsClassifierService = require('../ml/services/newsClassifierService')
const cache = require('memory-cache')
const { generateHighlightForArticle } = require('./article.highlight.utils')
const { generateKeywordsAndDescription } = require('./seoHelper')
const { findDuplicateArticles } = require('../services/duplicateCheckService')
const { commonTerms } = require('./commonTerms')
const { processArticle } = require('../services/articleProcessor')
const ArticleHighlight = require('../model/articleHighlightSchema')
const {
  getOrGenerateHighlights,
} = require('../services/articleServicesForEndUsers/articleHighlightService')

const breakArticleIntoParagraphs = async mainText => {
  const tokenizer = new natural.SentenceTokenizer()
  // Use natural language processing to tokenize sentences
  const sentences = tokenizer.tokenize(mainText)

  // Break the sentences into three paragraphs
  const paragraphLength = Math.ceil(sentences.length / 3)
  const paragraphs = []

  for (let i = 0; i < sentences.length; i += paragraphLength) {
    const paragraph = sentences.slice(i, i + paragraphLength).join(' ')
    paragraphs.push(paragraph)
  }
  return paragraphs
}

const hindiConverter = async articleId => {
  const article = await Article.findById(articleId)
  const { title, author, mainText } = article

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    const prompt = `Title: ${title}\n Author: ${author}\n\n MainText: ${mainText}\n\n`
    const instructions1 =
      'do you know about daily speaking hindi spoken by a common Indian'
    const instructions2 =
      'I will provide you the article ,convert it in the above manner and letters should be in hindi.'
    const instructions3 = `Instructions:
                                1. Author is name of the author of the article, translate author name to hindi ,dont write its meaning.
                                2. Break maintext in only 3 paragraphs.
                                3. Make a JSON object containing hindiTitle, hindiAuthor, and hindiMainText.
                                4. Ensure that all information from the original article mainText is retained
                                5. Do not summarize the content.
                                6. Preserve the original meaning of the text.
                                5.  Return the JSON object which contains the translated text and looks like :
                                {
                                  "hindiTitle": "translated title",
                                  "hindiAuthor": "translated author",
                                  "hindiMainText": {
                                    "para1": "translated paragraph1",
                                    "para2": "translated paragraph2",
                                    "para3": "translated paragraph3"
                                  }
                                }

                                CRITICAL: Dont cut sentences in between, translate the whole sentence. Keep all the information in the mainText. There should be no missing information that is there in the english mainText.
                                `

    let result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `${instructions1}`,
        },
        {
          role: 'system',
          content: `${instructions2}`,
        },
        {
          role: 'system',
          content: `${instructions3}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })
    let response = JSON.parse(result.choices[0].message.content)
    let cnt = 3
    while (
      (!response.hindiTitle ||
        !response.hindiAuthor ||
        !response.hindiMainText) &&
      cnt-- > 0
    ) {
      result = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `${instructions1}`,
          },
          {
            role: 'system',
            content: `${instructions2}`,
          },
          {
            role: 'system',
            content: `${instructions3}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      })
      response = JSON.parse(result.choices[0].message.content)
    }
    if (
      !response.hindiTitle ||
      !response.hindiAuthor ||
      !response.hindiMainText
    ) {
      throw new Error('Failed to translate article')
    }
    if (!article.hindiMainText) {
      article.hindiMainText = []
      await article.save()
    }
    article.hindiTitle = response.hindiTitle

    for (let key in response.hindiMainText) {
      if (!response.hindiMainText[key]) continue
      article.hindiMainText.push(response.hindiMainText[key])
    }
    article.hindiAuthor = response.hindiAuthor
    await article.save()
    return article
  } catch (error) {
    console.log(error)
  }
}

const processNews = async news => {
  const instructions = `you are a text checker and analyser

remove the unnecessary content or lines of the mainText which is not related to the title for example Also read(section),
if question in the mainText that are not answered or not there in the mainText etc.
Don't summarize the content. and only return the same json_object back:
also analyze the content and give categories between : [general,business,sports,health,science,entertainment,technology]

fill these in the category key (only string). Also if total characters are more than 2500 than summarize the whole mainText in 2500 characters.`

  const validCategories = [
    'general',
    'business',
    'sports',
    'health',
    'science',
    'entertainment',
    'technology',
  ]
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const processedOutput = []
  // const updateProgress = progressBar(news.length);
  for (let newsItem of news) {
    try {
      const isArticle = await Article.findOne({
        title: newsItem.title,
      })

      if (isArticle) {
        throw new Error('Article already exists')
      }
      if (newsItem.text.length < 800) {
        throw new Error('Text is too short')
      }
      const encodedText = newsItem.text
      const decodedText = decode(encodedText)
      const encodedTitle = newsItem.title
      const decodedTitle = decode(encodedTitle)
      const prompt = JSON.stringify({
        url: newsItem.url,
        dateTime: newsItem.publish_date,
        author: newsItem.author,
        title: decodedTitle,
        mainText: decodedText,
        imgURL: [newsItem.image],
        category: '',
      })

      let output = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: instructions,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      let res = JSON.parse(output.choices[0].message.content)

      if (res.mainText.length > 2500) {
        output = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are a summarizer. Summarize the mainText to 2500 characters and only return the same json_object back',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        })
      }
      res = JSON.parse(output.choices[0].message.content)

      if (!validCategories.includes(res.category)) {
        res.category = 'general'
      }
      if (
        !res.mainText ||
        !res.title ||
        !res.author ||
        !res.url ||
        !res.dateTime ||
        !res.imgURL ||
        !res.category
      ) {
        continue
      }
      const predictedCategory = await newsClassifierService.classifyNews(
        res.mainText,
      )
      res.category = predictedCategory
      processedOutput.push(res)

      const newArticle = new Article(res)
      await newArticle.save()
    } catch (error) {
      console.log(error)
    } finally {
      // updateProgress();
    }
  }

  return processedOutput
}

const fetchNews = async query => {
  const apiKey = 'e7409124fe384b688c07763501b270dd' // rapidrecap2k23@gmail.com
  const url = `https://api.worldnewsapi.com/search-news?${query}&language=en&earliest-publish-date=2024-04-28`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch news articles')
    }

    const data = await response.json()
    return data.news.filter(news => news.text.length >= 800)
  } catch (error) {
    console.log(error)
    return []
  }
}

const extractNewsFromLink = async (query, apiKey) => {
  const url = `https://api.worldnewsapi.com/extract-news?url=${query}`
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch news articles')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.log(`Error extracting news from URL ${query}: ${error.message}`)
    return null // Return null to handle the error gracefully
  }
}

const processExtractedNews = async (news, category) => {
  const processedOutput = []

  // Step 1: Initial validation and filtering
  const validNews = news.filter(newsItem => {
    if (!newsItem || !newsItem.title || !newsItem.text) {
      console.error('Invalid news item structure')
      return false
    }
    if (newsItem.text.length < 800) {
      console.error(`Text too short for "${newsItem.title}"`)
      return false
    }
    return true
  })

  try {
    // Step 2: Process all articles in parallel
    const processedArticles = await Promise.all(
      validNews.map(async newsItem => {
        try {
          return await processArticle({
            ...newsItem,
            category,
          })
        } catch (error) {
          console.error(
            `Error processing article "${newsItem.title}": ${error.message}`,
          )
          return null
        }
      }),
    )

    // Step 3: Filter out failed processes and validate lengths
    const validProcessedArticles = processedArticles.filter(article => {
      if (!article) return false

      const isValidLength =
        article.mainText.length >= 800 && article.mainText.length <= 2000
      if (!isValidLength) {
        console.error(
          `Processed text length (${article.mainText.length}) outside acceptable range for "${article.title}"`,
        )
      }
      return isValidLength
    })

    // Step 4: Sequential processing for duplicates check and saving
    for (const processedArticle of validProcessedArticles) {
      try {
        // Check for duplicates
        const { isDuplicate, contentVector, duplicateArticles } =
          await findDuplicateArticles({
            title: processedArticle.title,
            mainText: processedArticle.mainText,
            keywords: processedArticle.keywords || [],
          })

        if (isDuplicate) {
          console.log(
            `Duplicate article found for "${processedArticle.title}". Similar articles:`,
            duplicateArticles.map(a => ({ title: a.title, score: a.score })),
          )
          continue
        }

        // Enhance article with additional fields
        const avgReadTime = averageReadTime(processedArticle.mainText)
        const enhancedArticle = {
          ...processedArticle,
          contentVector,
          vectorized: true,
          avgReadTime,
          articleDifficulty: calculateArticleDifficulty({
            mainText: processedArticle.mainText,
          }),
        }

        // Update category if needed
        if (
          enhancedArticle.category !== 'top' &&
          enhancedArticle.category !== 'crime'
        ) {
          try {
            const predictedCategory = await newsClassifierService.classifyNews(
              enhancedArticle.mainText,
            )
            enhancedArticle.category =
              predictedCategory || enhancedArticle.category
          } catch (error) {
            console.error(
              `Error classifying news item titled "${enhancedArticle.title}": ${error.message}`,
            )
          }
        }

        // Save article
        const newArticle = new Article(enhancedArticle)
        await newArticle.save()
        // Generate highlights asynchronously
        Promise.all([
          getOrGenerateHighlights(newArticle._id, 'en'),
          getOrGenerateHighlights(newArticle._id, 'hi'),
        ]).catch(error => {
          console.error(
            `❌ Error generating highlights for "${newArticle.title}":`,
            error,
          )
          // You might want to update the article's processingStatus here if highlight generation fails
        })
        console.log(`Saved article "${newArticle.title}"`)
        processedOutput.push(newArticle)
      } catch (error) {
        console.error(
          `Error in final processing for "${processedArticle.title}": ${error}`,
        )
      }
    }
  } catch (error) {
    console.error('Error in batch processing:', error)
  }

  return processedOutput
}

const extractNewsUtilityFunc = async (country = 'in') => {
  // const newsapi = new NewsAPI('fb29cd0efb7e4ed292134d083f457869')
  let apiKeys = [
    '9921240e42464f3589886811e71a3977',
    '88905479ff7c4564ae48aef8b23d56d0',
    '197c615648c946d8ab50590b4c9ab408', // squartal693@gmail.com
    'dcd8cdcdb15c420d9e1d83d322962653', // muckhpoke@gmail.com
    'acd1bf365a084183b509789e0aae202a',
    '11bc2812de624777ae7efed3feac7d54', // charizard.kento@gmail.com
    'fa26103bbdd849c3a4a6ff9f713a2a91',
    'e20b7e002db74c22b29beb122b72e8c8',
    'f5b9f1b4fa0342fe976664de66c71ca0', // inferno.sinho777@gmail.com
    '819c3bf3fab848a89741017dd5e67091',
  ]
  apiKeys = shuffleArray(apiKeys)
  // const newsAPICategories = ['general']
  const newsDataIoCategories = [
    'business',
    'crime',
    // 'domestic',
    'education',
    'environment',
    'food',
    'health',
    'lifestyle',
    'other',
    'politics',
    'science',
    'technology',
    'top',
    'tourism',
    'world',
    'sports',
    'entertainment',
  ]
  const requestsPerKey = 5
  let keyTracker = { currentKeyIndex: 0, requestsMadeWithCurrentKey: 0 }

  let result = []
  let notificationCategories = [
    // ...newsAPICategories,
    ...newsDataIoCategories,
  ].join(', ')
  let articlesSavedPerCategory = {}

  try {
    // await processCategories(
    //   newsapi,
    //   newsAPICategories,
    //   apiKeys,
    //   requestsPerKey,
    //   keyTracker,
    //   result,
    //   articlesSavedPerCategory,
    //   country,
    // )
    await processDataIoCategories(
      newsDataIoCategories,
      apiKeys,
      requestsPerKey,
      keyTracker,
      result,
      articlesSavedPerCategory,
      country,
    )
    for (const [category, count] of Object.entries(articlesSavedPerCategory)) {
      if (count > 0) {
        try {
          const cacheKeys = cache.keys()
          const articleCacheKeys = cacheKeys.filter(key =>
            key.startsWith(`articles_${category}_`),
          )
          articleCacheKeys.forEach(key => cache.del(key))
        } catch (error) {
          console.error(
            `Error updating cache for category ${category}: ${error.message}`,
          )
        }
      }
    }

    script_prepare_article_data()
    return { result, articlesSavedPerCategory, notificationCategories }
  } catch (error) {
    console.log(`Error in extractNewsUtilityFunc: ${error.message}`)
  }
}

const processCategories = async (
  newsapi,
  categories,
  apiKeys,
  requestsPerKey,
  keyTracker,
  result,
  articlesSavedPerCategory,
  country,
) => {
  for (let category of categories) {
    console.log(`\nExtracting news of category ${category}\n`)
    let options = {
      category,
      language: 'en',
      pageSize: 10,
    }
    // if (country) {
    //   options.country = country
    // }

    let articles = []
    if (category === 'sports') {
      const sportsQueries = ['football', 'cricket', 'badminton', 'olympics']
      options.pageSize = 5

      for (let query of sportsQueries) {
        options.q = query
        const response = await newsapi.v2.topHeadlines(options)
        articles = articles.concat(response.articles)
      }
    } else if (category === 'entertainment') {
      const entertainmentQueries = ['movies', 'music', 'bollywood']
      options.pageSize = 5

      for (let query of entertainmentQueries) {
        options.q = query
        const response = await newsapi.v2.topHeadlines(options)
        articles = articles.concat(response.articles)
      }
      // remove q parameter to get general entertainment news
      delete options.q
      const response = await newsapi.v2.topHeadlines(options)
      articles = articles.concat(response.articles)
    } else {
      const response = await newsapi.v2.topHeadlines(options)
      articles = response.articles
    }

    console.log(articles.length)

    let allProcessedOutput = await processArticles(
      articles,
      apiKeys,
      requestsPerKey,
      keyTracker,
    )
    const AiProcessedNews = await processExtractedNews(
      allProcessedOutput,
      category,
    )

    result.push(...AiProcessedNews)
    articlesSavedPerCategory[category] = AiProcessedNews.length
  }
}

const processDataIoCategories = async (
  categories,
  apiKeys,
  requestsPerKey,
  keyTracker,
  result,
  articlesSavedPerCategory,
  country,
) => {
  for (let category of categories) {
    console.log(`\nExtracting news of category ${category}\n`)
    let queries = {
      category,
      language: 'en',
      prioritydomain: 'top',
      timezone: 'Asia/Kolkata',
      size: '5',
    }
    if (country) {
      queries.country = country
    }
    if (category === 'tourism') {
      queries.size = '3'
    }
    const queryString = Object.entries(queries)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    const response = await axios.get(
      `https://newsdata.io/api/1/latest?apikey=pub_37495bb8e5dde4895a967868c687ebd423775&${queryString}`,
    )
    const articles = JSON.parse(JSON.stringify(response.data.results))

    console.log(articles.length)

    let allProcessedOutput = await processArticles(
      articles,
      apiKeys,
      requestsPerKey,
      keyTracker,
    )
    const AiProcessedNews = await processExtractedNews(
      allProcessedOutput,
      category === 'other' ? 'general' : category,
    )

    result.push(...AiProcessedNews)
    articlesSavedPerCategory[category] = AiProcessedNews.length
  }
}

const processArticles = async (
  articles,
  apiKeys,
  requestsPerKey,
  keyTracker,
) => {
  let allProcessedOutput = []

  for (let article of articles) {
    try {
      if (keyTracker.requestsMadeWithCurrentKey >= requestsPerKey) {
        // Rotate to the next API key
        keyTracker.currentKeyIndex =
          (keyTracker.currentKeyIndex + 1) % apiKeys.length
        keyTracker.requestsMadeWithCurrentKey = 0
      }

      const apiKey = apiKeys[keyTracker.currentKeyIndex]
      const extractedNews = await extractNewsFromLink(
        article.url || article.link,
        apiKey,
      )
      if (extractedNews) {
        allProcessedOutput.push(extractedNews)
      }

      keyTracker.requestsMadeWithCurrentKey++
    } catch (error) {
      console.log(
        `Error extracting news from article ${article.title || 'unknown'}: ${
          error.message
        }`,
      )
    }
  }

  return allProcessedOutput
}

const getTopArticle = async () => {
  try {
    const articles = await Article.find({ category: 'top' }).sort({
      dateTime: -1,
    })
    const article = articles[0]
    return article
  } catch (error) {
    console.log(error)
  }
}

const getSecondTopArticle = async () => {
  try {
    const articles = await Article.find({ category: 'top' }).sort({
      dateTime: -1,
    })
    const article = articles[1]
    return article
  } catch (error) {
    console.log(error)
  }
}

const getTopThreeRecommendedArticles = async userId => {
  try {
    const userRecommendedArticles = await Recommendation.findOne({
      user_id: userId,
    }).select('recommendations')

    let cnt = 4
    const articlesForMail = []
    if (
      !userRecommendedArticles ||
      !userRecommendedArticles.recommendations ||
      userRecommendedArticles.recommendations.length === 0
    )
      return articlesForMail
    for (const article of userRecommendedArticles.recommendations) {
      if (cnt === 0) break
      const articleData = await Article.findById(article._id).select(
        'title imgURL',
      )
      if (
        !articleData ||
        !articleData.imgURL ||
        articleData.imgURL[0] === '' ||
        articleData.title.length > 100
      )
        continue
      articlesForMail.push({
        articleData,
        link: `https://rapidrecap.ai/article/${articleData._id.toString()}`,
      })
      cnt--
    }
    return articlesForMail
  } catch (error) {
    console.error(error)
    throw new Error('Failed to fetch recommended articles')
  }
}

/**
 * Convert article difficulty number to string representation
 * @param {number} difficulty - Article difficulty value
 * @returns {string} - Difficulty level as string
 */
const getDifficultyString = difficulty => {
  return difficulty < 0.5
    ? 'easy'
    : difficulty >= 0.5 && difficulty < 0.7
    ? 'medium'
    : 'hard'
}

/**
 * Process articles based on user privileges
 * Handles both single category and multi-category privilege formats
 * @param {Array} articles - Array of articles to process
 * @param {Object} privileges - User privileges object
 * @returns {Array} - Processed articles with privilege information
 */
const processArticlesWithPrivileges = (articles, privileges) => {
  // No privileges or invalid input
  if (
    !privileges ||
    (!privileges.rqmBoost &&
      !privileges.radar &&
      !privileges.privilegesByCategory)
  ) {
    return articles
  }
  return articles.map(article => {
    let categoryPrivileges

    // Handle multi-category privileges (for recommendations)
    if (privileges.privilegesByCategory) {
      categoryPrivileges = privileges.privilegesByCategory[
        article.category
      ] || {
        rqmBoost: false,
        radar: false,
      }
    } else {
      // Handle single category privileges (for allArticles)
      categoryPrivileges = {
        rqmBoost: privileges.rqmBoost,
        radar: privileges.radar,
      }
    }

    const articleDifficulty =
      article?.articleDifficulty ||
      calculateArticleDifficulty({
        mainText: Array.isArray(article.mainText)
          ? article.mainText.join(' ')
          : article.mainText,
      })

    return {
      ...article,
      // Only include articleDifficulty string if radar privilege exists
      articleDifficulty: categoryPrivileges.radar
        ? typeof articleDifficulty === 'string'
          ? articleDifficulty
          : getDifficultyString(articleDifficulty)
        : undefined,
      // Include RQM boost availability
      rqmBoostAvailable: categoryPrivileges.rqmBoost,
    }
  })
}

const calculateArticleDifficulty = ({ mainText }) => {
  try {
    // Calculate raw scores
    const numericScore = calculateNumericScore(mainText)
    const lengthScore = calculateLengthScore(mainText)
    const complexityScore = calculateComplexityScore(mainText)

    // Base difficulty - maintain relative relationships
    const baseDifficulty =
      numericScore * 0.3 + lengthScore * 0.35 + complexityScore * 0.35

    // Enhanced scaling with better granularity
    let scaledDifficulty

    if (baseDifficulty <= 0.43) {
      // Easy range (0.35-0.48)
      scaledDifficulty = 0.35 + (baseDifficulty / 0.43) * 0.13
    } else if (baseDifficulty <= 0.54) {
      // Lower-medium range (0.49-0.55)
      scaledDifficulty = 0.49 + ((baseDifficulty - 0.44) / 0.1) * 0.06
    } else if (baseDifficulty <= 0.56) {
      // Mid-medium range (0.55-0.62)
      scaledDifficulty = 0.55 + ((baseDifficulty - 0.54) / 0.02) * 0.07
    } else if (baseDifficulty <= 0.58) {
      // Upper-medium range (0.62-0.69)
      scaledDifficulty = 0.62 + ((baseDifficulty - 0.56) / 0.02) * 0.07
    } else {
      // Hard range - progressive scaling
      const range = baseDifficulty - 0.58
      scaledDifficulty = 0.7 + (1 - Math.exp(-range * 10)) * 0.2
    }

    // Controlled random variation
    const baseVariance = 0.05
    const varianceScale =
      1 - Math.pow(Math.abs(scaledDifficulty - 0.55) / 0.2, 2)
    const randomFactor =
      (Math.random() - 0.5) * baseVariance * Math.max(0, varianceScale)

    const finalDifficulty = Math.min(
      0.9,
      Math.max(0.35, scaledDifficulty + randomFactor),
    )

    return Number(finalDifficulty.toFixed(2))
  } catch (error) {
    console.error('Error calculating article difficulty:', error)
    return 0.45
  }
}

const calculateNumericScore = mainText => {
  const numericPattern =
    /\d+(\.\d+)?(\s*(billion|million|crore|lakh|thousand|USD|Rs|₹|percent|%))/gi
  const simpleNumericPattern = /\d+/g

  const contextualNumbers = (mainText.match(numericPattern) || []).length
  const simpleNumbers =
    (mainText.match(simpleNumericPattern) || []).length - contextualNumbers

  return Math.min(1, contextualNumbers * 0.1 + simpleNumbers * 0.04)
}

const calculateLengthScore = mainText => {
  const wordCount = mainText.split(/\s+/).length

  if (wordCount < 150) return 0.3
  if (wordCount < 200) return 0.3 + ((wordCount - 150) / 50) * 0.1
  if (wordCount < 300) return 0.4 + ((wordCount - 200) / 100) * 0.15
  return Math.min(1, 0.55 + ((wordCount - 300) / 200) * 0.15)
}

const calculateComplexityScore = mainText => {
  const words = mainText.split(/\s+/)
  const sentences = mainText.split(/[.!?]+/).filter(s => s.trim().length > 0)

  const complexWords = words.filter(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
    if (commonTerms.has(cleanWord)) return false
    return countSyllables(cleanWord) > 2
  })

  const complexityRatio = complexWords.length / words.length
  const avgSentenceLength = words.length / sentences.length
  const technicalTerms =
    mainText.match(/[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*(?=\\s|$)/g) || []

  return Math.min(
    1,
    complexityRatio * 2 +
      (avgSentenceLength / 20) * 0.2 +
      (technicalTerms.length / sentences.length) * 0.1,
  )
}

const countSyllables = word => {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const syllables = word.match(/[aeiouy]{1,2}/g)
  return syllables ? syllables.length : 1
}

module.exports = {
  hindiConverter,
  breakArticleIntoParagraphs,
  processNews,
  fetchNews,
  extractNewsFromLink,
  processExtractedNews,
  extractNewsUtilityFunc,
  getTopArticle,
  getSecondTopArticle,
  getTopThreeRecommendedArticles,
  processArticlesWithPrivileges,
  calculateArticleDifficulty,
}
