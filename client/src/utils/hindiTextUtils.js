// client/src/utils/hindiTextUtils.js
// PRODUCTION-OPTIMIZED VERSION: Enhanced Hindi text processing utilities

// Cache for language detection to improve performance
const languageDetectionCache = new Map()
const CACHE_SIZE_LIMIT = 200

/**
 * Detects if text contains Hindi (Devanagari) characters with caching
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text contains Hindi characters
 */
export const isHindiText = text => {
  if (!text || typeof text !== 'string') return false

  // Check cache first for performance
  if (languageDetectionCache.has(text)) {
    return languageDetectionCache.get(text)
  }

  try {
    // Devanagari script Unicode range: U+0900–U+097F
    const hindiRegex = /[\u0900-\u097F]/
    const result = hindiRegex.test(text)

    // Cache result (with size limit)
    if (languageDetectionCache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = languageDetectionCache.keys().next().value
      languageDetectionCache.delete(firstKey)
    }
    languageDetectionCache.set(text, result)

    return result
  } catch {
    return false
  }
}

/**
 * Detects the predominant language in text with performance optimization
 * @param {string} text - Text to analyze
 * @returns {string} - 'hindi', 'english', or 'mixed'
 */
export const detectTextLanguage = text => {
  if (!text || typeof text !== 'string') return 'english'

  // Use a sample for large texts to improve performance
  const sampleText = text.length > 1000 ? text.substring(0, 1000) : text

  // Check cache first
  const cacheKey = `lang_${sampleText}`
  if (languageDetectionCache.has(cacheKey)) {
    return languageDetectionCache.get(cacheKey)
  }

  try {
    const hindiChars = (sampleText.match(/[\u0900-\u097F]/g) || []).length
    const englishChars = (sampleText.match(/[a-zA-Z]/g) || []).length
    const totalChars = hindiChars + englishChars

    let result = 'english'
    if (totalChars > 0) {
      const hindiRatio = hindiChars / totalChars
      if (hindiRatio > 0.7) result = 'hindi'
      else if (hindiRatio >= 0.3) result = 'mixed'
    }

    // Cache result
    if (languageDetectionCache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = languageDetectionCache.keys().next().value
      languageDetectionCache.delete(firstKey)
    }
    languageDetectionCache.set(cacheKey, result)

    return result
  } catch {
    return 'english'
  }
}

/**
 * Splits Hindi text into sentences using appropriate punctuation
 * @param {string} text - Hindi text to split
 * @returns {string[]} - Array of sentences
 */
export const splitHindiSentences = text => {
  if (!text || typeof text !== 'string') return []

  try {
    // Hindi punctuation: दंड (।), दुहरा दंड (॥), question mark (?), exclamation (!)
    return text
      .split(/(?<=[।।॥\.\!\?])\s+/)
      .filter(s => s.trim().length > 10) // Minimum length for meaningful Hindi sentences
      .map(s => s.trim())
  } catch {
    return [text]
  }
}

/**
 * Splits English text into sentences
 * @param {string} text - English text to split
 * @returns {string[]} - Array of sentences
 */
export const splitEnglishSentences = text => {
  if (!text || typeof text !== 'string') return []

  try {
    return text
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 5)
      .map(s => s.trim())
  } catch {
    return [text]
  }
}

/**
 * Smart sentence splitting that detects language and uses appropriate method
 * @param {string} text - Text to split
 * @returns {string[]} - Array of sentences
 */
export const splitSentencesSmart = text => {
  if (!text || typeof text !== 'string') return []

  try {
    const language = detectTextLanguage(text)

    switch (language) {
      case 'hindi':
        return splitHindiSentences(text)
      case 'english':
        return splitEnglishSentences(text)
      case 'mixed':
        // For mixed language, try both methods and use the one with more sentences
        const hindiSentences = splitHindiSentences(text)
        const englishSentences = splitEnglishSentences(text)
        return hindiSentences.length > englishSentences.length
          ? hindiSentences
          : englishSentences
      default:
        return splitEnglishSentences(text)
    }
  } catch {
    return [text]
  }
}

/**
 * Splits Hindi text into words respecting Devanagari script boundaries
 * @param {string} text - Hindi text to split
 * @returns {string[]} - Array of words
 */
export const splitHindiWords = text => {
  if (!text || typeof text !== 'string') return []

  try {
    // Split on various Unicode whitespace characters
    return text
      .split(/[\s\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]+/)
      .filter(word => word.trim().length > 0)
  } catch {
    return []
  }
}

/**
 * Gets appropriate font family for text based on language with caching
 * @param {string} text - Text to analyze
 * @returns {string} - CSS font-family string
 */
export const getAppropriateFont = text => {
  const language = detectTextLanguage(text)

  if (language === 'hindi' || language === 'mixed') {
    return "'Noto Sans Devanagari', 'Mangal', 'Kiran', 'Segoe UI', sans-serif"
  }

  return "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
}

/**
 * Gets appropriate line height for text based on language
 * @param {string} text - Text to analyze
 * @param {string} baseLineHeight - Base line height for English text
 * @returns {string} - Appropriate line height
 */
export const getAppropriateLineHeight = (text, baseLineHeight = '1.8') => {
  const language = detectTextLanguage(text)

  if (language === 'hindi' || language === 'mixed') {
    return '2.0' // Hindi needs more line height for proper character rendering
  }

  return baseLineHeight
}

/**
 * Gets appropriate font size for text based on language
 * @param {string} text - Text to analyze
 * @param {string} baseFontSize - Base font size for English text
 * @returns {string} - Appropriate font size
 */
export const getAppropriateFontSize = (text, baseFontSize = '1.2rem') => {
  const language = detectTextLanguage(text)

  if (language === 'hindi' || language === 'mixed') {
    try {
      // Hindi often needs slightly larger font size for readability
      const baseValue = parseFloat(baseFontSize)
      const unit = baseFontSize.replace(/[\d.]/g, '')
      return `${(baseValue * 1.1).toFixed(1)}${unit}`
    } catch {
      return '1.3rem' // Safe fallback
    }
  }

  return baseFontSize
}

/**
 * Gets CSS properties optimized for text rendering based on language
 * @param {string} text - Text to analyze
 * @returns {object} - CSS properties object
 */
export const getTextRenderingCSS = text => {
  const language = detectTextLanguage(text)

  const baseCSS = {
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  }

  if (language === 'hindi' || language === 'mixed') {
    return {
      ...baseCSS,
      fontFeatureSettings: '"liga" 1, "kern" 1',
      wordBreak: 'break-word',
      hyphens: 'none',
      fontVariantLigatures: 'common-ligatures',
    }
  }

  return {
    ...baseCSS,
    wordBreak: 'normal',
    hyphens: 'auto',
  }
}

/**
 * Enhanced multi-language content processing with error handling
 * @param {any} content - Content object or string
 * @param {string} selectedLanguage - Selected language key
 * @returns {object} - { processedContent: string[], isHindi: boolean, language: string }
 */
export const processMultiLanguageContent = (content, selectedLanguage) => {
  if (!content) {
    return { processedContent: [], isHindi: false, language: 'english' }
  }

  try {
    let processedContent = []

    if (typeof content === 'string') {
      processedContent = [content]
    } else if (Array.isArray(content)) {
      processedContent = content
        .map(item => String(item))
        .filter(item => item.trim())
    } else if (typeof content === 'object') {
      // Handle object structure with fallback hierarchy
      const languageKeys = [selectedLanguage, 'english', 'hindi']
      let foundContent = null

      for (const langKey of languageKeys) {
        if (langKey && content[langKey]) {
          foundContent = content[langKey]
          break
        }
      }

      if (!foundContent) {
        // Fallback to any available content
        const keys = Object.keys(content)
        if (keys.length > 0) {
          foundContent = content[keys[0]]
        }
      }

      if (foundContent) {
        if (Array.isArray(foundContent)) {
          processedContent = foundContent
            .map(item => String(item))
            .filter(item => item.trim())
        } else {
          processedContent = [String(foundContent)]
        }
      }
    } else {
      processedContent = [String(content)]
    }

    const combinedText = processedContent.join(' ')
    const language = detectTextLanguage(combinedText)
    const isHindi = language === 'hindi' || language === 'mixed'

    return { processedContent, isHindi, language }
  } catch (error) {
    // Error fallback
    return {
      processedContent: [String(content)],
      isHindi: false,
      language: 'english',
    }
  }
}

/**
 * Clear language detection cache (useful for memory management)
 */
export const clearLanguageCache = () => {
  languageDetectionCache.clear()
}

/**
 * Get cache statistics for debugging
 * @returns {object} - Cache statistics
 */
export const getCacheStats = () => {
  return {
    size: languageDetectionCache.size,
    maxSize: CACHE_SIZE_LIMIT,
  }
}
