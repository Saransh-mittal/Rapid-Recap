// services/categoryCache.js
import { categories, findCategoryIndex } from '../assets/Categories'
import axios from 'axios'
import {
  getCategoryFromBoost,
  getCategoryFromRadar,
  isCategoryBoost,
  isCategoryPowerUp,
} from '../utils/helper.utils'

const createCategoryCache = () => {
  const cache = new Map()
  const accessOrder = []
  const maxSize = 100 // Increased to accommodate prefetched data
  const STALE_TIME = 5 * 60 * 1000 // 5 minutes
  const PREFETCH_DELAY = 1000 // 1 second delay before prefetching
  const PREFETCH_WINDOW = 2 // Number of categories to prefetch on each side

  const generateKey = (category, page) => `${category}-${page}`

  const updateAccessOrder = key => {
    const index = accessOrder.indexOf(key)
    if (index > -1) {
      accessOrder.splice(index, 1)
    }
    accessOrder.push(key)
  }

  const get = (category, page) => {
    const key = generateKey(category, page)
    const cached = cache.get(key)

    if (cached) {
      updateAccessOrder(key)
      return {
        data: Array.isArray(cached.data) ? cached.data : [],
        timestamp: cached.timestamp,
        category: cached.category,
        page: cached.page,
      }
    }
    return null
  }

  const set = (category, page, data) => {
    const key = generateKey(category, page)

    // Ensure data is an array before caching
    const dataToCache = Array.isArray(data) ? data : []

    while (cache.size >= maxSize) {
      const oldest = accessOrder[0]
      cache.delete(oldest)
      accessOrder.shift()
    }

    cache.set(key, {
      data: dataToCache,
      timestamp: Date.now(),
      category,
      page,
    })
    updateAccessOrder(key)
  }

  const getAdjacentCategories = currentCategory => {
    const currentIndex = findCategoryIndex(currentCategory)
    if (currentIndex === -1) return []

    const adjacentCategories = []

    // Get categories within the PREFETCH_WINDOW on both sides
    for (let i = 1; i <= PREFETCH_WINDOW; i++) {
      // Previous categories
      if (currentIndex - i >= 0) {
        adjacentCategories.push(categories[currentIndex - i].key)
      }
      // Next categories
      if (currentIndex + i < categories.length) {
        adjacentCategories.push(categories[currentIndex + i].key)
      }
    }

    return adjacentCategories
  }

  const prefetchCategory = async (
    category,
    page = 1,
    language,
    user,
    activeAbilities,
  ) => {
    if (!category || get(category, page)?.data) return // Don't prefetch if already cached

    try {
      const endpoint =
        category === 'all'
          ? `/api/recommendation?page=${page}&pageSize=18&lang=${language}`
          : `/api/articles?page=${page}&pageSize=18&category=${category}&lang=${language}`
      const headers =
        user?.categoryPrivileges?.[category] ||
        ((user?.categoryPrivileges ||
          (activeAbilities &&
            activeAbilities.length > 0 &&
            activeAbilities.some(
              ability =>
                isCategoryBoost(ability.name) ||
                isCategoryPowerUp(ability.name),
            ))) &&
          category === 'all') ||
        (activeAbilities &&
          activeAbilities.length > 0 &&
          activeAbilities.some(
            ability =>
              getCategoryFromBoost(ability.name).toLocaleLowerCase() ===
                category ||
              getCategoryFromRadar(ability.name).toLocaleLowerCase() ===
                category,
          ))
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {}
      const response = await axios.get(endpoint, { headers })
      const data = response.data

      if (Array.isArray(data)) {
        set(category, page, data)
      }
    } catch (error) {
      console.warn(`Prefetch failed for category: ${category}`, error)
    }
  }

  const prefetchAdjacentCategories = (currentCategory, language, user) => {
    if (!currentCategory) return

    // Delay prefetching to prioritize main content
    setTimeout(() => {
      const adjacentCategories = getAdjacentCategories(currentCategory)

      // Use Promise.all with a delay between each category to avoid overwhelming the server
      adjacentCategories.forEach((category, index) => {
        setTimeout(() => {
          prefetchCategory(category, 1, language, user)
        }, index * 500) // 500ms delay between each category
      })
    }, PREFETCH_DELAY)
  }

  const invalidate = category => {
    for (const [key, value] of cache.entries()) {
      if (value.category === category) {
        cache.delete(key)
        const index = accessOrder.indexOf(key)
        if (index > -1) {
          accessOrder.splice(index, 1)
        }
      }
    }
  }

  const invalidateAll = () => {
    cache.clear()
    accessOrder.length = 0
  }

  const isStale = (category, page) => {
    const data = get(category, page)
    if (!data) return true
    return Date.now() - data.timestamp > STALE_TIME
  }

  return {
    get,
    set,
    invalidate,
    invalidateAll,
    isStale,
    prefetchAdjacentCategories,
    prefetchCategory,
  }
}

export const categoryCache = createCategoryCache()
