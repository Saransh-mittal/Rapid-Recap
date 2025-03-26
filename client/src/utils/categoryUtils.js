// utils/categoryUtils.js
import {
  Target,
  Shield,
  Award,
  Swords,
  CheckCircle,
  Flame,
  Star,
  Zap,
  Trophy,
} from 'lucide-react'

/**
 * Process categories to add color and icon information
 * @param {Array} categories - Raw categories from the Categories module
 * @returns {Array} - Enhanced categories with color and icon information
 */
export const processCategories = categories => {
  // Filter out 'all', 'top', and 'general' categories
  const filteredCategories = categories.filter(
    cat => !['all', 'top', 'general'].includes(cat.key),
  )

  // Add color and icon based on category key
  return filteredCategories.map(cat => {
    let color = 'purple'
    let icon = Target

    // Check if this is a special category
    if (cat.isSpecial && cat.specialDetails) {
      // Use the badge color from special details if available
      // Convert "purple.500" format to just "purple"
      color = cat.specialDetails.badgeColor?.split('.')[0] || 'purple'
      // Use an appropriate icon based on the emoji or default to Star
      // We can't directly convert emoji to Lucide icons, so we'll use a mapping approach
      if (cat.specialDetails.icon) {
        // Simple emoji-to-icon mapping
        switch (cat.specialDetails.icon) {
          case '🔥':
            icon = Flame
            break
          case '⭐':
          case '★':
            icon = Star
            break
          case '⚡':
            icon = Zap
            break
          case '🏆':
            icon = Trophy
            break
          default:
            icon = Star // Default icon for special categories
        }
      } else {
        icon = Star // Default icon for special categories without an icon
      }
    } else {
      // Regular category mapping
      switch (cat.key) {
        case 'world':
          color = 'blue'
          break
        case 'politics':
          color = 'red'
          icon = Shield
          break
        case 'business':
          color = 'green'
          icon = Award
          break
        case 'technology':
          color = 'cyan'
          break
        case 'sports':
          color = 'orange'
          icon = Swords
          break
        case 'health':
          color = 'teal'
          icon = CheckCircle
          break
        case 'science':
          color = 'purple'
          break
        case 'environment':
          color = 'green'
          break
        case 'crime':
          color = 'red'
          break
        case 'education':
          color = 'blue'
          break
        case 'entertainment':
          color = 'pink'
          break
        case 'food':
          color = 'orange'
          break
        case 'lifestyle':
          color = 'teal'
          break
        case 'tourism':
          color = 'green'
          break
        default:
          color = 'purple'
      }
    }

    return {
      ...cat,
      color,
      icon,
    }
  })
}
