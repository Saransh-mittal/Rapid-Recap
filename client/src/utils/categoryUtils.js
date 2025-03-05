// utils/categoryUtils.js
import { Target, Shield, Award, Swords, CheckCircle } from 'lucide-react'

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

    return {
      ...cat,
      color,
      icon,
    }
  })
}
