import React, { useMemo, useCallback } from 'react'
import { Box, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

// Optimize performance by preventing style object recreation
const BASE_DIMENSION = Object.freeze({
  base: 80,
  md: 100,
})

const BASE_STYLES = Object.freeze({
  container: {
    p: '6 2',
    w: 'full',
    rounded: 'xl',
  },
  title: {
    color: 'gray.400',
    fontSize: 'lg',
    mb: 4,
    textAlign: 'center',
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    w: 'full',
    h: '4/5',
  },
  imageContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: '1',
    minHeight: `${BASE_DIMENSION.base}px`,
  },
  imageWrapper: {
    width: `${BASE_DIMENSION.base}px`,
    height: `${BASE_DIMENSION.base}px`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    rounded: 'full',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    objectFit: 'contain',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  societyName: {
    mt: 2,
    fontWeight: 'bold',
    fontSize: 'lg',
    textAlign: 'center',
  },
  arrowContainer: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 8,
  },
})

// Create and append style element only once during module initialization
const styleSheet = new CSSStyleSheet()
styleSheet.replaceSync(`
  @keyframes moveArrow {
    0% { transform: translateX(0); }
    50% { transform: translateX(10px); }
    100% { transform: translateX(0); }
  }
  .rotating-arrow {
    animation: moveArrow 2s ease-in-out infinite;
    will-change: transform;
  }

  @keyframes rotateCircle {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .rotating-circle {
    transform-origin: center;
    animation: rotateCircle 2s linear infinite;
    will-change: transform;
  }
`)
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet]

const Crown = React.memo(function Crown() {
  return (
    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-6 h-6">
      <svg viewBox="0 0 24 24">
        <path
          d="M2.5 6.5L6 12L11 4L16 12L19.5 6.5L21 17H3L2.5 6.5Z"
          fill="gold"
          stroke="gold"
        />
      </svg>
    </div>
  )
})

const Arrow = React.memo(function Arrow({ color }) {
  return (
    <svg width="60" height="30" viewBox="0 0 60 30" className="rotating-arrow">
      <path
        d="M0 15H45M40 7L52 15L40 23"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
})

const Circle = React.memo(function Circle({
  textColor,
  isTitans,
  iqLower,
  iqUpper,
  iqRangeText,
  dimension,
}) {
  const gradientId = useMemo(
    () => `circle-gradient-${textColor.replace('#', '')}`,
    [textColor],
  )

  const circleBackground = useMemo(
    () => (isTitans ? 'rgba(25, 25, 35, 0.9)' : 'rgba(25, 25, 35, 0.7)'),
    [isTitans],
  )

  const textFill = useMemo(
    () => (isTitans ? 'gold' : textColor),
    [isTitans, textColor],
  )

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 120 120"
      className="cursor-pointer"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={textColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={textColor} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      <g className="rotating-circle">
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
        />
      </g>

      <circle cx="60" cy="60" r="50" fill={circleBackground} />

      <text
        x="60"
        y="50"
        textAnchor="middle"
        fill={textFill}
        fontSize="16"
        fontWeight="bold"
      >
        {iqRangeText}
      </text>
      <text
        x="60"
        y="80"
        textAnchor="middle"
        fill={isTitans ? 'gold' : '#9CAFAA'}
        fontSize="18"
        fontWeight="bold"
      >
        {iqLower}
        {iqUpper ? ` - ${iqUpper}` : '+'}
      </text>
    </svg>
  )
})

function EnhancedSocietyCircle({
  societyData,
  handleBrainClick,
  handleCircleClick,
}) {
  const { t } = useTranslation('CircleAndSocietyData')
  const { t: translate } = useTranslation('EnhancedSocietyCircle')

  if (!societyData) return null

  const {
    society = '',
    textColor = '#FFFFFF',
    image = '',
    circle,
    IQ_Lower,
    IQ_Upper,
  } = societyData

  const isTitans = society.toLowerCase().includes('titans')

  const containerStyle = useMemo(
    () => ({
      ...BASE_STYLES.container,
      background: isTitans ? 'rgba(25, 25, 35, 0.9)' : 'rgba(25, 25, 35, 0.7)',
      border: isTitans ? '1px solid rgba(255, 215, 0, 0.3)' : 'none',
    }),
    [isTitans],
  )

  const imageWrapperStyle = useMemo(
    () => ({
      ...BASE_STYLES.imageWrapper,
      border: isTitans ? '2px solid gold' : 'none',
      borderRadius: '50%',
    }),
    [isTitans],
  )

  const societyNameStyle = useMemo(
    () => ({
      ...BASE_STYLES.societyName,
      color: isTitans ? 'gold' : textColor,
      textShadow: isTitans ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none',
    }),
    [isTitans, textColor],
  )

  const onBrainClick = useCallback(
    e => {
      if (handleBrainClick) {
        e.stopPropagation()
        handleBrainClick()
      }
    },
    [handleBrainClick],
  )

  const onCircleClick = useCallback(
    e => {
      if (handleCircleClick) {
        e.stopPropagation()
        handleCircleClick()
      }
    },
    [handleCircleClick],
  )

  return (
    <Box {...containerStyle}>
      <Text {...BASE_STYLES.title}>{translate('societyAndCircle')}</Text>

      <Box {...BASE_STYLES.flexContainer}>
        <Box
          {...BASE_STYLES.imageContainer}
          onClick={onBrainClick}
          role="button"
          tabIndex={0}
        >
          {isTitans && <Crown />}
          <div {...imageWrapperStyle}>
            <Image
              src={image}
              alt={society}
              {...BASE_STYLES.image}
              loading="lazy"
              decoding="async"
            />
          </div>
          <Text {...societyNameStyle}>{t(society)}</Text>
        </Box>

        {circle && (
          <>
            <Box {...BASE_STYLES.arrowContainer}>
              <Arrow color={isTitans ? 'gold' : '#9CAFAA'} />
            </Box>

            <Box
              {...BASE_STYLES.imageContainer}
              onClick={onCircleClick}
              role="button"
              tabIndex={0}
            >
              <Circle
                textColor={textColor}
                isTitans={isTitans}
                iqLower={IQ_Lower}
                iqUpper={IQ_Upper}
                iqRangeText={translate('iqRange')}
                dimension={BASE_DIMENSION.base}
              />
              <Text {...societyNameStyle}>{t(circle)}</Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

export default React.memo(EnhancedSocietyCircle)
