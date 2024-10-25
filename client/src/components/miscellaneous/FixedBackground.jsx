import React, {
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react'
import { motion, useAnimation } from 'framer-motion'

const BackgroundContext = createContext({
  isMainBackground: false,
  setMainBackground: () => {},
  pauseMainAnimation: () => {},
  resumeMainAnimation: () => {},
})

const Star = React.memo(
  ({ size, top, left, controls, reduced }) => {
    const style = {
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'white',
      position: 'absolute',
      top: `${top}%`,
      left: `${left}%`,
      willChange: 'transform, opacity',
      animation: reduced ? 'pulse 2s infinite' : undefined,
    }

    if (reduced) {
      return <div style={style} />
    }

    return (
      <motion.div
        style={style}
        animate={controls}
        initial={{ opacity: 0.7, scale: 1 }}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.size === nextProps.size &&
      prevProps.top === nextProps.top &&
      prevProps.left === nextProps.left &&
      prevProps.reduced === nextProps.reduced
    )
  },
)

const styles = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 0.7; }
  }
`

const FixedBackground = ({
  starCount = 25,
  reduced = false,
  forceRender = false,
  isModal = false,
}) => {
  const {
    isMainBackground,
    setMainBackground,
    pauseMainAnimation,
    resumeMainAnimation,
  } = useContext(BackgroundContext)

  // Don't render if another background exists and this isn't forced
  if (isMainBackground && !forceRender) {
    return null
  }

  const starsRef = useRef(
    Array(reduced ? Math.min(10, starCount) : starCount)
      .fill()
      .map(() => ({
        size: Math.random() * 3 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        controls: reduced ? null : useAnimation(),
      })),
  )

  const animateStars = useCallback(() => {
    if (reduced) return

    starsRef.current.forEach(star => {
      star.controls?.start({
        y: [`${Math.random() * 10}px`, `${-Math.random() * 10}px`],
        x: [`${Math.random() * 10}px`, `${-Math.random() * 10}px`],
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: Math.random() * 2 + 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        },
      })
    })
  }, [reduced])

  useEffect(() => {
    if (isModal) {
      pauseMainAnimation()
      return () => resumeMainAnimation()
    }
  }, [isModal, pauseMainAnimation, resumeMainAnimation])

  useEffect(() => {
    if (!reduced) {
      animateStars()
      setMainBackground(true)

      return () => {
        starsRef.current.forEach(star => {
          star.controls?.stop()
        })
        setMainBackground(false)
      }
    }
  }, [animateStars, reduced, setMainBackground])

  return (
    <>
      {reduced && <style>{styles}</style>}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, #44337A, #000000)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          zIndex: 0,
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: 1000,
          opacity: 1,
        }}
      >
        {starsRef.current.map((star, index) => (
          <Star
            key={index}
            size={star.size}
            top={star.top}
            left={star.left}
            controls={star.controls}
            reduced={reduced}
          />
        ))}
      </div>
    </>
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
