// client/src/components/analytics/RetentionChart.jsx
// Retention Curve Chart using Recharts
// Displays D1-D30 retention curve

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

/**
 * Retention Chart Component
 * Displays retention curve from D1 to D30
 */
const RetentionChart = ({ data = [], loading = false }) => {
  // Target lines for reference
  const d1Target = 25
  const d7Target = 10

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
        <div className="h-4 bg-gray-700 rounded w-32 mb-4" />
        <div className="h-64 bg-gray-700/50 rounded animate-pulse" />
      </div>
    )
  }

  // Format data for chart
  const chartData = data.map(item => ({
    day: `D${item.day}`,
    rate: parseFloat(item.rate),
    count: item.count,
    total: item.total,
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{label} Retention</p>
          <p className="text-purple-400">{data.rate}%</p>
          <p className="text-gray-400 text-sm">
            {data.count} of {data.total} users
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📈</span> Retention Curve
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-500" />
            <span className="text-gray-400">Actual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-emerald-500/50 border-dashed" />
            <span className="text-gray-400">Target</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="day"
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Target reference lines */}
          <ReferenceLine
            y={d1Target}
            stroke="#10B981"
            strokeDasharray="5 5"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={d7Target}
            stroke="#10B981"
            strokeDasharray="5 5"
            strokeOpacity={0.3}
          />

          {/* Main retention line */}
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#A855F7"
            strokeWidth={3}
            dot={{
              fill: '#A855F7',
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: '#A855F7',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RetentionChart
