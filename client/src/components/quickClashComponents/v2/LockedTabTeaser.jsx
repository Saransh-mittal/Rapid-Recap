// components/quickClashComponents/v2/LockedTabTeaser.jsx
// Teaser content shown for locked tabs (Teams, Profile) for session players

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, User, Lock, Sparkles, ChevronRight, Trophy, Shield, Star } from 'lucide-react'

// Audio and haptics
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

const LockedTabTeaser = memo(({ tabType, onCreateAccount }) => {
  const navigate = useNavigate()

  const teasers = {
    teams: {
      icon: Users,
      title: 'Join Team Battles',
      description: 'Create an account to join permanent teams and compete with friends!',
      color: 'from-purple-500 to-indigo-500',
      glowColor: 'rgba(147, 51, 234, 0.3)',
      features: [
        { icon: Shield, text: 'Join or create your own team' },
        { icon: Users, text: 'Battle alongside teammates' },
        { icon: Trophy, text: 'Earn team trophies and rank up' },
      ],
    },
    profile: {
      icon: User,
      title: 'Build Your Profile',
      description: 'Create an account to track your stats, badges, and achievements!',
      color: 'from-emerald-500 to-teal-500',
      glowColor: 'rgba(52, 211, 153, 0.3)',
      features: [
        { icon: Star, text: 'Track your all-time stats' },
        { icon: Trophy, text: 'Earn badges and achievements' },
        { icon: Sparkles, text: 'Customize your profile' },
      ],
    },
  }

  const teaser = teasers[tabType] || teasers.teams
  const Icon = teaser.icon

  const handleCreateAccount = () => {
    haptics.impact()
    quizAudioService.playSubmit()
    if (onCreateAccount) {
      onCreateAccount()
    } else {
      navigate('/play', { state: { intent: 'createAccount' } })
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        {/* Locked Icon */}
        <motion.div
          className="relative w-20 h-20 mx-auto mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${teaser.color} opacity-20 blur-xl`}
          />
          <div
            className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${teaser.color} bg-opacity-30 flex items-center justify-center border border-white/10`}
            style={{ boxShadow: `0 8px 30px ${teaser.glowColor}` }}
          >
            <Icon className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center">
              <Lock className="w-3 h-3 text-white/60" />
            </div>
          </div>
        </motion.div>

        {/* Title & Description */}
        <h2 className="text-xl font-bold text-white mb-2">{teaser.title}</h2>
        <p className="text-sm text-white/50 mb-6">{teaser.description}</p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {teaser.features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/70">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={handleCreateAccount}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r ${teaser.color}`}
          style={{ boxShadow: `0 4px 20px ${teaser.glowColor}` }}
        >
          <Sparkles className="w-4 h-4" />
          Create Free Account
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        {/* Subtle note */}
        <p className="mt-4 text-xs text-white/30">
          Keep all your progress, join teams, and unlock the full experience
        </p>
      </motion.div>
    </div>
  )
})

LockedTabTeaser.displayName = 'LockedTabTeaser'
export default LockedTabTeaser
