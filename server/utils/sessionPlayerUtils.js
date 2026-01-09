// utils/sessionPlayerUtils.js
// Shared utilities for handling both authenticated users and session players

/**
 * Get member ID from either user or sessionPlayer field
 * @param {Object} member - Team member object
 * @returns {string|null} The member's player ID as string
 */
const getMemberPlayerId = (member) => {
  if (!member) return null
  if (member.user) return member.user._id?.toString() || member.user.toString()
  if (member.sessionPlayer) return member.sessionPlayer._id?.toString() || member.sessionPlayer.toString()
  return null
}

/**
 * Check if a member matches a given userId (handles both users and session players)
 * @param {Object} member - Team member object
 * @param {string|ObjectId} userId - User ID to match
 * @returns {boolean} Whether the member matches the userId
 */
const memberMatchesUserId = (member, userId) => {
  if (!member || !userId) return false
  const memberId = getMemberPlayerId(member)
  return memberId === userId.toString()
}

/**
 * Find a member by userId in a team members array
 * @param {Array} members - Array of team members
 * @param {string|ObjectId} userId - User ID to find
 * @returns {Object|undefined} The matching member or undefined
 */
const findMemberByUserId = (members, userId) => {
  if (!members || !userId) return undefined
  return members.find(m => memberMatchesUserId(m, userId))
}

/**
 * Find index of a member by userId in a team members array
 * @param {Array} members - Array of team members
 * @param {string|ObjectId} userId - User ID to find
 * @returns {number} The index of the matching member or -1
 */
const findMemberIndexByUserId = (members, userId) => {
  if (!members || !userId) return -1
  return members.findIndex(m => memberMatchesUserId(m, userId))
}

/**
 * Check if a user is a member of a team
 * @param {Array} members - Array of team members
 * @param {string|ObjectId} userId - User ID to check
 * @returns {boolean} Whether the user is a member
 */
const isMemberOfTeam = (members, userId) => {
  if (!members || !userId) return false
  return members.some(m => memberMatchesUserId(m, userId))
}

/**
 * Check if a team member is a session player (not an authenticated user)
 * @param {Object} member - Team member object
 * @returns {boolean} True if the member is a session player
 */
const isMemberSessionPlayer = (member) => {
  if (!member) return false
  return !!member.sessionPlayer && !member.user
}

module.exports = {
  getMemberPlayerId,
  memberMatchesUserId,
  findMemberByUserId,
  findMemberIndexByUserId,
  isMemberOfTeam,
  isMemberSessionPlayer,
}

