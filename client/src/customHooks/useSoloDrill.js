import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchLimits,
  purchaseExtraDrills,
  startDrill,
  submitForge,
  advanceForgeSection,
  submitQuiz,
  fetchCategories,
  fetchStats,
  fetchHistory,
  openModal,
  closeModal,
  selectCategory,
  updateLoadout,
  resetFlow,
  fetchDrillSession,
  markPowerupUsed,
  setQuizResult,
  setPhaseHistory
} from '../redux/soloDrillSlice'

const useSoloDrill = () => {
  const dispatch = useDispatch()
  const state = useSelector((s) => s.soloDrill)
  // Get coins from quickClashSlice which is properly updated by fetchUserTrophies
  const quickClashCoins = useSelector((s) => s.quickClash?.userCoins || 0)

  // Memoized derived state
  const derivedState = useMemo(() => {
    const totalRemaining = state.dailyDrillsRemaining + state.purchasedDrillsRemaining
    const canStartDrill = totalRemaining > 0
    const canPurchase = quickClashCoins >= 50
    const isDrillExhausted = totalRemaining === 0

    return {
      totalRemaining,
      canStartDrill,
      canPurchase,
      isDrillExhausted,
      userCoins: quickClashCoins
    }
  }, [state.dailyDrillsRemaining, state.purchasedDrillsRemaining, quickClashCoins])

  return {
    // State
    ...state,
    ...derivedState,
    initialForgeQuestion: state.initialForgeQuestion,

    // Actions - wrapped for convenience
    fetchLimits: () => dispatch(fetchLimits()),
    fetchCategories: () => dispatch(fetchCategories()),
    fetchStats: () => dispatch(fetchStats()),
    fetchHistory: (page = 1) => dispatch(fetchHistory({ page })),

    openDrillModal: () => dispatch(openModal()),
    closeDrillModal: () => dispatch(closeModal()),

    setSelectedCategory: (category) => dispatch(selectCategory(category)),
    setLoadout: (loadout) => dispatch(updateLoadout(loadout)),

    goToHistory: () => dispatch(setPhaseHistory()),

    purchaseDrills: () => dispatch(purchaseExtraDrills()),

    startSession: async (category, loadout) => {
       const result = await dispatch(startDrill({ category, loadout }))
       return result.payload
    },

    submitForgeAnswer: (data) => dispatch(submitForge(data)), // { sessionId, sectionNumber, answerIndex, timeSpent }
    advanceForge: (sessionId) => dispatch(advanceForgeSection(sessionId)),
    submitQuiz: (sessionId, responses) => dispatch(submitQuiz({ sessionId, responses })),
    setQuizResult: (result) => dispatch(setQuizResult(result)),

    resetDrill: () => dispatch(resetFlow()),
    resumeSession: (sessionId) => dispatch(fetchDrillSession(sessionId)),
    markPowerupUsed: (powerupId) => dispatch(markPowerupUsed(powerupId))
  }
}

export default useSoloDrill
