import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coins, ShoppingCart, Lock, Loader2, Check, AlertCircle } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { fetchUserTrophies } from '@/redux/quickClashSlice'
import { POWERUP_ICONS, POWERUP_COLORS } from '../powerups/PowerupCard'

// Shop powerup prices (must match backend)
const SHOP_POWERUPS = [
  { id: 'STREAK_SHIELD', name: 'Streak Shield', price: 50, description: 'Protect streak once', phase: 'forge' },
  { id: 'ORACLES_EYE', name: "Oracle's Eye", price: 70, description: 'Remove 2 wrong options', phase: 'both' },
  { id: 'SCORE_SURGE', name: 'Score Surge', price: 90, description: '2x Forge / 1.1x Quiz', phase: 'both' },
  { id: 'TIME_WARP', name: 'Time Warp', price: 100, description: '+15s extra time', phase: 'both' },
  { id: 'PRECISION_PROTOCOL', name: 'Precision Protocol', price: 110, description: '+50 RQM if 100%', phase: 'quiz' },
]

const DEFAULT_COLORS = {
  gradient: 'from-slate-500 to-slate-600',
  bg: 'bg-slate-500/15',
  border: 'border-slate-500/30',
  text: 'text-slate-400',
}

/**
 * PowerupShop - Modal for purchasing powerups with coins
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Close modal handler
 * @param {boolean} isSessionPlayer - If true, show disabled state with login prompt
 */
const PowerupShop = ({ isOpen, onClose, isSessionPlayer = false }) => {
  const dispatch = useDispatch()
  const { userCoins } = useSelector(state => state.quickClash)

  const [powerups, setPowerups] = useState(SHOP_POWERUPS)
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(null) // powerupId being purchased
  const [purchaseSuccess, setPurchaseSuccess] = useState(null)
  const [error, setError] = useState(null)

  // Fetch shop data on open
  useEffect(() => {
    if (isOpen && !isSessionPlayer) {
      fetchShopData()
    }
  }, [isOpen, isSessionPlayer])

  const fetchShopData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/quickClash/shop/powerups')
      if (response.data.success) {
        setPowerups(response.data.powerups)
      }
    } catch (err) {
      console.error('Failed to fetch shop data:', err)
      // Keep default powerups if fetch fails
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (powerupId) => {
    if (isSessionPlayer || purchasing) return

    const powerup = powerups.find(p => p.id === powerupId)
    if (!powerup || userCoins < powerup.price) return

    try {
      setPurchasing(powerupId)
      setError(null)

      const response = await axios.post('/api/quickClash/shop/purchase', {
        powerupId,
        quantity: 1,
      })

      if (response.data.success) {
        setPurchaseSuccess(powerupId)
        // Refresh coin balance
        dispatch(fetchUserTrophies())

        // Clear success after animation
        setTimeout(() => {
          setPurchaseSuccess(null)
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase powerup')
      setTimeout(() => setError(null), 3000)
    } finally {
      setPurchasing(null)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/10 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 animate-pulse" />

            <div className="relative flex items-center justify-between gap-3">
              {/* Left - Icon and Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white">Powerup Shop</h2>
                  <p className="text-xs text-white/60">Spend coins on powerups</p>
                </div>
              </div>

              {/* Right - Coin Balance and Close Button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Coin Balance */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-amber-500/30">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-amber-400">{userCoins || 0}</span>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>
          </div>

          {/* Session Player Overlay */}
          {isSessionPlayer && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="text-center p-6">
                <Lock className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <h3 className="text-lg font-bold text-white mb-2">Login Required</h3>
                <p className="text-sm text-white/60 mb-4">
                  Create an account to purchase powerups and save your progress
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Error Toast */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-16 left-4 right-4 z-20 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Powerup List */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
              </div>
            ) : (
              powerups.map((powerup, index) => {
                const IconComponent = POWERUP_ICONS[powerup.id] || ShoppingCart
                const colors = POWERUP_COLORS[powerup.id] || DEFAULT_COLORS
                const canAfford = userCoins >= powerup.price
                const isPurchasing = purchasing === powerup.id
                const justPurchased = purchaseSuccess === powerup.id

                return (
                  <motion.div
                    key={powerup.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative p-3 rounded-xl border transition-all",
                      "bg-white/[0.03] hover:bg-white/[0.06]",
                      colors.border,
                      !canAfford && !isSessionPlayer && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={cn(
                        "p-2.5 rounded-xl flex-shrink-0",
                        `bg-gradient-to-br ${colors.gradient}`
                      )}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-white/90 truncate">
                          {powerup.name}
                        </h3>
                        <p className="text-xs text-white/50 truncate">
                          {powerup.description}
                        </p>
                      </div>

                      {/* Price & Buy Button */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg border",
                          colors.bg, colors.border
                        )}>
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span className={cn("text-sm font-bold", colors.text)}>
                            {powerup.price}
                          </span>
                        </div>

                        <button
                          onClick={() => handlePurchase(powerup.id)}
                          disabled={!canAfford || isPurchasing || isSessionPlayer}
                          className={cn(
                            "px-3 py-1.5 rounded-lg font-semibold text-xs transition-all",
                            justPurchased
                              ? "bg-emerald-500 text-white"
                              : canAfford && !isSessionPlayer
                                ? `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90`
                                : "bg-white/10 text-white/30 cursor-not-allowed"
                          )}
                        >
                          {isPurchasing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : justPurchased ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            "Buy"
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <p className="text-xs text-white/40 text-center">
              Powerups are added to your inventory for use in battles
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PowerupShop
