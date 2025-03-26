// router/adminSpecialCategoryRoutes.js
const express = require('express')
const router = express.Router()
const { Authenticate, adminMiddleware } = require('../middleware/authenticate')
const {
  createSpecialCategory,
  updateSpecialCategory,
  deleteSpecialCategory,
  addArticleToSpecialCategory,
  removeArticleFromSpecialCategory,
  fetchArticlesForSpecialCategory,
  getAllSpecialCategoriesAdmin,
  getSpecialCategoryArticlesAdmin,
  addArticleToSpecialCategoryBatch,
} = require('../controllers/specialCategoryController')

// All routes here are already protected by adminMiddleware in the parent router

// Admin routes
router.get('/all', getAllSpecialCategoriesAdmin)
router.post('/', createSpecialCategory)
router.put('/:id', updateSpecialCategory)
router.delete('/:id', deleteSpecialCategory)
router.post('/:id/articles', addArticleToSpecialCategory)
router.delete('/:id/articles/:articleId', removeArticleFromSpecialCategory)
router.post('/:id/fetch', fetchArticlesForSpecialCategory)
router.get('/:id/articles', getSpecialCategoryArticlesAdmin)
router.post('/articles/batch', addArticleToSpecialCategoryBatch)

module.exports = router
