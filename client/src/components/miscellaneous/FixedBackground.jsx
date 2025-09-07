// components/miscellaneous/FixedBackground.jsx - Enhanced with Video Support
import React, {
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
  useState,
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

const VideoBackground = React.memo(
  ({
    desktopVideoSrc,
    mobileVideoSrc,
    onVideoLoad,
    className = '',
    overlays = [],
  }) => {
    const [desktopVideoLoaded, setDesktopVideoLoaded] = useState(false)
    const [mobileVideoLoaded, setMobileVideoLoaded] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const desktopVideoRef = useRef(null)
    const mobileVideoRef = useRef(null)

    // Detect screen size
    useEffect(() => {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 768) // md breakpoint
      }

      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
      return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    // Handle video load for desktop
    const handleDesktopVideoLoad = useCallback(() => {
      console.log('Desktop video loaded')
      setDesktopVideoLoaded(true)
    }, [])

    // Handle video load for mobile
    const handleMobileVideoLoad = useCallback(() => {
      console.log('Mobile video loaded')
      setMobileVideoLoaded(true)
    }, [])

    // Call onVideoLoad when the appropriate video for current screen size loads
    useEffect(() => {
      const shouldTriggerCallback = isMobile
        ? mobileVideoLoaded
        : desktopVideoLoaded

      if (shouldTriggerCallback) {
        console.log(
          `Triggering video load callback for ${
            isMobile ? 'mobile' : 'desktop'
          }`,
        )
        onVideoLoad?.()
      }
    }, [desktopVideoLoaded, mobileVideoLoaded, isMobile, onVideoLoad])

    // Handle video load errors gracefully
    const handleVideoError = useCallback(
      e => {
        console.warn('Video failed to load:', e.target.src)
        // Still call onVideoLoad to prevent infinite loading after a delay
        setTimeout(() => {
          onVideoLoad?.()
        }, 1000)
      },
      [onVideoLoad],
    )

    useEffect(() => {
      // Ensure videos start playing
      const playVideo = async videoEl => {
        if (videoEl) {
          try {
            await videoEl.play()
          } catch (error) {
            console.warn('Video autoplay failed:', error)
          }
        }
      }

      if (desktopVideoRef.current) playVideo(desktopVideoRef.current)
      if (mobileVideoRef.current) playVideo(mobileVideoRef.current)
    }, [])

    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Conditionally render ONLY the appropriate video */}
        {!isMobile && desktopVideoSrc && (
          <video
            ref={desktopVideoRef}
            className="absolute inset-0"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              objectPosition: 'center center',
              // More aggressive scaling and positioning to eliminate black borders
              transform: 'scale(1.15)',
              minWidth: '100vw',
              minHeight: '100vh',
            }}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedData={handleDesktopVideoLoad}
            onError={handleVideoError}
          >
            <source src={`${desktopVideoSrc}.webm`} type="video/webm" />
            <source src={`${desktopVideoSrc}.mp4`} type="video/mp4" />
          </video>
        )}

        {isMobile && mobileVideoSrc && (
          <video
            ref={mobileVideoRef}
            className="absolute inset-0"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              objectPosition: 'center center',
              // More aggressive scaling and positioning to eliminate black borders
              transform: 'scale(1.15)',
              minWidth: '100vw',
              minHeight: '100vh',
            }}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedData={handleMobileVideoLoad}
            onError={handleVideoError}
          >
            <source src={`${mobileVideoSrc}.webm`} type="video/webm" />
            <source src={`${mobileVideoSrc}.mp4`} type="video/mp4" />
          </video>
        )}

        {/* Overlays */}
        {overlays.map((overlay, index) => (
          <div
            key={index}
            className={`absolute inset-0 ${overlay.className || ''}`}
            style={overlay.style || {}}
          />
        ))}
      </div>
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
  starCount = 50,
  reduced = false,
  forceRender = false,
  isModal = false,
  // New video props
  useVideo = false,
  desktopVideo = null,
  mobileVideo = null,
  onVideoLoad = null,
  customOverlays = [],
  // Gradient fallback
  gradientBackground = 'linear-gradient(to bottom, #44337A, #000000)',
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
    if (reduced || useVideo) return

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
  }, [reduced, useVideo])

  useEffect(() => {
    if (isModal) {
      pauseMainAnimation()
      return () => resumeMainAnimation()
    }
  }, [isModal, pauseMainAnimation, resumeMainAnimation])

  useEffect(() => {
    if (!reduced && !useVideo) {
      animateStars()
      setMainBackground(true)

      return () => {
        starsRef.current.forEach(star => {
          star.controls?.stop()
        })
        setMainBackground(false)
      }
    } else if (useVideo) {
      setMainBackground(true)
      return () => setMainBackground(false)
    }
  }, [animateStars, reduced, setMainBackground, useVideo])

  // Default overlays for video backgrounds
  const defaultVideoOverlays = [
    {
      className: 'bg-gradient-to-b from-black/30 via-transparent to-black/60',
      style: { zIndex: 10 },
    },
    {
      className: 'bg-blue-900/20',
      style: { zIndex: 10 },
    },
  ]

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
          width: '100vw',
          height: '100vh',
          background: useVideo ? 'black' : gradientBackground,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          zIndex: 0,
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: 1000,
          opacity: 1,
          overflow: 'hidden', // Prevent any overflow
        }}
      >
        {/* Video Background */}
        {useVideo && (desktopVideo || mobileVideo) && (
          <VideoBackground
            desktopVideoSrc={desktopVideo}
            mobileVideoSrc={mobileVideo}
            onVideoLoad={onVideoLoad}
            overlays={[...defaultVideoOverlays, ...customOverlays]}
          />
        )}

        {/* Stars (only if not using video or if explicitly reduced) */}
        {(!useVideo || reduced) &&
          starsRef.current.map((star, index) => (
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

VideoBackground.displayName = 'VideoBackground'
Star.displayName = 'Star'

export default React.memo(FixedBackground)
