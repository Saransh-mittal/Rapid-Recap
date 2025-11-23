import React from 'react'
import { motion } from 'framer-motion'

const OptionButton = React.memo(
  ({ optionKey, optionText, isSelected, onSelect, isTournament = false }) => {

    // Determine styles based on state
    const getStyles = () => {
      if (isTournament) {
        if (isSelected) return 'bg-yellow-500/20 border-yellow-400/60 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
        return 'bg-white/5 border-white/10 hover:bg-yellow-500/10 hover:border-yellow-400/40'
      }

      // Default Blue/Cyan Theme
      if (isSelected) return 'bg-cyan-500/20 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
      return 'bg-white/5 border-white/10 hover:bg-cyan-500/10 hover:border-cyan-400/40'
    }

    return (
      <motion.button
        onClick={() => onSelect(optionKey)}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ease-out
          flex items-center gap-4 group relative overflow-hidden
          ${getStyles()}
        `}
      >
        {/* Ripple/Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

        {/* Option Key (A, B, C...) */}
        {!isTournament && (
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 transition-colors
            ${isSelected
              ? 'bg-cyan-500 text-white'
              : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'}
          `}>
            {optionKey.toUpperCase()}
          </div>
        )}

        {/* Option Text */}
        <span className={`
          text-base md:text-lg font-medium leading-snug
          ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}
        `}>
          {optionText}
        </span>

        {/* Selection Indicator (Checkmark) */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-auto text-cyan-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </motion.button>
    )
  },
)

export default OptionButton
