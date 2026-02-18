// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/categoryUtils.js
import {
  Globe2,
  Landmark,
  Briefcase,
  Cpu,
  Trophy,
  HeartPulse,
  FlaskConical,
  Leaf,
  Gavel,
  BookOpenText,
  Film,
  UtensilsCrossed,
  SmilePlus,
  PlaneTakeoff,
  Target,
  Crown,
  Sword,
  Shield,
  Flame,
  Star,
  Zap,
  Sparkles,
} from 'lucide-react'

/**
 * Get category styling and icon information
 * @param {string} category - The category name
 * @returns {Object} Category styling object
 */
export const getCategoryInfo = category => {
  const categoryLower = category.toLowerCase()

  const categoryStyles = {
    // ── New Forge Categories (used in 4v4 battles & solo drills) ──
    'india & world': {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      iconComponent: Globe2,
      battleIcon: Target,
    },
    'science & technology': {
      primaryColor: '#06B6D4',
      secondaryColor: '#0891B2',
      iconComponent: FlaskConical,
      battleIcon: Star,
    },
    'tech innovations': {
      primaryColor: '#8B5CF6',
      secondaryColor: '#5B21B6',
      iconComponent: Cpu,
      battleIcon: Zap,
    },
    'geography & environment': {
      primaryColor: '#84CC16',
      secondaryColor: '#65A30D',
      iconComponent: Leaf,
      battleIcon: Shield,
    },
    custom: {
      primaryColor: '#14B8A6',
      secondaryColor: '#0891B2',
      iconComponent: Sparkles,
      battleIcon: Zap,
    },
    // ── Legacy news categories (kept for backward compatibility) ──
    world: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      iconComponent: Globe2,
      battleIcon: Target,
    },
    politics: {
      primaryColor: '#EF4444',
      secondaryColor: '#B91C1C',
      iconComponent: Landmark,
      battleIcon: Crown,
    },
    business: {
      primaryColor: '#10B981',
      secondaryColor: '#047857',
      iconComponent: Briefcase,
      battleIcon: Sword,
    },
    technology: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#5B21B6',
      iconComponent: Cpu,
      battleIcon: Zap,
    },
    sports: {
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      iconComponent: Trophy,
      battleIcon: Flame,
    },
    health: {
      primaryColor: '#EC4899',
      secondaryColor: '#BE185D',
      iconComponent: HeartPulse,
      battleIcon: Shield,
    },
    science: {
      primaryColor: '#06B6D4',
      secondaryColor: '#0891B2',
      iconComponent: FlaskConical,
      battleIcon: Star,
    },
    environment: {
      primaryColor: '#84CC16',
      secondaryColor: '#65A30D',
      iconComponent: Leaf,
      battleIcon: Target,
    },
    crime: {
      primaryColor: '#6B7280',
      secondaryColor: '#374151',
      iconComponent: Gavel,
      battleIcon: Sword,
    },
    education: {
      primaryColor: '#F97316',
      secondaryColor: '#C2410C',
      iconComponent: BookOpenText,
      battleIcon: Crown,
    },
    entertainment: {
      primaryColor: '#E11D48',
      secondaryColor: '#BE185D',
      iconComponent: Film,
      battleIcon: Star,
    },
    food: {
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      iconComponent: UtensilsCrossed,
      battleIcon: Flame,
    },
    lifestyle: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#5B21B6',
      iconComponent: SmilePlus,
      battleIcon: Shield,
    },
    tourism: {
      primaryColor: '#0EA5E9',
      secondaryColor: '#0284C7',
      iconComponent: PlaneTakeoff,
      battleIcon: Target,
    },
  }

  return categoryStyles[categoryLower] || categoryStyles.world
}
