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
 */

import axios from 'axios'

const BASE_URL = '/api/quickClash'

/**
 * Forge Mode Service
 *
 * Architecture Note: This service uses async/await with try-catch at the calling component level
 * to allow for granular error handling and user feedback
 */
export const forgeService = {
  /**
   * Initialize Forge Mode and get the first question
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @returns {Promise<Object>} First section question data
   *
   * Usage Pattern:
   * - Call this immediately after detecting forgeArticle in challenge
   * - Response includes question WITHOUT correct answer (security)
   * - Store questionStartTime for timeSpent calculation
   */
  start: async sessionId => {
    const response = await axios.post(
      `${BASE_URL}/session/${sessionId}/forge/start`,
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
   * @returns {Promise<Object>} Answer validation result and reading content if correct
   *
   * Security Note: Server validates the answer and only returns content if correct
   * This prevents client-side manipulation
   */
  submitAnswer: async (sessionId, { sectionNumber, answerIndex, timeSpent, powerups }) => {
    const response = await axios.post(
      `${BASE_URL}/session/${sessionId}/forge/answer`,
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
   * @returns {Promise<Object>} Powerup effect
   */
  usePowerup: async (sessionId, powerupId) => {
    const response = await axios.post(
      `${BASE_URL}/session/${sessionId}/powerup/use`,
      { powerupId }
    )
    return response.data
  },

  /**
   * Move to next section after reading current content
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @returns {Promise<Object>} Next section question or completion status
   *
   * Flow Decision: Returns different data based on completion:
   * - If more sections: Returns next question
   * - If complete: Returns completion stats and nextPhase: 'quiz'
   */
  moveNext: async sessionId => {
    const response = await axios.post(
      `${BASE_URL}/session/${sessionId}/forge/next`,
    )
    return response.data
  },

  /**
   * Get complete session summary
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @returns {Promise<Object>} Complete progress and unlocked sections
   *
   * Use Cases:
   * - Resume interrupted sessions
   * - Display recap/review screen
   * - Show complete article after forge completion
   */
  getSummary: async sessionId => {
    const response = await axios.get(
      `${BASE_URL}/session/${sessionId}/forge/summary`,
    )
    return response.data
  },

  /**
   * Get forge review - Full article after completion
   *
   * @param {string} sessionId - The Quick Clash session ID
   * @returns {Promise<Object>} Full article with all sections and stats
   *
   * Use Cases:
   * - Post-completion article review
   * - Show all sections (locked + unlocked)
   * - Display final score breakdown
   */
  getReview: async sessionId => {
    const response = await axios.get(
      `${BASE_URL}/session/${sessionId}/forge/review`,
    )
    return response.data
  },
}

export default forgeService
