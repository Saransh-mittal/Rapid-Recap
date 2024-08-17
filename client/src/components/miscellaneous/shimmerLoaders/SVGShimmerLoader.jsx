import React from 'react'

const SVGShimmerLoader = ({
  svgPath,
  width = 24,
  height = 24,
  viewBox = '0 0 24 24',
  duration = 1.5,
}) => {
  const uniqueId = React.useId()
  const gradientId = `shimmer-gradient-${uniqueId}`
  const maskId = `shimmer-mask-${uniqueId}`

  return (
    <svg width={width} height={height} viewBox={viewBox}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f3f3f3">
            <animate
              attributeName="offset"
              values="-2; 1"
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#ecebeb">
            <animate
              attributeName="offset"
              values="-1.5; 1.5"
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#f3f3f3">
            <animate
              attributeName="offset"
              values="-1; 2"
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        <mask id={maskId}>
          <path d={svgPath} fill="grey" />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={`url(#${gradientId})`}
        mask={`url(#${maskId})`}
      />
    </svg>
  )
}

export default SVGShimmerLoader
