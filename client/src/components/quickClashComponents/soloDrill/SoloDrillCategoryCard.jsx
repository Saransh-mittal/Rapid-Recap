import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Coins, ShoppingCart, Swords, X } from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'
import { getCategoryInfo } from '../team/teamBattlePageComponents/categoriesSection/categoryUtils'
import { notificationManager } from '../../../utils/notifications'

const CUSTOM_PURCHASE_COST = 200
const CUSTOM_DRILLS_PER_PURCHASE = 3

const SoloDrillCategoryCard = ({ category, disabled }) => {
  const {
    setSelectedCategory,
    stats,
    customDrillLimits,
    userCoins,
    purchaseCustomDrills,
    purchasing,
    fetchCustomLimits,
  } = useSoloDrill()

  const [showPurchaseGate, setShowPurchaseGate] = useState(false)

  const categoryInfo = getCategoryInfo(category)
  const IconComponent = categoryInfo.iconComponent
  const isCustom = category === 'Custom'

  // Check if custom drills are exhausted
  const customDrillsRemaining = customDrillLimits?.totalCustomDrillsRemaining ?? null
  const isCustomExhausted = isCustom && customDrillsRemaining !== null && customDrillsRemaining <= 0
  const canAffordPurchase = userCoins >= CUSTOM_PURCHASE_COST

  // Real stats from backend
  const categoryStats = useMemo(() => {
    if (!stats?.byCategory?.[category]) return null
    return stats.byCategory[category]
  }, [stats, category])

  const handleClick = () => {
    if (disabled) return

    // If Custom and no drills remaining → show purchase gate
    if (isCustomExhausted) {
      setShowPurchaseGate(true)
      return
    }

    setSelectedCategory(category)
  }

  const handlePurchase = async () => {
    try {
      const result = await purchaseCustomDrills()
      if (result.payload?.success) {
        notificationManager.success(
          'Custom Drills Purchased!',
          `Added ${CUSTOM_DRILLS_PER_PURCHASE} custom drills.`
        )
        await fetchCustomLimits()
        setShowPurchaseGate(false)
        setSelectedCategory(category)
      } else {
        notificationManager.error(
          'Purchase Failed',
          result.payload || 'Could not complete purchase.'
        )
      }
    } catch (err) {
      console.error(err)
      notificationManager.error('Error', 'An unexpected error occurred.')
    }
  }

  return (
    <>
      <motion.button
        type="button"
        whileHover={!disabled ? { scale: 1.03 } : {}}
        whileTap={!disabled ? { scale: 0.97 } : {}}
        onClick={handleClick}
        className={`
          relative overflow-hidden p-4 sm:p-5 rounded-2xl text-left min-h-[140px] group
          transition-all duration-300
          ${disabled
            ? 'cursor-not-allowed opacity-35'
            : 'cursor-pointer'}
        `}
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.45)',
          boxShadow: disabled ? 'none' : '0 2px 16px rgba(0,0,0,0.2)',
        }}
        aria-label={`Select ${category} category`}
      >
        {/* Hover glow — category-colored */}
        {!disabled && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${categoryInfo.primaryColor}18, transparent 70%)`,
              boxShadow: `inset 0 1px 0 ${categoryInfo.primaryColor}35`,
            }}
          />
        )}

        {/* AI badge for Custom */}
        {isCustom && !disabled && (
          <div
            className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
            style={{
              background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(34,211,238,0.12))',
              color: '#5eead4',
              border: '1px solid rgba(20,184,166,0.2)',
            }}
          >
            <Sparkles size={8} />
            AI
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col justify-between gap-3">
          {/* Icon */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${categoryInfo.primaryColor}15`,
              color: categoryInfo.primaryColor,
            }}
          >
            <IconComponent size={22} strokeWidth={2} />
          </div>

          {/* Text content */}
          <div className="flex-1 flex flex-col justify-end">
            <p className="font-bold text-[15px] sm:text-base capitalize text-white leading-snug">
              {category}
            </p>

            {categoryStats ? (
              <p className="mt-1 text-xs text-slate-400 font-medium">
                {categoryStats.count} drill{categoryStats.count !== 1 ? 's' : ''}
                <span className="mx-1 text-slate-600">·</span>
                Best: <span style={{ color: categoryInfo.primaryColor }}>{categoryStats.bestScore}</span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500 font-medium">
                {isCustom ? 'AI-Powered' : 'No drills yet'}
              </p>
            )}

            {/* Show remaining custom drills count */}
            {isCustom && customDrillsRemaining !== null && (
              <p className={`mt-0.5 text-[10px] font-semibold ${customDrillsRemaining > 0 ? 'text-teal-400/70' : 'text-amber-400/70'}`}>
                {customDrillsRemaining > 0
                  ? `${customDrillsRemaining} remaining`
                  : 'No drills left'}
              </p>
            )}
          </div>
        </div>
      </motion.button>

      {/* Purchase Gate Overlay */}
      <AnimatePresence>
        {showPurchaseGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1500] flex items-center justify-center px-4"
            onClick={() => setShowPurchaseGate(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="relative w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(100, 116, 139, 0.15)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setShowPurchaseGate(false)}
                className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-all flex items-center justify-center z-10"
              >
                <X size={14} />
              </button>

              <div className="p-6 flex flex-col items-center text-center gap-5">
                {/* Icon */}
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(34,211,238,0.12))',
                    border: '1px solid rgba(20,184,166,0.25)',
                  }}
                >
                  <Sparkles size={28} className="text-teal-400" />
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">Custom Drills Exhausted</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    You've used all your custom drills for today. Get more to continue creating AI-powered drills.
                  </p>
                </div>

                {/* Coin balance */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(251, 191, 36, 0.08)' }}>
                  <Coins size={14} className="text-amber-400" />
                  <span className="text-sm font-bold text-white">{userCoins}</span>
                  <span className="text-xs text-slate-500">coins</span>
                </div>

                {canAffordPurchase ? (
                  <>
                    {/* Purchase button */}
                    <motion.button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 50%, #0284C7 100%)',
                        boxShadow: '0 6px 24px rgba(6, 182, 212, 0.25)',
                      }}
                    >
                      {/* Shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {purchasing ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Purchasing…
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            Buy {CUSTOM_DRILLS_PER_PURCHASE} Drills · {CUSTOM_PURCHASE_COST} coins
                          </>
                        )}
                      </span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Insufficient coins */}
                    <div
                      className="w-full py-3.5 rounded-xl text-sm font-semibold text-center"
                      style={{
                        backgroundColor: 'rgba(100, 116, 139, 0.12)',
                        color: '#64748b',
                      }}
                    >
                      Need {CUSTOM_PURCHASE_COST} coins · {CUSTOM_PURCHASE_COST - userCoins} more needed
                    </div>

                    <div className="flex items-center gap-2 text-xs text-amber-400/80">
                      <Swords size={14} />
                      <span className="font-medium">Play battles to earn more coins!</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

SoloDrillCategoryCard.propTypes = {
  category: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
}

export default SoloDrillCategoryCard
