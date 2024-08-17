import React from 'react'

const ImageShimmerLoader = ({ imageUrl, width = 200, height = 200 }) => {
  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute"
      >
        <defs>
          <linearGradient id="shimmer" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f3f3f3">
              <animate
                attributeName="offset"
                values="-2; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#ecebeb">
              <animate
                attributeName="offset"
                values="-1.5; 1.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#f3f3f3">
              <animate
                attributeName="offset"
                values="-1; 2"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          <mask id="image-mask">
            <image
              href={imageUrl}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid slice"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="url(#shimmer)"
          mask="url(#image-mask)"
        />
      </svg>
    </div>
  )
}

export default ImageShimmerLoader
