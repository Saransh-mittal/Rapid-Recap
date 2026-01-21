import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../../ui/badge'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { Bolt, Loader2, Package, CheckCircle2, AlertCircle, Shield, X } from 'lucide-react'
import PowerupCard from './PowerupCard'
import { fetchTeamBattleDetails } from '../../../redux/quickClashTeamBattleSlice'
import { cn } from '@/lib/utils'
import { quizAudioService } from '../../../services/quizAudioService'
import { useTutorial } from '../v2/tutorial/TutorialManager'

const MAX_LOADOUT_HOUSING = 30

const PowerupSelectionModal = ({ isOpen, onClose, battleId, teamId }) => {
  const { activeTutorial, stepIndex, goToStep } = useTutorial()
  const [processing, setProcessing] = useState(null)
  const [message, setMessage] = useState(null)
  const dispatch = useDispatch()

  const { currentBattle } = useSelector(state => state.quickClashTeamBattle)
  const { user } = useSelector(state => state.auth)

  const isTeamA = currentBattle?.teamA?._id === teamId || currentBattle?.teamA === teamId
  const pool = isTeamA ? currentBattle?.teamAPool : currentBattle?.teamBPool
  const members = isTeamA ? currentBattle?.teamAMembers : currentBattle?.teamBMembers
  const member = members?.find(m => m?.user?._id === user?._id || m.user === user?._id)

  const loadout = member?.loadout || { items: [], housingUsed: 0 }
  const loadoutHousingUsed = loadout.housingUsed || 0
  const loadoutPercentage = (loadoutHousingUsed / MAX_LOADOUT_HOUSING) * 100

  const handleEquip = async (powerup) => {
    setMessage(null)
    if (loadoutHousingUsed + powerup.cost > MAX_LOADOUT_HOUSING) {
      setMessage({ type: 'error', text: 'Loadout Full (Max 30)' })
      return
    }

    try {
      setProcessing(powerup.powerupId)
      await axios.post(`/api/quickClash/team-battle/${battleId}/powerup/equip`, {
        teamId,
        powerupType: powerup.powerupId
      })

      setMessage({ type: 'success', text: 'Equipped! ⚡' })
      quizAudioService.playEquip()
      quizAudioService.playEquip()
      dispatch(fetchTeamBattleDetails(battleId))

      // Tutorial: If on step 3 (loadout_modal), advance to step 4 (categories)
      if (activeTutorial === 'battle' && stepIndex === 3) {
        setTimeout(() => {
            onClose()
            goToStep(4)
        }, 800)
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Equip Failed' })
    } finally {
      setProcessing(null)
    }
  }

  const handleUnequip = async (powerup) => {
    setMessage(null)
    try {
      setProcessing(powerup.powerupId)
      await axios.post(`/api/quickClash/team-battle/${battleId}/powerup/unequip`, {
        teamId,
        powerupType: powerup.powerupId
      })

      setMessage({ type: 'success', text: 'Unequipped!' })
      quizAudioService.playUnequip()
      dispatch(fetchTeamBattleDetails(battleId))
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unequip Failed' })
    } finally {
      setProcessing(null)
    }
  }

  // Group pool items by type
  const groupedPool = pool?.items?.reduce((acc, item) => {
    if (!acc[item.powerupId]) {
      acc[item.powerupId] = { ...item, count: 0 }
    }
    acc[item.powerupId].count++
    return acc
  }, {})

  const poolItems = Object.values(groupedPool || {})

  // Helper to check if a single-equip powerup is already equipped
  const isSingleEquipAlreadyEquipped = (powerupId) => {
    const singleEquipPowerups = ['PRECISION_PROTOCOL', 'STREAK_SHIELD', 'SCORE_SURGE']
    if (!singleEquipPowerups.includes(powerupId)) return false
    return loadout.items.some(equipped => equipped.powerupId === powerupId)
  }

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900/95 backdrop-blur-xl rounded-2xl max-w-md w-full border border-white/10 max-h-[85vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
                >
                  <Bolt className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white">Select Loadout</h3>
                  <p className="text-xs text-white/40">Equip powerups for battle</p>
                </div>
              </div>
              <motion.button
                onClick={() => {
                  quizAudioService.playDismiss()
                  onClose()
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-[calc(85vh-80px)] overflow-y-auto scrollbar-hide">
              {/* Your Loadout */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-sm text-white">Your Loadout</span>
                  </div>
                  <span className={cn(
                    "text-sm font-mono font-bold",
                    loadoutHousingUsed >= MAX_LOADOUT_HOUSING ? 'text-red-400' : 'text-emerald-400'
                  )}>
                    {loadoutHousingUsed}/{MAX_LOADOUT_HOUSING}
                  </span>
                </div>

                {/* Progress Ring */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                      <motion.circle
                        cx="28" cy="28" r="24"
                        stroke="url(#loadoutGrad)"
                        strokeWidth="4"
                        fill="transparent"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 151 }}
                        animate={{ strokeDashoffset: 151 - (loadoutPercentage / 100) * 151 }}
                        transition={{ duration: 0.5 }}
                        strokeDasharray="151"
                      />
                      <defs>
                        <linearGradient id="loadoutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-cyan-400">{Math.round(loadoutPercentage)}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/50 text-sm">
                      {loadout.items.length === 0 ? 'No powerups equipped' : 'Tap to unequip'}
                    </p>
                  </div>
                </div>

                {/* Equipped Items */}
                {loadout.items.length > 0 && (
                  <div className="space-y-2">
                    {loadout.items.map((item, index) => (
                      <motion.div key={`${item.powerupId}-${index}`} className="relative">
                        <PowerupCard powerup={item} onClick={() => handleUnequip(item)} isDisabled={processing} isSelected={true} showPhase={true} />
                        {processing === item.powerupId && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium",
                      message.type === 'error'
                        ? "bg-red-500/10 border-red-500/30 text-red-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    )}
                  >
                    {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Team Pool */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-sm text-white">Team Pool</span>
                  </div>
                  <Badge className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-300 border-blue-500/30">
                    {poolItems.length} available
                  </Badge>
                </div>

                {poolItems.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                    <Package className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">Pool empty - Donate first!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {poolItems.map((item, index) => (
                      <motion.div
                        key={item.powerupId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={activeTutorial === 'battle' && stepIndex === 3 ? { opacity: 1, y: 0, scale: [1, 1.05, 1] } : { opacity: 1, y: 0 }}
                        transition={activeTutorial === 'battle' && stepIndex === 3 ? {
                             delay: index * 0.05,
                             scale: { duration: 1, repeat: Infinity, delay: index * 0.1, ease: "easeInOut" }
                        } : { delay: index * 0.05 }}
                        className="relative"
                      >
                        <PowerupCard
                          powerup={item}
                          onClick={() => handleEquip(item)}
                          isDisabled={processing || loadoutHousingUsed + item.cost > MAX_LOADOUT_HOUSING || isSingleEquipAlreadyEquipped(item.powerupId)}
                          showPhase={true}
                          showType={true}
                          className={activeTutorial === 'battle' && stepIndex === 3 ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_20px_rgba(56,189,248,0.5)] z-10' : ''}
                        />
                        {/* Indicator for already-equipped passive */}
                        {isSingleEquipAlreadyEquipped(item.powerupId) && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                              ✓ Already Equipped
                            </span>
                          </div>
                        )}
                        <Badge className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold border-2 border-slate-900">
                          {item.count}
                        </Badge>
                        {processing === item.powerupId && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default PowerupSelectionModal
