import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setIsMobileSimulation } from '../../redux/appSlice'

const MobileSimulatorWrapper = () => {
  const dispatch = useDispatch()

  const handleExitSimulation = () => {
    dispatch(setIsMobileSimulation(false))
  }

  // Get current URL and append simulation flag
  const getSimulationUrl = () => {
     const url = new URL(window.location.href)
     url.searchParams.set('mobile_sim', 'true')
     return url.toString()
  }

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950 flex items-center justify-center p-4">
      <div className="relative">
        {/* Device Frame */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-[390px] h-[844px] bg-black rounded-[50px] shadow-2xl border-[8px] border-slate-800 overflow-hidden ring-4 ring-slate-900/50"
          style={{
            maxHeight: '90vh',
            maxWidth: '100vw',
          }}
        >
          {/* Screen Content - Iframe */}
          <div className="w-full h-full bg-slate-900 overflow-hidden relative">
            <iframe
                src={getSimulationUrl()}
                className="w-full h-full border-none"
                title="Mobile Preview"
            />
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-white/20 rounded-full z-[1000] pointer-events-none" />
        </motion.div>

        {/* Exit Button */}
        <button
          onClick={handleExitSimulation}
          className="absolute -right-16 top-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"
          title="Exit Mobile View"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Info Text */}
        <div className="absolute -bottom-10 left-0 w-full text-center text-slate-500 text-sm">
          Simulating iPhone 14 Pro (390x844)
        </div>
      </div>
    </div>
  )
}

export default MobileSimulatorWrapper
