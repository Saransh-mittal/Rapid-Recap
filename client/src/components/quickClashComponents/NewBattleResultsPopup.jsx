// components/quickClashComponents/NewBattleResultsPopup.jsx
// Popup for showing unviewed battle results on homescreen

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Trophy,
  Gift,
  ChevronRight,
  Swords,
  Crown,
  Shield,
  Sparkles,
  Loader2
} from 'lucide-react'

// Haptic and audio feedback
import { haptics } from '../../utils/haptics'
import { quizAudioService } from '../../services/quizAudioService'

// Redux actions
import {
  fetchUnclaimedBattles,
  claimPowerupReward,
  markBattleViewed
} from '../../redux/quickClashTeamBattleSlice'

// Claim modal
import ClaimRewardsModal from './powerups/ClaimRewardsModal'

/**
 * NewBattleResultsPopup - Shows unviewed completed battles on homescreen
 *
 * @param {boolean} isOpen - Whether popup is open
 * @param {Function} onClose - Close handler
 */
const NewBattleResultsPopup = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    unclaimedBattles,
    unclaimedBattlesLoading,
    claimingRewardLoading
  } = useSelector(state => state.quickClashTeamBattle)

  const [selectedBattle, setSelectedBattle] = useState(null)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [claimingAll, setClaimingAll] = useState(false)

  // Fetch unclaimed battles when popup opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUnclaimedBattles())
    }
  }, [isOpen, dispatch])

  const handleClose = useCallback(() => {
    haptics.light()
    quizAudioService.playButtonClick()
    onClose()
  }, [onClose])

  const handleViewBattle = useCallback((battleId) => {
    haptics.light()
    quizAudioService.playButtonClick()
    navigate(`/quickclash/analysis/${battleId}`)
    onClose()
  }, [navigate, onClose])

  const handleClaimReward = useCallback((battle) => {
    haptics.medium()
    quizAudioService.playButtonClick()
    setSelectedBattle(battle)
    setClaimModalOpen(true)
  }, [])

  const handleConfirmClaim = useCallback(async (battleId) => {
    try {
      await dispatch(claimPowerupReward(battleId)).unwrap()
      setClaimModalOpen(false)
      setSelectedBattle(null)

      // If no more battles, close popup
      if (unclaimedBattles.length <= 1) {
        setTimeout(() => onClose(), 500)
      }
    } catch (error) {
      console.error('Failed to claim:', error)
      throw error // Re-throw for modal to handle
    }
  }, [dispatch, unclaimedBattles.length, onClose])

  const handleClaimAll = useCallback(async () => {
    if (claimingAll) return

    haptics.medium()
    setClaimingAll(true)

    try {
      for (const battle of unclaimedBattles) {
        if (battle.powerupReward?.housingSpaceEarned > 0) {
          await dispatch(claimPowerupReward(battle._id)).unwrap()
        }
      }
      quizAudioService.playCorrectAnswer()
      haptics.success()
      setTimeout(() => onClose(), 500)
    } catch (error) {
      console.error('Failed to claim all:', error)
      haptics.error()
    } finally {
      setClaimingAll(false)
    }
  }, [dispatch, unclaimedBattles, claimingAll, onClose])

  const handleDismiss = useCallback(() => {
    // Mark all as viewed but don't claim
    unclaimedBattles.forEach(battle => {
      if (!battle.isViewed) {
        dispatch(markBattleViewed(battle._id))
      }
    })
    handleClose()
  }, [dispatch, unclaimedBattles, handleClose])

  // Filter to only battles with rewards
  const battlesWithRewards = unclaimedBattles.filter(
    b => b.powerupReward?.housingSpaceEarned > 0
  )

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleDismiss}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Popup */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>

              {/* Header */}
              <div className="relative p-6 text-center border-b border-white/10">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative inline-flex p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/25 mb-3"
                >
                  <Swords className="w-7 h-7 text-white" />
                </motion.div>

                <h2 className="text-xl font-bold text-white mb-1">
                  ⚔️ Battle Results!
                </h2>
                <p className="text-sm text-white/60">
                  {battlesWithRewards.length} battle{battlesWithRewards.length !== 1 ? 's' : ''} with rewards awaiting
                </p>
              </div>

              {/* Battle list */}
              <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
                {unclaimedBattlesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                  </div>
                ) : battlesWithRewards.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="w-10 h-10 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">No rewards to claim</p>
                  </div>
                ) : (
                  battlesWithRewards.map((battle, index) => (
                    <motion.div
                      key={battle._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.08] transition-colors"
                    >
                      {/* Battle info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {battle.teamWon ? (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          ) : (
                            <Shield className="w-5 h-5 text-red-400" />
                          )}
                          <span className={`font-bold ${
                            battle.teamWon ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {battle.teamWon ? 'Victory!' : 'Defeat'}
                          </span>
                        </div>

                        {/* Trophy change */}
                        {battle.trophyChange !== 0 && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                            battle.trophyChange > 0
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            <Trophy className="w-3 h-3" />
                            {battle.trophyChange > 0 ? '+' : ''}{battle.trophyChange}
                          </div>
                        )}
                      </div>

                      {/* Teams */}
                      <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                        <span className="truncate max-w-[100px]">{battle.teamA?.name || 'Team A'}</span>
                        <span className="text-white/30 text-xs">vs</span>
                        <span className="truncate max-w-[100px]">{battle.teamB?.name || 'Team B'}</span>
                      </div>

                      {/* Reward indicator */}
                      <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400 font-semibold">
                          {battle.powerupReward?.housingSpaceEarned || 0} space in powerups
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewBattle(battle._id)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/70 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                        >
                          View
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleClaimReward(battle)}
                          disabled={claimingRewardLoading}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Gift className="w-4 h-4" />
                          Claim
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer with Claim All button */}
              {battlesWithRewards.length > 1 && (
                <div className="p-4 border-t border-white/10">
                  <motion.button
                    onClick={handleClaimAll}
                    disabled={claimingAll}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {claimingAll ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Claiming All...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Claim All Rewards
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim Modal */}
      <ClaimRewardsModal
        isOpen={claimModalOpen}
        onClose={() => {
          setClaimModalOpen(false)
          setSelectedBattle(null)
        }}
        battleResult={selectedBattle}
        onClaim={handleConfirmClaim}
      />
    </>
  )
}

export default NewBattleResultsPopup
