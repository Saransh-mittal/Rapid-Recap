import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Shield, Award, Target } from 'lucide-react'

const TIERS = {
  'diamond': { icon: Trophy, color: 'text-cyan-400', label: 'DIAMOND', bg: 'bg-cyan-900', border: 'border-cyan-400', shadow: 'shadow-cyan-400/60' },
  'gold': { icon: Star, color: 'text-yellow-400', label: 'GOLD', bg: 'bg-yellow-900', border: 'border-yellow-400', shadow: 'shadow-yellow-400/60' },
  'silver': { icon: Shield, color: 'text-gray-300', label: 'SILVER', bg: 'bg-gray-700', border: 'border-gray-300', shadow: 'shadow-gray-300/60' },
  'bronze': { icon: Award, color: 'text-orange-400', label: 'BRONZE', bg: 'bg-orange-900', border: 'border-orange-400', shadow: 'shadow-orange-400/60' },
  'rookie': { icon: Target, color: 'text-purple-400', label: 'ROOKIE', bg: 'bg-purple-900', border: 'border-purple-400', shadow: 'shadow-purple-400/60' },
}

const BenchmarkBadge = ({ tier = 'rookie', size = 'md' }) => {
  const config = TIERS[tier.toLowerCase()] || TIERS.rookie
  const Icon = config.icon

  const isLarge = size === 'lg'
  const iconSize = isLarge ? 48 : 24

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.5 }}
    >
      <div
        className={`
          flex flex-col items-center justify-center rounded-full border-4 shadow-[0_0_20px]
          ${config.bg} ${config.border} ${config.shadow}
        `}
        style={{
          width: isLarge ? '200px' : 'auto',
          height: isLarge ? '200px' : 'auto',
          padding: isLarge ? '2rem' : '0.5rem',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
        >
          <Icon size={iconSize} className={config.color} strokeWidth={isLarge ? 2 : 2.5} />
        </motion.div>

        {isLarge && (
           <p className={`mt-2 font-black ${config.color} text-2xl tracking-widest`}>
             {config.label}
           </p>
        )}
      </div>
    </motion.div>
  )
}

export default BenchmarkBadge
