// client/src/components/analytics/SoloDrillChart.jsx
// Solo Drill deep analytics visualization component

import React from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const BENCHMARK_CONFIG = {
  rookie:  { color: '#6B7280', emoji: '🟤', label: 'Rookie' },
  bronze:  { color: '#CD7F32', emoji: '🥉', label: 'Bronze' },
  silver:  { color: '#A0AEC0', emoji: '🥈', label: 'Silver' },
  gold:    { color: '#F59E0B', emoji: '🥇', label: 'Gold' },
  diamond: { color: '#06B6D4', emoji: '💎', label: 'Diamond' },
}

/**
 * Solo Drill Chart Component
 * Displays benchmark distribution donut, stats grid, top categories, and daily trend
 */
const SoloDrillChart = ({ data = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-cyan-500/30">
        <div className="h-4 bg-gray-700 rounded w-48 mb-4" />
        <div className="h-64 bg-gray-700/50 rounded animate-pulse" />
      </div>
    )
  }

  if (!data || !data.totalDrills) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-cyan-500/30">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
          <span>🎯</span> Solo Drill Analytics
        </h3>
        <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
          No Solo Drill data for this period
        </div>
      </div>
    )
  }

  // Benchmark donut data
  const benchmarkData = Object.entries(data.benchmarkDistribution || {})
    .map(([key, count]) => ({
      name: BENCHMARK_CONFIG[key]?.label || key,
      value: count,
      color: BENCHMARK_CONFIG[key]?.color || '#6B7280',
      emoji: BENCHMARK_CONFIG[key]?.emoji || '',
    }))
    .filter(item => item.value > 0)

  // Category bar data
  const categoryData = (data.topCategories || []).map(c => ({
    name: c.category?.length > 12 ? c.category.slice(0, 12) + '…' : c.category,
    fullName: c.category,
    count: c.count,
  }))

  // Daily trend data
  const trendData = (data.dailyTrend || []).slice(-14) // Last 14 days

  // Custom tooltip for benchmark
  const BenchmarkTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{item.emoji} {item.name}</p>
          <p className="text-cyan-400">{item.value} drills</p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for categories
  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{payload[0].payload.fullName}</p>
          <p className="text-cyan-400">{payload[0].value} drills</p>
        </div>
      )
    }
    return null
  }

  const statusColor = (status) =>
    status === 'pass' ? 'text-emerald-400' :
    status === 'conditional' ? 'text-yellow-400' : 'text-red-400'

  const statusBg = (status) =>
    status === 'pass' ? 'bg-emerald-500' :
    status === 'conditional' ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-cyan-500/30">
      <h3 className="text-white font-semibold flex items-center gap-2 mb-5">
        <span>🎯</span> Solo Drill Analytics
        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full ml-2">
          {data.totalDrills} total
        </span>
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Completion Rate */}
        <div className="bg-gray-700/40 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Completion Rate</p>
          <p className={`text-lg font-bold ${statusColor(data.completionStatus)}`}>
            {data.completionRate}%
          </p>
          <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${statusBg(data.completionStatus)}`}
              style={{ width: `${Math.min(parseFloat(data.completionRate), 100)}%` }}
            />
          </div>
        </div>

        {/* Adoption Rate */}
        <div className="bg-gray-700/40 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Adoption Rate</p>
          <p className={`text-lg font-bold ${statusColor(data.adoptionStatus)}`}>
            {data.adoptionRate}%
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {data.uniqueDrillers} / {data.activeBattleUsers} users
          </p>
        </div>

        {/* Avg Score */}
        <div className="bg-gray-700/40 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Avg Total Score</p>
          <p className="text-lg font-bold text-white">{data.avgTotalScore}</p>
          <p className="text-gray-500 text-xs mt-1">
            F: {data.avgForgeScore} / Q: {data.avgQuizScore}
          </p>
        </div>

        {/* Source Split */}
        <div className="bg-gray-700/40 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Source Split</p>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-sm">
              {data.sourceSplit?.daily_free || 0}
            </span>
            <span className="text-gray-500 text-xs">free</span>
            <span className="text-purple-400 font-bold text-sm">
              {data.sourceSplit?.purchased || 0}
            </span>
            <span className="text-gray-500 text-xs">paid</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            {data.abandonedDrills} abandoned, {data.inProgressDrills} in-progress
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Benchmark Donut */}
        <div className="lg:w-1/3">
          <p className="text-gray-400 text-xs font-medium mb-2">Benchmark Distribution</p>
          {benchmarkData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={benchmarkData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {benchmarkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<BenchmarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {Object.entries(BENCHMARK_CONFIG).map(([key, config]) => {
                  const count = data.benchmarkDistribution?.[key] || 0
                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-gray-400">{config.emoji} {config.label}</span>
                      </div>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-500 text-xs">
              No benchmark data
            </div>
          )}
        </div>

        {/* Top Categories Bar Chart */}
        <div className="lg:w-1/3">
          <p className="text-gray-400 text-xs font-medium mb-2">Top Categories</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Tooltip content={<CategoryTooltip />} />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-500 text-xs">
              No category data
            </div>
          )}
        </div>

        {/* Daily Trend Sparkline */}
        <div className="lg:w-1/3">
          <p className="text-gray-400 text-xs font-medium mb-2">
            Daily Drill Trend
            <span className="ml-2 text-gray-500">(last 14d)</span>
          </p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="drillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#6B7280' }}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 9, fill: '#6B7280' }} width={30} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(6,182,212,0.3)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Area
                  type="monotone"
                  dataKey="starts"
                  stroke="#06B6D4"
                  fill="url(#drillGrad)"
                  strokeWidth={2}
                  name="Started"
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  stroke="#10B981"
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-500 text-xs">
              No trend data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SoloDrillChart
