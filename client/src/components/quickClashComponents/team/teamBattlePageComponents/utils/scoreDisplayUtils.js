// utils/scoreDisplayUtils.js
import { Minus, HelpCircle } from 'lucide-react'

/**
 * Utility functions for handling score display in team battles
 */

/**
 * Get display information for a score based on completion status
 * @param {Object} params - Parameters
 * @param {number} params.score - The actual score value
 * @param {boolean} params.isCompleted - Whether the player completed the challenge
 * @param {string} params.displayType - Type of display ('text' | 'icon' | 'both')
 * @returns {Object} Display information
 */
export const getScoreDisplay = ({
  score,
  isCompleted,
  displayType = 'text',
  isOpponent = false,
}) => {
  if (!isCompleted) {
    return {
      displayValue: displayType === 'icon' ? null : 'NA',
      showIcon: displayType !== 'text',
      icon: Minus,
      color: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.1)',
      tooltip: 'Challenge not attempted',
      isNotAttempted: true,
    }
  }

  return {
    displayValue: score,
    showIcon: false,
    icon: null,
    color: score > 0 ? (isOpponent ? 'red.500' : '#10B981') : '#F59E0B',
    bgColor:
      score > 0
        ? isOpponent
          ? 'rgba(185, 36, 16, 0.1)'
          : 'rgba(16, 185, 24, 0.1)'
        : 'rgba(245, 158, 11, 0.1)',
    tooltip: `RQM Score: ${score}`,
    isNotAttempted: false,
  }
}

/**
 * Get user and opponent score display information for a challenge
 * @param {Object} params - Parameters
 * @param {Object} params.challenge - Challenge object
 * @param {string} params.userTeam - User's team ('teamA' | 'teamB')
 * @param {string} params.displayType - Type of display ('text' | 'icon' | 'both')
 * @returns {Object} User and opponent display information
 */
export const getChallengeScoresDisplay = ({
  challenge,
  userTeam,
  displayType = 'text',
}) => {
  const isUserTeamA = userTeam === 'teamA'

  const userScore = isUserTeamA ? challenge.teamAScore : challenge.teamBScore
  const opponentScore = isUserTeamA
    ? challenge.teamBScore
    : challenge.teamAScore

  const userCompleted = isUserTeamA
    ? challenge.teamACompleted
    : challenge.teamBCompleted
  const opponentCompleted = isUserTeamA
    ? challenge.teamBCompleted
    : challenge.teamACompleted

  return {
    user: getScoreDisplay({
      score: userScore,
      isCompleted: userCompleted,
      displayType,
      isOpponent: false,
    }),
    opponent: getScoreDisplay({
      score: opponentScore,
      isCompleted: opponentCompleted,
      displayType,
      isOpponent: true,
    }),
  }
}
