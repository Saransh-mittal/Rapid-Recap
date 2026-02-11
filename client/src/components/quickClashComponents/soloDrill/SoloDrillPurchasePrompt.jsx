import { Coins, Plus } from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'
import { notificationManager } from '../../../utils/notifications'

const SoloDrillPurchasePrompt = () => {
  const {
    userCoins,
    purchaseDrills,
    purchasing
  } = useSoloDrill()

  const handlePurchase = async () => {
    try {
      const result = await purchaseDrills()
      if (result.payload?.success) {
        notificationManager.success(
          'Drills Purchased!',
          'Added 5 extra drills to your account.'
        )
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
    <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)' }}>
      <p className="text-sm font-semibold text-amber-300">Daily free drills exhausted</p>
      <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
        You&apos;ve used all 5 free attempts for today. Add 5 more drills to continue practicing.
      </p>

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Balance:</span>
          <Coins size={14} color="#FBBF24" />
          <span className="font-bold text-sm text-white">{userCoins}</span>
        </div>

        <button
          onClick={handlePurchase}
          disabled={userCoins < 50 || purchasing}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
            ${userCoins < 50
              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              : 'bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-[0_4px_16px_rgba(251,191,36,0.2)]'}
          `}
        >
          {purchasing ? (
            <span className="animate-spin h-4 w-4 border-2 border-yellow-800 border-t-transparent rounded-full" />
          ) : (
            <Plus size={14} />
          )}
          Buy 5 (50 coins)
        </button>
      </div>

      {userCoins < 50 && (
        <p className="mt-2 text-[11px] text-slate-500 italic">
          Insufficient coins. Play regular matches to earn more!
        </p>
      )}
    </div>
  )
}

export default SoloDrillPurchasePrompt
