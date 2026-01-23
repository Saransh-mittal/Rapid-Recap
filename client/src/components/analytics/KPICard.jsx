// client/src/components/analytics/KPICard.jsx
// KPI Card component for analytics dashboard
// Built with Tailwind CSS only

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * KPI Card Component
 * Displays a single key performance indicator with value, trend, and status
 */
const KPICard = ({
  title,
  value,
  unit = '',
  trend = 0,
  target = null,
  status = null, // 'pass' | 'conditional' | 'fail'
  icon: Icon = null,
  description = '',
  loading = false,
}) => {
  // Determine trend direction
  const trendValue = parseFloat(trend)
  const isPositive = trendValue > 0
  const isNegative = trendValue < 0
  const isNeutral = trendValue === 0

  // Status colors
  const statusColors = {
    pass: 'border-emerald-500/50 bg-emerald-500/10',
    conditional: 'border-yellow-500/50 bg-yellow-500/10',
    fail: 'border-red-500/50 bg-red-500/10',
  }

  const statusTextColors = {
    pass: 'text-emerald-400',
    conditional: 'text-yellow-400',
    fail: 'text-red-400',
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-20 mb-3" />
        <div className="h-8 bg-gray-700 rounded w-16 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-12" />
      </div>
    )
  }

  return (
    <div
      className={`
        bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border transition-all duration-300
        hover:bg-gray-800/70 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10
        ${status ? statusColors[status] : 'border-purple-500/30'}
      `}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        {Icon && (
          <Icon className="w-4 h-4 text-purple-400" />
        )}
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-2xl font-bold ${status ? statusTextColors[status] : 'text-white'}`}>
          {value}
        </span>
        {unit && (
          <span className="text-gray-400 text-sm">{unit}</span>
        )}
      </div>

      {/* Trend indicator */}
      <div className="flex items-center gap-2">
        {isPositive && (
          <div className="flex items-center text-emerald-400 text-sm">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+{Math.abs(trendValue).toFixed(1)}%</span>
          </div>
        )}
        {isNegative && (
          <div className="flex items-center text-red-400 text-sm">
            <TrendingDown className="w-3 h-3 mr-1" />
            <span>-{Math.abs(trendValue).toFixed(1)}%</span>
          </div>
        )}
        {isNeutral && (
          <div className="flex items-center text-gray-500 text-sm">
            <Minus className="w-3 h-3 mr-1" />
            <span>0%</span>
          </div>
        )}

        {/* Target indicator */}
        {target !== null && (
          <span className="text-gray-500 text-xs">
            Target: {target}{unit}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-500 text-xs mt-2">{description}</p>
      )}
    </div>
  )
}

export default KPICard
