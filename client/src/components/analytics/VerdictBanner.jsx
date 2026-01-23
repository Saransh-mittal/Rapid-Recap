// client/src/components/analytics/VerdictBanner.jsx
// Verdict Banner component for analytics dashboard
// Shows PASS/CONDITIONAL/FAIL verdict with criteria

import React from 'react'
import { Trophy, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'

/**
 * Verdict Banner Component
 * Displays the overall validation verdict with status
 */
const VerdictBanner = ({ verdict, reason, recommendation, loading = false }) => {
  const verdictConfig = {
    PASS: {
      icon: Trophy,
      bgColor: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20',
      borderColor: 'border-emerald-500/50',
      textColor: 'text-emerald-400',
      iconColor: 'text-emerald-400',
      label: 'PASS ✓',
    },
    'CONDITIONAL PASS': {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/50',
      textColor: 'text-yellow-400',
      iconColor: 'text-yellow-400',
      label: 'CONDITIONAL PASS ⚠',
    },
    FAIL: {
      icon: XCircle,
      bgColor: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
      borderColor: 'border-red-500/50',
      textColor: 'text-red-400',
      iconColor: 'text-red-400',
      label: 'FAIL ✗',
    },
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full" />
          <div className="h-6 bg-gray-700 rounded w-32" />
        </div>
      </div>
    )
  }

  const config = verdictConfig[verdict] || verdictConfig.FAIL
  const Icon = config.icon

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor}
        backdrop-blur-xl rounded-xl p-4 border
        transition-all duration-300
      `}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Verdict label */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-gray-900/50 ${config.iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Validation Verdict:</span>
              <span className={`text-xl font-bold ${config.textColor}`}>
                {config.label}
              </span>
            </div>
            {reason && (
              <p className="text-gray-400 text-sm mt-1">{reason}</p>
            )}
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-4 py-2">
            <CheckCircle className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 text-sm">{recommendation}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerdictBanner
