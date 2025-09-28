// src/utils/messageValidation.js - Complete validation utility with proper status handling

/**
 * Message validation configuration
 * These limits should match the backend MESSAGE_LIMITS
 */
export const MESSAGE_LIMITS = {
  MAX_WORDS: 200,
  MAX_CHARACTERS: 1000,
  WARNING_WORDS: 180,
  WARNING_CHARACTERS: 900,
  MIN_CHARACTERS: 1,
}

/**
 * Count words in a text string with better accuracy
 * @param {string} text - The text to count words in
 * @returns {number} - Number of words
 */
export const countWords = text => {
  if (!text || typeof text !== 'string') return 0

  // Remove extra whitespace and split on word boundaries
  // This handles multiple spaces, tabs, newlines more accurately
  const words = text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .split(' ')
    .filter(word => word.length > 0)

  return words.length
}

/**
 * Count characters in a text string (trimmed)
 * @param {string} text - The text to count characters in
 * @returns {number} - Number of characters
 */
export const countCharacters = text => {
  if (!text || typeof text !== 'string') return 0
  return text.trim().length
}

/**
 * Enhanced message validation with comprehensive checks
 * @param {string} content - The message content to validate
 * @returns {Object} - Detailed validation result object
 */
export const validateMessage = content => {
  // Handle null/undefined/non-string inputs
  if (content === null || content === undefined) {
    return {
      isValid: false,
      wordCount: 0,
      charCount: 0,
      isWordWarning: false,
      isCharWarning: false,
      errors: ['Message cannot be empty'],
      warnings: [],
      trimmed: '',
      isEmpty: true,
    }
  }

  if (typeof content !== 'string') {
    return {
      isValid: false,
      wordCount: 0,
      charCount: 0,
      isWordWarning: false,
      isCharWarning: false,
      errors: ['Invalid message format'],
      warnings: [],
      trimmed: '',
      isEmpty: true,
    }
  }

  const trimmed = content.trim()
  const wordCount = countWords(trimmed)
  const charCount = countCharacters(content)
  const isEmpty = trimmed.length === 0

  const errors = []
  const warnings = []

  // Check if empty
  if (isEmpty) {
    return {
      isValid: false,
      wordCount: 0,
      charCount: 0,
      isWordWarning: false,
      isCharWarning: false,
      errors: ['Message cannot be empty'],
      warnings: [],
      trimmed: '',
      isEmpty: true,
    }
  }

  // Check word limit (hard limit)
  if (wordCount > MESSAGE_LIMITS.MAX_WORDS) {
    const excess = wordCount - MESSAGE_LIMITS.MAX_WORDS
    errors.push(
      `Too many words: ${wordCount}/${MESSAGE_LIMITS.MAX_WORDS} (+${excess} over limit)`,
    )
  }

  // Check character limit (hard limit)
  if (charCount > MESSAGE_LIMITS.MAX_CHARACTERS) {
    const excess = charCount - MESSAGE_LIMITS.MAX_CHARACTERS
    errors.push(
      `Too many characters: ${charCount}/${MESSAGE_LIMITS.MAX_CHARACTERS} (+${excess} over limit)`,
    )
  }

  // Check warning thresholds
  if (
    wordCount >= MESSAGE_LIMITS.WARNING_WORDS &&
    wordCount <= MESSAGE_LIMITS.MAX_WORDS
  ) {
    const remaining = MESSAGE_LIMITS.MAX_WORDS - wordCount
    warnings.push(
      `Approaching word limit: ${remaining} word${
        remaining === 1 ? '' : 's'
      } remaining`,
    )
  }

  if (
    charCount >= MESSAGE_LIMITS.WARNING_CHARACTERS &&
    charCount <= MESSAGE_LIMITS.MAX_CHARACTERS
  ) {
    const remaining = MESSAGE_LIMITS.MAX_CHARACTERS - charCount
    warnings.push(
      `Approaching character limit: ${remaining} character${
        remaining === 1 ? '' : 's'
      } remaining`,
    )
  }

  // Additional validations
  const hasOnlyWhitespace = /^\s+$/.test(content)
  if (hasOnlyWhitespace) {
    errors.push('Message cannot contain only whitespace')
  }

  // Check for extremely long words (potential spam/nonsense)
  const words = trimmed.split(/\s+/)
  const maxWordLength = 50 // Reasonable maximum for any real word
  const longWords = words.filter(word => word.length > maxWordLength)
  if (longWords.length > 0) {
    warnings.push(
      `Contains unusually long word(s): ${longWords.slice(0, 2).join(', ')}${
        longWords.length > 2 ? '...' : ''
      }`,
    )
  }

  return {
    isValid: errors.length === 0,
    wordCount,
    charCount,
    isWordWarning: wordCount >= MESSAGE_LIMITS.WARNING_WORDS,
    isCharWarning: charCount >= MESSAGE_LIMITS.WARNING_CHARACTERS,
    errors,
    warnings,
    trimmed,
    isEmpty: false,
    hasLongWords: longWords.length > 0,
    longWords,
  }
}

/**
 * Smart truncate message to fit within limits
 * @param {string} content - The message content to truncate
 * @param {Object} options - Truncation options
 * @returns {string} - Truncated message
 */
export const truncateMessage = (content, options = {}) => {
  const {
    maxWords = MESSAGE_LIMITS.MAX_WORDS,
    maxChars = MESSAGE_LIMITS.MAX_CHARACTERS,
    preferWords = true,
    preserveSentences = true, // Try to preserve complete sentences
    addEllipsis = false,
  } = options

  if (!content || typeof content !== 'string') return ''

  let result = content.trim()

  if (preferWords) {
    // Word-based truncation first
    const words = result.split(/\s+/)
    if (words.length > maxWords) {
      let truncated = words.slice(0, maxWords).join(' ')

      // If preserveSentences is true, try to end at a sentence boundary
      if (preserveSentences && maxWords > 10) {
        const sentences = truncated.split(/[.!?]+/)
        if (sentences.length > 1) {
          // Remove the last incomplete sentence
          sentences.pop()
          const sentenceTruncated = sentences.join('.') + '.'
          if (sentenceTruncated.split(/\s+/).length >= maxWords * 0.7) {
            truncated = sentenceTruncated
          }
        }
      }

      result = truncated
    }

    // Then check character count
    if (result.length > maxChars) {
      result = result.substring(0, maxChars - (addEllipsis ? 3 : 0))

      // Try to end at a word boundary
      const lastSpace = result.lastIndexOf(' ')
      if (lastSpace > maxChars * 0.8) {
        result = result.substring(0, lastSpace)
      }
    }
  } else {
    // Character-based truncation first
    if (result.length > maxChars) {
      result = result.substring(0, maxChars - (addEllipsis ? 3 : 0))

      // Try to end at a word boundary
      const lastSpace = result.lastIndexOf(' ')
      if (lastSpace > maxChars * 0.8) {
        result = result.substring(0, lastSpace)
      }
    }

    // Then check word count
    const words = result.split(/\s+/)
    if (words.length > maxWords) {
      result = words.slice(0, maxWords).join(' ')
    }
  }

  // Add ellipsis if content was truncated
  if (addEllipsis && result.length < content.trim().length) {
    result += '...'
  }

  return result.trim()
}

/**
 * Enhanced format validation errors for display
 * @param {Array} errors - Array of error strings
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors, options = {}) => {
  const { maxErrors = 2, includeCount = true } = options

  if (!errors || errors.length === 0) return ''

  if (errors.length === 1) {
    return errors[0]
  }

  const displayErrors = errors.slice(0, maxErrors)
  const remainingCount = Math.max(0, errors.length - maxErrors)

  let result = displayErrors.join(', ')

  if (remainingCount > 0 && includeCount) {
    result += ` (+${remainingCount} more issue${remainingCount > 1 ? 's' : ''})`
  }

  return result
}

/**
 * Get validation status for UI styling with enhanced logic
 * @param {Object} validation - Validation result from validateMessage
 * @returns {string} - Status: 'valid', 'warning', 'error', 'empty'
 */
export const getValidationStatus = validation => {
  if (!validation) return 'valid'

  // If the message is empty, return 'empty' instead of 'error'
  // This prevents showing red borders for empty inputs
  if (
    validation.isEmpty ||
    (validation.errors.length > 0 &&
      validation.errors[0] === 'Message cannot be empty')
  ) {
    return 'empty'
  }

  if (!validation.isValid) return 'error'
  if (
    validation.isWordWarning ||
    validation.isCharWarning ||
    validation.hasLongWords
  ) {
    return 'warning'
  }

  return 'valid'
}

/**
 * Enhanced sanitize message content
 * Remove potentially harmful content while preserving user intent
 * @param {string} content - Raw message content
 * @returns {string} - Sanitized content
 */
export const sanitizeMessage = content => {
  if (!content || typeof content !== 'string') return ''

  return (
    content
      // Normalize whitespace but preserve intentional formatting
      .replace(/[ \t]+/g, ' ')
      // Limit consecutive line breaks to 3 (allows some formatting)
      .replace(/\n{4,}/g, '\n\n\n')
      // Remove NULL characters and other control characters (except newlines and tabs)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Remove potential script injections (basic protection)
      .replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        '[removed]',
      )
      // Remove other potentially harmful tags
      .replace(
        /<(?:iframe|object|embed|form|input|button)[^>]*>.*?<\/(?:iframe|object|embed|form|input|button)>/gi,
        '[removed]',
      )
      // Trim final result
      .trim()
  )
}

/**
 * Check if message would exceed limits if additional text is added
 * @param {string} currentContent - Current message content
 * @param {string} additionalText - Text being added
 * @param {Object} options - Validation options
 * @returns {Object} - Analysis of the potential addition
 */
export const analyzeTextAddition = (
  currentContent,
  additionalText,
  options = {},
) => {
  const { position = 'end' } = options

  let combinedContent
  if (position === 'end') {
    combinedContent = (currentContent || '') + (additionalText || '')
  } else if (position === 'start') {
    combinedContent = (additionalText || '') + (currentContent || '')
  } else if (typeof position === 'number') {
    // Insert at specific position
    const before = (currentContent || '').substring(0, position)
    const after = (currentContent || '').substring(position)
    combinedContent = before + (additionalText || '') + after
  } else {
    combinedContent = (currentContent || '') + (additionalText || '')
  }

  const validation = validateMessage(combinedContent)

  return {
    wouldExceed: !validation.isValid,
    newLength: validation.charCount,
    newWordCount: validation.wordCount,
    validation,
    suggestedTruncation: validation.isValid
      ? null
      : truncateMessage(combinedContent),
  }
}

/**
 * Get helpful user messages based on validation state
 * @param {Object} validation - Validation result
 * @returns {Object} - User-friendly messages and suggestions
 */
export const getValidationMessages = validation => {
  if (!validation) return { message: '', suggestions: [] }

  const status = getValidationStatus(validation)
  const suggestions = []

  switch (status) {
    case 'empty':
      return {
        message: 'Type a message to get started',
        suggestions: [],
        type: 'info',
      }

    case 'error':
      let message = 'Message is too long and cannot be sent'

      if (validation.wordCount > MESSAGE_LIMITS.MAX_WORDS) {
        suggestions.push('Remove some words to fit the limit')
        suggestions.push('Use shorter sentences')
      }

      if (validation.charCount > MESSAGE_LIMITS.MAX_CHARACTERS) {
        suggestions.push('Reduce message length')
        suggestions.push('Split into multiple messages')
      }

      return { message, suggestions, type: 'error' }

    case 'warning':
      let warningMsg = 'Approaching message limits'

      if (validation.hasLongWords) {
        suggestions.push('Check for typos in long words')
      }

      if (validation.isWordWarning) {
        suggestions.push(
          `${MESSAGE_LIMITS.MAX_WORDS - validation.wordCount} words remaining`,
        )
      }

      if (validation.isCharWarning) {
        suggestions.push(
          `${
            MESSAGE_LIMITS.MAX_CHARACTERS - validation.charCount
          } characters remaining`,
        )
      }

      return { message: warningMsg, suggestions, type: 'warning' }

    case 'valid':
    default:
      return {
        message: 'Message is ready to send',
        suggestions: [],
        type: 'success',
      }
  }
}

/**
 * Export all utilities as default object for easy importing
 */
export default {
  MESSAGE_LIMITS,
  countWords,
  countCharacters,
  validateMessage,
  truncateMessage,
  formatValidationErrors,
  getValidationStatus,
  sanitizeMessage,
  analyzeTextAddition,
  getValidationMessages,
}
