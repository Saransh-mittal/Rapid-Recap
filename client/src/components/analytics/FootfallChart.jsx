// client/src/components/analytics/FootfallChart.jsx
// Footfall and Traffic visualization component

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

/**
 * Footfall Chart Component
 * Displays DAU trend and new vs returning breakdown
 */
const FootfallChart = ({
  dau = [],
  newVsReturning = {},
  trafficBySource = {},
  loading = false,
}) => {
  const COLORS = ['#A855F7', '#06B6D4', '#10B981', '#F59E0B']

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
        <div className="h-4 bg-gray-700 rounded w-40 mb-4" />
        <div className="h-48 bg-gray-700/50 rounded animate-pulse" />
      </div>
    )
  }

  // Prepare new vs returning data for pie chart
  const pieData = [
    { name: 'New Users', value: newVsReturning.new?.total || 0 },
    { name: 'Returning', value: newVsReturning.returning?.total || 0 },
  ]

  // Prepare traffic source data
  const trafficData = [
    { name: 'Organic', value: trafficBySource.organic?.count || 0 },
    { name: 'Referral', value: trafficBySource.referral?.count || 0 },
    { name: 'Team Invite', value: trafficBySource.teamInvite?.count || 0 },
    { name: 'Direct', value: trafficBySource.directSession?.count || 0 },
  ].filter(item => item.value > 0)

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-2 shadow-xl">
          <p className="text-white text-sm">{payload[0].name}</p>
          <p className="text-purple-400 font-semibold">{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>👥</span> Traffic & Footfall
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DAU Trend - Separated by Login vs Battle */}
        <div>
          <p className="text-gray-400 text-sm mb-2">Daily Active Users</p>
          {/* Legend */}
          <div className="flex gap-4 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#A855F7' }} />
              <span className="text-gray-400 text-xs">Login</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#06B6D4' }} />
              <span className="text-gray-400 text-xs">Battle (Users)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22D3EE' }} />
              <span className="text-gray-400 text-xs">Battle (Guests)</span>
            </div>
          </div>
          {dau.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={dau.slice(-14)}> {/* Last 14 days */}
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(value) => value.slice(8)} // Show DD
                />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #A855F7',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => {
                    const labels = {
                      loginUsers: 'Login',
                      battleUsers: 'Battle (Users)',
                      battleSessions: 'Battle (Sessions)',
                    }
                    return [value, labels[name] || name]
                  }}
                />
                <Bar dataKey="loginUsers" fill="#A855F7" radius={[4, 4, 0, 0]} name="Login" />
                <Bar dataKey="battleUsers" stackId="battle" fill="#06B6D4" radius={[0, 0, 0, 0]} name="Battle (Users)" />
                <Bar dataKey="battleSessions" stackId="battle" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Battle (Guests)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-500">
              No DAU data available
            </div>
          )}
        </div>

        {/* New vs Returning Pie */}
        <div>
          <p className="text-gray-400 text-sm mb-2">New vs Returning</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-400 text-sm">New:</span>
                <span className="text-white font-semibold">{newVsReturning.new?.total || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-gray-400 text-sm">Returning:</span>
                <span className="text-white font-semibold">{newVsReturning.returning?.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      {trafficData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-3">Traffic by Source</p>
          <div className="grid grid-cols-4 gap-2">
            {trafficData.map((source, index) => (
              <div key={source.name} className="text-center">
                <div
                  className="h-2 rounded-full mb-1"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <p className="text-white text-sm font-semibold">{source.value}</p>
                <p className="text-gray-500 text-xs">{source.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FootfallChart
