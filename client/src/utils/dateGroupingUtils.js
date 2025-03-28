// utils/dateGroupingUtils.js
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'

/**
 * Groups challenges by date, creating human-readable date headers
 * @param {Array} challenges - Array of challenge objects with createdAt property
 * @param {Function} t - Translation function
 * @returns {Object} Object with date strings as keys and arrays of challenges as values
 */
export const groupChallengesByDate = (challenges, t) => {
  if (!challenges || !challenges.length) return {}

  return challenges.reduce((groups, challenge) => {
    const date = new Date(challenge.createdAt)
    const dateKey = formatDateForGrouping(date, t)

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }

    groups[dateKey].push(challenge)
    return groups
  }, {})
}

/**
 * Formats a date into a human-readable string for grouping
 * @param {Date} date - Date to format
 * @param {Function} t - Translation function
 * @returns {String} Formatted date string
 */
export const formatDateForGrouping = (date, t) => {
  if (isToday(date)) {
    return t('Today')
  } else if (isYesterday(date)) {
    return t('Yesterday')
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE') // Day name
  } else if (isThisMonth(date)) {
    return format(date, 'MMMM d') // Month and day
  } else {
    return format(date, 'MMMM d, yyyy') // Full date
  }
}

/**
 * Sorts date keys in chronological order (most recent first)
 * @param {Array} dateKeys - Array of date strings
 * @param {Function} t - Translation function
 * @returns {Array} Sorted date keys
 */
export const sortDateKeys = (dateKeys, t) => {
  const priorityMap = {
    [t('Today')]: 1,
    [t('Yesterday')]: 2,
  }

  return dateKeys.sort((a, b) => {
    // Special handling for "Today" and "Yesterday"
    const aPriority = priorityMap[a] || 99
    const bPriority = priorityMap[b] || 99

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // For other dates, we need to parse and compare them
    // First try to parse as "Month day, year"
    try {
      const aDate = new Date(a)
      const bDate = new Date(b)

      if (!isNaN(aDate) && !isNaN(bDate)) {
        return bDate - aDate // Most recent first
      }
    } catch (e) {
      // If date parsing fails, fall back to alphabetical
      return a.localeCompare(b)
    }

    return 0
  })
}
