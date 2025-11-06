// components/miscellaneous/FixedBackground.jsx - Dot Grid Background
import React, {
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react'

const BackgroundContext = createContext({
  isMainBackground: false,
  setMainBackground: () => {},
  pauseMainAnimation: () => {},
  resumeMainAnimation: () => {},
})

const FixedBackground = ({
  forceRender = false,
  isModal = false,
  gradientBackground = 'linear-gradient(180deg, #0a2540 0%, #0c4a6e 50%, #0e7490 100%)',
}) => {
  const {
    isMainBackground,
    setMainBackground,
    pauseMainAnimation,
    resumeMainAnimation,
  } = useContext(BackgroundContext)

  if (isMainBackground && !forceRender) {
    return null
  }

  useEffect(() => {
    if (isModal) {
      pauseMainAnimation()
      return () => resumeMainAnimation()
    }
  }, [isModal, pauseMainAnimation, resumeMainAnimation])

  useEffect(() => {
    setMainBackground(true)
    return () => setMainBackground(false)
  }, [setMainBackground])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: gradientBackground,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        zIndex: 0,
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        opacity: 1,
        overflow: 'hidden',
      }}
    >
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0',
        }}
      />

      {/* Center spotlight effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 800px 600px at 50% 40%, rgba(6, 182, 212, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0, 0, 0, 0.2), transparent)',
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background:
            'linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent)',
        }}
      />
    </div>
  )
}

export const BackgroundProvider = ({ children }) => {
  const [isMainBackground, setMainBackground] = React.useState(false)
  const animationTimeoutsRef = useRef([])

  const pauseMainAnimation = useCallback(() => {
    animationTimeoutsRef.current.forEach(clearTimeout)
    animationTimeoutsRef.current = []
  }, [])

  const resumeMainAnimation = useCallback(() => {
    setMainBackground(prev => prev)
  }, [])

  return (
    <BackgroundContext.Provider
      value={{
        isMainBackground,
        setMainBackground,
        pauseMainAnimation,
        resumeMainAnimation,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  )
}

export default React.memo(FixedBackground)
