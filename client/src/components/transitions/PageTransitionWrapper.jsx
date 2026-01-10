// components/transitions/PageTransitionWrapper.jsx - Smooth page transitions between screens
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const pageTransitionVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
  },
  enter: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for premium feel
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(2px)',
    transition: {
      duration: 0.3,
      ease: [0.55, 0.055, 0.675, 0.19],
    },
  },
}

const PageTransitionWrapper = ({ children }) => {
  const location = useLocation()



  // Skip transitions for quickclash routes to avoid blank screen issues
  const isQuickClashRoute = location.pathname.startsWith('/quickclash') || location.pathname.startsWith('/play')

  if (isQuickClashRoute) {
    // No animation for quickclash routes
    return (
      <div className="w-full h-full">
        {children}
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageTransitionVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransitionWrapper
