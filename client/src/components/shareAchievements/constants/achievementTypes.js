// src/components/shareAchievements/constants/achievementTypes.js

import {
  Trophy,
  Crown,
  Target,
  Brain,
  Award,
  Star,
  Zap,
  Medal,
} from 'lucide-react'

export const ACHIEVEMENT_TYPES = {
  PROGRESS_STATS: {
    id: 'progress',
    title: 'Progress Journey',
    icon: Brain,
    description: 'Share your learning progress stats',
  },
  TOURNAMENT_MASTERY: {
    id: 'tournament',
    title: 'Tournament Mastery',
    icon: Trophy,
    description: 'Share your tournament achievements',
  },
  STREAK_WARRIOR: {
    id: 'streak',
    title: 'Streak Warrior',
    icon: Zap,
    description: 'Share your consistency achievements',
  },
  CATEGORY_EXPERTISE: {
    id: 'expertise',
    title: 'Category Expertise',
    icon: Star,
    description: 'Share your category-wise performance',
  },
}

export const BADGE_TIERS = {
  ACE: { name: 'ACE', icon: Crown, color: '#FFD700' },
  PRO: { name: 'PRO', icon: Medal, color: '#C0C0C0' },
  CHAMP: { name: 'CHAMP', icon: Trophy, color: '#CD7F32' },
}
