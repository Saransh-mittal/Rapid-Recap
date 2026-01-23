import React from 'react'
import { motion } from 'framer-motion'
import { Smartphone, MonitorPlay, Maximize2 } from 'lucide-react'
import { useResponsiveBreakpoints } from '../../screens/AppStartScreen'
import { useDispatch } from 'react-redux'
import { setIsMobileSimulation } from '../../redux/appSlice'

const MobileRestrictedView = () => {
  const screenInfo = useResponsiveBreakpoints()
  const dispatch = useDispatch()

  // Check if we are inside the mobile simulation iframe
  const isInsideSimulation = new URLSearchParams(window.location.search).get('mobile_sim') === 'true'

  // If it's a mobile device (width < 768px) OR we are inside the simulation, don't render anything
  if (screenInfo.isMobile || isInsideSimulation) return null

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
        </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <Smartphone className="w-16 h-16 text-blue-400 relative z-10" />
            <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1.5 border border-white/10">
                <MonitorPlay className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Mobile Experience Only
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed">
              Quick Clash v2 is currently optimized for mobile devices to ensure the best gameplay experience.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-2">
              <p className="text-blue-200 font-medium flex items-center justify-center gap-2 mb-3">
                <Maximize2 className="w-4 h-4" />
                Please switch to a phone or resize your browser.
              </p>

              <button
                onClick={() => dispatch(setIsMobileSimulation(true))}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Launch Mobile View
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-sm mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Working on Desktop Version...</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MobileRestrictedView
