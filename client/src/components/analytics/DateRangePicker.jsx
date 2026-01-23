// client/src/components/analytics/DateRangePicker.jsx
// Date Range Picker component for analytics dashboard

import React, { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

/**
 * Date Range Picker Component
 * Simple dropdown for selecting date range
 */
const DateRangePicker = ({ value = 30, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { value: 7, label: 'Last 7 days' },
    { value: 14, label: 'Last 14 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 60, label: 'Last 60 days' },
    { value: 90, label: 'Last 90 days' },
  ]

  const selectedOption = options.find(opt => opt.value === value) || options[2]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white hover:bg-gray-700 transition-colors"
      >
        <Calendar className="w-4 h-4 text-purple-400" />
        <span className="text-sm">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl z-20 overflow-hidden">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  option.value === value
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default DateRangePicker
