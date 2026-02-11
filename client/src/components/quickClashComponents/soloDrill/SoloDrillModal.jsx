import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, ChevronRight, History } from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'
import SoloDrillCategoryCard from './SoloDrillCategoryCard'
import SoloDrillPurchasePrompt from './SoloDrillPurchasePrompt'
import SoloDrillLoadoutSelector from './SoloDrillLoadoutSelector'
import SoloDrillSession from './SoloDrillSession'
import SoloDrillResults from './SoloDrillResults'
import SoloDrillHistory from './SoloDrillHistory'
import FixedBackground from '../../miscellaneous/FixedBackground'

const SoloDrillModal = () => {
  const {
    modalOpen,
    closeDrillModal,
    phase,
    fetchCategories,
    fetchStats,
    availableCategories,
    fetchLimits,
    totalRemaining,
    dailyDrillsRemaining,
    dailyUsed,
    purchasedDrillsRemaining,
    nextReset,
    goToHistory,
    stats
  } = useSoloDrill()

  useEffect(() => {
    if (modalOpen) {
      fetchCategories()
      fetchLimits()
      fetchStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen])

  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!nextReset) return
    const timer = setInterval(() => {
      const now = new Date()
      const end = new Date(nextReset)
      const diff = end - now
      if (diff <= 0) { setTimeLeft('Resetting soon...'); return }
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${h}h ${m}m`)
    }, 60000)
    setLocalTimeLeft()
    function setLocalTimeLeft() {
      const now = new Date()
      const end = new Date(nextReset)
      const diff = end - now
      if (diff <= 0) { setTimeLeft('Resetting soon...') }
      else {
        const h = Math.floor(diff / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`${h}h ${m}m`)
      }
    }
    return () => clearInterval(timer)
  }, [nextReset])

  const renderContent = () => {
    switch (phase) {
      case 'loadout':
        return <SoloDrillLoadoutSelector />
      case 'forge':
      case 'quiz':
        return <SoloDrillSession onClose={closeDrillModal} />
      case 'results':
        return <SoloDrillResults />
      case 'history':
        return <SoloDrillHistory />
      case 'category_select':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto w-full max-w-4xl flex flex-col gap-6"
          >
            {/* ── Drills Status: inline, not a card ── */}
            <div className="space-y-3">
              {/* Drills used + reset timer on one line */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tabular-nums">{totalRemaining}</span>
                  <span className="text-sm text-slate-400 font-medium">drills remaining</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Clock size={12} />
                  <span>{timeLeft || '...'}</span>
                </div>
              </div>

              {/* Segmented progress bar — each segment = 1 drill capacity */}
              {(() => {
                const dailyMax = 5
                const used = dailyUsed || 0
                const purchased = purchasedDrillsRemaining || 0
                const totalCapacity = dailyMax + purchased
                // How many drills have been used out of total capacity
                const totalUsed = used + (purchased > 0 ? Math.max(0, used - (dailyMax - dailyDrillsRemaining)) : 0)

                return (
                  <div className="flex gap-1">
                    {/* Daily free segments */}
                    {Array.from({ length: dailyMax }).map((_, i) => {
                      const isUsed = i < used
                      return (
                        <div
                          key={`d-${i}`}
                          className="h-1.5 flex-1 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: isUsed
                              ? '#22d3ee'
                              : 'rgba(51, 65, 85, 0.5)',
                            boxShadow: isUsed
                              ? '0 0 8px rgba(34, 211, 238, 0.3)'
                              : 'none'
                          }}
                        />
                      )
                    })}
                    {/* Purchased segments (visually distinct) */}
                    {purchased > 0 && Array.from({ length: purchased }).map((_, i) => {
                      const purchasedUsedCount = Math.max(0, used - dailyMax + dailyDrillsRemaining)
                      const isUsed = i < purchasedUsedCount
                      return (
                        <div
                          key={`p-${i}`}
                          className="h-1.5 flex-1 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: isUsed
                              ? '#14b8a6'
                              : 'rgba(20, 184, 166, 0.15)',
                            boxShadow: isUsed
                              ? '0 0 8px rgba(20, 184, 166, 0.3)'
                              : 'none',
                            border: isUsed ? 'none' : '1px solid rgba(20, 184, 166, 0.2)'
                          }}
                        />
                      )
                    })}
                  </div>
                )
              })()}

              {/* Extra info — subtle */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {dailyDrillsRemaining > 0 && (
                  <span>{dailyDrillsRemaining} free remaining</span>
                )}
                {purchasedDrillsRemaining > 0 && (
                  <span className="text-teal-400/60">+{purchasedDrillsRemaining} purchased</span>
                )}
                {totalRemaining === 0 && (
                  <span>No drills remaining</span>
                )}
              </div>
            </div>

            {totalRemaining === 0 && (
              <SoloDrillPurchasePrompt />
            )}

            {/* ── Category Selection ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500">Choose Category</p>
                {stats?.totalDrills > 0 && (
                  <button
                    onClick={goToHistory}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-[1.04] active:scale-95"
                    style={{
                      backgroundColor: 'rgba(34, 211, 238, 0.12)',
                      color: '#22d3ee',
                      boxShadow: '0 0 12px rgba(34, 211, 238, 0.08)',
                    }}
                  >
                    <History size={13} strokeWidth={2.5} />
                    <span>History</span>
                    <span
                      className="ml-0.5 h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(34, 211, 238, 0.2)', color: '#67e8f9' }}
                    >
                      {stats.totalDrills}
                    </span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableCategories.map((cat, idx) => (
                  <SoloDrillCategoryCard
                    key={idx}
                    category={cat}
                    disabled={totalRemaining === 0}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )
    }
  }

  const [portalTarget, setPortalTarget] = useState(null)
  useEffect(() => { setPortalTarget(document.body) }, [])
  if (!modalOpen || !portalTarget) return null

  const isSessionPhase = phase === 'forge' || phase === 'quiz'
  const phaseTitle =
    phase === 'category_select'
      ? 'Solo Drill'
      : phase === 'loadout'
      ? 'Loadout'
      : phase === 'history'
      ? 'Drill History'
      : 'Results'

  return createPortal(
    <AnimatePresence>
      {modalOpen && (
        <div className="fixed inset-0 z-[1400] flex flex-col">
          <FixedBackground forceRender isModal />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col h-full overflow-y-auto"
          >
            {!isSessionPhase && (
              <div className="px-4 pt-5 pb-3 sm:px-6">
                <div className="mx-auto w-full max-w-4xl flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {phaseTitle}
                  </h2>
                  <button
                    onClick={closeDrillModal}
                    className="h-9 w-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            <div className={`flex-1 ${isSessionPhase ? '' : 'px-4 sm:px-6 pb-4'}`}>
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalTarget
  )
}

export default SoloDrillModal
