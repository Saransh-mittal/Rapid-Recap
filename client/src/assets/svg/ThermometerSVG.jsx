import React from 'react'
import { Box } from '@chakra-ui/react'

const ThermometerSVG = React.memo(
  ({ rqm, colors, uniqueId, fillPercentage }) => (
    <Box
      as="svg"
      viewBox="0 0 60 140"
      w={{ base: '3', md: '6' }}
      h={{ base: '8', md: '12' }}
      sx={{
        filter: `drop-shadow(0 0 6px ${colors.glow})`,
      }}
    >
      <defs>
        <linearGradient
          id={`tubeGradient-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#2f3542" stopOpacity={0.9} />
          <stop offset="50%" stopColor="#535c6e" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#2f3542" stopOpacity={0.9} />
        </linearGradient>
        <linearGradient
          id={`liquidGradient-${uniqueId}`}
          x1="0%"
          y1="100%"
          x2="0%"
          y2="0%"
        >
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="50%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>
        <filter id={`glow-${uniqueId}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main thermometer body */}
      <path
        d="M35 20 C35 25, 25 25, 25 20 L25 100 C25 95, 35 95, 35 100 Z"
        fill={`url(#tubeGradient-${uniqueId})`}
        stroke="#1e2533"
        strokeWidth="1"
      />

      {/* Liquid bulb base */}
      <circle
        cx="30"
        cy="100"
        r="12"
        fill={`url(#tubeGradient-${uniqueId})`}
        stroke="#1e2533"
        strokeWidth="1"
      />

      {/* Fill level */}
      <path
        d={`
        M 26 ${100 - fillPercentage * 0.8}
        L 34 ${100 - fillPercentage * 0.8}
        L 34 100
        L 26 100
        Z
      `}
        fill={`url(#liquidGradient-${uniqueId})`}
        filter={`url(#glow-${uniqueId})`}
      />
      <circle
        cx="30"
        cy="100"
        r="8"
        fill={`url(#liquidGradient-${uniqueId})`}
        filter={`url(#glow-${uniqueId})`}
      />

      {/* Measurement lines */}
      {[0, 40, 80].map(mark => (
        <g key={mark} display={{ base: 'none', md: 'block' }}>
          <line
            x1="35"
            y1={100 - (mark / 80) * 80}
            x2="38"
            y2={100 - (mark / 80) * 80}
            stroke="#8492a6"
            strokeWidth="1"
          />
          <text
            x="41"
            y={100 - (mark / 80) * 80 + 4}
            fill="#8492a6"
            fontSize="6"
          >
            {mark}
          </text>
        </g>
      ))}
    </Box>
  ),
)

ThermometerSVG.displayName = 'ThermometerSVG'

export default ThermometerSVG
