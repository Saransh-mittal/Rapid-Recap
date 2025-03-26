// controllers/specialCategoryController.js
const asyncHandler = require('express-async-handler')
const SpecialCategory = require('../model/specialCategorySchema')
const Article = require('../model/articleSchema')
const axios = require('axios')
const { processArticle } = require('../services/articleProcessor')
const {
  generateHighlightForArticle,
} = require('../utils/article.highlight.utils')
const { averageReadTime } = require('../utils/miscellaneous.utils')
const { findDuplicateArticles } = require('../services/duplicateCheckService')
const {
  calculateArticleDifficulty,
  hindiConverter,
} = require('../utils/article.utils')

// @desc    Get all special categories
// @route   GET /api/special-categories
// @access  Public
const getAllSpecialCategories = asyncHandler(async (req, res) => {
  // Get only active categories that are within their date range
  const now = new Date()

  const categories = await SpecialCategory.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ displayOrder: -1 })

  res.json(categories)
})

// @desc    Get special category by key
// @route   GET /api/special-categories/:key
// @access  Public
const getSpecialCategoryByKey = asyncHandler(async (req, res) => {
  const { key } = req.params

  const category = await SpecialCategory.findOne({ key })

  if (!category) {
    res.status(404)
    throw new Error('Special category not found')
  }

  res.json(category)
})

// @desc    Get articles for a special category
// @route   GET /api/special-categories/:key/articles
// @access  Public
const getSpecialCategoryArticles = asyncHandler(async (req, res) => {
  const { key } = req.params
  const { page = 1, pageSize = 18, lang = 'en' } = req.query
  const category = await SpecialCategory.findOne({ key })

  if (!category) {
    res.status(404)
    throw new Error('Special category not found')
  }

  const articles = await Article.find({ specialCategory: category._id })
    .sort({ dateTime: -1 })
    .skip((page - 1) * pageSize)
    .limit(Number(pageSize))

  if (!articles || articles.length === 0) {
    return res.json([])
  }

  res.json(articles)
})

// @desc    Create a special category
// @route   POST /api/admin/special-categories
// @access  Admin
const createSpecialCategory = asyncHandler(async (req, res) => {
  const {
    name,
    key,
    description,
    icon,
    startDate,
    endDate,
    apiEndpoint,
    apiConfig,
    fetchSchedule,
    badgeColor,
    displayOrder,
  } = req.body

  // Validate required fields
  if (!name || !key || !description || !startDate || !endDate) {
    res.status(400)
    throw new Error('Please provide all required fields')
  }

  // Check if category with this key already exists
  const existingCategory = await SpecialCategory.findOne({ key })
  if (existingCategory) {
    res.status(400)
    throw new Error('A category with this key already exists')
  }

  // Create new category
  const specialCategory = new SpecialCategory({
    name,
    key,
    description,
    icon: icon || '🔥',
    startDate,
    endDate,
    apiEndpoint,
    apiConfig,
    fetchSchedule,
    badgeColor: badgeColor || 'purple.500',
    displayOrder: displayOrder || 0,
  })

  await specialCategory.save()

  res.status(201).json({
    message: 'Special category created successfully',
    category: specialCategory,
  })
})

// @desc    Update a special category
// @route   PUT /api/admin/special-categories/:id
// @access  Admin
const updateSpecialCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const {
    name,
    key,
    description,
    icon,
    startDate,
    endDate,
    isActive,
    apiEndpoint,
    apiConfig,
    fetchSchedule,
    badgeColor,
    displayOrder,
  } = req.body

  const specialCategory = await SpecialCategory.findById(id)

  if (!specialCategory) {
    res.status(404)
    throw new Error('Special category not found')
  }

  // Update fields if provided
  if (name) specialCategory.name = name
  if (key) {
    // Check if another category with this key exists
    const existingCategory = await SpecialCategory.findOne({
      key,
      _id: { $ne: id },
    })
    if (existingCategory) {
      res.status(400)
      throw new Error('Another category with this key already exists')
    }
    specialCategory.key = key
  }
  if (description) specialCategory.description = description
  if (icon) specialCategory.icon = icon
  if (startDate) specialCategory.startDate = startDate
  if (endDate) specialCategory.endDate = endDate
  if (isActive !== undefined) specialCategory.isActive = isActive
  if (apiEndpoint !== undefined) specialCategory.apiEndpoint = apiEndpoint
  if (apiConfig) specialCategory.apiConfig = apiConfig
  if (fetchSchedule !== undefined) specialCategory.fetchSchedule = fetchSchedule
  if (badgeColor) specialCategory.badgeColor = badgeColor
  if (displayOrder !== undefined) specialCategory.displayOrder = displayOrder

  await specialCategory.save()

  res.json({
    message: 'Special category updated successfully',
    category: specialCategory,
  })
})

// @desc    Delete a special category
// @route   DELETE /api/admin/special-categories/:id
// @access  Admin
const deleteSpecialCategory = asyncHandler(async (req, res) => {
  const { id } = req.params

  const specialCategory = await SpecialCategory.findById(id)

  if (!specialCategory) {
    res.status(404)
    throw new Error('Special category not found')
  }

  // Find articles associated with this category
  const articlesCount = await Article.countDocuments({ specialCategory: id })

  if (articlesCount > 0) {
    // Remove category reference from articles instead of deleting them
    await Article.updateMany(
      { specialCategory: id },
      { $set: { specialCategory: null, specialCategoryAdded: null } },
    )
  }

  await specialCategory.deleteOne()

  res.json({
    message: 'Special category deleted successfully',
    articlesUpdated: articlesCount,
  })
})

// @desc    Add an article to a special category
// @route   POST /api/admin/special-categories/:id/articles
// @access  Admin
const addArticleToSpecialCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { articleId } = req.body

  const specialCategory = await SpecialCategory.findById(id)
  if (!specialCategory) {
    res.status(404)
    throw new Error('Special category not found')
  }

  const article = await Article.findById(articleId)
  if (!article) {
    res.status(404)
    throw new Error('Article not found')
  }

  // Add article to special category
  article.specialCategory = specialCategory._id
  article.specialCategoryAdded = new Date()
  await article.save()

  res.json({
    message: 'Article added to special category successfully',
    article,
  })
})

// @desc    Remove an article from a special category
// @route   DELETE /api/admin/special-categories/:id/articles/:articleId
// @access  Admin
const removeArticleFromSpecialCategory = asyncHandler(async (req, res) => {
  const { id, articleId } = req.params

  const specialCategory = await SpecialCategory.findById(id)
  if (!specialCategory) {
    res.status(404)
    throw new Error('Special category not found')
  }

  const article = await Article.findById(articleId)
  if (!article) {
    res.status(404)
    throw new Error('Article not found')
  }

  // Remove article from special category
  article.specialCategory = null
  article.specialCategoryAdded = null
  await article.save()

  res.json({
    message: 'Article removed from special category successfully',
    article,
  })
})

// @desc    Fetch articles for a special category from API
// @route   POST /api/admin/special-categories/:id/fetch
// @access  Admin
const fetchArticlesForSpecialCategory = asyncHandler(async (req, res) => {
  const { id } = req.params

  const specialCategory = await SpecialCategory.findById(id)
  if (!specialCategory) {
    res.status(404)
    throw new Error('Special category not found')
  }

  if (!specialCategory.apiEndpoint) {
    res.status(400)
    throw new Error(
      'This special category does not have an API endpoint configured',
    )
  }

  try {
    // Configure request based on apiConfig
    const requestConfig = {
      headers: specialCategory.apiConfig?.headers || {},
    }

    if (specialCategory.apiConfig?.apiKey) {
      requestConfig.headers['x-api-key'] = specialCategory.apiConfig.apiKey
    }

    // Add query parameters if configured
    let endpoint = specialCategory.apiEndpoint
    if (specialCategory.apiConfig?.queryParams) {
      const queryParams = new URLSearchParams(
        specialCategory.apiConfig.queryParams,
      ).toString()
      endpoint = `${endpoint}?${queryParams}`
    }

    // Fetch articles
    const response = await axios.get(endpoint, requestConfig)
    const articles =
      response.data?.articles || response.data?.news || response.data

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      res.status(400)
      throw new Error('No articles fetched from API endpoint')
    }

    // Process articles
    const processedArticles = []
    const errors = []

    for (const articleData of articles) {
      try {
        // Process article with existing utilities
        const processedArticle = await processArticle({
          ...articleData,
          category: specialCategory.key,
        })

        // Check for duplicates
        const { isDuplicate, contentVector } = await findDuplicateArticles({
          title: processedArticle.title,
          mainText: processedArticle.mainText,
          keywords: processedArticle.keywords || [],
        })

        if (isDuplicate) {
          continue
        }

        // Add additional fields
        const avgReadTime = averageReadTime(processedArticle.mainText)

        // Create and save article
        const newArticle = new Article({
          ...processedArticle,
          contentVector,
          vectorized: true,
          avgReadTime,
          specialCategory: specialCategory._id,
          specialCategoryAdded: new Date(),
          category: specialCategory.key,
        })

        await newArticle.save()

        // Generate highlights asynchronously
        Promise.all([
          generateHighlightForArticle({
            articleId: newArticle._id,
            lang: 'en',
          }),
          generateHighlightForArticle({
            articleId: newArticle._id,
            lang: 'hi',
          }),
        ]).catch(error => {
          console.error(
            `Error generating highlights for "${newArticle.title}":`,
            error,
          )
        })

        processedArticles.push(newArticle)
      } catch (error) {
        errors.push({
          article: articleData.title || 'Unknown article',
          error: error.message,
        })
      }
    }

    // Update lastFetched timestamp
    specialCategory.lastFetched = new Date()
    await specialCategory.save()

    res.json({
      message: 'Articles fetched and processed successfully',
      articlesAdded: processedArticles.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error fetching special category articles:', error)
    res.status(500)
    throw new Error(`Failed to fetch articles: ${error.message}`)
  }
})

// @desc    Get all special categories (admin)
// @route   GET /api/admin/special-categories
// @access  Admin
const getAllSpecialCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await SpecialCategory.find().sort({
    displayOrder: -1,
    startDate: -1,
  })
  res.json(categories)
})

// @desc    Get articles for a special category (admin)
// @route   GET /api/admin/special-categories/:id/articles
// @access  Admin
const getSpecialCategoryArticlesAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { page = 1, limit = 20 } = req.query

  const specialCategory = await SpecialCategory.findById(id)
  if (!specialCategory) {
    res.status(404)
    throw new Error('Special category not found')
  }

  const articles = await Article.find({ specialCategory: id })
    .sort({ dateTime: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))

  const totalArticles = await Article.countDocuments({ specialCategory: id })

  res.json({
    articles,
    totalArticles,
    totalPages: Math.ceil(totalArticles / limit),
    currentPage: page,
  })
})

// @desc    Add multiple articles to a special category
// @route   POST /api/special-categories/articles/batch
// @access  Authenticated
const addArticleToSpecialCategoryBatch = asyncHandler(async (req, res) => {
  const { categoryId, articles } = req.body

  if (!categoryId || !articles || !Array.isArray(articles)) {
    res.status(400)
    throw new Error(
      'Invalid request data. categoryId and articles array are required',
    )
  }

  const specialCategory = await SpecialCategory.findById(categoryId)
  if (!specialCategory) {
    res.status(404)
    throw new Error('Special category not found')
  }

  // Process articles
  const processedArticles = []
  let failedArticles = 0

  for (const articleData of articles) {
    try {
      if (!articleData.title || !articleData.mainText) {
        failedArticles++
        continue
      }

      // Calculate article difficulty
      const articleDifficulty = calculateArticleDifficulty({
        mainText: articleData.mainText,
      })

      // Create a new article with the special category reference
      const newArticle = new Article({
        ...articleData,
        specialCategory: specialCategory._id,
        specialCategoryAdded: new Date(),
        category: specialCategory.key,
        // Ensure imgURL is an array
        imgURL: Array.isArray(articleData.imgURL)
          ? articleData.imgURL
          : [articleData.imgURL],
        articleDifficulty: articleDifficulty,
        hindiMainText: [], // Initialize empty array for Hindi content
      })

      await newArticle.save()

      // Start Hindi translation in background
      translateArticleToHindi(newArticle._id).catch(error => {
        console.error(
          `Error translating article "${newArticle.title}" to Hindi:`,
          error,
        )
      })

      // Generate English highlights immediately
      generateHighlightForArticle({
        articleId: newArticle._id,
        lang: 'en',
      }).catch(error => {
        console.error(
          `Error generating English highlights for "${newArticle.title}":`,
          error,
        )
      })

      // Hindi highlights will be generated after translation is complete
      // This happens inside the translateArticleToHindi function

      processedArticles.push(newArticle)
    } catch (error) {
      failedArticles++
      console.error('Error processing article:', error)
    }
  }

  res.status(201).json({
    message: 'Articles added to special category',
    articlesAdded: processedArticles.length,
    failedArticles,
    note: 'Hindi translation and highlights are being generated in the background',
  })
})

// Helper function to handle Hindi translation and highlight generation
const translateArticleToHindi = async articleId => {
  try {
    // First, translate the article to Hindi
    const translatedArticle = await hindiConverter(articleId)

    if (translatedArticle) {
      // After successful translation, generate Hindi highlights
      await generateHighlightForArticle({
        articleId,
        lang: 'hi',
      })
    }

    return translatedArticle
  } catch (error) {
    console.error(
      `Error in Hindi translation pipeline for article ${articleId}:`,
      error,
    )
    throw error
  }
}

module.exports = {
  getAllSpecialCategories,
  getSpecialCategoryByKey,
  getSpecialCategoryArticles,
  createSpecialCategory,
  updateSpecialCategory,
  deleteSpecialCategory,
  addArticleToSpecialCategory,
  removeArticleFromSpecialCategory,
  fetchArticlesForSpecialCategory,
  getAllSpecialCategoriesAdmin,
  getSpecialCategoryArticlesAdmin,
  addArticleToSpecialCategoryBatch,
}
