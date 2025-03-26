import axios from 'axios'
import {
  setSpecialCategories,
  getSpecialCategories,
} from '../assets/Categories'

/**
 * Fetches all active special categories from the API
 * @returns {Promise<Array>} Array of special categories
 */
export const fetchSpecialCategories = async (i18nInstance = null) => {
  try {
    // Use the public endpoint
    const response = await axios.get('/api/special-categories')
    // Store special categories in memory
    setSpecialCategories(response.data)

    // Update i18n translations if i18n is provided
    if (i18nInstance) {
      updateSpecialCategoryTranslations(i18nInstance, response.data)
    }

    return response.data
  } catch (error) {
    console.error('Error fetching special categories:', error)
    return []
  }
}

/**
 * Updates the i18n translations with special category keys
 * @param {object} i18n - The i18n instance
 * @param {Array} categories - Array of special categories
 */
export const updateSpecialCategoryTranslations = (i18n, categories) => {
  if (!i18n || !categories || !Array.isArray(categories)) {
    return
  }

  // Update translations for each language
  const languages = ['en', 'hi']

  languages.forEach(lang => {
    try {
      const currentResources = i18n.getResourceBundle(lang, 'categories') || {}
      const updatedCategories = { ...(currentResources.categories || {}) }

      // Add special category keys
      categories.forEach(category => {
        if (!updatedCategories[category.key]) {
          // Use name as default for both languages
          updatedCategories[category.key] = category.name
        }
      })

      // Update resources
      i18n.addResourceBundle(
        lang,
        'categories',
        { categories: updatedCategories },
        true,
        true,
      )
    } catch (error) {
      console.error(`Error updating translations for language ${lang}:`, error)
    }
  })
}

export default {
  fetchSpecialCategories,
  updateSpecialCategoryTranslations,
  getSpecialCategories,
}
