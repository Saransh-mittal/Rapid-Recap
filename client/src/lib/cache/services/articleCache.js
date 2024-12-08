// src/lib/cache/services/articleCache.js

import { CACHE_CONFIG } from '../config'
import { dbOperations } from '../drivers/indexedDB'

const { STORES, EXPIRY } = CACHE_CONFIG

const ONE_DAY = EXPIRY.ARTICLE || 24 * 60 * 60 * 1000 // 1 day in milliseconds

export const articleCacheService = {
  async getArticle(articleId) {
    try {
      const cachedData = await dbOperations.get(STORES.ARTICLE, articleId)

      if (!cachedData) return null

      // Check if cache has expired
      if (Date.now() - cachedData.timestamp > ONE_DAY) {
        await this.deleteArticle(articleId)
        return null
      }

      return cachedData.data
    } catch (error) {
      console.error('Error getting cached article:', error)
      return null
    }
  },

  async cacheArticle(articleId, articleData) {
    if (!articleId || !articleData) return false

    try {
      return await dbOperations.put(STORES.ARTICLE, {
        id: articleId,
        data: articleData,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Error caching article:', error)
      return false
    }
  },

  async deleteArticle(articleId) {
    try {
      await dbOperations.delete(STORES.ARTICLE, articleId)
      return true
    } catch (error) {
      console.error('Error deleting cached article:', error)
      return false
    }
  },

  // Helper to clean up expired articles
  async cleanExpiredArticles() {
    try {
      const articles = await dbOperations.getAllFromStore(STORES.ARTICLE)
      const now = Date.now()

      for (const article of articles) {
        if (now - article.timestamp > ONE_DAY) {
          await this.deleteArticle(article.id)
        }
      }
    } catch (error) {
      console.error('Error cleaning expired articles:', error)
    }
  },
}
