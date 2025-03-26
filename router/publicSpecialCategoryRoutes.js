// router/publicSpecialCategoryRoutes.js
const express = require('express')
const router = express.Router()
const {
  getAllSpecialCategories,
  getSpecialCategoryByKey,
  getSpecialCategoryArticles,
} = require('../controllers/specialCategoryController')

// Public routes
router.get('/', getAllSpecialCategories)
router.get('/:key', getSpecialCategoryByKey)
router.get('/:key/articles', getSpecialCategoryArticles)

module.exports = router
