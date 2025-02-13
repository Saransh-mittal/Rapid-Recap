// src/components/shareAchievements/hooks/useAchievementStats.js

import { useMemo } from 'react'
import { SHARE_CONFIG } from '../constants/shareConfig'

export const useAchievementStats = ({
  level,
  experience,
  solvedQuizzes,
  ranking,
  society,
  IQScore,
  averageRQM,
}) => {
  const stats = useMemo(
    () => [
      {
        label: 'Level',
        value: level,
        color: SHARE_CONFIG.STATS_COLORS.LEVEL,
      },
      {
        label: 'Total XP',
        value: experience,
        color: SHARE_CONFIG.STATS_COLORS.XP,
      },
      {
        label: 'Quizzes Solved',
        value: solvedQuizzes,
        color: SHARE_CONFIG.STATS_COLORS.QUIZZES,
      },
      {
        label: 'Global Rank',
        value: `#${ranking}`,
        color: SHARE_CONFIG.STATS_COLORS.RANK,
      },
      {
        label: 'Society',
        value: society,
        color: SHARE_CONFIG.STATS_COLORS.SOCIETY,
      },
      {
        label: 'IQ Score',
        value: IQScore,
        color: SHARE_CONFIG.STATS_COLORS.IQ,
      },
      {
        label: 'Average RQM',
        value: averageRQM,
        color: SHARE_CONFIG.STATS_COLORS.RQM,
      },
    ],
    [level, experience, solvedQuizzes, ranking, society, IQScore, averageRQM],
  )

  return stats
}
