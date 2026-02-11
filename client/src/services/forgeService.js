// src/services/forgeService.js
/**
 * Forge Mode API Service
 *
 * Handles all API communications for the interactive Forge Mode reading experience.
 * This service provides a clean interface for:
 * - Starting forge sessions
 * - Submitting answers with validation
 * - Progressing through sections
 * - Fetching session summaries
 *
 * Session Player Support:
 * - Pass isSessionPlayer: true to use /api/play/* endpoints
 * - Default uses /api/quickClash/* for authenticated users
 */

import axios from 'axios'

const BASE_URL_QUICK_CLASH = '/api/quickClash'
const BASE_URL_PLAY = '/api/play'

const BASE_URL_SOLO_DRILL = '/api/solo-drill'

// Helper to get the correct base URL
const getBaseUrl = (isSessionPlayer = false, isSoloDrill = false) => {
  if (isSoloDrill) return BASE_URL_SOLO_DRILL
  return isSessionPlayer ? BASE_URL_PLAY : BASE_URL_QUICK_CLASH
}

/**
 * Forge Mode Service
 *
 * Architecture Note: This service uses async/await with try-catch at the calling component level
 * to allow for granular error handling and user feedback
 *
 * Session Player Support: All methods now accept an options object with isSessionPlayer flag
 */
export const forgeService = {
  /**
   * Initialize Forge Mode and get the first question
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @param {Object} options - Optional parameters
   * @param {boolean} options.isSoloDrill - Use solo drill endpoints
   * @returns {Promise<Object>} First section question data
   */
  start: async (sessionId, { isSessionPlayer = false, isSoloDrill = false } = {}) => {
    const baseUrl = getBaseUrl(isSessionPlayer, isSoloDrill)
    const response = await axios.post(
      `${baseUrl}/session/${sessionId}/forge/start`,
    )
    return response.data
  },

  /**
   * Submit user's answer for current section
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @param {object} answerData - Object containing section details
   * @param {number} answerData.sectionNumber - Current section index (0-4)
   * @param {number} answerData.answerIndex - Selected option index (0-3)
   * @param {number} answerData.timeSpent - Milliseconds spent on question
   * @param {boolean} answerData.isSessionPlayer - Use session player endpoints
   * @param {boolean} answerData.isSoloDrill - Use solo drill endpoints
   * @returns {Promise<Object>} Answer validation result and reading content if correct
   */
  submitAnswer: async (sessionId, { sectionNumber, answerIndex, timeSpent, powerups, isSessionPlayer = false, isSoloDrill = false }) => {
    const baseUrl = getBaseUrl(isSessionPlayer, isSoloDrill)
    const response = await axios.post(
      `${baseUrl}/session/${sessionId}/forge/answer`,
      {
        sectionNumber,
        userAnswer: answerIndex, // Backend expects 'userAnswer' not 'answerIndex'
        timeSpent,
        powerups,
      },
    )
    return response.data
  },

  /**
   * Use a powerup in Forge Mode
   * @param {string} sessionId
   * @param {string} powerupId
   * @param {Object} options - Optional parameters
   * @param {boolean} options.isSessionPlayer - Use session player endpoints
   * @param {boolean} options.isSoloDrill - Use solo drill endpoints
   * @returns {Promise<Object>} Powerup effect
   */
  usePowerup: async (sessionId, powerupId, { isSessionPlayer = false, isSoloDrill = false } = {}) => {
    const baseUrl = getBaseUrl(isSessionPlayer, isSoloDrill)
    const response = await axios.post(
      `${baseUrl}/session/${sessionId}/powerup/use`,
      { powerupId }
    )
    return response.data
  },

  /**
   * Move to next section after reading current content
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @param {Object} options - Optional parameters
   * @param {boolean} options.isSessionPlayer - Use session player endpoints
   * @param {boolean} options.isSoloDrill - Use solo drill endpoints
   * @returns {Promise<Object>} Next section question or completion status
   */
  moveNext: async (sessionId, { isSessionPlayer = false, isSoloDrill = false } = {}) => {
    const baseUrl = getBaseUrl(isSessionPlayer, isSoloDrill)
    const response = await axios.post(
      `${baseUrl}/session/${sessionId}/forge/next`,
    )
    return response.data
  },

  /**
   * Get complete session summary
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @param {Object} options - Optional parameters
   * @param {boolean} options.isSessionPlayer - Use session player endpoints
   * @param {boolean} options.isSoloDrill - Use solo drill endpoints
   * @returns {Promise<Object>} Complete progress and unlocked sections
   */
  getSummary: async (sessionId, { isSessionPlayer = false, isSoloDrill = false } = {}) => {
    const baseUrl = getBaseUrl(isSessionPlayer, isSoloDrill)
    const response = await axios.get(
      `${baseUrl}/session/${sessionId}/forge/summary`,
    )
    return response.data
  },

  /**
   * Get forge review - Full article after completion
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @param {Object} options - Optional parameters
   * @param {boolean} options.isSessionPlayer - Use session player endpoints
   * @param {boolean} options.isSoloDrill - Use solo drill endpoints
   * @returns {Promise<Object>} Full article with all sections and stats
   */
  getReview: async (sessionId, { isSessionPlayer = false, isSoloDrill = false } = {}) => {
    const baseUrl = getBaseUrl(isSessionPlayer, isSoloDrill)
    const response = await axios.get(
      `${baseUrl}/session/${sessionId}/forge/review`,
    )
    return response.data
  },
}

export default forgeService
