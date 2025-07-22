// utils/languageDetection.utils.js - Language detection and validation utilities

const User = require('../model/userSchema')

/**
 * Get user's preferred language from database
 * @param {string} userId - User ID
 * @param {object} session - MongoDB session (optional)
 * @returns {Promise<string>} - User's language preference ('en' or 'hi')
 */
const getUserLanguage = async (userId, session = null) => {
  try {
    const query = User.findById(userId).select('userLanguage')
    const user = session ? await query.session(session) : await query

    const userLanguage = user?.userLanguage || 'en'

    // Validate language
    if (!['en', 'hi'].includes(userLanguage)) {
      console.warn(
        `Invalid user language detected: ${userLanguage}, defaulting to 'en'`,
      )
      return 'en'
    }

    return userLanguage
  } catch (error) {
    console.error('Error getting user language:', error)
    return 'en' // Default to English on error
  }
}

/**
 * Validate if language is supported
 * @param {string} language - Language code to validate
 * @returns {boolean} - True if language is supported
 */
const isLanguageSupported = language => {
  return ['en', 'hi'].includes(language)
}

/**
 * Get language display name
 * @param {string} language - Language code
 * @returns {string} - Display name of the language
 */
const getLanguageDisplayName = language => {
  const languageNames = {
    en: 'English',
    hi: 'Hindi (हिंदी)',
  }
  return languageNames[language] || 'Unknown'
}

/**
 * Validate article content availability for language
 * @param {object} article - Article document
 * @param {string} language - Language code
 * @returns {boolean} - True if content is available for the language
 */
const validateArticleContentForLanguage = (article, language) => {
  if (!article) return false

  if (language === 'en') {
    return !!(article.title && article.author && article.mainText)
  } else if (language === 'hi') {
    return !!(
      article.hindiTitle &&
      article.hindiAuthor &&
      article.hindiMainText
    )
  }

  return false
}

/**
 * Get article content based on language
 * @param {object} article - Article document
 * @param {string} language - Language code
 * @returns {object} - Article content for the specified language
 */
const getArticleContentForLanguage = (article, language) => {
  if (!article) return null

  if (language === 'en') {
    return {
      title: article.title,
      author: article.author,
      mainText: article.mainText,
      language: 'en',
    }
  } else if (language === 'hi') {
    return {
      title: article.hindiTitle,
      author: article.hindiAuthor,
      mainText: article.hindiMainText,
      language: 'hi',
    }
  }

  return null
}

/**
 * Language detection middleware for Express routes
 * Adds user's language preference to req.userLanguage
 */
const languageDetectionMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      const userLanguage = await getUserLanguage(req.user._id)
      req.userLanguage = userLanguage
    } else {
      req.userLanguage = 'en' // Default for non-authenticated requests
    }
    next()
  } catch (error) {
    console.error('Language detection middleware error:', error)
    req.userLanguage = 'en' // Default on error
    next()
  }
}

/**
 * Get error messages in user's language
 * @param {string} errorKey - Error message key
 * @param {string} language - User's language
 * @returns {string} - Localized error message
 */
const getLocalizedErrorMessage = (errorKey, language = 'en') => {
  const errorMessages = {
    en: {
      article_not_found: 'Article not found',
      content_not_available: 'Content is not available in English',
      game_data_not_found: 'Game data not found',
      session_not_found: 'Game session not found',
      session_already_completed: 'Game session already completed',
      invalid_game_type: 'Invalid game type',
      language_not_supported: 'Language not supported',
    },
    hi: {
      article_not_found: 'लेख नहीं मिला',
      content_not_available: 'सामग्री हिंदी में उपलब्ध नहीं है',
      game_data_not_found: 'गेम डेटा नहीं मिला',
      session_not_found: 'गेम सेशन नहीं मिला',
      session_already_completed: 'गेम सेशन पहले से पूरा हो गया है',
      invalid_game_type: 'अवैध गेम प्रकार',
      language_not_supported: 'भाषा समर्थित नहीं है',
    },
  }

  return (
    errorMessages[language]?.[errorKey] ||
    errorMessages['en'][errorKey] ||
    'Unknown error'
  )
}

module.exports = {
  getUserLanguage,
  isLanguageSupported,
  getLanguageDisplayName,
  validateArticleContentForLanguage,
  getArticleContentForLanguage,
  languageDetectionMiddleware,
  getLocalizedErrorMessage,
}
