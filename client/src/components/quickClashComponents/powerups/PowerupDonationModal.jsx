import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../../ui/badge'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { Gift, Loader2, Package, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react'
import PowerupCard from './PowerupCard'
import { fetchTeamBattleDetails } from '../../../redux/quickClashTeamBattleSlice'
import { cn } from '@/lib/utils'
import { quizAudioService } from '../../../services/quizAudioService'

const MAX_POOL_HOUSING = 80
const MAX_USER_DONATION = 20

const PowerupDonationModal = ({ isOpen, onClose, battleId, teamId }) => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [donating, setDonating] = useState(null)
  const [message, setMessage] = useState(null)
  const dispatch = useDispatch()

  const { currentBattle } = useSelector(state => state.quickClashTeamBattle)
  const { user } = useSelector(state => state.auth)

  const isTeamA = currentBattle?.teamA?._id === teamId || currentBattle?.teamA === teamId
  const pool = isTeamA ? currentBattle?.teamAPool : currentBattle?.teamBPool
  const poolHousingUsed = pool?.housingUsed || 0
  const poolPercentage = (poolHousingUsed / MAX_POOL_HOUSING) * 100

  const userDonatedTotal = pool?.items
    ?.filter(i => i.donatedBy && i.donatedBy === user?._id)
    ?.reduce((sum, i) => sum + i.cost, 0) || 0

  useEffect(() => {
    if (isOpen) {
      fetchInventory()
      setMessage(null)
    }
  }, [isOpen])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/quickClash/powerups/inventory')
      if (response.data.success) {
        setInventory(response.data.inventory)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setMessage({ type: 'error', text: 'Failed to fetch inventory' })
    } finally {
      setLoading(false)
    }
  }

  const handleDonate = async (powerup) => {
    setMessage(null)
    if (poolHousingUsed + powerup.cost > MAX_POOL_HOUSING) {
      setMessage({ type: 'error', text: 'Team Pool is full!' })
      return
    }

    if (userDonatedTotal + powerup.cost > MAX_USER_DONATION) {
      setMessage({ type: 'error', text: `Donation limit reached (Max ${MAX_USER_DONATION})` })
      return
    }

    try {
      setDonating(powerup.powerupId)
      await axios.post(`/api/quickClash/team-battle/${battleId}/powerup/donate`, {
        teamId,
        powerupId: powerup.powerupId
      })

      setMessage({ type: 'success', text: 'Donation Successful! 🎉' })
      quizAudioService.playDonate()
      dispatch(fetchTeamBattleDetails(battleId))

      setInventory(prev => prev.map(item =>
        item.powerupId === powerup.powerupId
          ? { ...item, count: item.count - 1 }
          : item
      ).filter(item => item.count > 0))

    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Donation Failed' })
    } finally {
      setDonating(null)
    }
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
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"
                >
                  <Gift className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white">Donate Powerups</h3>
                  <p className="text-xs text-white/40">Share with your team</p>
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
              {/* Pool Capacity */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-sm text-white">Team Pool</span>
                  </div>
                  <span className={cn(
                    "text-sm font-mono font-bold",
                    poolHousingUsed >= MAX_POOL_HOUSING ? 'text-red-400' : 'text-emerald-400'
                  )}>
                    {poolHousingUsed}/{MAX_POOL_HOUSING}
                  </span>
                </div>

                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${poolPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={cn(
                      "h-full rounded-full",
                      poolHousingUsed >= MAX_POOL_HOUSING
                        ? "bg-gradient-to-r from-red-500 to-red-400"
                        : "bg-gradient-to-r from-purple-500 to-indigo-400"
                    )}
                  />
                </div>

                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-white/40">{pool?.items?.length || 0} items</span>
                  <span className={cn("font-medium", userDonatedTotal >= MAX_USER_DONATION ? 'text-red-400' : 'text-purple-300')}>
                    Your: {userDonatedTotal}/{MAX_USER_DONATION}
                  </span>
                </div>
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
                    {message.type === 'error'
                      ? <AlertCircle className="w-4 h-4" />
                      : <CheckCircle2 className="w-4 h-4" />
                    }
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inventory */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-sm text-white">Your Inventory</span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 className="w-6 h-6 text-purple-400" />
                    </motion.div>
                    <p className="text-white/40 text-sm mt-2">Loading...</p>
                  </div>
                ) : inventory.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                    <Package className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">Inventory empty</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inventory.map((item, index) => (
                      <motion.div
                        key={item.powerupId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        <PowerupCard
                          powerup={item}
                          onClick={() => handleDonate(item)}
                          isDisabled={donating || poolHousingUsed + item.cost > MAX_POOL_HOUSING || userDonatedTotal + item.cost > MAX_USER_DONATION}
                        />
                        <Badge className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold border-2 border-slate-900">
                          {item.count}
                        </Badge>
                        {donating === item.powerupId && (
                          <motion.div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                          </motion.div>
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

export default PowerupDonationModal
