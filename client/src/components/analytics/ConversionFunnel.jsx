// client/src/components/analytics/ConversionFunnel.jsx
// Conversion Funnel visualization component

import React from 'react'

/**
 * Conversion Funnel Component
 * Displays session to account conversion funnel
 */
const ConversionFunnel = ({ conversion = {}, multiBattle = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
        <div className="h-4 bg-gray-700 rounded w-40 mb-4" />
        <div className="h-48 bg-gray-700/50 rounded animate-pulse" />
      </div>
    )
  }

  // Funnel stages
  const stages = [
    {
      label: 'Total Sessions',
      value: conversion.total || 0,
      percentage: 100,
      color: 'bg-purple-500',
    },
    {
      label: 'Played 2+ Battles',
      value: multiBattle.twoPlusBattles?.count || 0,
      percentage: parseFloat(multiBattle.twoPlusBattles?.rate) || 0,
      color: 'bg-cyan-500',
    },
    {
      label: 'Converted to Account',
      value: conversion.converted || 0,
      percentage: parseFloat(conversion.rate) || 0,
      color: 'bg-emerald-500',
    },
  ]

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🔄</span> Conversion Funnel
        </h3>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const widthPercentage = stage.percentage === 100
            ? 100
            : Math.max(20, Math.min(stage.percentage * 3, 100)) // Scale for visibility

          return (
            <div key={stage.label} className="relative">
              {/* Connector line */}
              {index > 0 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-600" />
              )}

              {/* Funnel bar */}
              <div
                className={`${stage.color} rounded-lg py-3 px-4 mx-auto transition-all duration-500`}
                style={{
                  width: `${widthPercentage}%`,
                  opacity: 0.8 + (index * 0.1)
                }}
              >
                <div className="flex items-center justify-between text-white">
                  <span className="font-medium text-sm">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{stage.value.toLocaleString()}</span>
                    {stage.percentage !== 100 && (
                      <span className="text-xs opacity-75">({stage.percentage}%)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Conversion Rate Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Session → Account Rate</span>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${
              conversion.status === 'pass' ? 'text-emerald-400' :
              conversion.status === 'conditional' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {conversion.rate}%
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              conversion.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' :
              conversion.status === 'conditional' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              Target: {conversion.target}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversionFunnel
