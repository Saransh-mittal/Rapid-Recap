import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import useSoloDrill from '../../../customHooks/useSoloDrill'
import { getCategoryInfo } from '../team/teamBattlePageComponents/categoriesSection/categoryUtils'

const SoloDrillCategoryCard = ({ category, disabled }) => {
  const { setSelectedCategory, stats } = useSoloDrill()

  const categoryInfo = getCategoryInfo(category)
  const IconComponent = categoryInfo.iconComponent

  // Real stats from backend — stats.byCategory[category] = { count, bestScore }
  const categoryStats = useMemo(() => {
    if (!stats?.byCategory?.[category]) return null
    return stats.byCategory[category]
  }, [stats, category])

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={() => !disabled && setSelectedCategory(category)}
      className={`
        relative overflow-hidden p-4 sm:p-5 rounded-2xl text-left min-h-[140px] group
        transition-all duration-300
        ${disabled
          ? 'cursor-not-allowed opacity-35'
          : 'cursor-pointer'}
      `}
      style={{
        backgroundColor: disabled
          ? 'rgba(30, 41, 59, 0.3)'
          : 'rgba(30, 41, 59, 0.45)',
        boxShadow: disabled
          ? 'none'
          : `0 2px 16px rgba(0,0,0,0.2)`,
      }}
      aria-label={`Select ${category} category`}
    >
      {/* Hover glow — category-colored, replaces any border */}
      {!disabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${categoryInfo.primaryColor}18, transparent 70%)`,
            boxShadow: `inset 0 1px 0 ${categoryInfo.primaryColor}35`,
          }}
        />
      )}

      <div className="relative z-10 flex h-full flex-col justify-between gap-3">
        {/* Icon */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${categoryInfo.primaryColor}15`,
            color: categoryInfo.primaryColor,
          }}
        >
          <IconComponent size={22} strokeWidth={2} />
        </div>

        {/* Text content */}
        <div className="flex-1 flex flex-col justify-end">
          <p className="font-bold text-[15px] sm:text-base capitalize text-white leading-snug">
            {category}
          </p>

          {categoryStats ? (
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {categoryStats.count} drill{categoryStats.count !== 1 ? 's' : ''}
              <span className="mx-1 text-slate-600">·</span>
              Best: <span style={{ color: categoryInfo.primaryColor }}>{categoryStats.bestScore}</span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              No drills yet
            </p>
          )}
        </div>
      </div>
    </motion.button>
  )
}

SoloDrillCategoryCard.propTypes = {
  category: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
}

export default SoloDrillCategoryCard
