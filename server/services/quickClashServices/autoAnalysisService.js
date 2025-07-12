// services/quickClashServices/autoAnalysisService.js
const {
  generateChallengeAnalysisWithTranslation,
} = require('./quickClashAnalysisService')
const QuickClashAnalysis = require('../../model/quickClashSchemas/quickClashAnalysisSchema')

// In-memory tracker to prevent duplicate analysis generation
// This could be replaced with a Redis-based solution for multiple server instances
const analysisInProgress = new Map()

/**
 * Checks if analysis exists or is in progress
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - ID of the challenge
 * @returns {Promise<boolean>} - True if analysis exists or is in progress
 */
const isAnalysisExistingOrInProgress = async ({ challengeId }) => {
  // First check our in-memory tracker
  if (analysisInProgress.has(challengeId)) {
    return true
  }

  // Then check database
  try {
    const existingAnalysis = await QuickClashAnalysis.findOne({
      challenge: challengeId,
    })
    return !!existingAnalysis
  } catch (error) {
    console.error(
      `Error checking for existing analysis for challenge ${challengeId}:`,
      error,
    )
    return false
  }
}

/**
 * Starts analysis generation in the background when a challenge is completed
 * This function doesn't wait for the analysis to complete and doesn't throw errors
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - ID of the completed challenge
 * @param {boolean} [params.force=false] - Force analysis generation even if it exists
 * @returns {Promise<{started: boolean, reason: string}>} Status object
 */
const initiateBackgroundAnalysis = async ({
  challengeId,
  force = false,
  userId,
}) => {
  try {
    console.log(
      `Checking if analysis should be started for challenge ${challengeId}`,
    )

    // Skip if analysis is already in progress or exists (unless forced)
    if (!force && (await isAnalysisExistingOrInProgress({ challengeId }))) {
      return {
        started: false,
        reason: 'Analysis already exists or is in progress',
      }
    }

    // Mark as in progress
    analysisInProgress.set(challengeId, Date.now())
    console.log(`Initiating background analysis for challenge ${challengeId}`)

    // Start the analysis generation process without awaiting its completion
    generateChallengeAnalysisWithTranslation({
      challengeId,
      userId,
    })
      .then(async analysis => {
        console.log(
          `Background analysis completed for challenge ${challengeId}`,
        )

        // Remove from tracker
        analysisInProgress.delete(challengeId)
      })
      .catch(error => {
        console.error(
          `Error in background analysis for challenge ${challengeId}:`,
          error,
        )
        // Remove from tracker on error too
        analysisInProgress.delete(challengeId)
      })

    // Return immediately - the analysis will continue in the background
    return {
      started: true,
      reason: 'Analysis generation started',
    }
  } catch (error) {
    // Log error but don't throw - this is a background process
    console.error(
      `Error initiating background analysis for challenge ${challengeId}:`,
      error,
    )
    // Clean up tracker on error
    analysisInProgress.delete(challengeId)
    return {
      started: false,
      reason: `Error: ${error.message}`,
    }
  }
}

/**
 * Check if analysis is in progress for a challenge
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - ID of the challenge
 * @returns {boolean} True if analysis is in progress
 */
const isAnalysisInProgress = ({ challengeId }) => {
  return analysisInProgress.has(challengeId)
}

module.exports = {
  initiateBackgroundAnalysis,
  isAnalysisInProgress,
  isAnalysisExistingOrInProgress,
}
