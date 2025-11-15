// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/categoryUtils.js
import {
  Globe,
  Landmark,
  Briefcase,
  Cpu,
  Trophy,
  Heart,
  Beaker,
  Leaf,
  Scale,
  BookOpen,
  Film,
  UtensilsCrossed,
  Smile,
  Plane,
} from 'lucide-react'

/**
 * Get category styling and icon information
 * @param {string} category - The category name
 * @returns {Object} Category styling object with icon, colors
 */
export const getCategoryInfo = category => {
  const categoryLower = category.toLowerCase()

  const categoryStyles = {
    world: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      iconComponent: Globe,
    },
    politics: {
      primaryColor: '#EF4444',
      secondaryColor: '#B91C1C',
      iconComponent: Landmark,
    },
    business: {
      primaryColor: '#10B981',
      secondaryColor: '#047857',
      iconComponent: Briefcase,
    },
    technology: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#5B21B6',
      iconComponent: Cpu,
    },
    sports: {
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      iconComponent: Trophy,
    },
    health: {
      primaryColor: '#EC4899',
      secondaryColor: '#BE185D',
      iconComponent: Heart,
    },
    science: {
      primaryColor: '#06B6D4',
      secondaryColor: '#0891B2',
      iconComponent: Beaker,
    },
    environment: {
      primaryColor: '#84CC16',
      secondaryColor: '#65A30D',
      iconComponent: Leaf,
    },
    crime: {
      primaryColor: '#6B7280',
      secondaryColor: '#374151',
      iconComponent: Scale,
    },
    education: {
      primaryColor: '#F97316',
      secondaryColor: '#C2410C',
      iconComponent: BookOpen,
    },
    entertainment: {
      primaryColor: '#E11D48',
      secondaryColor: '#BE185D',
      iconComponent: Film,
    },
    food: {
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      iconComponent: UtensilsCrossed,
    },
    lifestyle: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#5B21B6',
      iconComponent: Smile,
    },
    tourism: {
      primaryColor: '#0EA5E9',
      secondaryColor: '#0284C7',
      iconComponent: Plane,
    },
  }

  return categoryStyles[categoryLower] || categoryStyles.world
}
