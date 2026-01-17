// components/quickClashComponents/v2/TeamInvitePromptModal.jsx
// Occasional popup that encourages users to invite friends to their team
// Shows after PostSessionRewardScreen closes when conditions are met

import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Sparkles, Link2, Search } from 'lucide-react'
import { haptics } from '../../../utils/haptics'
import { quizAudioService } from '../../../services/quizAudioService'

const TeamInvitePromptModal = memo(({
  isOpen,
  onClose,
  onInviteViaLink,  // Opens SlotInviteModal
  onInviteInApp,     // Opens InviteUserModal
  team,
}) => {
  const emptySlots = 4 - (team?.members?.length || 0)
  const teamName = team?.name || 'Your Team'

  const handleInviteViaLink = () => {
    haptics.impact()
    quizAudioService.playButtonClick()
    onInviteViaLink?.()
    // Don't call onClose here - parent handles modal visibility
  }

  const handleInviteInApp = () => {
    haptics.impact()
    quizAudioService.playButtonClick()
    onInviteInApp?.()
    // Don't call onClose here - parent handles modal visibility
  }

  const handleDismiss = () => {
    haptics.light()
    quizAudioService.playDismiss?.()
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* Content */}
          <div className="px-6 pt-8 pb-6 text-center">
            {/* Icon with glow */}
            <motion.div
              className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-8 h-8 text-purple-400" />
            </motion.div>

            {/* Team name */}
            <div className="text-sm text-white/50 mb-1">{teamName}</div>

            {/* Main headline */}
            <h2 className="text-xl font-bold text-white mb-2">
              🎯 {emptySlots} Empty {emptySlots === 1 ? 'Spot' : 'Spots'}!
            </h2>

            {/* Compelling stat */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-5"
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">
                Full teams win 50% more!
              </span>
            </div>

            {/* Dual Action Buttons */}
            <div className="space-y-2.5">
              {/* Share Invite Link - Primary */}
              <motion.button
                onClick={handleInviteViaLink}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                }}
              >
                <Link2 className="w-5 h-5" />
                Share Invite Link
              </motion.button>

              {/* Invite Players - Secondary */}
              <motion.button
                onClick={handleInviteInApp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-semibold text-white/90 flex items-center justify-center gap-2.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <Search className="w-4 h-4" />
                Find & Invite Players
              </motion.button>

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-xl font-medium text-white/40 hover:text-white/60 transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

TeamInvitePromptModal.displayName = 'TeamInvitePromptModal'
export default TeamInvitePromptModal
