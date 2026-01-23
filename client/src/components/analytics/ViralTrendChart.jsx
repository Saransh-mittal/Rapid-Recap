// client/src/components/analytics/ViralTrendChart.jsx
// Viral K-Coefficient trend chart using Recharts

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

/**
 * Viral Trend Chart Component
 * Displays K-coefficient trend over time
 */
const ViralTrendChart = ({ data = [], breakdown = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
        <div className="h-4 bg-gray-700 rounded w-40 mb-4" />
        <div className="h-64 bg-gray-700/50 rounded animate-pulse" />
      </div>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-cyan-400 font-semibold">K = {payload[0].value.toFixed(3)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🌐</span> Viral K-Coefficient
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="kGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            fontSize={10}
            tickLine={false}
            tickFormatter={(value) => value.slice(5)} // Show MM-DD
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* K=1 reference line (viral growth) */}
          <ReferenceLine
            y={1}
            stroke="#10B981"
            strokeDasharray="5 5"
            strokeOpacity={0.5}
            label={{ value: 'K=1 (Viral)', fill: '#10B981', fontSize: 10 }}
          />

          <Area
            type="monotone"
            dataKey="k"
            stroke="#06B6D4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#kGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-3">Breakdown:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">• Team Links:</span>
              <span className="text-white">{breakdown.teamCodeJoins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">• Team Invites:</span>
              <span className="text-white">{breakdown.teamInvitesSent || breakdown.directInvitesSent || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">• Team Accepted:</span>
              <span className="text-emerald-400">{breakdown.teamInvitesAccepted || breakdown.directInvitesAccepted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">• Friend Requests:</span>
              <span className="text-white">{breakdown.friendRequestsSent || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">• Friends Added:</span>
              <span className="text-emerald-400">{breakdown.friendRequestsAccepted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">• Conversions:</span>
              <span className="text-cyan-400">{breakdown.sessionConversions || breakdown.invitedConversions || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViralTrendChart
