// client/src/components/analytics/StreakDistribution.jsx
// Streak Distribution visualization component

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

/**
 * Streak Distribution Component
 * Displays streak tier distribution as a donut chart
 */
const StreakDistribution = ({ data = {}, day2StreakRate = {}, loading = false }) => {
  const TIER_CONFIG = {
    'Day 1': { color: '#6B7280', emoji: '✨' },
    'Started (2-3)': { color: '#A855F7', emoji: '🔥' },
    'Rising (4-6)': { color: '#F59E0B', emoji: '💪' },
    'Expert (7-13)': { color: '#06B6D4', emoji: '🏆' },
    'Champion (14+)': { color: '#10B981', emoji: '👑' },
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
        <div className="h-4 bg-gray-700 rounded w-40 mb-4" />
        <div className="h-48 bg-gray-700/50 rounded animate-pulse" />
      </div>
    )
  }

  // Prepare data for pie chart
  const chartData = Object.entries(data.distribution || {}).map(([tier, counts]) => ({
    name: tier,
    value: counts.total || 0,
    ...TIER_CONFIG[tier],
  })).filter(item => item.value > 0)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{item.emoji} {item.name}</p>
          <p className="text-purple-400">{item.value} players</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🔥</span> Streak Distribution
        </h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          {chartData.length > 0 ? (
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-40 h-40 flex items-center justify-center text-gray-500 text-sm">
              No streak data
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {Object.entries(TIER_CONFIG).map(([tier, config]) => {
            const tierData = data.distribution?.[tier] || { total: 0 }
            return (
              <div key={tier} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-gray-400 text-sm">
                    {config.emoji} {tier}
                  </span>
                </div>
                <span className="text-white font-semibold text-sm">
                  {tierData.total}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day-2 Streak Rate */}
      {day2StreakRate && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Day-2 Streak Rate</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${
                day2StreakRate.status === 'pass' ? 'text-emerald-400' :
                day2StreakRate.status === 'conditional' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {day2StreakRate.rate}%
              </span>
              <span className="text-gray-500 text-xs">Target: {day2StreakRate.target}%</span>
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                day2StreakRate.status === 'pass' ? 'bg-emerald-500' :
                day2StreakRate.status === 'conditional' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(parseFloat(day2StreakRate.rate), 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StreakDistribution
