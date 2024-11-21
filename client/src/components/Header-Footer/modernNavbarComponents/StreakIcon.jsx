export const getStreakColor = streak => {
  const heatLevel = streak / 7
  if (heatLevel <= 0.2) {
    return 'rgba(139, 0, 0, 1)'
  } else if (heatLevel <= 0.4) {
    return 'rgba(255, 0, 0, 1)'
  } else if (heatLevel <= 0.6) {
    return 'rgba(255, 165, 0, 1)'
  } else if (heatLevel <= 0.8) {
    return 'rgba(255, 255, 0, 1)'
  } else {
    return 'rgba(0, 0, 255, 1)'
  }
}

// components/StreakIcon.js
import React, { memo } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const StreakIcon = memo(({ streak = 0, isBoosted = false, size = 21 }) => {
  return (
    <MotionBox
      as="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={streak === 0 ? '0 0 18 18' : '0 0 24 24'}
      width={`${size}px`}
      height={`${size}px`}
      display="flex"
      justifyContent="center"
      alignItems="center"
      borderRadius="50%"
      padding="2px"
      mr={isBoosted ? '6px' : '0'}
      style={{
        boxShadow: isBoosted
          ? '0 0 10px 0 rgba(0, 150, 255, 0.7), 0 4px 8px 0 rgba(0, 150, 255, 0.3), 0 8px 20px 0 rgba(0, 150, 255, 0.2)'
          : 'none',
      }}
      transform={
        streak === 0
          ? 'translateX(14%) !important'
          : 'translateX(16%) !important'
      }
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {streak > 0 ? (
        <>
          <g filter="url(#hot-filled_svg__filter0_i_289_12318)">
            <path
              fillRule="evenodd"
              d="M9.588 2.085a1 1 0 01.97.092c2.85 1.966 4.498 4.744 5.31 6.67l.854-.885a1 1 0 011.56.154c2.177 3.38 2.211 7.383.521 10.3C17.039 21.459 13.583 22 11.977 22c-1.569 0-4.905-.27-6.825-3.584-.832-1.435-1.27-3.053-1.125-4.704.146-1.66.876-3.284 2.264-4.721.86-.891 1.505-2.122 1.957-3.322.449-1.193.68-2.278.752-2.806a1 1 0 01.588-.778z"
              clipRule="evenodd"
              fill={getStreakColor(streak)}
            />
          </g>
          <defs>
            <linearGradient
              id="hot-filled_svg__paint0_linear_289_12318"
              x1="12"
              x2="12"
              y1="2"
              y2="22"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFA116" />
              <stop offset="1" stopColor="#F9772E" />
            </linearGradient>
            <filter
              id="hot-filled_svg__filter0_i_289_12318"
              width="17.2"
              height="21.2"
              x="4"
              y="2"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feColorMatrix
                in="SourceAlpha"
                result="hardAlpha"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              />
              <feOffset dx="1.2" dy="1.2" />
              <feGaussianBlur stdDeviation="0.6" />
              <feComposite
                in2="hardAlpha"
                k2="-1"
                k3="1"
                operator="arithmetic"
              />
              <feColorMatrix values="0 0 0 0 0.970833 0 0 0 0 0.05825 0 0 0 0 0 0 0 0 0.16 0" />
              <feBlend in2="shape" result="effect1_innerShadow_289_12318" />
            </filter>
          </defs>
        </>
      ) : (
        <path
          fill="white"
          fillRule="evenodd"
          d="M7.19 1.564a.75.75 0 01.729.069c2.137 1.475 3.373 3.558 3.981 5.002l.641-.663a.75.75 0 011.17.115c1.633 2.536 1.659 5.537.391 7.725-1.322 2.282-3.915 2.688-5.119 2.688-1.177 0-3.679-.203-5.12-2.688-.623-1.076-.951-2.29-.842-3.528.109-1.245.656-2.463 1.697-3.54.646-.67 1.129-1.592 1.468-2.492.337-.895.51-1.709.564-2.105a.75.75 0 01.44-.583zm.784 2.023c-.1.368-.226.773-.385 1.193-.375.997-.947 2.13-1.792 3.005-.821.851-1.205 1.754-1.282 2.63-.078.884.153 1.792.647 2.645C6.176 14.81 7.925 15 8.983 15c1.03 0 2.909-.366 3.822-1.94.839-1.449.97-3.446.11-5.315l-.785.812a.75.75 0 01-1.268-.345c-.192-.794-1.04-2.948-2.888-4.625z"
          clipRule="evenodd"
        />
      )}
    </MotionBox>
  )
})

StreakIcon.displayName = 'StreakIcon'

export default StreakIcon
