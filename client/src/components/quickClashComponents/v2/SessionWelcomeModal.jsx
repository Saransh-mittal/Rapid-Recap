// components/quickClashComponents/v2/SessionWelcomeModal.jsx
// "Aha Moment" modal shown when session player first enters QuickClashLayoutV2

import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Swords,
  Trophy,
  Users,
  User,
  Lock,
  CheckCircle,
  X,
  ChevronRight,
} from 'lucide-react'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

const SessionWelcomeModal = memo(({ isOpen, onClose, onCreateAccount }) => {
  const navigate = useNavigate()

  const handleContinue = () => {
    haptics.light()
    quizAudioService.playButtonClick()
    // Mark session player as upgraded to V2 UI
    // This ensures they go directly to /quickclash on future visits
    localStorage.setItem('sparkUpgraded', 'true')
    onClose()
  }

  const handleCreateAccount = () => {
    haptics.impact()
    quizAudioService.playSubmit()
    if (onCreateAccount) {
      onCreateAccount()
    } else {
      navigate('/play', { state: { intent: 'createAccount' } })
    }
  }

  const features = [
    {
      icon: Swords,
      text: 'Track all your battles',
      available: true,
      color: 'text-cyan-400',
    },
    {
      icon: Trophy,
      text: 'See your battle history',
      available: true,
      color: 'text-yellow-400',
    },
    {
      icon: Users,
      text: 'Join permanent teams',
      available: false,
      color: 'text-purple-400',
    },
    {
      icon: User,
      text: 'Build your profile',
      available: false,
      color: 'text-emerald-400',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleContinue}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {/* Header */}
            <div className="pt-8 pb-4 px-6 text-center">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-1">
                🎉 Welcome to Quick Clash!
              </h2>
              <p className="text-sm text-white/60">
                Here's what you can do now
              </p>
            </div>

            {/* Features List */}
            <div className="px-6 pb-4">
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                    style={{
                      background: feature.available
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        feature.available ? 'bg-white/10' : 'bg-white/5'
                      }`}
                    >
                      <feature.icon
                        className={`w-4 h-4 ${
                          feature.available ? feature.color : 'text-white/30'
                        }`}
                      />
                    </div>
                    <span
                      className={`flex-1 text-sm ${
                        feature.available ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {feature.text}
                    </span>
                    {feature.available ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-white/30" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 space-y-2">
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                  boxShadow: '0 4px 20px rgba(34, 211, 238, 0.3)',
                }}
              >
                Continue Playing
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={handleCreateAccount}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-semibold text-white/80 hover:text-white flex items-center justify-center gap-2 transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <User className="w-4 h-4" />
                Create Account
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

SessionWelcomeModal.displayName = 'SessionWelcomeModal'
export default SessionWelcomeModal
