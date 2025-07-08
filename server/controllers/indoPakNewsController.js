// controllers/indoPakNewsController.js
const asyncHandler = require('express-async-handler')
const SpecialCategory = require('../model/specialCategorySchema')
const {
  runScraper,
  processScrapedArticles,
} = require('../utils/scraper.utils/indoPakNewsRunner')

/**
 * @desc    Fetch Indo-Pak news articles on demand
 * @route   POST /api/admin/special-categories/fetch-indo-pak
 * @access  Admin
 */
const fetchIndoPakNewsOnDemand = asyncHandler(async (req, res) => {
  const { categoryId } = req.body

  if (!categoryId) {
    res.status(400)
    throw new Error('Category ID is required')
  }

  const specialCategory = await SpecialCategory.findById(categoryId)
  if (!specialCategory) {
    res.status(404)
    throw new Error('Special category not found')
  }

  try {
    // Run the scraper
    const articles = await runScraper(specialCategory.key)

    if (!articles || articles.length === 0) {
      return res.status(200).json({
        message: 'No articles found',
        articles: [],
        results: {
          added: 0,
          duplicates: 0,
          errors: 0,
        },
      })
    }

    // Process and save articles
    const results = await processScrapedArticles(articles, specialCategory._id)

    // Update the lastFetched timestamp
    specialCategory.lastFetched = new Date()
    await specialCategory.save()

    return res.status(200).json({
      message: `Indo-Pak news fetch completed successfully`,
      totalFetched: articles.length,
      results,
    })
  } catch (error) {
    console.error('Error fetching Indo-Pak news:', error)
    res.status(500)
    throw new Error(`Failed to fetch Indo-Pak news: ${error.message}`)
  }
})

/**
 * @desc    Get Indo-Pak news scraper status
 * @route   GET /api/admin/special-categories/indo-pak-status
 * @access  Admin
 */
const getIndoPakScraperStatus = asyncHandler(async (req, res) => {
  try {
    const now = new Date()
    const specialCategory = await SpecialCategory.findOne({
      key: 'indo-pak',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })

    if (!specialCategory) {
      return res.status(200).json({
        status: 'inactive',
        message: 'No active Indo-Pak special category found',
        category: null,
      })
    }

    return res.status(200).json({
      status: 'active',
      message: 'Indo-Pak news scraper is active',
      category: {
        id: specialCategory._id,
        name: specialCategory.name,
        key: specialCategory.key,
        lastFetched: specialCategory.lastFetched,
        description: specialCategory.description,
      },
    })
  } catch (error) {
    console.error('Error getting Indo-Pak scraper status:', error)
    res.status(500)
    throw new Error(`Failed to get Indo-Pak scraper status: ${error.message}`)
  }
})

module.exports = {
  fetchIndoPakNewsOnDemand,
  getIndoPakScraperStatus,
}
