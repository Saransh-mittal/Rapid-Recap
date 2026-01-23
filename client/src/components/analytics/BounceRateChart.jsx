// client/src/components/analytics/BounceRateChart.jsx
// Bounce Rate visualization component

import React from 'react'

/**
 * Bounce Rate Chart Component
 * Displays all bounce rate types as horizontal bars
 */
const BounceRateChart = ({ data = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
        <div className="h-4 bg-gray-700 rounded w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-700/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const bounceTypes = [
    {
      key: 'signupBounce',
      label: 'Signup Bounce',
      description: 'Created account but never played',
      color: 'bg-red-500',
      bgColor: 'bg-red-500/20',
    },
    {
      key: 'singleBattleBounce',
      label: 'Single Battle Bounce',
      description: 'Played 1 battle, never returned',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-500/20',
    },
    {
      key: 'sessionAbandon',
      label: 'Session Abandon',
      description: 'Left without converting',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-500/20',
    },
    {
      key: 'resultCheckBounce',
      label: 'Result Check Bounce',
      description: 'Didn\'t return to view results',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-500/20',
    },
  ]

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🚪</span> Bounce Rates
        </h3>
        {data.overall && (
          <span className="text-gray-400 text-sm">
            Overall: <span className="text-white font-semibold">{data.overall.rate}%</span>
          </span>
        )}
      </div>

      <div className="space-y-4">
        {bounceTypes.map(type => {
          const typeData = data[type.key] || { rate: 0, count: 0, total: 0 }
          const rate = parseFloat(typeData.rate) || 0

          return (
            <div key={type.key}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-white text-sm">{type.label}</span>
                  <span className="text-gray-500 text-xs ml-2">({type.description})</span>
                </div>
                <span className="text-white font-semibold">{rate}%</span>
              </div>

              {/* Progress bar */}
              <div className={`h-2 ${type.bgColor} rounded-full overflow-hidden`}>
                <div
                  className={`h-full ${type.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(rate, 100)}%` }}
                />
              </div>

              {/* Count */}
              <div className="flex justify-between mt-1">
                <span className="text-gray-500 text-xs">
                  {typeData.count || 0} of {typeData.total || 0}
                </span>
                {typeData.trend && parseFloat(typeData.trend) !== 0 && (
                  <span className={`text-xs ${parseFloat(typeData.trend) < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {parseFloat(typeData.trend) < 0 ? '↓' : '↑'} {Math.abs(parseFloat(typeData.trend))}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BounceRateChart
